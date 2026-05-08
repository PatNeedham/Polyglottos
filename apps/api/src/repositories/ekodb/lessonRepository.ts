import { EkoDBClient, extractRecordId } from '@ekodb/ekodb-client';
import { compact } from '../../lib/document';
import { COLLECTIONS } from '../../lib/ekodb';
import { unwrapRecord } from '../../lib/unwrap';
import { Lesson, NewLesson } from '../../types/models';
import { LessonRepository } from '../types';

interface LessonDocument {
  languageId: string;
  lessonName: string;
  id?: string;
}

function toLesson(record: unknown): Lesson {
  const data = unwrapRecord<LessonDocument>(record);
  const id = extractRecordId(record as never) ?? data.id ?? '';
  return {
    id,
    languageId: data.languageId,
    lessonName: data.lessonName,
  };
}

export class EkoDBLessonRepository implements LessonRepository {
  constructor(private client: EkoDBClient) {}

  async list(): Promise<Lesson[]> {
    const records = await this.client.find(COLLECTIONS.lessons, { limit: 1000 });
    return records.map(toLesson);
  }

  async getById(id: string): Promise<Lesson | null> {
    try {
      const record = await this.client.findById(COLLECTIONS.lessons, id);
      return record ? toLesson(record) : null;
    } catch (err) {
      if (isNotFoundError(err)) return null;
      throw err;
    }
  }

  async create(input: NewLesson): Promise<Lesson> {
    const doc = compact({ ...input });
    const inserted = await this.client.insert(COLLECTIONS.lessons, doc);
    const id =
      extractRecordId(inserted as never) ??
      (unwrapRecord<{ id?: string }>(inserted).id ?? '');
    return { id, ...doc } as Lesson;
  }
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const message = (err as { message?: string }).message ?? '';
  return /not.?found/i.test(message) || (err as { status?: number }).status === 404;
}
