// src/index.ts
import express from 'express';
import { ENV } from './config/env';
// @ts-ignore
import { seedRoles } from '../prisma/seedRoles';
// @ts-ignore
import { seedUsers } from '../prisma/seedUsers';
import roleRoutes from "./routes/roleRoutes";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

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

app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
