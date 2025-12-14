import { describe, it, expect, beforeEach } from 'vitest';
import { CSVParser, parseCSV } from '../../../app/services/import/csv-parser';

describe('CSVParser', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('parse users', () => {
    it('should parse valid user CSV', () => {
      const csv = `id,username,email
user-1,john_doe,john@example.com
user-2,jane_doe,jane@example.com`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.errors).toHaveLength(0);
      expect(result.data?.users).toHaveLength(2);
      expect(result.data?.users?.[0]).toEqual({
        id: 'user-1',
        username: 'john_doe',
        email: 'john@example.com'
      });
    });

    it('should handle quoted CSV fields', () => {
      const csv = `id,username,email
"user-1","john doe","john@example.com"`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.errors).toHaveLength(0);
      expect(result.data?.users).toHaveLength(1);
      expect(result.data?.users?.[0].username).toBe('john doe');
    });

    it('should auto-detect field mappings', () => {
      const csv = `user_id,user name,e-mail
user-1,john_doe,john@example.com`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.errors).toHaveLength(0);
      expect(result.data?.users).toHaveLength(1);
      expect(result.data?.users?.[0].id).toBe('user-1');
    });

    it('should skip empty rows', () => {
      const csv = `id,username,email
user-1,john_doe,john@example.com

user-2,jane_doe,jane@example.com`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.data?.users).toHaveLength(2);
    });

    it('should report error for missing required fields', () => {
      const csv = `id,username
user-1,john_doe`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Missing required fields');
    });
  });

  describe('parse progress', () => {
    it('should parse valid progress CSV', () => {
      const csv = `id,user_id,questions_answered,correct_answers,quizzes_taken
progress-1,user-1,100,85,10
progress-2,user-2,50,45,5`;
      
      const result = parser.parse(csv, 'progress');
      
      expect(result.errors).toHaveLength(0);
      expect(result.data?.progress).toHaveLength(2);
      expect(result.data?.progress?.[0]).toMatchObject({
        id: 'progress-1',
        userId: 'user-1',
        questionsAnswered: 100,
        correctAnswers: 85,
        quizzesTaken: 10
      });
    });

    it('should parse number fields correctly', () => {
      const csv = `id,user_id,questions_answered,correct_answers,quizzes_taken
progress-1,user-1,100,85,10`;
      
      const result = parser.parse(csv, 'progress');
      
      expect(result.data?.progress?.[0].questionsAnswered).toBe(100);
      expect(result.data?.progress?.[0].correctAnswers).toBe(85);
      expect(typeof result.data?.progress?.[0].questionsAnswered).toBe('number');
    });

    it('should handle invalid numbers gracefully', () => {
      const csv = `id,user_id,questions_answered,correct_answers,quizzes_taken
progress-1,user-1,abc,85,10`;
      
      const result = parser.parse(csv, 'progress');
      
      expect(result.data?.progress?.[0].questionsAnswered).toBe(0);
    });
  });

  describe('parse settings', () => {
    it('should parse valid settings CSV', () => {
      const csv = `user_id,language,theme,notification_frequency
user-1,en,dark,daily
user-2,es,light,weekly`;
      
      const result = parser.parse(csv, 'settings');
      
      expect(result.errors).toHaveLength(0);
      expect(result.data?.settings).toHaveLength(2);
      expect(result.data?.settings?.[0]).toMatchObject({
        userId: 'user-1',
        language: 'en',
        theme: 'dark',
        notificationFrequency: 'daily'
      });
    });

    it('should parse boolean fields', () => {
      const csv = `user_id,is_private
user-1,true
user-2,false
user-3,1
user-4,0`;
      
      const result = parser.parse(csv, 'settings');
      
      expect(result.data?.settings?.[0].isPrivate).toBe(true);
      expect(result.data?.settings?.[1].isPrivate).toBe(false);
      expect(result.data?.settings?.[2].isPrivate).toBe(true);
      expect(result.data?.settings?.[3].isPrivate).toBe(false);
    });
  });

  describe('field mapping variations', () => {
    it('should handle various header formats for userId', () => {
      const variations = [
        'user_id',
        'userid',
        'user id',
        'uid'
      ];

      variations.forEach(header => {
        const csv = `${header}\nuser-1`;
        const result = parser.parse(csv, 'settings');
        expect(result.data?.settings?.[0].userId).toBe('user-1');
      });
    });

    it('should handle case-insensitive headers', () => {
      const csv = `USER_ID,USERNAME,EMAIL
user-1,john,john@example.com`;
      
      const result = parser.parse(csv, 'users');
      
      expect(result.data?.users?.[0].id).toBe('user-1');
      expect(result.data?.users?.[0].username).toBe('john');
    });
  });
});

describe('parseCSV', () => {
  it('should export parseCSV function', () => {
    const csv = `id,username,email
user-1,john,john@example.com`;
    
    const result = parseCSV(csv, 'users');
    
    expect(result.data?.users).toHaveLength(1);
  });
});
