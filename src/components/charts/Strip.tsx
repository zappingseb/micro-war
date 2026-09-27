"use client";

import { CH, TipBox, TipRow, niceStep, useChartHover } from "./Tooltip";

export interface StripGroup {
  id: string;
  label: string;
  publicReps: number[];
  sealedReps: number[];
  publicMean: number;
  publicCi: number;
  sealedMean: number;
  sealedCi: number;
}

type Dot = { group: string; panel: "public" | "sealed"; value: number };

/** Replicate-level strip plot, small multiples per entry, public vs sealed. */
export function Strip({ groups, unit }: { groups: StripGroup[]; unit: string }) {
  const { wrap, hover, move, leave } = useChartHover<Dot>();
  const W = 800;
  const H = 300;
  const L = 48;
  const T = 24;
  const B = 44;
  const pw = (W - L - 12) / groups.length;
  const all = groups.flatMap((g) => [...g.publicReps, ...g.sealedReps]);
  const step = niceStep(Math.max(...all) - Math.min(...all), 5);
  const lo = Math.floor(Math.min(...all) / step) * step;
  const hi = Math.ceil(Math.max(...all) / step) * step;
  const sy = (v: number) => H - B - ((H - T - B) * (v - lo)) / (hi - lo);
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
  const jitter = (i: number) => ((i * 37) % 11) - 5;

  return (
    <div ref={wrap} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Replicate values per entry, public and sealed panels">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - 12} y1={sy(t)} y2={sy(t)} stroke={CH.grid} strokeWidth={1} />
            <text x={L - 8} y={sy(t) + 3.5} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
              {t}
            </text>
          </g>
        ))}
        {groups.map((g, gi) => {
          const x0 = L + gi * pw;
          const xp = x0 + pw * 0.34;
          const xs = x0 + pw * 0.66;
          const series = (reps: number[], x: number, mean: number, ci: number, colour: string, panel: Dot["panel"]) => (
            <g>
              <line x1={x} x2={x} y1={sy(mean - ci)} y2={sy(mean + ci)} stroke={colour} strokeWidth={1.5} opacity={0.8} />
              <line x1={x - 9} x2={x + 9} y1={sy(mean)} y2={sy(mean)} stroke={colour} strokeWidth={2} />
              {reps.map((v, i) => {
                const d: Dot = { group: g.label, panel, value: v };
                return (
                  <g key={i} onPointerMove={move(d)} onPointerLeave={leave}>
                    <circle cx={x + jitter(i + gi)} cy={sy(v)} r={11} fill="transparent" />
                    <circle cx={x + jitter(i + gi)} cy={sy(v)} r={4} fill={colour} stroke={CH.surface} strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          );
          return (
            <g key={g.id}>
              {gi > 0 && <line x1={x0} x2={x0} y1={T} y2={H - B} stroke={CH.grid} strokeWidth={1} />}
              {series(g.publicReps, xp, g.publicMean, g.publicCi, CH.series, "public")}
              {series(g.sealedReps, xs, g.sealedMean, g.sealedCi, CH.series2, "sealed")}
              <text x={x0 + pw / 2} y={H - B + 16} textAnchor="middle" fontSize={10} fill={CH.ink} fontFamily="var(--font-sans)">
                {g.label.length > 18 ? g.label.slice(0, 17) + "…" : g.label}
              </text>
              <text x={x0 + pw / 2} y={H - B + 30} textAnchor="middle" fontSize={9} fill={CH.inkLow} fontFamily="var(--font-mono)">
                {(g.sealedMean / g.publicMean).toFixed(2)}×
              </text>
            </g>
          );
        })}
        <text x={W - 12} y={H - 2} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
          {unit} · each dot one replicate · tick = mean · bar = 95% CI
        </text>
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid" aria-label="Legend">
        <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CH.series }} aria-hidden />public panel</li>
        <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CH.series2 }} aria-hidden />sealed panel</li>
      </ul>
      {hover && (
        <TipBox x={hover.x} y={hover.y}>
          <p className="mb-1 text-ink-high">{hover.item.group}</p>
          <TipRow label={hover.item.panel} value={`${hover.item.value.toFixed(1)} ${unit}`} colour={hover.item.panel === "public" ? CH.series : CH.series2} />
        </TipBox>
      )}
    </div>
  );
}
