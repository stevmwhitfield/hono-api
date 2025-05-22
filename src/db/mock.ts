import { User } from './types';

class MockDB {
    private users: User[] = [];

    async findUserByEmail(email: string): Promise<User | null> {
        return this.users.find((user) => user.email === email) || null;
    }

    async findUserById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) || null;
    }

    async createUser(email: string, passwordHash: string, salt: string): Promise<User> {
        const user: User = {
            id: crypto.randomUUID(),
            email,
            password_hash: passwordHash,
            salt,
            email_confirmed_at: null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.users.push(user);
        return user;
    }
}

const db = new MockDB();

export { db };
