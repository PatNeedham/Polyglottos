// Role types and constants
export const ROLES = {
  LEARNER: 'learner',
  CONTRIBUTOR: 'contributor',
  NATIVE_SPEAKER: 'native_speaker',
  MAINTAINER: 'maintainer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Permission levels
export const PERMISSIONS = {
  // Basic permissions - all roles
  VIEW_CONTENT: 'view_content',
  TAKE_QUIZZES: 'take_quizzes',
  TRACK_PROGRESS: 'track_progress',
  
  // Contributor permissions
  SUBMIT_CONTENT: 'submit_content',
  COMMENT_ON_CONTENT: 'comment_on_content',
  
  // Native speaker permissions
  VERIFY_TRANSLATIONS: 'verify_translations',
  PROVIDE_PRONUNCIATION: 'provide_pronunciation',
  
  // Maintainer permissions
  APPROVE_CONTENT: 'approve_content',
  MODERATE_COMMENTS: 'moderate_comments',
  MANAGE_USERS: 'manage_users',
  VERIFY_ROLES: 'verify_roles',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.LEARNER]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.TRACK_PROGRESS,
  ],
  [ROLES.CONTRIBUTOR]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.TRACK_PROGRESS,
    PERMISSIONS.SUBMIT_CONTENT,
    PERMISSIONS.COMMENT_ON_CONTENT,
  ],
  [ROLES.NATIVE_SPEAKER]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.TRACK_PROGRESS,
    PERMISSIONS.SUBMIT_CONTENT,
    PERMISSIONS.COMMENT_ON_CONTENT,
    PERMISSIONS.VERIFY_TRANSLATIONS,
    PERMISSIONS.PROVIDE_PRONUNCIATION,
  ],
  [ROLES.MAINTAINER]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.TRACK_PROGRESS,
    PERMISSIONS.SUBMIT_CONTENT,
    PERMISSIONS.COMMENT_ON_CONTENT,
    PERMISSIONS.VERIFY_TRANSLATIONS,
    PERMISSIONS.PROVIDE_PRONUNCIATION,
    PERMISSIONS.APPROVE_CONTENT,
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VERIFY_ROLES,
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

// Check if a role can perform an action
export function canSubmitContent(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.SUBMIT_CONTENT);
}

export function canModerateContent(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.APPROVE_CONTENT) || 
         hasPermission(role, PERMISSIONS.MODERATE_COMMENTS);
}

export function canVerifyRoles(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VERIFY_ROLES);
}

export function canVerifyTranslations(role: UserRole): boolean {
  return hasPermission(role, PERMISSIONS.VERIFY_TRANSLATIONS);
}
