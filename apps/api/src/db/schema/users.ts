import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: integer('id'),
    username: text('username').notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('learner'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('idx_username').on(t.username),
    index('idx_email').on(t.email),
  ]
);
