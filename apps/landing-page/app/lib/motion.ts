import { useEffect, useRef, useState } from 'react';

/**
 * Tracks the user's motion preference and keeps tracking it if they change it
 * mid-session. Components use this to skip JS-driven animation entirely —
 * CSS-driven animation is handled by Tailwind's `motion-safe:` variant and the
 * global reduced-motion block in tailwind.css.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}

/**
 * False on the first render, true immediately after. Lets an element transition
 * in on mount while its final, visible state is what the class list settles on
 * — unlike a `fill: both` keyframe, which leaves content invisible if the
 * animation never gets to run (background tab, throttled compositor).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // A timer, not requestAnimationFrame: rAF is suspended in background tabs,
    // which would strand the element in its pre-transition state. The delay
    // only has to outlast the first paint.
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  return mounted;
}

type RevealOptions = {
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  /** Shrinks the viewport so elements reveal slightly before the true edge. */
  rootMargin?: string;
};

/**
 * Reveals an element once, the first time it scrolls into view. Returns a ref
 * to attach and a boolean to drive classes. Elements start visible when
 * IntersectionObserver is unavailable so content is never trapped hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    // Safety net. If the element is already on screen but the observer never
    // reports it — a tall element that can't reach `threshold`, a throttled
    // background tab — show it anyway. Content must never stay hidden.
    const fallback = setTimeout(() => {
      const box = node.getBoundingClientRect();
      const onScreen = box.top < window.innerHeight && box.bottom > 0;
      if (onScreen) {
        setShown(true);
        observer.disconnect();
      }
    }, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold, rootMargin]);

  return { ref, shown };
}

/**
 * Reports whether the page has been scrolled past `offset`. Used by the nav to
 * swap from transparent to a blurred, bordered bar.
 */
export function useScrolledPast(offset = 12): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setPast(window.scrollY > offset);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset]);

  return past;
}

/**
 * Runs `tick` on an interval, pausing while the tab is hidden so background
 * tabs don't burn cycles or desync the demo animations. Passing `null` as the
 * delay stops the timer.
 */
export function useTimer(tick: () => void, delay: number | null) {
  const saved = useRef(tick);
  saved.current = tick;

  useEffect(() => {
    if (delay === null) return;

    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      stop();
      id = setInterval(() => saved.current(), delay);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = undefined;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [delay]);
}

/** Joins class names, dropping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
