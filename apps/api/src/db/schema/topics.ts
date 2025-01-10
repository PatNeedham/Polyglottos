import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { languages } from './languages';

import { userTopics } from './userTopics';

export const topics = sqliteTable(
  'topic',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    languageId: integer('languageId')
      .notNull()
      .references(() => languages.id),
    topicName: text('topicName').notNull(),
  },
  () => []
);

export const topicsRelations = relations(topics, ({ one, many }) => ({
  language: one(languages, {
    fields: [topics.languageId],
    references: [languages.id],
  }),
  userTopics: many(userTopics),
}));
