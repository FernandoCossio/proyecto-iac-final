import * as fs from "fs";
import * as path from "path";

/**
 * Carga y procesa plantillas estandarizadas de Cloud-Init YAML
 */
export function getCloudInitConfig(role: "frontend" | "backend" | "database", tenantId: string, sshPublicKey: string): string {
  const filePath = path.resolve(__dirname, `../../../../cloud-init/${role}.cloud-init.yaml`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf-8");
    content = content.replace(/\$\{tenant_id\}/g, tenantId);
    content = content.replace(/\$\{ssh_public_key\}/g, sshPublicKey || "");
    return content;
  }
  return `#cloud-config\nhostname: ${tenantId}-${role}\nmanage_etc_hosts: true\n`;
}
