import {
  parseCommandLineArgs,
  resolveAdminOptions,
  runInitTenantAdmin,
} from './init-tenant-admin';
import { DataSource } from 'typeorm';
import { AdminUser, ActivityLog } from '../entities';
import { UserRole, ActivityAction } from '../../common/enums';
import * as bcrypt from 'bcrypt';

describe('InitTenantAdmin', () => {
  describe('parseCommandLineArgs', () => {
    it('debe parsear argumentos en formato --key=value', () => {
      const args = parseCommandLineArgs([
        '--email=admin@test.com',
        '--username=admintest',
        '--password=Secret123!',
      ]);
      expect(args.email).toBe('admin@test.com');
      expect(args.username).toBe('admintest');
      expect(args.password).toBe('Secret123!');
    });

    it('debe parsear argumentos en formato --key value', () => {
      const args = parseCommandLineArgs([
        '--email',
        'admin@test.com',
        '--username',
        'admintest',
        '--password',
        'Secret123!',
      ]);
      expect(args.email).toBe('admin@test.com');
      expect(args.username).toBe('admintest');
      expect(args.password).toBe('Secret123!');
    });
  });

  describe('resolveAdminOptions', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      delete process.env.TENANT_ADMIN_EMAIL;
      delete process.env.TENANT_ADMIN_USERNAME;
      delete process.env.TENANT_ADMIN_PASSWORD;
      delete process.env.TENANT_ADMIN_FULLNAME;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('debe lanzar error si no se provee un email valido', () => {
      expect(() =>
        resolveAdminOptions({ username: 'admin', password: 'password123' }, []),
      ).toThrow('Parámetro requerido inválido o faltante: --email');

      expect(() =>
        resolveAdminOptions(
          {
            email: 'correo-invalido',
            username: 'admin',
            password: 'password123',
          },
          [],
        ),
      ).toThrow('Parámetro requerido inválido o faltante: --email');
    });

    it('debe lanzar error si username tiene menos de 3 caracteres', () => {
      expect(() =>
        resolveAdminOptions(
          { email: 'admin@test.com', username: 'ab', password: 'password123' },
          [],
        ),
      ).toThrow('Parámetro requerido inválido o faltante: --username');
    });

    it('debe lanzar error si password tiene menos de 8 caracteres', () => {
      expect(() =>
        resolveAdminOptions(
          { email: 'admin@test.com', username: 'admin', password: '123' },
          [],
        ),
      ).toThrow('Parámetro requerido inválido o faltante: --password');
    });

    it('debe resolver parametros desde variables de entorno cuando no hay CLI args', () => {
      process.env.TENANT_ADMIN_EMAIL = 'env@test.com';
      process.env.TENANT_ADMIN_USERNAME = 'envadmin';
      process.env.TENANT_ADMIN_PASSWORD = 'EnvPassword123!';
      process.env.TENANT_ADMIN_FULLNAME = 'Coordinador General';

      const resolved = resolveAdminOptions(undefined, []);
      expect(resolved.email).toBe('env@test.com');
      expect(resolved.username).toBe('envadmin');
      expect(resolved.password).toBe('EnvPassword123!');
      expect(resolved.fullName).toBe('Coordinador General');
    });

    it('debe asignar fullName por defecto si se omite', () => {
      const resolved = resolveAdminOptions(
        {
          email: 'admin@test.com',
          username: 'adminuser',
          password: 'ValidPassword123!',
        },
        [],
      );
      expect(resolved.fullName).toBe('Administrador General');
    });
  });

  describe('runInitTenantAdmin (Idempotencia y Persistencia)', () => {
    let mockDataSource: Partial<DataSource>;
    let mockAdminRepo: any;
    let mockLogRepo: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };

      mockAdminRepo = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        create: jest
          .fn()
          .mockImplementation((data) => ({ id: 'new-uuid', ...data })),
        save: jest
          .fn()
          .mockImplementation((data) =>
            Promise.resolve({ ...data, id: 'saved-uuid' }),
          ),
      };

      mockLogRepo = {
        create: jest
          .fn()
          .mockImplementation((data) => ({ id: 'log-uuid', ...data })),
        save: jest
          .fn()
          .mockImplementation((data) =>
            Promise.resolve({ ...data, id: 'log-saved-uuid' }),
          ),
      };

      mockDataSource = {
        isInitialized: true,
        destroy: jest.fn().mockResolvedValue(undefined),
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity === AdminUser) return mockAdminRepo;
          if (entity === ActivityLog) return mockLogRepo;
          return null;
        }),
      };
    });

    it('debe crear el usuario administrador y auditar el evento si no existe previamente', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await runInitTenantAdmin(
        {
          email: 'admin@tenant.edu',
          username: 'admin_tenant',
          password: 'SuperSecret2026!',
          fullName: 'Prof. Juan Pérez',
        },
        mockDataSource as DataSource,
      );

      expect(result.created).toBe(true);
      expect(result.adminId).toBe('saved-uuid');
      expect(mockAdminRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'admin_tenant',
          email: 'admin@tenant.edu',
          role: UserRole.ADMIN,
          isActive: true,
        }),
      );

      // Verificar que la clave se hasheo con bcrypt
      const createdCall = mockAdminRepo.create.mock.calls[0][0];
      expect(createdCall.passwordHash).toBeDefined();
      expect(createdCall.passwordHash).not.toBe('SuperSecret2026!');
      const isMatch = await bcrypt.compare(
        'SuperSecret2026!',
        createdCall.passwordHash,
      );
      expect(isMatch).toBe(true);

      // Verificar registro de auditoría
      expect(mockLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userIdentifier: 'admin_tenant',
          userRole: UserRole.ADMIN,
          action: ActivityAction.TENANT_BOOTSTRAP,
          entityAffected: 'admin_users',
        }),
      );
      expect(mockLogRepo.save).toHaveBeenCalled();
    });

    it('debe ser IDEMPOTENTE: no duplicar ni lanzar error si el admin ya existe', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 'existing-admin-id',
        username: 'admin_tenant',
        email: 'admin@tenant.edu',
        role: UserRole.ADMIN,
        isActive: true,
      });

      const result = await runInitTenantAdmin(
        {
          email: 'admin@tenant.edu',
          username: 'admin_tenant',
          password: 'SuperSecret2026!',
        },
        mockDataSource as DataSource,
      );

      expect(result.created).toBe(false);
      expect(result.adminId).toBe('existing-admin-id');
      expect(mockAdminRepo.create).not.toHaveBeenCalled();
      expect(mockAdminRepo.save).not.toHaveBeenCalled();
      expect(mockLogRepo.save).not.toHaveBeenCalled();
    });
  });
});
