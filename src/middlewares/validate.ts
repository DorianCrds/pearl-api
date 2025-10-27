// src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
    <T extends z.ZodTypeAny>(schema: T) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const errors = result.error.issues.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));

                return res.status(400).json({ errors });
            }

            req.body = result.data as z.infer<T>;
            next();
        };
