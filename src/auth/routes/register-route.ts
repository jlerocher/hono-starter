import { Hono } from "hono";
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
        return c.json(
            {
                message: "User registration failed!",
                errors: validation.error.errors,
            },
            400,
        );
    }

    return c.json({
        message: `User ${email} registered successfully!`,
        data: validation,
    });
});

export { registerRouter };
