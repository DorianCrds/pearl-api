// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'Full access to all resources' },
    });

    await prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: { name: 'USER', description: 'Standard user with limited permissions' },
    });

    console.log('✅ Default roles seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
