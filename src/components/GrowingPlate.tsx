"use client";

import { useEffect, useState } from "react";
import type { PlateArt as PlateArtSpec } from "@/lib/types";
import { colonyPoints } from "./PlateArt";

/** Logistic growth 0→1 over a run; `mid` and `k` in hours. */
export const growth = (t: number, mid = 16, k = 5) => Math.round(1e4 / (1 + Math.exp(-(t - mid) / k))) / 1e4;

/**
 * A plate whose colonies are at a given growth fraction. Unlike PlateArt this
 * is driven by a value, not a CSS animation, so a scrubber or a clock can
 * move it. Detection rings appear once a colony is big enough to count.
 */
export function GrowingPlate({ art, g, rings = true, className = "" }: { art: PlateArtSpec; g: number; rings?: boolean; className?: string }) {
  const pts = colonyPoints(art);
  const uid = `g${art.seed}`;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Plate timelapse">
      <defs>
        <radialGradient id={`${uid}-agar`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={art.agar} />
          <stop offset="100%" stopColor="#04060a" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={100} cy={100} r={96} fill="#0b0e17" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
      <circle cx={100} cy={100} r={90} fill={`url(#${uid}-agar)`} />
      <g filter={`url(#${uid}-glow)`}>
        {pts.map((p, i) => {
          const r = Math.round(p.r * g * (0.8 + ((i * 13) % 7) / 20) * 100) / 100;
          return r < 0.3 ? null : <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.accent ? art.accent : art.colony} opacity={0.9} />;
        })}
      </g>
      {rings &&
        pts.map((p, i) => {
          const r = Math.round(p.r * g * (0.8 + ((i * 13) % 7) / 20) * 100) / 100;
          return r < 1.6 ? null : <circle key={`r${i}`} cx={p.x} cy={p.y} r={r + 2.5} fill="none" stroke="#ffb020" strokeWidth={0.7} opacity={0.8} />;
        })}
      <ellipse cx={72} cy={58} rx={38} ry={20} fill="white" opacity={0.05} transform="rotate(-30 72 58)" />
    </svg>
  );
}

/** Colonies large enough to be counted at growth `g`. */
export function countAt(art: PlateArtSpec, g: number) {
  return colonyPoints(art).filter((p, i) => p.r * g * (0.8 + ((i * 13) % 7) / 20) >= 1.6).length;
}

/** A plate that runs on its own clock — for the account page's live view. */
export function LivePlate({ art, startHours = 18, className = "" }: { art: PlateArtSpec; startHours?: number; className?: string }) {
  const [t, setT] = useState(startHours);
  useEffect(() => {
    const id = setInterval(() => setT((x) => (x >= 48 ? startHours : x + 0.05)), 100);
    return () => clearInterval(id);
  }, [startHours]);
  const g = growth(t);
  return (
    <div className={`relative ${className}`}>
      <GrowingPlate art={art} g={g} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-ink-high backdrop-blur">
        {Math.floor(t)}h {String(Math.floor((t % 1) * 60)).padStart(2, "0")}m · CFU {countAt(art, g)}
      </span>
    </div>
  );
}
