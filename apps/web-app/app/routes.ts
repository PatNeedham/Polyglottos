import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('login', 'routes/login.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('logout', 'routes/logout.tsx'),
  route('verify-email', 'routes/verify-email.tsx'),
  route('resend-verification', 'routes/resend-verification.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('settings', 'routes/settings.tsx'),
];
