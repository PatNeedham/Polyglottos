import {
  StorageService,
  UserData,
  ProgressData,
  SettingsData,
  SessionData,
  StorageError,
} from './types';

/**
 * Local storage service implementation using IndexedDB
 */
export class LocalStorageService implements StorageService {
  private dbName = 'polyglottos_local_storage';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(this.createError('DB_OPEN_ERROR', 'Failed to open IndexedDB', false));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'userId' });
        }

        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session', { keyPath: 'key' });
        }
      };
    });
  }

  private createError(code: string, message: string, recoverable: boolean): StorageError {
    const error = new Error(message) as StorageError;
    error.code = code;
    error.recoverable = recoverable;
    return error;
  }

  private async getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(this.createError('GET_ERROR', `Failed to get ${key} from ${storeName}`, true));
        };
      });
    } catch (error) {
      throw this.createError('GET_ERROR', `Failed to get ${key} from ${storeName}`, true);
    }
  }

  private async setToStore<T>(storeName: string, data: T): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          reject(this.createError('SET_ERROR', `Failed to set data in ${storeName}`, true));
        };
      });
    } catch (error) {
      throw this.createError('SET_ERROR', `Failed to set data in ${storeName}`, true);
    }
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          reject(this.createError('DELETE_ERROR', `Failed to delete ${key} from ${storeName}`, true));
        };
      });
    } catch (error) {
      throw this.createError('DELETE_ERROR', `Failed to delete ${key} from ${storeName}`, true);
    }
  }

  // User data operations
  async getUserData(userId: string): Promise<UserData | null> {
    return this.getFromStore<UserData>('users', userId);
  }

  async setUserData(userData: UserData): Promise<void> {
    await this.setToStore('users', userData);
  }

  async deleteUserData(userId: string): Promise<void> {
    await this.deleteFromStore('users', userId);
  }

  // Progress data operations
  async getProgressData(userId: string): Promise<ProgressData | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const index = store.index('userId');
      const request = index.get(userId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(this.createError('GET_ERROR', `Failed to get progress for user ${userId}`, true));
        };
      });
    } catch (error) {
      throw this.createError('GET_ERROR', `Failed to get progress for user ${userId}`, true);
    }
  }

  async setProgressData(progressData: ProgressData): Promise<void> {
    await this.setToStore('progress', progressData);
  }

  async updateProgress(userId: string, updates: Partial<ProgressData>): Promise<void> {
    const existingProgress = await this.getProgressData(userId);
    if (existingProgress) {
      const updatedProgress = { ...existingProgress, ...updates, lastUpdated: new Date().toISOString() };
      await this.setProgressData(updatedProgress);
    } else {
      // Create new progress record
      const newProgress: ProgressData = {
        id: `progress_${userId}_${Date.now()}`,
        userId,
        questionsAnswered: 0,
        correctAnswers: 0,
        quizzesTaken: 0,
        lastUpdated: new Date().toISOString(),
        ...updates,
      };
      await this.setProgressData(newProgress);
    }
  }

  // Settings operations
  async getSettings(userId: string): Promise<SettingsData | null> {
    return this.getFromStore<SettingsData>('settings', userId);
  }

  async setSettings(settings: SettingsData): Promise<void> {
    await this.setToStore('settings', settings);
  }

  async updateSettings(userId: string, updates: Partial<SettingsData>): Promise<void> {
    const existingSettings = await this.getSettings(userId);
    const updatedSettings = existingSettings 
      ? { ...existingSettings, ...updates }
      : { userId, ...updates };
    await this.setSettings(updatedSettings);
  }

  // Session operations
  async getSession(): Promise<SessionData> {
    const sessionWrapper = await this.getFromStore<{ key: string; data: SessionData }>('session', 'current');
    return sessionWrapper?.data || {};
  }

  async setSession(sessionData: SessionData): Promise<void> {
    await this.setToStore('session', { key: 'current', data: sessionData });
  }

  async clearSession(): Promise<void> {
    await this.deleteFromStore('session', 'current');
  }

  // General operations
  async isAvailable(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return false;
      }
      // Try to open the database to verify it's accessible
      await this.openDB();
      return true;
    } catch {
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const storeNames = ['users', 'progress', 'settings', 'session'];
      
      for (const storeName of storeNames) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
        });
      }
    } catch (error) {
      throw this.createError('CLEAR_ERROR', 'Failed to clear local storage', true);
    }
  }
}