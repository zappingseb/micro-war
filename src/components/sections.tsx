import Link from "next/link";
import type { Card, Challenge, Fixture, House, Season, Stream, TickerItem } from "@/lib/types";
import { houseBySlug, organism, track } from "@/lib/api";
import { Countdown } from "./Countdown";
import { FoilCard } from "./FoilCard";
import { LiveScore } from "./LiveScore";
import { PlateArt } from "./PlateArt";
import { Badge, Container, Crest, OrganismTag, SectionHead, fmtDate } from "./ui";
import { TRACKS } from "@/lib/fixtures";

const MODE_LABEL = { strain: "You submit a strain", media: "You submit a medium", pairing: "You submit a pairing" } as const;

function PanelBar({ pub, sealed }: { pub: number; sealed: number }) {
  return (
    <span className="flex gap-[3px]" aria-label={`${pub} public and ${sealed} sealed conditions`}>
      {Array.from({ length: pub }, (_, i) => (
        <span key={`p${i}`} className="h-2.5 w-3 rounded-[1px] bg-foil-b/80" />
      ))}
      {Array.from({ length: sealed }, (_, i) => (
        <span key={`s${i}`} className="h-2.5 w-3 rounded-[1px] border border-dashed border-ink-low" />
      ))}
    </span>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

export function Hero({ season, feature }: { season: Season; feature: Challenge }) {
  return (
    <section className="grain relative overflow-hidden border-b border-hair">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(47,230,214,0.16),transparent_55%),radial-gradient(ellipse_at_15%_90%,rgba(123,92,255,0.18),transparent_50%)]" />
      <div className="pointer-events-none absolute -right-[12vw] top-1/2 w-[70vw] max-w-[820px] -translate-y-1/2 opacity-90 md:-right-[6vw] md:w-[52vw]">
        <PlateArt art={feature.art} className="h-auto w-full " title="Season plate" />
      </div>

      <Container className="relative py-20 sm:py-28 lg:py-36">
        <p className="eyebrow mb-4 text-ink-mid">
          Season {["", "I", "II", "III"][season.number]} · {feature.status === "open" ? "Submissions open" : feature.status}
        </p>
        <h1 className="display max-w-4xl text-[clamp(3.2rem,11vw,8.5rem)] text-ink-high">
          The <span className="foil-text">Pyocyanin</span>
          <br />
          Open
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-mid">{season.strapline}</p>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-low">
          <div><dt className="sr-only">Houses</dt><dd><b className="text-ink-high">{season.houses}</b> houses</dd></div>
          <div><dt className="sr-only">Continents</dt><dd><b className="text-ink-high">{season.continents}</b> continents</dd></div>
          <div><dt className="sr-only">Plates</dt><dd><b className="text-ink-high">{season.plates.toLocaleString("en")}</b> plates</dd></div>
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/challenges/pyocyanin-open/"
            className="rounded-full bg-ink-high px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
          >
            Enter a strain
          </Link>
          <Link
            href="/watch/"
            className="inline-flex items-center gap-2 rounded-full border border-hair px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-high transition hover:border-ink-mid"
          >
            <span className="live-dot h-2 w-2 rounded-full bg-strep" aria-hidden />
            Watch live
          </Link>
        </div>

        <div className="mt-12">
          <p className="eyebrow mb-3">Sealed panel opens</p>
          <Countdown target={season.sealedOpensAt} />
        </div>
      </Container>
    </section>
  );
}

/* ── Ticker ──────────────────────────────────────────────────────────────── */

