import { useCallback, useEffect, useRef, useState } from 'react';
import { cx, useMounted, usePrefersReducedMotion } from '../lib/motion';
import { CheckIcon, CrossIcon, FlameIcon, WaveIcon } from './Icons';

/**
 * A playable miniature of the product: a clip captured from a live source is
 * transcribed, then turned into a cloze exercise. It self-plays so the hero is
 * never static, but the moment a visitor clicks an answer it hands over
 * control and stops auto-solving.
 */

type Clip = {
  language: string;
  flag: string;
  source: string;
  captured: string;
  /** Sentence split into words. The blank is a hole in this list. */
  words: string[];
  blankAt: number;
  options: string[];
  answer: string;
  translation: string;
  note: string;
  /** Shown before the answer is revealed — a hint at the level, not the word. */
  focus: string;
};

const CLIPS: Clip[] = [
  {
    language: 'Spanish',
    flag: '🇦🇷',
    source: 'Radio Nacional · Buenos Aires',
    captured: 'live capture · 2h ago',
    words: ['No', 'sabía', 'que', '—', 'llegado', 'tan', 'temprano.'],
    blankAt: 3,
    options: ['habrías', 'habías', 'hubieras'],
    answer: 'habías',
    translation: '“I didn’t know you had arrived so early.”',
    note: 'Pluperfect: había + participle marks an action finished before another past event.',
    focus: 'pluperfect · B1',
  },
  {
    language: 'French',
    flag: '🇫🇷',
    source: 'France Inter · Le Journal',
    captured: 'podcast · 6h ago',
    words: ['Il', 'faut', 'que', 'tu', '—', 'patient.'],
    blankAt: 4,
    options: ['es', 'sois', 'seras'],
    answer: 'sois',
    translation: '“You’re going to have to be patient.”',
    note: 'Il faut que always takes the subjunctive — être becomes sois.',
    focus: 'present subjunctive · B1',
  },
  {
    language: 'Portuguese',
    flag: '🇧🇷',
    source: 'Rádio Cultura · São Paulo',
    captured: 'live capture · 40m ago',
    words: ['Se', 'eu', '—', 'tempo,', 'eu', 'ia', 'com', 'você.'],
    blankAt: 2,
    options: ['tenho', 'terei', 'tivesse'],
    answer: 'tivesse',
    translation: '“If I had the time, I’d go with you.”',
    note: 'Hypothetical se clauses take the imperfect subjunctive, not the present.',
    focus: 'imperfect subjunctive · B2',
  },
];

type Phase = 'listening' | 'transcribing' | 'quiz' | 'result';

/** Fixed peaks keep the waveform lively without looking randomly generated. */
const PEAKS = Array.from({ length: 34 }, (_, i) =>
  Number((0.3 + 0.7 * Math.abs(Math.sin(i * 1.31) * Math.cos(i * 0.42))).toFixed(2))
);

export default function LessonDemo() {
  const reduced = usePrefersReducedMotion();

  const [clipIndex, setClipIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('listening');
  const [revealed, setRevealed] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [streak, setStreak] = useState(11);
  /** Once true, the demo stops solving itself and waits for the visitor. */
  const [engaged, setEngaged] = useState(false);

  const clip = CLIPS[clipIndex];
  const isCorrect = choice === clip.answer;

  const answer = useCallback(
    (option: string) => {
      setChoice(option);
      setPhase('result');
      if (option === clip.answer) setStreak((s) => s + 1);
    },
    [clip.answer]
  );

  // Drives the demo forward. Every branch returns its own cleanup so a phase
  // change (or an early click) can never leave a stray timer running.
  useEffect(() => {
    if (phase === 'listening') {
      const id = setTimeout(() => {
        setRevealed(0);
        setPhase('transcribing');
      }, 1500);
      return () => clearTimeout(id);
    }

    if (phase === 'transcribing') {
      if (reduced) {
        setRevealed(clip.words.length);
        const id = setTimeout(() => setPhase('quiz'), 900);
        return () => clearTimeout(id);
      }
      const id = setInterval(() => {
        setRevealed((n) => {
          if (n >= clip.words.length) {
            clearInterval(id);
            setPhase('quiz');
            return n;
          }
          return n + 1;
        });
      }, 105);
      return () => clearInterval(id);
    }

    if (phase === 'quiz') {
      if (engaged) return;
      const id = setTimeout(() => answer(clip.answer), 5200);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setClipIndex((i) => (i + 1) % CLIPS.length);
      setChoice(null);
      setRevealed(0);
      setPhase('listening');
    }, 3800);
    return () => clearTimeout(id);
  }, [phase, clip, reduced, engaged, answer]);

  const onPick = (option: string) => {
    setEngaged(true);
    answer(option);
  };

  return (
    <div className="surface relative overflow-hidden p-5 sm:p-6">
      {/* Soft wash behind the card contents; purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-jade-300/25 blur-3xl dark:bg-jade-500/10"
      />

      <div className="relative">
        <SourceRow clip={clip} live={phase === 'listening'} streak={streak} />

        <Waveform active={phase === 'listening' || phase === 'transcribing'} />

        <p
          className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-ink-400 dark:text-ink-500"
          aria-live="polite"
        >
          {phase === 'listening'
            ? 'Capturing audio'
            : phase === 'transcribing'
              ? 'Transcribing'
              : `${clip.language} · fill in the blank`}
        </p>

        <Sentence
          clip={clip}
          revealed={revealed}
          filled={phase === 'result' && isCorrect ? clip.answer : null}
        />

        {/* One reserved slot for both states so the card never resizes. */}
        <div className="mt-5 min-h-[3.6rem]">
          {phase === 'quiz' || phase === 'result' ? (
            <Options
              clip={clip}
              choice={choice}
              locked={phase === 'result'}
              onPick={onPick}
            />
          ) : (
            <Pipeline phase={phase} />
          )}
        </div>

        <Feedback show={phase === 'result'} correct={isCorrect} clip={clip} />
      </div>
    </div>
  );
}

