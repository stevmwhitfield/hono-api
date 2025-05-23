import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { env } from '~/core/env';
import { refreshTokenRepo } from '~/db/refresh-token.repo';
import { userRepo } from '~/db/user.repo';
import { comparePassword } from './helpers';
import { generateTokens } from './token';

async function passwordGrant(c: Context, email: string, password: string) {
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
        throw new HTTPException(404, { message: 'user not found' });
    }

    const isValidPassword = await comparePassword(password, user.salt, user.password_hash);
    if (!isValidPassword) {
        throw new HTTPException(400, { message: 'invalid credentials' });
    }

    await refreshTokenRepo.revokeAllRefreshTokensForUser(user.id);

    const { accessToken, refreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: env.JWT_EXP,
        refresh_token: refreshToken,
    });
}

async function refreshTokenGrant(c: Context, refreshToken: string) {
    const token = await refreshTokenRepo.findRefreshTokenById(refreshToken);
    if (!token || token.is_revoked) {
        throw new HTTPException(401, { message: 'invalid refresh token' });
    }

    if (new Date(token.expires_at) < new Date()) {
        await refreshTokenRepo.revokeRefreshTokenById(refreshToken);
        throw new HTTPException(401, { message: 'refresh token expired' });
    }

    const user = await userRepo.findUserById(token.user_id);
    if (!user) {
        throw new HTTPException(404, { message: 'user not found' });
    }

    await refreshTokenRepo.revokeAllRefreshTokensForUser(user.id);

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    return c.json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: env.JWT_EXP,
        refresh_token: newRefreshToken,
    });
}

export { passwordGrant, refreshTokenGrant };
