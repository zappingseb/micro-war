"use client";

import { useRef, useSyncExternalStore } from "react";

const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pointer-driven 3D tilt for foil cards. Disabled under prefers-reduced-motion.
 * Children render the card; the wrapper only owns the transform, exposed as
 * CSS variables so the shine can follow the pointer too.
 */
export function Tilt({ children, className = "", max = 9 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current || e.pointerType === "touch") return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--ry", `${(px * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty("--rx", `${(-py * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty("--sx", `${(px * 100 + 50).toFixed(1)}%`);
    ref.current.style.setProperty("--sy", `${(py * 100 + 50).toFixed(1)}%`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt group ${className}`}>
      {children}
    </div>
  );
}
