import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.get("/", (c) => {
    return c.json({
        message: "Hello from auth",
    });
});

export { authRoutes };
