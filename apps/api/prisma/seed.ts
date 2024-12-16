import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      email: 'john@polyglottos.com',
      nativeLanguage: 'English',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'jane_doe',
      email: 'jane@polyglottos.com',
      nativeLanguage: 'English',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'michael_smith',
      email: 'michael@polyglottos.com',
      nativeLanguage: 'English',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      username: 'emily_jones',
      email: 'emily@polyglottos.com',
      nativeLanguage: 'English',
    },
  });

  // Create language
  const spanish = await prisma.language.create({
    data: {
      languageName: 'Spanish',
    },
  });

  // Create quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      quizType: 'multiple_choice',
      languageId: spanish.id,
      content: 'What is the Spanish word for "apple"?',
      answer: 'manzana',
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      quizType: 'fill_in_the_blank',
      languageId: spanish.id,
      content: 'Translate to Spanish: "I am happy."',
      answer: 'Estoy feliz',
    },
  });

  const quiz3 = await prisma.quiz.create({
    data: {
      quizType: 'multiple_choice',
      languageId: spanish.id,
      content: 'What is the Spanish word for "dog"?',
      answer: 'perro',
    },
  });

  // Create forum comments
  await prisma.forumComment.create({
    data: {
      content: 'I found this question very easy!',
      userId: user1.id,
      quizId: quiz1.id,
    },
  });

  await prisma.forumComment.create({
    data: {
      content: 'I struggled with this one.',
      userId: user2.id,
      quizId: quiz1.id,
    },
  });

  await prisma.forumComment.create({
    data: {
      content: 'Great question!',
      userId: user3.id,
      quizId: quiz2.id,
    },
  });

  await prisma.forumComment.create({
    data: {
      content: 'I love learning Spanish!',
      userId: user4.id,
      quizId: quiz3.id,
    },
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
