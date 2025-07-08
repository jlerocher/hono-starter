import {
    generateAccessToken,
    generateRefreshToken,
} from "@/auth/services/register-service";
import { prismaUniqueInstance } from "prisma/prisma-client";

/**
 * Checks if the given refresh token is valid and has not expired or been revoked.
 *
 * @param refreshToken The refresh token to check.
 * @returns True if the token is valid, false otherwise.
 */
const isRefreshTokenValid = async (refreshToken: string) => {
    const token = await prismaUniqueInstance.refreshToken.findUnique({
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
    await prismaUniqueInstance.refreshToken.updateMany({
        where: {
            token: refreshToken,
        },
        data: {
            revoked: true,
        },
    });
};

/**
 * Stores an access token in the database.
 *
 * @param userId The ID of the user associated with the given access token.
 * @param accessToken The access token to store.
 * @returns A promise that resolves when the token has been successfully stored.
 */
const storeAccessToken = async (userId: string, accessToken: string) => {
    await prismaUniqueInstance.account.updateMany({
        where: {
            userId: userId,
        },
        data: {
            accessToken: accessToken,
        },
    });
};

/**
 * Stores a refresh token in the database.
 *
 * @param userId The ID of the user associated with the given refresh token.
 * @param refreshToken The refresh token to store.
 * @returns A promise that resolves when the token has been successfully stored.
 */
const storeRefreshToken = async (userId: string, refreshToken: string) => {
    await prismaUniqueInstance.refreshToken.create({
        data: {
            userId: userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days expiration
        },
    });
};

/**
 * Generates new access and refresh tokens for a user, revoking the old refresh token.
 *
 * @param oldRefreshToken The old refresh token to be validated and revoked.
 * @param userId The ID of the user for whom new tokens are being generated.
 * @returns An object containing the new access token and refresh token, or null tokens if generation fails.
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
