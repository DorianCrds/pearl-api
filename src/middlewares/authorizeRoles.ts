// src/middlewares/authorizeRoles.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!user.role) {
            return res.status(403).json({ message: 'Forbidden: no role assigned' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }

        next();
    };
};
