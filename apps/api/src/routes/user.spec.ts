import { createApp } from '../index';
import { createInMemoryRepositories } from '../repositories/memory/repositories';
import { verifyPassword } from '../lib/password';

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

  it('creates a user, hashes the password server-side, and never leaks the hash', async () => {
    const { app, repos } = setup();
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'alice',
        email: 'alice@example.com',
        password: 'correct horse battery staple',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      username: 'alice',
      email: 'alice@example.com',
    });
    expect(body).not.toHaveProperty('passwordHash');
    expect(body).not.toHaveProperty('password');

    // The repository got a hash, not the plaintext password
    const stored = await repos.users.getById(body.id);
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toContain('correct horse');
    expect(stored?.passwordHash.startsWith('pbkdf2-sha256$')).toBe(true);

    // And that hash actually verifies the original password
    expect(await verifyPassword('correct horse battery staple', stored!.passwordHash)).toBe(true);
    expect(await verifyPassword('wrong password', stored!.passwordHash)).toBe(false);
  }, 30_000);

  it('rejects POST with missing fields', async () => {
    const { app } = setup();
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'no-email' }),
    });
    expect(res.status).toBe(400);
  });

  it('rejects POST with a too-short password', async () => {
    const { app } = setup();
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'bob',
        email: 'bob@example.com',
        password: 'short',
      }),
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/at least.*characters/i);
  });

  it('lists users after creation, without leaking password hashes', async () => {
    const { app, repos } = setup();
    await repos.users.create({
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: 'pbkdf2-sha256$1$c2FsdA==$aGFzaA==',
    });
    const res = await app.request('/users');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].username).toBe('bob');
    expect(body[0]).not.toHaveProperty('passwordHash');
  });

  it('GET /users/:id returns 404 for missing user', async () => {
    const { app } = setup();
    const res = await app.request('/users/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('GET /users/:id returns the user without the password hash', async () => {
    const { app, repos } = setup();
    const created = await repos.users.create({
      username: 'carol',
      email: 'carol@example.com',
      passwordHash: 'pbkdf2-sha256$1$c2FsdA==$aGFzaA==',
    });
    const res = await app.request(`/users/${created.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.username).toBe('carol');
    expect(body).not.toHaveProperty('passwordHash');
  });
});
