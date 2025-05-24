import { z } from 'zod';

const passwordGrantSchema = z.object({
    email: z
        .string({ message: 'email must be a non-empty string' })
        .email('email must be a valid format'),
    password: z
        .string({ message: 'password must be a non-empty string' })
        .min(8, 'password must be at least 8 characters'),
});

const refreshTokenGrantSchema = z.object({
    refresh_token: z
        .string({ message: 'refresh_token must be a non-empty string' })
        .uuid('refresh_token must be a valid format'),
});

const registerSchema = z.object({
    email: z
        .string({ message: 'email must be a non-empty string' })
        .email('email must be a valid format'),
    password: z
        .string({ message: 'password must be a non-empty string' })
        .min(8, 'password must be at least 8 characters')
        .refine(
            (v: string) => /[a-z]/.test(v),
            'password must contain at least one lowercase letter',
        )
        .refine(
            (v: string) => /[A-Z]/.test(v),
            'password must contain at least one uppercase letter',
        )
        .refine((v: string) => /[0-9]/.test(v), 'password must contain at least one number')
        .refine(
            (v: string) => /[-._!"`'#%&,:;<>=@{}~$()*+/\\?[\]^|]+/.test(v),
            'password must contain at least one special character',
        ),
});

function getTokenSchema(grantType: string) {
    switch (grantType) {
        case 'password':
            return passwordGrantSchema;
        case 'refresh_token':
            return refreshTokenGrantSchema;
        default:
            throw new Error('invalid grant_type');
    }
}

export { passwordGrantSchema, refreshTokenGrantSchema, registerSchema, getTokenSchema };
