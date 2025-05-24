import type { PasswordTokenRequest, RefreshTokenRequest } from './types';
import crypto from 'crypto';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';
import { env } from '~/core/env';
import { refreshTokenRepo } from '~/db/refresh-token.repo';
import { userRepo } from '~/db/user.repo';
import { passwordGrant, refreshTokenGrant } from './grants';
import { generateSalt, hashPassword } from './helpers';
import { jwtAuth, validateSignupRequest, validateTokenRequest } from './middleware';
import { generateTokens } from './token';

const auth = new Hono();

auth.post('/signup', validator('json', validateSignupRequest), async (c) => {
    try {
        const { email, password } = (await c.req.json()) as PasswordTokenRequest;
        if (!email) {
            throw new HTTPException(400, { message: 'email is required' });
        }

        const existingUser = await userRepo.findUserByEmail(email);
        if (existingUser) {
            throw new HTTPException(409, { message: 'user already exists with this email' });
        }

        const userId = crypto.randomUUID();
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);

        const user = await userRepo.createUser({
            id: userId,
            email,
            password_hash: hashedPassword,
            salt,
        });
        if (!user) {
            throw new HTTPException(500, { message: 'failed to create user' });
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        return c.json({
            access_token: accessToken,
            token_type: 'bearer',
            expires_in: env.JWT_EXP,
            refresh_token: refreshToken,
        });
    } catch (err) {
        if (err instanceof HTTPException) {
            throw err;
        }
        console.error('error in /signup', err);
        throw new HTTPException(500, { message: 'internal server error' });
    }
});

auth.post('/token', validator('json', validateTokenRequest), async (c) => {
    try {
        const grantType = c.req.query('grant_type') || 'password';

        switch (grantType) {
            case 'password': {
                const { email, password } = (await c.req.json()) as PasswordTokenRequest;
                return passwordGrant(c, email, password);
            }
            case 'refresh_token': {
                const { refresh_token: refreshToken } = (await c.req.json()) as RefreshTokenRequest;
                return refreshTokenGrant(c, refreshToken);
            }
            default:
                throw new HTTPException(400, { message: 'unsupported grant_type' });
        }
    } catch (err) {
        if (err instanceof HTTPException) {
            throw err;
        }
        console.error('error in /token', err);
        throw new HTTPException(500, { message: 'internal server error' });
    }
});

auth.post('/logout', jwtAuth, async (c) => {
    try {
        const jwtPayload = await c.get('jwtPayload');
        if (!jwtPayload || !jwtPayload.sub) {
            throw new HTTPException(401, { message: 'invalid token' });
        }
        if (typeof jwtPayload.sub !== 'string') {
            throw new HTTPException(401, { message: 'invalid token' });
        }

        const userId = jwtPayload.sub as string;

        await refreshTokenRepo.revokeAllRefreshTokensForUser(userId);

        return c.body(null, 204);
    } catch (err) {
        console.error('error in /logout', err);
        throw new HTTPException(500, { message: 'internal server error' });
    }
});

export { auth };
