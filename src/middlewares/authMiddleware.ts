// src/middlewares/authMiddleware.ts
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {ENV} from '../config/env';

interface JwtPayload {
    id: number;
    email: string;
    role?: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        req.user = jwt.verify(token, ENV.JWT_SECRET) as unknown as JwtPayload;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

