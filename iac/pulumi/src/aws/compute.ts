import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { TenantConfig } from "../config";
import { AWS_PLAN_CATALOG } from "../utils/plan-catalog";
import { AwsNetworkResult } from "./network";
import { AwsSecurityResult } from "./security";

export interface AwsComputeResult {
  frontend: aws.ec2.Instance;
  backend: aws.ec2.Instance;
  database: aws.ec2.Instance;
}

export function createAwsCompute(
  config: TenantConfig,
  network: AwsNetworkResult,
  security: AwsSecurityResult
): AwsComputeResult {
  const hardware = AWS_PLAN_CATALOG[config.plan];
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  // 1. Descubrimiento dinámico de AMIs generadas por Packer
  const frontendAmi = aws.ec2.getAmiOutput({
    mostRecent: true,
    owners: ["self"],
    filters: [
      { name: "tag:Component", values: ["frontend"] },
      { name: "tag:Project", values: ["SistemaAsistencia"] },
    ],
  });

  const backendAmi = aws.ec2.getAmiOutput({
    mostRecent: true,
    owners: ["self"],
    filters: [
      { name: "tag:Component", values: ["backend"] },
      { name: "tag:Project", values: ["SistemaAsistencia"] },
    ],
  });

  const databaseAmi = aws.ec2.getAmiOutput({
    mostRecent: true,
    owners: ["self"],
    filters: [
      { name: "tag:Component", values: ["database"] },
      { name: "tag:Project", values: ["SistemaAsistencia"] },
    ],
  });

  // 2. Gestión de KeyPair
  let keyName: pulumi.Input<string> | undefined = config.sshKeyName;
  if (!keyName && config.sshPublicKey) {
    const keyPair = new aws.ec2.KeyPair(`${config.id}-key`, {
      keyName: `${config.id}-key`,
      publicKey: config.sshPublicKey,
      tags: commonTags,
    });
    keyName = keyPair.keyName;
  }

  // 3. Instancia Frontend (Public IP + Nginx + Bastion SSH)
  const frontend = new aws.ec2.Instance(`${config.id}-frontend`, {
    ami: frontendAmi.id,
    instanceType: hardware.frontendType,
    subnetId: network.publicSubnet.id,
    vpcSecurityGroupIds: [security.frontendSg.id],
    associatePublicIpAddress: true,
    keyName: keyName,
    rootBlockDevice: {
      volumeType: "gp3",
      volumeSize: hardware.diskSizeGB,
      encrypted: true,
      deleteOnTermination: true,
      tags: {
        ...commonTags,
        Name: `${config.id}-disk-frontend`,
        Tier: "Frontend",
      },
    },
    tags: {
      ...commonTags,
      Name: `${config.id}-frontend`,
      Tier: "Frontend",
    },
  });

  // 4. Instancia Backend (Subred Privada - Solo IP Privada)
  const backend = new aws.ec2.Instance(`${config.id}-backend`, {
    ami: backendAmi.id,
    instanceType: hardware.backendType,
    subnetId: network.backendSubnet.id,
    vpcSecurityGroupIds: [security.backendSg.id],
    associatePublicIpAddress: false,
    keyName: keyName,
    rootBlockDevice: {
      volumeType: "gp3",
      volumeSize: hardware.diskSizeGB,
      encrypted: true,
      deleteOnTermination: true,
      tags: {
        ...commonTags,
        Name: `${config.id}-disk-backend`,
        Tier: "Backend",
      },
    },
    tags: {
      ...commonTags,
      Name: `${config.id}-backend`,
      Tier: "Backend",
    },
  });

  // 5. Instancia Database (Subred Aislada - Solo IP Privada)
  const database = new aws.ec2.Instance(`${config.id}-database`, {
    ami: databaseAmi.id,
    instanceType: hardware.databaseType,
    subnetId: network.dbSubnet.id,
    vpcSecurityGroupIds: [security.databaseSg.id],
    associatePublicIpAddress: false,
    keyName: keyName,
    rootBlockDevice: {
      volumeType: "gp3",
      volumeSize: hardware.diskSizeGB,
      encrypted: true,
      deleteOnTermination: true,
      tags: {
        ...commonTags,
        Name: `${config.id}-disk-database`,
        Tier: "Database",
      },
    },
    tags: {
      ...commonTags,
      Name: `${config.id}-database`,
      Tier: "Database",
    },
  });

  return {
    frontend,
    backend,
    database,
  };
}
