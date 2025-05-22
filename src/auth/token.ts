import crypto from 'crypto';
import { sign } from 'hono/jwt';
import { User } from '~/db/types';
import { env } from '~/env';
import { db } from '~/db/db';

async function generateTokens(user: User) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: user.id,
        email: user.email,
        aud: env.JWT_AUD,
    };
    const accessToken = await sign(
        { ...payload, iat: now, exp: now + 900 }, // 15 minutes
        env.JWT_SECRET,
    );

    const refreshToken = crypto.randomUUID();
    await db.createRefreshToken({
        id: refreshToken,
        user_id: user.id,
        user_email: user.email,
        expires_at: new Date(Date.now() + 604800), // 7 days
        is_revoked: false,
    });

    return { accessToken, refreshToken };
}

export { generateTokens };
