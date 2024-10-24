import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
import createJWKSMock from 'mock-jwks';
import { User } from '../../entity/User';
import { Roles } from '../../constants';

describe('GET /auth/self', () => {
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
        it('should return 200 status', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it('should return user data', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };
            //Register user
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Generate token
            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(user.id);
        });
    });
});
