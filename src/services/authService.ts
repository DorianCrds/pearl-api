// src/services/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';
import { Response } from 'express';

const prisma = new PrismaClient();

const ACCESS_TOKEN_EXPIRES_IN = ENV.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

function generateAccessToken(user: { id: number; email: string; role?: string }) {
    // @ts-ignore
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
}

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

async function storeRefreshToken(userId: number, token: string, ip?: string, userAgent?: string) {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    return prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
            ipAddress: ip,
            userAgent,
        },
    });
}

async function findRefreshToken(rawToken: string) {
    const allTokens = await prisma.refreshToken.findMany({ where: { revoked: false } });
    for (const dbToken of allTokens) {
        const match = await bcrypt.compare(rawToken, dbToken.tokenHash);
        if (match) return dbToken;
    }
    return null;
}

export const authService = {
    async register(data: { email: string; password: string; name?: string }) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
        if (!consumerRole) throw new Error('Default role CONSUMER not found');

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                roleId: consumerRole.id,
            },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken, user };
    },

    async login(email: string, password: string, res: Response, ip?: string, userAgent?: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role?.name,
        });
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken, ip, userAgent);

        // HttpOnly cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        });

        return { accessToken, user: { id: user.id, email: user.email, role: user.role?.name } };
    },

    async refreshTokens(oldToken: string, res: Response) {
        const storedToken = await findRefreshToken(oldToken);
        if (!storedToken) throw new Error('Invalid refresh token');
        if (storedToken.revoked || new Date() > storedToken.expiresAt)
            throw new Error('Token expired or revoked');

        // Rotate
        const newRefresh = generateRefreshToken();
        const newHash = await bcrypt.hash(newRefresh, 10);
        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                    replacedByToken: newHash,
                },
            }),
            prisma.refreshToken.create({
                data: {
                    userId: storedToken.userId,
                    tokenHash: newHash,
                    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
                },
            }),
        ]);

        const user = await prisma.user.findUnique({ where: { id: storedToken.userId }, include: { role: true } });
        if (!user) throw new Error('User not found');

        const newAccessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role?.name,
        });

        res.cookie('refreshToken', newRefresh, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        });

        return { accessToken: newAccessToken };
    },

    async logout(refreshToken: string) {
        const storedToken = await findRefreshToken(refreshToken);
        if (storedToken) {
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revoked: true, revokedAt: new Date() },
            });
        }
    },
};
