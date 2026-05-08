import { EkoDBClient, extractRecordId } from '@ekodb/ekodb-client';
import { compact } from '../../lib/document';
import { COLLECTIONS } from '../../lib/ekodb';
import { unwrapRecord } from '../../lib/unwrap';
import { NewUser, User } from '../../types/models';
import { UserRepository } from '../types';

interface UserDocument {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  id?: string;
}

function toUser(record: unknown): User {
  const data = unwrapRecord<UserDocument>(record);
  const id = extractRecordId(record as never) ?? data.id ?? '';
  return {
    id,
    username: data.username,
    email: data.email,
    passwordHash: data.passwordHash,
    createdAt: data.createdAt,
  };
}

export class EkoDBUserRepository implements UserRepository {
  constructor(private client: EkoDBClient) {}

  async list(): Promise<User[]> {
    const records = await this.client.find(COLLECTIONS.users, { limit: 1000 });
    return records.map(toUser);
  }

  async getById(id: string): Promise<User | null> {
    try {
      const record = await this.client.findById(COLLECTIONS.users, id);
      return record ? toUser(record) : null;
    } catch (err) {
      if (isNotFoundError(err)) return null;
      throw err;
    }
  }

  async create(input: NewUser): Promise<User> {
    const doc = compact({
      ...input,
      createdAt: new Date().toISOString(),
    });
    const inserted = await this.client.insert(COLLECTIONS.users, doc);
    const id =
      extractRecordId(inserted as never) ??
      (unwrapRecord<{ id?: string }>(inserted).id ?? '');
    return { id, ...doc } as User;
  }
}

function isNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const message = (err as { message?: string }).message ?? '';
  return /not.?found/i.test(message) || (err as { status?: number }).status === 404;
}
