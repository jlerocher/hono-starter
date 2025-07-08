import type { Context, Next } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { ApiError, ValidationError } from "./errors";

export const errorHandler = async (c: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        if (err instanceof ApiError) {
            let errors: unknown = undefined;
            if (err instanceof ValidationError) {
                errors = err.errors;
            }
            c.status(err.statusCode as StatusCode);
            return c.json({
                success: false,
                message: err.message,
                errors: errors,
            });
        }

        // Log the error for debugging purposes
        console.error(err);

        return c.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            500,
        );
    }
};
