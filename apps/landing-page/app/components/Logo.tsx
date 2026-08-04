import { cx } from '../lib/motion';

/**
 * Wordmark. The glyph is a speech bubble whose "text" is an audio waveform —
 * the two halves of the product, spoken language and captured signal.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="Polyglottos"
      >
        <rect width="32" height="32" rx="9" className="fill-jade-600 dark:fill-jade-500" />
        <path
          d="M9 21.5V16.5M13 24V10M17 20.5V13M21 22.5V11.5M25 19V15"
          className="stroke-white dark:stroke-jade-950"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="font-sans text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        Polyglottos
      </span>
    </span>
  );
}
