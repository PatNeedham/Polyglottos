import { EkoDBClient, extractRecordId } from '@ekodb/ekodb-client';
import { compact } from '../../lib/document';
import { COLLECTIONS } from '../../lib/ekodb';
import { unwrapRecord } from '../../lib/unwrap';
import { ForumComment, NewForumComment } from '../../types/models';
import { ForumCommentRepository } from '../types';

interface ForumCommentDocument {
  userId: string;
  quizId: string;
  content: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  id?: string;
}

function toForumComment(record: unknown): ForumComment {
  const data = unwrapRecord<ForumCommentDocument>(record);
  const id = extractRecordId(record as never) ?? data.id ?? '';
  return {
    id,
    userId: data.userId,
    quizId: data.quizId,
    content: data.content,
    parentId: data.parentId,
    upvotes: data.upvotes,
    downvotes: data.downvotes,
    createdAt: data.createdAt,
  };
}

export class EkoDBForumCommentRepository implements ForumCommentRepository {
  constructor(private client: EkoDBClient) {}

  async list(): Promise<ForumComment[]> {
    const records = await this.client.find(COLLECTIONS.forumComments, {
      limit: 1000,
    });
    return records.map(toForumComment);
  }

  async getById(id: string): Promise<ForumComment | null> {
    try {
      const record = await this.client.findById(COLLECTIONS.forumComments, id);
      return record ? toForumComment(record) : null;
    } catch (err) {
      if (isNotFoundError(err)) return null;
      throw err;
    }
  }

  async create(input: NewForumComment): Promise<ForumComment> {
    const doc = compact({
      ...input,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    });
    const inserted = await this.client.insert(COLLECTIONS.forumComments, doc);
    const id =
      extractRecordId(inserted as never) ??
      (unwrapRecord<{ id?: string }>(inserted).id ?? '');
    return { id, ...doc } as ForumComment;
  }
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const message = (err as { message?: string }).message ?? '';
  return /not.?found/i.test(message) || (err as { status?: number }).status === 404;
}
