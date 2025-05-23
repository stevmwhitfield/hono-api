import crypto from 'crypto';
import { sign } from 'hono/jwt';
import { db } from '~/db/db';
import type { User } from '~/db/types';
import { env } from '~/env';

const REFRESH_EXP = 604800 * 1000; // 7 days (ms)

async function generateTokens(user: User) {
    const now = Math.floor(Date.now() / 1000); // seconds
    const payload = {
        sub: user.id,
        email: user.email,
        aud: env.JWT_AUD,
    };
    const accessToken = await sign(
        { ...payload, iat: now, exp: now + env.JWT_EXP },
        env.JWT_SECRET,
    );

    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_EXP).toISOString();

    await db.createRefreshToken({
        id: refreshToken,
        user_id: user.id,
        user_email: user.email,
        expires_at: expiresAt,
        is_revoked: false,
    });

    return { accessToken, refreshToken };
}

export { generateTokens };
