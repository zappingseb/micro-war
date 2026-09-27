import type { PlateArt as PlateArtSpec } from "@/lib/types";
import { colonyPoints, PlateArt } from "./PlateArt";

/**
 * Plate HUD: a plate with detected colonies ringed and a floating metric chip.
 * Borrowed from the instrument's own plate-detail view (PLAN.md §5.1) — it is
 * already a game HUD. Used in the instrument section and the match centre.
 */
export function PlateHUD({ art, label = "CFU count", className = "" }: { art: PlateArtSpec; label?: string; className?: string }) {
  const points = colonyPoints(art);
  const cfu = points.length * 10 + (art.seed % 7);
  const area = (points.reduce((a, p) => a + Math.PI * p.r * p.r, 0) / 100).toFixed(1);

  return (
    <div className={`relative ${className}`}>
      <PlateArt art={art} animate={false} className="h-full w-full" title="Plate with colony detection overlay" />
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r + 2.5}
            fill="none"
            stroke={p.accent ? "#ff3b5c" : "#ffb020"}
            strokeWidth={0.8}
            className="hud-ring"
            style={{ animationDelay: `${(i * 130) % 2400}ms` }}
          />
        ))}
        {points.slice(0, 6).map((p, i) => (
          <text key={i} x={p.x + p.r + 4} y={p.y - p.r - 2} fontSize="5" fontFamily="var(--font-mono)" fill="#ffb020" opacity={0.9}>
            {String(i + 1).padStart(2, "0")}
          </text>
        ))}
      </svg>
      <div className="absolute left-[8%] top-[8%] rounded-md border border-white/15 bg-black/70 px-3 py-2 font-mono backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-low">{label}</p>
        <p className="display text-2xl leading-none text-ink-high">{cfu}</p>
      </div>
      <div className="absolute bottom-[8%] right-[6%] rounded-md border border-white/15 bg-black/70 px-3 py-2 font-mono text-[11px] backdrop-blur">
        <p className="text-ink-low">Total area</p>
        <p className="text-ink-high">{area} mm²</p>
      </div>
    </div>
  );
}
