import { PrismaClient } from "../generated/prisma";

/**
 * Prisma Client instance for database operations.
 * This client is used to interact with the database using Prisma ORM.
 *
 * @remarks
 * It is globally exported for use in the application.
 */
export const prisma = new PrismaClient();
