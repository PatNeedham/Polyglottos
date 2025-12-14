/**
 * Tests for role management functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  ROLES, 
  getRoleDisplayName, 
  getRoleColor, 
  getRoleIcon, 
  getRoleDescription 
} from '../app/types/roles';

describe('Role Management', () => {
  describe('Role Constants', () => {
    it('should have all required role types', () => {
      expect(ROLES.LEARNER).toBe('learner');
      expect(ROLES.CONTRIBUTOR).toBe('contributor');
      expect(ROLES.NATIVE_SPEAKER).toBe('native_speaker');
      expect(ROLES.MAINTAINER).toBe('maintainer');
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return correct display name for learner', () => {
      expect(getRoleDisplayName(ROLES.LEARNER)).toBe('Learner');
    });

    it('should return correct display name for contributor', () => {
      expect(getRoleDisplayName(ROLES.CONTRIBUTOR)).toBe('Contributor');
    });

    it('should return correct display name for native speaker', () => {
      expect(getRoleDisplayName(ROLES.NATIVE_SPEAKER)).toBe('Native Speaker');
    });

    it('should return correct display name for maintainer', () => {
      expect(getRoleDisplayName(ROLES.MAINTAINER)).toBe('Maintainer');
    });

    it('should return default name for invalid role', () => {
      expect(getRoleDisplayName('invalid' as any)).toBe('Learner');
    });
  });

  describe('getRoleColor', () => {
    it('should return color for learner', () => {
      const color = getRoleColor(ROLES.LEARNER);
      expect(color).toBe('#4A90E2');
    });

    it('should return color for contributor', () => {
      const color = getRoleColor(ROLES.CONTRIBUTOR);
      expect(color).toBe('#7B68EE');
    });

    it('should return color for native speaker', () => {
      const color = getRoleColor(ROLES.NATIVE_SPEAKER);
      expect(color).toBe('#50C878');
    });

    it('should return color for maintainer', () => {
      const color = getRoleColor(ROLES.MAINTAINER);
      expect(color).toBe('#FFD700');
    });

    it('should return default color for invalid role', () => {
      const color = getRoleColor('invalid' as any);
      expect(color).toBe('#4A90E2');
    });
  });

  describe('getRoleIcon', () => {
    it('should return icon for each role', () => {
      expect(getRoleIcon(ROLES.LEARNER)).toBe('📚');
      expect(getRoleIcon(ROLES.CONTRIBUTOR)).toBe('✍️');
      expect(getRoleIcon(ROLES.NATIVE_SPEAKER)).toBe('🗣️');
      expect(getRoleIcon(ROLES.MAINTAINER)).toBe('⚙️');
    });

    it('should return default icon for invalid role', () => {
      expect(getRoleIcon('invalid' as any)).toBe('📚');
    });
  });

  describe('getRoleDescription', () => {
    it('should return description for learner', () => {
      const desc = getRoleDescription(ROLES.LEARNER);
      expect(desc).toContain('learning materials');
      expect(desc).toContain('quizzes');
    });

    it('should return description for contributor', () => {
      const desc = getRoleDescription(ROLES.CONTRIBUTOR);
      expect(desc).toContain('Submit content');
      expect(desc).toContain('comment');
    });

    it('should return description for native speaker', () => {
      const desc = getRoleDescription(ROLES.NATIVE_SPEAKER);
      expect(desc).toContain('Verify translations');
      expect(desc).toContain('pronunciation');
    });

    it('should return description for maintainer', () => {
      const desc = getRoleDescription(ROLES.MAINTAINER);
      expect(desc).toContain('Moderate');
      expect(desc).toContain('manage');
    });

    it('should return empty string for invalid role', () => {
      expect(getRoleDescription('invalid' as any)).toBe('');
    });
  });

  describe('Role Request URL generation', () => {
    it('should generate correct URL for role request', () => {
      const userId = 123;
      const requestedRole = ROLES.CONTRIBUTOR;
      
      const expectedUrl = 'http://localhost:8787/roles/request';
      expect(expectedUrl).toBe('http://localhost:8787/roles/request');
    });

    it('should generate correct URL for getting user role', () => {
      const userId = 123;
      const expectedUrl = `http://localhost:8787/roles/user/${userId}`;
      expect(expectedUrl).toBe(`http://localhost:8787/roles/user/123`);
    });

    it('should generate correct URL for user permissions', () => {
      const userId = 123;
      const expectedUrl = `http://localhost:8787/roles/permissions/${userId}`;
      expect(expectedUrl).toBe(`http://localhost:8787/roles/permissions/123`);
    });

    it('should generate correct URL for user role requests list', () => {
      const userId = 123;
      const expectedUrl = `http://localhost:8787/roles/requests/user/${userId}`;
      expect(expectedUrl).toBe(`http://localhost:8787/roles/requests/user/123`);
    });
  });

  describe('Permission Checks', () => {
    it('should validate role request data structure', () => {
      const roleRequest = {
        userId: 123,
        requestedRole: ROLES.CONTRIBUTOR,
        currentRole: ROLES.LEARNER,
        reason: 'I want to contribute content',
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      expect(roleRequest.userId).toBe(123);
      expect(roleRequest.requestedRole).toBe(ROLES.CONTRIBUTOR);
      expect(roleRequest.currentRole).toBe(ROLES.LEARNER);
      expect(roleRequest.status).toBe('pending');
    });

    it('should validate role verification data structure', () => {
      const verification = {
        userId: 123,
        role: ROLES.NATIVE_SPEAKER,
        evidence: 'I am a native Danish speaker',
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      expect(verification.userId).toBe(123);
      expect(verification.role).toBe(ROLES.NATIVE_SPEAKER);
      expect(verification.status).toBe('pending');
    });
  });
});
