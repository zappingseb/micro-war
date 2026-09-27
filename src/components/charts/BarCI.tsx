"use client";

import { CH, TipBox, TipRow, niceStep, useChartHover } from "./Tooltip";

export interface BarRow {
  id: string;
  label: string;
  sub: string;
  value: number;
  ci: number;
  n: number;
  verdict: "above" | "below" | "ns";
  stars: string;
  pAdj: number;
  ratio: number;
}

interface Props {
  rows: BarRow[];
  reference: { value: number; ci: number; label: string };
  unit: string;
  /** Rows that get a direct value label (the story); the rest live in tooltip + table. */
  labelled?: string[];
}

const COLOUR = { above: CH.above, below: CH.below, ns: CH.ns } as const;
const VERDICT_TEXT = { above: "above reference", below: "below reference", ns: "not significant" } as const;

/** Horizontal bars with 95% CI error bars and Holm-adjusted significance stars. */
export function BarCI({ rows, reference, unit, labelled = [] }: Props) {
  const { wrap, hover, move, leave } = useChartHover<BarRow>();
  const L = 210;
  const R = 70;
  const T = 30;
  const rowH = 26;
  const bar = 16;
  const W = 800;
  const H = T + rows.length * rowH + 34;
  const maxV = Math.max(reference.value + reference.ci, ...rows.map((r) => r.value + r.ci));
  const step = niceStep(maxV, 6);
  const xMax = Math.ceil(maxV / step) * step;
  const x = (v: number) => L + ((W - L - R) * v) / xMax;
  const ticks = Array.from({ length: Math.floor(xMax / step) + 1 }, (_, i) => i * step);

  return (
    <div ref={wrap} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sealed-panel titer per entry with 95% confidence intervals">
        {/* grid */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T - 6} y2={H - 30} stroke={CH.grid} strokeWidth={1} />
            <text x={x(t)} y={H - 14} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
              {t.toLocaleString("en")}
            </text>
          </g>
        ))}
        <text x={W - R} y={H - 2} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>
          {unit} · sealed panel · mean ± 95% CI
        </text>

        {/* reference band + line */}
        <rect x={x(reference.value - reference.ci)} y={T - 6} width={x(reference.value + reference.ci) - x(reference.value - reference.ci)} height={H - 30 - (T - 6)} fill="#ffffff" opacity={0.05} />
        <line x1={x(reference.value)} x2={x(reference.value)} y1={T - 6} y2={H - 30} stroke={CH.inkMid} strokeWidth={1} />
        <text x={x(reference.value) + 4} y={T - 10} fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid}>
          {reference.label} {reference.value.toFixed(0)}
        </text>

        {rows.map((r, i) => {
          const y = T + i * rowH;
          const cy = y + rowH / 2;
          const w = Math.max(0, x(r.value) - L);
          const c = COLOUR[r.verdict];
          const hot = hover?.item.id === r.id;
          return (
            <g key={r.id} onPointerMove={move(r)} onPointerLeave={leave} style={{ cursor: "default" }}>
              <rect x={0} y={y} width={W} height={rowH} fill="#ffffff" opacity={hot ? 0.05 : 0} />
              <text x={L - 12} y={cy - 2} textAnchor="end" fontSize={11} fill={CH.ink} fontFamily="var(--font-sans)">
                {r.label.length > 27 ? r.label.slice(0, 26) + "…" : r.label}
              </text>
              <text x={L - 12} y={cy + 9} textAnchor="end" fontSize={9} fill={CH.inkLow} fontFamily="var(--font-mono)">
                {r.sub}
              </text>
              <path d={`M${L} ${cy - bar / 2} h${Math.max(0, w - 4)} a4 4 0 0 1 4 4 v${bar - 8} a4 4 0 0 1 -4 4 H${L} Z`} fill={c} opacity={hot ? 1 : 0.9} />
              <line x1={x(r.value - r.ci)} x2={x(r.value + r.ci)} y1={cy} y2={cy} stroke={CH.inkMid} strokeWidth={1.5} />
              <line x1={x(r.value - r.ci)} x2={x(r.value - r.ci)} y1={cy - 4} y2={cy + 4} stroke={CH.inkMid} strokeWidth={1.5} />
              <line x1={x(r.value + r.ci)} x2={x(r.value + r.ci)} y1={cy - 4} y2={cy + 4} stroke={CH.inkMid} strokeWidth={1.5} />
              <text x={x(r.value + r.ci) + 6} y={cy + 3.5} fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid}>
                {r.stars}
                {labelled.includes(r.id) ? `  ${r.value.toFixed(1)}` : ""}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid" aria-label="Legend">
        {(["above", "below", "ns"] as const).map((v) => (
          <li key={v} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-3 rounded-[2px]" style={{ background: COLOUR[v] }} aria-hidden />
            {VERDICT_TEXT[v]}
          </li>
        ))}
        <li className="text-ink-low">Welch t vs reference · Holm-adjusted · *** p&lt;0.001 ** p&lt;0.01 * p&lt;0.05</li>
      </ul>

      {hover && (
        <TipBox x={hover.x} y={hover.y}>
          <p className="mb-1 text-ink-high">{hover.item.label}</p>
          <TipRow label="sealed" value={`${hover.item.value.toFixed(1)} ± ${hover.item.ci.toFixed(1)} ${unit}`} colour={COLOUR[hover.item.verdict]} />
          <TipRow label="n" value={String(hover.item.n)} />
          <TipRow label="p (Holm)" value={hover.item.pAdj < 0.001 ? "< 0.001" : hover.item.pAdj.toFixed(3)} />
          <TipRow label="sealed / public" value={hover.item.ratio.toFixed(2)} />
        </TipBox>
      )}
    </div>
  );
}
