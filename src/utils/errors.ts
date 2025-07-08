export class ApiError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends ApiError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

export class ValidationError extends ApiError {
    public readonly errors: unknown;

    constructor(errors: unknown, message = "Validation Error") {
        super(message, 400);
        this.errors = errors;
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
