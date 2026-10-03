"use client";

import { useEffect, useRef } from "react";

/**
 * Animates a number by writing straight to the DOM node each frame —
 * no React re-render per frame, so it can't cause layout work elsewhere.
 */
export function CountUp({
  value,
  format,
  duration = 500,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Start at the real value: numbers appear instantly when you open a page and
  // only animate when the value actually changes (e.g. after adding something).
  const from = useRef(value);
  const fmt = useRef(format);
  fmt.current = format;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Update React's own text node in place so React stays in sync.
    const write = (v: number) => {
      const s = fmt.current(v);
      if (el.firstChild) el.firstChild.nodeValue = s;
      else el.textContent = s;
    };
    const start = from.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === value) {
      write(value);
      from.current = value;
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (value - start) * eased;
      write(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={ref}>{format(from.current)}</span>;
}
