import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { commitSession, getSession } from '~/utils/session';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  session.unset('userId');
  session.unset('token');

  return redirect('/login', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function Logout() {
  return <p>Logging out...</p>;
}
