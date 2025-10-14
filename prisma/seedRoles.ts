// prisma/seedRoles.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedRoles() {
    try {
        // @ts-ignore
        const tableCheck = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Role'
      );
    `);

        if (!tableCheck[0]?.exists) {
            console.warn('⚠️ Table "Role" does not exist yet. Skipping seeding.');
            return;
        }

        const roles = ['ADMIN', 'USER'];
        for (const role of roles) {
            await prisma.role.upsert({
                where: { name: role },
                update: {},
                create: { name: role, description: `${role} role` },
            });
        }

        console.log('✅ Default roles ensured');
    } catch (error) {
        console.error('❌ Failed to seed roles:', error);
    } finally {
        await prisma.$disconnect();
    }
}
