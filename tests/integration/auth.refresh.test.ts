// tests/integration/auth.refresh.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();

        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
        const user = await prisma.user.create({
            data: {
                email: 'refreshuser@example.com',
                password: await import('bcrypt').then(bcrypt => bcrypt.hash('password123', 10)),
                name: 'Refresh Test',
                roleId: consumerRole?.id ||null,
            },
        });

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: user.email, password: 'password123' });

        const rawCookies = loginRes.headers['set-cookie'];
        const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
        const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
        expect(refreshCookie).toBeDefined();

        refreshToken = refreshCookie!.split('=')[1].split(';')[0];
    });

    it('Should refresh tokens successfully with a valid refresh token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .send();

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Token refreshed');
        expect(res.body).toHaveProperty('accessToken');
    });

    it('Should return 401 if no refresh token is provided', async () => {
        const res = await request(app).post('/api/v1/auth/refresh').send();
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'No refresh token provided');
    });

    it('Should return 403 if refresh token is invalid', async () => {
        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', [`refreshToken=invalidtoken`])
            .send();

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/invalid/i);
    });
});
