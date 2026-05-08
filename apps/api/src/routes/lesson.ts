import { Hono } from 'hono';
import { Repositories } from '../repositories/types';

export function createLessonRoutes(repos: Repositories) {
  const lessonRoutes = new Hono();

  lessonRoutes.get('/', async (c) => {
    try {
      const lessons = await repos.lessons.list();
      return c.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  lessonRoutes.get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const lesson = await repos.lessons.getById(id);
      return lesson ? c.json(lesson) : c.text('Lesson not found', 404);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  lessonRoutes.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { lessonName, languageId } = body ?? {};
      if (!lessonName || !languageId) {
        return c.text('Missing required fields: lessonName, languageId', 400);
      }
      const lesson = await repos.lessons.create({ lessonName, languageId });
      return c.json(lesson, 201);
    } catch (error) {
      console.error('Error creating lesson:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  return lessonRoutes;
}
