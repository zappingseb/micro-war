"use client";

import { CH, TipBox, TipRow, niceStep, useChartHover } from "./Tooltip";

export interface ScatterPoint {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  overfit: boolean;
  note?: string;
}

export interface BandSample {
  x: number;
  fit: number;
  ci: number;
  pi: number;
}

interface Props {
  points: ScatterPoint[];
  band: BandSample[];
  fit: { slope: number; slopeCi: number; intercept: number; r2: number; p: number; n: number };
  unit: string;
  xLabel: string;
  yLabel: string;
}

/** Public-vs-sealed scatter with OLS fit, 95% confidence and prediction bands. */
export function Scatter({ points, band, fit, unit, xLabel, yLabel }: Props) {
  const { wrap, hover, move, leave } = useChartHover<ScatterPoint>();
  const W = 680;
  const H = 460;
  const L = 60;
  const R = 24;
  const T = 24;
  const B = 52;
  const all = [...points.map((p) => p.x), ...points.map((p) => p.y), ...band.map((b) => b.fit + b.pi), ...band.map((b) => b.fit - b.pi)];
  const step = niceStep(Math.max(...all) - Math.min(...all), 6);
  const lo = Math.floor(Math.min(...all) / step) * step;
  const hi = Math.ceil(Math.max(...all) / step) * step;
  const sx = (v: number) => L + ((W - L - R) * (v - lo)) / (hi - lo);
  const sy = (v: number) => H - B - ((H - T - B) * (v - lo)) / (hi - lo);
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);

  const area = (half: (b: BandSample) => number) =>
    band.map((b, i) => `${i ? "L" : "M"}${sx(b.x)} ${sy(b.fit + half(b))}`).join(" ") +
    " " +
    [...band].reverse().map((b) => `L${sx(b.x)} ${sy(b.fit - half(b))}`).join(" ") +
    " Z";
  const line = band.map((b, i) => `${i ? "L" : "M"}${sx(b.x)} ${sy(b.fit)}`).join(" ");

  return (
    <div ref={wrap} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sealed mean against public mean with regression line and bands">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} x2={sx(t)} y1={T} y2={H - B} stroke={CH.grid} strokeWidth={1} />
            <line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} stroke={CH.grid} strokeWidth={1} />
            <text x={sx(t)} y={H - B + 16} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
              {t}
            </text>
            <text x={L - 8} y={sy(t) + 3.5} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
              {t}
            </text>
          </g>
        ))}
        <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid}>
          {xLabel} ({unit})
        </text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid} transform={`rotate(-90 14 ${(T + H - B) / 2})`}>
          {yLabel} ({unit})
        </text>

        {/* identity: perfectly reproducible */}
        <line x1={sx(lo)} y1={sy(lo)} x2={sx(hi)} y2={sy(hi)} stroke={CH.axis} strokeWidth={1} />
        <text x={sx(hi) - 4} y={sy(hi) + 14} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
          y = x
        </text>

        <path d={area((b) => b.pi)} fill={CH.series} opacity={0.08} />
        <path d={area((b) => b.ci)} fill={CH.series} opacity={0.16} />
        <path d={line} fill="none" stroke={CH.series} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p) => {
          const hot = hover?.item.id === p.id;
          return (
            <g key={p.id} onPointerMove={move(p)} onPointerLeave={leave} style={{ cursor: "default" }}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={12} fill="transparent" />
              <circle cx={sx(p.x)} cy={sy(p.y)} r={hot ? 6.5 : 5} fill={p.overfit ? CH.below : CH.series} stroke={CH.surface} strokeWidth={2} />
              {p.note && (
                <text
                  x={sx(p.x) + (p.x > lo + (hi - lo) * 0.65 ? -10 : 10)}
                  y={sy(p.y) - 8}
                  textAnchor={p.x > lo + (hi - lo) * 0.65 ? "end" : "start"}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill={CH.inkMid}
                >
                  {p.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid" aria-label="Legend">
        <li className="flex items-center gap-2"><span className="inline-block h-[2px] w-4" style={{ background: CH.series }} aria-hidden />OLS fit</li>
        <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-4 rounded-[2px]" style={{ background: CH.series, opacity: 0.35 }} aria-hidden />95% confidence band</li>
        <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-4 rounded-[2px]" style={{ background: CH.series, opacity: 0.15 }} aria-hidden />95% prediction band</li>
        <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CH.below }} aria-hidden />outside prediction band</li>
        <li className="text-ink-low">
          slope {fit.slope.toFixed(2)} ± {fit.slopeCi.toFixed(2)} · R² {fit.r2.toFixed(2)} · p {fit.p < 0.001 ? "< 0.001" : fit.p.toFixed(3)} · n {fit.n}
        </li>
      </ul>

      {hover && (
        <TipBox x={hover.x} y={hover.y}>
          <p className="mb-1 text-ink-high">{hover.item.label}</p>
          <TipRow label="public" value={`${hover.item.x.toFixed(1)} ${unit}`} />
          <TipRow label="sealed" value={`${hover.item.y.toFixed(1)} ${unit}`} colour={hover.item.overfit ? CH.below : CH.series} />
          <TipRow label="ratio" value={(hover.item.y / hover.item.x).toFixed(2)} />
          <TipRow label="vs fit" value={`${(hover.item.y - (fit.intercept + fit.slope * hover.item.x)).toFixed(1)} ${unit}`} />
        </TipBox>
      )}
    </div>
  );
}
