import {
    generateAccessToken,
    generateRefreshToken,
} from "@/auth/services/register-service";
import { prisma } from "prisma/prisma-client";

/**
 * Checks if the given refresh token is valid and has not expired or been revoked.
 *
 * @param refreshToken The refresh token to check.
 * @returns True if the token is valid, false otherwise.
 */
const isRefreshTokenValid = async (refreshToken: string) => {
    const token = await prisma.refreshToken.findUnique({
        where: {
            token: refreshToken,
        },
    });
    if (!token || token.expiresAt < new Date() || token.revoked === true) {
        return false;
    }
    return true;
};

/**
 * Revokes a refresh token by marking it as revoked in the database.
 *
 * @param refreshToken The refresh token to revoke.
 * @returns A promise that resolves when the token has been successfully revoked.
 */
const revokeRefreshToken = async (refreshToken: string) => {
    await prisma.refreshToken.updateMany({
        where: {
            token: refreshToken,
        },
        data: {
            revoked: true,
        },
    });
};

const storeAccessToken = async (userId: string, accessToken: string) => {
    await prisma.account.updateMany({
        where: {
            userId: userId,
        },
        data: {
            accessToken: accessToken,
        },
    });
};

const storeRefreshToken = async (userId: string, refreshToken: string) => {
    await prisma.refreshToken.create({
        data: {
            userId: userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days expiration
        },
    });
};

/**
 * Generates a new access and refresh token pair given an existing refresh token
 * and the associated user ID.
 *
 * @param oldRefreshToken The old refresh token to replace.
 * @param userId The ID of the user associated with the given refresh token.
 * @returns An object containing the new access and refresh token strings.
 *          The access token is a valid JWT that can be used to authenticate
 *          with the API, and the refresh token is a valid token that can be
 *          used to obtain a new access token when the existing one expires.
 *          If the old refresh token is invalid, both tokens will be null.
 */
export const generateNewTokens = async (
    oldRefreshToken: string,
    userId: string,
) => {
    const isValid = await isRefreshTokenValid(oldRefreshToken);
    if (!isValid) {
        return { accessToken: null, refreshToken: null };
    }
    const accessToken = await generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);
    if (accessToken instanceof Error || refreshToken instanceof Error) {
        return { accessToken: null, refreshToken: null };
    }
    // Revoke the old refresh token to prevent reuse
    await revokeRefreshToken(oldRefreshToken);

    // Store the new access token in the account table
    await storeAccessToken(userId, accessToken);

    // Store the new refresh token in the refresh token table
    await storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
};
