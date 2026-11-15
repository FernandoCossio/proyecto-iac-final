import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CloudProvider = 'AWS' | 'Azure';
export type IaCEngine = 'Terraform' | 'OpenTofu' | 'Pulumi' | 'CloudFormation';
export type TenantPlan = 'Basico' | 'Estandar' | 'Avanzado';
export type TenantEnvironment = 'development' | 'production' | 'staging';
export type TenantStatus =
  | 'PENDING'
  | 'PROVISIONING_IAC'
  | 'PROVISIONING_ANSIBLE'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'FAILED';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 150 })
  contactEmail: string;

  @Column({ type: 'varchar', length: 20, default: 'AWS' })
  cloudProvider: CloudProvider;

  @Column({ type: 'varchar', length: 30, default: 'Terraform' })
  iacEngine: IaCEngine;

  @Column({ type: 'varchar', length: 20, default: 'Estandar' })
  plan: TenantPlan;

  @Column({ type: 'varchar', length: 30, default: 'development' })
  environment: TenantEnvironment;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status: TenantStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'varchar', length: 255, default: 'Registrado en la plataforma' })
  currentStep: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frontendUrl: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  logs: string[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
