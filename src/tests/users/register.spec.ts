import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
// import { truncateTables } from '../utils';
import { User } from '../../entity/User';
import { Roles } from '../../constants';
import { isJWT } from '../utils';
import { RefreshToken } from '../../entity/RefreshToken';
import { Config } from '../../config';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // TRUNCATE TABLES
        // await truncateTables(connection);
        // HERE THE PROBLEM WITH truncateTables is that, If we add new column in the db
        // it wont get synchronized hence we drop the db and synchronzie the db
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return 201 status', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
        });

        it('should return json response', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
            expect(users[0].password).not.toBe(userData.password);
        });

        it('should assign a role', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // expect(users[0]).toHaveProperty('role');
            // expect(users[0].role).toBe('customer');

            expect(users[0]).toHaveProperty('role', Roles.CUSTOMER);
        });

        it('should store the hashed password in the DB', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({ select: ['password'] });

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60); // WE NEED THIS AND BELOW AS WELL BECAUSE SOMETIMES ABOVE ASSERTION COULD BE PASSED THOGUH IF WE DONT HAVE PASSWORD FIELD FROM THE USER OBJECT.
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email is already present', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            // BELOW APPROACH MAKES SURE THAT THERE EXISTS A RECORD WITH ABOVE USER DATA
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // NOW WE ARE TRYING TO REGISTER THE USER WITH SAME EMAIL - SHOULD RETURN 400

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);

            // ALSO ABOVE USER SENT THROUGH THE REGISTER REQUEST SHOULD NOT BE STORED

            const users = await userRepository.find();

            expect(users).toHaveLength(1);
        });

        it('should return access token and refresh token inside a cookie', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            interface Headers {
                ['set-cookie']?: string[];
            }

            const cookies = (response.headers as Headers)['set-cookie'] || [];

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it('should store refresh token in DB', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: 'hemanthvhs@gmail.com',
                password: 'test',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();

            // expect(refreshTokens).toHaveLength(1);

            // Better way of checking hence commented above

            // Here we have aliased the table as refreshToken
            // We are checking if there exists a record with refreshToken.userId = response.body.id
            // :userId is a placeholder, we are actually passing userId to where in the options {userId:...}
            // If refresh token for a particular userid persisted in DB, then we will get a token
            // Then assert that it should have length of 1 (1 token)

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: '',
                password: 'test',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.status).toBe(400);

            // ALSO ABOVE USER SENT THROUGH THE REGISTER REQUEST SHOULD NOT BE STORED

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it.todo('should return 400 status code if firstname is missing');
        it.todo('should return 400 status code if lastname is missing');
        it.todo('should return 400 status code if password is missing');
    });

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            const userData = {
                firstName: 'Hemanth',
                lastName: 'V',
                email: ' hemanthvhs@gmail.com ',
                password: 'test',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].email).toBe('hemanthvhs@gmail.com');
        });

        it.todo('should return 400 status code if email is not a valid email');
        it.todo(
            'should return 400 status code if password length is < 4 characters',
        );
    });
});
