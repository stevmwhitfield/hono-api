import {
    boolean,
    char,
    index,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

const user = pgTable(
    'users',
    {
        id: uuid().defaultRandom().primaryKey(),
        email: varchar().unique().notNull(),
        password_hash: char({ length: 128 }).notNull(),
        salt: char({ length: 32 }).notNull(),
        created_at: timestamp({ withTimezone: true }).defaultNow(),
        updated_at: timestamp({ withTimezone: true }).defaultNow(),
    },
    (table) => [uniqueIndex('idx_email').on(table.email)],
);

const refreshToken = pgTable(
    'refresh_tokens',
    {
        id: uuid().defaultRandom().primaryKey(),
        user_id: uuid()
            .notNull()
            .references(() => user.id),
        user_email: varchar().notNull(),
        issued_at: timestamp({ withTimezone: true }).defaultNow(),
        expires_at: timestamp({ withTimezone: true }).notNull(),
        is_revoked: boolean().notNull().default(false),
    },
    (table) => [
        index('idx_user_id').on(table.user_id),
        index('idx_user_email').on(table.user_email),
        index('idx_is_revoked').on(table.is_revoked),
    ],
);

export { refreshToken, user };
