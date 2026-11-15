import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inicializando seed de base de datos del plano de control...");

  // 1. Crear usuario administrador inicial
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("AdminTenantControl2026!", 12);
    const adminUser = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@tenantcontrol.local",
        fullName: "Administrador",
        role: "ADMIN",
        passwordHash,
      },
    });
    console.log(`✅ Administrador creado: ${adminUser.username} (${adminUser.fullName})`);
  } else {
    console.log("ℹ️  Administrador 'admin' ya existe.");
  }

  // 2. Crear catálogo fijo de planes
  const plans = [
    {
      id: "basico",
      displayName: "Básico",
      description: "Para instituciones pequeñas con requerimientos estándar de asistencia.",
      maxStudents: 100,
      diskSizeGb: 10,
      awsInstanceType: "t3.micro",
      azureVmSize: "Standard_B1s",
      isAvailable: true,
    },
    {
      id: "estandar",
      displayName: "Estándar",
      description: "Para instituciones en crecimiento con alta concurrencia diaria.",
      maxStudents: 1000,
      diskSizeGb: 20,
      awsInstanceType: "t3.small",
      azureVmSize: "Standard_B2s_v2",
      isAvailable: true,
    },
    {
      id: "avanzado",
      displayName: "Avanzado",
      description: "Para alta demanda académica, múltiples programas y consultas masivas.",
      maxStudents: 5000,
      diskSizeGb: 30,
      awsInstanceType: "c7i-flex.large",
      azureVmSize: "Standard_B4s_v2",
      isAvailable: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
    console.log(`✅ Plan sincronizado: ${plan.displayName} (${plan.id})`);
  }

  console.log("🚀 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
