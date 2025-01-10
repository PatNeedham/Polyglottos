import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { forumComments } from './forumComments';

export const commentVotes = sqliteTable(
  'commentVote',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('userId')
      .notNull()
      .references(() => users.id),
    commentId: integer('commentId')
      .notNull()
      .references(() => forumComments.id),
    voteType: text('voteType', { enum: ['UPVOTE', 'DOWNVOTE'] }).notNull(),
  },
  (table) => [unique().on(table.userId, table.commentId)]
);

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  user: one(users, {
    fields: [commentVotes.userId],
    references: [users.id],
  }),
  comment: one(forumComments, {
    fields: [commentVotes.commentId],
    references: [forumComments.id],
  }),
}));
