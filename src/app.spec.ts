import request from 'supertest';
import app from './app';

describe('Check for jest test', () => {
    // For Unit Testing

    it('addition check', () => {
        const answer = 1 + 1;
        expect(answer).toBe(2);
    });
});

describe('GET /', () => {
    // For Integration Testing (HTTP Calls/Requests) use supertest package

    it('should retun 200 status code', async () => {
        const response = await request(app).get('/').send();
        expect(response.statusCode).toBe(200);
    });
});
