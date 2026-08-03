import { ArrowRightIcon, GithubIcon, ShieldIcon, TerminalIcon } from './Icons';
import LessonDemo from './LessonDemo';
import { Button, Reveal } from './Primitives';

const PROOF = [
  { icon: ShieldIcon, text: 'No trackers, no ad SDKs, no data brokers' },
  { icon: TerminalIcon, text: 'One command to run your own instance' },
  { icon: GithubIcon, text: 'MIT licensed — fork it, sell it, whatever' },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <Backdrop />

      <div className="shell relative grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-14">
        <div>
          <Reveal trigger="mount">
            <p className="eyebrow">
              <span aria-hidden="true" className="h-px w-6 bg-jade-500/70" />
              Open source · Self-hostable · Yours
            </p>
          </Reveal>

          <Reveal trigger="mount" delay={80}>
            <h1 className="mt-5 font-sans text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-ink-900 dark:text-ink-50 sm:text-6xl">
              Learn languages on
              <br className="hidden sm:block" /> your terms —{' '}
              <span className="text-gradient-jade">and your own server.</span>
            </h1>
          </Reveal>

          <Reveal trigger="mount" delay={160}>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-600 dark:text-ink-400">
              Polyglottos builds lessons from language people are actually speaking today —
              live radio, podcasts, the news — instead of sentences written for a textbook
              in 2014. Every course is a file you can edit. Every line of it is source you
              can read. And if you'd rather your practice history never left your house,
              host the whole thing there.
            </p>
          </Reveal>

          <Reveal trigger="mount" delay={240} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#start" size="lg">
              Start learning — free
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-spring motion-safe:group-hover:translate-x-1" />
            </Button>
            <Button href="#self-host" variant="secondary" size="lg">
              <TerminalIcon className="h-4 w-4" />
              Run your own instance
            </Button>
          </Reveal>

          <Reveal
            as="ul"
            trigger="mount"
            delay={320}
            className="mt-9 grid gap-3 sm:grid-cols-3"
          >
            {PROOF.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-2.5 text-sm text-ink-500 dark:text-ink-400"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-jade-600 dark:text-jade-400" />
                {text}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal trigger="mount" delay={200} className="lg:motion-safe:animate-drift-slow">
          <LessonDemo />
          <p className="mt-3 text-center text-xs text-ink-400 dark:text-ink-500">
            A real exercise, generated from a real broadcast. Go ahead — pick one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Decorative background: faint grid plus two soft colour washes. */
function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="grid-backdrop absolute inset-0 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000,transparent)]" />
      <div className="absolute -top-40 left-1/2 h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-jade-300/25 blur-[120px] dark:bg-jade-700/20" />
      <div className="absolute right-[-10%] top-24 h-80 w-80 rounded-full bg-signal-300/20 blur-[100px] dark:bg-signal-600/10" />
    </div>
  );
}
