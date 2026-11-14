import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  CloudProvider,
  IaCEngine,
  TenantEnvironment,
  TenantPlan,
} from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre oficial de la institución educativa',
    example: 'Instituto San Marcos',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Identificador único (slug) en minúsculas y sin espacios',
    example: 'san-marcos',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo debe contener letras minúsculas, números y guiones',
  })
  slug: string;

  @ApiProperty({
    description: 'Correo electrónico del administrador del tenant',
    example: 'admin@sanmarcos.edu',
  })
  @IsEmail({}, { message: 'El correo de contacto debe ser un email válido' })
  contactEmail: string;

  @ApiProperty({
    description: 'Proveedor de nube destino',
    enum: ['AWS', 'Azure'],
    default: 'AWS',
  })
  @IsIn(['AWS', 'Azure'], {
    message: 'El proveedor de nube debe ser AWS o Azure',
  })
  cloudProvider: CloudProvider;

  @ApiProperty({
    description: 'Motor de Infraestructura como Código (IaC)',
    enum: ['Terraform', 'OpenTofu', 'Pulumi', 'CloudFormation'],
    default: 'Terraform',
  })
  @IsIn(['Terraform', 'OpenTofu', 'Pulumi', 'CloudFormation'], {
    message: 'El motor de IaC debe ser Terraform, OpenTofu, Pulumi o CloudFormation',
  })
  iacEngine: IaCEngine;

  @ApiProperty({
    description: 'Plan contratado según catálogo de sizing',
    enum: ['Basico', 'Estandar', 'Avanzado'],
    default: 'Estandar',
  })
  @IsIn(['Basico', 'Estandar', 'Avanzado'], {
    message: 'El plan debe ser Basico, Estandar o Avanzado',
  })
  plan: TenantPlan;

  @ApiProperty({
    description: 'Entorno de despliegue',
    enum: ['development', 'production', 'staging'],
    default: 'development',
  })
  @IsIn(['development', 'production', 'staging'], {
    message: 'El entorno debe ser development, production o staging',
  })
  environment: TenantEnvironment;

  @ApiProperty({
    description: 'Contraseña opcional para el administrador del tenant',
    required: false,
    example: 'AdminPass2026!',
  })
  @IsOptional()
  @IsString()
  adminPassword?: string;
}
