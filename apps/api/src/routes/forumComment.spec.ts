import { createApp } from '../index';
import { createInMemoryRepositories } from '../repositories/memory/repositories';

describe('forum comment routes', () => {
  function setup() {
    const repos = createInMemoryRepositories();
    const app = createApp(repos);
    return { app, repos };
  }

  it('creates a comment with default vote counts', async () => {
    const { app } = setup();
    const res = await app.request('/forum-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        quizId: 'quiz-1',
        content: 'Great question!',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      userId: 'user-1',
      quizId: 'quiz-1',
      content: 'Great question!',
      upvotes: 0,
      downvotes: 0,
    });
  });

  it('rejects POST with missing fields', async () => {
    const { app } = setup();
    const res = await app.request('/forum-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u', quizId: 'q' }),
    });
    expect(res.status).toBe(400);
  });

  it('GET /forum-comments/:id returns 404 for missing comment', async () => {
    const { app } = setup();
    const res = await app.request('/forum-comments/missing');
    expect(res.status).toBe(404);
  });

  it('GET /forum-comments/:id returns the comment', async () => {
    const { app, repos } = setup();
    const created = await repos.forumComments.create({
      userId: 'u',
      quizId: 'q',
      content: 'hi',
    });
    const res = await app.request(`/forum-comments/${created.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
  });
});
