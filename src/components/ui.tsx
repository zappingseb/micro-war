import Link from "next/link";
import type { House, OrganismId } from "@/lib/types";
import { organism } from "@/lib/api";

/* Small shared building blocks. Kept in one file because each is a few lines. */

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionHead({
  eyebrow,
  title,
  href,
  cta = "View all",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="display text-3xl text-ink-high sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-hair px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid transition hover:border-ink-mid hover:text-ink-high"
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}

export function OrganismTag({ id, className = "" }: { id: OrganismId; className?: string }) {
  const o = organism(id);
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide ${className}`} title={o.colourRationale}>
      <span style={{ color: o.accent }} aria-hidden>
        {o.glyph}
      </span>
      <i className="not-italic text-ink-mid">
        <em>{o.name}</em>
      </i>
    </span>
  );
}

export function Crest({ house, size = 40 }: { house: House; size?: number }) {
  const o = organism(house.signatureOrganism);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-mono font-bold leading-none ring-1 ring-white/15"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        color: o.accent,
        background: `conic-gradient(from 220deg, ${house.primary} 0 50%, ${house.secondary} 50% 100%)`,
        textShadow: "0 1px 2px rgba(0,0,0,.8)",
      }}
      aria-hidden
    >
      {o.glyph}
    </span>
  );
}

export function StatBar({ label, value, colour }: { label: string; value: number; colour: string }) {
  const filled = Math.round(value / 10);
  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className="w-20 uppercase tracking-[0.16em] text-ink-low">{label}</span>
      <span className="flex flex-1 gap-[3px]" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="h-2 flex-1 rounded-[1px]"
            style={{ background: i < filled ? colour : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </span>
      <span className="w-7 text-right tabular-nums text-ink-high">{value}</span>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "live" | "foil" | "gold" }) {
  const tones = {
    neutral: "border-hair text-ink-mid",
    live: "border-strep/50 text-strep",
    foil: "border-foil-a/60 text-foil-b",
    gold: "border-gold/60 text-gold",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${tones[tone]}`}>
      {tone === "live" && <span className="live-dot h-1.5 w-1.5 rounded-full bg-strep" aria-hidden />}
      {children}
    </span>
  );
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
