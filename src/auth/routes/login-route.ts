import { Hono } from "hono";
import {
    comparePassword,
    getUserAccountById,
    getUserByEmail,
} from "../services/login-service";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../services/register-service";
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
                success: false,
                message: "User registration failed!",
                errors: validation.error.errors,
            },
            400,
        );
    }

    const user = await getUserByEmail(email);

    if (!user) {
        return c.json(
            {
                success: false,
                message: "User not found",
                data: null,
            },
            404,
        );
    }
    const userAccount = await getUserAccountById(user[0].id);

    if (!userAccount) {
        return c.json(
            {
                success: false,
                message: "User account not found",
                data: null,
            },
            404,
        );
    }

    const isPasswordMatch = await comparePassword(
        password,
        userAccount[0].password ?? "",
    );

    if (!isPasswordMatch) {
        return c.json(
            {
                success: false,
                message: "Invalid password",
                data: null,
            },
            401,
        );
    }

    const accessToken = generateAccessToken(user[0].id);
    const refreshToken = generateRefreshToken(user[0].id);

    return c.json(
        {
            success: true,
            message: "Login successful",
            data: { ...user[0], accessToken, refreshToken },
        },
        200,
    );
});

export default LoginRouter;
