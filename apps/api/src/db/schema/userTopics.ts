import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { topics } from './topics';

export const userTopics = sqliteTable(
  'userTopic',
  {
    userId: integer('userId')
      .notNull()
      .references(() => users.id),
    topicId: integer('topicId')
      .notNull()
      .references(() => topics.id),
    completed: integer('completed', { mode: 'boolean' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.topicId] })]
);

export const userTopicsRelations = relations(userTopics, ({ one }) => ({
  user: one(users, {
    fields: [userTopics.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [userTopics.topicId],
    references: [topics.id],
  }),
}));
