import { Lesson, NewLesson } from '../../types/models';
import { LessonRepository } from '../types';

export class InMemoryLessonRepository implements LessonRepository {
  private store = new Map<string, Lesson>();
  private counter = 0;

  async list(): Promise<Lesson[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<Lesson | null> {
    return this.store.get(id) ?? null;
  }

  async create(input: NewLesson): Promise<Lesson> {
    const id = `mem-lesson-${++this.counter}`;
    const lesson: Lesson = { id, ...input };
    this.store.set(id, lesson);
    return lesson;
  }
}
