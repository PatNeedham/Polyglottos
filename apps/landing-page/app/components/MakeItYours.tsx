import { CheckIcon, ArrowRightIcon } from './Icons';
import { Button, Reveal, SectionHeading } from './Primitives';
import { COURSES_URL } from '../lib/site';

const KNOBS = [
  {
    title: 'Write courses in plain files',
    body: 'A course is JSON and Markdown in a directory. Open a pull request and it ships — no CMS, no approval queue you can\'t see.',
  },
  {
    title: 'Choose your own exercise mix',
    body: 'Hate matching drills? Turn them off. Want nothing but listening comprehension until your ear catches up? That\'s a setting, not a feature request.',
  },
  {
    title: 'Point it at sources you care about',
    body: 'Football commentary, cooking podcasts, regional news. Register a stream and the pipeline mines it for you.',
  },
  {
    title: 'Tune the review schedule',
    body: 'The spacing algorithm is code in the repo, not a black box tuned to maximise time-in-app.',
  },
];

export default function MakeItYours() {
  return (
    <section
      id="make-it-yours"
      aria-labelledby="make-it-yours-heading"
      className="shell scroll-mt-24 py-20 sm:py-28"
    >
      <SectionHeading
        id="make-it-yours-heading"
        eyebrow="Customisation, not settings"
        title="If you disagree with how it teaches, change how it teaches."
        lede="Closed apps give you a language picker and a daily-goal slider. Here, the thing that decides what you study next is a file in a repo you can fork."
      />

      <div className="mt-14 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <Reveal>
          <CourseFile />
        </Reveal>

        <Reveal delay={140} className="flex justify-center lg:px-2">
          <span className="flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-500 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-400">
            git push
            <ArrowRightIcon className="h-4 w-4 rotate-90 text-jade-600 dark:text-jade-400 lg:rotate-0" />
          </span>
        </Reveal>

        <Reveal delay={220}>
          <RenderedQuiz />
        </Reveal>
      </div>

      <ul className="mt-16 grid gap-5 sm:grid-cols-2">
        {KNOBS.map((knob, i) => (
          <Reveal as="li" key={knob.title} delay={i * 90} className="surface lift p-6">
            <h3 className="flex items-start gap-2.5 text-base font-semibold">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-jade-600 dark:text-jade-400" />
              {knob.title}
            </h3>
            <p className="mt-2.5 pl-[1.65rem] text-[0.95rem] leading-relaxed text-ink-600 dark:text-ink-400">
              {knob.body}
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={120} className="mt-10">
        <Button href={COURSES_URL} variant="secondary" external>
          Look at how a real course is stored
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-spring motion-safe:group-hover:translate-x-1" />
        </Button>
      </Reveal>
    </section>
  );
}

/** A real excerpt from courses/en/es — the format contributors actually write. */
function CourseFile() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-950">
      <p className="border-b border-ink-800/80 px-4 py-3 font-mono text-xs text-ink-500">
        courses/en/es/lessons/01-basics/quizzes/quiz-01.json
      </p>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.78rem] leading-[1.75] text-ink-300">
        <code>
          <Ln>{'{'}</Ln>
          <Ln indent={1}>
            <K>"title"</K>: <S>"Greetings Multiple Choice Quiz"</S>,
          </Ln>
          <Ln indent={1}>
            <K>"type"</K>: <S>"multiple-choice"</S>,
          </Ln>
          <Ln indent={1}>
            <K>"difficulty"</K>: <S>"beginner"</S>,
          </Ln>
          <Ln indent={1}>
            <K>"questions"</K>: [
          </Ln>
          <Ln indent={2}>{'{'}</Ln>
          <Ln indent={3}>
            <K>"question"</K>: <S>"Which greeting at 10 AM?"</S>,
          </Ln>
          <Ln indent={3}>
            <K>"options"</K>: [<S>"buenas noches"</S>, <S>"buenos días"</S>, …],
          </Ln>
          <Ln indent={3}>
            <K>"correctAnswer"</K>: <S>"buenos días"</S>,
          </Ln>
          <Ln indent={3}>
            <K>"explanation"</K>: <S>"Used until around 12 PM."</S>
          </Ln>
          <Ln indent={2}>{'}'}</Ln>
          <Ln indent={1}>]</Ln>
          <Ln>{'}'}</Ln>
        </code>
      </pre>
    </div>
  );
}

function RenderedQuiz() {
  return (
    <div className="surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400 dark:text-ink-500">
        Spanish · beginner
      </p>
      <p className="mt-3 font-sans text-lg font-medium text-ink-900 dark:text-ink-50">
        Which greeting would you use at 10 AM?
      </p>
      <ul className="mt-4 space-y-2">
        {[
          { label: 'buenas noches', state: 'idle' },
          { label: 'buenos días', state: 'right' },
          { label: 'buenas tardes', state: 'idle' },
        ].map((opt) => (
          <li
            key={opt.label}
            className={
              opt.state === 'right'
                ? 'flex items-center justify-between rounded-xl border border-jade-500 bg-jade-500/15 px-4 py-2.5 text-sm font-medium text-jade-800 dark:text-jade-200'
                : 'rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-500 dark:border-ink-800 dark:text-ink-400'
            }
          >
            {opt.label}
            {opt.state === 'right' ? <CheckIcon className="h-4 w-4" /> : null}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-ink-200/80 pt-3.5 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
        Used in the morning until around 12 PM.
      </p>
    </div>
  );
}

/* Tiny helpers so the JSON sample stays readable in source. */
const Ln = ({ children, indent = 0 }: { children: React.ReactNode; indent?: number }) => (
  <span className="block whitespace-pre">
    {'  '.repeat(indent)}
    {children}
  </span>
);
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-signal-300">{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span className="text-jade-300">{children}</span>
);
