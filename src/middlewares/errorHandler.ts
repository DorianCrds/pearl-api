// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import {HttpError} from "../errors";
import {ENV} from "../config/env";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌", err);

    if (err instanceof HttpError) {
        return res.status(err.status).json({
            status: "error",
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    const status = 500;
    const message =
        ENV.NODE_ENV === "production"
            ? "Internal server error"
            : err.message || "Unknown error";

    res.status(status).json({
        status: "error",
        message,
    });
};
