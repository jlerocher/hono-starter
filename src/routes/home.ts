import { Hono } from "hono";

const homeRoutes = new Hono();

homeRoutes.get("/", (c) => {
    const userIpAdress = c.req.header("x-forwarded-for");
    return c.json({
        message: `Hello dear ${userIpAdress}`,
        apiVersion: "1.0.0",
    });
});

export { homeRoutes };
