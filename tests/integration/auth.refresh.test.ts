// tests/integration/auth.refresh.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
import { resetDatabase } from '../helpers/resetDatabase';

describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;
    let userId: number;

    beforeAll(async () => {
        await resetDatabase();

        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
        if (!consumerRole) throw new Error('Default role CONSUMER not found');

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'refreshuser@example.com',
                password: hashedPassword,
                name: 'Refresh Test',
                roleId: consumerRole.id,
            },
        });

        userId = user.id;

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: user.email, password: 'password123' });

        const rawCookies = loginRes.headers['set-cookie'];
        const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
        const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
        if (!refreshCookie) throw new Error('Refresh token cookie not found');

        const tokenPart = refreshCookie.split('=')[1]?.split(';')[0];
        if (!tokenPart) throw new Error('Could not extract refresh token');

        refreshToken = tokenPart;
    });

    afterAll(async () => {
        await prisma.$disconnect();
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
        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .send();

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
