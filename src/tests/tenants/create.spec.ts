import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
import { Tenant } from '../../entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminAccessToken: string; // accessToken

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        adminAccessToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN, // ONLY ADMINS CAN CREATE THE TENANTS
        });
    });

    afterEach(() => {
        jwks.stop(); // Stop the mock jwks server
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return 201 status code', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminAccessToken};`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it('should create tenant in the databse', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminAccessToken};`])
                .send(tenantData);

            const tenantRepo = connection.getRepository(Tenant);
            const tenants = await tenantRepo.find();

            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it('should return 403 if user is not an admin', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            const managerAccessToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerAccessToken};`])
                .send(tenantData);

            expect(response.statusCode).toBe(403);
        });
    });
});
