// @ts-expect-error It show "Cannot find @/routes/home module or its corresponding type declarations" but it's work fine
import { homeRoutes } from "@/routes/home";
import { serve } from "@hono/node-server";
import chalk from "chalk";
import { config } from "dotenv";
import { Hono } from "hono";
import { logger } from "hono/logger";
// @ts-expect-error Alias import error
import { auth } from "root/auth";
import { customLogger } from "./midlewares/custom-logger.js";

config();
const app = new Hono();
const apiUrl = process.env.API_URL || "http://localhost:3000";

app.use(logger(customLogger));

app.route("/api/v1/", homeRoutes);
app.on(["POST", "GET"], "/api/v1/auth/**", (c) => auth.handler(c.req.raw));
app.notFound((c) => {
    return c.text("Error: The route does not exist", 404);
});

serve(
    {
        fetch: app.fetch,
        port: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000,
    },
    (info) => {
        console.log(
            `[${chalk.green.bold("INFO")}] [${chalk.underline.blue(new Date().toISOString())}] Server is running on ${apiUrl}:${info.port}`,
        );
    },
);
