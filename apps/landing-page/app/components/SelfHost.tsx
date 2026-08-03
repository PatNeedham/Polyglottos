import { useReveal } from '../lib/motion';
import { CheckIcon } from './Icons';
import { Button, Reveal, SectionHeading } from './Primitives';
import Terminal from './Terminal';
import { REPO_URL } from '../lib/site';

const GUARANTEES = [
  'Your practice history, mistakes, and audio stay in a database on a machine you control.',
  'No analytics SDK, no session replay, no third-party scripts on the pages you use.',
  'Bring your own transcription keys — or run a local model and send nothing outward at all.',
  'MIT licensed, so an audit is a git clone, not a support ticket.',
];

export default function SelfHost() {
  return (
    <section
      id="self-host"
      aria-labelledby="self-host-heading"
      className="relative scroll-mt-24 overflow-hidden bg-white py-20 dark:bg-ink-900/40 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[52rem] -translate-x-1/2 rounded-full bg-jade-300/20 blur-[110px] dark:bg-jade-700/10"
      />

      <div className="shell relative">
        <SectionHeading
          id="self-host-heading"
          eyebrow="Privacy that isn't a promise"
          title="The strongest privacy policy is a server you own."
          lede="Every language app tells you your data is safe. The only version of that claim you can verify is the one where the data never leaves your building. Polyglottos is built to be run that way from day one — not as an enterprise tier."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Terminal />
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
              Runs on a laptop, a VPS, or a Raspberry Pi in a closet. Docker and Cloudflare
              Workers deployments are both supported.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={`${REPO_URL}#getting-started`} external>
                Read the setup guide
              </Button>
              <Button href={REPO_URL} variant="secondary" external>
                Browse the source
              </Button>
            </div>
          </div>

          <div>
            <BoundaryDiagram />
            <ul className="mt-8 space-y-3.5">
              {GUARANTEES.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 80} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jade-500/15 text-jade-600 dark:text-jade-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-ink-600 dark:text-ink-400">
                    {item}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Shows the trust boundary literally: traffic loops between three services
 * inside your network, and the one path that leads outward is severed.
 */
function BoundaryDiagram() {
  const { ref, shown } = useReveal<HTMLDivElement>({ threshold: 0.4 });

  return (
    <div ref={ref} className="surface p-5">
      <svg
        viewBox="0 0 420 200"
        className="w-full"
        role="img"
        aria-label="Diagram: the web app, API, and your database all sit inside your own network. The path out to analytics, advertising, and model-training services is cut."
      >
        {/* Your network */}
        <rect
          x="6"
          y="18"
          width="272"
          height="168"
          rx="14"
          className="fill-jade-500/[0.06] stroke-jade-500/45"
          strokeWidth="1.5"
          strokeDasharray="6 5"
        />
        <text x="20" y="40" className="fill-jade-700 dark:fill-jade-300" fontSize="11" fontWeight="600">
          YOUR NETWORK
        </text>

        <Node x={26} y={58} label="Web app" />
        <Node x={26} y={122} label="Polyglottos API" />
        <Node x={164} y={122} label="Your database" tone="data" />

        {/* Internal traffic — flowing dashes, always inside the box. */}
        <g
          className="stroke-jade-500 motion-safe:animate-dash-flow"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          fill="none"
          style={{ opacity: shown ? 1 : 0, transition: 'opacity 0.6s ease' }}
        >
          <path d="M76 92 V 122" />
          <path d="M132 140 H 164" />
        </g>

        {/* The outbound path, cut. */}
        <path
          d="M132 88 H 300"
          className="stroke-ink-300 dark:stroke-ink-700"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          fill="none"
        />
        <g
          style={{
            opacity: shown ? 1 : 0,
            transform: shown ? 'none' : 'scale(0.6)',
            transformOrigin: '216px 88px',
            transition: 'opacity 0.5s ease 0.5s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s',
          }}
        >
          <circle cx="216" cy="88" r="13" className="fill-ink-50 dark:fill-ink-900" />
          <path
            d="M210 82 l12 12 M222 82 l-12 12"
            className="stroke-ember-500"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        <rect
          x="300"
          y="58"
          width="114"
          height="62"
          rx="10"
          className="fill-ink-100/60 stroke-ink-200 dark:fill-ink-950/60 dark:stroke-ink-800"
          strokeWidth="1.5"
        />
        <text x="357" y="82" textAnchor="middle" className="fill-ink-400 dark:fill-ink-500" fontSize="10.5">
          Analytics · Ads
        </text>
        <text x="357" y="98" textAnchor="middle" className="fill-ink-400 dark:fill-ink-500" fontSize="10.5">
          Model training
        </text>
        <text x="357" y="114" textAnchor="middle" className="fill-ink-400 dark:fill-ink-500" fontSize="10.5">
          Data brokers
        </text>
      </svg>
    </div>
  );
}

function Node({
  x,
  y,
  label,
  tone = 'app',
}: {
  x: number;
  y: number;
  label: string;
  tone?: 'app' | 'data';
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="106"
        height="34"
        rx="9"
        className={
          tone === 'data'
            ? 'fill-signal-400/15 stroke-signal-500/60'
            : 'fill-white stroke-ink-200 dark:fill-ink-900 dark:stroke-ink-700'
        }
        strokeWidth="1.5"
      />
      <text
        x={x + 53}
        y={y + 21}
        textAnchor="middle"
        className="fill-ink-800 dark:fill-ink-100"
        fontSize="11"
        fontWeight="500"
      >
        {label}
      </text>
    </g>
  );
}
