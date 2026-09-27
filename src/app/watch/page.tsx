import type { Metadata } from "next";
import { getSeason, listCards, listFixtures, listHouses, listStreams, organism, track } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/sections";
import { LiveMatch } from "@/components/LiveMatch";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Watch live" };

export default async function WatchPage() {
  const [season, fixtures, houses, cards, streams] = await Promise.all([getSeason(), listFixtures("season-iii"), listHouses(), listCards(), listStreams()]);
  const fixture = fixtures.find((f) => f.status === "live") ?? fixtures[0];
  const home = houses.find((h) => h.slug === fixture.home.houseSlug)!;
  const away = houses.find((h) => h.slug === fixture.away.houseSlug)!;
  const hc = cards.find((c) => c.id === fixture.home.cardId)!;
  const ac = cards.find((c) => c.id === fixture.away.cardId)!;
  const groupC = ["davidoffs", "lyngby-lysogens", "ghent-gradients", "parkville-phages"].map((s) => houses.find((h) => h.slug === s)!);
  const table = groupC.map((h, i) => ({ house: h, p: 2, w: 2 - i > 0 ? 2 - i : 0, d: i === 2 ? 1 : 0, l: i === 3 ? 2 : i === 2 ? 1 : 0, pts: [6, 3, 1, 0][i] }));

  return (
    <>
      <Nav sealedOpensAt={season.sealedOpensAt} seasonLabel={`Season ${["", "I", "II", "III"][season.number]}`} />
      <main className="flex-1 py-10">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Match Day {fixture.matchday} Live · Group {fixture.group}</p>
              <h1 className="display text-4xl text-ink-high sm:text-5xl">
                {home.name} <span className="text-ink-low">v</span> {away.name}
              </h1>
              <p className="mt-1 font-mono text-[11px] text-ink-low">{track(fixture.track).name} · {track(fixture.track).readout} · twitch.tv/microwar</p>
            </div>
          </div>
          <LiveMatch
            fixture={fixture}
            home={{ house: home, card: hc, accent: organism(hc.organism).accent }}
            away={{ house: away, card: ac, accent: organism(ac.organism).accent }}
            unit={track(fixture.track).unit}
            streams={streams}
            table={table}
          />
        </Container>
      </main>
      <Footer />
    </>
  );
}
