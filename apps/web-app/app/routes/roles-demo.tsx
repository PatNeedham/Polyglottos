import { useState } from 'react';
import RoleBadge from '~/components/RoleBadge';
import { ROLES, getRoleDisplayName, getRoleDescription, UserRole } from '~/types/roles';

export default function RolesDemo() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(ROLES.LEARNER);
  
  const allRoles = Object.values(ROLES);
  
  return (
    <div className="container">
      <h1>User Roles System Demo</h1>
      
      <div className="demo-section">
        <h2>Role Badges</h2>
        <p>These badges are displayed throughout the platform to identify user roles:</p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          marginTop: '1rem',
          marginBottom: '2rem' 
        }}>
          {allRoles.map(role => (
            <RoleBadge key={role} role={role} size="large" />
          ))}
        </div>
      </div>
      
      <div className="demo-section">
        <h2>Role Information</h2>
        <p>Select a role to view its details:</p>
        
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            {allRoles.map(role => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <RoleBadge role={selectedRole} size="large" />
          </div>
          
          <h3>{getRoleDisplayName(selectedRole)}</h3>
          <p>{getRoleDescription(selectedRole)}</p>
          
          <h4 style={{ marginTop: '1.5rem' }}>Capabilities:</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {selectedRole === ROLES.LEARNER && (
              <>
                <li>Access learning materials</li>
                <li>Take quizzes and lessons</li>
                <li>Track personal progress</li>
              </>
            )}
            
            {selectedRole === ROLES.CONTRIBUTOR && (
              <>
                <li>All Learner capabilities</li>
                <li>Submit new content and lessons</li>
                <li>Comment on existing content</li>
                <li>Help improve learning materials</li>
              </>
            )}
            
            {selectedRole === ROLES.NATIVE_SPEAKER && (
              <>
                <li>All Learner capabilities</li>
                <li>Submit content and comments</li>
                <li>Verify translations for accuracy</li>
                <li>Provide pronunciation guidance</li>
                <li>Validate authentic language usage</li>
              </>
            )}
            
            {selectedRole === ROLES.MAINTAINER && (
              <>
                <li>All previous role capabilities</li>
                <li>Approve and moderate content</li>
                <li>Moderate user comments</li>
                <li>Manage user accounts</li>
                <li>Review and approve role upgrade requests</li>
                <li>Verify Native Speaker credentials</li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <div className="demo-section" style={{ marginTop: '2rem' }}>
        <h2>How to Upgrade Your Role</h2>
        <div style={{ 
          background: '#e3f2fd',
          padding: '1.5rem',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li>Go to your profile page</li>
            <li>Click "Request Role Upgrade"</li>
            <li>Select the role you want to request</li>
            <li>Provide a reason for your request (optional)</li>
            <li>Submit and wait for a maintainer to review</li>
          </ol>
          
          <p style={{ marginTop: '1rem', marginBottom: 0 }}>
            <strong>Note:</strong> Native Speaker and Contributor roles may require 
            verification evidence to ensure quality and authenticity.
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/profile" className="button primary">Go to Profile</a>
        <a href="/" className="button" style={{ marginLeft: '1rem' }}>Back to Dashboard</a>
      </div>
    </div>
  );
}
