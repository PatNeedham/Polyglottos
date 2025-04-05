import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';

import styles from './styles/global.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Polyglottos - Learn Languages</title>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <Meta />
          <Links />
          <title>Error - Polyglottos</title>
        </head>
        <body>
          <div className="error-container">
            <h1>
              {error.status} {error.statusText}
            </h1>
            <p>{error.data}</p>
            <a href="/">Back to Home</a>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
        <title>Error - Polyglottos</title>
      </head>
      <body>
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again later.</p>
          <a href="/">Back to Home</a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
