import {
    generateAccessToken,
    generateRefreshToken,
} from "@/auth/services/register-service";

const generateNewTokens = async (userId: string) => {
    const accessToken = await generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);
    return { accessToken, refreshToken };
};
