import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantOrchestratorService } from './services/tenant-orchestrator.service';
import { TenantsService } from './services/tenants.service';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantOrchestratorService],
  exports: [TenantsService, TenantOrchestratorService],
})
export class TenantsModule {}
