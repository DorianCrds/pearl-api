// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import {asyncHandler} from "../utils/asyncHandlers";
import {BadRequestError} from "../errors";
import {ENV} from "../config/env";

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const authController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!email || !password) throw new BadRequestError('Email and password required');

        const { accessToken, refreshToken, user } = await authService.login(
            email,
            password,
            req.ip,
            req.headers['user-agent']
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        res.status(200).json({
            message: 'Login successful',
            accessToken,
            user,
        });
    }),

    register: asyncHandler(async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Email and password are required');
        }

        const { accessToken, refreshToken, user } = await authService.register({
            email,
            password,
            name,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            user,
        });
    }),

    refresh: asyncHandler(async (req: Request, res: Response) => {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) throw new BadRequestError('No refresh token provided');

        const { accessToken, refreshToken: newToken } = await authService.refreshTokens(oldToken);

        res.cookie('refreshToken', newToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        res.status(200).json({
            message: 'Token refreshed',
            accessToken,
        });
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) await authService.logout(refreshToken);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    }),
};
