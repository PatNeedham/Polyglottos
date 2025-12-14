# Data Import and Migration Service

This module provides comprehensive data import functionality with support for JSON and CSV formats, intelligent field mapping, merge strategies, and a migration wizard for converting between storage types.

## Features

- ✅ **JSON Import** - Import complete data exports with full validation
- ✅ **CSV Import** - Import spreadsheet data with intelligent field mapping
- ✅ **Merge Strategies** - Handle conflicts with skip, overwrite, or merge options
- ✅ **Migration Wizard** - Seamless local-to-cloud and cloud-to-local migration
- ✅ **Data Validation** - Comprehensive validation with detailed error reporting
- ✅ **Progress Tracking** - Real-time progress updates for large imports
- ✅ **Conflict Resolution** - Automatic or interactive conflict handling

## Quick Start

### Basic JSON Import

```typescript
import { getStorageService } from '~/services/storage';
import { ImportService } from '~/services/import';

const storage = getStorageService();
const importService = new ImportService(storage);

// Import from JSON file
const jsonData = await file.text();
const result = await importService.importJSON(jsonData, {
  mergeStrategy: 'merge',
  onProgress: (progress) => {
    console.log(`${progress.phase}: ${progress.current}/${progress.total}`);
  }
});

if (result.success) {
  console.log('Imported:', result.imported);
} else {
  console.error('Errors:', result.errors);
}
```

### CSV Import with Field Mapping

```typescript
// Import CSV data
const csvData = await file.text();
const result = await importService.importCSV(csvData, 'progress', {
  mergeStrategy: 'overwrite'
});
```

### Data Migration

```typescript
import { StorageFactory } from '~/services/storage';

// Create cloud storage instance
const cloudStorage = StorageFactory.createStorageService({
  type: 'cloud',
  apiBaseUrl: 'https://api.polyglottos.com'
});

// Migrate from local to cloud
const result = await importService.migrateToCloud(cloudStorage, {
  mergeStrategy: 'merge',
  onProgress: (progress) => {
    console.log(`Migrating: ${progress.message}`);
  }
});
```

## Merge Strategies

### Skip Strategy
Keeps existing data and ignores imported duplicates.
```typescript
{ mergeStrategy: 'skip' }
```

### Overwrite Strategy
Replaces existing data with imported data.
```typescript
{ mergeStrategy: 'overwrite' }
```

### Merge Strategy
Combines existing and imported data intelligently:
- **User Data**: Overwrites fields while preserving unique fields
- **Progress Data**: Sums numeric values (questions, scores)
- **Settings**: Merges all settings, imported values take precedence
```typescript
{ mergeStrategy: 'merge' }
```

### Interactive Strategy
Prompts for resolution on each conflict.
```typescript
{
  mergeStrategy: 'ask',
  onConflict: async (conflict) => {
    // Show UI prompt
    return 'keep_existing' | 'use_incoming' | 'merge';
  }
}
```

## CSV Field Mapping

The CSV parser automatically detects and maps common field name variations:

| Standard Field | Recognized Variations |
|---------------|----------------------|
| `id` | id, user_id, userid, user id |
| `userId` | user_id, userid, user id, uid |
| `username` | username, user_name, user name, name |
| `email` | email, e-mail, mail, email address |
| `questionsAnswered` | questions_answered, questionsanswered, total_questions |
| `correctAnswers` | correct_answers, correctanswers, correct |
| `theme` | theme, ui_theme, appearance |

### Custom CSV Format Example

```csv
user_id,questions answered,correct,quizzes taken
user-1,100,85,10
user-2,50,45,5
```

This will be automatically mapped to:
```typescript
{
  userId: 'user-1',
  questionsAnswered: 100,
  correctAnswers: 85,
  quizzesTaken: 10
}
```

## Validation

### Data Validation Rules

**User Data:**
- `id`, `username`, and `email` are required
- Email must be valid format
- Non-recoverable errors prevent import

**Progress Data:**
- `id` and `userId` are required
- Numeric fields must be non-negative
- `correctAnswers` cannot exceed `questionsAnswered`

**Settings Data:**
- `userId` is required
- All other fields are optional

