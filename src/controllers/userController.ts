// src/controllers/userController.ts
import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
    async getAllUsers(req: Request, res: Response) {
        const users = await userService.getAllUsers();
        res.json(users);
    },

    async getUserById(req: Request, res: Response) {
        const id = Number(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    },

    async createUser(req: Request, res: Response) {
        try {
            const { email, password, name, roleId } = req.body;
            const newUser = await userService.createUser({ email, password, name, roleId });
            res.status(201).json(newUser);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    },

    async updateUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const updated = await userService.updateUser(id, req.body);
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    },

    async deleteUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await userService.deleteUser(id);
            res.status(204).send();
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    },
};