export function Ticker({ items, houses }: { items: TickerItem[]; houses: House[] }) {
  const arrow = { up: "▲", down: "▼", flat: "•" } as const;
  const tone = { up: "text-ecoli", down: "text-strep", flat: "text-ink-low" } as const;
  const row = (suffix: string) =>
    items.map((t) => (
      <span key={t.id + suffix} className="inline-flex items-center gap-2 px-6 font-mono text-[12px] text-ink-mid">
        <span className={tone[t.direction]} aria-hidden>{arrow[t.direction]}</span>
        <span className="text-ink-high">{houseBySlug(houses, t.houseSlug)?.name ?? t.houseSlug}</span>
        <span>{t.text}</span>
        <span className={`${tone[t.direction]} tabular-nums`}>{t.value}</span>
      </span>
    ));
  return (
    <div className="overflow-hidden border-b border-hair bg-panel py-2.5" aria-label="Latest results">
      <div className="ticker-track flex w-max whitespace-nowrap">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ── New drops ───────────────────────────────────────────────────────────── */

export function Drops({ challenges }: { challenges: Challenge[] }) {
  return (
    <section id="drops" className="scroll-mt-16 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="New drops" title="Open challenges" href="/challenges/" />
        <ul className="mb-6 flex flex-wrap gap-2" aria-label="Challenge tracks">
          {Object.values(TRACKS).map((t) => (
            <li key={t.id} className="rounded-full border border-hair px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mid" title={`${t.objective} — ${t.readout}`}>
              {t.name} <span className="text-ink-low">· {t.unit}</span>
            </li>
          ))}
        </ul>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {challenges.map((c, i) => {
            const o = organism(c.organism);
            const t = track(c.track);
            return (
              <article key={c.id} className="reveal group flex flex-col overflow-hidden rounded-xl border border-hair bg-panel transition hover:border-ink-low" style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <div className="relative aspect-[4/3] overflow-hidden bg-void">
                  <PlateArt art={c.art} className="absolute left-1/2 top-1/2 h-[140%] w-auto -translate-x-1/2 -translate-y-[42%] transition duration-700 group-hover:scale-105" animate={false} title={`${c.name} plate`} />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge tone={c.status === "open" ? "foil" : "neutral"}>{c.status === "open" ? "Foil · open" : "Coming soon"}</Badge>
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mid backdrop-blur">
                    {t.name}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <OrganismTag id={c.organism} />
                  <h3 className="display mt-2 text-2xl text-ink-high">{c.name}</h3>
                  <p className="mt-1 text-sm text-ink-mid">{c.subtitle}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-mid">{c.summary}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-hair pt-4 font-mono text-[11px]">
                    <div><dt className="eyebrow">Closes</dt><dd className="mt-1 text-ink-high">{fmtDate(c.closesAt)}</dd></div>
                    <div><dt className="eyebrow">Entrants</dt><dd className="mt-1 tabular-nums text-ink-high">{c.entrants || "—"}</dd></div>
                    <div><dt className="eyebrow">Panel</dt><dd className="mt-1.5"><PanelBar pub={c.publicConditions} sealed={c.sealedConditions} /></dd></div>
                  </dl>
                  <dl className="mt-3 space-y-1 font-mono text-[11px] text-ink-low">
                    <div className="flex justify-between gap-3"><dt>Scoring</dt><dd className="text-right text-ink-mid">{c.scoring}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Prize</dt><dd className="text-right" style={{ color: o.accent }}>{c.prize}</dd></div>
                    {c.sponsor && <div className="flex justify-between gap-3"><dt>Sponsor</dt><dd className="text-right text-ink-mid">{c.sponsor}</dd></div>}
                  </dl>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">{MODE_LABEL[c.submissionMode]} · min n={c.replicateFloor}</p>
                </div>
                <Link
                  href={`/challenges/${c.slug}/`}
                  className="block bg-ink-high py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-void transition group-hover:bg-white"
                >
                  {c.status === "open" ? `Enter · ${c.submissionMode}` : "Details"}
                </Link>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ── On the board ────────────────────────────────────────────────────────── */

function Side({ side, house, card, align }: { side: Fixture["home"]; house?: House; card?: Card; align: "left" | "right" }) {
  const o = card ? organism(card.organism) : null;
  return (
    <div className={`flex min-w-0 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      {card ? (
        <div className="h-12 w-12 shrink-0 rounded-full ring-1 ring-white/10"><PlateArt art={card.art} animate={false} className="h-full w-full" /></div>
      ) : (
        house && <Crest house={house} size={48} />
      )}
      <div className="min-w-0">
        <p className="display truncate text-base text-ink-high">{house?.name ?? side.houseSlug}</p>
        {card && (
          <p className="truncate font-mono text-[11px] text-ink-low">
            <span style={{ color: o?.accent }}>{o?.glyph}</span> {card.accession} “{card.name}”
          </p>
        )}
      </div>
    </div>
  );
}

export function Board({ fixtures, houses, cards }: { fixtures: Fixture[]; houses: House[]; cards: Card[] }) {
  const cardById = (id: string) => cards.find((c) => c.id === id);
  return (
    <section id="board" className="scroll-mt-16 border-y border-hair bg-panel/40 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="On the board" title="Match day 3" href="#board" cta="Full table" />
        <div className="grid gap-4 lg:grid-cols-2">
          {fixtures.map((f) => {
            const home = houseBySlug(houses, f.home.houseSlug);
            const away = houseBySlug(houses, f.away.houseSlug);
            const hc = cardById(f.home.cardId);
            const ac = cardById(f.away.cardId);
            const t = track(f.track);
            const accents: [string, string] = [hc ? organism(hc.organism).accent : "#fff", ac ? organism(ac.organism).accent : "#fff"];
            return (
              <article key={f.id} className="rounded-xl border border-hair bg-panel p-5">
                <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
                  <span>Group {f.group} · MD {f.matchday}</span>
                  {f.status === "live" ? (
                    <Badge tone="live">Live · {f.elapsedHours}h / {f.totalHours}h</Badge>
                  ) : f.status === "final" ? (
                    <Badge>Final</Badge>
                  ) : (
                    <Badge>Plates {fmtDate(f.kickoff)}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Side side={f.home} house={home} card={hc} align="left" />
                  <div className="flex items-center gap-2 px-2">
                    {f.status === "live" ? (
                      <LiveScore home={f.home.curve} away={f.away.curve} start={Math.floor((f.elapsedHours / f.totalHours) * (f.home.curve.length - 1))} colours={accents} scale={f.track === "sprint" ? 100 : 1} />
                    ) : f.status === "final" ? (
                      <>
                        <span className="display text-3xl tabular-nums" style={{ color: f.home.score >= f.away.score ? accents[0] : undefined }}>{f.home.score}</span>
                        <span className="text-ink-low">–</span>
                        <span className="display text-3xl tabular-nums" style={{ color: f.away.score > f.home.score ? accents[1] : undefined }}>{f.away.score}</span>
                      </>
                    ) : (
                      <span className="display text-2xl text-ink-low">vs</span>
                    )}
                  </div>
                  <Side side={f.away} house={away} card={ac} align="right" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-hair pt-3 font-mono text-[11px] text-ink-low">
                  <span>{t.name} · {t.unit}</span>
                  <span>
                    n={f.replicates}
                    {f.status !== "scheduled" && (
                      <> · drift {f.controlDrift}% <span className={f.controlDrift < 3 ? "text-ecoli" : "text-acineto"}>{f.controlDrift < 3 ? "✓" : "!"}</span></>
                    )}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ── The vault ───────────────────────────────────────────────────────────── */

export function Vault({ cards, houses }: { cards: Card[]; houses: House[] }) {
  return (
    <section id="vault" className="scroll-mt-16 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="The vault" title="Featured cards" href="#vault" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <FoilCard key={c.id} card={c} house={houseBySlug(houses, c.houseSlug)} />
          ))}
        </div>
        <p className="mt-6 font-mono text-[11px] text-ink-low">
          Rarity is earned, never bought: Uncommon = passed the sealed panel · Rare = top 25% · Epic = podium · Mythic = track winner or season record · Legendary = data cited in a peer-reviewed paper.
        </p>
      </Container>
    </section>
  );
}

/* ── Watch ───────────────────────────────────────────────────────────────── */

export function Watch({ streams }: { streams: Stream[] }) {
  const ambient = streams.find((s) => s.kind === "ambient") ?? streams[0];
  const rest = streams.filter((s) => s.id !== ambient.id);
  return (
    <section id="watch" className="scroll-mt-16 border-y border-hair bg-panel/40 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="Watch" title="Live now" href="/watch/" cta="Open the stream" />
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative overflow-hidden rounded-xl border border-hair bg-void">
            <div className="aspect-video">
              <PlateArt art={ambient.art} className="absolute left-1/2 top-1/2 h-[150%] w-auto -translate-x-1/2 -translate-y-1/2" title="Ambient incubator feed" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-5">
              <div>
                <Badge tone="live">Live · {ambient.viewers.toLocaleString("en")} watching</Badge>
                <h3 className="display mt-2 text-2xl text-ink-high">{ambient.title}</h3>
                <p className="font-mono text-[11px] text-ink-mid">twitch.tv/{ambient.channel}</p>
              </div>
              <span className="hidden rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-high backdrop-blur sm:inline">CFU 473</span>
            </div>
          </div>
          <ul className="flex flex-col divide-y divide-hair rounded-xl border border-hair bg-panel">
            {rest.map((s) => (
              <li key={s.id} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 shrink-0 rounded-full ring-1 ring-white/10"><PlateArt art={s.art} animate={false} className="h-full w-full" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-high">{s.title}</p>
                  <p className="font-mono text-[11px] text-ink-low">{s.channel} · {s.kind}</p>
                </div>
                {s.live ? <Badge tone="live">{s.viewers.toLocaleString("en")}</Badge> : <span className="font-mono text-[11px] text-ink-low">{fmtDate(s.startsAt)}</span>}
              </li>
            ))}
            <li className="mt-auto p-4 text-xs leading-relaxed text-ink-low">
              The ambient channel is a 24/7 timelapse of the incubator rack. Zero production cost, genuinely hypnotic.
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ── Houses ──────────────────────────────────────────────────────────────── */

export function Houses({ houses }: { houses: House[] }) {
  return (
    <section id="houses" className="scroll-mt-16 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="The houses" title={`${houses.length} labs · 4 continents`} href="#houses" cta="Atlas" />
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {houses.map((h, i) => (
            <li key={h.slug} className="flex items-center gap-3 rounded-lg border border-hair bg-panel px-3 py-2.5 transition hover:border-ink-low">
              <span className="w-5 font-mono text-[11px] tabular-nums text-ink-low">{i + 1}</span>
              <Crest house={h} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-high">{h.name}</p>
                <p className="truncate font-mono text-[11px] text-ink-low">{h.city} · {h.countryCode} · <em>{organism(h.signatureOrganism).short}</em></p>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="tabular-nums text-ink-high">{h.elo}</p>
                <p className="text-ink-low">Div {h.division}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 font-mono text-[11px] text-ink-low">
          House names are invented for the game and derived from places, not institutions. No listed institution has endorsed or joined the platform.
        </p>
      </Container>
    </section>
  );
}

/* ── How it works & the science ──────────────────────────────────────────── */

const STEPS = [
  ["Submit", "Register a strain or a media recipe. Biosafety attestation and a safety review come first."],
  ["Ship", "Your sample goes to the central facility. Every stage of the pipeline is time-stamped and visible to you."],
  ["Image", "Plates are incubated and imaged on a fixed schedule. Colonies are detected and counted automatically."],
  ["Score", "Public plates publish live. Sealed plates decide the winner. Every stat links to its plate."],
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-hair bg-panel/40 py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="How it works" title="Submit → Ship → Image → Score" />
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-hair bg-panel p-5">
              <span className="display text-5xl text-ink-low/60">0{i + 1}</span>
              <h3 className="display mt-3 text-2xl text-ink-high">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-mid">{body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-3">The science</p>
            <h2 className="display text-4xl text-ink-high sm:text-5xl">
              Every stat links <br />
              <span className="foil-text">to its plate.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-mid">
              Playful chrome, serious substance. Nothing is scored by vibes except the jury-judged art track, and every card stat opens the raw images, the fitted curve, the replicate spread and the operator log behind it.
            </p>
          </div>
          <ul className="grid gap-3">
            {[
              ["Two leaderboards", "Public plates are the theatre. Sealed plates, run at the close, decide the winner — a built-in reproducibility test."],
              ["Draws are real", "Within measurement error is a draw. The confidence interval decides, not the organiser."],
              ["Safe by default", "The default entry is a BSL-1 surrogate. Priority pathogens run only at accredited facilities under the governance model."],
            ].map(([t, b]) => (
              <li key={t} className="rounded-lg border border-hair bg-panel p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foil-b">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="border-t border-hair py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-2xl text-ink-high">
            MICRO<span className="foil-text">WAR</span>
          </p>
          <p className="mt-1 max-w-md text-sm text-ink-mid">The open league for antimicrobial and bioproduction discovery.</p>
          <p className="mt-3 font-mono text-[11px] text-ink-low">Demo build · all data is illustrative · no real plate imagery was used.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low" aria-label="Footer">
          <Link href="#drops" className="hover:text-ink-high">Challenges</Link>
          <Link href="#board" className="hover:text-ink-high">Boards</Link>
          <Link href="#vault" className="hover:text-ink-high">Cards</Link>
          <Link href="#houses" className="hover:text-ink-high">Houses</Link>
          <Link href="/account/" className="hover:text-ink-high">Account</Link>
        </nav>
      </Container>
    </footer>
  );
}
