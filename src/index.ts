// @ts-expect-error It show "Cannot find @/routes/auth module or its corresponding type declarations" but it's work fine
import { authRoutes } from "@/routes/auth";
// @ts-expect-error It show "Cannot find @/routes/home module or its corresponding type declarations" but it's work fine
import { homeRoutes } from "@/routes/home";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { logger } from "hono/logger";

config();
const app = new Hono();
const apiUrl = process.env.API_URL || "http://localhost:3000";

app.use(logger());

app.route("/api/v1/", homeRoutes);
app.route("/api/v1/auth/", authRoutes);

serve(
    {
        fetch: app.fetch,
        port: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000,
    },
    (info) => {
        console.log(`Server is running on ${apiUrl}${info.port}`);
    },
);
