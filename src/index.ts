import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";

config();
const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

serve(
    {
        fetch: app.fetch,
        port: process.env.API_PORT ? parseInt(process.env.API_PORT) : 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
