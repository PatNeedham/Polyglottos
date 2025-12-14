import { describe, it, expect } from 'vitest';
import { DataValidator, validateJSON } from '../../../app/services/import/validation';
import { ImportData } from '../../../app/services/import/types';

describe('DataValidator', () => {
  let validator: DataValidator;

  beforeEach(() => {
    validator = new DataValidator();
  });

  describe('validate', () => {
    it('should validate empty data structure', () => {
      const data: ImportData = {};
      const errors = validator.validate(data);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('must contain at least one');
    });

    it('should validate user data with all required fields', () => {
      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'testuser',
          email: 'test@example.com'
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors).toHaveLength(0);
    });

    it('should detect missing user id', () => {
      const data: ImportData = {
        users: [{
          id: '',
          username: 'testuser',
          email: 'test@example.com'
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field?.includes('id'))).toBe(true);
    });

    it('should detect invalid email format', () => {
      const data: ImportData = {
        users: [{
          id: 'user-1',
          username: 'testuser',
          email: 'invalid-email'
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('email'))).toBe(true);
      expect(errors.find(e => e.message.includes('email'))?.recoverable).toBe(true);
    });

    it('should validate progress data', () => {
      const data: ImportData = {
        progress: [{
          id: 'progress-1',
          userId: 'user-1',
          questionsAnswered: 100,
          correctAnswers: 85,
          quizzesTaken: 10,
          lastUpdated: new Date().toISOString()
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid progress numbers', () => {
      const data: ImportData = {
        progress: [{
          id: 'progress-1',
          userId: 'user-1',
          questionsAnswered: -5,
          correctAnswers: 85,
          quizzesTaken: 10,
          lastUpdated: new Date().toISOString()
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('non-negative'))).toBe(true);
    });

    it('should detect correctAnswers exceeding questionsAnswered', () => {
      const data: ImportData = {
        progress: [{
          id: 'progress-1',
          userId: 'user-1',
          questionsAnswered: 50,
          correctAnswers: 60,
          quizzesTaken: 10,
          lastUpdated: new Date().toISOString()
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('cannot exceed'))).toBe(true);
    });

    it('should validate settings data', () => {
      const data: ImportData = {
        settings: [{
          userId: 'user-1',
          language: 'en',
          theme: 'dark',
          notificationFrequency: 'daily'
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors).toHaveLength(0);
    });

    it('should detect missing userId in settings', () => {
      const data: ImportData = {
        settings: [{
          userId: '',
          language: 'en'
        }]
      };
      const errors = validator.validate(data);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field?.includes('userId'))).toBe(true);
    });
  });
});

describe('validateJSON', () => {
  it('should validate valid JSON string', () => {
    const jsonString = JSON.stringify({
      users: [{
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com'
      }]
    });
    
    const result = validateJSON(jsonString);
    
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid JSON syntax', () => {
    const jsonString = '{ invalid json }';
    
    const result = validateJSON(jsonString);
    
    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Invalid JSON');
  });

  it('should validate JSON and return validation errors', () => {
    const jsonString = JSON.stringify({
      users: [{
        id: 'user-1',
        username: 'testuser',
        email: 'invalid-email'
      }]
    });
    
    const result = validateJSON(jsonString);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
