import * as azure from "@pulumi/azure-native";
import { TenantConfig } from "../config";

export interface AzureNetworkResult {
  resourceGroup: azure.resources.ResourceGroup;
  frontendSubnet: azure.network.Subnet;
  backendSubnet: azure.network.Subnet;
  dbSubnet: azure.network.Subnet;
  frontendPublicIp: azure.network.PublicIPAddress;
  frontendNic: azure.network.NetworkInterface;
  backendNic: azure.network.NetworkInterface;
  dbNic: azure.network.NetworkInterface;
}

export function createAzureNetwork(config: TenantConfig): AzureNetworkResult {
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  const resourceGroup = new azure.resources.ResourceGroup(`rg-${config.id}`, {
    resourceGroupName: `rg-${config.id}`,
    location: config.region,
    tags: commonTags,
  });

  const vnet = new azure.network.VirtualNetwork(`vnet-${config.id}`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: `vnet-${config.id}`,
    location: resourceGroup.location,
    addressSpace: {
      addressPrefixes: [config.vpcCidr],
    },
    tags: commonTags,
  });

  const frontendSubnet = new azure.network.Subnet(`snet-${config.id}-frontend`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: vnet.name,
    subnetName: `snet-${config.id}-frontend`,
    addressPrefix: config.publicSubnetCidr,
  });

  const backendSubnet = new azure.network.Subnet(`snet-${config.id}-backend`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: vnet.name,
    subnetName: `snet-${config.id}-backend`,
    addressPrefix: config.privateBackendSubnetCidr,
  });

  const dbSubnet = new azure.network.Subnet(`snet-${config.id}-database`, {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: vnet.name,
    subnetName: `snet-${config.id}-database`,
    addressPrefix: config.isolatedDbSubnetCidr,
  });

  const frontendPublicIp = new azure.network.PublicIPAddress(`pip-${config.id}-frontend`, {
    resourceGroupName: resourceGroup.name,
    publicIpAddressName: `pip-${config.id}-frontend`,
    location: resourceGroup.location,
    publicIPAllocationMethod: "Static",
    sku: { name: "Standard" },
    tags: commonTags,
  });

  const frontendNic = new azure.network.NetworkInterface(`nic-${config.id}-frontend`, {
    resourceGroupName: resourceGroup.name,
    networkInterfaceName: `nic-${config.id}-frontend`,
    location: resourceGroup.location,
    ipConfigurations: [
      {
        name: "ipconfig-frontend",
        subnet: { id: frontendSubnet.id },
        privateIPAllocationMethod: "Dynamic",
        publicIPAddress: { id: frontendPublicIp.id },
      },
    ],
    tags: commonTags,
  });

  const backendNic = new azure.network.NetworkInterface(`nic-${config.id}-backend`, {
    resourceGroupName: resourceGroup.name,
    networkInterfaceName: `nic-${config.id}-backend`,
    location: resourceGroup.location,
    ipConfigurations: [
      {
        name: "ipconfig-backend",
        subnet: { id: backendSubnet.id },
        privateIPAllocationMethod: "Dynamic",
      },
    ],
    tags: commonTags,
  });

  const dbNic = new azure.network.NetworkInterface(`nic-${config.id}-database`, {
    resourceGroupName: resourceGroup.name,
    networkInterfaceName: `nic-${config.id}-database`,
    location: resourceGroup.location,
    ipConfigurations: [
      {
        name: "ipconfig-database",
        subnet: { id: dbSubnet.id },
        privateIPAllocationMethod: "Dynamic",
      },
    ],
    tags: commonTags,
  });

  return {
    resourceGroup,
    frontendSubnet,
    backendSubnet,
    dbSubnet,
    frontendPublicIp,
    frontendNic,
    backendNic,
    dbNic,
  };
}
