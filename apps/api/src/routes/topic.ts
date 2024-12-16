import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const topicRoutes = (prisma: PrismaClient) => {
  const router = new Hono();

  router.get('/', async (c) => {
    const topics = await prisma.topic.findMany();
    return c.json(topics);
  });

  router.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: parseInt(id) }, // Assuming 'id' is an integer
      });
      if (!topic) {
        return c.json({ message: 'Topic not found' }, 404);
      }
      return c.json(topic);
    } catch (error) {
      console.log('Error fetching topic:', error);
      return c.json({ message: 'Error fetching topic' }, 500);
    }
  });

  // Add other topic routes (POST, PUT, DELETE, etc.)

  return router;
};

export default topicRoutes;
