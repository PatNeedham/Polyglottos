import { cx, useReveal } from '../lib/motion';
import { CheckIcon, CrossIcon } from './Icons';
import { SectionHeading } from './Primitives';

type Cell = { yes: boolean; note: string };

const ROWS: Array<{ capability: string; ours: Cell; theirs: Cell }> = [
  {
    capability: 'Read the code that grades you',
    ours: { yes: true, note: 'Every line, MIT licensed' },
    theirs: { yes: false, note: 'Closed' },
  },
  {
    capability: 'Run it on hardware you control',
    ours: { yes: true, note: 'Laptop, VPS, or a Pi' },
    theirs: { yes: false, note: 'Their servers only' },
  },
  {
    capability: 'Practice history stays private',
    ours: { yes: true, note: 'Never leaves your instance' },
    theirs: { yes: false, note: 'Governed by a policy that can change' },
  },
  {
    capability: 'Author and publish your own course',
    ours: { yes: true, note: 'Open a pull request' },
    theirs: { yes: false, note: 'Usually a walled contributor programme' },
  },
  {
    capability: 'Material from current, real speech',
    ours: { yes: true, note: 'Live radio, podcasts, news' },
    theirs: { yes: false, note: 'Pre-written scripts' },
  },
  {
    capability: 'Use it without an account',
    ours: { yes: true, note: 'Local-first by default' },
    theirs: { yes: false, note: 'Sign-up required' },
  },
  {
    capability: 'Free of ads, gems, and streak-loss pressure',
    ours: { yes: true, note: 'Nothing here to monetise' },
    theirs: { yes: false, note: 'That is the business model' },
  },
];

/**
 * Deliberately phrased against "typical closed-source apps" rather than any
 * named competitor — the claims should hold for the category, not one product.
 */
export default function Comparison() {
  const { ref, shown } = useReveal<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section
      aria-labelledby="comparison-heading"
      className="bg-white py-20 dark:bg-ink-900/40 sm:py-28"
    >
      <div className="shell">
        <SectionHeading
          id="comparison-heading"
          eyebrow="The honest version"
          title="What you give up by using the closed one."
          lede="Polyglottos will not out-polish a company with a few hundred designers. What it can do is refuse to hold your learning hostage."
          align="center"
        />

        <div ref={ref} className="surface mt-14 overflow-hidden">
          {/* Column headers, hidden on small screens where each row stacks. */}
          <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-ink-200/80 px-6 py-4 dark:border-ink-800 sm:grid">
            <span className="sr-only">Capability</span>
            <p className="text-sm font-semibold text-jade-700 dark:text-jade-300">Polyglottos</p>
            <p className="text-sm font-semibold text-ink-500 dark:text-ink-400">
              Typical closed-source app
            </p>
          </div>

          <ul>
            {ROWS.map((row, i) => (
              <li
                key={row.capability}
                style={{ transitionDelay: `${i * 70}ms` }}
                className={cx(
                  'grid gap-2 border-b border-ink-200/70 px-6 py-4 last:border-b-0 dark:border-ink-800/70 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-4',
                  'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-smooth',
                  shown ? 'opacity-100 motion-safe:translate-x-0' : 'opacity-0 motion-safe:-translate-x-3'
                )}
              >
                <p className="font-medium text-ink-800 dark:text-ink-100">{row.capability}</p>
                <Verdict cell={row.ours} tone="good" label="Polyglottos" />
                <Verdict cell={row.theirs} tone="bad" label="Typical closed-source app" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Verdict({
  cell,
  tone,
  label,
}: {
  cell: Cell;
  tone: 'good' | 'bad';
  label: string;
}) {
  const positive = tone === 'good';
  return (
    <p className="flex items-start gap-2 text-sm">
      <span
        className={cx(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          positive
            ? 'bg-jade-500/15 text-jade-600 dark:text-jade-400'
            : 'bg-ink-400/15 text-ink-400 dark:text-ink-500'
        )}
      >
        {positive ? <CheckIcon className="h-3.5 w-3.5" /> : <CrossIcon className="h-3.5 w-3.5" />}
      </span>
      <span className={positive ? 'text-ink-700 dark:text-ink-300' : 'text-ink-500 dark:text-ink-500'}>
        <span className="sr-only">{label}: </span>
        {cell.note}
      </span>
    </p>
  );
}
