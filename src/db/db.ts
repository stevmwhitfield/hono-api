import { Database } from 'bun:sqlite';
import { env } from '~/env';
import { RefreshToken, User } from './types';

class DB {
    private db: Database;

    constructor() {
        this.db = new Database(env.DATABASE_URL);
        this.init();
    }

    private init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                is_revoked BOOLEAN NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
        this.db.run('CREATE INDEX IF NOT EXISTS idx_user_email ON users (email)');
        this.db.run(
            'CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens (user_id)',
        );
    }

    async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
        const stmt = this.db.prepare(`
            INSERT INTO users (id, email, password_hash, salt)
            VALUES (?, ?, ?, ?)
            RETURNING id, email, created_at
        `);
        return stmt.get(user.id, user.email, user.password_hash, user.salt) as User;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email) as User | null;
    }

    async findUserById(id: string): Promise<User | null> {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id) as User | null;
    }

    async createRefreshToken(token: Omit<RefreshToken, 'issued_at'>): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO refresh_tokens (id, user_id, user_email, expires_at, is_revoked)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.get(
            token.id,
            token.user_id,
            token.user_email,
            token.expires_at.toISOString(),
            token.is_revoked,
        );
    }

    async findRefreshTokenById(id: string): Promise<RefreshToken | null> {
        const stmt = this.db.prepare('SELECT * FROM refresh_tokens WHERE id = ?');
        return stmt.get(id) as RefreshToken | null;
    }

    async revokeRefreshTokenById(id: string): Promise<void> {
        const stmt = this.db.prepare('UPDATE refresh_tokens SET is_revoked = ? WHERE id = ?');
        stmt.run(true, id);
    }

    async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
        const stmt = this.db.prepare('UPDATE refresh_tokens SET is_revoked = ? WHERE user_id = ?');
        stmt.run(true, userId);
    }

    async cleanupExpiredRefreshTokens(): Promise<void> {
        this.db.run('DELETE FROM refresh_tokens WHERE expires_at < datetime("now")');
    }

    async cleanupRevokedRefreshTokens(): Promise<void> {
        this.db.run('DELETE FROM refresh_tokens WHERE is_revoked = true');
    }

    async close() {
        this.db.close();
    }
}

const db = new DB();

export { db };
