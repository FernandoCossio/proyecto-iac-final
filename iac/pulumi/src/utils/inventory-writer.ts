import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as path from "path";

export function writeAnsibleInventory(
  tenantId: string,
  environment: string,
  frontendPublicIp: pulumi.Output<string>,
  backendPrivateIp: pulumi.Output<string>,
  dbPrivateIp: pulumi.Output<string>,
  sshPrivateKeyPath: string
): pulumi.Output<string> {
  return pulumi.all([frontendPublicIp, backendPrivateIp, dbPrivateIp]).apply(([fIp, bIp, dbIp]) => {
    const inventoryContent = `# ==============================================================================
# Inventario Dinamico de Ansible generado por Pulumi
# Tenant: ${tenantId} | Entorno: ${environment}
# ==============================================================================

[frontend]
frontend-node ansible_host=${fIp} ansible_user=ubuntu ansible_ssh_private_key_file=${sshPrivateKeyPath}

[backend]
backend-node ansible_host=${bIp} ansible_user=ubuntu ansible_ssh_private_key_file=${sshPrivateKeyPath} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${fIp} -i ${sshPrivateKeyPath} -o StrictHostKeyChecking=no"'

[database]
db-node ansible_host=${dbIp} ansible_user=ubuntu ansible_ssh_private_key_file=${sshPrivateKeyPath} ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${fIp} -i ${sshPrivateKeyPath} -o StrictHostKeyChecking=no"'

[all:vars]
tenant_id=${tenantId}
environment=${environment}
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
`;

    const targetDir = path.resolve(__dirname, "../../../ansible/inventory");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, `inventory-${tenantId}.ini`);
    fs.writeFileSync(filePath, inventoryContent, "utf8");
    pulumi.log.info(`Inventario de Ansible escrito exitosamente en: ${filePath}`);
    return filePath;
  });
}
