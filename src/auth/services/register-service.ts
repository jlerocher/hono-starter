import { sign } from "hono/jwt";
import { prisma } from "prisma/prisma-client";
import bcrypt = require("bcryptjs/umd/types");

/**
 * Checks if a user with the given email already exists in the database.
 *
 * @param email The email address to search for.
 * @returns The user if found, or null if no user exists.
 */
const verifyIfUserExists = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    return user;
};

/**
 * Generates an access token for the user with the given id.
 *
 * @param userId The user id to generate an access token for.
 * @returns The generated access token.
 * @throws If the JWT_SECRET is not defined.
 */
const generateAccessToken = async (userId: string) => {
    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        iat: Math.floor(Date.now() / 1000),
        iss: Bun.env.API_URL,
        aud: "api",
        type: "access",
    };
    const secret = Bun.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    return await sign(payload, secret);
};

/**
 * Generates a refresh token for the user with the given id.
 *
 * @param userId The user id to generate a refresh token for.
 * @returns The generated refresh token.
 * @throws If the JWT_SECRET or API_URL is not defined.
 */

export const generateRefreshToken = async (userId: string) => {
    const secret = Bun.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const jwtIssuer = Bun.env.API_URL;
    if (!jwtIssuer) throw new Error("API_URL is not defined");
    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
        iat: Math.floor(Date.now() / 1000),
        iss: jwtIssuer,
        aud: "api",
        type: "refresh",
    };
    return await sign(payload, secret);
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

/**
 * Registers a new user with the given email and password.
 *
 * @param email The email address for the new user.
 * @param password The password for the new user.
 * @returns An object indicating the success or failure of the registration process.
 *          On success, it returns the newly created user and associated tokens.
 *          On failure, it returns an error message indicating that the user already exists.
 */

export const registerNewUser = async (email: string, password: string) => {
    const user = await verifyIfUserExists(email);
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
        },
    });
    const newAccount = await prisma.account.create({
        data: {
            userId: newUser.id,
            provider: "CREDENTIALS",
            providerAccountId: newUser.id,
            accessToken: await generateAccessToken(newUser.id),
            refreshToken: await generateRefreshToken(newUser.id),
            tokenType: "BEARER",
        },
    });
    return {
        success: true,
        message: "User registered successfully",
        data: {
            newUser,
            accessToken: newAccount.accessToken,
            refreshToken: newAccount.refreshToken,
        },
    };
};
