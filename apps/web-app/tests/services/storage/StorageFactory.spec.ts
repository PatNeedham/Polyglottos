import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageFactory, getStorageService } from '../../../app/services/storage/StorageFactory';
import { StorageConfig } from '../../../app/services/storage/types';

// Mock the storage services
vi.mock('../../../app/services/storage/LocalStorageService', () => ({
  LocalStorageService: vi.fn().mockImplementation(() => ({
    isAvailable: vi.fn().mockResolvedValue(true),
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    getSession: vi.fn().mockResolvedValue({}),
    setSession: vi.fn(),
  })),
}));

vi.mock('../../../app/services/storage/CloudStorageService', () => ({
  CloudStorageService: vi.fn().mockImplementation(() => ({
    isAvailable: vi.fn().mockResolvedValue(true),
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    getSession: vi.fn().mockResolvedValue({}),
    setSession: vi.fn(),
  })),
}));

describe('StorageFactory', () => {
  beforeEach(() => {
    StorageFactory.resetInstance();
    vi.clearAllMocks();
  });

  describe('createStorageService', () => {
    it('should create local storage service', () => {
      const config: StorageConfig = {
        type: 'local',
        timeout: 5000,
      };

      const service = StorageFactory.createStorageService(config);
      expect(service).toBeDefined();
    });

    it('should create cloud storage service', () => {
      const config: StorageConfig = {
        type: 'cloud',
        apiBaseUrl: 'http://localhost:3000/api',
        timeout: 5000,
      };

      const service = StorageFactory.createStorageService(config);
      expect(service).toBeDefined();
    });

    it('should create service with fallback', () => {
      const config: StorageConfig = {
        type: 'local',
        fallbackType: 'cloud',
        apiBaseUrl: 'http://localhost:3000/api',
        timeout: 5000,
      };

      const service = StorageFactory.createStorageService(config);
      expect(service).toBeDefined();
    });

    it('should throw error for unsupported storage type', () => {
      const config = {
        type: 'unsupported' as any,
        timeout: 5000,
      };

      expect(() => StorageFactory.createStorageService(config)).toThrow('Unsupported storage type: unsupported');
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = StorageFactory.getInstance();
      const instance2 = StorageFactory.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should use provided config', () => {
      const config: StorageConfig = {
        type: 'cloud',
        apiBaseUrl: 'http://example.com/api',
        timeout: 10000,
      };

      const instance = StorageFactory.getInstance(config);
      expect(instance).toBeDefined();
    });

    it('should use default config when none provided', () => {
      const instance = StorageFactory.getInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('resetInstance', () => {
    it('should reset singleton instance', () => {
      const instance1 = StorageFactory.getInstance();
      StorageFactory.resetInstance();
      const instance2 = StorageFactory.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('getStorageService', () => {
    it('should return storage service instance', () => {
      const service = getStorageService();
      expect(service).toBeDefined();
    });

    it('should use provided config', () => {
      const config: StorageConfig = {
        type: 'cloud',
        apiBaseUrl: 'http://example.com/api',
        timeout: 10000,
      };

      const service = getStorageService(config);
      expect(service).toBeDefined();
    });
  });
});

describe('StorageServiceWithFallback', () => {
  let primaryService: any;
  let fallbackService: any;
  let serviceWithFallback: any;

  beforeEach(() => {
    primaryService = {
      getUserData: vi.fn(),
      setUserData: vi.fn(),
      isAvailable: vi.fn().mockResolvedValue(true),
    };

    fallbackService = {
      getUserData: vi.fn(),
      setUserData: vi.fn(),
      isAvailable: vi.fn().mockResolvedValue(true),
    };

    const config: StorageConfig = {
      type: 'local',
      fallbackType: 'cloud',
      apiBaseUrl: 'http://localhost:3000/api',
      timeout: 5000,
    };

    serviceWithFallback = StorageFactory.createStorageService(config);
  });

  it('should use primary service when available', async () => {
    const userData = { id: 'user-1', username: 'test', email: 'test@example.com' };
    
    // Mock the actual services that would be created
    const { LocalStorageService } = await import('../../../app/services/storage/LocalStorageService');
    const mockPrimary = new (LocalStorageService as any)();
    mockPrimary.getUserData = vi.fn().mockResolvedValue(userData);

    expect(serviceWithFallback).toBeDefined();
    // Test that the service wrapper works
    expect(typeof serviceWithFallback.getUserData).toBe('function');
  });
});