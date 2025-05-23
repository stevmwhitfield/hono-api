import { eq, lt } from 'drizzle-orm';
import { db } from '.';
import { refreshToken } from './schema';

class RefreshTokenRepo {
    async createRefreshToken(newRefreshToken: typeof refreshToken.$inferInsert) {
        await db.insert(refreshToken).values({
            id: newRefreshToken.id,
            user_id: newRefreshToken.user_id,
            user_email: newRefreshToken.user_email,
            expires_at: newRefreshToken.expires_at,
        });
    }

    async findRefreshTokenById(id: string) {
        return await db.query.refreshToken.findFirst({
            where: (refreshToken, { eq }) => eq(refreshToken.id, id),
        });
    }

    async findRefreshTokensByUserId(userId: string) {
        return await db.query.refreshToken.findMany({
            where: (refreshToken, { eq }) => eq(refreshToken.user_id, userId),
        });
    }

    async revokeRefreshTokenById(id: string) {
        await db.update(refreshToken).set({ is_revoked: true }).where(eq(refreshToken.id, id));
    }

    async revokeAllRefreshTokensForUser(userId: string) {
        await db
            .update(refreshToken)
            .set({ is_revoked: true })
            .where(eq(refreshToken.user_id, userId));
    }

    async cleanupExpiredRefreshTokens() {
        await db.delete(refreshToken).where(lt(refreshToken.expires_at, new Date()));
    }

    async cleanupRevokedRefreshTokens() {
        await db.delete(refreshToken).where(eq(refreshToken.is_revoked, true));
    }
}

const refreshTokenRepo = new RefreshTokenRepo();

export { refreshTokenRepo };
