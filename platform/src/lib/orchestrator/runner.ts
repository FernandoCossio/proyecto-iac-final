import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma";
import { sanitizeLog } from "./log-sanitizer";
import { sseBroadcaster } from "./sse-broadcaster";
import { CreateTenantInput } from "../validators/tenant.schema";

const TENANTS_DATA_DIR = path.resolve(process.cwd(), "tenants-data");
const REPO_ROOT = path.resolve(process.cwd(), "..");

// Asegurar directorio base de datos de tenants
if (!fs.existsSync(TENANTS_DATA_DIR)) {
  fs.mkdirSync(TENANTS_DATA_DIR, { recursive: true });
}

interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Ejecuta un subproceso CLI capturando stdout/stderr en tiempo real con sanitización y broadcast SSE.
 */
export function runProcess(
  tenantId: string,
  jobId: string,
  stage: string,
  command: string,
  args: string[],
  cwd: string,
  envExtra: Record<string, string> = {}
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const sanitizedCommandStr = `${command} ${args.join(" ")}`;
    console.log(`[Runner][${tenantId}][${stage}] Ejecutando: ${sanitizedCommandStr}`);

    sseBroadcaster.broadcast(tenantId, "log", {
      stage,
      stream: "system",
      message: `▶ Iniciando etapa ${stage}: ${sanitizedCommandStr}`,
      timestamp: new Date().toISOString(),
    });

    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...envExtra,
      },
      shell: true, // Habilitar compatibilidad con scripts/cmd en Windows
    });

    let fullStdout = "";
    let fullStderr = "";

    const processChunk = (chunk: Buffer, stream: "stdout" | "stderr") => {
      const text = chunk.toString("utf-8");
      if (stream === "stdout") fullStdout += text;
      else fullStderr += text;

      const lines = text.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        const cleanLine = sanitizeLog(line);

        // Broadcast a la interfaz web vía SSE
        sseBroadcaster.broadcast(tenantId, "log", {
          stage,
          stream,
          message: cleanLine,
          timestamp: new Date().toISOString(),
        });

        // Persistir en SQLite de forma asíncrona
        prisma.jobLog
          .create({
            data: {
              jobId,
              stage,
              stream,
              message: cleanLine,
            },
          })
          .catch((err) =>
            console.error(`Error guardando JobLog para ${tenantId}:`, err)
          );
      }
    };

    child.stdout.on("data", (chunk) => processChunk(chunk, "stdout"));
    child.stderr.on("data", (chunk) => processChunk(chunk, "stderr"));

    child.on("close", (code) => {
      const resultMessage =
        code === 0
          ? `✔ Etapa ${stage} completada con éxito (Exit code 0)`
          : `✖ Etapa ${stage} finalizó con error (Exit code ${code})`;

      sseBroadcaster.broadcast(tenantId, "log", {
        stage,
        stream: code === 0 ? "system" : "stderr",
        message: resultMessage,
        timestamp: new Date().toISOString(),
      });

      resolve({ code, stdout: fullStdout, stderr: fullStderr });
    });

    child.on("error", (err) => {
      console.error(`[Runner] Error de ejecución en ${tenantId}:`, err);
      sseBroadcaster.broadcast(tenantId, "log", {
        stage,
        stream: "stderr",
        message: `Error interno de ejecución: ${err.message}`,
        timestamp: new Date().toISOString(),
      });
      resolve({ code: 1, stdout: fullStdout, stderr: err.message });
    });
  });
}

/**
 * Prepara el directorio de trabajo dedicado del tenant.
 */