### Validation-Only Mode

Test your import data without actually importing:

```typescript
const result = await importService.importJSON(jsonData, {
  validateOnly: true
});

if (!result.success) {
  console.log('Validation errors:', result.errors);
}
```

## Progress Tracking

Track import progress in real-time:

```typescript
await importService.importJSON(jsonData, {
  onProgress: (progress) => {
    console.log(`Phase: ${progress.phase}`);
    console.log(`Progress: ${progress.current}/${progress.total}`);
    console.log(`Message: ${progress.message}`);
    
    // Update UI progress bar
    setProgressPercent((progress.current / progress.total) * 100);
  }
});
```

Progress phases:
- `validating` - Validating import data structure
- `processing` - Processing and importing records
- `merging` - Resolving conflicts and merging data
- `complete` - Import finished

## Error Handling

Errors are categorized by type and recoverability:

```typescript
interface ImportError {
  type: 'validation' | 'merge' | 'storage';
  field?: string;
  message: string;
  recoverable: boolean;
}
```

- **Validation Errors**: Data format or content issues
- **Merge Errors**: Conflict resolution problems
- **Storage Errors**: Database or storage failures

**Recoverable errors** allow partial import to continue.
**Non-recoverable errors** stop the import immediately.

## Import Result

All import operations return a detailed result:

```typescript
interface ImportResult {
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
```

## Migration Wizard

The migration wizard provides a step-by-step UI for data migration:

1. **Introduction** - Choose migration direction (local↔cloud)
2. **Configuration** - Configure target storage settings
3. **Confirmation** - Review migration details
4. **Migration** - Progress tracking during migration
5. **Complete** - Summary of migrated data

Access via: `/migrate` route

## Data Format Examples

### JSON Export Format

```json
{
  "metadata": {
    "version": "1.0",
    "exportDate": "2024-01-15T10:30:00.000Z",
    "format": "json"
  },
  "users": [{
    "id": "user-1",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }],
  "progress": [{
    "id": "progress-1",
    "userId": "user-1",
    "questionsAnswered": 100,
    "correctAnswers": 85,
    "quizzesTaken": 10,
    "lastUpdated": "2024-01-15T10:00:00.000Z"
  }],
  "settings": [{
    "userId": "user-1",
    "language": "en",
    "theme": "dark",
    "notificationFrequency": "daily"
  }]
}
```

### CSV Progress Format

```csv
id,userId,questionsAnswered,correctAnswers,quizzesTaken,lastUpdated
progress-1,user-1,100,85,10,2024-01-15T10:00:00.000Z
progress-2,user-2,50,45,5,2024-01-14T15:30:00.000Z
```

## UI Routes

- `/import` - Main import page for JSON and CSV imports
- `/migrate` - Step-by-step migration wizard
- `/settings` - Access import and migration from settings

## Testing

Comprehensive test coverage includes:
- Unit tests for validation logic
- CSV parsing with various formats
- Import service with all merge strategies
- Error handling and recovery
- Migration workflows

Run tests:
```bash
npm test tests/services/import
```

## Best Practices

1. **Always validate first** - Use `validateOnly: true` before importing large datasets
2. **Backup existing data** - Export current data before importing
3. **Start with small datasets** - Test import with a few records first
4. **Choose appropriate merge strategy** - Consider data relationships
5. **Monitor progress** - Use progress callbacks for large imports
6. **Handle errors gracefully** - Check result.errors and inform users

## Architecture

```
import/
├── types.ts              # Type definitions and interfaces
├── validation.ts         # Data validation logic
├── csv-parser.ts         # CSV parsing and field mapping
├── ImportService.ts      # Main import service
└── README.md            # This file

routes/
├── import.tsx           # Import UI component
└── migrate.tsx          # Migration wizard component
```

## Dependencies

- Storage Service (`~/services/storage`) - For data persistence
- React Router (`react-router`) - For routing and navigation

## Future Enhancements

- [ ] Support for additional formats (XML, YAML)
- [ ] Batch import API for large datasets
- [ ] Import scheduling and automation
- [ ] Data transformation pipelines
- [ ] Import templates and presets
- [ ] Rollback capability for failed imports
