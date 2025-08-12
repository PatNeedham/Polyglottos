import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CloudStorageService } from '../../../app/services/storage/CloudStorageService';
import { StorageConfig } from '../../../app/services/storage/types';

// Mock fetch
global.fetch = vi.fn();

describe('CloudStorageService', () => {
  let service: CloudStorageService;
  let config: StorageConfig;

  beforeEach(() => {
    config = {
      type: 'cloud',
      apiBaseUrl: 'http://localhost:3000/api',
      timeout: 5000,
    };

    service = new CloudStorageService(config);
    vi.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when API is reachable', async () => {
      // Mock successful HEAD request
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      const available = await service.isAvailable();
      expect(available).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/health',
        expect.objectContaining({
          method: 'HEAD',
        })
      );
    });

    it('should return false when API is not reachable', async () => {
      // Mock failed request
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const available = await service.isAvailable();
      expect(available).toBe(false);
    });
  });

  describe('User data operations', () => {
    it('should get user data from API', async () => {
      const userData = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      };

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(userData),
      });

      const result = await service.getUserData('user-1');
      expect(result).toEqual(userData);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/user-1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should return null when user not found', async () => {
      // Mock 404 response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await service.getUserData('user-1');
      expect(result).toBeNull();
    });

    it('should set user data via API', async () => {
      const userData = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      };

      // Mock successful PUT response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await service.setUserData(userData);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/user-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(userData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Progress data operations', () => {
    it('should get progress data from API', async () => {
      const progressData = {
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 10,
        correctAnswers: 8,
        quizzesTaken: 2,
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(progressData),
      });

      const result = await service.getProgressData('user-1');
      expect(result).toEqual(progressData);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/progress/user-1');
    });

    it('should update progress data', async () => {
      const existingProgress = {
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 10,
        correctAnswers: 8,
        quizzesTaken: 2,
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      // Mock get request for existing progress
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce(existingProgress),
        })
        // Mock put request for update
        .mockResolvedValueOnce({
          ok: true,
        });

      await service.updateProgress('user-1', { questionsAnswered: 15 });

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:3000/api/progress/user-1');
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost:3000/api/progress/user-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            ...existingProgress,
            questionsAnswered: 15,
            lastUpdated: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Settings operations', () => {
    it('should get settings from API', async () => {
      const settings = {
        userId: 'user-1',
        language: 'en',
        theme: 'dark',
      };

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(settings),
      });

      const result = await service.getSettings('user-1');
      expect(result).toEqual(settings);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/settings/user-1');
    });
  });

  describe('Session operations', () => {
    beforeEach(() => {
      // Mock localStorage for session operations
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });
    });

    it('should get session from localStorage', async () => {
      const sessionData = { userId: 'user-1', theme: 'dark' };
      (global.localStorage.getItem as any).mockReturnValueOnce(JSON.stringify(sessionData));

      const result = await service.getSession();
      expect(result).toEqual(sessionData);
      expect(localStorage.getItem).toHaveBeenCalledWith('polyglottos_session');
    });

    it('should set session to localStorage', async () => {
      const sessionData = { userId: 'user-1', theme: 'dark' };

      await service.setSession(sessionData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'polyglottos_session',
        JSON.stringify(sessionData)
      );
    });

    it('should clear session from localStorage', async () => {
      await service.clearSession();
      expect(localStorage.removeItem).toHaveBeenCalledWith('polyglottos_session');
    });
  });

  describe('Error handling', () => {
    it('should handle timeout errors', async () => {
      // Mock AbortError
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      (global.fetch as any).mockRejectedValueOnce(abortError);

      await expect(service.getUserData('user-1')).rejects.toMatchObject({
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out',
        recoverable: true,
      });
    });

    it('should handle API errors', async () => {
      // Mock 500 response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getUserData('user-1')).rejects.toMatchObject({
        code: 'API_ERROR',
        message: 'API request failed with status 500',
        recoverable: true,
      });
    });

    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getUserData('user-1')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        recoverable: true,
      });
    });
  });

  describe('unsupported operations', () => {
    it('should throw error for clear operation', async () => {
      await expect(service.clear()).rejects.toMatchObject({
        code: 'UNSUPPORTED_OPERATION',
        message: 'Clear operation not supported for cloud storage',
        recoverable: false,
      });
    });
  });
});