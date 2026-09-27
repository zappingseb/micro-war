"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Card, Fixture, House, Stream } from "@/lib/types";
import { GrowingPlate, countAt, growth } from "./GrowingPlate";
import { Badge, Crest } from "./ui";
import { CH } from "./charts/Tooltip";

interface Props {
  fixture: Fixture;
  home: { house: House; card: Card; accent: string };
  away: { house: House; card: Card; accent: string };
  unit: string;
  streams: Stream[];
  table: { house: House; p: number; w: number; d: number; l: number; pts: number }[];
}

const CHAT: { at: number; user: string; tag?: string; text: string }[] = [
  { at: 0.2, user: "plate_lover", text: "lets gooo group C" },
  { at: 1.1, user: "s.okafor", tag: "Davidoffs", text: "replicates 1–6 all plated clean, no condensation this time 🙏" },
  { at: 3.4, user: "lysogen_lyngby", tag: "Lyngby", text: "ECO-12 doubling already, watch the lawn" },
  { at: 6.0, user: "agar_andy", text: "why is the cyan front so slow at the start" },
  { at: 6.4, user: "s.okafor", tag: "Davidoffs", text: "pyocyanin export needs quorum. it comes late and it comes hard" },
  { at: 9.7, user: "mod_bot", text: "Reminder: raw plate images are linked under the score. No stat without its plate." },
  { at: 12.1, user: "plate_lover", text: "rep 4 voided?? lid condensation again" },
  { at: 12.3, user: "operator_k", tag: "Facility", text: "confirmed. voided pre-analysis, n stays ≥ 5, score unaffected." },
  { at: 15.0, user: "kensington_kin", tag: "Kensington", text: "this is the match of the day honestly" },
  { at: 18.2, user: "agar_andy", text: "FRONT REACHED THE EDGE 🔵" },
  { at: 18.4, user: "lysogen_lyngby", tag: "Lyngby", text: "ok that halo is real" },
  { at: 22.5, user: "mod_bot", text: "Control drift 2.1% — within tolerance." },
  { at: 27.0, user: "plate_lover", text: "34 vs 27 and climbing" },
  { at: 33.3, user: "s.okafor", tag: "Davidoffs", text: "Midnight Bloom does not stop" },
  { at: 40.0, user: "kensington_kin", tag: "Kensington", text: "gg already" },
  { at: 47.5, user: "mod_bot", text: "Final imaging pass in 30 min." },
];

const COMMENTARY: { at: number; text: string; kind: "event" | "void" | "note" | "score" }[] = [
  { at: 0, text: "Plates loaded. Run R-3104 starts. 6 replicates each, 10-min imaging.", kind: "note" },
  { at: 4.2, text: "First colonies detected on ECO-12 (Lyngby). Fast chassis, as billed.", kind: "event" },
  { at: 8.5, text: "Pyocyanin pigment first visible on PYO-7 replicate 2.", kind: "event" },
  { at: 12.07, text: "Davidoff replicate 4 voided (lid condensation). n = 5.", kind: "void" },
  { at: 18.37, text: "Pyocyanin front reaches the inhibition edge. Halo measurable.", kind: "score" },
  { at: 24, text: "Half-time. Control drift 2.1%, within tolerance.", kind: "note" },
  { at: 31.5, text: "ECO-12 lawn saturates; halo growth on Lyngby side flattens.", kind: "event" },
  { at: 41, text: "PYO-7 halo still expanding at 0.3 mm/h.", kind: "event" },
  { at: 48, text: "Final imaging pass. Scores locked pending analysis.", kind: "score" },
];

const at = (curve: number[], t: number, total: number) => {
  if (!curve.length) return 0;
  const f = (t / total) * (curve.length - 1);
  const i = Math.floor(f);
  const a = curve[Math.min(i, curve.length - 1)];
  const b = curve[Math.min(i + 1, curve.length - 1)];
  return a + (b - a) * (f - i);
};

