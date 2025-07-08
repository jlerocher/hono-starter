import bcrypt from "bcryptjs";
import { prisma } from "prisma/prisma-client";

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findMany({
        where: {
            email: email,
        },
    });

    return user;
};

export const comparePassword = async (
    password: string,
    hashedPassword: string,
) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
};

export const getUserAccountById = async (id: string) => {
    const account = await prisma.account.findMany({
        where: {
            userId: id,
        },
    });

    return account;
};
