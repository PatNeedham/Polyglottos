import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getSession } from '~/utils/session';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Temporarily disable auth redirect for testing export functionality
      // const session = await getSession();
      // const userId = session.get('userId');

      // if (!userId) {
      //   navigate('/login');
      // }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="container">
      <h1>Welcome to Polyglottos</h1>
      <p>Start learning languages efficiently!</p>

      <div className="links">
        <Link to="/lessons">View Lessons</Link>
        <Link to="/profile">My Profile</Link>
        <Link to="/settings">Account Settings</Link>
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
}
