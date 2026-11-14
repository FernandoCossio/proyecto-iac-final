import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("tenant");

export interface TenantConfig {
  id: string;
  cloud: "aws" | "azure";
  plan: "basico" | "estandar" | "avanzado";
  environment: "dev" | "staging" | "prod";
  region: string;
  adminSshIp: string;
  sshKeyName?: string;
  sshPublicKey?: string;
  sshPrivateKeyPath: string;
  vpcCidr: string;
  publicSubnetCidr: string;
  privateBackendSubnetCidr: string;
  isolatedDbSubnetCidr: string;
  frontendImageId?: string;
  backendImageId?: string;
  databaseImageId?: string;
}

export function loadTenantConfig(): TenantConfig {
  const id = config.require("id");
  const cloud = (config.get("cloud") || "aws") as "aws" | "azure";
  const plan = (config.get("plan") || "basico") as "basico" | "estandar" | "avanzado";
  const environment = (config.get("environment") || "prod") as "dev" | "staging" | "prod";
  const region = config.get("region") || (cloud === "aws" ? "us-east-2" : "eastus");
  const adminSshIp = config.get("adminSshIp") || "0.0.0.0/0";
  const sshKeyName = config.get("sshKeyName");
  const sshPublicKey = config.get("sshPublicKey");
  const sshPrivateKeyPath = config.get("sshPrivateKeyPath") || "~/.ssh/iac-asistencia.pem";
  const vpcCidr = config.get("vpcCidr") || (cloud === "aws" ? "10.0.0.0/16" : "10.20.0.0/16");
  const publicSubnetCidr = config.get("publicSubnetCidr") || (cloud === "aws" ? "10.0.1.0/24" : "10.20.1.0/24");
  const privateBackendSubnetCidr = config.get("privateBackendSubnetCidr") || (cloud === "aws" ? "10.0.2.0/24" : "10.20.2.0/24");
  const isolatedDbSubnetCidr = config.get("isolatedDbSubnetCidr") || (cloud === "aws" ? "10.0.3.0/24" : "10.20.3.0/24");
  const frontendImageId = config.get("frontendImageId");
  const backendImageId = config.get("backendImageId");
  const databaseImageId = config.get("databaseImageId");

  return {
    id,
    cloud,
    plan,
    environment,
    region,
    adminSshIp,
    sshKeyName,
    sshPublicKey,
    sshPrivateKeyPath,
    vpcCidr,
    publicSubnetCidr,
    privateBackendSubnetCidr,
    isolatedDbSubnetCidr,
    frontendImageId,
    backendImageId,
    databaseImageId,
  };
}
