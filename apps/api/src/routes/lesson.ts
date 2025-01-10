import { Hono } from 'hono';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { lessons } from '../db/schema'; // Import the 'lessons' table from your schema
import { eq } from 'drizzle-orm';
import { Bindings } from '../index';

const lessonRoutes = new Hono<{
  Bindings: Bindings;
  Variables: { db: DrizzleD1Database };
}>();

// GET all lessons
lessonRoutes.get('/', async (c) => {
  try {
    const db = c.get('db') as DrizzleD1Database;
    const lessonList = await db.select().from(lessons).all();
    return c.json(lessonList);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return c.text('Internal Server Error', 500);
  }
});

// GET a lesson by ID
lessonRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db: DrizzleD1Database = c.get('db');
    const lesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, id))
      .get();
    return lesson ? c.json(lesson) : c.text('Lesson not found', 404);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return c.text('Internal Server Error', 500);
  }
});

// POST a new lesson
lessonRoutes.post('/', async (c) => {
  try {
    const db: DrizzleD1Database = c.get('db');
    const { lessonName, languageId } = await c.req.json();

    const newLesson = await db
      .insert(lessons)
      .values({ lessonName, languageId })
      .execute();

    return c.json(newLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return c.text('Internal Server Error', 500);
  }
});

export default lessonRoutes;
