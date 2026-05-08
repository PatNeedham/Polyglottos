import { Hono } from 'hono';
import { createEkoDBRepositories } from './repositories/factory';
import { Repositories } from './repositories/types';
import { createUserRoutes } from './routes/user';
import { createLessonRoutes } from './routes/lesson';
import { createForumCommentRoutes } from './routes/forumComment';

export type Bindings = {
  EKODB_BASE_URL: string;
  EKODB_API_KEY: string;
};

export function createApp(repos: Repositories) {
  const app = new Hono();
  app.route('/users', createUserRoutes(repos));
  app.route('/lessons', createLessonRoutes(repos));
  app.route('/forum-comments', createForumCommentRoutes(repos));
  app.get('/', (c) => c.text('This is the Polyglottos API!'));
  return app;
}

const workerApp = new Hono<{ Bindings: Bindings }>();

workerApp.all('*', async (c) => {
  const repos = await createEkoDBRepositories(c.env);
  return createApp(repos).fetch(c.req.raw, c.env);
});

export default workerApp;
