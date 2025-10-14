// src/middlewares/authMiddleware.ts
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {ENV} from '../config/env';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // @ts-ignore
        req.user = jwt.verify(token, ENV.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
