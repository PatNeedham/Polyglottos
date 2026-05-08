import { EkoDBClient } from '@ekodb/ekodb-client';

export interface EkoDBEnv {
  EKODB_BASE_URL?: string;
  EKODB_API_KEY?: string;
}

let cached: { client: EkoDBClient; baseURL: string } | null = null;

export async function getEkoDBClient(env: EkoDBEnv): Promise<EkoDBClient> {
  const baseURL = env.EKODB_BASE_URL;
  const apiKey = env.EKODB_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error(
      'ekoDB is not configured. Set EKODB_BASE_URL and EKODB_API_KEY.'
    );
  }

  if (cached && cached.baseURL === baseURL) {
    return cached.client;
  }

  const client = new EkoDBClient({ baseURL, apiKey });
  await client.init();
  cached = { client, baseURL };
  return client;
}

export function resetEkoDBClientForTests(): void {
  cached = null;
}

// ekoDB requires collection names to be lowercase letters, numbers, and underscores.
// Keys are JS-friendly camelCase; values must comply with that constraint.
export const COLLECTIONS = {
  users: 'users',
  lessons: 'lessons',
  forumComments: 'forum_comments',
} as const;
