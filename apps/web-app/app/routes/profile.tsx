import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { getSession } from '~/utils/session';

export default function Profile() {
  const [user, setUser] = useState({ 
    id: '1', 
    username: 'demo_user', 
    email: 'demo@example.com', 
    createdAt: '2024-01-01T00:00:00Z' 
  }); // Mock data for testing
  const [loading, setLoading] = useState(false); // Start as not loading for testing

  useEffect(() => {
    // Commented out for testing - enable this later
    // const loadUserData = async () => {
    //   try {
    //     const session = await getSession();
    //     const userId = session.get('userId');
        
    //     if (userId) {
    //       setUser({
    //         id: userId,
    //         username: 'demo_user',
    //         email: 'demo@example.com',
    //         createdAt: '2024-01-01T00:00:00Z'
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Error loading user data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // loadUserData();
  }, []);

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
      </div>

      <div className="profile-actions">
        <Link to="/settings" className="button">Account Settings</Link>
        <Link to="/" className="button">Back to Dashboard</Link>
      </div>
    </div>
  );
}