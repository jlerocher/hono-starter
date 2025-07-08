import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    API_PORT: z.coerce.number().default(3000),
    API_URL: z.string().url(),
    JWT_SECRET: z.string(),
});

export const env = envSchema.parse(Bun.env);
