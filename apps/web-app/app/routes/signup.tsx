import { redirect } from 'react-router';
import type { ClientActionFunctionArgs } from 'react-router';
import { Form, Link, useActionData, useNavigation } from 'react-router';
import { getSession } from '~/utils/session';

export async function clientLoader() {
  const session = await getSession();

  if (session.has('userId')) {
    return redirect('/');
  }

  return {};
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!username || !email || !password) {
    return {
      error: 'All fields are required',
      fields: { username, email, password },
    };
  }

  if (password.length < 6) {
    return {
      error: 'Password must be at least 6 characters',
      fields: { username, email },
    };
  }

  try {
    const response = await fetch('http://localhost:8787/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    console.log('data:', data);

    if (!response.ok) {
      return {
        error: data.error || 'Sign up failed',
        fields: { username, email },
      };
    }

    return redirect('/login?signupSuccess=true');
  } catch (error) {
    console.error('Signup error:', error);
    return {
      error: 'Sign up failed. Please try again.',
      fields: { username, email },
    };
  }
}

export default function Signup() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="signup-container">
      <h1>Sign Up for Polyglottos</h1>

      {actionData?.error && (
        <div className="error-message">{actionData.error}</div>
      )}

      <Form method="post" className="signup-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            defaultValue={actionData?.fields?.username || ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={actionData?.fields?.email || ''}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          <p className="help-text">Password must be at least 6 characters</p>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </Form>

      <div className="signup-links">
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
