import { Hono } from 'hono';
import { hashPassword, WeakPasswordError } from '../lib/password';
import { Repositories } from '../repositories/types';
import { User } from '../types/models';

type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  // Never let the stored password hash leave the API.
  const { passwordHash: _omit, ...rest } = user;
  return rest;
}

export function createUserRoutes(repos: Repositories) {
  const userRoutes = new Hono();

  userRoutes.get('/', async (c) => {
    try {
      const users = await repos.users.list();
      return c.json(users.map(toPublicUser));
    } catch (error) {
      console.error('Error fetching users:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  userRoutes.get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const user = await repos.users.getById(id);
      return user ? c.json(toPublicUser(user)) : c.text('User not found', 404);
    } catch (error) {
      console.error('Error fetching user:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  userRoutes.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { username, email, password } = body ?? {};
      if (!username || !email || !password) {
        return c.text(
          'Missing required fields: username, email, password',
          400
        );
      }

      let passwordHash: string;
      try {
        passwordHash = await hashPassword(password);
      } catch (err) {
        if (err instanceof WeakPasswordError) {
          return c.text(err.message, 400);
        }
        throw err;
      }

      const user = await repos.users.create({ username, email, passwordHash });
      return c.json(toPublicUser(user), 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  return userRoutes;
}
