import type { PlateArt as PlateArtSpec } from "@/lib/types";

/**
 * Procedural petri plate, drawn in SVG from a seeded descriptor (PLAN.md §13.3).
 *
 * Deterministic: the same `seed` + `pattern` always renders the same plate, so
 * a card always looks like itself. Colonies grow from scale 0 (`.colony`
 * class) rather than fading in — that is the timelapse effect and it doubles
 * as the loading state.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const C = 100;
const R = 90;

/* Transcendental functions differ in the last bit between Node and browser
 * engines; rounding keeps server HTML and client render byte-identical. */
const r2 = (n: number) => Math.round(n * 100) / 100;

export type ColonyPoint = { x: number; y: number; r: number; accent: boolean };

/** Colony positions for the `colonies` pattern; shared with the Plate HUD overlay. */
export function colonyPoints(art: PlateArtSpec): ColonyPoint[] {
  const rnd = mulberry32(art.seed * 7919 + art.pattern.length);
  const n = 22 + Math.floor(rnd() * 26);
  return Array.from({ length: n }, () => {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * (R - 10);
    const s = 2.2 + rnd() * 5.5;
    const accent = rnd() < 0.18;
    rnd(); // opacity draw, kept so the sequence matches the renderer
    return { x: r2(C + Math.cos(a) * d), y: r2(C + Math.sin(a) * d), r: r2(s), accent };
  });
}

type Props = {
  art: PlateArtSpec;
  className?: string;
  /** Grow colonies in on mount. Off for tiny thumbnails. */
  animate?: boolean;
  title?: string;
};

export function PlateArt({ art, className, animate = true, title }: Props) {
  const rnd = mulberry32(art.seed * 7919 + art.pattern.length);
  const uid = `p${art.seed}${art.pattern[0]}`;
  const grow = (i: number) =>
    animate ? { className: "colony", style: { animationDelay: `${(i * 37) % 900}ms` } } : {};

  let body: React.ReactNode;

  switch (art.pattern) {
    case "colonies": {
      body = (
        <g filter={`url(#${uid}-glow)`}>
          {colonyPoints(art).map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.accent ? art.accent : art.colony} opacity={0.85 + (i % 3) * 0.05} {...grow(i)} />
          ))}
        </g>
      );
      break;
    }
    case "swarm": {
      // Dendritic swarming: a translucent halo, wavy fronts, and radial tendrils.
      const fronts = Array.from({ length: 4 }, (_, k) => {
        const base = 26 + k * 16;
        return Array.from({ length: 40 }, (_, j) => {
          const a = (j / 40) * Math.PI * 2;
          const r = base + (rnd() - 0.5) * (10 + k * 4);
          return `${(C + Math.cos(a) * r).toFixed(1)},${(C + Math.sin(a) * r).toFixed(1)}`;
        }).join(" ");
      });
      const tendrils = Array.from({ length: 30 }, () => {
        const a0 = rnd() * Math.PI * 2;
        const len = 45 + rnd() * 40;
        let a = a0;
        const pts: string[] = [];
        for (let d = 8; d < len; d += 6) {
          a += (rnd() - 0.5) * 0.35;
          pts.push(`${(C + Math.cos(a) * d).toFixed(1)},${(C + Math.sin(a) * d).toFixed(1)}`);
        }
        return pts.join(" ");
      });
      body = (
        <g>
          <circle cx={C} cy={C} r={84} fill={`url(#${uid}-lawn)`} opacity={0.35} />
          {fronts.map((pts, k) => (
            <polygon key={k} points={pts} fill={k % 2 ? art.accent : art.colony} opacity={0.14} stroke={art.colony} strokeWidth={0.5} strokeOpacity={0.35} />
          ))}
          <g filter={`url(#${uid}-glow)`}>
            {tendrils.map((pts, i) => (
              <polyline key={i} points={pts} fill="none" stroke={i % 4 === 0 ? art.accent : art.colony} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} {...grow(i)} />
            ))}
            <circle cx={C} cy={C} r={9} fill={art.colony} {...grow(0)} />
          </g>
        </g>
      );
      break;
    }
    case "halo": {
      body = (
        <g>
          <circle cx={C} cy={C} r={R} fill={art.colony} opacity={0.26} />
          {Array.from({ length: 60 }, (_, i) => {
            const a = rnd() * Math.PI * 2;
            const d = 42 + rnd() * (R - 46);
            return (
              <circle key={i} cx={r2(C + Math.cos(a) * d)} cy={r2(C + Math.sin(a) * d)} r={r2(1.2 + rnd() * 1.8)} fill={art.colony} opacity={0.5} />
            );
          })}
          <circle cx={C} cy={C} r={40} fill={`url(#${uid}-clear)`} {...grow(2)} />
          <circle cx={C} cy={C} r={40} fill="none" stroke={art.accent} strokeWidth={0.8} strokeOpacity={0.5} strokeDasharray="2 3" />
          <g filter={`url(#${uid}-glow)`}>
            <circle cx={C} cy={C} r={13} fill={art.accent} {...grow(0)} />
            <circle cx={C} cy={C} r={7} fill={art.colony} {...grow(1)} />
          </g>
        </g>
      );
      break;
    }
    case "rings": {
      body = (
        <g filter={`url(#${uid}-glow)`}>
          {Array.from({ length: 7 }, (_, k) => (
            <circle
              key={k}
              cx={C}
              cy={C}
              r={10 + k * 12}
              fill="none"
              stroke={k % 2 ? art.accent : art.colony}
              strokeWidth={2 + (k % 3) * 2}
              opacity={0.85 - k * 0.09}
              {...grow(k)}
            />
          ))}
          <circle cx={C} cy={C} r={6} fill={art.colony} {...grow(0)} />
        </g>
      );
      break;
    }
    case "lawn":
    default: {
      body = (
        <g>
          <circle cx={C} cy={C} r={R} fill={`url(#${uid}-lawn)`} {...grow(0)} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = rnd() * Math.PI * 2;
            const d = Math.sqrt(rnd()) * (R - 14);
            return (
              <circle key={i} cx={r2(C + Math.cos(a) * d)} cy={r2(C + Math.sin(a) * d)} r={r2(3 + rnd() * 6)} fill={art.agar} opacity={0.9} {...grow(i + 1)} />
            );
          })}
        </g>
      );
    }
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title ?? `${art.pattern} plate`}>
      <defs>
        <radialGradient id={`${uid}-agar`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={art.agar} stopOpacity={1} />
          <stop offset="100%" stopColor="#04060a" />
        </radialGradient>
        <radialGradient id={`${uid}-clear`}>
          <stop offset="70%" stopColor={art.agar} />
          <stop offset="100%" stopColor={art.agar} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${uid}-lawn`}>
          <stop offset="0%" stopColor={art.colony} stopOpacity={0.75} />
          <stop offset="80%" stopColor={art.colony} stopOpacity={0.5} />
          <stop offset="100%" stopColor={art.accent} stopOpacity={0.35} />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${uid}-clip`}>
          <circle cx={C} cy={C} r={R} />
        </clipPath>
      </defs>
      <circle cx={C} cy={C} r={R + 6} fill="#0b0e17" stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
      <circle cx={C} cy={C} r={R} fill={`url(#${uid}-agar)`} />
      <g clipPath={`url(#${uid}-clip)`}>{body}</g>
      <ellipse cx={72} cy={58} rx={38} ry={20} fill="white" opacity={0.05} transform="rotate(-30 72 58)" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
    </svg>
  );
}
