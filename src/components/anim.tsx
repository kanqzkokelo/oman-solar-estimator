"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + slide up when the element scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Counts from 0 to `value` (eased) when scrolled into view. */
export function CountUp({
  value,
  decimals = 0,
  duration = 1.3,
  formatter,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  formatter?: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const doneForRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    // Reduced motion: skip the count — snap straight to the final value.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      doneForRef.current = value;
      return;
    }
    // Already finished counting to this exact value (e.g. parent re-render):
    // jump straight to the result instead of replaying from zero.
    if (doneForRef.current === value) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const factor = 10 ** decimals;
    const snap = (v: number) => Math.round(v * factor) / factor;
    const loop = (now: number) => {
      const k = Math.min(1, (now - t0) / (duration * 1000));
      const eased = 1 - Math.pow(1 - k, 3);
      const done = k >= 1;
      setDisplay(done ? value : snap(value * eased));
      if (done) doneForRef.current = value;
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, decimals]);

  const fmt =
    formatter ??
    ((v: number) => v.toLocaleString(undefined, { maximumFractionDigits: decimals }));

  return (
    <span ref={ref} className={className}>
      {fmt(display)}
    </span>
  );
}
