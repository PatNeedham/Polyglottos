import { useEffect, useState } from 'react';
import { cx, usePrefersReducedMotion, useReveal } from '../lib/motion';

type Line =
  | { kind: 'command'; text: string }
  | { kind: 'output'; text: string }
  | { kind: 'ok'; text: string };

const SCRIPT: Line[] = [
  { kind: 'command', text: 'git clone https://github.com/PatNeedham/Polyglottos' },
  { kind: 'command', text: 'npm install && npx nx serve api' },
  { kind: 'ok', text: 'Polyglottos is live on http://localhost:8787' },
  { kind: 'output', text: 'storage    ./polyglottos_db  (this machine)' },
  { kind: 'output', text: 'telemetry  off' },
  { kind: 'output', text: 'outbound   none' },
];

const CHAR_MS = 22;
const LINE_PAUSE_MS = 380;

/**
 * Types out the install script once the block scrolls into view. Output lines
 * land whole; only commands are typed, which is what a real session looks like.
 * Reduced-motion visitors get the finished transcript immediately.
 */
export default function Terminal() {
  const reduced = usePrefersReducedMotion();
  const { ref, shown } = useReveal<HTMLDivElement>({ threshold: 0.35 });

  const [lineIndex, setLineIndex] = useState(0);
  const [chars, setChars] = useState(0);

  const finished = lineIndex >= SCRIPT.length;

  useEffect(() => {
    if (!shown || finished) return;

    if (reduced) {
      setLineIndex(SCRIPT.length);
      return;
    }

    const line = SCRIPT[lineIndex];

    if (line.kind !== 'command') {
      const id = setTimeout(() => setLineIndex((i) => i + 1), LINE_PAUSE_MS);
      return () => clearTimeout(id);
    }

    if (chars < line.text.length) {
      const id = setTimeout(() => setChars((c) => c + 1), CHAR_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setLineIndex((i) => i + 1);
      setChars(0);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(id);
  }, [shown, reduced, lineIndex, chars, finished]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 shadow-[0_24px_60px_-30px_rgba(10,17,25,0.8)]"
    >
      <div className="flex items-center gap-2 border-b border-ink-800/80 px-4 py-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
        </span>
        <p className="ml-1 font-mono text-xs text-ink-500">your-laptop — zsh</p>
      </div>

      {/* The whole transcript is exposed to assistive tech at once; the
          character-by-character reveal is presentation only. */}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8rem] leading-[1.85] text-ink-300 sm:text-[0.85rem]">
        <code>
          {SCRIPT.map((line, i) => {
            if (i > lineIndex) return null;
            const typing = i === lineIndex && line.kind === 'command';
            const text = typing ? line.text.slice(0, chars) : line.text;

            return (
              <span key={i} className="block whitespace-pre">
                {line.kind === 'command' ? (
                  <>
                    <span className="select-none text-jade-400">$ </span>
                    <span className="text-ink-100">{text}</span>
                  </>
                ) : line.kind === 'ok' ? (
                  <span className="text-jade-400">
                    <span className="select-none">✓ </span>
                    {text}
                  </span>
                ) : (
                  <span className="text-ink-500">{'  ' + text}</span>
                )}
                {(typing || (finished && i === SCRIPT.length - 1)) && (
                  <span
                    aria-hidden="true"
                    className={cx(
                      'ml-0.5 inline-block h-[1.05em] w-[0.55ch] translate-y-[0.15em] bg-jade-400',
                      finished && 'motion-safe:animate-caret-blink'
                    )}
                  />
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
