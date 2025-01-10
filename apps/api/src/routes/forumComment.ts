import { Hono } from 'hono';
import { forumComments } from '../db/schema';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { Bindings } from '../index';
import { eq } from 'drizzle-orm';

const forumCommentRoutes = new Hono<{
  Bindings: Bindings;
  Variables: { db: DrizzleD1Database };
}>();

forumCommentRoutes.get('/', async (c) => {
  try {
    const db: DrizzleD1Database = c.get('db');
    const comments = await db.select().from(forumComments).all();
    return c.json(comments);
  } catch (error) {
    console.error('Error fetching forum comments:', error);
    return c.text('Internal Server Error', 500);
  }
});

forumCommentRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db: DrizzleD1Database = c.get('db');
    const comment = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, id))
      .get();

    return comment ? c.json(comment) : c.text('Forum comment not found', 404);
  } catch (error) {
    console.error('Error fetching forum comment:', error);
    return c.text('Internal Server Error', 500);
  }
});

forumCommentRoutes.post('/', async (c) => {
  try {
    const db: DrizzleD1Database = c.get('db');
    const { userId, content, quizId } = await c.req.json();

    const newComment = await db
      .insert(forumComments)
      .values({ userId, content, quizId })
      .execute();

    return c.json(newComment);
  } catch (error) {
    console.error('Error creating forum comment:', error);
    return c.text('Internal Server Error', 500);
  }
});

export default forumCommentRoutes;
