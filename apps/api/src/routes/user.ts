import { Hono } from 'hono';
import { Repositories } from '../repositories/types';

export function createUserRoutes(repos: Repositories) {
  const userRoutes = new Hono();

  userRoutes.get('/', async (c) => {
    try {
      const users = await repos.users.list();
      return c.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  userRoutes.get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const user = await repos.users.getById(id);
      return user ? c.json(user) : c.text('User not found', 404);
    } catch (error) {
      console.error('Error fetching user:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  userRoutes.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { username, email, passwordHash } = body ?? {};
      if (!username || !email || !passwordHash) {
        return c.text(
          'Missing required fields: username, email, passwordHash',
          400
        );
      }
      const user = await repos.users.create({ username, email, passwordHash });
      return c.json(user, 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  return userRoutes;
}
