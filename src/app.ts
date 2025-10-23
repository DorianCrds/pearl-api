// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', environment: ENV.NODE_ENV });
});

export default app;
