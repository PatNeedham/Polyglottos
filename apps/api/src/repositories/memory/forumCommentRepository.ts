import { ForumComment, NewForumComment } from '../../types/models';
import { ForumCommentRepository } from '../types';

export class InMemoryForumCommentRepository
  implements ForumCommentRepository
{
  private store = new Map<string, ForumComment>();
  private counter = 0;

  async list(): Promise<ForumComment[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<ForumComment | null> {
    return this.store.get(id) ?? null;
  }

  async create(input: NewForumComment): Promise<ForumComment> {
    const id = `mem-comment-${++this.counter}`;
    const comment: ForumComment = {
      id,
      ...input,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    };
    this.store.set(id, comment);
    return comment;
  }
}
