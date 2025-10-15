// prisma/seedUsers.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
    try {
        const tableCheck = await prisma.$queryRawUnsafe(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = 'User'
            );
        `) as { exists: boolean }[];

        if (!tableCheck[0]?.exists) {
            console.warn('⚠️ Table "User" does not exist encore. Skipping seeding.');
            return;
        }

        const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
        const consumerRole = await prisma.role.findUnique({ where: { name: 'CONSUMER' } });

        if (!adminRole || !userRole || !consumerRole) {
            console.warn('⚠️ Some roles are missing. Run seedRoles() first.');
            return;
        }

        const hashedPassword = await bcrypt.hash('test1234', 10);

        const defaultUsers = [
            {
                email: 'admin@example.com',
                name: 'Admin User',
                password: hashedPassword,
                roleId: adminRole.id,
            },
            {
                email: 'user@example.com',
                name: 'Standard User',
                password: hashedPassword,
                roleId: userRole.id,
            },
            {
                email: 'consumer@example.com',
                name: 'Consumer User',
                password: hashedPassword,
                roleId: consumerRole.id,
            },
        ];

        for (const user of defaultUsers) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {},
                create: user,
            });
        }

        console.log('✅ Default users ensured');
    } catch (error) {
        console.error('❌ Failed to seed users:', error);
    } finally {
        await prisma.$disconnect();
    }
}
