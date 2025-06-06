import type { ClientActionFunctionArgs } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    const API_URL = process.env.API_URL || 'http://localhost:8787';
    const response = await fetch(`${API_URL}/users/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    return {
      success: true,
      message:
        data.message || 'Verification email sent. Please check your inbox.',
    };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      error: 'Failed to send verification email. Please try again later.',
    };
  }
}

export default function ResendVerification() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="resend-verification-container">
      <h1>Resend Verification Email</h1>

      {actionData?.success ? (
        <div className="success-message">
          <p>{actionData.message}</p>
          <p>
            Please check your inbox and spam folder for the verification email.
          </p>
        </div>
      ) : (
        <>
          {actionData?.error && (
            <div className="error-message">{actionData.error}</div>
          )}

          <Form method="post">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email address"
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </Form>
        </>
      )}
    </div>
  );
}
