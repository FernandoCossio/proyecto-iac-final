import * as azure from "@pulumi/azure-native";
import { TenantConfig } from "../config";
import { AzureNetworkResult } from "./network";

export interface AzureSecurityResult {
  frontendNsg: azure.network.NetworkSecurityGroup;
  backendNsg: azure.network.NetworkSecurityGroup;
  databaseNsg: azure.network.NetworkSecurityGroup;
}

export function createAzureSecurity(config: TenantConfig, network: AzureNetworkResult): AzureSecurityResult {
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  const frontendNsg = new azure.network.NetworkSecurityGroup(`nsg-${config.id}-frontend`, {
    resourceGroupName: network.resourceGroup.name,
    networkSecurityGroupName: `nsg-${config.id}-frontend`,
    location: network.resourceGroup.location,
    securityRules: [
      {
        name: "Allow-HTTP",
        priority: 100,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "80",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
      },
      {
        name: "Allow-HTTPS",
        priority: 110,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "443",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
      },
      {
        name: "Allow-SSH",
        priority: 120,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "22",
        sourceAddressPrefix: config.adminSshIp,
        destinationAddressPrefix: "*",
      },
    ],
    tags: commonTags,
  });

  const backendNsg = new azure.network.NetworkSecurityGroup(`nsg-${config.id}-backend`, {
    resourceGroupName: network.resourceGroup.name,
    networkSecurityGroupName: `nsg-${config.id}-backend`,
    location: network.resourceGroup.location,
    securityRules: [
      {
        name: "Allow-API-From-Frontend",
        priority: 100,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "3000",
        sourceAddressPrefix: config.publicSubnetCidr,
        destinationAddressPrefix: "*",
      },
      {
        name: "Allow-SSH-From-Frontend",
        priority: 110,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "22",
        sourceAddressPrefix: config.publicSubnetCidr,
        destinationAddressPrefix: "*",
      },
      {
        name: "Deny-All-Other-Inbound",
        priority: 4096,
        direction: "Inbound",
        access: "Deny",
        protocol: "*",
        sourcePortRange: "*",
        destinationPortRange: "*",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
      },
    ],
    tags: commonTags,
  });

  const databaseNsg = new azure.network.NetworkSecurityGroup(`nsg-${config.id}-database`, {
    resourceGroupName: network.resourceGroup.name,
    networkSecurityGroupName: `nsg-${config.id}-database`,
    location: network.resourceGroup.location,
    securityRules: [
      {
        name: "Allow-Postgres-From-Backend",
        priority: 100,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "5432",
        sourceAddressPrefix: config.privateBackendSubnetCidr,
        destinationAddressPrefix: "*",
      },
      {
        name: "Allow-SSH-From-Frontend",
        priority: 110,
        direction: "Inbound",
        access: "Allow",
        protocol: "Tcp",
        sourcePortRange: "*",
        destinationPortRange: "22",
        sourceAddressPrefix: config.publicSubnetCidr,
        destinationAddressPrefix: "*",
      },
      {
        name: "Deny-All-Other-Inbound",
        priority: 4096,
        direction: "Inbound",
        access: "Deny",
        protocol: "*",
        sourcePortRange: "*",
        destinationPortRange: "*",
        sourceAddressPrefix: "*",
        destinationAddressPrefix: "*",
      },
    ],
    tags: commonTags,
  });

  return {
    frontendNsg,
    backendNsg,
    databaseNsg,
  };
}
