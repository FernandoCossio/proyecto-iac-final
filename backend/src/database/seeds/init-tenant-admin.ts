import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { AdminUser, ActivityLog, APP_ENTITIES } from '../entities';
import { UserRole, ActivityAction } from '../../common/enums';

// Cargar variables de entorno
dotenv.config();

export interface InitTenantAdminOptions {
  email?: string;
  username?: string;
  password?: string;
  fullName?: string;
}

/**
 * Parsea argumentos CLI en formato --key=value o --key value
 */
export function parseCommandLineArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, ...values] = arg.slice(2).split('=');
        args[key.toLowerCase()] = values.join('=');
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[arg.slice(2).toLowerCase()] = argv[i + 1];
        i++;
      } else {
        args[arg.slice(2).toLowerCase()] = 'true';
      }
    }
  }
  return args;
}

/**
 * Resuelve y valida las opciones combinando argumentos CLI y variables de entorno
 */
export function resolveAdminOptions(
  overrides?: InitTenantAdminOptions,
  argv: string[] = process.argv.slice(2),
): { email: string; username: string; password: string; fullName: string } {
  const cliArgs = parseCommandLineArgs(argv);

  const email = (
    overrides?.email ||
    cliArgs['email'] ||
    process.env.TENANT_ADMIN_EMAIL ||
    ''
  ).trim();

  const username = (
    overrides?.username ||
    cliArgs['username'] ||
    process.env.TENANT_ADMIN_USERNAME ||
    ''
  ).trim();

  const password = (
    overrides?.password ||
    cliArgs['password'] ||
    process.env.TENANT_ADMIN_PASSWORD ||
    ''
  ).trim();

  const fullName = (
    overrides?.fullName ||
    cliArgs['fullname'] ||
    process.env.TENANT_ADMIN_FULLNAME ||
    'Administrador General'
  ).trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    throw new Error(
      'Parámetro requerido inválido o faltante: --email (o TENANT_ADMIN_EMAIL). Debe ser un correo electrónico válido.',
    );
  }

  if (!username || username.length < 3) {
    throw new Error(
      'Parámetro requerido inválido o faltante: --username (o TENANT_ADMIN_USERNAME). Debe tener al menos 3 caracteres.',
    );
  }

  if (!password || password.length < 8) {
    throw new Error(
      'Parámetro requerido inválido o faltante: --password (o TENANT_ADMIN_PASSWORD). Debe tener al menos 8 caracteres.',
    );
  }

  return { email, username, password, fullName };
}

/**
 * Función principal para inicializar el administrador del tenant
 */
export async function runInitTenantAdmin(
  options?: InitTenantAdminOptions,
  externalDataSource?: DataSource,
): Promise<{ created: boolean; adminId?: string; message: string }> {
  console.log(
    '🚀 [Tenant Bootstrap] Iniciando aprovisionamiento limpio del Administrador...',
  );

  const config = resolveAdminOptions(options);

  let dataSource = externalDataSource;
  let shouldClose = false;

  if (!dataSource) {
    const isLocal =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes('localhost') ||
      process.env.DATABASE_URL.includes('127.0.0.1');
    const enableSsl =
      process.env.DB_SSL === 'true' || (!isLocal && !!process.env.DATABASE_URL);
    const sslConfig = enableSsl ? { rejectUnauthorized: false } : false;

    dataSource = process.env.DATABASE_URL
      ? new DataSource({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: APP_ENTITIES,
          synchronize: false,
          ssl: sslConfig,
        })
      : new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'asistencia_db',
          entities: APP_ENTITIES,
          synchronize: false,
          ssl: sslConfig,
        });

    await dataSource.initialize();
    shouldClose = true;
    console.log('✅ Conexión con PostgreSQL establecida.');
  }

  try {
    const adminRepo = dataSource.getRepository(AdminUser);
    const logRepo = dataSource.getRepository(ActivityLog);

    // 1. Verificación de idempotencia (búsqueda por email o username insensible a mayúsculas)
    const existingAdmin = await adminRepo
      .createQueryBuilder('admin')
      .where(
        'LOWER(admin.email) = LOWER(:email) OR LOWER(admin.username) = LOWER(:username)',
        {
          email: config.email,
          username: config.username,
        },
      )
      .getOne();

    if (existingAdmin) {
      const msg = `ℹ️ [Tenant Bootstrap] El usuario administrador (${config.email} / ${config.username}) ya existe. Operación completada sin modificaciones (Idempotente).`;
      console.log(msg);
      return {
        created: false,
        adminId: existingAdmin.id,
        message: msg,
      };
    }

    // 2. Hasheo seguro de contraseña
    console.log('🔐 Hasheando contraseña de acceso con bcrypt (10 rounds)...');
    const passwordHash = await bcrypt.hash(config.password, 10);

    // 3. Inserción exclusiva del usuario administrador
    const newAdmin = adminRepo.create({
      username: config.username,
      email: config.email.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const savedAdmin = await adminRepo.save(newAdmin);
    console.log(
      `👤 Administrador creado exitosamente (ID: ${savedAdmin.id}, Username: ${savedAdmin.username}, Email: ${savedAdmin.email})`,
    );

    // 4. Registro de auditoría inicial en activity_logs
    const auditLog = logRepo.create({
      userIdentifier: savedAdmin.username,
      userRole: UserRole.ADMIN,
      action: ActivityAction.TENANT_BOOTSTRAP,
      entityAffected: 'admin_users',
      entityId: savedAdmin.id,
      newValue: {
        adminId: savedAdmin.id,
        email: savedAdmin.email,
        username: savedAdmin.username,
        fullName: config.fullName,
        bootstrappedAt: new Date().toISOString(),
      },
      ipAddress: '127.0.0.1',
    });

    await logRepo.save(auditLog);
    console.log('📝 Evento TENANT_BOOTSTRAP registrado en activity_logs.');

    console.log(
      '✨ [Tenant Bootstrap] Inicialización completada con éxito. Base de datos lista.',
    );

    return {
      created: true,
      adminId: savedAdmin.id,
      message: 'Administrador aprovisionado exitosamente.',
    };
  } finally {
    if (shouldClose && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexión con PostgreSQL cerrada.');
    }
  }
}

// Ejecución directa por CLI
if (require.main === module) {
  runInitTenantAdmin()
    .then((result) => {
      console.log(`[Exit 0] ${result.message}`);
      process.exit(0);
    })
    .catch((error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [Exit 1] Error en tenant bootstrap: ${msg}`);
      process.exit(1);
    });
}
