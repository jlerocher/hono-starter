import { Hono } from "hono";
import { prisma } from "prisma/prisma-client";
import { validateLogin } from "../validations/validation";

const LoginRouter = new Hono();

LoginRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        return c.json(
            {
                success: false,
                message: "Email and password are required",
                data: null,
            },
            400,
        );
    }

    const validation = validateLogin({ email, password });
    if (!validation.success) {
        return c.json(
            {
                message: "User registration failed!",
                errors: validation.error.errors,
            },
            400,
        );
    }

    const user = await prisma.user.findUnique({
        where: email,
    });

    return c.json({
        success: true,
        message: "Login successful",
        data: { email, password },
    });
});

export default LoginRouter;
