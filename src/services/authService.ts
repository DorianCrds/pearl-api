// src/services/authService.ts
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';
import {BadRequestError, NotFoundError, UnauthorizedError} from "../errors";

const ACCESS_TOKEN_EXPIRES_IN = ENV.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

function generateAccessToken(user: { id: number; email: string; role?: string }) {
    if (!ENV.JWT_EXPIRES_IN) throw new Error("JWT_SECRET is not defined");

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const options: jwt.SignOptions = {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
    };

    return jwt.sign(payload, ENV.JWT_SECRET as jwt.Secret, options);
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
            ipAddress: ip ?? null,
            userAgent: userAgent ?? null,
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
        if (existingUser) throw new BadRequestError('User already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });
        if (!consumerRole) throw new NotFoundError('Default role CONSUMER not found');

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name ?? null,
                roleId: consumerRole.id,
            },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken, user };
    },

    async login(email: string, password: string, ip?: string, userAgent?: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) throw new UnauthorizedError('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedError('Invalid credentials');

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            ...(user.role?.name ? { role: user.role.name } : {}),
        });

        const refreshToken = generateRefreshToken();
        await storeRefreshToken(user.id, refreshToken, ip, userAgent);

        return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role?.name } };
    },

    async refreshTokens(oldToken: string) {
        const storedToken = await findRefreshToken(oldToken);
        if (!storedToken) throw new UnauthorizedError('Invalid refresh token');
        if (storedToken.revoked || new Date() > storedToken.expiresAt)
            throw new UnauthorizedError('Token expired or revoked');

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
        if (!user) throw new NotFoundError('User not found');

        const newAccessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            ...(user.role?.name ? { role: user.role.name } : {}),
        });

        return { accessToken: newAccessToken, refreshToken: newRefresh };
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
