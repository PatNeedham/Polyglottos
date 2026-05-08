export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  languageId: string;
  lessonName: string;
}

export interface ForumComment {
  id: string;
  userId: string;
  quizId: string;
  content: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export type NewUser = Omit<User, 'id' | 'createdAt'>;
export type NewLesson = Omit<Lesson, 'id'>;
export type NewForumComment = Omit<
  ForumComment,
  'id' | 'createdAt' | 'upvotes' | 'downvotes'
>;
