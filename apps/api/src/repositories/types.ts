import {
  ForumComment,
  Lesson,
  NewForumComment,
  NewLesson,
  NewUser,
  User,
} from '../types/models';

export interface UserRepository {
  list(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(input: NewUser): Promise<User>;
}

export interface LessonRepository {
  list(): Promise<Lesson[]>;
  getById(id: string): Promise<Lesson | null>;
  create(input: NewLesson): Promise<Lesson>;
}

export interface ForumCommentRepository {
  list(): Promise<ForumComment[]>;
  getById(id: string): Promise<ForumComment | null>;
  create(input: NewForumComment): Promise<ForumComment>;
}

export interface Repositories {
  users: UserRepository;
  lessons: LessonRepository;
  forumComments: ForumCommentRepository;
}
