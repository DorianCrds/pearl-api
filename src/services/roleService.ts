// src/services/roleService.ts
import { prisma } from '../lib/prisma';

export const roleService = {
    getAllRoles: async () => {
        return prisma.role.findMany();
    },

    getRoleById: async (id: number) => {
        return prisma.role.findUnique({ where: { id } });
    },

    createRole: async (data: { name: string; description?: string }) => {
        return prisma.role.create({ data });
    },

    updateRole: async (id: number, data: { name?: string; description?: string }) => {
        return prisma.role.update({ where: { id }, data });
    },

    deleteRole: async (id: number) => {
        return prisma.role.delete({ where: { id } });
    },
};
