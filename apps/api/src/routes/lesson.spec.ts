import { createApp } from '../index';
import { createInMemoryRepositories } from '../repositories/memory/repositories';

describe('lesson routes', () => {
  function setup() {
    const repos = createInMemoryRepositories();
    const app = createApp(repos);
    return { app, repos };
  }

  it('returns empty list when no lessons exist', async () => {
    const { app } = setup();
    const res = await app.request('/lessons');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('creates a lesson and lists it', async () => {
    const { app } = setup();
    const create = await app.request('/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonName: 'Greetings', languageId: 'lang-1' }),
    });
    expect(create.status).toBe(201);

    const list = await app.request('/lessons');
    const body = await list.json();
    expect(body).toHaveLength(1);
    expect(body[0].lessonName).toBe('Greetings');
  });

  it('rejects POST with missing fields', async () => {
    const { app } = setup();
    const res = await app.request('/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonName: 'No language' }),
    });
    expect(res.status).toBe(400);
  });

  it('GET /lessons/:id returns 404 for missing lesson', async () => {
    const { app } = setup();
    const res = await app.request('/lessons/missing');
    expect(res.status).toBe(404);
  });
});
