import { ApiError, ValidationError } from "@/utils/errors";
import { Hono } from "hono";
import { registerNewUser } from "../services/register-service";
import { validateRegister } from "../validations/validation";

const registerRouter = new Hono();

registerRouter.post("/register", async (c) => {
    const { name, email, password, passwordConfirmation } = await c.req.json();
    const validation = validateRegister({
        name,
        email,
        password,
        passwordConfirmation,
    });

    if (!validation.success) {
        throw new ValidationError(
            validation.error.errors,
            "User registration failed!",
        );
    }

    const newUser = await registerNewUser(name, email, password);
    if (!newUser.success) {
        throw new ApiError(newUser.message, 400);
    }

    if (!newUser.data) {
        throw new ApiError("Registration failed - no data returned", 500);
    }

    return c.json(
        {
            message: `User ${email} registered successfully!`,
            data: newUser.data,
        },
        201,
        {
            "Set-Cookie": [
                `accessToken=${newUser.data.accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                `refreshToken=${newUser.data.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                `userId=${newUser.data.newUser.id}; Path=/; HttpOnly; Secure; SameSite=Strict`,
            ],
        },
    );
});

export { registerRouter };
