import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { getSession } from '~/utils/session';
import RoleBadge from '~/components/RoleBadge';
import RoleUpgradeRequest from '~/components/RoleUpgradeRequest';
import RoleRequestsList from '~/components/RoleRequestsList';
import { UserRole, ROLES, UserPermissions } from '~/types/roles';
import { API_BASE_URL } from '~/services/config';

export default function Profile() {
  const [user, setUser] = useState<any>({ 
    id: '1', 
    username: 'demo_user', 
    email: 'demo@example.com', 
    role: ROLES.LEARNER,
    createdAt: '2024-01-01T00:00:00Z' 
  }); // Mock data for testing
  const [loading, setLoading] = useState(false); // Start as not loading for testing
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // For now using mock data - will be replaced with actual API calls
      const userId = user.id;
      
      // Fetch user role and permissions from API
      const roleResponse = await fetch(`${API_BASE_URL}/roles/user/${userId}`);
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setUser((prev: any) => ({ ...prev, role: roleData.role }));
      }
      
      const permissionsResponse = await fetch(`${API_BASE_URL}/roles/permissions/${userId}`);
      if (permissionsResponse.ok) {
        const permData = await permissionsResponse.json();
        setPermissions(permData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleRequestSubmitted = () => {
    setShowUpgradeForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <div className="container">User not found</div>;
  }

  return (
    <div className="container">
      <h1>My Profile</h1>
      
      <div className="profile-info">
        <h2>Account Information</h2>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <div style={{ marginTop: '10px' }}>
          <strong>Role:</strong> <RoleBadge role={user.role as UserRole} />
        </div>
      </div>

      {permissions && (
        <div className="permissions-info">
          <h2>Your Permissions</h2>
          <ul>
            {permissions.permissions.canSubmitContent && <li>✓ Submit content</li>}
            {permissions.permissions.canVerifyTranslations && <li>✓ Verify translations</li>}
            {permissions.permissions.canApproveContent && <li>✓ Approve content</li>}
            {permissions.permissions.canModerateComments && <li>✓ Moderate comments</li>}
            {permissions.permissions.canManageUsers && <li>✓ Manage users</li>}
            {permissions.permissions.canVerifyRoles && <li>✓ Verify roles</li>}
          </ul>
        </div>
      )}

      <div className="role-management">
        <h2>Role Management</h2>
        <button 
          className="button primary" 
          onClick={() => setShowUpgradeForm(!showUpgradeForm)}
        >
          {showUpgradeForm ? 'Cancel' : 'Request Role Upgrade'}
        </button>
        
        {showUpgradeForm && (
          <div style={{ marginTop: '20px' }}>
            <RoleUpgradeRequest 
              userId={user.id}
              currentRole={user.role as UserRole}
              onRequestSubmitted={handleRequestSubmitted}
            />
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <RoleRequestsList userId={user.id} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <div className="profile-actions">
        <Link to="/settings" className="button">Account Settings</Link>
        <Link to="/" className="button">Back to Dashboard</Link>
      </div>
    </div>
  );
}