import { useEffect, useState } from 'react';
import { cx, useScrolledPast } from '../lib/motion';
import { GithubIcon, MenuIcon, MoonIcon, SunIcon, CrossIcon } from './Icons';
import Logo from './Logo';
import { Button } from './Primitives';
import { REPO_URL } from '../lib/site';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#self-host', label: 'Self-host' },
  { href: '#make-it-yours', label: 'Make it yours' },
  { href: '#open-source', label: 'Open source' },
];

export default function Nav() {
  const scrolled = useScrolledPast(8);
  const [open, setOpen] = useState(false);

  // Close the mobile panel on Escape and whenever we grow past the breakpoint,
  // so the panel can't be left open and invisible behind the desktop nav.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const wide = window.matchMedia('(min-width: 768px)');
    const onResize = () => wide.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onResize);
    };
  }, [open]);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-smooth',
        scrolled || open
          ? 'border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-xl dark:border-ink-800/80 dark:bg-ink-950/80'
          : 'border-b border-transparent'
      )}
    >
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        <a href="#top" className="rounded-lg">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden rounded-lg p-2 text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50 sm:inline-flex"
          >
            <GithubIcon className="h-5 w-5" />
            <span className="sr-only">Polyglottos on GitHub</span>
          </a>

          <Button href="#start" className="hidden sm:inline-flex">
            Start learning
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-lg p-2 text-ink-700 transition-colors duration-200 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 md:hidden"
          >
            {open ? <CrossIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-ink-200/70 px-5 pb-5 pt-3 dark:border-ink-800/80 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-2">
          <Button href="#start" size="lg">
            Start learning
          </Button>
          <Button href={REPO_URL} variant="secondary" size="lg" external>
            <GithubIcon className="h-4 w-4" /> View source
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Light/dark switch. The initial class is set by an inline script in root.tsx
 * before first paint, so this only has to read back what's already applied.
 */
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('polyglottos-theme', next ? 'dark' : 'light');
    } catch {
      // Private-mode storage failures shouldn't break the toggle.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
    >
      {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      <span className="sr-only">Switch to {dark ? 'light' : 'dark'} theme</span>
    </button>
  );
}
