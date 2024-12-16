import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

import userRoutes from './routes/user';
import lessonRoutes from './routes/lesson';
import topicRoutes from './routes/topic';
import forumCommentRoutes from './routes/forumComment';

const app = new Hono();
const prisma = new PrismaClient().$extends(
  withAccelerate()
) as unknown as PrismaClient;

app.route('/users', userRoutes(prisma));
app.route('/lessons', lessonRoutes(prisma));
app.route('/topics', topicRoutes(prisma));
app.route('/forum-comments', forumCommentRoutes(prisma));

app.get('/', (c) => c.text('This is the Polyglottos API!'));

export default app;
