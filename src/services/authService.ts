// src/services/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

const prisma = new PrismaClient();

export const authService = {
    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // @ts-ignore
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role?.name },
            ENV.JWT_SECRET,
            { expiresIn: ENV.JWT_EXPIRES_IN }
        );

        return {
            token,
            user: { id: user.id, email: user.email, role: user.role?.name },
        };
    },

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

        // @ts-ignore
        const token = jwt.sign(
            { id: user.id, email: user.email, role: consumerRole.name },
            ENV.JWT_SECRET,
            { expiresIn: ENV.JWT_EXPIRES_IN }
        );

        return { token, user: { id: user.id, email: user.email, role: consumerRole.name } };
    },
};
