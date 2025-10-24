// tests/integration/auth.register.test.ts
import { prisma } from "../../src/lib/prisma";
import request from "supertest";
import app from "../../src/app";
import { resetDatabase } from "../helpers/resetDatabase";

describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('Should register a new user successfully', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'testuser@example.com',
            password: 'Password123!',
            name: 'Test User',
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe('testuser@example.com');
    });

    it('Should not register a user with an existing email', async () => {
        await request(app).post('/api/v1/auth/register').send({
            email: 'testuser@example.com',
            password: 'Password123!',
            name: 'Test User',
        });

        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'testuser@example.com',
            password: 'Password123!',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already exists/i);
    });

    it('Should return 400 if email or password is missing', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'missing@example.com',
        });

        expect(res.status).toBe(400);
    });
});
