// src/validators/authValidator.ts
import { z } from "zod";

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
