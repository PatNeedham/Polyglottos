import {
  sqliteTable,
  integer,
  real,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { languages } from './languages';

export const userLanguages = sqliteTable(
  'userLanguage',
  {
    userId: integer('userId')
      .notNull()
      .references(() => users.id),
    languageId: integer('languageId')
      .notNull()
      .references(() => languages.id),
    lessonsCompleted: integer('lessonsCompleted').notNull(),
    quizzesTaken: integer('quizzesTaken').notNull(),
    quizzesPassed: integer('quizzesPassed').notNull(),
    rollingAverageAccuracy: real('rollingAverageAccuracy').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.languageId] })]
);

export const userLanguagesRelations = relations(userLanguages, ({ one }) => ({
  user: one(users, {
    fields: [userLanguages.userId],
    references: [users.id],
  }),
  language: one(languages, {
    fields: [userLanguages.languageId],
    references: [languages.id],
  }),
}));
