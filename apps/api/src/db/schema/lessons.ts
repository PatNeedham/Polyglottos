import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { languages } from './languages';
import { lessonQuizzes } from './lessonQuizzes';

export const lessons = sqliteTable(
  'lesson',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    languageId: integer('languageId')
      .notNull()
      .references(() => languages.id),
    lessonName: text('lessonName').notNull(),
  },
  () => []
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  language: one(languages, {
    fields: [lessons.languageId],
    references: [languages.id],
  }),
  lessonQuizzes: many(lessonQuizzes),
}));
