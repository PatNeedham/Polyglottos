import { Hono } from 'hono';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Bindings } from '../index';

const userRoutes = new Hono<{
  Bindings: Bindings;
  Variables: { db: DrizzleD1Database };
}>();

userRoutes.get('/', async (c) => {
  try {
    const db = c.get('db') as DrizzleD1Database;
    const userList = await db.select().from(users).all();
    return c.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.text('Internal Server Error', 500);
  }
});

userRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db: DrizzleD1Database = c.get('db');
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    return user ? c.json(user) : c.text('User not found', 404);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.text('Internal Server Error', 500);
  }
});

userRoutes.post('/', async (c) => {
  try {
    const db: DrizzleD1Database = c.get('db');
    const { username, email, passwordHash } = await c.req.json();
    const user = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .execute();
    return c.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.text('Internal Server Error', 500);
  }
});

export default userRoutes;
