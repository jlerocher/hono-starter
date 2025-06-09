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
    return { accessToken, refreshToken };
};
