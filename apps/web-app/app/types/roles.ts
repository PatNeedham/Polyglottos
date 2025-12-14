// Role types and constants - synced with backend
export const ROLES = {
  LEARNER: 'learner',
  CONTRIBUTOR: 'contributor',
  NATIVE_SPEAKER: 'native_speaker',
  MAINTAINER: 'maintainer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface UserWithRole {
  id: string | number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface RoleRequest {
  id: number;
  userId: number;
  requestedRole: UserRole;
  currentRole: UserRole;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
}

export interface RoleVerification {
  id: number;
  userId: number;
  role: UserRole;
  evidence?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
}

export interface UserPermissions {
  role: UserRole;
  permissions: {
    canSubmitContent: boolean;
    canVerifyTranslations: boolean;
    canApproveContent: boolean;
    canModerateComments: boolean;
    canManageUsers: boolean;
    canVerifyRoles: boolean;
  };
}

// Helper functions
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [ROLES.LEARNER]: 'Learner',
    [ROLES.CONTRIBUTOR]: 'Contributor',
    [ROLES.NATIVE_SPEAKER]: 'Native Speaker',
    [ROLES.MAINTAINER]: 'Maintainer',
  };
  return roleNames[role] || 'Learner';
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    [ROLES.LEARNER]: '#4A90E2',
    [ROLES.CONTRIBUTOR]: '#7B68EE',
    [ROLES.NATIVE_SPEAKER]: '#50C878',
    [ROLES.MAINTAINER]: '#FFD700',
  };
  return roleColors[role] || '#4A90E2';
}

export function getRoleIcon(role: UserRole): string {
  const roleIcons: Record<UserRole, string> = {
    [ROLES.LEARNER]: '📚',
    [ROLES.CONTRIBUTOR]: '✍️',
    [ROLES.NATIVE_SPEAKER]: '🗣️',
    [ROLES.MAINTAINER]: '⚙️',
  };
  return roleIcons[role] || '📚';
}

export function getRoleDescription(role: UserRole): string {
  const roleDescriptions: Record<UserRole, string> = {
    [ROLES.LEARNER]: 'Access learning materials, take quizzes, and track your progress',
    [ROLES.CONTRIBUTOR]: 'Submit content, comment on lessons, and help improve materials',
    [ROLES.NATIVE_SPEAKER]: 'Verify translations, provide pronunciation help, and validate content',
    [ROLES.MAINTAINER]: 'Moderate content, manage users, and maintain the platform',
  };
  return roleDescriptions[role] || '';
}