function SourceRow({ clip, live, streak }: { clip: Clip; live: boolean; streak: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5 shrink-0">
          {live ? (
            <span className="absolute inset-0 rounded-full bg-jade-500 motion-safe:animate-pulse-ring" />
          ) : null}
          <span className="relative h-2.5 w-2.5 rounded-full bg-jade-500" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">
            <span aria-hidden="true" className="mr-1.5">
              {clip.flag}
            </span>
            {clip.source}
          </p>
          <p className="truncate text-xs text-ink-400 dark:text-ink-500">{clip.captured}</p>
        </div>
      </div>

      <p className="flex shrink-0 items-center gap-1.5 rounded-full bg-ember-400/15 px-2.5 py-1 text-sm font-semibold text-ember-700 dark:text-ember-300">
        <FlameIcon className="h-4 w-4" />
        {/* Re-keying replays the pop each time the streak ticks up. */}
        <span key={streak} className="tabular-nums motion-safe:animate-pop-in">
          {streak}
        </span>
        <span className="sr-only">day streak</span>
      </p>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex h-14 items-center gap-[3px] rounded-xl bg-ink-100/70 px-3 dark:bg-ink-950/60"
    >
      {PEAKS.map((peak, i) => (
        <span
          key={i}
          style={
            {
              '--peak': peak,
              animationDelay: `${(i % 9) * 90}ms`,
              transform: active ? undefined : `scaleY(${0.16 + peak * 0.12})`,
            } as React.CSSProperties
          }
          className={cx(
            'h-8 flex-1 origin-center rounded-full transition-[transform,background-color] duration-500 ease-smooth',
            active
              ? 'bg-signal-400 motion-safe:animate-equalize dark:bg-signal-300'
              : 'bg-ink-300 dark:bg-ink-700'
          )}
        />
      ))}
    </div>
  );
}

