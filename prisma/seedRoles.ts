// prisma/seedRoles.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedRoles() {
    const roles = ['ADMIN', 'USER'];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role },
            update: {},
            create: { name: role, description: `${role} role` },
        });
    }
    console.log('✅ Default roles ensured');
}
