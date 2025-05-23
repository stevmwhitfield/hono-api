import { db } from '.';
import { user } from './schema';

class UserRepo {
    async createUser(newUser: typeof user.$inferInsert) {
        const createdUser = await db
            .insert(user)
            .values({
                id: newUser.id,
                email: newUser.email,
                password_hash: newUser.password_hash,
                salt: newUser.salt,
            })
            .returning({ id: user.id, email: user.email, created_at: user.created_at });
        return createdUser[0];
    }

    async findUserById(id: string) {
        return await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, id),
        });
    }

    async findUserByEmail(email: string) {
        return await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        });
    }
}

const userRepo = new UserRepo();

export { userRepo };
