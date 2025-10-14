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

        // JWT token generation
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role?.name,
            },
            ENV.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.name,
            },
        };
    },
};
