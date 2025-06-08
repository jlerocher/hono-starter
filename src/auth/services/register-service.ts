import { prisma } from "prisma/prisma-client";
import bcrypt = require("bcryptjs/umd/types");

const verifyIfUserExists = async (email: string) => {
    return await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
};

const generateTokens = async (userId: string) => {
    // Placeholder for token generation logic
};

const saltAndHashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

export const registerUser = async () => {};
