// src/validators/userValidator.ts
import { z } from "zod";

export const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string().min(2).max(50).optional(),
    roleId: z.number().int().positive().optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
