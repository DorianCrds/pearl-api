// tests/integration/auth.login.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
import { resetDatabase } from '../helpers/resetDatabase';

beforeEach(async () => {
    await resetDatabase();

    const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
    if (!consumerRole) throw new Error('Role CONSUMER not found for tests');

    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    await prisma.user.create({
        data: {
            email: 'loginuser@example.com',
            password: hashedPassword,
            name: 'Login Test User',
            roleId: consumerRole.id,
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'loginuser@example.com',
                password: 'TestPassword123!',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('loginuser@example.com');

        const rawCookies = res.headers['set-cookie'];
        const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
        const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
        expect(refreshCookie).toBeDefined();
    });

    it('should return 401 with invalid email', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'TestPassword123!',
            });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 with invalid password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'loginuser@example.com',
                password: 'WrongPassword',
            });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 if email or password is missing', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'loginuser@example.com',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email and password required');
    });
});
