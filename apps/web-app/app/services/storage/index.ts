// Storage service module exports

export * from './types';
export * from './LocalStorageService';
export * from './CloudStorageService';
export * from './StorageFactory';

// Re-export the main factory function for convenience
export { getStorageService as default } from './StorageFactory';