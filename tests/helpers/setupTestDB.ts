// tests/helpers/setupTestDB.ts
import { seedRoles } from '../../prisma/seedRoles';
import { seedUsers } from '../../prisma/seedUsers';

export default async function globalSetup() {
    await seedRoles();
    await seedUsers();
}