function prepareTenantFiles(
  tenantDir: string,
  tenant: CreateTenantInput
): void {
  fs.mkdirSync(tenantDir, { recursive: true });

  const relativeModulePath =
    tenant.cloudProvider === "aws"
      ? path
          .relative(tenantDir, path.join(REPO_ROOT, "iac", "terraform", "modules", "aws_tenant"))
          .replace(/\\/g, "/")
      : path
          .relative(tenantDir, path.join(REPO_ROOT, "iac", "terraform", "modules", "azure_tenant"))
          .replace(/\\/g, "/");

  // 1. main.tf dedicado para este tenant
  const mainTfContent = `
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    ${
      tenant.cloudProvider === "aws"
        ? `aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }`
        : `azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }`
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

provider "${tenant.cloudProvider === "aws" ? "aws" : "azurerm"}" {
  ${
    tenant.cloudProvider === "aws"
      ? `region = var.aws_region`
      : `features {}`
  }
}

module "tenant" {
  source = "${relativeModulePath}"

  tenant_id                   = var.tenant_id
  environment                 = var.environment
  ${tenant.cloudProvider === "aws" ? `aws_region = var.aws_region` : `azure_location = var.azure_location`}
  plan                        = var.plan
  admin_ssh_ip                = var.admin_ssh_ip
  ssh_key_name                = var.ssh_key_name
  inventory_output_dir        = "."
}

output "tenant_id" {
  value = module.tenant.tenant_id
}

output "frontend_public_ip" {
  value = module.tenant.frontend_public_ip
}

output "frontend_private_ip" {
  value = module.tenant.frontend_private_ip
}

output "backend_private_ip" {
  value = module.tenant.backend_private_ip
}

output "database_private_ip" {
  value = module.tenant.database_private_ip
}
`;

  fs.writeFileSync(path.join(tenantDir, "main.tf"), mainTfContent.trim(), "utf-8");

  // 2. variables.tf
  const variablesTfContent = `
variable "tenant_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "${tenant.cloudProvider === "aws" ? "aws_region" : "azure_location"}" {
  type = string
}

variable "plan" {
  type = string
}

variable "admin_ssh_ip" {
  type    = string
  default = "0.0.0.0/0"
}

variable "ssh_key_name" {
  type    = string
  default = null
}
`;
  fs.writeFileSync(path.join(tenantDir, "variables.tf"), variablesTfContent.trim(), "utf-8");

  // 3. terraform.tfvars con los valores del formulario
  const tfvarsContent = `
tenant_id    = "${tenant.id}"
environment  = "${tenant.environment}"
${tenant.cloudProvider === "aws" ? `aws_region = "${tenant.region}"` : `azure_location = "${tenant.region}"`}
plan         = "${tenant.planId}"
admin_ssh_ip = "${tenant.allowedCidr || "0.0.0.0/0"}"
ssh_key_name = "${tenant.sshKeyName || "iac-asistencia"}"
`;
  fs.writeFileSync(path.join(tenantDir, "terraform.tfvars"), tfvarsContent.trim(), "utf-8");
}

/**
 * Flujo completo de despliegue y aprovisionamiento (IaC + Ansible + Healthcheck).
 */
