import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('This is the Polyglottos API!'));

app.get('/api', (c) => c.json({ a: 'b' }));

export default app;
