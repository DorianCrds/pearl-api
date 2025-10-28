// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import {asyncHandler} from "../utils/asyncHandlers";

export const authController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!email || !password) {
            const err = new Error('Email and password required');
            (err as any).status = 400;
            throw err;
        }

        const result = await authService.login(email, password, res, req.ip, req.headers['user-agent']);
        res.json({ message: 'Login successful', accessToken: result.accessToken, user: result.user });
    }),

    register: asyncHandler(async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        if (!email || !password) {
            const err = new Error('Email and password required');
            (err as any).status = 400;
            throw err;
        }

        const result = await authService.register({ email, password, name });
        res.status(201).json({
            message: 'User registered successfully',
            accessToken: result.accessToken,
            user: result.user,
        });
    }),

    refresh: asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            const err = new Error('No refresh token provided');
            (err as any).status = 400;
            throw err;
        }

        const result = await authService.refreshTokens(refreshToken, res);
        res.json({ message: 'Token refreshed', accessToken: result.accessToken });
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) await authService.logout(refreshToken);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    }),
};
