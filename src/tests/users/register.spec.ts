import request from 'supertest';
import app from '../../app';

describe('POST /auth/register', () => {
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
    });

    describe('Fields are missing', () => {});
});