const hhmm = (t: number) => `${String(Math.floor(t)).padStart(2, "0")}h ${String(Math.floor((t % 1) * 60)).padStart(2, "0")}m`;

/** The live match centre: a timelapse player with synced data, feed and chat. */
export function LiveMatch({ fixture, home, away, unit, streams, table }: Props) {
  const total = fixture.totalHours;
  const [t, setT] = useState(fixture.elapsedHours);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [viewers, setViewers] = useState(3412);
  const chatRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((x) => {
        const n = x + 0.05 * speed;
        if (n >= total) {
          setPlaying(false);
          return total;
        }
        return n;
      });
      setViewers((v) => Math.max(2800, v + Math.round((Math.random() - 0.45) * 12)));
    }, 100);
    return () => clearInterval(id);
  }, [playing, speed, total]);

  const chat = CHAT.filter((m) => m.at <= t);
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [chat.length]);

  const hs = at(fixture.home.curve, t, total);
  const as = at(fixture.away.curve, t, total);
  const gh = growth(t, 17, 5);
  const ga = growth(t, 13, 6);
  const final = t >= total;
  const feed = COMMENTARY.filter((c) => c.at <= t).reverse();

  /* curves chart */
  const W = 640;
  const H = 220;
  const L = 40;
  const B = 28;
  const maxY = Math.max(...fixture.home.curve, ...fixture.away.curve) * 1.1;
  const sx = (h: number) => L + ((W - L - 12) * h) / total;
  const sy = (v: number) => H - B - ((H - 16 - B) * v) / maxY;
  const path = (curve: number[]) => {
    const n = curve.length;
    const upto = Math.min(n - 1, (t / total) * (n - 1));
    const pts: string[] = [];
    for (let i = 0; i <= Math.floor(upto); i++) pts.push(`${i ? "L" : "M"}${sx((i / (n - 1)) * total)} ${sy(curve[i])}`);
    pts.push(`L${sx(t)} ${sy(at(curve, t, total))}`);
    return pts.join(" ");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
      {/* Player */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-hair bg-void">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(47,230,214,0.08),transparent_60%)]" />
          <div className="relative flex items-center justify-between px-5 pt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
            <span>
              Group {fixture.group} · MD {fixture.matchday} · {fixture.replicates} reps
            </span>
            {final ? <Badge>Final · pending analysis</Badge> : <Badge tone="live">Live · {hhmm(t)} / {total}h</Badge>}
          </div>

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-6 sm:gap-6">
            <Side accent={home.accent} house={home.house} card={home.card} g={gh} align="left" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="display text-5xl tabular-nums sm:text-7xl" style={{ color: hs >= as ? home.accent : undefined }}>
                  {hs.toFixed(0)}
                </span>
                <span className="display text-3xl text-ink-low">–</span>
                <span className="display text-5xl tabular-nums sm:text-7xl" style={{ color: as > hs ? away.accent : undefined }}>
                  {as.toFixed(0)}
                </span>
              </div>
              <p className="eyebrow mt-1">{unit}</p>
            </div>
            <Side accent={away.accent} house={away.house} card={away.card} g={ga} align="right" />
          </div>

          {/* scrubber */}
          <div className="relative border-t border-hair bg-panel/70 px-5 py-3">
            <div className="relative">
              <input
                type="range"
                min={0}
                max={total}
                step={0.05}
                value={t}
                onChange={(e) => setT(Number(e.target.value))}
                className="w-full accent-[#2fe6d6]"
                aria-label="Timelapse position in hours"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1">
                {COMMENTARY.map((c) => (
                  <span
                    key={c.at}
                    className={`absolute top-[-2px] h-2 w-[2px] ${c.kind === "void" ? "bg-strep" : c.kind === "score" ? "bg-gold" : "bg-ink-low"}`}
                    style={{ left: `${(c.at / total) * 100}%` }}
                    title={c.text}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-ink-mid">
              <button
                type="button"
                onClick={() => {
                  if (final) setT(0);
                  setPlaying((p) => !p || final);
                }}
                className="rounded-full border border-hair px-3 py-1 uppercase tracking-[0.16em] text-ink-high hover:border-ink-mid"
              >
                {final ? "Replay" : playing ? "❚❚ Pause" : "▶ Play"}
              </button>
              <span>
                speed
                {[1, 4, 12].map((s) => (
                  <button key={s} type="button" onClick={() => setSpeed(s)} className={`ml-1.5 rounded px-1.5 ${speed === s ? "bg-white/10 text-ink-high" : "hover:text-ink-high"}`}>
                    {s}×
                  </button>
                ))}
              </span>
              <span className="ml-auto tabular-nums">{hhmm(t)} of {total}h · drift {fixture.controlDrift}% ✓</span>
            </div>
          </div>
        </div>

        {/* Curves */}
        <div className="rounded-2xl border border-hair bg-panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Growth curves · live</p>
              <h3 className="display text-2xl text-ink-high">{unit} over the run</h3>
            </div>
            <ul className="flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid">
              <li className="flex items-center gap-2"><span className="inline-block h-[2px] w-4" style={{ background: CH.series }} aria-hidden />{home.house.name}</li>
              <li className="flex items-center gap-2"><span className="inline-block h-[2px] w-4" style={{ background: CH.series2 }} aria-hidden />{away.house.name}</li>
            </ul>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Live growth curves for both houses">
            {[0, 12, 24, 36, 48].map((h) => (
              <g key={h}>
                <line x1={sx(h)} x2={sx(h)} y1={16} y2={H - B} stroke={CH.grid} strokeWidth={1} />
                <text x={sx(h)} y={H - 10} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>{h}h</text>
              </g>
            ))}
            {[0, 0.5, 1].map((f) => (
              <g key={f}>
                <line x1={L} x2={W - 12} y1={sy(f * maxY)} y2={sy(f * maxY)} stroke={CH.grid} strokeWidth={1} />
                <text x={L - 6} y={sy(f * maxY) + 3.5} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkLow}>{(f * maxY).toFixed(0)}</text>
              </g>
            ))}
            <path d={path(fixture.home.curve)} fill="none" stroke={CH.series} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={path(fixture.away.curve)} fill="none" stroke={CH.series2} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <line x1={sx(t)} x2={sx(t)} y1={16} y2={H - B} stroke={CH.inkMid} strokeWidth={1} />
            <circle cx={sx(t)} cy={sy(hs)} r={4} fill={CH.series} stroke={CH.surface} strokeWidth={2} />
            <circle cx={sx(t)} cy={sy(as)} r={4} fill={CH.series2} stroke={CH.surface} strokeWidth={2} />
            <text x={sx(t) + 8} y={sy(hs) - 6} fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid}>{hs.toFixed(1)}</text>
            <text x={sx(t) + 8} y={sy(as) + 14} fontSize={10} fontFamily="var(--font-mono)" fill={CH.inkMid}>{as.toFixed(1)}</text>
          </svg>
        </div>

        {/* Commentary */}
        <div className="rounded-2xl border border-hair bg-panel p-5">
          <p className="eyebrow mb-3">Commentary feed</p>
          <ol className="space-y-2">
            {feed.map((c) => (
              <li key={c.at} className="flex gap-3 text-sm">
                <span className="w-16 shrink-0 font-mono text-[11px] tabular-nums text-ink-low">{hhmm(c.at)}</span>
                <span className={c.kind === "void" ? "text-strep" : c.kind === "score" ? "text-gold" : "text-ink-mid"}>{c.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="flex h-[26rem] flex-col rounded-2xl border border-hair bg-panel">
          <div className="flex items-center justify-between border-b border-hair px-4 py-3">
            <p className="eyebrow">Stream chat</p>
            <span className="font-mono text-[11px] text-ink-mid">
              <span className="live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-strep" aria-hidden />
              {viewers.toLocaleString("en")} watching
            </span>
          </div>
          <ol ref={chatRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-[13px]">
            {chat.map((m) => (
              <li key={m.at}>
                <span className="font-mono text-[11px] text-ink-low">{hhmm(m.at)} </span>
                <span className={`font-semibold ${m.tag ? "text-foil-b" : "text-ink-high"}`}>{m.user}</span>
                {m.tag && <span className="ml-1 rounded-sm border border-hair px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-low">{m.tag}</span>}
                <span className="text-ink-mid">: {m.text}</span>
              </li>
            ))}
          </ol>
          <p className="border-t border-hair px-4 py-2 font-mono text-[10px] text-ink-low">Chat replays with the timelapse · demo</p>
        </div>

        <div className="rounded-2xl border border-hair bg-panel p-4">
          <p className="eyebrow mb-3">Group {fixture.group} · live table</p>
          <table className="w-full font-mono text-[11px]">
            <thead className="text-ink-low">
              <tr>
                <th className="text-left font-normal">House</th>
                <th className="font-normal">P</th>
                <th className="font-normal">W</th>
                <th className="font-normal">D</th>
                <th className="font-normal">L</th>
                <th className="text-right font-normal">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => {
                const live = r.house.slug === home.house.slug || r.house.slug === away.house.slug;
                const leading = live && ((r.house.slug === home.house.slug && hs > as) || (r.house.slug === away.house.slug && as > hs));
                const pts = r.pts + (live ? (leading ? 3 : hs === as ? 1 : 0) : 0);
                return (
                  <tr key={r.house.slug} className={`border-t border-hair ${live ? "text-ink-high" : "text-ink-mid"}`}>
                    <td className="flex items-center gap-2 py-1.5"><Crest house={r.house} size={18} />{r.house.name.replace("The ", "")}{live && <span className="live-dot h-1.5 w-1.5 rounded-full bg-strep" aria-hidden />}</td>
                    <td className="text-center">{r.p + (live ? 1 : 0)}</td>
                    <td className="text-center">{r.w + (leading ? 1 : 0)}</td>
                    <td className="text-center">{r.d}</td>
                    <td className="text-center">{r.l + (live && !leading && hs !== as ? 1 : 0)}</td>
                    <td className="text-right tabular-nums">{pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 font-mono text-[10px] text-ink-low">Provisional: live fixture counted as it stands.</p>
        </div>

        <div className="rounded-2xl border border-hair bg-panel p-4">
          <p className="eyebrow mb-3">Channels</p>
          <ul className="divide-y divide-hair">
            {streams.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-ink-high">{s.title}</span>
                  <span className="font-mono text-[10px] text-ink-low">twitch.tv/{s.channel}</span>
                </span>
                {s.live ? <Badge tone="live">{s.viewers.toLocaleString("en")}</Badge> : <span className="font-mono text-[10px] text-ink-low">soon</span>}
              </li>
            ))}
          </ul>
          <Link href="/#watch" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mid hover:text-ink-high">
            Ambient channel →
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Side({ accent, house, card, g, align }: { accent: string; house: House; card: Card; g: number; align: "left" | "right" }) {
  const cfu = countAt(card.art, g);
  return (
    <div className={`flex min-w-0 flex-col items-center gap-3 text-center ${align === "right" ? "" : ""}`}>
      <div className="relative w-full max-w-[240px]">
        <GrowingPlate art={card.art} g={g} className="w-full" />
        <span className="absolute left-[6%] top-[6%] rounded-md border border-white/15 bg-black/70 px-2 py-1 font-mono backdrop-blur">
          <span className="block text-[9px] uppercase tracking-[0.16em] text-ink-low">CFU</span>
          <span className="display text-xl leading-none text-ink-high">{cfu}</span>
        </span>
      </div>
      <div className="min-w-0 max-w-full">
        <p className="display text-xl leading-tight text-ink-high sm:text-2xl">{house.name}</p>
        <p className="font-mono text-[11px] text-ink-low">
          <span style={{ color: accent }}>◈</span> {card.accession} “{card.name}”
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">{card.bsl} · n=6</p>
      </div>
    </div>
  );
}
