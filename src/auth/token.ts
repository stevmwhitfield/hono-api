import { sign } from 'hono/jwt';
import { User } from '../db/types';
import { env } from '../env';

async function generateTokens(user: User) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: user.id,
        email: user.email,
    };
    const accessToken = await sign(
        { ...payload, iat: now, exp: now + 900 }, // 15 minutes
        env.JWT_SECRET,
    );

    const refreshToken = await sign(
        { ...payload, iat: now, exp: now + 604800 }, // 7 days
        env.JWT_SECRET,
    );

    return { accessToken, refreshToken };
}

export { generateTokens };
