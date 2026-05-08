import { EkoDBEnv, getEkoDBClient } from '../lib/ekodb';
import { EkoDBForumCommentRepository } from './ekodb/forumCommentRepository';
import { EkoDBLessonRepository } from './ekodb/lessonRepository';
import { EkoDBUserRepository } from './ekodb/userRepository';
import { Repositories } from './types';

export async function createEkoDBRepositories(
  env: EkoDBEnv
): Promise<Repositories> {
  const client = await getEkoDBClient(env);
  return {
    users: new EkoDBUserRepository(client),
    lessons: new EkoDBLessonRepository(client),
    forumComments: new EkoDBForumCommentRepository(client),
  };
}
