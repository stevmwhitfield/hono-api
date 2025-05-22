import { z } from 'zod';

const passwordGrantSchema = z.object({
    grant_type: z.literal('password'),
    email: z.string().email(),
    password: z.string().min(1),
});

const refreshTokenGrantSchema = z.object({
    grant_type: z.literal('refresh_token'),
    refresh_token: z.string().min(1),
});

const tokenSchema = z.discriminatedUnion('grant_type', [
    passwordGrantSchema,
    refreshTokenGrantSchema,
]);

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export { tokenSchema, registerSchema };
