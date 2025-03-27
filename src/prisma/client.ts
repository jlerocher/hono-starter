import { PrismaClient } from "@prisma/client";

// Declare global variable to prevent multiple instances
declare global {
    var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
