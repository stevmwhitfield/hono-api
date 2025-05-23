import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { jwt } from 'hono/jwt';
import { env } from '~/core/env';
import { getTokenSchema, registerSchema } from './schema';
import { PasswordTokenRequest, RefreshTokenRequest } from './types';

const jwtAuth = createMiddleware(async (c, next) => {
    const jwtMiddleware = jwt({
        secret: env.JWT_SECRET,
    });
    return jwtMiddleware(c, next);
});

type AuthRequest = PasswordTokenRequest | RefreshTokenRequest;

function validateSignupRequest(body: AuthRequest) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => issue.message).join('; ');
        throw new HTTPException(400, { message, cause: parsed.error });
    }
    return parsed.data;
}

function validateTokenRequest(body: AuthRequest, c: Context) {
    const grantType = c.req.query('grant_type') || 'password';
    const tokenSchema = getTokenSchema(grantType);
    const parsed = tokenSchema.safeParse(body);
    if (!parsed.success) {
        const message = parsed.error.issues.map((issue) => issue.message).join('; ');
        throw new HTTPException(400, { message, cause: parsed.error });
    }
    return parsed.data;
}

export { jwtAuth, validateSignupRequest, validateTokenRequest };
