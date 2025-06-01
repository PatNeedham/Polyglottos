import { useLoaderData, Link } from 'react-router';
import type { ClientLoaderFunctionArgs } from 'react-router';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return {
      status: 'error',
      message: 'No verification token provided',
    };
  }

  try {
    const API_URL = process.env.API_URL || 'http://localhost:8787';
    const response = await fetch(
      `${API_URL}/users/verify-email?token=${token}`
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        message: data.error || 'Verification failed',
      };
    }

    return {
      status: 'success',
      message: 'Email successfully verified',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      status: 'error',
      message: 'An error occurred while verifying your email',
    };
  }
}

export default function VerifyEmail() {
  const { status, message } = useLoaderData<typeof clientLoader>();

  return (
    <div className="verification-container">
      <h1>Email Verification</h1>

      {status === 'success' ? (
        <div className="success-message">
          <div className="icon">✓</div>
          <h2>Email Verified!</h2>
          <p>Your email has been successfully verified.</p>
          <Link to="/login" className="button primary">
            Log In
          </Link>
        </div>
      ) : (
        <div className="error-message">
          <div className="icon">!</div>
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <p>
            If your verification link has expired, you can request a new one:
          </p>
          <Link to="/resend-verification" className="button secondary">
            Resend Verification Email
          </Link>
        </div>
      )}
    </div>
  );
}
