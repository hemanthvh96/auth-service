import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
import { Tenant } from '../../entity/Tenant';

describe('POST /tenants', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
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
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });

        it('should create tenant in the databse', async () => {
            const tenantData = {
                name: 'Tenant Name',
                address: 'Tenant Address',
            };

            await request(app).post('/tenants').send(tenantData);

            const tenantRepo = connection.getRepository(Tenant);
            const tenants = await tenantRepo.find();

            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
