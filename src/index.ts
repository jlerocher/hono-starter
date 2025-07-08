import { refreshTokenRouter } from "@/auth/routes/refresh-token-route";
import { registerRouter } from "@/auth/routes/register-route";
import { env } from "@/config";
import { logger } from "@/utils/logger";
import { type Context, Hono } from "hono";
import { logger as pinoLogger } from "hono-pino";
import { rateLimiter } from "hono-rate-limiter";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import { randomUUID } from "node:crypto";
import LoginRouter from "./auth/routes/login-route";

import { errorHandler } from "@/utils/error-handler";
const API_PORT = env.API_PORT;
const app = new Hono().basePath("/api/v1");

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: "draft-6",
    keyGenerator: (c: Context) =>
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        c.req.header("client-ip") ||
        c.req.header("x-client-ip") ||
        c.req.header("x-cluster-client-ip") ||
        c.req.header("forwarded-for") ||
        c.req.header("forwarded") ||
        c.req.header("via") ||
        c.req.header("x-forwarded") ||
        c.req.header("x-real-ip") ||
        c.req.header("x-forwarded-for") ||
        c.req.header("x-proxy-user-ip") ||
        "127.0.0.1",
});

app.use(limiter);
app.use(errorHandler);
app.use(
    pinoLogger({
        logger: logger,
    }),
);
app.use(async (c, next) => {
    const correlationId = c.req.header("X-Correlation-ID") || randomUUID();
    c.set("correlationId", correlationId);
    await next();
});
app.use(secureHeaders());
app.use(csrf());

// Auth routes
app.route("/auth", registerRouter);
app.route("/auth", refreshTokenRouter);
app.route("/auth", LoginRouter);

export default app;
