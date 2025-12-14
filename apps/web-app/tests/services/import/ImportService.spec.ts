import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportService } from '../../../app/services/import/ImportService';
import { StorageService, UserData, ProgressData, SettingsData, SessionData } from '../../../app/services/storage/types';
import { ImportData, ImportProgress } from '../../../app/services/import/types';

// Mock StorageService
class MockStorageService implements StorageService {
  private users = new Map<string, UserData>();
  private progress = new Map<string, ProgressData>();
  private settings = new Map<string, SettingsData>();
  private session: SessionData = {};

  async getUserData(userId: string): Promise<UserData | null> {
    return this.users.get(userId) || null;
  }

  async setUserData(userData: UserData): Promise<void> {
    this.users.set(userData.id, userData);
  }

  async deleteUserData(userId: string): Promise<void> {
    this.users.delete(userId);
  }

  async getProgressData(userId: string): Promise<ProgressData | null> {
    return this.progress.get(userId) || null;
  }

  async setProgressData(progressData: ProgressData): Promise<void> {
    this.progress.set(progressData.userId, progressData);
  }

  async updateProgress(userId: string, updates: Partial<ProgressData>): Promise<void> {
    const existing = this.progress.get(userId) || {} as ProgressData;
    this.progress.set(userId, { ...existing, ...updates });
  }

  async getSettings(userId: string): Promise<SettingsData | null> {
    return this.settings.get(userId) || null;
  }

  async setSettings(settings: SettingsData): Promise<void> {
    this.settings.set(settings.userId, settings);
  }

  async updateSettings(userId: string, updates: Partial<SettingsData>): Promise<void> {
    const existing = this.settings.get(userId) || {} as SettingsData;
    this.settings.set(userId, { ...existing, ...updates });
  }

  async getSession(): Promise<SessionData> {
    return this.session;
  }

  async setSession(sessionData: SessionData): Promise<void> {
    this.session = sessionData;
  }

