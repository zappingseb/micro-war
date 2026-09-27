"use client";

import { useEffect, useState } from "react";

type Props = {
  home: number[];
  away: number[];
  start: number;
  /** Divide curve values by this before display (curves are stored as integers). */
  scale?: number;
  colours: [string, string];
};

/**
 * Walks a stored kinetic curve forward on a timer so a live fixture visibly
 * progresses while someone is watching the demo (PLAN.md §13.1).
 */
export function LiveScore({ home, away, start, scale = 1, colours }: Props) {
  const format = (n: number) => (scale === 1 ? String(n) : (n / scale).toFixed(2));
  const [i, setI] = useState(start);
  const last = Math.max(home.length, away.length) - 1;

  useEffect(() => {
    if (i >= last) return;
    const id = setTimeout(() => setI((x) => Math.min(last, x + 1)), 1400);
    return () => clearTimeout(id);
  }, [i, last]);

  const h = home[Math.min(i, home.length - 1)] ?? 0;
  const a = away[Math.min(i, away.length - 1)] ?? 0;

  return (
    <>
      <span className="display text-3xl tabular-nums" style={{ color: h >= a ? colours[0] : undefined }}>
        {format(h)}
      </span>
      <span className="text-ink-low">–</span>
      <span className="display text-3xl tabular-nums" style={{ color: a > h ? colours[1] : undefined }}>
        {format(a)}
      </span>
    </>
  );
}
