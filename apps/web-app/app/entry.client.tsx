/**
 * React Router v7 entry point for client-side rendering (SPA mode)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Root from './root';

import Index from './routes/_index';
import Login from './routes/login';
import Signup from './routes/signup';
import Logout from './routes/logout';
import VerifyEmail from './routes/verify-email';
import ResendVerification from './routes/resend-verification';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'logout',
        element: <Logout />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmail />,
      },
      {
        path: 'resend-verification',
        element: <ResendVerification />,
      },
    ],
  },
]);

let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
