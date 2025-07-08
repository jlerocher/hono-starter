import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";

/**
 * Checks if a user with the given email already exists in the database.
 *
 * @param email The email address to search for.
 * @returns The user if found, or null if no user exists.
 */
const verifyIfUserExists = async (email: string, prisma: PrismaClient) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    return user;
};

import { env } from "@/config";
export const generateAccessToken = async (userId: string) => {
    const apiURL = env.API_URL;
    if (!apiURL) return new Error("API_URL is not defined");
    const secret = env.JWT_SECRET;
    if (!secret) return new Error("JWT_SECRET is not defined");

    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        iat: Math.floor(Date.now() / 1000),
        iss: apiURL,
        aud: "api",
        type: "access",
    };

    return await sign(payload, secret);
};

/**
 * Generates a refresh token for the user with the given id.
 *
 * @param userId The user id to generate a refresh token for.
 * @returns The generated refresh token.
 * @throws If the JWT_SECRET is not defined.
 * @throws If the API_URL is not defined.
 */
export const generateRefreshToken = async (
    userId: string,
): Promise<string | Error> => {
    const jwtSecret = env.JWT_SECRET;
    const jwtIssuer = env.API_URL;

    if (!jwtSecret) {
        return new Error("JWT_SECRET is not defined");
    }
    if (!jwtIssuer) {
        return new Error("API_URL is not defined");
    }

    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
        iat: Math.floor(Date.now() / 1000),
        iss: jwtIssuer,
        aud: "api",
        type: "refresh",
    };

    return sign(payload, jwtSecret);
};

/**
 * Salts and hashes a given password using bcrypt.
 *
 * @param password The password to hash.
 * @returns The hashed password.
 */
const saltAndHashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

export const saveRefreshToken = async (
    userId: string,
    refreshToken: string,
    prisma: PrismaClient,
) => {
    // Invalidate all existing refresh tokens for the user
    await prisma.refreshToken.updateMany({
        where: {
            userId: userId,
        },
        data: {
            revoked: true,
        },
    });
    const newRefreshToken = await prisma.refreshToken.create({
        data: {
            userId: userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days expiration
        },
    });
    return newRefreshToken;
};

/**
 * Registers a new user with the given name, email and password.
 *
 * @param name The name of the new user.
 * @param email The email address for the new user.
 * @param password The password for the new user.
 * @returns An object indicating the success or failure of the registration process.
 *          On success, it returns the newly created user and associated tokens.
 *          On failure, it returns an error message indicating that the user already exists.
 */
export const registerNewUser = async (
    name: string,
    email: string,
    password: string,
    prisma: PrismaClient,
) => {
    const user = await verifyIfUserExists(email, prisma);
    if (user) {
        return {
            success: false,
            message: "User already exists",
            data: null,
        };
    }
    const newUser = await prisma.user.create({
        data: {
            email: email,
            name: name,
        },
    });
    const accessToken = await generateAccessToken(newUser.id);
    if (accessToken instanceof Error) {
        return {
            success: false,
            message: "Failed to generate access token",
            data: null,
        };
    }
    const refreshToken = await generateRefreshToken(newUser.id);
    if (refreshToken instanceof Error) {
        return {
            success: false,
            message: "Failed to generate refresh token",
            data: null,
        };
    }
    const newAccount = await prisma.account.create({
        data: {
            userId: newUser.id,
            provider: "CREDENTIALS",
            providerAccountId: newUser.id,
            password: await saltAndHashPassword(password),
            accessToken: accessToken,
            tokenType: "BEARER",
        },
    });
    const newRefreshToken = await prisma.refreshToken.create({
        data: {
            userId: newUser.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days expiration
        },
    });
    return {
        success: true,
        message: "User registered successfully",
        data: {
            newUser,
            accessToken: newAccount.accessToken,
            refreshToken: newRefreshToken.token,
        },
    };
};
