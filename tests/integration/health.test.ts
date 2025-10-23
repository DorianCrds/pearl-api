// tests/integration/health.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
    it('should return status ok and environment', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('environment');
    });
});