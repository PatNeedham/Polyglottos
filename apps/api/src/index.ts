import { Hono, Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { DrizzleD1Database } from 'drizzle-orm/d1';

import userRoutes from './routes/user';
import lessonRoutes from './routes/lesson';
import forumCommentRoutes from './routes/forumComment';
import { D1Database } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
};

type CustomContext = {
  db: DrizzleD1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  const db: DrizzleD1Database = drizzle((c.env as Bindings).DB);
  (c as Context & CustomContext).db = db;
  await next();
});

app.route('/users', userRoutes);
app.route('/lessons', lessonRoutes);
app.route('/forum-comments', forumCommentRoutes);

app.get('/', (c) => c.text('This is the Polyglottos API!'));

export default app;
