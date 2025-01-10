import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { quizzes } from './quizzes';
import { commentVotes } from './commentVotes';

export const forumComments = sqliteTable(
  'forumComment',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    userId: integer('userId')
      .notNull()
      .references(() => users.id),
    quizId: integer('quizId')
      .notNull()
      .references(() => quizzes.id),
    parentId: integer('parentId').references(() => forumComments.id),
    upvotes: integer('upvotes').notNull().default(0),
    downvotes: integer('downvotes').notNull().default(0),
  },
  () => []
);

export const forumCommentsRelations = relations(
  forumComments,
  ({ one, many }) => ({
    user: one(users, {
      fields: [forumComments.userId],
      references: [users.id],
    }),
    quiz: one(quizzes, {
      fields: [forumComments.quizId],
      references: [quizzes.id],
    }),
    parent: one(forumComments, {
      fields: [forumComments.parentId],
      references: [forumComments.id],
      relationName: 'replies',
    }),
    children: many(forumComments, { relationName: 'replies' }),
    commentVotes: many(commentVotes),
  })
);
