// src/errors/BadRequestError.ts
import { HttpError } from "./HttpError";
export class BadRequestError extends HttpError {
    constructor(message = "Bad Request", details?: any) {
        super(message, 400, details);
    }
}
