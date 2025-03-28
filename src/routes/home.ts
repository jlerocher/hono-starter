import { Hono } from "hono";

const homeRoutes = new Hono();

homeRoutes.get("/", (c) => {
    return c.text("Hello Hono!");
});

export { homeRoutes };
