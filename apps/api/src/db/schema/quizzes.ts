import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { languages } from './languages';
import { lessonQuizzes } from './lessonQuizzes';
import { forumComments } from './forumComments';

export const quizzes = sqliteTable(
  'quiz',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    quizType: text('quizType').notNull(),
    languageId: integer('languageId')
      .notNull()
      .references(() => languages.id),
    content: text('content').notNull(),
    answer: text('answer').notNull(),
  },
  () => []
);

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  language: one(languages, {
    fields: [quizzes.languageId],
    references: [languages.id],
  }),
  lessonQuizzes: many(lessonQuizzes),
  forumComments: many(forumComments),
}));
