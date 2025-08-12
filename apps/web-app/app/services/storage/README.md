# Storage Service Abstraction

This module provides a unified storage abstraction layer that supports both local (IndexedDB) and cloud storage, enabling seamless switching between storage strategies.

## Features

- **Unified Interface**: Single API for both local and cloud storage
- **Automatic Fallback**: Graceful fallback between storage strategies when primary fails
- **Type Safety**: Full TypeScript support with strongly typed interfaces
- **Error Handling**: Comprehensive error handling with recoverable/non-recoverable classifications
- **Environment Configuration**: Easy configuration via environment variables
- **Session Management**: Built-in session management abstraction

## Quick Start

### Basic Usage

```typescript
import { getStorageService } from '~/services/storage';

// Get the default storage service (automatically configured)
const storage = getStorageService();

// Store user data
await storage.setUserData({
  id: 'user-123',
  username: 'johndoe',
  email: 'john@example.com'
});

// Retrieve user data
const userData = await storage.getUserData('user-123');

// Update progress
await storage.updateProgress('user-123', {
  questionsAnswered: 50,
  correctAnswers: 45
});

// Manage settings
await storage.updateSettings('user-123', {
  theme: 'dark',
  language: 'en'
});
```

### Configuration

Configure the storage service using environment variables:

```bash
# Primary storage type (local or cloud)
STORAGE_TYPE=local

# API base URL for cloud storage
API_BASE_URL=https://api.polyglottos.com

# Request timeout in milliseconds
STORAGE_TIMEOUT=5000
```

Or programmatically:

```typescript
import { getStorageService } from '~/services/storage';

const storage = getStorageService({
  type: 'cloud',
  fallbackType: 'local',
  apiBaseUrl: 'https://api.polyglottos.com',
  timeout: 10000
});
```

## Storage Types

### Local Storage (IndexedDB)

Uses IndexedDB for client-side storage. Ideal for offline functionality and fast access.

**Benefits:**
- Works offline
- Fast access times
- No network dependency
- Large storage capacity

**Limitations:**
- Data only available on current device/browser
- Subject to browser storage quotas

### Cloud Storage (API)

Uses the existing API backend for server-side storage. Ideal for data synchronization across devices.

**Benefits:**
- Data synchronized across devices
- Backup and recovery
- No storage limits
- Centralized data management

**Limitations:**
- Requires network connection
- Dependent on API availability
- Network latency

## API Reference

### StorageService Interface

```typescript
interface StorageService {
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
```

### Data Types

```typescript
interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

interface ProgressData {
  id: string;
  userId: string;
  questionsAnswered: number;
  correctAnswers: number;
  quizzesTaken: number;
  goals?: string; // JSON string
  cumulativeStats?: string; // JSON string
  lastUpdated: string;
}

interface SettingsData {
  userId: string;
  language?: string;
  notificationFrequency?: string;
  isPrivate?: boolean;
  theme?: string;
  [key: string]: unknown; // Allow additional settings
}

interface SessionData {
  userId?: string;
  [key: string]: unknown;
}
```

## Error Handling

The storage service provides detailed error information:

```typescript
interface StorageError extends Error {
  code: string;      // Error code for programmatic handling
  recoverable: boolean; // Whether the operation can be retried
}
```

Common error codes:
- `DB_OPEN_ERROR`: Failed to open IndexedDB
- `API_ERROR`: API request failed
- `TIMEOUT_ERROR`: Request timed out
- `NETWORK_ERROR`: Network connection failed
- `SESSION_ERROR`: Session operation failed

### Handling Errors

```typescript
try {
  await storage.setUserData(userData);
} catch (error) {
  if (error.recoverable) {
    // Retry the operation
    console.log('Retrying operation...');
  } else {
    // Handle permanent failure
    console.error('Operation failed permanently:', error.message);
  }
}
```

## Advanced Usage

### Custom Fallback Strategy

```typescript
import { StorageFactory } from '~/services/storage';

const storage = StorageFactory.createStorageService({
  type: 'cloud',
  fallbackType: 'local',
  apiBaseUrl: 'https://api.polyglottos.com',
  timeout: 5000
});

// The service will automatically fall back to local storage if cloud fails
```

### Checking Availability

```typescript
const isAvailable = await storage.isAvailable();
if (!isAvailable) {
  console.warn('Storage service is not available');
}
```

### Clearing Data

```typescript
// Clear all local data (not supported for cloud storage)
await storage.clear();
```

## Migration from Direct localStorage

The storage service maintains backward compatibility with the existing localStorage implementation. The session management has been updated to use the new abstraction while falling back to localStorage if needed.

### Before (Direct localStorage)
```typescript
localStorage.setItem('polyglottos_session', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('polyglottos_session') || '{}');
```

### After (Storage Service)
```typescript
await storage.setSession(data);
const data = await storage.getSession();
```

## Testing

The storage service includes comprehensive test coverage for both local and cloud implementations:

```bash
# Run storage service tests
npm run test apps/web-app/tests/services/storage/
```

## Best Practices

1. **Always use the factory function**: Use `getStorageService()` to get the configured instance
2. **Handle errors gracefully**: Check the `recoverable` property to decide on retry logic
3. **Check availability**: Use `isAvailable()` before critical operations
4. **Use appropriate storage type**: Local for offline-first, cloud for cross-device sync
5. **Configure fallbacks**: Always specify a fallback type for reliability