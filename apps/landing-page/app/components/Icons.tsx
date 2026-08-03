import type { SVGProps } from 'react';

/**
 * Inline icon set — no icon dependency, so the landing page ships nothing it
 * doesn't render. All icons inherit `currentColor` and are decorative by
 * default; callers that need a label pass `aria-label` and `role="img"`.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const GithubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M12 1.5A10.5 10.5 0 0 0 1.5 12c0 4.64 3.01 8.57 7.18 9.96.53.1.72-.23.72-.5v-1.9c-2.92.64-3.54-1.25-3.54-1.25-.48-1.22-1.17-1.54-1.17-1.54-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.6 2.47 1.14 3.07.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.09-2.83-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.9 1.08a10 10 0 0 1 5.28 0c2.01-1.36 2.9-1.08 2.9-1.08.57 1.45.21 2.52.1 2.79.68.74 1.09 1.68 1.09 2.83 0 4.04-2.46 4.93-4.8 5.19.38.33.71.97.71 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z" />
  </svg>
);

export const ShieldIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3 4.5 6v5.4c0 4.4 3.1 8.5 7.5 9.6 4.4-1.1 7.5-5.2 7.5-9.6V6L12 3Z" />
    <path d="m9.2 12.1 2 2 3.6-3.9" />
  </Icon>
);

export const ServerIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="6.5" rx="2" />
    <rect x="3" y="13.5" width="18" height="6.5" rx="2" />
    <path d="M7 7.25h.01M7 16.75h.01" />
  </Icon>
);

export const SlidersIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 20v-6M5 10V4M12 20v-9M12 7V4M19 20v-4M19 12V4" />
    <path d="M3 14h4M10 7h4M17 16h4" />
  </Icon>
);

export const WaveIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 12h1.5M7 8.5v7M10.5 5v14M14 9.5v5M17.5 7v10M21 12h-.5" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon strokeWidth={2.2} {...props}>
    <path d="m5 12.5 4.6 4.5L19 7" />
  </Icon>
);

export const CrossIcon = (props: IconProps) => (
  <Icon strokeWidth={2} {...props}>
    <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
  </Icon>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

export const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.5a3.2 3.2 0 0 1 0 6M17.5 14.6A6 6 0 0 1 21 20" />
  </Icon>
);

export const CodeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.5 5l-3 14" />
  </Icon>
);

export const TerminalIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
    <path d="m7 10 2.5 2.5L7 15M12.5 15.5h4.5" />
  </Icon>
);

export const GlobeIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.2 9.8h17.6M3.2 14.2h17.6" />
    <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9s1.2-6.5 3.6-9Z" />
  </Icon>
);

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon strokeWidth={1.9} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const FlameIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3s4.8 3.4 4.8 8.2a4.8 4.8 0 0 1-9.6 0c0-1.4.5-2.5 1.2-3.4.3 1 .9 1.7 1.8 2 .3-2.6-.1-4.7 1.8-6.8Z" />
    <path d="M12 21a4.4 4.4 0 0 0 4.4-4.4c0-1.1-.4-2-1-2.8" />
  </Icon>
);

export const BookIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11a2 2 0 0 1 2 2v14a1.6 1.6 0 0 0-1.6-1.6H4V4.5Z" />
    <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H13v16a1.6 1.6 0 0 1 1.6-1.6H20V4.5Z" />
  </Icon>
);

export const ChartIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8.5 20v-6M13 20V8.5M17.5 20v-9" />
  </Icon>
);

export const PlugIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 3v5M15 3v5" />
    <path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8Z" />
    <path d="M12 17v4" />
  </Icon>
);
