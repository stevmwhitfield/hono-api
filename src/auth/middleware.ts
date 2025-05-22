import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
import { registerSchema, tokenSchema } from './schema';
import { Context } from 'hono';
import { PasswordTokenRequest, RefreshTokenRequest } from './types';
import { env } from '../env';

const jwtAuth = createMiddleware(async (c, next) => {
    const jwtMiddleware = jwt({
        secret: env.JWT_SECRET,
    });
    return jwtMiddleware(c, next);
});

type AuthRequest = PasswordTokenRequest | RefreshTokenRequest;

function validateTokenRequest(value: AuthRequest, c: Context) {
    const parsed = tokenSchema.safeParse(value);
    if (!parsed.success) {
        return c.json(parsed.error, 400);
    }
    return parsed.data;
}

function validateSignupRequest(value: AuthRequest, c: Context) {
    const parsed = registerSchema.safeParse(value);
    if (!parsed.success) {
        return c.json(parsed.error, 400);
    }
    return parsed.data;
}

export { jwtAuth, validateTokenRequest, validateSignupRequest };
