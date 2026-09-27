import { getSeason, getTicker, listCards, listChallenges, listFixtures, listHouses, listStreams } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Board, Drops, Footer, Hero, Houses, HowItWorks, Ticker, Vault, Watch } from "@/components/sections";
import { Instrument } from "@/components/Instrument";

export default async function Home() {
  const [season, challenges, houses, cards, fixtures, streams, ticker] = await Promise.all([
    getSeason(),
    listChallenges(),
    listHouses(),
    listCards(),
    listFixtures("season-iii"),
    listStreams(),
    getTicker(),
  ]);

  const feature = challenges.find((c) => c.slug === "pyocyanin-open") ?? challenges[0];
  const featured = ["pyo-7", "acb-9", "eco-12"].map((id) => cards.find((c) => c.id === id)!).filter(Boolean);
  const seasonLabel = `Season ${["", "I", "II", "III"][season.number] ?? season.number}`;

  return (
    <>
      <Nav sealedOpensAt={season.sealedOpensAt} seasonLabel={seasonLabel} />
      <main className="flex-1">
        <Hero season={season} feature={feature} />
        <Ticker items={ticker} houses={houses} />
        <Drops challenges={challenges} />
        <Board fixtures={fixtures} houses={houses} cards={cards} />
        <Vault cards={featured} houses={houses} />
        <Instrument />
        <Watch streams={streams} />
        <Houses houses={houses} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
