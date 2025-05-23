import { Context } from 'hono';
import { db } from '~/db/db';
import { comparePassword } from './helpers';
import { generateTokens } from './token';
import { HTTPException } from 'hono/http-exception';
import { env } from '~/env';

async function passwordGrant(c: Context, email: string, password: string) {
    const user = await db.findUserByEmail(email);
    if (!user) {
        throw new HTTPException(404, { message: 'user not found' });
    }

    const isValidPassword = await comparePassword(password, user.salt, user.password_hash);
    if (!isValidPassword) {
        throw new HTTPException(400, { message: 'invalid credentials' });
    }

    await db.revokeAllRefreshTokensForUser(user.id);

    const { accessToken, refreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: env.JWT_EXP,
        refresh_token: refreshToken,
    });
}

async function refreshTokenGrant(c: Context, refreshToken: string) {
    const token = await db.findRefreshTokenById(refreshToken);
    if (!token || token.is_revoked) {
        throw new HTTPException(401, { message: 'invalid refresh token' });
    }

    if (new Date(token.expires_at) < new Date()) {
        await db.revokeRefreshTokenById(refreshToken);
        throw new HTTPException(401, { message: 'refresh token expired' });
    }

    const user = await db.findUserById(token.user_id);
    if (!user) {
        throw new HTTPException(404, { message: 'user not found' });
    }

    await db.revokeAllRefreshTokensForUser(user.id);

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: env.JWT_EXP,
        refresh_token: newRefreshToken,
    });
}

export { passwordGrant, refreshTokenGrant };
