#!/usr/bin/env node
// Seeds the API with example data by POSTing to the local (or remote) endpoints.
//
// Usage:
//   npm run seed                          # targets http://localhost:8787
//   API_BASE_URL=https://my-api npm run seed
//
// The script does NOT read or use EKODB_API_KEY directly — credentials live
// only in `.dev.vars` (or wrangler secrets), and the running API uses them.
// Re-running creates duplicates; ekoDB will assign each insert a fresh ID.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const BASE_URL = (process.env.API_BASE_URL || 'http://localhost:8787').replace(
  /\/$/,
  ''
);
const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../test-data');

async function loadJson(name) {
  const path = resolve(DATA_DIR, name);
  return JSON.parse(await readFile(path, 'utf8'));
}

async function postJson(path, body) {
  const url = `${BASE_URL}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(
      `Cannot reach ${url}. Is the API running? (npm start in apps/api)\n${err.message}`
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}\n${text}`);
  }
  return res.json();
}

async function main() {
  console.log(`Seeding ${BASE_URL} ...\n`);

  // Users — POST each, collect created IDs in input order
  const usersInput = await loadJson('users.json');
  const createdUsers = [];
  for (const user of usersInput) {
    const created = await postJson('/users', user);
    if (!created || typeof created !== 'object' || !created.id) {
      throw new Error(
        `Unexpected POST /users response shape: ${JSON.stringify(created)}`
      );
    }
    createdUsers.push(created);
    const name = created.username ?? user.username ?? '?';
    console.log(`  user  ${String(name).padEnd(8)} → ${created.id}`);
  }

  // Lessons — independent of users
  const lessonsInput = await loadJson('lessons.json');
  const createdLessons = [];
  for (const lesson of lessonsInput) {
    const created = await postJson('/lessons', lesson);
    if (!created || typeof created !== 'object' || !created.id) {
      throw new Error(
        `Unexpected POST /lessons response shape: ${JSON.stringify(created)}`
      );
    }
    createdLessons.push(created);
    const name = created.lessonName ?? lesson.lessonName ?? '?';
    console.log(`  lesson "${name}" → ${created.id}`);
  }

  // Forum comments — each entry references a user via authorIndex (0-based
  // index into users.json). Resolve those into real created user IDs.
  const commentsInput = await loadJson('forumComments.json');
  for (const comment of commentsInput) {
    const author = createdUsers[comment.authorIndex];
    if (!author) {
      throw new Error(
        `forumComments.json: authorIndex ${comment.authorIndex} is out of range`
      );
    }
    const payload = {
      userId: author.id,
      quizId: comment.quizId,
      content: comment.content,
    };
    const created = await postJson('/forum-comments', payload);
    console.log(
      `  comment by ${author.username} on ${comment.quizId} → ${created.id}`
    );
  }

  console.log(
    `\nDone. Inserted ${createdUsers.length} users, ${createdLessons.length} lessons, ${commentsInput.length} forum comments.`
  );
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
