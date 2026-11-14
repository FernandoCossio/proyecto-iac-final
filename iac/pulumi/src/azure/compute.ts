import * as azure from "@pulumi/azure-native";
import { TenantConfig } from "../config";
import { AZURE_PLAN_CATALOG } from "../utils/plan-catalog";
import { AzureNetworkResult } from "./network";

export interface AzureComputeResult {
  frontendVm: azure.compute.VirtualMachine;
  backendVm: azure.compute.VirtualMachine;
  databaseVm: azure.compute.VirtualMachine;
}

export function createAzureCompute(config: TenantConfig, network: AzureNetworkResult): AzureComputeResult {
  const hardware = AZURE_PLAN_CATALOG[config.plan];
  const commonTags = {
    TenantId: config.id,
    Environment: config.environment,
    Plan: config.plan,
    Project: "SistemaAsistencia",
    ManagedBy: "Pulumi",
  };

  const sshKey = config.sshPublicKey || "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... dummy@host";

  const frontendVm = new azure.compute.VirtualMachine(`vm-${config.id}-frontend`, {
    resourceGroupName: network.resourceGroup.name,
    vmName: `vm-${config.id}-frontend`,
    location: network.resourceGroup.location,
    hardwareProfile: {
      vmSize: hardware.frontendType,
    },
    osProfile: {
      computerName: `fe-${config.id.substring(0, 8)}`,
      adminUsername: "ubuntu",
      linuxConfiguration: {
        disablePasswordAuthentication: true,
        ssh: {
          publicKeys: [
            {
              path: "/home/ubuntu/.ssh/authorized_keys",
              keyData: sshKey,
            },
          ],
        },
      },
    },
    networkProfile: {
      networkInterfaces: [{ id: network.frontendNic.id, primary: true }],
    },
    storageProfile: {
      osDisk: {
        name: `osdisk-${config.id}-frontend`,
        caching: "ReadWrite",
        createOption: "FromImage",
        diskSizeGB: hardware.diskSizeGB,
      },
      imageReference: {
        publisher: "Canonical",
        offer: "0001-com-ubuntu-server-jammy",
        sku: "22_04-lts-gen2",
        version: "latest",
      },
    },
    tags: {
      ...commonTags,
      Tier: "Frontend",
    },
  });

  const backendVm = new azure.compute.VirtualMachine(`vm-${config.id}-backend`, {
    resourceGroupName: network.resourceGroup.name,
    vmName: `vm-${config.id}-backend`,
    location: network.resourceGroup.location,
    hardwareProfile: {
      vmSize: hardware.backendType,
    },
    osProfile: {
      computerName: `be-${config.id.substring(0, 8)}`,
      adminUsername: "ubuntu",
      linuxConfiguration: {
        disablePasswordAuthentication: true,
        ssh: {
          publicKeys: [
            {
              path: "/home/ubuntu/.ssh/authorized_keys",
              keyData: sshKey,
            },
          ],
        },
      },
    },
    networkProfile: {
      networkInterfaces: [{ id: network.backendNic.id, primary: true }],
    },
    storageProfile: {
      osDisk: {
        name: `osdisk-${config.id}-backend`,
        caching: "ReadWrite",
        createOption: "FromImage",
        diskSizeGB: hardware.diskSizeGB,
      },
      imageReference: {
        publisher: "Canonical",
        offer: "0001-com-ubuntu-server-jammy",
        sku: "22_04-lts-gen2",
        version: "latest",
      },
    },
    tags: {
      ...commonTags,
      Tier: "Backend",
    },
  });

  const databaseVm = new azure.compute.VirtualMachine(`vm-${config.id}-database`, {
    resourceGroupName: network.resourceGroup.name,
    vmName: `vm-${config.id}-database`,
    location: network.resourceGroup.location,
    hardwareProfile: {
      vmSize: hardware.databaseType,
    },
    osProfile: {
      computerName: `db-${config.id.substring(0, 8)}`,
      adminUsername: "ubuntu",
      linuxConfiguration: {
        disablePasswordAuthentication: true,
        ssh: {
          publicKeys: [
            {
              path: "/home/ubuntu/.ssh/authorized_keys",
              keyData: sshKey,
            },
          ],
        },
      },
    },
    networkProfile: {
      networkInterfaces: [{ id: network.dbNic.id, primary: true }],
    },
    storageProfile: {
      osDisk: {
        name: `osdisk-${config.id}-database`,
        caching: "ReadWrite",
        createOption: "FromImage",
        diskSizeGB: hardware.diskSizeGB,
      },
      imageReference: {
        publisher: "Canonical",
        offer: "0001-com-ubuntu-server-jammy",
        sku: "22_04-lts-gen2",
        version: "latest",
      },
    },
    tags: {
      ...commonTags,
      Tier: "Database",
    },
  });

  return {
    frontendVm,
    backendVm,
    databaseVm,
  };
}
