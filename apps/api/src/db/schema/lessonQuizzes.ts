import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { lessons } from './lessons';
import { quizzes } from './quizzes';

export const lessonQuizzes = sqliteTable(
  'lessonQuiz',
  {
    lessonId: integer('lessonId')
      .notNull()
      .references(() => lessons.id),
    quizId: integer('quizId')
      .notNull()
      .references(() => quizzes.id),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.quizId] })]
);

export const lessonQuizzesRelations = relations(lessonQuizzes, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonQuizzes.lessonId],
    references: [lessons.id],
  }),
  quiz: one(quizzes, {
    fields: [lessonQuizzes.quizId],
    references: [quizzes.id],
  }),
}));
