import { useEffect, useState } from 'react';
import { usePrefersReducedMotion, useReveal } from '../lib/motion';
import { ArrowRightIcon, GithubIcon, ShieldIcon, UsersIcon, BookIcon, ChartIcon } from './Icons';
import { Button, Reveal, SectionHeading } from './Primitives';
import { CONTRIBUTING_URL, ISSUES_URL, REPO_URL } from '../lib/site';

const ROLES = [
  {
    icon: BookIcon,
    name: 'Learner',
    body: 'Study, keep a streak, export everything you have ever done whenever you feel like it.',
  },
  {
    icon: UsersIcon,
    name: 'Contributor',
    body: 'Submit lessons and quizzes, fix a translation that has been bugging you for weeks.',
  },
  {
    icon: ShieldIcon,
    name: 'Native speaker',
    body: 'Verify that a phrase is something a person would actually say, and record the pronunciation.',
  },
  {
    icon: ChartIcon,
    name: 'Maintainer',
    body: 'Review submissions, keep quality high, steer where a language course goes next.',
  },
];

const FACTS = [
  { value: 26, suffix: '', label: 'open issues waiting for someone' },
  { value: 0, suffix: '', label: 'trackers, analytics scripts, or ad SDKs' },
  { value: 100, suffix: '%', label: 'of the stack you can run yourself' },
];

export default function OpenSource() {
  return (
    <section
      id="open-source"
      aria-labelledby="open-source-heading"
      className="shell scroll-mt-24 py-20 sm:py-28"
    >
      <SectionHeading
        id="open-source-heading"
        eyebrow="Built by whoever shows up"
        title="A language app is a good thing to build in the open."
        lede="Nobody on a payroll knows how people speak in every city in the world. The people who do know are already out there — this project just gives them commit access."
      />

      <dl className="mt-12 grid gap-6 sm:grid-cols-3">
        {FACTS.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 110} className="surface p-6">
            <dt className="sr-only">{fact.label}</dt>
            <dd>
              <Counter to={fact.value} suffix={fact.suffix} />
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                {fact.label}
              </p>
            </dd>
          </Reveal>
        ))}
      </dl>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role, i) => (
          <Reveal key={role.name} delay={i * 90} className="surface lift p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-jade-500/15 text-jade-600 dark:text-jade-400">
              <role.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{role.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
              {role.body}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href={ISSUES_URL} external>
          Find something to work on
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-spring motion-safe:group-hover:translate-x-1" />
        </Button>
        <Button href={CONTRIBUTING_URL} variant="secondary" external>
          Contributing guide
        </Button>
        <Button href={REPO_URL} variant="ghost" external>
          <GithubIcon className="h-4 w-4" />
          Star the repo
        </Button>
      </Reveal>
    </section>
  );
}

/** Counts up once, when scrolled into view. Static for reduced-motion users. */
function Counter({ to, suffix }: { to: number; suffix: string }) {
  const reduced = usePrefersReducedMotion();
  const { ref, shown } = useReveal<HTMLSpanElement>({ threshold: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shown) return;
    if (reduced || to === 0) {
      setValue(to);
      return;
    }

    const DURATION = 1100;
    const start = Date.now();

    // Timers rather than requestAnimationFrame: rAF is suspended in background
    // tabs, which would leave these reading a flat, wrong "0". The safety
    // timeout guarantees the true figure lands even if the tween is throttled.
    const tick = setInterval(() => {
      const t = Math.min((Date.now() - start) / DURATION, 1);
      // easeOutCubic — fast start, gentle settle.
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) clearInterval(tick);
    }, 16);

    const safety = setTimeout(() => {
      clearInterval(tick);
      setValue(to);
    }, DURATION + 500);

    return () => {
      clearInterval(tick);
      clearTimeout(safety);
    };
  }, [shown, reduced, to]);

  return (
    <span
      ref={ref}
      className="font-sans text-4xl font-semibold tabular-nums tracking-tight text-ink-900 dark:text-ink-50"
    >
      {value}
      {suffix}
    </span>
  );
}
