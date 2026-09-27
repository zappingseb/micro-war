import type { Metadata } from "next";
import Link from "next/link";
import { getSeason, listChallenges, organism, track } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections";
import { PlateArt } from "@/components/PlateArt";
import { Badge, Container, OrganismTag, fmtDate } from "@/components/ui";
import type { Challenge } from "@/lib/types";

export const metadata: Metadata = { title: "Challenges" };

const GROUPS: { status: Challenge["status"]; title: string; blurb: string }[] = [
  { status: "open", title: "Open now", blurb: "Submissions accepted. Public plates score live." },
  { status: "upcoming", title: "Coming soon", blurb: "Announced, not yet open." },
  { status: "closed", title: "Closed · results published", blurb: "Sealed panel revealed. Full statistics for logged-in spectators." },
];

export default async function ChallengesPage() {
  const [season, challenges] = await Promise.all([getSeason(), listChallenges()]);
  return (
    <>
      <Nav sealedOpensAt={season.sealedOpensAt} seasonLabel={`Season ${["", "I", "II", "III"][season.number]}`} />
      <main className="flex-1 py-14">
        <Container>
          <p className="eyebrow">Challenges</p>
          <h1 className="display text-5xl text-ink-high sm:text-6xl">Every drop</h1>
          <p className="mt-3 max-w-xl text-ink-mid">Strain-fixed, media-fixed or open. Each runs on a public panel and a sealed panel; the sealed panel decides.</p>

          {GROUPS.map((g) => {
            const list = challenges.filter((c) => c.status === g.status);
            if (!list.length) return null;
            return (
              <section key={g.status} className="mt-14">
                <div className="reveal mb-6">
                  <h2 className="display text-3xl text-ink-high">{g.title}</h2>
                  <p className="text-sm text-ink-mid">{g.blurb}</p>
                </div>
                <ul className="grid gap-4 md:grid-cols-2">
                  {list.map((c, i) => (
                    <li key={c.id} className="reveal" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                      <Link href={`/challenges/${c.slug}/`} className="group flex gap-5 rounded-xl border border-hair bg-panel p-4 transition hover:border-ink-low">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                          <PlateArt art={c.art} animate={false} className="h-full w-full transition duration-700 group-hover:scale-110" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {c.status === "open" ? <Badge tone="foil">Open</Badge> : c.status === "closed" ? <Badge tone="gold">Results</Badge> : <Badge>Soon</Badge>}
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low">{track(c.track).name}</span>
                          </div>
                          <h3 className="display mt-2 text-2xl text-ink-high">{c.name}</h3>
                          <p className="text-sm text-ink-mid">{c.subtitle}</p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-low">
                            <OrganismTag id={c.organism} />
                            <span>{c.status === "closed" ? "revealed" : "closes"} {fmtDate(c.status === "closed" ? c.sealedRevealAt : c.closesAt)}</span>
                            <span>{c.entrants || "—"} entrants</span>
                            <span style={{ color: organism(c.organism).accent }}>{c.prize}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </Container>
      </main>
      <Footer />
    </>
  );
}
