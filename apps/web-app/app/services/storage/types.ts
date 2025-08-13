// Storage service types and interfaces

export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface ProgressData {
  id: string;
  userId: string;
  questionsAnswered: number;
  correctAnswers: number;
  quizzesTaken: number;
  goals?: string; // JSON string for user-set goals
  cumulativeStats?: string; // JSON for broader stats
  lastUpdated: string;
}

export interface SettingsData {
  userId: string;
  language?: string;
  notificationFrequency?: string;
  isPrivate?: boolean;
  theme?: string;
  [key: string]: unknown; // Allow additional settings
}

export interface SessionData {
  userId?: string;
  [key: string]: unknown;
}

export class StorageError extends Error {
  code: string;
  recoverable: boolean;
  
  constructor(message: string, code: string, recoverable: boolean = false) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

/**
 * Unified storage service interface supporting both local and cloud storage
 */
export interface StorageService {
  // User data operations
  getUserData(userId: string): Promise<UserData | null>;
  setUserData(userData: UserData): Promise<void>;
  deleteUserData(userId: string): Promise<void>;

  // Progress data operations
  getProgressData(userId: string): Promise<ProgressData | null>;
  setProgressData(progressData: ProgressData): Promise<void>;
  updateProgress(userId: string, updates: Partial<ProgressData>): Promise<void>;

  // Settings operations
  getSettings(userId: string): Promise<SettingsData | null>;
  setSettings(settings: SettingsData): Promise<void>;
  updateSettings(userId: string, updates: Partial<SettingsData>): Promise<void>;

  // Session operations
  getSession(): Promise<SessionData>;
  setSession(sessionData: SessionData): Promise<void>;
  clearSession(): Promise<void>;

  // General operations
  isAvailable(): Promise<boolean>;
  clear(): Promise<void>;
}

export type StorageType = 'local' | 'cloud';

export interface StorageConfig {
  type: StorageType;
  fallbackType?: StorageType;
  apiBaseUrl?: string; // For cloud storage
  timeout?: number; // Request timeout in ms
}