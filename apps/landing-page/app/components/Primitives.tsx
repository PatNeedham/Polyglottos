import type { ElementType, ReactNode } from 'react';
import { cx, useMounted, useReveal } from '../lib/motion';

/**
 * Entrance animation, triggered either when the element scrolls into view
 * (default) or as soon as it mounts — use `mount` for anything above the fold.
 *
 * Deliberately a class-swapped transition rather than a keyframe animation:
 * the element's resting state is visible, so content still shows even if the
 * transition never runs. `motion-safe:` means reduced-motion visitors land on
 * that final state with no movement at all.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
  trigger = 'view',
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in milliseconds. Keep under ~400ms so nothing feels sluggish. */
  delay?: number;
  className?: string;
  trigger?: 'view' | 'mount';
}) {
  const { ref, shown: inView } = useReveal<HTMLDivElement>();
  const mounted = useMounted();
  const shown = trigger === 'mount' ? mounted : inView;

  return (
    <Tag
      ref={trigger === 'mount' ? undefined : ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cx(
        'motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-smooth',
        shown
          ? 'opacity-100 motion-safe:translate-y-0'
          : 'opacity-0 motion-safe:translate-y-5',
        className
      )}
    >
      {children}
    </Tag>
  );
}

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
  external?: boolean;
};

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-jade-600 text-white shadow-[0_10px_24px_-12px_rgba(4,144,93,0.9)] hover:bg-jade-700 dark:bg-jade-500 dark:text-jade-950 dark:hover:bg-jade-400',
  secondary:
    'border border-ink-300 bg-white text-ink-800 hover:border-ink-400 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-ink-600 dark:hover:bg-ink-800',
  ghost:
    'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800/70',
};

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  external = false,
}: ButtonProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      className={cx(
        'group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-smooth motion-safe:active:scale-[0.975]',
        size === 'lg' ? 'px-6 py-3.5 text-[0.975rem]' : 'px-4 py-2.5 text-sm',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Shared section header. `id` anchors the nav links; the heading itself is the
 * accessible name for the surrounding <section aria-labelledby>.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = 'left',
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id: string;
  align?: 'left' | 'center';
}) {
  return (
    <Reveal className={cx('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="eyebrow">
        <span aria-hidden="true" className="h-px w-6 bg-jade-500/70" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-base leading-relaxed text-ink-600 dark:text-ink-400 sm:text-lg">
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
