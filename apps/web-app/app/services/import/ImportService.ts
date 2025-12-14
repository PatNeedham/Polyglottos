// Main import service for handling data imports and migrations

import { StorageService } from '../storage/types';
import { ImportData, ImportResult, ImportOptions, ImportError, ConflictInfo, ImportProgress } from './types';
import { DataValidator } from './validation';
import { parseCSV } from './csv-parser';

export class ImportService {
  private storage: StorageService;
  private validator: DataValidator;

  constructor(storage: StorageService) {
    this.storage = storage;
    this.validator = new DataValidator();
  }

  /**
   * Import data from JSON
   */
  async importJSON(jsonString: string, options: ImportOptions = {}): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonString);
      return await this.importData(data, options);
    } catch (error) {
      return {
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors: [{
          type: 'validation',
          message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }]
      };
    }
  }

  /**
   * Import data from CSV
   */
  async importCSV(csvContent: string, dataType: 'users' | 'progress' | 'settings', options: ImportOptions = {}): Promise<ImportResult> {
    const { data, errors } = parseCSV(csvContent, dataType);
    
    if (!data || errors.length > 0) {
      return {
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors
      };
    }
    
    return await this.importData(data, options);
  }

  /**
   * Import data with validation and merge logic
   */
  async importData(data: ImportData, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: { users: 0, progress: 0, settings: 0 },
      skipped: { users: 0, progress: 0, settings: 0 },
      errors: [],
      conflicts: []
    };

    // Phase 1: Validation
    this.reportProgress(options, 'validating', 0, 1, 'Validating import data...');
    const validationErrors = this.validator.validate(data);
    
    if (validationErrors.length > 0) {
      const criticalErrors = validationErrors.filter(e => !e.recoverable);
      if (criticalErrors.length > 0) {
        result.success = false;
        result.errors = validationErrors;
        return result;
      }
      result.errors = validationErrors;
    }

    if (options.validateOnly) {
      return result;
    }

    // Phase 2: Process imports with conflict detection
    const mergeStrategy = options.mergeStrategy || 'ask';
    
    try {
      // Import users
      if (data.users && data.users.length > 0) {
        this.reportProgress(options, 'processing', 0, data.users.length, 'Importing users...');
        const userResult = await this.importUsers(data.users, mergeStrategy, options, result);
        result.imported.users = userResult.imported;
        result.skipped.users = userResult.skipped;
      }

      // Import progress
      if (data.progress && data.progress.length > 0) {
        this.reportProgress(options, 'processing', 0, data.progress.length, 'Importing progress data...');
        const progressResult = await this.importProgress(data.progress, mergeStrategy, options, result);
        result.imported.progress = progressResult.imported;
        result.skipped.progress = progressResult.skipped;
      }

      // Import settings
      if (data.settings && data.settings.length > 0) {
        this.reportProgress(options, 'processing', 0, data.settings.length, 'Importing settings...');
        const settingsResult = await this.importSettings(data.settings, mergeStrategy, options, result);
        result.imported.settings = settingsResult.imported;
        result.skipped.settings = settingsResult.skipped;
      }

      this.reportProgress(options, 'complete', 1, 1, 'Import complete');
    } catch (error) {
      result.success = false;
      result.errors.push({
        type: 'storage',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recoverable: false
      });
    }

    return result;
  }

  private async importUsers(users: any[], mergeStrategy: string, options: ImportOptions, result: ImportResult) {
    let imported = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const existing = await this.storage.getUserData(user.id);
        
        if (existing) {
          const resolution = await this.resolveConflict(
            { type: 'user', id: user.id, existing, incoming: user },
            mergeStrategy,
            options.onConflict
          );

          if (resolution === 'keep_existing') {
            skipped++;
            continue;
          } else if (resolution === 'merge') {
            const merged = { ...existing, ...user };
            await this.storage.setUserData(merged);
            imported++;
          } else {
            await this.storage.setUserData(user);
            imported++;
          }
        } else {
          await this.storage.setUserData(user);
          imported++;
        }
      } catch (error) {
        result.errors.push({
          type: 'storage',
          field: `user.${user.id}`,
          message: `Failed to import user: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true
        });
        skipped++;
      }
    }

    return { imported, skipped };
  }

  private async importProgress(progressList: any[], mergeStrategy: string, options: ImportOptions, result: ImportResult) {
    let imported = 0;
    let skipped = 0;

    for (const progress of progressList) {
      try {
        const existing = await this.storage.getProgressData(progress.userId);
        
        if (existing) {
          const resolution = await this.resolveConflict(
            { type: 'progress', id: progress.userId, existing, incoming: progress },
            mergeStrategy,
            options.onConflict
          );

          if (resolution === 'keep_existing') {
            skipped++;
            continue;
          } else if (resolution === 'merge') {
            // Merge progress data by summing values (with validation)
            const merged = {
              ...existing,
              questionsAnswered: (existing.questionsAnswered || 0) + (progress.questionsAnswered || 0),
              correctAnswers: (existing.correctAnswers || 0) + (progress.correctAnswers || 0),
              quizzesTaken: (existing.quizzesTaken || 0) + (progress.quizzesTaken || 0),
              lastUpdated: new Date().toISOString()
            };
            await this.storage.setProgressData(merged);
            imported++;
          } else {
            await this.storage.setProgressData(progress);
            imported++;
          }
        } else {
          await this.storage.setProgressData(progress);
          imported++;
        }
      } catch (error) {
        result.errors.push({
          type: 'storage',
          field: `progress.${progress.userId}`,
          message: `Failed to import progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true
        });
        skipped++;
      }
    }

    return { imported, skipped };
  }

  private async importSettings(settingsList: any[], mergeStrategy: string, options: ImportOptions, result: ImportResult) {
    let imported = 0;
    let skipped = 0;

    for (const settings of settingsList) {
      try {
        const existing = await this.storage.getSettings(settings.userId);
        
        if (existing) {
          const resolution = await this.resolveConflict(
            { type: 'settings', id: settings.userId, existing, incoming: settings },
            mergeStrategy,
            options.onConflict
          );

          if (resolution === 'keep_existing') {
            skipped++;
            continue;
          } else if (resolution === 'merge') {
            const merged = { ...existing, ...settings };
            await this.storage.setSettings(merged);
            imported++;
          } else {
            await this.storage.setSettings(settings);
            imported++;
          }
        } else {
          await this.storage.setSettings(settings);
          imported++;
        }
      } catch (error) {
        result.errors.push({
          type: 'storage',
          field: `settings.${settings.userId}`,
          message: `Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true
        });
        skipped++;
      }
    }

    return { imported, skipped };
  }

  private async resolveConflict(
    conflict: ConflictInfo,
    mergeStrategy: string,
    onConflict?: (conflict: ConflictInfo) => Promise<'keep_existing' | 'use_incoming' | 'merge'>
  ): Promise<'keep_existing' | 'use_incoming' | 'merge'> {
    if (mergeStrategy === 'skip') {
      return 'keep_existing';
    } else if (mergeStrategy === 'overwrite') {
      return 'use_incoming';
    } else if (mergeStrategy === 'merge') {
      return 'merge';
    } else if (mergeStrategy === 'ask' && onConflict) {
      return await onConflict(conflict);
    }
    
    // Default to skip if strategy is unclear
    return 'keep_existing';
  }

  private reportProgress(options: ImportOptions, phase: ImportProgress['phase'], current: number, total: number, message: string): void {
    if (options.onProgress) {
      options.onProgress({ phase, current, total, message });
    }
  }

  /**
   * Migrate data from local storage to cloud storage
   */
  async migrateToCloud(cloudStorage: StorageService, options: ImportOptions = {}): Promise<ImportResult> {
    this.reportProgress(options, 'validating', 0, 1, 'Preparing migration...');
    
    // Export all data from local storage
    const exportData: ImportData = {
      users: [],
      progress: [],
      settings: []
    };

    try {
      // Get session to find current user
      const session = await this.storage.getSession();
      const userId = session.userId as string;

      if (userId) {
        // Export user data
        const userData = await this.storage.getUserData(userId);
        if (userData) {
          exportData.users = [userData];
        }

        // Export progress
        const progressData = await this.storage.getProgressData(userId);
        if (progressData) {
          exportData.progress = [progressData];
        }

        // Export settings
        const settingsData = await this.storage.getSettings(userId);
        if (settingsData) {
          exportData.settings = [settingsData];
        }
      }

      // Create temporary import service with cloud storage
      const cloudImportService = new ImportService(cloudStorage);
      
      // Import to cloud with merge strategy
      return await cloudImportService.importData(exportData, {
        ...options,
        mergeStrategy: options.mergeStrategy || 'merge'
      });
    } catch (error) {
      return {
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors: [{
          type: 'storage',
          message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }]
      };
    }
  }
}