export async function startDeploymentJob(
  tenantInput: CreateTenantInput,
  jobId: string
): Promise<void> {
  const tenantId = tenantInput.id;
  const tenantDir = path.join(TENANTS_DATA_DIR, tenantId);

  try {
    await prisma.deploymentJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "CREATING" },
    });

    sseBroadcaster.broadcast(tenantId, "status", { status: "CREATING" });

    // 1. Preparar archivos de infraestructura en platform/tenants-data/<tenantId>
    prepareTenantFiles(tenantDir, tenantInput);

    // 2. Ejecutar Terraform / OpenTofu Init & Apply
    const binary = tenantInput.iacEngine === "opentofu" ? "tofu" : "terraform";

    const envExtra: Record<string, string> = {
      AWS_PROFILE: process.env.AWS_PROFILE || "companero-iac",
      AWS_REGION: tenantInput.region || process.env.AWS_REGION || "us-east-1",
    };

    const initRes = await runProcess(
      tenantId,
      jobId,
      "IAC_INIT",
      binary,
      ["init", "-no-color"],
      tenantDir,
      envExtra
    );

    if (initRes.code !== 0) {
      throw new Error(`Fallo en '${binary} init' (Exit code: ${initRes.code})`);
    }

    const applyRes = await runProcess(
      tenantId,
      jobId,
      "IAC_APPLY",
      binary,
      ["apply", "-auto-approve", "-no-color"],
      tenantDir,
      envExtra
    );

    if (applyRes.code !== 0) {
      throw new Error(`Fallo en '${binary} apply' (Exit code: ${applyRes.code})`);
    }

    // 3. Obtener outputs de infraestructura
    const outputRes = await runProcess(
      tenantId,
      jobId,
      "IAC_OUTPUT",
      binary,
      ["output", "-json"],
      tenantDir,
      envExtra
    );

    let fePublicIp = "";
    let fePrivateIp = "";
    let bePrivateIp = "";
    let dbPrivateIp = "";

    try {
      const outputs = JSON.parse(outputRes.stdout);
      fePublicIp = outputs.frontend_public_ip?.value || "";
      fePrivateIp = outputs.frontend_private_ip?.value || "";
      bePrivateIp = outputs.backend_private_ip?.value || "";
      dbPrivateIp = outputs.database_private_ip?.value || "";
    } catch (err) {
      console.warn(`[Runner] No se pudieron parsear los outputs JSON:`, err);
    }

    // Actualizar IPs en la base de datos
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        frontendPublicIp: fePublicIp,
        frontendPrivateIp: fePrivateIp,
        backendPrivateIp: bePrivateIp,
        databasePrivateIp: dbPrivateIp,
      },
    });

    sseBroadcaster.broadcast(tenantId, "ips", {
      frontendPublicIp: fePublicIp,
      frontendPrivateIp: fePrivateIp,
      backendPrivateIp: bePrivateIp,
      databasePrivateIp: dbPrivateIp,
    });

    // 4. Generar Inventario Dinámico de Ansible
    const ansibleDir = path.join(REPO_ROOT, "iac", "ansible");
    const inventoryContent = `
[frontend]
frontend-node ansible_host=${fePublicIp} ansible_user=ubuntu ansible_ssh_private_key_file=/root/.ssh/iac-asistencia.pem

[backend]
backend-node ansible_host=${bePrivateIp} ansible_user=ubuntu ansible_ssh_private_key_file=/root/.ssh/iac-asistencia.pem ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${fePublicIp} -i /root/.ssh/iac-asistencia.pem -o StrictHostKeyChecking=no"'

[database]
db-node ansible_host=${dbPrivateIp} ansible_user=ubuntu ansible_ssh_private_key_file=/root/.ssh/iac-asistencia.pem ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${fePublicIp} -i /root/.ssh/iac-asistencia.pem -o StrictHostKeyChecking=no"'

[all:vars]
tenant_id=${tenantId}
tenant_environment=${tenantInput.environment}
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_extra_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
`;
    const inventoryPath = path.join(tenantDir, `inventory-${tenantId}.ini`);
    fs.writeFileSync(inventoryPath, inventoryContent.trim(), "utf-8");

    // 5. Ejecutar Ansible mediante Docker con el contenedor local iac-ansible-controller
    const extraVarsFile = path.join(tenantDir, "extra-vars.json");
    const extraVarsData = {
      tenant_id: tenantId,
      tenant_db_password: "SecureDbPassword2026!",
      tenant_jwt_secret: "SuperSecretJWTKeyForAsistenciaTenant2026!",
      tenant_admin_email: tenantInput.adminEmail,
      tenant_admin_username: tenantInput.adminUser || "admin_tenant",
      tenant_admin_password: tenantInput.adminPassword,
      tenant_admin_fullname: `Administrador ${tenantInput.name}`,
    };
    fs.writeFileSync(extraVarsFile, JSON.stringify(extraVarsData, null, 2), "utf-8");

    // Esperar a que Cloud-Init y SSH en el Bastion estén disponibles
    sseBroadcaster.broadcast(tenantId, "log", {
      stage: "ANSIBLE",
      stream: "system",
      message: "⏳ Esperando 30s a que el puerto SSH y Cloud-Init del Bastion Frontend estén disponibles...",
      timestamp: new Date().toISOString(),
    });
    await new Promise((r) => setTimeout(r, 30000));

    // Generar script de ejecución en el directorio del tenant para evitar problemas de escape en Windows cmd
    const runAnsibleScript = `#!/bin/sh
set -e
mkdir -p /root/.ssh
cp /root/.ssh-src/iac-asistencia.pem /root/.ssh/iac-asistencia.pem
chmod 600 /root/.ssh/iac-asistencia.pem
ansible-playbook -i /tenant/inventory-${tenantId}.ini site.yml -e @/tenant/extra-vars.json
`.replace(/\r\n/g, "\n");

    fs.writeFileSync(path.join(tenantDir, "run-ansible.sh"), runAnsibleScript, {
      encoding: "utf-8",
      mode: 0o755,
    });

    // Ejecutar Ansible a través de Docker con volumen montado y script aislado
    const sshKeyFile = path.join(process.env.USERPROFILE || "", ".ssh", "iac-asistencia.pem");
    const dockerArgs = [
      "run",
      "--rm",
      "-v",
      `${sshKeyFile}:/root/.ssh-src/iac-asistencia.pem:ro`,
      "-v",
      `${ansibleDir}:/ansible`,
      "-v",
      `${tenantDir}:/tenant`,
      "-e",
      "ANSIBLE_CONFIG=/ansible/ansible.cfg",
      "-e",
      "ANSIBLE_HOST_KEY_CHECKING=False",
      "-w",
      "/ansible",
      "iac-ansible-controller:latest",
      "sh",
      "/tenant/run-ansible.sh",
    ];

    const ansibleRes = await runProcess(
      tenantId,
      jobId,
      "ANSIBLE",
      "docker",
      dockerArgs,
      ansibleDir
    );

    if (ansibleRes.code !== 0) {
      throw new Error(`Fallo en aprovisionamiento de Ansible (Exit code: ${ansibleRes.code})`);
    }

    // 6. Verificación de Salud HTTP: validar que el portal Next.js responda en HTTP 200
    sseBroadcaster.broadcast(tenantId, "log", {
      stage: "HEALTH_CHECK",
      stream: "system",
      message: `🔍 Ejecutando verificación de salud HTTP sobre http://${fePublicIp}/...`,
      timestamp: new Date().toISOString(),
    });

    let healthSuccess = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`http://${fePublicIp}/`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.status === 200) {
          healthSuccess = true;
          sseBroadcaster.broadcast(tenantId, "log", {
            stage: "HEALTH_CHECK",
            stream: "stdout",
            message: `✔ Portal de Asistencia Next.js respondiendo HTTP 200 OK en intento ${attempt}. Tenant operativo!`,
            timestamp: new Date().toISOString(),
          });
          break;
        } else {
          sseBroadcaster.broadcast(tenantId, "log", {
            stage: "HEALTH_CHECK",
            stream: "system",
            message: `Intento ${attempt}/10: HTTP status ${res.status}. Esperando arranque del servidor Next.js...`,
            timestamp: new Date().toISOString(),
          });
          await new Promise((r) => setTimeout(r, 6000));
        }
      } catch {
        sseBroadcaster.broadcast(tenantId, "log", {
          stage: "HEALTH_CHECK",
          stream: "system",
          message: `Intento ${attempt}/10: Esperando respuesta del Frontend...`,
          timestamp: new Date().toISOString(),
        });
        await new Promise((r) => setTimeout(r, 6000));
      }
    }

    if (!healthSuccess) {
      throw new Error("El frontend no respondió HTTP 200 después de múltiples intentos.");
    }
    // 7. Marcar estado final de éxito
    await prisma.deploymentJob.update({
      where: { id: jobId },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        exitCode: 0,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "ACTIVE" },
    });

    sseBroadcaster.broadcast(tenantId, "status", { status: "ACTIVE" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Runner] Error durante el despliegue del tenant ${tenantId}:`, errorMsg);

    await prisma.deploymentJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: errorMsg,
        exitCode: 1,
      },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "FAILED" },
    });

    sseBroadcaster.broadcast(tenantId, "status", { status: "FAILED", error: errorMsg });
  }
}

/**
 * Suspender un tenant: detiene las 3 VMs en la nube reduciendo el costo de cómputo a $0/h.
 */
export async function suspendTenant(tenantId: string, jobId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant no encontrado");

  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "SUSPENDING" as unknown as string } });
  sseBroadcaster.broadcast(tenantId, "status", { status: "SUSPENDING" });

  const tenantDir = path.join(TENANTS_DATA_DIR, tenantId);
  const envExtra: Record<string, string> = {
    AWS_PROFILE: process.env.AWS_PROFILE || "companero-iac",
    AWS_REGION: tenant.region || process.env.AWS_REGION || "us-east-1",
  };

  // AWS CLI stop-instances por filtro de tag
  const stopRes = await runProcess(
    tenantId,
    jobId,
    "SUSPEND",
    "aws",
    [
      "ec2",
      "stop-instances",
      "--filters",
      `Name=tag:TenantId,Values=${tenantId}`,
      "--region",
      tenant.region,
    ],
    tenantDir,
    envExtra
  );

  if (stopRes.code === 0) {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "SUSPENDED" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "SUSPENDED" });
    return true;
  } else {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "ACTIVE" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "ACTIVE", error: stopRes.stderr });
    return false;
  }
}

/**
 * Reanudar un tenant: enciende las 3 VMs y actualiza la nueva IP pública en base de datos.
 */
export async function resumeTenant(tenantId: string, jobId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant no encontrado");

  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "RESUMING" as unknown as string } });
  sseBroadcaster.broadcast(tenantId, "status", { status: "RESUMING" });

  const tenantDir = path.join(TENANTS_DATA_DIR, tenantId);
  const envExtra: Record<string, string> = {
    AWS_PROFILE: process.env.AWS_PROFILE || "companero-iac",
    AWS_REGION: tenant.region || process.env.AWS_REGION || "us-east-1",
  };

  // 1. Iniciar instancias
  const startRes = await runProcess(
    tenantId,
    jobId,
    "RESUME",
    "aws",
    [
      "ec2",
      "start-instances",
      "--filters",
      `Name=tag:TenantId,Values=${tenantId}`,
      "--region",
      tenant.region,
    ],
    tenantDir,
    envExtra
  );

  if (startRes.code !== 0) {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "SUSPENDED" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "SUSPENDED", error: startRes.stderr });
    return false;
  }

  // 2. Esperar 15s y consultar la nueva IP pública del Frontend
  sseBroadcaster.broadcast(tenantId, "log", {
    stage: "RESUME",
    stream: "system",
    message: "⏳ Consultando nueva IP pública del Frontend tras encendido...",
    timestamp: new Date().toISOString(),
  });
  await new Promise((r) => setTimeout(r, 15000));

  const describeRes = await runProcess(
    tenantId,
    jobId,
    "RESUME_QUERY_IP",
    "aws",
    [
      "ec2",
      "describe-instances",
      "--filters",
      `Name=tag:TenantId,Values=${tenantId}`,
      `Name=tag:Tier,Values=Frontend`,
      `Name=instance-state-name,Values=running`,
      "--query",
      "Reservations[*].Instances[*].PublicIpAddress",
      "--output",
      "text",
      "--region",
      tenant.region,
    ],
    tenantDir,
    envExtra
  );

  const newPublicIp = describeRes.stdout.trim().split(/\s+/)[0];
  if (newPublicIp) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { frontendPublicIp: newPublicIp, status: "ACTIVE" },
    });
    sseBroadcaster.broadcast(tenantId, "ips", { frontendPublicIp: newPublicIp });
    sseBroadcaster.broadcast(tenantId, "status", { status: "ACTIVE" });
  } else {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "ACTIVE" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "ACTIVE" });
  }

  return true;
}

/**
 * Destruir un tenant: ejecuta 'destroy' de IaC y elimina todos los recursos cloud ($0 residual).
 */
export async function destroyTenant(tenantId: string, jobId: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error("Tenant no encontrado");

  await prisma.tenant.update({ where: { id: tenantId }, data: { status: "TERMINATING" as unknown as string } });
  sseBroadcaster.broadcast(tenantId, "status", { status: "TERMINATING" });

  const tenantDir = path.join(TENANTS_DATA_DIR, tenantId);
  const binary = tenant.iacEngine === "opentofu" ? "tofu" : "terraform";
  const envExtra: Record<string, string> = {
    AWS_PROFILE: process.env.AWS_PROFILE || "companero-iac",
    AWS_REGION: tenant.region || process.env.AWS_REGION || "us-east-1",
  };

  const destroyRes = await runProcess(
    tenantId,
    jobId,
    "DESTROY",
    binary,
    ["destroy", "-auto-approve", "-no-color"],
    tenantDir,
    envExtra
  );

  if (destroyRes.code === 0) {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "TERMINATED" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "TERMINATED" });
    return true;
  } else {
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: "FAILED" } });
    sseBroadcaster.broadcast(tenantId, "status", { status: "FAILED", error: destroyRes.stderr });
    return false;
  }
}
