// src/errors/NotFoundError.ts
import { HttpError } from "./HttpError";
export class NotFoundError extends HttpError {
    constructor(message = "Not Found", details?: any) {
        super(message, 404, details);
    }
}
