// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

            const result = await authService.login(email, password, res, req.ip, req.headers['user-agent']);
            res.json({ message: 'Login successful', accessToken: result.accessToken, user: result.user });
        } catch (error: any) {
            res.status(401).json({ message: error.message || 'Unauthorized' });
        }
    },

    async register(req: Request, res: Response) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

            const result = await authService.register({ email, password, name });
            res.status(201).json({
                message: 'User registered successfully',
                accessToken: result.accessToken,
                user: result.user,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },

    async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

            const result = await authService.refreshTokens(refreshToken, res);
            res.json({ message: 'Token refreshed', accessToken: result.accessToken });
        } catch (error: any) {
            res.status(403).json({ message: error.message || 'Invalid refresh token' });
        }
    },

    async logout(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) await authService.logout(refreshToken);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Error during logout' });
        }
    },
};
