import { Hono } from "hono";

const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  const { username, password } = await c.req.json();
  console.log(password);

  return c.json({ message: `User ${username} registered successfully!` });
});
