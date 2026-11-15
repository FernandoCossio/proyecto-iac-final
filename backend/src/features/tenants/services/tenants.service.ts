import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { Tenant } from '../entities/tenant.entity';
import { TenantOrchestratorService } from './tenant-orchestrator.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly orchestratorService: TenantOrchestratorService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });
    if (existing) {
      throw new BadRequestException(
        `El identificador (slug) '${createTenantDto.slug}' ya se encuentra registrado`,
      );
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: 'PENDING',
      progress: 0,
      currentStep: 'Iniciando pipeline de despliegue...',
      logs: [
        `[${new Date().toISOString().substring(11, 19)}] Solicitud de creación de tenant recibida para ${createTenantDto.name} (${createTenantDto.plan} / ${createTenantDto.iacEngine})`,
      ],
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Disparar orquestación en segundo plano de manera no bloqueante
    this.orchestratorService.startProvisioning(savedTenant.id);

    return savedTenant;
  }

  async findAll(filters?: {
    search?: string;
    status?: string;
    plan?: string;
    environment?: string;
  }): Promise<Tenant[]> {
    const qb = this.tenantRepository.createQueryBuilder('tenant');

    if (filters?.search) {
      qb.andWhere(
        '(LOWER(tenant.name) LIKE :search OR LOWER(tenant.slug) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }

    if (filters?.status) {
      qb.andWhere('tenant.status = :status', { status: filters.status });
    }

    if (filters?.plan) {
      qb.andWhere('tenant.plan = :plan', { plan: filters.plan });
    }

    if (filters?.environment) {
      qb.andWhere('tenant.environment = :environment', {
        environment: filters.environment,
      });
    }

    qb.orderBy('tenant.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con id '${id}' no encontrado`);
    }
    return tenant;
  }

  async getStatus(id: string) {
    const tenant = await this.findOne(id);
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      progress: tenant.progress,
      currentStep: tenant.currentStep,
      frontendUrl: tenant.frontendUrl,
      logs: tenant.logs || [],
      updatedAt: tenant.updatedAt,
    };
  }

  async suspend(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.orchestratorService.suspendTenant(id);
  }

  async resume(id: string): Promise<Tenant> {
    await this.findOne(id);
    return this.orchestratorService.resumeTenant(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.orchestratorService.destroyTenant(id);
  }
}
