import type { Metadata } from "next";
import Link from "next/link";
import { getSeason, listCards, listChallenges, listHouses, listSubmissions, organism } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections";
import { Gate } from "@/components/Gate";
import { PlateArt } from "@/components/PlateArt";
import { LivePlate } from "@/components/GrowingPlate";
import { FoilCard } from "@/components/FoilCard";
import { Badge, Container, Crest } from "@/components/ui";
import type { SubmissionStage } from "@/lib/types";

export const metadata: Metadata = { title: "Account" };

const PIPELINE: SubmissionStage[] = ["draft", "submitted", "safety-review", "accepted", "shipped", "received", "accessioned", "qc", "plated", "incubating", "imaged", "analysed", "scored", "published"];
const LABEL: Record<SubmissionStage, string> = {
  draft: "Draft", submitted: "Submitted", "safety-review": "Safety review", accepted: "Accepted", shipped: "Shipped", received: "Received",
  accessioned: "Accessioned", qc: "QC", plated: "Plated", incubating: "Incubating", imaged: "Imaged", analysed: "Analysed", scored: "Scored", published: "Published", disputed: "Disputed",
};

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

export default async function AccountPage() {
  const [season, subs, houses, challenges, cards] = await Promise.all([getSeason(), listSubmissions(), listHouses(), listChallenges(), listCards()]);
  const house = houses.find((h) => h.slug === "davidoffs")!;
  const minted = cards.filter((c) => subs.some((s) => s.cardId === c.id));

  return (
    <>
      <Nav sealedOpensAt={season.sealedOpensAt} seasonLabel={`Season ${["", "I", "II", "III"][season.number]}`} />
      <main className="flex-1 py-12">
        <Container>
          <p className="eyebrow">◈ Participant</p>
          <h1 className="display text-5xl text-ink-high sm:text-6xl">Your bench</h1>
          <div className="mt-8">
            <Gate requires="participant" title="This is the participant surface" blurb="Submissions, shipments, accession barcodes and your own plates incubating live. Verified researchers only.">
              <div className="space-y-10">
                {/* Identity */}
                <section className="grid gap-4 rounded-2xl border border-hair bg-panel p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <Crest house={house} size={72} />
                  <div>
                    <p className="display text-3xl text-ink-high">{house.name}</p>
                    <p className="font-mono text-[11px] text-ink-mid">{house.institution} · {house.city}, {house.country} · PI {house.pi} · Division {house.division} · Elo {house.elo}</p>
                    <p className="mt-2 font-mono text-[11px] text-ink-low">
                      ORCID <span className="text-ecoli">linked ✓</span> · biosafety attestation <span className="text-ecoli">valid to 2027-03</span> · role <span className="text-ink-high">House Captain</span>
                    </p>
                  </div>
                  <div className="flex gap-6 font-mono text-[11px] text-ink-low">
                    {[
                      ["Submissions", subs.length],
                      ["Cards", minted.length],
                      ["Season W-D-L", `${house.record.w}-${house.record.d}-${house.record.l}`],
                    ].map(([k, v]) => (
                      <div key={String(k)}>
                        <p className="eyebrow">{k}</p>
                        <p className="display mt-1 text-2xl text-ink-high">{v}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Submissions */}
                <section>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">Submissions</p>
                      <h2 className="display text-3xl text-ink-high">Where every sample is</h2>
                    </div>
                    <span className="rounded-full border border-hair px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low" title="Submission wizard ships in Phase 1">
                      + New submission
                    </span>
                  </div>
                  <ol className="space-y-4">
                    {subs.map((s) => {
                      const ch = challenges.find((c) => c.slug === s.challengeSlug);
                      const idx = PIPELINE.indexOf(s.stage);
                      const o = organism(s.organism);
                      return (
                        <li key={s.id} className="rounded-2xl border border-hair bg-panel p-5">
                          <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
                            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                              {s.stage === "incubating" ? <LivePlate art={s.art} className="h-full w-full" /> : <PlateArt art={s.art} animate={false} className="h-full w-full" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                {s.stage === "incubating" ? <Badge tone="live">Incubating · live</Badge> : s.stage === "published" ? <Badge tone="gold">Published</Badge> : <Badge>{LABEL[s.stage]}</Badge>}
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">{s.kind} · {s.id}</span>
                              </div>
                              <h3 className="display mt-2 text-2xl text-ink-high">
                                <span style={{ color: o.accent }}>{o.glyph}</span> {s.accession} “{s.name}”
                              </h3>
                              <p className="font-mono text-[11px] text-ink-mid">
                                <em>{o.name}</em> ·{" "}
                                <Link href={`/challenges/${s.challengeSlug}/`} className="text-ink-high hover:text-foil-b">
                                  {ch?.name}
                                </Link>
                              </p>

                              {/* Stepper */}
                              <ol className="mt-4 flex flex-wrap gap-1" aria-label="Pipeline">
                                {PIPELINE.map((st, i) => {
                                  const done = i < idx;
                                  const cur = i === idx;
                                  return (
                                    <li
                                      key={st}
                                      className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${cur ? "border-strep/60 bg-strep/10 text-strep" : done ? "border-hair bg-white/5 text-ink-mid" : "border-hair/60 text-ink-low/60"}`}
                                    >
                                      {done ? "✓ " : ""}
                                      {LABEL[st]}
                                    </li>
                                  );
                                })}
                              </ol>

                              {/* Log */}
                              <details className="mt-4 group" open={s.stage === "incubating"}>
                                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low hover:text-ink-high">
                                  Event log · {s.events.length}
                                </summary>
                                <ol className="mt-3 space-y-1.5 border-l border-hair pl-4">
                                  {[...s.events].reverse().map((e) => (
                                    <li key={e.stage + e.at} className="grid gap-x-4 font-mono text-[11px] sm:grid-cols-[9rem_8rem_1fr]">
                                      <span className="tabular-nums text-ink-low">{fmt(e.at)}</span>
                                      <span className="text-ink-high">{LABEL[e.stage]}</span>
                                      <span className="text-ink-mid">
                                        {e.actor}
                                        {e.artefact && <span className="text-ink-low"> · {e.artefact}</span>}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              </details>

                              {s.stage === "incubating" && (
                                <Link href="/watch/" className="mt-4 inline-block rounded-full bg-ink-high px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-void hover:bg-white">
                                  Watch your plates live →
                                </Link>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                {/* Cards */}
                {minted.length > 0 && (
                  <section>
                    <p className="eyebrow">Minted</p>
                    <h2 className="display mb-4 text-3xl text-ink-high">Your cards</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {minted.map((c) => (
                        <FoilCard key={c.id} card={c} house={houses.find((h) => h.slug === c.houseSlug)} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </Gate>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
