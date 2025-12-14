import React from 'react';
import { UserRole, getRoleDisplayName, getRoleColor, getRoleIcon } from '../types/roles';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function RoleBadge({ 
  role, 
  size = 'medium',
  showIcon = true 
}: RoleBadgeProps) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role);
  const icon = getRoleIcon(role);
  
  const sizeStyles = {
    small: {
      padding: '2px 8px',
      fontSize: '0.75rem',
    },
    medium: {
      padding: '4px 12px',
      fontSize: '0.875rem',
    },
    large: {
      padding: '6px 16px',
      fontSize: '1rem',
    },
  };
  
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: color,
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '600',
    ...sizeStyles[size],
  };
  
  return (
    <span style={style} className="role-badge">
      {showIcon && <span>{icon}</span>}
      <span>{displayName}</span>
    </span>
  );
}
