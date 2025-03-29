// @ts-expect-error It show "Cannot find @/routes/home module or its corresponding type declarations" but it's work fine
import { homeRoutes } from "@/routes/home";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";

config();
const app = new Hono();

app.route("/api/v1", homeRoutes);

serve(
    {
        fetch: app.fetch,
        port: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
