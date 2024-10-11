import request from 'supertest';
import app from '../../app';
import { AppDataSource } from '../../config/data-source';
import { DataSource } from 'typeorm';
// import { truncateTables } from '../utils';
import { User } from '../../entity/User';
import { Roles } from '../../constants';

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
            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
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
    });

    describe('Fields are missing', () => {});
});
