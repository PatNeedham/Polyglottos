import { StorageService, StorageConfig, StorageType } from './types';
import { LocalStorageService } from './LocalStorageService';
import { CloudStorageService } from './CloudStorageService';

/**
 * Storage service with fallback support
 */
class StorageServiceWithFallback implements StorageService {
  private primary: StorageService;
  private fallback?: StorageService;

  constructor(primary: StorageService, fallback?: StorageService) {
    this.primary = primary;
    this.fallback = fallback;
  }

  private async executeWithFallback<T>(
    operation: (service: StorageService) => Promise<T>
  ): Promise<T> {
    try {
      return await operation(this.primary);
    } catch (error) {
      console.warn('Primary storage operation failed, attempting fallback:', error);
      
      if (this.fallback) {
        try {
          return await operation(this.fallback);
        } catch (fallbackError) {
          console.error('Fallback storage operation also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  async getUserData(userId: string) {
    return this.executeWithFallback(service => service.getUserData(userId));
  }

  async setUserData(userData: any) {
    return this.executeWithFallback(service => service.setUserData(userData));
  }

  async deleteUserData(userId: string) {
    return this.executeWithFallback(service => service.deleteUserData(userId));
  }

  async getProgressData(userId: string) {
    return this.executeWithFallback(service => service.getProgressData(userId));
  }

  async setProgressData(progressData: any) {
    return this.executeWithFallback(service => service.setProgressData(progressData));
  }

  async updateProgress(userId: string, updates: any) {
    return this.executeWithFallback(service => service.updateProgress(userId, updates));
  }

  async getSettings(userId: string) {
    return this.executeWithFallback(service => service.getSettings(userId));
  }

  async setSettings(settings: any) {
    return this.executeWithFallback(service => service.setSettings(settings));
  }

  async updateSettings(userId: string, updates: any) {
    return this.executeWithFallback(service => service.updateSettings(userId, updates));
  }

  async getSession() {
    return this.executeWithFallback(service => service.getSession());
  }

  async setSession(sessionData: any) {
    return this.executeWithFallback(service => service.setSession(sessionData));
  }

  async clearSession() {
    return this.executeWithFallback(service => service.clearSession());
  }

  async isAvailable() {
    try {
      return await this.primary.isAvailable();
    } catch {
      return this.fallback ? await this.fallback.isAvailable() : false;
    }
  }

  async clear() {
    return this.executeWithFallback(service => service.clear());
  }
}

/**
 * Storage factory for creating storage service instances
 */
export class StorageFactory {
  private static instance: StorageService | null = null;

  /**
   * Create a storage service based on configuration
   */
  static createStorageService(config: StorageConfig): StorageService {
    const primary = this.createService(config.type, config);
    
    let fallback: StorageService | undefined;
    if (config.fallbackType && config.fallbackType !== config.type) {
      fallback = this.createService(config.fallbackType, config);
    }

    return new StorageServiceWithFallback(primary, fallback);
  }

  private static createService(type: StorageType, config: StorageConfig): StorageService {
    switch (type) {
      case 'local':
        return new LocalStorageService();
      case 'cloud':
        return new CloudStorageService(config);
      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }

  /**
   * Get or create a singleton storage service instance
   */
  static getInstance(config?: StorageConfig): StorageService {
    if (!this.instance) {
      if (!config) {
        // Default configuration
        config = {
          type: 'local',
          fallbackType: 'cloud',
          apiBaseUrl: 'http://localhost:3000/api',
          timeout: 5000,
        };
      }
      this.instance = this.createStorageService(config);
    }
    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }
}

/**
 * Default storage service configuration
 */
export const defaultStorageConfig: StorageConfig = {
  type: 'local',
  fallbackType: 'cloud',
  apiBaseUrl: typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/api`
    : 'http://localhost:3000/api',
  timeout: 5000,
};

/**
 * Get the default storage service instance
 */
export function getStorageService(config?: StorageConfig): StorageService {
  return StorageFactory.getInstance(config || defaultStorageConfig);
}