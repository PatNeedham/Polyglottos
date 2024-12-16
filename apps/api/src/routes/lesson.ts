import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const lessonRoutes = (prisma: PrismaClient) => {
  const router = new Hono();

  router.get('/', async (c) => {
    const lessons = await prisma.lesson.findMany();
    return c.json(lessons);
  });

  router.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }, // Assuming 'id' is an integer
      });
      if (!lesson) {
        return c.json({ message: 'Lesson not found' }, 404);
      }
      return c.json(lesson);
    } catch (error) {
      console.log('Error fetching lesson:', error);
      return c.json({ message: 'Error fetching lesson' }, 500);
    }
  });

  // Add other lesson routes (POST, PUT, DELETE, etc.)

  return router;
};

export default lessonRoutes;
