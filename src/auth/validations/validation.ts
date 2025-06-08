import { z } from "zod";

export const registerSchema = z
    .object({
        name: z.string().min(4, "Name is required"),
        email: z
            .string()
            .email("Invalid email address")
            .min(1, "Email is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^(){}[\]:;<>,.~_+-])[A-Za-z\d@$!%*?&#^(){}[\]:;<>,.~_+-]{8,}$/,
                "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
            ),
        passwordConfirmation: z
            .string()
            .min(8, "Password confirmation must be at least 8 characters long"),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"],
    });

export const validateRegister = (data: typeof registerSchema._type) => {
    const result = registerSchema.safeParse(data);
    return result;
};
