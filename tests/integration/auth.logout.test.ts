// tests/integration/auth.logout.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { resetDatabase } from '../helpers/resetDatabase';
import bcrypt from 'bcrypt';

describe('POST /api/v1/auth/logout', () => {
    let refreshToken: string;

    beforeAll(async () => {
        await resetDatabase();

        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
        if (!consumerRole) throw new Error('Default role CONSUMER not found');

        const user = await prisma.user.create({
            data: {
                email: 'logoutuser@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Logout Test',
                roleId: consumerRole.id,
            },
        });

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: user.email, password: 'password123' });

        const rawCookies = loginRes.headers['set-cookie'];
        const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
        const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
        if (!refreshCookie) throw new Error('Refresh token cookie not found');

        refreshToken = refreshCookie.split('=')[1].split(';')[0];
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('Should logout successfully and revoke the refresh token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .send();

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logged out successfully');

        const tokenInDb = await prisma.refreshToken.findFirst({
            where: { revoked: true },
        });
        expect(tokenInDb).toBeDefined();
    });

    it('Should handle logout when no refresh token is provided gracefully', async () => {
        const res = await request(app).post('/api/v1/auth/logout').send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });
});
