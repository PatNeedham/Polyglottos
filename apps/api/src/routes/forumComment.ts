import { Hono } from 'hono';
import { Repositories } from '../repositories/types';

export function createForumCommentRoutes(repos: Repositories) {
  const forumCommentRoutes = new Hono();

  forumCommentRoutes.get('/', async (c) => {
    try {
      const comments = await repos.forumComments.list();
      return c.json(comments);
    } catch (error) {
      console.error('Error fetching forum comments:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  forumCommentRoutes.get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const comment = await repos.forumComments.getById(id);
      return comment
        ? c.json(comment)
        : c.text('Forum comment not found', 404);
    } catch (error) {
      console.error('Error fetching forum comment:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  forumCommentRoutes.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { userId, content, quizId, parentId } = body ?? {};
      if (!userId || !content || !quizId) {
        return c.text(
          'Missing required fields: userId, content, quizId',
          400
        );
      }
      const comment = await repos.forumComments.create({
        userId,
        content,
        quizId,
        parentId,
      });
      return c.json(comment, 201);
    } catch (error) {
      console.error('Error creating forum comment:', error);
      const message = error instanceof Error ? error.message : String(error);
      return c.text(`Internal Server Error: ${message}`, 500);
    }
  });

  return forumCommentRoutes;
}
