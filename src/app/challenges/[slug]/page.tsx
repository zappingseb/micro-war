import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallenge, getResults, getSeason, listChallenges, listHouses, organism, track } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections";
import { PlateArt } from "@/components/PlateArt";
import { Gate } from "@/components/Gate";
import { ResultsView } from "@/components/ResultsView";
import { Badge, Container, OrganismTag, fmtDate } from "@/components/ui";

export async function generateStaticParams() {
  const all = await listChallenges();
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/challenges/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getChallenge(slug);
  return { title: c?.name ?? "Challenge" };
}

const MODE_LABEL = { strain: "You submit a strain", media: "You submit a medium", pairing: "You submit a pairing" } as const;

export default async function ChallengePage({ params }: PageProps<"/challenges/[slug]">) {
  const { slug } = await params;
  const [season, challenge, results, houses] = await Promise.all([getSeason(), getChallenge(slug), getResults(slug), listHouses()]);
  if (!challenge || !results) notFound();

  const o = organism(challenge.organism);
  const t = track(challenge.track);
  const closed = challenge.status === "closed";

  return (
    <>
      <Nav sealedOpensAt={season.sealedOpensAt} seasonLabel={`Season ${["", "I", "II", "III"][season.number]}`} />
      <main className="flex-1">
        {/* Header */}
        <section className="grain relative overflow-hidden border-b border-hair">
          <div className="pointer-events-none absolute -right-[8vw] top-1/2 w-[46vw] max-w-[620px] -translate-y-1/2 opacity-80">
            <PlateArt art={challenge.art} className="w-full" title={`${challenge.name} plate`} />
          </div>
          <Container className="relative py-14 sm:py-20">
            <Link href="/challenges/" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low hover:text-ink-high">
              ← Challenges
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {closed ? <Badge tone="gold">Closed · results</Badge> : challenge.status === "open" ? <Badge tone="foil">Open</Badge> : <Badge>Coming soon</Badge>}
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low">{t.name} · {t.unit}</span>
            </div>
            <h1 className="display mt-3 max-w-3xl text-5xl text-ink-high sm:text-7xl">{challenge.name}</h1>
            <p className="mt-2 text-lg text-ink-mid">{challenge.subtitle}</p>
            <div className="mt-4">
              <OrganismTag id={challenge.organism} />
            </div>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-mid">{challenge.summary}</p>
            <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-4 font-mono text-[11px] sm:grid-cols-4">
              {[
                ["Closes", fmtDate(challenge.closesAt)],
                ["Sealed reveal", fmtDate(challenge.sealedRevealAt)],
                ["Entrants", String(challenge.entrants || "—")],
                ["Plates", challenge.plates.toLocaleString("en")],
                ["Panel", `${challenge.publicConditions} public + ${challenge.sealedConditions} sealed`],
                ["Replicates", `n ≥ ${challenge.replicateFloor}`],
                ["Mode", MODE_LABEL[challenge.submissionMode]],
                ["Prize", challenge.prize],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1 text-ink-high" style={k === "Prize" ? { color: o.accent } : undefined}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 font-mono text-[11px] text-ink-low">Scoring · {challenge.scoring}{challenge.sponsor ? ` · Sponsor · ${challenge.sponsor}` : ""}</p>
            {!closed && (
              <Link href="/account/" className="mt-8 inline-block rounded-full bg-ink-high px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white">
                {challenge.status === "open" ? `Enter · ${challenge.submissionMode}` : "Notify me"}
              </Link>
            )}
          </Container>
        </section>

        <Container className="py-14">
          {closed ? (
            <>
              <div className="reveal mb-8">
                <p className="eyebrow">Sealed panel revealed {fmtDate(challenge.sealedRevealAt)}</p>
                <h2 className="display text-4xl text-ink-high">Results</h2>
              </div>
              <Gate requires="spectator" title="Sealed results are for the league" blurb="Public plates are visible to everyone. The sealed panel, the tests and the regression are published to spectators and participants.">
                <ResultsView results={results} houses={houses} challenge={challenge} />
              </Gate>
            </>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <section>
                <p className="eyebrow">Public leaderboard · live</p>
                <h2 className="display mb-4 text-3xl text-ink-high">{challenge.status === "open" ? "Standing now" : "No entries yet"}</h2>
                {challenge.status === "open" && (
                  <div className="overflow-x-auto rounded-2xl border border-hair">
                    <table className="w-full min-w-[32rem] font-mono text-[11px]">
                      <thead className="bg-panel text-left text-ink-low">
                        <tr>
                          {["#", "House", "Strain", `Public (${t.unit})`, "n", "Sealed"].map((h) => (
                            <th key={h} className="px-3 py-2 font-normal">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...results.entries]
                          .sort((a, b) => a.publicRank - b.publicRank)
                          .slice(0, 10)
                          .map((e) => (
                            <tr key={e.houseSlug} className="border-t border-hair text-ink-mid">
                              <td className="px-3 py-2 text-ink-high">{e.publicRank}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-ink-high">{houses.find((h) => h.slug === e.houseSlug)?.name}</td>
                              <td className="whitespace-nowrap px-3 py-2">{e.accession}</td>
                              <td className="whitespace-nowrap px-3 py-2 tabular-nums">{(e.public.mean / 6).toFixed(1)} ± {(e.public.ci95 / 6).toFixed(1)}</td>
                              <td className="px-3 py-2">{e.public.n}</td>
                              <td className="px-3 py-2 text-ink-low">🔒 {fmtDate(challenge.sealedRevealAt)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-3 font-mono text-[11px] text-ink-low">Public means with 95% CI. Sealed scores are withheld until the reveal and decide the winner.</p>
              </section>
              <aside className="space-y-3">
                {[
                  ["Two panels", `${challenge.publicConditions} public condition${challenge.publicConditions > 1 ? "s" : ""} score live. ${challenge.sealedConditions} sealed conditions run after close and decide the podium.`],
                  ["Replicates", `Floor of ${challenge.replicateFloor} per entry and condition. Voided replicates are excluded before analysis, never after.`],
                  ["Evidence", "Every score links to its plate images, fitted curve, replicate spread, run ID and operator log."],
                  ["Safety", "Default entries are BSL-1 surrogates. Priority pathogens run only at accredited facilities."],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-hair bg-panel p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foil-b">{k}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">{v}</p>
                  </div>
                ))}
                <Link href="/challenges/titer-cup-ii/" className="block rounded-xl border border-gold/40 bg-panel p-4 transition hover:border-gold">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">See a finished one</p>
                  <p className="mt-1.5 text-sm text-ink-mid">Titer Cup II · full statistics, sealed panel revealed.</p>
                </Link>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
