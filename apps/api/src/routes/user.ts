import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const userRoutes = (prisma: PrismaClient) => {
  const router = new Hono();

  router.get('/', async (c) => {
    try {
      const users = await prisma.user.findMany();
      return c.json(users);
    } catch (error) {
      console.error('Error fetching users:', error); // Log the error
      return c.text('Internal Server Error', 500);
    }
  });

  router.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const user = await prisma.user.findUnique({ where: { id } });
    return c.json(user);
  });

  // Add other user routes (POST, PUT, DELETE, etc.)

  return router;
};

export default userRoutes;
