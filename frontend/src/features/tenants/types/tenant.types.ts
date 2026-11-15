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

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  cloudProvider: CloudProvider;
  iacEngine: IaCEngine;
  plan: TenantPlan;
  environment: TenantEnvironment;
  status: TenantStatus;
  progress: number;
  currentStep: string;
  frontendUrl: string | null;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  contactEmail: string;
  cloudProvider: CloudProvider;
  iacEngine: IaCEngine;
  plan: TenantPlan;
  environment: TenantEnvironment;
  adminPassword?: string;
}

export interface TenantStatusResponse {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  progress: number;
  currentStep: string;
  frontendUrl: string | null;
  logs: string[];
  updatedAt: string;
}

export interface DestroyTenantResponse {
  message: string;
  destroyedResources: string[];
}
