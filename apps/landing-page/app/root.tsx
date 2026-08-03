import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import type { MetaFunction, LinksFunction } from '@remix-run/node';

import tailwindStyles from './styles/tailwind.css?url';

const DESCRIPTION =
  'Polyglottos is an open-source language learning platform built from real broadcasts, not scripted textbook sentences. Every course is an editable file, and you can self-host the whole thing so your data never leaves your network.';

export const meta: MetaFunction = () => [
  { title: 'Polyglottos — open-source language learning you can host yourself' },
  { name: 'description', content: DESCRIPTION },
  { name: 'theme-color', content: '#04905D' },
  { property: 'og:type', content: 'website' },
  {
    property: 'og:title',
    content: 'Polyglottos — open-source language learning you can host yourself',
  },
  { property: 'og:description', content: DESCRIPTION },
  { name: 'twitter:card', content: 'summary_large_image' },
];

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
  },
  { rel: 'stylesheet', href: tailwindStyles },
];

/**
 * Applies the stored (or system) theme before first paint so dark-mode users
 * never see a white flash. Kept tiny and dependency-free on purpose.
 */
const THEME_INIT = `(function(){try{var s=localStorage.getItem('polyglottos-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-jade-600 focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
