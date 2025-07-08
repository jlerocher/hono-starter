import {
    ApiError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "@/utils/errors";
import { Hono } from "hono";
import {
    comparePassword,
    getUserAccountById,
    getUserByEmail,
} from "../services/login-service";
import {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
} from "../services/register-service";
import { validateLogin } from "../validations/validation";

const LoginRouter = new Hono();

LoginRouter.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }

    const validation = validateLogin({ email, password });
    if (!validation.success) {
        throw new ValidationError(
            validation.error.errors,
            "User registration failed!",
        );
    }

    const user = await getUserByEmail(email);

    if (!user) {
        throw new NotFoundError("User not found");
    }
    const userAccount = await getUserAccountById(user[0].id);

    if (!userAccount) {
        throw new NotFoundError("User account not found");
    }

    const isPasswordMatch = await comparePassword(
        password,
        userAccount[0].password ?? "",
    );

    if (!isPasswordMatch) {
        throw new UnauthorizedError("Invalid password");
    }

    const accessToken = await generateAccessToken(user[0].id);
    const refreshToken = await generateRefreshToken(user[0].id);
    if (refreshToken instanceof Error) {
        throw new ApiError("Failed to generate refresh token", 500);
    }
    await saveRefreshToken(user[0].id, refreshToken);

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
