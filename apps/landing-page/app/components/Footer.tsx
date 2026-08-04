import { GithubIcon } from './Icons';
import Logo from './Logo';
import {
  CONTRIBUTING_URL,
  COURSES_URL,
  DISCUSSIONS_URL,
  ISSUES_URL,
  LICENSE_URL,
  REPO_URL,
} from '../lib/site';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Self-hosting', href: '#self-host' },
      { label: 'Customisation', href: '#make-it-yours' },
      { label: 'Become a tutor', href: '/prospective-tutors' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { label: 'Source code', href: REPO_URL, external: true },
      { label: 'Open issues', href: ISSUES_URL, external: true },
      { label: 'Contributing', href: CONTRIBUTING_URL, external: true },
      { label: 'Discussions', href: DISCUSSIONS_URL, external: true },
    ],
  },
  {
    heading: 'Content',
    links: [
      { label: 'Course library', href: COURSES_URL, external: true },
      { label: 'MIT licence', href: LICENSE_URL, external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-white/60 dark:border-ink-800/70 dark:bg-ink-900/30">
      <div className="shell grid gap-10 py-14 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            An open-source language learning platform built on real speech — and designed so
            you never have to take our word for anything.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-50"
          >
            <GithubIcon className="h-4 w-4" />
            PatNeedham/Polyglottos
          </a>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
              {column.heading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...('external' in link && link.external
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                    className="rounded text-sm text-ink-600 transition-colors duration-200 hover:text-jade-700 dark:text-ink-400 dark:hover:text-jade-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ink-200/70 dark:border-ink-800/70">
        <div className="shell flex flex-col gap-2 py-6 text-sm text-ink-400 dark:text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Polyglottos contributors. MIT licensed.</p>
          <p>No cookies set by this page. Nothing to accept.</p>
        </div>
      </div>
    </footer>
  );
}
