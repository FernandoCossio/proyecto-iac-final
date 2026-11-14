import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './services/tenants.service';

@ApiTags('Tenants')
@Public()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear y desplegar un nuevo tenant',
    description:
      'Registra un nuevo tenant y dispara la orquestación en segundo plano (IaC -> Ansible -> Healthcheck).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant registrado y proceso de aprovisionamiento iniciado.',
    type: Tenant,
  })
  create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los tenants con filtros',
    description: 'Permite filtrar tenants por búsqueda de nombre/slug, estado, plan y entorno.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'plan', required: false, type: String })
  @ApiQuery({ name: 'environment', required: false, type: String })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('environment') environment?: string,
  ): Promise<Tenant[]> {
    return this.tenantsService.findAll({ search, status, plan, environment });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle completo de un tenant',
  })
  findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.findOne(id);
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Consultar estado operativo y logs en tiempo real para polling',
    description:
      'Endpoint liviano que devuelve status, progress (0-100), currentStep y los logs estructurados.',
  })
  getStatus(@Param('id') id: string) {
    return this.tenantsService.getStatus(id);
  }

  @Patch(':id/suspend')
  @ApiOperation({
    summary: 'Suspender tenant (RF-16, RF-17)',
    description: 'Detiene el cómputo del tenant para ahorro de costos, preservando la información.',
  })
  suspend(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.suspend(id);
  }

  @Patch(':id/resume')
  @ApiOperation({
    summary: 'Reanudar tenant',
    description: 'Reactiva los recursos y el estado operativo del tenant.',
  })
  resume(@Param('id') id: string): Promise<Tenant> {
    return this.tenantsService.resume(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar tenant y destruir infraestructura (RF-18)',
    description:
      'Destruye los recursos asociados al tenant en la nube y reporta la lista de recursos destruidos.',
  })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
