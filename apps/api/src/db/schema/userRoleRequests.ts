import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const userRoleRequests = sqliteTable(
  'user_role_requests',
  {
    id: integer('id'),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    requestedRole: text('requested_role').notNull(),
    currentRole: text('current_role').notNull(),
    reason: text('reason'),
    status: text('status').notNull().default('pending'),
    reviewedBy: integer('reviewed_by').references(() => users.id),
    reviewedAt: text('reviewed_at'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('idx_role_request_user_id').on(t.userId),
    index('idx_role_request_status').on(t.status),
  ]
);
