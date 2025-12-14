import React, { useEffect, useState } from 'react';
import { RoleRequest, getRoleDisplayName } from '../types/roles';

interface RoleRequestsListProps {
  userId: string | number;
  refreshTrigger?: number;
}

export default function RoleRequestsList({ userId, refreshTrigger }: RoleRequestsListProps) {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadRequests();
  }, [userId, refreshTrigger]);
  
  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8787/roles/requests/user/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError('Failed to load role requests');
      }
    } catch (err) {
      console.error('Error loading role requests:', err);
      setError('Failed to load role requests');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading role requests...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (requests.length === 0) {
    return <div className="empty-state">No role requests yet</div>;
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'status-badge success';
      case 'rejected':
        return 'status-badge error';
      default:
        return 'status-badge pending';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✗';
      default:
        return '⏱';
    }
  };
  
  return (
    <div className="role-requests-list">
      <h3>Your Role Requests</h3>
      <div className="requests-container">
        {requests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="request-roles">
                <span className="role-change">
                  {getRoleDisplayName(request.currentRole)} → {getRoleDisplayName(request.requestedRole)}
                </span>
              </div>
              <span className={getStatusBadgeClass(request.status)}>
                <span className="status-icon">{getStatusIcon(request.status)}</span>
                {request.status.toUpperCase()}
              </span>
            </div>
            
            {request.reason && (
              <div className="request-reason">
                <strong>Reason:</strong> {request.reason}
              </div>
            )}
            
            <div className="request-footer">
              <span className="request-date">
                Requested: {new Date(request.createdAt).toLocaleDateString()}
              </span>
              {request.reviewedAt && (
                <span className="review-date">
                  Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
