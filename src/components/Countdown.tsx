"use client";

import { useSyncExternalStore } from "react";

const WEEK = 7 * 24 * 3600 * 1000;

/** Rolls a target forward week by week so a stale build never shows a negative countdown. */
function rolling(targetIso: string, now: number) {
  let t = new Date(targetIso).getTime();
  while (t < now) t += WEEK;
  return t;
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const subscribeTick = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ target, compact = false }: { target: string; compact?: boolean }) {
  // Ticks once a second; the server snapshot is 0 so the first paint shows
  // placeholders and hydration never disagrees with the build.
  const now = useSyncExternalStore(subscribeTick, () => Math.floor(Date.now() / 1000) * 1000, () => 0);

  const p = now === 0 ? null : parts(rolling(target, now) - now);

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-ink-high">
        {p ? `${p.d}d ${pad(p.h)}:${pad(p.m)}:${pad(p.s)}` : "—d —:—:—"}
      </span>
    );
  }

  const cells: [string, string][] = p
    ? [
        [String(p.d), "days"],
        [pad(p.h), "hrs"],
        [pad(p.m), "min"],
        [pad(p.s), "sec"],
      ]
    : [
        ["–", "days"],
        ["––", "hrs"],
        ["––", "min"],
        ["––", "sec"],
      ];

  return (
    <div className="flex gap-3 sm:gap-4" role="timer" aria-live="off">
      {cells.map(([v, l]) => (
        <div key={l} className="min-w-[3.6rem] rounded-md border border-hair bg-panel/70 px-2 py-2 text-center backdrop-blur sm:min-w-[4.5rem]">
          <div className="display text-2xl tabular-nums text-ink-high sm:text-3xl">{v}</div>
          <div className="eyebrow mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}
