import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { generateNewTokens } from "../services/refresh-token-service";

const refreshTokenRouter = new Hono();

refreshTokenRouter.post("/refresh-token", async (c) => {
    const body = await c.req.json();
    const oldRefreshToken = body.refreshToken || getCookie(c, "refreshToken");
    const userId = body.userId || getCookie(c, "userId");

    if (!oldRefreshToken || !userId) {
        return c.json(
            {
                success: false,
                message: "Invalid request | Missing tokens and user id",
                data: null,
            },
            400,
        );
    }

    const { accessToken, refreshToken } = await generateNewTokens(
        oldRefreshToken,
        userId,
    );

    if (!accessToken || !refreshToken) {
        return c.json(
            {
                success: false,
                message: "Failed to generate tokens | Please try again",
                data: null,
            },
            500,
        );
    }

    return c.json(
        {
            success: true,
            message: "Tokens refreshed successfully",
            data: { accessToken, refreshToken },
        },
        200,
        {
            "Set-Cookie": [
                `accessToken=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                `userId=${userId}; Path=/; HttpOnly; Secure; SameSite=Strict`,
            ],
        },
    );
});

export { refreshTokenRouter };
