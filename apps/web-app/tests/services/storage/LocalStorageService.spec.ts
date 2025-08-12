import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from '../../../app/services/storage/LocalStorageService';
import { UserData, ProgressData, SettingsData } from '../../../app/services/storage/types';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  databases: vi.fn(),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockDB: any;
  let mockTransaction: any;
  let mockStore: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock IndexedDB objects
    mockStore = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      createIndex: vi.fn(),
      index: vi.fn(),
      clear: vi.fn(),
    };

    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockStore),
    };

    mockDB = {
      transaction: vi.fn().mockReturnValue(mockTransaction),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false),
      },
      createObjectStore: vi.fn().mockReturnValue(mockStore),
    };

    // Mock IndexedDB.open
    const mockRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      result: mockDB,
    };

    mockIndexedDB.open.mockReturnValue(mockRequest);

    service = new LocalStorageService();

    // Simulate successful database opening
    setTimeout(() => {
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess();
      }
    }, 0);
  });

  describe('isAvailable', () => {
    it('should return true when IndexedDB is available', async () => {
      const available = await service.isAvailable();
      expect(available).toBe(true);
    });

    it('should return false when IndexedDB is not available', async () => {
      // Mock IndexedDB as undefined
      Object.defineProperty(global, 'indexedDB', {
        value: undefined,
        writable: true,
      });

      const newService = new LocalStorageService();
      const available = await newService.isAvailable();
      expect(available).toBe(false);
    });
  });

  describe('Session operations', () => {
    it('should get empty session when none exists', async () => {
      // Mock store.get to return undefined
      const mockRequest = { onsuccess: null as any, result: undefined };
      mockStore.get.mockReturnValue(mockRequest);

      const sessionPromise = service.getSession();
      
      // Simulate successful request
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      const session = await sessionPromise;
      expect(session).toEqual({});
    });

    it('should set session data', async () => {
      const sessionData = { userId: 'test-user', theme: 'dark' };
      
      // Mock store.put
      const mockRequest = { onsuccess: null as any };
      mockStore.put.mockReturnValue(mockRequest);

      const setPromise = service.setSession(sessionData);
      
      // Simulate successful request
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await setPromise;
      expect(mockStore.put).toHaveBeenCalledWith({ key: 'current', data: sessionData });
    });
  });

  describe('User data operations', () => {
    it('should get user data', async () => {
      const userData: UserData = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Mock store.get
      const mockRequest = { onsuccess: null as any, result: userData };
      mockStore.get.mockReturnValue(mockRequest);

      const userDataPromise = service.getUserData('user-1');
      
      // Simulate successful request
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      const result = await userDataPromise;
      expect(result).toEqual(userData);
      expect(mockStore.get).toHaveBeenCalledWith('user-1');
    });

    it('should set user data', async () => {
      const userData: UserData = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      };

      // Mock store.put
      const mockRequest = { onsuccess: null as any };
      mockStore.put.mockReturnValue(mockRequest);

      const setPromise = service.setUserData(userData);
      
      // Simulate successful request
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 0);

      await setPromise;
      expect(mockStore.put).toHaveBeenCalledWith(userData);
    });
  });

  describe('Progress data operations', () => {
    it('should update progress data', async () => {
      const existingProgress: ProgressData = {
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 10,
        correctAnswers: 8,
        quizzesTaken: 2,
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      // Mock index.get for getting existing progress
      const mockIndex = { get: vi.fn() };
      mockStore.index.mockReturnValue(mockIndex);
      
      const mockGetRequest = { onsuccess: null as any, result: existingProgress };
      mockIndex.get.mockReturnValue(mockGetRequest);

      // Mock store.put for updating
      const mockPutRequest = { onsuccess: null as any };
      mockStore.put.mockReturnValue(mockPutRequest);

      const updatePromise = service.updateProgress('user-1', { questionsAnswered: 15 });
      
      // Simulate successful get request
      setTimeout(() => {
        if (mockGetRequest.onsuccess) {
          mockGetRequest.onsuccess();
        }
      }, 0);

      // Simulate successful put request
      setTimeout(() => {
        if (mockPutRequest.onsuccess) {
          mockPutRequest.onsuccess();
        }
      }, 10);

      await updatePromise;
      
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingProgress,
          questionsAnswered: 15,
          lastUpdated: expect.any(String),
        })
      );
    });
  });
});