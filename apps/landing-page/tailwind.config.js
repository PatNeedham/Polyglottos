/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep neutral base. Cool-slate, never violet-tinted.
        ink: {
          50: '#F6F8FA',
          100: '#EBEFF3',
          200: '#D6DEE6',
          300: '#B4C1CE',
          400: '#8496A8',
          500: '#5F7183',
          600: '#485868',
          700: '#374553',
          800: '#232E3A',
          900: '#151E28',
          950: '#0A1119',
        },
        // Primary. A deeper, more grown-up green than the usual lime.
        jade: {
          50: '#EBFDF4',
          100: '#CFF9E3',
          200: '#A2F1CB',
          300: '#68E3AE',
          400: '#2ECD8D',
          500: '#0FB374',
          600: '#04905D',
          700: '#02734D',
          800: '#055B3F',
          900: '#054B36',
          950: '#012A1F',
        },
        // Accent for streaks, energy, "keep going" moments.
        ember: {
          300: '#FDC069',
          400: '#FBA53A',
          500: '#F2860F',
          600: '#D66808',
          700: '#B14C0B',
        },
        // Data/audio visualisation only. Reads as "signal", not as brand.
        signal: {
          300: '#7DD3E8',
          400: '#3EB8D6',
          500: '#1898B8',
          600: '#0F7997',
        },
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
      // None of these keyframes may gate an element's visibility: a paused or
      // never-started animation must still leave content on screen. Entrances
      // are class-swapped transitions instead (see Reveal in Primitives.tsx).
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        // Amplitude is driven per-bar by a CSS custom property so a row of
        // bars can share one animation without looking mechanically uniform.
        equalize: {
          '0%, 100%': { transform: 'scaleY(0.22)' },
          '50%': { transform: 'scaleY(var(--peak, 1))' },
        },
        'caret-blink': {
          '0%, 45%': { opacity: '1' },
          '55%, 100%': { opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '70%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
        // Scale only — no opacity, so a stalled pop still shows its content.
        'pop-in': {
          '0%': { transform: 'scale(0.72)' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'drift-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
        equalize: 'equalize 1.1s ease-in-out infinite',
        'caret-blink': 'caret-blink 1.05s step-end infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'dash-flow': 'dash-flow 1s linear infinite',
        'pop-in': 'pop-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'drift-slow': 'drift-slow 7s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
