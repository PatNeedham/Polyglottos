import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const goals = sqliteTable(
  'goals',
  {
    id: integer('id').notNull(),
    userId: integer('user_id').notNull(),
    language: text('language').notNull(),
    description: text('description').notNull(), // Detailed description of the goal
    endDate: text('end_date').notNull(), // Date by which the goal should be completed
    isPrivate: integer('is_private').default(1), // 1 for private, 0 for public
    notificationFrequency: text('notification_frequency'), // e.g., 'weekly', 'daily'
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  ]
);