  async clearSession(): Promise<void> {
    this.session = {};
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async clear(): Promise<void> {
    this.users.clear();
    this.progress.clear();
    this.settings.clear();
    this.session = {};
  }
}

describe('ImportService', () => {
  let storage: MockStorageService;
  let importService: ImportService;

  beforeEach(() => {
    storage = new MockStorageService();
    importService = new ImportService(storage);
  });

  describe('importJSON', () => {
    it('should import valid JSON data', async () => {
      const jsonData = JSON.stringify({
        users: [{
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com'
        }]
      });

      const result = await importService.importJSON(jsonData);

      expect(result.success).toBe(true);
      expect(result.imported.users).toBe(1);
      expect(result.errors).toHaveLength(0);

      const user = await storage.getUserData('user-1');
      expect(user?.username).toBe('testuser');
    });

    it('should handle invalid JSON', async () => {
      const invalidJson = '{ invalid json }';

      const result = await importService.importJSON(invalidJson);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid JSON');
    });

    it('should validate data before importing', async () => {
      const jsonData = JSON.stringify({
        users: [{
          id: '',
          username: 'testuser',
          email: 'test@example.com'
        }]
      });

      const result = await importService.importJSON(jsonData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('importCSV', () => {
    it('should import valid CSV data', async () => {
      const csv = `id,username,email
user-1,testuser,test@example.com`;

      const result = await importService.importCSV(csv, 'users');

      expect(result.success).toBe(true);
      expect(result.imported.users).toBe(1);

      const user = await storage.getUserData('user-1');
      expect(user?.username).toBe('testuser');
    });

    it('should handle CSV parsing errors', async () => {
      const csv = `id,username
user-1,testuser`;

      const result = await importService.importCSV(csv, 'users');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('importData with merge strategies', () => {
    it('should skip existing data with "skip" strategy', async () => {
      // Add existing user
      await storage.setUserData({
        id: 'user-1',
        username: 'existing',
        email: 'existing@example.com'
      });

      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'new',
          email: 'new@example.com'
        }]
      };

      const result = await importService.importData(data, { mergeStrategy: 'skip' });

      expect(result.skipped.users).toBe(1);
      expect(result.imported.users).toBe(0);

      const user = await storage.getUserData('user-1');
      expect(user?.username).toBe('existing');
    });

    it('should overwrite existing data with "overwrite" strategy', async () => {
      await storage.setUserData({
        id: 'user-1',
        username: 'existing',
        email: 'existing@example.com'
      });

      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'new',
          email: 'new@example.com'
        }]
      };

      const result = await importService.importData(data, { mergeStrategy: 'overwrite' });

      expect(result.imported.users).toBe(1);
      expect(result.skipped.users).toBe(0);

      const user = await storage.getUserData('user-1');
      expect(user?.username).toBe('new');
    });

    it('should merge data with "merge" strategy', async () => {
      await storage.setUserData({
        id: 'user-1',
        username: 'existing',
        email: 'existing@example.com',
        createdAt: '2024-01-01'
      });

      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'new',
          email: 'new@example.com'
        }]
      };

      const result = await importService.importData(data, { mergeStrategy: 'merge' });

      expect(result.imported.users).toBe(1);

      const user = await storage.getUserData('user-1');
      expect(user?.username).toBe('new');
      expect(user?.createdAt).toBe('2024-01-01');
    });

    it('should merge progress by summing values', async () => {
      await storage.setProgressData({
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 50,
        correctAnswers: 40,
        quizzesTaken: 5,
        lastUpdated: '2024-01-01'
      });

      const data: ImportData = {
        progress: [{
          id: 'progress-1',
          userId: 'user-1',
          questionsAnswered: 30,
          correctAnswers: 25,
          quizzesTaken: 3,
          lastUpdated: '2024-01-02'
        }]
      };

      const result = await importService.importData(data, { mergeStrategy: 'merge' });

      expect(result.imported.progress).toBe(1);

      const progress = await storage.getProgressData('user-1');
      expect(progress?.questionsAnswered).toBe(80);
      expect(progress?.correctAnswers).toBe(65);
      expect(progress?.quizzesTaken).toBe(8);
    });
  });

  describe('progress reporting', () => {
    it('should report progress during import', async () => {
      const progressUpdates: ImportProgress[] = [];
      
      const data: ImportData = {
        users: [
          { id: 'user-1', username: 'user1', email: 'user1@example.com' },
          { id: 'user-2', username: 'user2', email: 'user2@example.com' }
        ]
      };

      await importService.importData(data, {
        onProgress: (progress) => progressUpdates.push(progress)
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].phase).toBe('validating');
    });
  });

  describe('validateOnly option', () => {
    it('should only validate without importing when validateOnly is true', async () => {
      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com'
        }]
      };

      const result = await importService.importData(data, { validateOnly: true });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      const user = await storage.getUserData('user-1');
      expect(user).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should collect and report errors for failed imports', async () => {
      // Create a properly typed error mock that extends MockStorageService
      class ErrorMockStorageService extends MockStorageService {
        async setUserData() {
          throw new Error('Storage error');
        }
      }

      const mockStorage = new ErrorMockStorageService();
      const errorImportService = new ImportService(mockStorage);

      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com'
        }]
      };

      const result = await errorImportService.importData(data);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.skipped.users).toBe(1);
    });
  });

  describe('migrateToCloud', () => {
    it('should migrate data from local to cloud storage', async () => {
      // Setup local storage with data
      await storage.setSession({ userId: 'user-1' });
      await storage.setUserData({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com'
      });
      await storage.setProgressData({
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 100,
        correctAnswers: 85,
        quizzesTaken: 10,
        lastUpdated: '2024-01-01'
      });

      const cloudStorage = new MockStorageService();
      const result = await importService.migrateToCloud(cloudStorage);

      expect(result.success).toBe(true);
      expect(result.imported.users).toBe(1);
      expect(result.imported.progress).toBe(1);

      const migratedUser = await cloudStorage.getUserData('user-1');
      expect(migratedUser?.username).toBe('testuser');
    });
  });
});
