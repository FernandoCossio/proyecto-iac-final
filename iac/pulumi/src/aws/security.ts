import * as aws from "@pulumi/aws";
import { TenantConfig } from "../config";

export interface AwsSecurityResult {
  frontendSg: aws.ec2.SecurityGroup;
  backendSg: aws.ec2.SecurityGroup;
  databaseSg: aws.ec2.SecurityGroup;
}

export function createAwsSecurity(config: TenantConfig, vpcId: aws.ec2.Vpc["id"]): AwsSecurityResult {
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  const frontendSg = new aws.ec2.SecurityGroup(`${config.id}-sg-frontend`, {
    vpcId: vpcId,
    description: "Frontend SG: HTTP/HTTPS publico y SSH desde AdminSshIp",
    ingress: [
      { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"], description: "HTTP publico" },
      { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"], description: "HTTPS publico" },
      { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: [config.adminSshIp], description: "SSH de administracion" },
    ],
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "Salida libre" },
    ],
    tags: {
      ...commonTags,
      Name: `${config.id}-sg-frontend`,
      Tier: "Frontend",
    },
  });

  const backendSg = new aws.ec2.SecurityGroup(`${config.id}-sg-backend`, {
    vpcId: vpcId,
    description: "Backend SG: API 3000 y SSH solo desde Frontend SG",
    ingress: [
      { protocol: "tcp", fromPort: 3000, toPort: 3000, securityGroups: [frontendSg.id], description: "API NestJS desde Frontend" },
      { protocol: "tcp", fromPort: 22, toPort: 22, securityGroups: [frontendSg.id], description: "SSH Bastion desde Frontend" },
    ],
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "Salida interna" },
    ],
    tags: {
      ...commonTags,
      Name: `${config.id}-sg-backend`,
      Tier: "Backend",
    },
  });

  const databaseSg = new aws.ec2.SecurityGroup(`${config.id}-sg-database`, {
    vpcId: vpcId,
    description: "Database SG: PostgreSQL 5432 desde Backend SG y SSH desde Frontend SG",
    ingress: [
      { protocol: "tcp", fromPort: 5432, toPort: 5432, securityGroups: [backendSg.id], description: "PostgreSQL 16 desde Backend" },
      { protocol: "tcp", fromPort: 22, toPort: 22, securityGroups: [frontendSg.id], description: "SSH Bastion desde Frontend" },
    ],
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"], description: "Salida interna" },
    ],
    tags: {
      ...commonTags,
      Name: `${config.id}-sg-database`,
      Tier: "Database",
    },
  });

  return {
    frontendSg,
    backendSg,
    databaseSg,
  };
}
