// src/controllers/roleController.ts
import { Request, Response } from 'express';
import { roleService } from '../services/roleService';

export const roleController = {
    getAllRoles: async (_req: Request, res: Response) => {
        const roles = await roleService.getAllRoles();
        res.json(roles);
    },

    getRoleById: async (req: Request, res: Response) => {
        // @ts-ignore
        const id = parseInt(req.params.id);
        const role = await roleService.getRoleById(id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    },

    createRole: async (req: Request, res: Response) => {
        const { name, description } = req.body;
        const role = await roleService.createRole({ name, description });
        res.status(201).json(role);
    },

    updateRole: async (req: Request, res: Response) => {
        // @ts-ignore
        const id = parseInt(req.params.id);
        const { name, description } = req.body;
        const role = await roleService.updateRole(id, { name, description });
        res.json(role);
    },

    deleteRole: async (req: Request, res: Response) => {
        // @ts-ignore
        const id = parseInt(req.params.id);
        await roleService.deleteRole(id);
        res.status(204).send();
    },
};
