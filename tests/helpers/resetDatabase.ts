// tests/helpers/resetDatabase.ts
import { prisma } from '../../src/lib/prisma';


export async function resetDatabase() {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    const existingRoles = await prisma.role.findMany();
    const requiredRoles = ['ADMIN', 'USER', 'CONSUMER'];

    for (const roleName of requiredRoles) {
        if (!existingRoles.some(r => r.name === roleName)) {
            await prisma.role.create({ data: { name: roleName } });
        }
    }
}
