// src/services/userServices.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
        return prisma.user.create({ data });
    },

    async updateUser(id: number, data: Partial<{ email: string; password: string; name: string; roleId: number }>) {
        return prisma.user.update({
            where: { id },
            data,
        });
    },

    async deleteUser(id: number) {
        return prisma.user.delete({ where: { id } });
    },
};
