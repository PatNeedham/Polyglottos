// Import service types and interfaces

import { UserData, ProgressData, SettingsData } from '../storage/types';

export interface ImportData {
  metadata?: {
    version?: string;
    exportDate?: string;
    format?: 'json' | 'csv';
  };
  users?: UserData[];
  progress?: ProgressData[];
  settings?: SettingsData[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    users: number;
    progress: number;
    settings: number;
  };
  skipped: {
    users: number;
    progress: number;
    settings: number;
  };
  errors: ImportError[];
  conflicts?: ConflictInfo[];
}

export interface ImportError {
  type: 'validation' | 'merge' | 'storage';
  field?: string;
  message: string;
  recoverable: boolean;
}

export interface ConflictInfo {
  type: 'user' | 'progress' | 'settings';
  id: string;
  existing: UserData | ProgressData | SettingsData;
  incoming: UserData | ProgressData | SettingsData;
  resolution?: 'keep_existing' | 'use_incoming' | 'merge';
}

export interface CSVFieldMapping {
  [csvColumn: string]: string; // Maps CSV column name to data field name
}

export interface ImportOptions {
  mergeStrategy?: 'skip' | 'overwrite' | 'merge' | 'ask';
  validateOnly?: boolean; // If true, only validate without importing
  onProgress?: (progress: ImportProgress) => void;
  onConflict?: (conflict: ConflictInfo) => Promise<'keep_existing' | 'use_incoming' | 'merge'>;
}

export interface ImportProgress {
  phase: 'validating' | 'processing' | 'merging' | 'complete';
  current: number;
  total: number;
  message: string;
}

export class ImportValidationError extends Error {
  errors: ImportError[];
  
  constructor(message: string, errors: ImportError[]) {
    super(message);
    this.name = 'ImportValidationError';
    this.errors = errors;
  }
}
