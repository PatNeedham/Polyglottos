import { cx, useReveal } from '../lib/motion';
import { BookIcon, PlugIcon, WaveIcon, CodeIcon } from './Icons';
import { Reveal, SectionHeading } from './Primitives';

const STEPS = [
  {
    icon: PlugIcon,
    title: 'Point it at a source',
    body: 'A radio stream from Bogotá, a podcast feed, a news bulletin. You pick what you want to sound like.',
  },
  {
    icon: WaveIcon,
    title: 'It captures and transcribes',
    body: 'Segments get pulled on a schedule, checked for actual speech, then run through the speech-to-text provider you configured.',
  },
  {
    icon: CodeIcon,
    title: 'Useful phrases get mined',
    body: 'Filler and ad reads are dropped. What survives is the grammar you would genuinely trip over — tenses, moods, idioms.',
  },
  {
    icon: BookIcon,
    title: 'Exercises appear',
    body: 'Cloze, listening comprehension, and translation drills are generated and scheduled against what you keep getting wrong.',
  },
];

export default function HowItWorks() {
  const { ref, shown } = useReveal<HTMLOListElement>({ threshold: 0.2 });

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="shell scroll-mt-24 py-20 sm:py-28"
    >
      <SectionHeading
        id="how-it-works-heading"
        eyebrow="Real input, not roleplay"
        title="Your lessons come from people who aren't performing for a language app."
        lede="Most apps teach you a dialect that only exists inside that app. Polyglottos runs a pipeline over live audio, so what you drill this week is what someone actually said this week."
      />

      <ol ref={ref} className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* Connector rail, desktop only. Draws itself once the list appears. */}
        <svg
          aria-hidden="true"
          className="absolute left-0 top-7 hidden h-px w-full lg:block"
          preserveAspectRatio="none"
          viewBox="0 0 100 1"
        >
          <line
            x1="6"
            y1="0.5"
            x2="94"
            y2="0.5"
            className="stroke-ink-300 dark:stroke-ink-700"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDashoffset: shown ? 0 : 200,
              transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {STEPS.map((step, i) => (
          <li
            key={step.title}
            style={{ transitionDelay: `${i * 110}ms` }}
            className={cx(
              'relative motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-smooth',
              shown ? 'opacity-100 motion-safe:translate-y-0' : 'opacity-0 motion-safe:translate-y-6'
            )}
          >
            <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-200 bg-white text-jade-600 shadow-sm dark:border-ink-800 dark:bg-ink-900 dark:text-jade-400">
              <step.icon className="h-6 w-6" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400 dark:text-ink-500">
              Step {i + 1}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-600 dark:text-ink-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <Reveal className="mt-12">
        <p className="surface max-w-3xl p-5 text-[0.95rem] leading-relaxed text-ink-600 dark:text-ink-400">
          <strong className="font-semibold text-ink-800 dark:text-ink-100">
            You bring the keys.
          </strong>{' '}
          Transcription and translation run through whichever provider you configure —
          Google, Azure, AWS, OpenAI, or a local model on your own hardware. Nothing is
          hard-wired to a vendor we happen to have a deal with.
        </p>
      </Reveal>
    </section>
  );
}
