import { Context } from 'hono';
import { db } from '../db/mock';
import { comparePassword } from './helpers';
import { generateTokens } from './token';
import { verify } from 'hono/jwt';

async function passwordGrant(c: Context, email: string, password: string) {
    const user = await db.findUserByEmail(email);
    if (!user) {
        return c.json({ message: 'user not found' }, 404);
    }

    const isValidPassword = await comparePassword(password, user.salt, user.password_hash);
    if (!isValidPassword) {
        return c.json({ message: 'invalid credentials' }, 400);
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 900,
        refresh_token: refreshToken,
    });
}

async function refreshTokenGrant(c: Context, refreshToken: string) {
    const jwtPayload = await verify(refreshToken, c.env.JWT_SECRET);
    if (!jwtPayload || !jwtPayload.sub) {
        return c.json({ message: 'invalid refresh token' }, 401);
    }

    const user = await db.findUserById(jwtPayload.sub as string);
    if (!user) {
        return c.json({ message: 'user not found' }, 404);
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 900,
        refresh_token: newRefreshToken,
    });
}

export { passwordGrant, refreshTokenGrant };
