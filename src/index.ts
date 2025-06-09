import { refreshTokenRouter } from "@/auth/routes/refresh-token-route";
import { registerRouter } from "@/auth/routes/register-route";
import { Hono } from "hono";
import { logger } from "hono/logger";

const API_PORT = Bun.env.API_PORT || 3000;
const app = new Hono().basePath("/api/v1");
app.use(logger());

// Auth routes
app.route("/auth", registerRouter);
app.route("/auth", refreshTokenRouter);

export default {
    port: API_PORT,
    fetch: app.fetch,
};
