import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const userRoleVerifications = sqliteTable(
  'user_role_verifications',
  {
    id: integer('id'),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull(),
    status: text('status').notNull().default('pending'),
    evidence: text('evidence'),
    reviewedBy: integer('reviewed_by').references(() => users.id),
    reviewedAt: text('reviewed_at'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('idx_verification_user_id').on(t.userId),
    index('idx_verification_status').on(t.status),
  ]
);
