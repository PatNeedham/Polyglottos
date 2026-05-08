import { createApp } from '../index';
import { createInMemoryRepositories } from '../repositories/memory/repositories';

describe('user routes', () => {
  function setup() {
    const repos = createInMemoryRepositories();
    const app = createApp(repos);
    return { app, repos };
  }

  it('returns empty list when no users exist', async () => {
    const { app } = setup();
    const res = await app.request('/users');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('creates a user and returns 201 with the created record', async () => {
    const { app } = setup();
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: 'hashed',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: 'hashed',
    });
    expect(typeof body.id).toBe('string');
    expect(typeof body.createdAt).toBe('string');
  });

  it('rejects POST with missing fields', async () => {
    const { app } = setup();
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'no-email' }),
    });
    expect(res.status).toBe(400);
  });

  it('lists users after creation', async () => {
    const { app, repos } = setup();
    await repos.users.create({
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: 'h',
    });
    const res = await app.request('/users');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].username).toBe('bob');
  });

  it('GET /users/:id returns 404 for missing user', async () => {
    const { app } = setup();
    const res = await app.request('/users/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('GET /users/:id returns the user when present', async () => {
    const { app, repos } = setup();
    const created = await repos.users.create({
      username: 'carol',
      email: 'carol@example.com',
      passwordHash: 'h',
    });
    const res = await app.request(`/users/${created.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.username).toBe('carol');
  });
});
