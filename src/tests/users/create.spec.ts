import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
import createJWKSMock from 'mock-jwks';
import { User } from '../../entity/User';
import { Roles } from '../../constants';
import { createTenant } from '../utils';
import { Tenant } from '../../entity/Tenant';

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start(); // Start the mock jwks server
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop(); // Stop the mock jwks server
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should persist user in the database', async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));

            const adminAccessToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN, // ONLY ADMINS CAN CREATE THE TENANTS
            });

            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminAccessToken};`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
            expect(users[0].email).toBe(userData.email);
        });

        it.todo('should return 403 if non admin user tries to create a user');
    });
});