function Sentence({
  clip,
  revealed,
  filled,
}: {
  clip: Clip;
  revealed: number;
  filled: string | null;
}) {
  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1.5 font-sans text-xl font-medium leading-relaxed text-ink-900 dark:text-ink-50 sm:text-2xl">
      {clip.words.map((word, i) => {
        const visible = i < revealed;

        if (i === clip.blankAt) {
          return (
            <span
              key={i}
              className={cx(
                'inline-flex min-w-[5.5rem] items-center justify-center rounded-lg border-b-2 px-2 py-0.5 text-center transition-all duration-300 ease-spring',
                filled
                  ? 'border-jade-500 bg-jade-500/15 text-jade-700 dark:text-jade-300'
                  : 'border-dashed border-ink-300 text-transparent dark:border-ink-600',
                visible ? 'opacity-100' : 'opacity-0'
              )}
            >
              {filled ?? ' '}
            </span>
          );
        }

        return (
          <span
            key={i}
            className={cx(
              'transition-all duration-300 ease-smooth',
              visible
                ? 'opacity-100 motion-safe:translate-y-0 motion-safe:blur-0'
                : 'opacity-0 motion-safe:translate-y-1 motion-safe:blur-[3px]'
            )}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

function Options({
  clip,
  choice,
  locked,
  onPick,
}: {
  clip: Clip;
  choice: string | null;
  locked: boolean;
  onPick: (option: string) => void;
}) {
  // Staggered entrance via a class swap, not a keyframe — see Reveal's note.
  const mounted = useMounted();

  return (
    <div
      role="group"
      aria-label={`Choose the word that completes the ${clip.language} sentence`}
      className="grid gap-2 sm:grid-cols-3"
    >
      {clip.options.map((option, i) => {
        const picked = choice === option;
        const right = option === clip.answer;
        const showRight = locked && right;
        const showWrong = locked && picked && !right;

        return (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => onPick(option)}
            style={{ transitionDelay: mounted ? `${i * 70}ms` : undefined }}
            className={cx(
              'flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left font-medium transition duration-300 ease-smooth',
              mounted
                ? 'opacity-100 motion-safe:translate-y-0'
                : 'opacity-0 motion-safe:translate-y-2',
              !locked &&
                'border-ink-200 bg-white text-ink-800 hover:-translate-y-0.5 hover:border-jade-400 hover:bg-jade-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-jade-500 dark:hover:bg-jade-950/40',
              showRight &&
                'border-jade-500 bg-jade-500/15 text-jade-800 dark:text-jade-200',
              showWrong && 'border-ember-500 bg-ember-500/15 text-ember-700 dark:text-ember-300',
              locked && !showRight && !showWrong && 'border-ink-200 text-ink-400 dark:border-ink-800 dark:text-ink-600'
            )}
          >
            {option}
            {showRight ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
            {showWrong ? <CrossIcon className="h-4 w-4 shrink-0" /> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Short labels so all four fit one row — the same height as the answer grid. */
const STAGES = ['Capture', 'Transcribe', 'Mine', 'Drill'];

/**
 * Fills the answer slot while the clip is still being processed, so the card
 * shows the pipeline instead of empty space — and never changes height.
 */
function Pipeline({ phase }: { phase: Phase }) {
  const active = phase === 'listening' ? 0 : 1;

  return (
    <ol className="grid grid-cols-4 gap-2" aria-hidden="true">
      {STAGES.map((stage, i) => {
        const done = i < active;
        const running = i === active;

        return (
          <li
            key={stage}
            className={cx(
              'flex items-center gap-1.5 rounded-xl border px-2.5 py-3 text-xs font-medium transition-colors duration-300',
              done && 'border-jade-500/40 bg-jade-500/10 text-jade-700 dark:text-jade-300',
              running && 'border-signal-500/45 bg-signal-500/10 text-signal-600 dark:text-signal-300',
              !done && !running && 'border-ink-200 text-ink-400 dark:border-ink-800 dark:text-ink-600'
            )}
          >
            {done ? (
              <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                {running ? (
                  <span className="absolute h-2 w-2 rounded-full bg-signal-400 motion-safe:animate-pulse-ring" />
                ) : null}
                <span
                  className={cx(
                    'h-1.5 w-1.5 rounded-full',
                    running ? 'bg-signal-400' : 'bg-ink-300 dark:bg-ink-700'
                  )}
                />
              </span>
            )}
            {stage}
          </li>
        );
      })}
    </ol>
  );
}

function Feedback({
  show,
  correct,
  clip,
}: {
  show: boolean;
  correct: boolean;
  clip: Clip;
}) {
  // Kept mounted so the height doesn't jump when the message appears.
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      aria-live="polite"
      className={cx(
        'mt-4 rounded-xl border border-ink-200/80 bg-ink-50 p-3.5 transition-all duration-300 ease-smooth dark:border-ink-800 dark:bg-ink-950/50',
        'min-h-[5.5rem]'
      )}
    >
      {show ? (
        <>
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
            {correct ? 'Nice — that’s the one.' : `Not quite — it’s “${clip.answer}”.`}{' '}
            <span className="font-normal text-ink-500 dark:text-ink-400">
              {clip.translation}
            </span>
          </p>
          <p className="mt-1.5 flex items-start gap-2 text-sm text-ink-500 dark:text-ink-400">
            <WaveIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-500" />
            {clip.note}
          </p>
        </>
      ) : (
        <p className="flex items-start gap-2 text-sm text-ink-500 dark:text-ink-400">
          <WaveIcon className="mt-0.5 h-4 w-4 shrink-0 text-signal-500" />
          Grammar focus for this clip: <strong className="font-semibold">{clip.focus}</strong>
        </p>
      )}
    </div>
  );
}
