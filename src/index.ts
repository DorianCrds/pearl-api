// src/index.ts
import express from 'express';
import { ENV } from './config/env';
// @ts-ignore
import { seedRoles } from '../prisma/seedRoles'
import roleRoutes from "./routes/roleRoutes";

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

// Seed roles before starting server
seedRoles()
    .then(() => {
        app.listen(ENV.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to seed roles:', err);
        process.exit(1);
    });

app.use('/api/v1/roles', roleRoutes);
