// src/errors/ForbiddenError.ts
import { HttpError } from "./HttpError";
export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden", details?: any) {
        super(message, 403, details);
    }
}
