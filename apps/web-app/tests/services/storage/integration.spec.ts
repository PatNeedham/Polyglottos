import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserDataManager, StorageConfigManager } from '../../../app/services/storage/examples';
import { StorageFactory } from '../../../app/services/storage/StorageFactory';

// Mock IndexedDB and fetch for integration tests
const mockIndexedDB = {
  open: vi.fn(),
  databases: vi.fn(),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

global.fetch = vi.fn();

describe('Storage Service Integration', () => {
  let userManager: UserDataManager;
  let mockDB: any;
  let mockTransaction: any;
  let mockStore: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    StorageFactory.resetInstance();

    // Mock IndexedDB components
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

    const mockRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
      result: mockDB,
    };

    mockIndexedDB.open.mockReturnValue(mockRequest);

    // Simulate successful database operations
    setTimeout(() => {
      if (mockRequest.onsuccess) mockRequest.onsuccess();
    }, 0);

    userManager = new UserDataManager();
  });

  describe('Complete user workflow', () => {
    it('should handle full user lifecycle with local storage', async () => {
      const userId = 'test-user-123';
      const username = 'testuser';
      const email = 'test@example.com';

      // Mock all IndexedDB operations to succeed
      const mockSuccessRequest = { onsuccess: null as any };
      mockStore.put.mockReturnValue(mockSuccessRequest);
      mockStore.get.mockReturnValue({ 
        onsuccess: null as any, 
        result: null 
      });

      // Mock index for progress queries
      const mockIndex = { get: vi.fn() };
      mockStore.index.mockReturnValue(mockIndex);
      mockIndex.get.mockReturnValue({ 
        onsuccess: null as any, 
        result: null 
      });

      // Initialize user
      const initPromise = userManager.initializeUser(userId, username, email);
      
      // Simulate all async operations succeeding
      setTimeout(() => {
        if (mockSuccessRequest.onsuccess) mockSuccessRequest.onsuccess();
      }, 0);

      await initPromise;

      // Verify IndexedDB operations were called
      expect(mockStore.put).toHaveBeenCalledTimes(3); // user, progress, settings

      // Test login
      const loginPromise = userManager.loginUser(userId);
      setTimeout(() => {
        if (mockSuccessRequest.onsuccess) mockSuccessRequest.onsuccess();
      }, 0);
      await loginPromise;

      // Test getting current user
      const mockSessionRequest = { 
        onsuccess: null as any, 
        result: { key: 'current', data: { userId } }
      };
      mockStore.get.mockReturnValue(mockSessionRequest);

      const currentUserPromise = userManager.getCurrentUserId();
      setTimeout(() => {
        if (mockSessionRequest.onsuccess) mockSessionRequest.onsuccess();
      }, 0);
      
      const currentUserId = await currentUserPromise;
      expect(currentUserId).toBe(userId);
    });

    it('should handle storage configuration switching', () => {
      // Test different storage configurations
      const cloudConfig = StorageConfigManager.getCloudConfig();
      expect(cloudConfig.type).toBe('cloud');
      expect(cloudConfig.fallbackType).toBe('local');
      expect(cloudConfig.timeout).toBe(10000);

      const localConfig = StorageConfigManager.getLocalConfig();
      expect(localConfig.type).toBe('local');
      expect(localConfig.fallbackType).toBe('cloud');
      expect(localConfig.timeout).toBe(5000);

      const offlineConfig = StorageConfigManager.getOfflineConfig();
      expect(offlineConfig.type).toBe('local');
      expect(offlineConfig.fallbackType).toBeUndefined();
    });
  });

  describe('Error handling and fallback', () => {
    it('should handle storage unavailability gracefully', async () => {
      // Mock IndexedDB as unavailable
      Object.defineProperty(global, 'indexedDB', {
        value: undefined,
        writable: true,
      });

      const healthCheck = await userManager.checkStorageHealth();
      expect(healthCheck).toBe(false);
    });

    it('should handle data export functionality', async () => {
      const userId = 'test-user-123';
      
      // Mock successful data retrieval
      const userData = { id: userId, username: 'test', email: 'test@example.com' };
      const progressData = { id: 'progress-1', userId, questionsAnswered: 10, correctAnswers: 8, quizzesTaken: 2, lastUpdated: '2024-01-01' };
      const settings = { userId, theme: 'dark', language: 'en' };

      const mockUserRequest = { onsuccess: null as any, result: userData };
      const mockProgressRequest = { onsuccess: null as any, result: progressData };
      const mockSettingsRequest = { onsuccess: null as any, result: settings };

      mockStore.get
        .mockReturnValueOnce(mockUserRequest)     // getUserData call
        .mockReturnValueOnce(mockSettingsRequest); // getSettings call

      // Mock index for progress data
      const mockIndex = { get: vi.fn() };
      mockStore.index.mockReturnValue(mockIndex);
      mockIndex.get.mockReturnValue(mockProgressRequest);

      const exportPromise = userManager.exportUserData(userId);

      // Simulate async operations
      setTimeout(() => {
        if (mockUserRequest.onsuccess) mockUserRequest.onsuccess();
        if (mockProgressRequest.onsuccess) mockProgressRequest.onsuccess();
        if (mockSettingsRequest.onsuccess) mockSettingsRequest.onsuccess();
      }, 0);

      const exportData = await exportPromise;
      
      expect(exportData).toHaveProperty('user', userData);
      expect(exportData).toHaveProperty('progress', progressData);
      expect(exportData).toHaveProperty('settings', settings);
      expect(exportData).toHaveProperty('exportDate');
    });
  });

  describe('Feature parity validation', () => {
    it('should support all required data operations', () => {
      // Verify UserDataManager has all required methods
      expect(typeof userManager.initializeUser).toBe('function');
      expect(typeof userManager.updateQuizProgress).toBe('function');
      expect(typeof userManager.getDashboardData).toBe('function');
      expect(typeof userManager.updateUserPreferences).toBe('function');
      expect(typeof userManager.loginUser).toBe('function');
      expect(typeof userManager.logoutUser).toBe('function');
      expect(typeof userManager.isUserLoggedIn).toBe('function');
      expect(typeof userManager.getCurrentUserId).toBe('function');
      expect(typeof userManager.checkStorageHealth).toBe('function');
      expect(typeof userManager.exportUserData).toBe('function');
    });

    it('should support configuration switching', () => {
      const configs = [
        StorageConfigManager.getCloudConfig(),
        StorageConfigManager.getLocalConfig(),
        StorageConfigManager.getOfflineConfig(),
      ];

      configs.forEach(config => {
        expect(config).toHaveProperty('type');
        expect(config).toHaveProperty('timeout');
        expect(['local', 'cloud']).toContain(config.type);
      });
    });
  });
});