import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { goals } from './goals';

export const notificationsTable = sqliteTable(
  'notifications',
  {
    id: integer('id').notNull(),
    userId: integer('user_id').notNull(),
    goalId: integer('goal_id').notNull(),
    frequency: text('frequency').notNull(), // e.g., 'weekly', 'daily'
    type: text('type').notNull(), // e.g., 'email', 'sms'
    lastSent: text('last_sent'), // Timestamp of the last notification
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    foreignKey({
      columns: [table.goalId],
      foreignColumns: [goals.id],
    }),
  ]
);
