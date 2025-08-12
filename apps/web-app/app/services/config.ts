import { StorageConfig } from './storage/types';

/**
 * Storage configuration for the application
 */
export const storageConfig: StorageConfig = {
  type: process.env.STORAGE_TYPE === 'cloud' ? 'cloud' : 'local',
  fallbackType: process.env.STORAGE_TYPE === 'cloud' ? 'local' : 'cloud',
  apiBaseUrl: process.env.API_BASE_URL || 
    (typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}/api`
      : 'http://localhost:3000/api'),
  timeout: parseInt(process.env.STORAGE_TIMEOUT || '5000', 10),
};

/**
 * Get storage configuration with environment variable overrides
 */
export function getStorageConfig(): StorageConfig {
  return { ...storageConfig };
}