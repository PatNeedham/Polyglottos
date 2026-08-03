import { ArrowRightIcon, ServerIcon, GlobeIcon } from './Icons';
import { Button, Reveal } from './Primitives';
import { REPO_URL } from '../lib/site';

/**
 * Two genuinely different audiences, two doors. Hosted for people who just
 * want to study tonight; self-hosted for people who won't ship their data
 * anywhere. Neither is presented as the upsell.
 */
const PATHS = [
  {
    icon: GlobeIcon,
    kicker: 'Use the hosted app',
    title: 'Start in about ten seconds',
    body: 'Pick a language and go. No card, no trial countdown, and you can pull your entire history out as JSON or CSV the moment you want to leave.',
    cta: { label: 'Open Polyglottos', href: '/app', external: false },
    variant: 'primary' as const,
  },
  {
    icon: ServerIcon,
    kicker: 'Run your own',
    title: 'Nothing leaves your network',
    body: 'Clone, configure, serve. Same app, same courses — except the database is on your machine and the only outbound traffic is what you explicitly turn on.',
    cta: { label: 'Read the setup guide', href: `${REPO_URL}#getting-started`, external: true },
    variant: 'secondary' as const,
  },
];

export default function StartCta() {
  return (
    <section
      id="start"
      aria-labelledby="start-heading"
      className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="grid-backdrop absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade-300/20 blur-[110px] dark:bg-jade-700/15" />
      </div>

      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2
            id="start-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Two ways in. Pick whichever one you trust.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-600 dark:text-ink-400">
            They run the same code. That is rather the point.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {PATHS.map((path, i) => (
            <Reveal key={path.kicker} delay={i * 120} className="surface lift flex flex-col p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-jade-500/15 text-jade-600 dark:text-jade-400">
                <path.icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
                {path.kicker}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{path.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-ink-600 dark:text-ink-400">
                {path.body}
              </p>
              <div className="mt-6">
                <Button
                  href={path.cta.href}
                  variant={path.variant}
                  size="lg"
                  external={path.cta.external}
                >
                  {path.cta.label}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-spring motion-safe:group-hover:translate-x-1" />
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
