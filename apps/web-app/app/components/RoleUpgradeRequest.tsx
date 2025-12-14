import React, { useState } from 'react';
import { ROLES, UserRole, getRoleDisplayName, getRoleDescription } from '../types/roles';
import { API_BASE_URL } from '../services/config';

interface RoleUpgradeRequestProps {
  userId: string | number;
  currentRole: UserRole;
  onRequestSubmitted?: () => void;
}

export default function RoleUpgradeRequest({ 
  userId, 
  currentRole,
  onRequestSubmitted 
}: RoleUpgradeRequestProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Get available roles (excluding current role and learner)
  const availableRoles = Object.values(ROLES).filter(
    role => role !== currentRole && role !== ROLES.LEARNER
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setMessage({ type: 'error', text: 'Please select a role' });
      return;
    }
    
    setSubmitting(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/roles/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          requestedRole: selectedRole,
          reason,
        }),
      });
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Role upgrade request submitted successfully! A maintainer will review your request.' 
        });
        setSelectedRole('');
        setReason('');
        onRequestSubmitted?.();
      } else {
        const errorText = await response.text();
        setMessage({ type: 'error', text: errorText || 'Failed to submit request' });
      }
    } catch (error) {
      console.error('Error submitting role request:', error);
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="role-upgrade-request">
      <h3>Request Role Upgrade</h3>
      <p>Apply for a higher role to access additional features and contribute more to the platform.</p>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role-select">Select Role</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            required
          >
            <option value="">-- Select a role --</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
          {selectedRole && (
            <p className="role-description">
              {getRoleDescription(selectedRole)}
            </p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="reason">Reason for Request (Optional)</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Explain why you'd like this role and how you plan to contribute..."
          />
        </div>
        
        <button type="submit" disabled={submitting} className="button primary">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
