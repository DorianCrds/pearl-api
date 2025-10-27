// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import roleRoutes from "./routes/roleRoutes";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import {errorHandler} from "./middlewares/errorHandler";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

// Health check
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

export default app;
