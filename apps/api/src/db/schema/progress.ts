import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const progressTable = sqliteTable(
  'progress',
  {
    id: integer('id').notNull(),
    userId: integer('user_id').notNull(), // Foreign key to users table
    questionsAnswered: integer('questions_answered').default(0),
    correctAnswers: integer('correct_answers').default(0),
    quizzesTaken: integer('quizzes_taken').default(0),
    goals: text('goals'), // JSON string for user-set goals
    cumulativeStats: text('cumulative_stats'), // JSON for broader stats (e.g., time spent)
    lastUpdated: text('last_updated').default('CURRENT_TIMESTAMP'),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  ]
);
