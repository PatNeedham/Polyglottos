import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

export const questionsTable = sqliteTable(
  'questions',
  {
    id: integer('id').notNull(),
    type: text('type').notNull(), // e.g., "fill-in-the-blank", "multiple-choice"
    question: text('question').notNull(), // The question or prompt text
    options: text('options'), // JSON string for multiple-choice options, if applicable
    correctAnswer: text('correct_answer').notNull(), // Correct answer
    imageUrl: text('image_url'), // For image-based questions
    audioUrl: text('audio_url'), // For audio-based questions
    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  },
  (table) => [primaryKey({ columns: [table.id] })]
);
