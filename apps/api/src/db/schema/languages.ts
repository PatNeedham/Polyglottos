import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { userLanguages } from './userLanguages';
import { quizzes } from './quizzes';
import { lessons } from './lessons';
import { topics } from './topics';

export const languages = sqliteTable(
  'language',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    languageName: text('languageName').notNull(),
  },
  () => []
);

export const languagesRelations = relations(languages, ({ many }) => ({
  userLanguages: many(userLanguages),
  quizzes: many(quizzes),
  lessons: many(lessons),
  topics: many(topics),
}));
