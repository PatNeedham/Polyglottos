import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { getSession } from '~/utils/session';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId) {
    return redirect('/login');
  }

  return { userId };
}

export default function Index() {
  return (
    <div className="container">
      <h1>Welcome to Polyglottos</h1>
      <p>Start learning languages efficiently!</p>

      <div className="links">
        <Link to="/lessons">View Lessons</Link>
        <Link to="/profile">My Profile</Link>
        <form action="/logout" method="post">
          <button type="submit">Logout</button>
        </form>
      </div>
    </div>
  );
}
