import * as pulumi from "@pulumi/pulumi";
import { loadTenantConfig } from "./config";
import { createAwsNetwork } from "./aws/network";
import { createAwsSecurity } from "./aws/security";
import { createAwsCompute } from "./aws/compute";
import { createAzureNetwork } from "./azure/network";
import { createAzureSecurity } from "./azure/security";
import { createAzureCompute } from "./azure/compute";
import { writeAnsibleInventory } from "./utils/inventory-writer";

const config = loadTenantConfig();

let tenantIdExport: pulumi.Output<string> = pulumi.output(config.id);
let cloudExport: pulumi.Output<string> = pulumi.output(config.cloud);
let frontendPublicIpExport: pulumi.Output<string>;
let frontendPrivateIpExport: pulumi.Output<string>;
let backendPrivateIpExport: pulumi.Output<string>;
let databasePrivateIpExport: pulumi.Output<string>;
let inventoryPathExport: pulumi.Output<string>;
let networkIdExport: pulumi.Output<string>;

if (config.cloud === "aws") {
  // Despliegue en AWS
  const network = createAwsNetwork(config);
  const security = createAwsSecurity(config, network.vpc.id);
  const compute = createAwsCompute(config, network, security);

  frontendPublicIpExport = compute.frontend.publicIp;
  frontendPrivateIpExport = compute.frontend.privateIp;
  backendPrivateIpExport = compute.backend.privateIp;
  databasePrivateIpExport = compute.database.privateIp;
  networkIdExport = network.vpc.id;

  inventoryPathExport = writeAnsibleInventory(
    config.id,
    config.environment,
    compute.frontend.publicIp,
    compute.backend.privateIp,
    compute.database.privateIp,
    config.sshPrivateKeyPath
  );
} else {
  // Despliegue en Azure
  const network = createAzureNetwork(config);
  createAzureSecurity(config, network);
  createAzureCompute(config, network);

  frontendPublicIpExport = network.frontendPublicIp.ipAddress.apply((ip) => ip || "");
  frontendPrivateIpExport = network.frontendNic.ipConfigurations.apply(
    (configs) => configs?.[0]?.privateIPAddress || ""
  );
  backendPrivateIpExport = network.backendNic.ipConfigurations.apply(
    (configs) => configs?.[0]?.privateIPAddress || ""
  );
  databasePrivateIpExport = network.dbNic.ipConfigurations.apply(
    (configs) => configs?.[0]?.privateIPAddress || ""
  );
  networkIdExport = network.resourceGroup.name;

  inventoryPathExport = writeAnsibleInventory(
    config.id,
    config.environment,
    frontendPublicIpExport,
    backendPrivateIpExport,
    databasePrivateIpExport,
    config.sshPrivateKeyPath
  );
}

export const tenantId = tenantIdExport;
export const cloud = cloudExport;
export const networkId = networkIdExport;
export const frontendPublicIp = frontendPublicIpExport;
export const frontendPrivateIp = frontendPrivateIpExport;
export const backendPrivateIp = backendPrivateIpExport;
export const databasePrivateIp = databasePrivateIpExport;
export const inventoryPath = inventoryPathExport;
