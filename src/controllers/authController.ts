// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const result = await authService.login(email, password);

            res.json({
                message: 'Login successful',
                ...result,
            });
        } catch (error: any) {
            res.status(401).json({ message: error.message || 'Unauthorized' });
        }
    },
};
