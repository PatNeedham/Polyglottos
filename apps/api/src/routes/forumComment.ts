import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const forumCommentRoutes = (prisma: PrismaClient) => {
  const router = new Hono();

  router.get('/', async (c) => {
    const forumComments = await prisma.forumComment.findMany();
    return c.json(forumComments);
  });

  router.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
      const forumComment = await prisma.forumComment.findUnique({
        where: { id: parseInt(id) }, // Assuming 'id' is an integer
      });
      if (!forumComment) {
        return c.json({ message: 'Forum comment not found' }, 404);
      }
      return c.json(forumComment);
    } catch (error) {
      console.log('Error fetching forum comment:', error);
      return c.json({ message: 'Error fetching forum comment' }, 500);
    }
  });

  // Add other forum comment routes (POST, PUT, DELETE, etc.)

  return router;
};

export default forumCommentRoutes;
