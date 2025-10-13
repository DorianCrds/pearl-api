// src/middlewares/authMiddleware.ts
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {ENV} from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        // @ts-ignore
        (req as any).user = jwt.verify(token, ENV.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
