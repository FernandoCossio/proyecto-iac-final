import { z } from "zod";

export const CreateTenantSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre de la institución debe tener al menos 3 caracteres")
    .max(60, "El nombre de la institución no puede exceder 60 caracteres"),
  id: z
    .string()
    .min(3, "El identificador debe tener al menos 3 caracteres")
    .max(30, "El identificador no puede exceder 30 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "El identificador solo puede contener letras minúsculas, números y guiones"
    ),
  adminEmail: z.string().email("Correo electrónico de administrador inválido"),
  region: z.string().min(1, "Debe seleccionar una región de despliegue"),
  environment: z.enum(["prod", "staging", "dev"], {
    errorMap: () => ({ message: "Entorno no válido" }),
  }),
  planId: z.enum(["basico", "estandar", "avanzado"], {
    errorMap: () => ({ message: "Plan no válido" }),
  }),
  cloudProvider: z.enum(["aws", "azure"], {
    errorMap: () => ({ message: "Proveedor cloud no válido" }),
  }),
  iacEngine: z.enum(["terraform", "opentofu", "cloudformation", "pulumi"], {
    errorMap: () => ({ message: "Motor de IaC no válido" }),
  }),
  adminUser: z.string().default("admin_tenant"),
  adminPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  sshKeyName: z.string().default("iac-asistencia"),
  allowedCidr: z.string().default("0.0.0.0/0"),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export const LoginSchema = z.object({
  username: z.string().min(1, "Ingrese su nombre de usuario"),
  password: z.string().min(1, "Ingrese su contraseña"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
