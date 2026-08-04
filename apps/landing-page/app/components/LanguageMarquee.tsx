const LANGUAGES = [
  { flag: '🇪🇸', name: 'Spanish', sources: '14 live sources' },
  { flag: '🇫🇷', name: 'French', sources: '9 live sources' },
  { flag: '🇩🇪', name: 'German', sources: '7 live sources' },
  { flag: '🇧🇷', name: 'Portuguese', sources: '6 live sources' },
  { flag: '🇮🇹', name: 'Italian', sources: '5 live sources' },
  { flag: '🇯🇵', name: 'Japanese', sources: '5 live sources' },
  { flag: '🇰🇷', name: 'Korean', sources: '4 live sources' },
  { flag: '🇳🇱', name: 'Dutch', sources: '3 live sources' },
  { flag: '🇵🇱', name: 'Polish', sources: '3 live sources' },
  { flag: '🇸🇪', name: 'Swedish', sources: '2 live sources' },
  { flag: '🇹🇷', name: 'Turkish', sources: '2 live sources' },
  { flag: '🇻🇳', name: 'Vietnamese', sources: '2 live sources' },
];

/**
 * Infinite ticker of available courses. The list is rendered twice and the
 * track translates by exactly -50%, so the seam is invisible. Hovering pauses
 * it, which also lets keyboard users stop it by tabbing to the region.
 */
export default function LanguageMarquee() {
  return (
    <section aria-labelledby="languages-heading" className="border-y border-ink-200/70 bg-white/60 py-6 dark:border-ink-800/70 dark:bg-ink-900/30">
      <h2 id="languages-heading" className="sr-only">
        Languages with community-maintained courses
      </h2>

      <div className="mask-edges group overflow-hidden">
        <ul className="flex w-max gap-3 motion-safe:animate-marquee motion-safe:group-hover:[animation-play-state:paused] motion-safe:group-focus-within:[animation-play-state:paused]">
          {[0, 1].map((copy) =>
            LANGUAGES.map((lang) => (
              <li
                key={`${copy}-${lang.name}`}
                // The duplicate set is decorative; hide it from screen readers.
                aria-hidden={copy === 1 ? 'true' : undefined}
                className="flex shrink-0 items-center gap-2.5 rounded-full border border-ink-200/80 bg-white px-4 py-2 dark:border-ink-800 dark:bg-ink-900"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {lang.flag}
                </span>
                <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                  {lang.name}
                </span>
                <span className="text-xs text-ink-400 dark:text-ink-500">{lang.sources}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
