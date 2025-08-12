import {
  StorageService,
  UserData,
  ProgressData,
  SettingsData,
  SessionData,
  StorageError,
  StorageConfig,
} from './types';

/**
 * Cloud storage service implementation using the existing API backend
 */
export class CloudStorageService implements StorageService {
  private baseUrl: string;
  private timeout: number;

  constructor(config: StorageConfig) {
    this.baseUrl = config.apiBaseUrl || 'http://localhost:3000/api';
    this.timeout = config.timeout || 5000;
  }

  private createError(code: string, message: string, recoverable: boolean): StorageError {
    const error = new Error(message) as StorageError;
    error.code = code;
    error.recoverable = recoverable;
    return error;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw this.createError(
          'API_ERROR',
          `API request failed with status ${response.status}`,
          response.status >= 500
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('TIMEOUT_ERROR', 'Request timed out', true);
      }
      if (error instanceof StorageError) {
        throw error;
      }
      throw this.createError('NETWORK_ERROR', 'Network request failed', true);
    }
  }

  // User data operations
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}`);
      const data = await response.json();
      return data || null;
    } catch (error) {
      if (error instanceof StorageError && error.code === 'API_ERROR' && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async setUserData(userData: UserData): Promise<void> {
    await this.fetchWithTimeout(`${this.baseUrl}/users/${userData.id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUserData(userId: string): Promise<void> {
    await this.fetchWithTimeout(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Progress data operations
  async getProgressData(userId: string): Promise<ProgressData | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/progress/${userId}`);
      const data = await response.json();
      return data || null;
    } catch (error) {
      if (error instanceof StorageError && error.code === 'API_ERROR' && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async setProgressData(progressData: ProgressData): Promise<void> {
    await this.fetchWithTimeout(`${this.baseUrl}/progress/${progressData.userId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
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
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/settings/${userId}`);
      const data = await response.json();
      return data || null;
    } catch (error) {
      if (error instanceof StorageError && error.code === 'API_ERROR' && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async setSettings(settings: SettingsData): Promise<void> {
    await this.fetchWithTimeout(`${this.baseUrl}/settings/${settings.userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
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
    // For cloud storage, we'll use localStorage as a fallback for session data
    // since session data is typically stored client-side
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const sessionData = localStorage.getItem('polyglottos_session');
      return sessionData ? JSON.parse(sessionData) : {};
    } catch (error) {
      console.error('Error reading session from localStorage:', error);
      return {};
    }
  }

  async setSession(sessionData: SessionData): Promise<void> {
    // For cloud storage, we'll use localStorage as a fallback for session data
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('polyglottos_session', JSON.stringify(sessionData));
    } catch (error) {
      throw this.createError('SESSION_ERROR', 'Failed to save session data', true);
    }
  }

  async clearSession(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem('polyglottos_session');
    } catch (error) {
      throw this.createError('SESSION_ERROR', 'Failed to clear session data', true);
    }
  }

  // General operations
  async isAvailable(): Promise<boolean> {
    try {
      // Test connectivity by making a lightweight request
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async clear(): Promise<void> {
    throw this.createError(
      'UNSUPPORTED_OPERATION',
      'Clear operation not supported for cloud storage',
      false
    );
  }
}