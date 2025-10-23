// src/index.ts
import app from './app';
import { ENV } from './config/env';
// @ts-ignore
import { seedRoles } from '../prisma/seedRoles';
// @ts-ignore
import { seedUsers } from '../prisma/seedUsers';


(async () => {
    try {
        await seedRoles();
        await seedUsers();

        app.listen(ENV.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to seed database:', err);
        process.exit(1);
    }
})();
