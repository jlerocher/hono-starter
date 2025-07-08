import bcrypt from "bcryptjs";
import { prismaUniqueInstance } from "prisma/prisma-client";

export const getUserByEmail = async (email: string) => {
    const user = await prismaUniqueInstance.user.findMany({
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
    const account = await prismaUniqueInstance.account.findMany({
        where: {
            userId: id,
        },
    });

    return account;
};
