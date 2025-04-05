import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { getSession } from '~/utils/session';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('userId')) {
    return redirect('/');
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!username || !email || !password) {
    return json(
      {
        error: 'All fields are required',
        fields: { username, email, password },
      },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return json(
      {
        error: 'Password must be at least 6 characters',
        fields: { username, email },
      },
      { status: 400 }
    );
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
      return json(
        {
          error: data.error || 'Sign up failed',
          fields: { username, email },
        },
        { status: response.status }
      );
    }

    return redirect('/login?signupSuccess=true');
  } catch (error) {
    console.error('Signup error:', error);
    return json(
      {
        error: 'Sign up failed. Please try again.',
        fields: { username, email },
      },
      { status: 500 }
    );
  }
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
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
