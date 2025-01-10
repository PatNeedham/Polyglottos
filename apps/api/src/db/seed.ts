import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { users, languages, quizzes, forumComments } from './schema';
import { D1Database } from '@cloudflare/workers-types';
import usersData from './mocks/users.json';

import dotenv from 'dotenv';
dotenv.config();

async function createD1Db() {
  const dbBinding = process.env.DB as unknown as D1Database;

  if (!dbBinding) {
    throw new Error('DB environment variable is not set');
  }

  const sqlite3 = require('better-sqlite3');
  const db = new sqlite3('./polyglottos.db');

  migrate(drizzle(db), { migrationsFolder: './drizzle' });
  return drizzle(dbBinding);
}

async function main() {
  const db = await createD1Db();

  try {
    for (const userData of usersData) {
      const { username, email } = userData;

      await db
        .insert(users)
        .values({
          username,
          email,
          passwordHash: 'password123',
        })
        .returning()
        .get();
    }

    const spanish = await db
      .insert(languages)
      .values({
        languageName: 'Spanish',
      })
      .returning()
      .get();

    const quiz1 = await db
      .insert(quizzes)
      .values({
        quizType: 'multiple_choice',
        languageId: spanish.id,
        content: 'What is the Spanish word for "apple"?',
        answer: 'manzana',
      })
      .returning()
      .get();

    const quiz2 = await db
      .insert(quizzes)
      .values({
        quizType: 'fill_in_the_blank',
        languageId: spanish.id,
        content: 'Translate to Spanish: "I am happy."',
        answer: 'Estoy feliz',
      })
      .returning()
      .get();

    const quiz3 = await db
      .insert(quizzes)
      .values({
        quizType: 'multiple_choice',
        languageId: spanish.id,
        content: 'What is the Spanish word for "dog"?',
        answer: 'perro',
      })
      .returning()
      .get();

    await db.insert(forumComments).values({
      content: 'I found this question very easy!',
      userId: 1,
      quizId: quiz1.id,
    });

    await db.insert(forumComments).values({
      content: 'I struggled with this one.',
      userId: 2,
      quizId: quiz1.id,
    });

    await db.insert(forumComments).values({
      content: 'Great question!',
      userId: 3,
      quizId: quiz2.id,
    });

    await db.insert(forumComments).values({
      content: 'I love learning Spanish!',
      userId: 4,
      quizId: quiz3.id,
    });

    console.log('Database has been seeded. 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error('Error running seed script:', error);
  process.exit(1);
});
