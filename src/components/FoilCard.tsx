import type { Card, House } from "@/lib/types";
import { organism } from "@/lib/api";
import { PlateArt } from "./PlateArt";
import { StatBar } from "./ui";
import { Tilt } from "./Tilt";

const RARITY: Record<Card["rarity"], { label: string; gem: string }> = {
  common: { label: "Common", gem: "#9aa3b8" },
  uncommon: { label: "Uncommon", gem: "#c0c8d8" },
  rare: { label: "Rare", gem: "#e8c46a" },
  epic: { label: "Epic", gem: "#b48cff" },
  mythic: { label: "Mythic", gem: "#ff7a3d" },
  legendary: { label: "Legendary", gem: "#2fe6d6" },
};

const SEASON_NUMERAL = ["", "I", "II", "III", "IV"];

/**
 * A strain card in a trading-card frame: title bar with cost pips, art box,
 * type line with rarity gem, rules box, and a power/toughness box carrying
 * the two headline stats. Anatomy per PLAN.md §3.1, styling per §5.2.
 */
export function FoilCard({ card, house }: { card: Card; house?: House }) {
  const o = organism(card.organism);
  const r = RARITY[card.rarity];
  const mythic = card.rarity === "mythic" || card.rarity === "legendary";
  // "Mana cost": containment class pips — BSL-2 costs more to field.
  const cost = card.bsl === "BSL-2" ? 2 : 1;
  const [pName, pVal] = topStat(card);
  const [tName, tVal] = secondStat(card);

  return (
    <Tilt className="h-full">
      <article
        className={`relative h-full rounded-2xl p-[2px] ${mythic ? "foil-border" : ""}`}
        style={{ "--accent": o.accent } as React.CSSProperties}
      >
        <div className="foil-sweep card-frame relative flex h-full flex-col rounded-[14px] p-2.5">
          {/* Title bar */}
          <header className="card-bar flex items-center justify-between gap-2 rounded-md px-3 py-1.5">
            <h3 className="display truncate text-lg text-ink-high">{card.name}</h3>
            <span className="flex shrink-0 items-center gap-1" title={`${card.bsl} · containment cost ${cost}`}>
              {Array.from({ length: cost }, (_, i) => (
                <span
                  key={i}
                  className="grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-bold text-black ring-1 ring-black/60"
                  style={{ background: o.accent }}
                  aria-hidden
                >
                  {o.glyph}
                </span>
              ))}
              <span className="sr-only">{card.bsl}</span>
            </span>
          </header>

          {/* Art box */}
          <div className="relative mx-1 mt-1.5 aspect-[5/4] overflow-hidden rounded-sm bg-void ring-1 ring-black/70">
            <PlateArt art={card.art} className="absolute left-1/2 top-1/2 h-[128%] w-auto -translate-x-1/2 -translate-y-1/2" title={`${card.accession} plate`} />
            <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-mid backdrop-blur">
              48 h timelapse
            </span>
          </div>

          {/* Type line */}
          <div className="card-bar mt-1.5 flex items-center justify-between gap-2 rounded-md px-3 py-1">
            <p className="truncate font-mono text-[11px] text-ink-high">
              Strain — <em>{o.name}</em>
            </p>
            <span
              className="h-3 w-3 shrink-0 rotate-45 rounded-[2px] ring-1 ring-black/60"
              style={{ background: `radial-gradient(circle at 35% 35%, #fff8, ${r.gem})` }}
              title={r.label}
              aria-label={r.label}
              role="img"
            />
          </div>

          {/* Rules box */}
          <div className="card-textbox mx-1 mt-1.5 flex flex-1 flex-col gap-2 rounded-sm px-3 py-2.5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-high">{card.keywords.join(" · ")}</p>
            <div className="space-y-1">
              <StatBar label="Titer" value={card.stats.titer} colour={o.accent} />
              <StatBar label="Inhibition" value={card.stats.inhibition} colour={o.accent} />
              <StatBar label="Growth" value={card.stats.growth} colour={o.accent} />
              <StatBar label="Robust" value={card.stats.robust} colour={o.accent} />
              <StatBar label="Chroma" value={card.stats.chroma} colour={o.accent} />
            </div>
            <p className="mt-auto border-t border-white/10 pt-2 text-[13px] italic leading-snug text-ink-mid">“{card.flavour}”</p>
          </div>

          {/* Collector line + P/T box */}
          <footer className="mt-1.5 flex items-end justify-between gap-2 px-2 pb-0.5">
            <div className="min-w-0 font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-ink-mid">
              <p className="truncate">
                {card.accession} · {card.edition} · S{SEASON_NUMERAL[card.season] ?? card.season} · {card.bsl}
              </p>
              <p className="truncate">
                {house?.name ?? card.houseSlug} · {card.licence} · <span style={{ color: r.gem }}>{r.label}</span>
              </p>
            </div>
            <div className="card-bar shrink-0 rounded-md px-2 py-1 text-center" title={`${pName} / ${tName}`}>
              <p className="display text-lg leading-none text-ink-high">
                {pVal}
                <span className="text-ink-low">/</span>
                {tVal}
              </p>
              <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-ink-low">
                {pName}/{tName}
              </p>
            </div>
          </footer>
        </div>
      </article>
    </Tilt>
  );
}

const STAT_LABEL: Record<keyof Card["stats"], string> = {
  titer: "TIT",
  inhibition: "INH",
  growth: "GRO",
  robust: "ROB",
  chroma: "CHR",
};

function ranked(card: Card) {
  return (Object.entries(card.stats) as [keyof Card["stats"], number][]).sort((a, b) => b[1] - a[1]);
}
function topStat(card: Card): [string, number] {
  const [k, v] = ranked(card)[0];
  return [STAT_LABEL[k], v];
}
function secondStat(card: Card): [string, number] {
  const [k, v] = ranked(card)[1];
  return [STAT_LABEL[k], v];
}
