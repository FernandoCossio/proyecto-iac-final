import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import * as aws from "@pulumi/aws";

new PolicyPack("tenant-security-policies", {
  policies: [
    {
      name: "require-ssh-cidr-restriction",
      description: "Impide abrir el puerto 22 a 0.0.0.0/0 en instancias privadas de tenants",
      enforcementLevel: "mandatory",
      validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        if (sg.ingress) {
          for (const rule of sg.ingress) {
            // Si el Security Group no es de Frontend (es de Backend o DB) y abre puerto 22 a 0.0.0.0/0, reportar violacion
            const isBackendOrDb = args.name.includes("backend") || args.name.includes("db") || args.name.includes("database");
            if (isBackendOrDb && rule.fromPort === 22 && rule.cidrBlocks?.includes("0.0.0.0/0")) {
              reportViolation("El puerto SSH (22) en instancias privadas (Backend/DB) no puede estar abierto a 0.0.0.0/0.");
            }
          }
        }
      }),
    },
    {
      name: "require-db-isolation",
      description: "Impide abrir el puerto de PostgreSQL (5432) a internet",
      enforcementLevel: "mandatory",
      validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
        if (sg.ingress) {
          for (const rule of sg.ingress) {
            if (rule.fromPort === 5432 && rule.cidrBlocks?.includes("0.0.0.0/0")) {
              reportViolation("El puerto de PostgreSQL (5432) no puede estar abierto a internet (0.0.0.0/0). Solo debe aceptar trafico desde la subred privada de Backend.");
            }
          }
        }
      }),
    },
    {
      name: "require-mandatory-tags",
      description: "Exige que los recursos contengan las etiquetas obligatorias de gobernanza",
      enforcementLevel: "mandatory",
      validateResource: validateResourceOfType(aws.ec2.Instance, (instance, args, reportViolation) => {
        if (!instance.tags || !instance.tags["TenantId"] || !instance.tags["Project"]) {
          reportViolation("Toda instancia EC2 debe tener las etiquetas 'TenantId' y 'Project'.");
        }
      }),
    },
  ],
});
