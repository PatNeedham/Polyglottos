import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { commitSession, getSession } from '~/utils/session';

export default function Login() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session.has('userId')) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Email and password are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8787/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid login');
        setIsSubmitting(false);
        return;
      }

      const session = await getSession();
      session.set('userId', data.userId);
      session.set('token', data.token);
      await commitSession();

      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login to Polyglottos</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="login-links">
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
