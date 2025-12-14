// Data validation functions for imports

import { UserData, ProgressData, SettingsData } from '../storage/types';
import { ImportData, ImportError } from './types';

export class DataValidator {
  private errors: ImportError[] = [];

  validate(data: ImportData): ImportError[] {
    this.errors = [];
    
    if (!data || typeof data !== 'object') {
      this.addError('validation', undefined, 'Invalid import data format', false);
      return this.errors;
    }

    // Validate structure
    this.validateStructure(data);
    
    // Validate users
    if (data.users && Array.isArray(data.users)) {
      data.users.forEach((user, index) => this.validateUser(user, index));
    }
    
    // Validate progress
    if (data.progress && Array.isArray(data.progress)) {
      data.progress.forEach((prog, index) => this.validateProgress(prog, index));
    }
    
    // Validate settings
    if (data.settings && Array.isArray(data.settings)) {
      data.settings.forEach((setting, index) => this.validateSettings(setting, index));
    }

    return this.errors;
  }

  private validateStructure(data: ImportData): void {
    if (!data.users && !data.progress && !data.settings) {
      this.addError('validation', undefined, 'Import data must contain at least one of: users, progress, or settings', false);
    }
  }

  private validateUser(user: UserData, index: number): void {
    if (!user.id) {
      this.addError('validation', `users[${index}].id`, 'User ID is required', false);
    }
    if (!user.username) {
      this.addError('validation', `users[${index}].username`, 'Username is required', false);
    }
    if (!user.email) {
      this.addError('validation', `users[${index}].email`, 'Email is required', false);
    } else if (!this.isValidEmail(user.email)) {
      this.addError('validation', `users[${index}].email`, 'Invalid email format', true);
    }
  }

  private validateProgress(progress: ProgressData, index: number): void {
    if (!progress.id) {
      this.addError('validation', `progress[${index}].id`, 'Progress ID is required', false);
    }
    if (!progress.userId) {
      this.addError('validation', `progress[${index}].userId`, 'User ID is required for progress', false);
    }
    if (typeof progress.questionsAnswered !== 'number' || progress.questionsAnswered < 0) {
      this.addError('validation', `progress[${index}].questionsAnswered`, 'Questions answered must be a non-negative number', true);
    }
    if (typeof progress.correctAnswers !== 'number' || progress.correctAnswers < 0) {
      this.addError('validation', `progress[${index}].correctAnswers`, 'Correct answers must be a non-negative number', true);
    }
    if (typeof progress.quizzesTaken !== 'number' || progress.quizzesTaken < 0) {
      this.addError('validation', `progress[${index}].quizzesTaken`, 'Quizzes taken must be a non-negative number', true);
    }
    if (progress.correctAnswers > progress.questionsAnswered) {
      this.addError('validation', `progress[${index}]`, 'Correct answers cannot exceed questions answered', true);
    }
  }

  private validateSettings(settings: SettingsData, index: number): void {
    if (!settings.userId) {
      this.addError('validation', `settings[${index}].userId`, 'User ID is required for settings', false);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private addError(type: ImportError['type'], field: string | undefined, message: string, recoverable: boolean): void {
    this.errors.push({ type, field, message, recoverable });
  }
}

export function validateJSON(jsonString: string): { valid: boolean; data?: ImportData; errors: ImportError[] } {
  const errors: ImportError[] = [];
  
  try {
    const data = JSON.parse(jsonString);
    const validator = new DataValidator();
    const validationErrors = validator.validate(data);
    
    return {
      valid: validationErrors.length === 0,
      data: validationErrors.length === 0 ? data : undefined,
      errors: validationErrors
    };
  } catch (error) {
    errors.push({
      type: 'validation',
      message: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      recoverable: false
    });
    
    return { valid: false, errors };
  }
}
