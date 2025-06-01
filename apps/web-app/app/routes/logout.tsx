import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { destroySession } from '~/utils/session';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await destroySession();
      navigate('/login');
    };

    handleLogout();
  }, [navigate]);

  return <p>Logging out...</p>;
}
