import { Outlet, useRouteError, isRouteErrorResponse } from 'react-router';

import './styles/global.css';

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
        <a href="/">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again later.</p>
      <a href="/">Back to Home</a>
    </div>
  );
}
