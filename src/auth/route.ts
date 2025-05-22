import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { jwtAuth, validateSignupRequest, validateTokenRequest } from './middleware';
import { PasswordTokenRequest, RefreshTokenRequest } from './types';
import { db } from '../db/mock';
import { generateSalt, hashPassword } from './helpers';
import { generateTokens } from './token';
import { passwordGrant, refreshTokenGrant } from './grants';

const app = new Hono();

app.post('/signup', validator('json', validateSignupRequest), async (c) => {
    const { email, password } = (await c.req.json()) as PasswordTokenRequest;
    if (!email) {
        return c.json({ message: 'email is required' }, 400);
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
        return c.json({ message: 'user already exists with this email' }, 400);
    }

    if (!password) {
        return c.json({ message: 'password is required' }, 400);
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const user = await db.createUser(email, hashedPassword, salt);
    if (!user) {
        return c.json({ message: 'failed to create user' }, 500);
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 900,
        refresh_token: refreshToken,
    });
});

app.post('/token', validator('json', validateTokenRequest), async (c) => {
    const grantType = c.req.query('grant_type') || 'password';

    switch (grantType) {
        case 'password':
            const { email, password } = (await c.req.json()) as PasswordTokenRequest;
            return passwordGrant(c, email, password);
        case 'refresh_token':
            const { refreshToken } = (await c.req.json()) as RefreshTokenRequest;
            return refreshTokenGrant(c, refreshToken);
        default:
            return c.json({ message: 'unsupported grant_type' }, 400);
    }
});

app.get('/user', jwtAuth, async (c) => {
    const jwtPayload = await c.get('jwtPayload');
    if (!jwtPayload || !jwtPayload.sub) {
        return c.json({ message: 'invalid token' }, 401);
    }

    const user = await db.findUserById(jwtPayload.sub as string);
    if (!user) {
        return c.json({ message: 'user not found' }, 404);
    }

    return c.json({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    });
});

export default app;
