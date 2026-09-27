"use client";

import { useRef, useState } from "react";

/**
 * Shared hover plumbing for the SVG charts: a wrapper ref for pointer
 * coordinates and one tooltip box positioned above the pointer.
 */
export function useChartHover<T>() {
  const wrap = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ item: T; x: number; y: number } | null>(null);
  const move = (item: T) => (e: React.PointerEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    setHover({ item, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const leave = () => setHover(null);
  return { wrap, hover, move, leave };
}

export function TipBox({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[10rem] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-md border border-hair bg-void/95 px-3 py-2 font-mono text-[11px] shadow-xl backdrop-blur"
      style={{ left: x, top: y }}
      role="status"
    >
      {children}
    </div>
  );
}

export function TipRow({ label, value, colour }: { label: string; value: string; colour?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="flex items-center gap-1.5 text-ink-low">
        {colour && <span className="inline-block h-[2px] w-3" style={{ background: colour }} aria-hidden />}
        {label}
      </span>
      <span className="tabular-nums text-ink-high">{value}</span>
    </div>
  );
}

/* Chart tokens: validated on the dark panel surface (#0e1220). */
export const CH = {
  surface: "#0e1220",
  grid: "#232a42",
  axis: "#5f6884",
  ink: "#f2f5ff",
  inkMid: "#a8b0c8",
  inkLow: "#5f6884",
  series: "#1fa89c",
  series2: "#b8800f",
  above: "#6fa81c",
  below: "#e0405c",
  ns: "#5f6884",
} as const;

export function niceStep(range: number, target = 6) {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return step * mag;
}
