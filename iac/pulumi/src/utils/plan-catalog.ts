export interface PlanHardwareConfig {
  frontendType: string;
  backendType: string;
  databaseType: string;
  diskSizeGB: number;
}

export const AWS_PLAN_CATALOG: Record<string, PlanHardwareConfig> = {
  basico: {
    frontendType: "t3.micro",
    backendType: "t3.micro",
    databaseType: "t3.micro",
    diskSizeGB: 10,
  },
  estandar: {
    frontendType: "t3.micro",
    backendType: "t3.micro",
    databaseType: "t3.small",
    diskSizeGB: 20,
  },
  avanzado: {
    frontendType: "t3.small",
    backendType: "t3.small",
    databaseType: "t3.medium",
    diskSizeGB: 30,
  },
};

export const AZURE_PLAN_CATALOG: Record<string, PlanHardwareConfig> = {
  basico: {
    frontendType: "Standard_B2ls_v2",
    backendType: "Standard_B2ls_v2",
    databaseType: "Standard_B2s_v2",
    diskSizeGB: 30,
  },
  estandar: {
    frontendType: "Standard_B2s_v2",
    backendType: "Standard_B2s_v2",
    databaseType: "Standard_B2s_v2",
    diskSizeGB: 30,
  },
  avanzado: {
    frontendType: "Standard_B2s_v2",
    backendType: "Standard_B4s_v2",
    databaseType: "Standard_B4s_v2",
    diskSizeGB: 50,
  },
};
