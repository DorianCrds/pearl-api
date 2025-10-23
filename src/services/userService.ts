// src/services/userService.ts
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export const userService = {
    async getAllUsers() {
        return prisma.user.findMany({
            include: { role: true },
            orderBy: { createdAt: 'desc' },
        });
    },

    async getUserById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
    },

    async createUser(data: { email: string; password: string; name?: string; roleId?: number }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    },

    async updateUser(
        id: number,
        data: Partial<{ email: string; password: string; name: string; roleId: number }>
    ) {
        const updateData = { ...data };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
        });
    },

    async deleteUser(id: number) {
        return prisma.user.delete({ where: { id } });
    },
};
