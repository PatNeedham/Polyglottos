import { Outlet } from '@remix-run/react';

export default function Root() {
  return (
    <div>
      <h1>Polyglottos</h1>
      <Outlet />
    </div>
  );
}
