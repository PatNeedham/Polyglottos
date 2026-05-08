import { Repositories } from '../types';
import { InMemoryForumCommentRepository } from './forumCommentRepository';
import { InMemoryLessonRepository } from './lessonRepository';
import { InMemoryUserRepository } from './userRepository';

export function createInMemoryRepositories(): Repositories {
  return {
    users: new InMemoryUserRepository(),
    lessons: new InMemoryLessonRepository(),
    forumComments: new InMemoryForumCommentRepository(),
  };
}
