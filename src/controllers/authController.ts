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
            res.json({ message: 'Login successful', ...result });
        } catch (error: any) {
            res.status(401).json({ message: error.message || 'Unauthorized' });
        }
    },

    async register(req: Request, res: Response) {
        try {
            const { email, password, name, roleId } = req.body;
            if (!email || !password || !roleId) {
                return res.status(400).json({ message: 'Email, password, and roleId are required' });
            }

            const result = await authService.register({ email, password, name, roleId });
            res.status(201).json({ message: 'User registered successfully', ...result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    },
};
