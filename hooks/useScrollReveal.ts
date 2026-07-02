'use client';
import { useEffect, useRef } from 'react';

/**
 * Observes an element and adds the `in-view` class when it enters the viewport.
 * Works with .reveal, .reveal-left, .reveal-right, .reveal-scale CSS classes.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.12,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in-view');
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          obs.unobserve(el);
        }
      },
      { threshold },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Reveals multiple child elements in sequence as the parent enters the viewport.
 * Children need .reveal (or variant) + .stagger-N classes.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    if (typeof IntersectionObserver === 'undefined') {
      parent.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        .forEach((el) => el.classList.add('in-view'));
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          parent.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right, .reveal-scale')
            .forEach((el) => el.classList.add('in-view'));
          obs.unobserve(parent);
        }
      },
      { threshold },
    );

    obs.observe(parent);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Animated number counter — counts from 0 to target on reveal.
 */
export function useCountUp(
  target: number,
  duration = 1200,
  delay = 0,
): { ref: React.RefObject<HTMLSpanElement | null>; } {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === 0) {
      if (el) el.textContent = String(target);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      el.textContent = String(target);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);

        const startTime = performance.now() + delay;
        const tick = (now: number) => {
          if (now < startTime) { requestAnimationFrame(tick); return; }
          const elapsed = Math.min(now - startTime, duration);
          const progress = elapsed / duration;
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          if (el) el.textContent = current.toLocaleString();
          if (elapsed < duration) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, delay]);

  return { ref };
}
