/**
 * Challenge results: replicate-level data plus the inference on top of it.
 *
 * The demo has no wet-lab data, so replicates are drawn deterministically
 * (seeded) from normal distributions with per-entry means and spreads. The
 * statistics run on those draws exactly as they would on real assay output:
 * nothing below is looked up, everything is computed from the replicates.
 */
import type { Challenge, House } from "./types";
import {
  anova,
  holm,
  mulberry32,
  normal,
  ols,
  stars,
  summarise,
  welch,
  type AnovaResult,
  type Regression,
  type Summary,
  type WelchResult,
} from "./stats";

export interface ResultEntry {
  houseSlug: string;
  accession: string;
  name: string;
  publicReps: number[];
  sealedReps: number[];
  public: Summary;
  sealed: Summary;
  /** Welch's t-test of the sealed replicates against the reference strain. */
  vsRef: WelchResult;
  /** Holm–Bonferroni adjusted p-value across all entries. */
  pAdj: number;
  stars: string;
  /** Sign of the significant difference from the reference, or neutral. */
  verdict: "above" | "below" | "ns";
  publicRank: number;
  sealedRank: number;
  /** Sealed / public mean: below ~0.85 indicates fitting to the public condition. */
  ratio: number;
}

export interface ChallengeResults {
  slug: string;
  unit: string;
  reference: { name: string; reps: number[]; summary: Summary };
  entries: ResultEntry[];
  anova: AnovaResult;
  /** OLS of sealed mean on public mean, one point per entry. */
  regression: Regression;
  /** Entries whose sealed mean fell below the regression's 95% prediction band. */
  overfit: string[];
}

const STRAIN_NAMES = [
  "Purple Reign", "Deep Violet", "Kettle", "Zymurgist's Pride", "Lampblack", "Bruise",
  "Nightshade", "Indigo Child", "Violet Hour", "Amethyst", "Plum Line", "Ink Well",
  "Mulberry", "Thistle", "Heliotrope", "Wisteria", "Orchid Run", "Damson",
  "Lilac Sprint", "Aubergine", "Periwinkle", "Grape Shot", "Iris", "Mauve Five",
];

const MEAN_BY_HOUSE: Record<string, [publicMean: number, sealedFactor: number]> = {
  "zurich-zymurgists": [262, 0.97],
  davidoffs: [228, 0.9],
  "tsinghua-titers": [281, 0.66],
  "lyngby-lysogens": [244, 0.94],
  "wageningen-wildtypes": [231, 0.91],
  "cam-conjugators": [226, 0.95],
  "powai-plasmids": [238, 0.72],
  "goteborg-glycolytics": [205, 0.93],
};

export function buildResults(challenge: Challenge, houses: House[]): ChallengeResults {
  const rnd = mulberry32(challenge.id.length * 1000 + challenge.slug.length * 77 + 4242);
  const nPub = challenge.replicateFloor;
  const nSeal = challenge.replicateFloor;

  const refReps = Array.from({ length: nPub }, () => normal(rnd, 150, 9));
  const reference = { name: "Reference chassis (vioABCDE, unoptimised)", reps: refReps, summary: summarise(refReps) };

  const base = houses.slice(0, 24).map((h, i) => {
    const tuned = MEAN_BY_HOUSE[h.slug];
    const publicMean = tuned ? tuned[0] : 105 + rnd() * 120;
    const factor = tuned ? tuned[1] : 0.8 + rnd() * 0.2;
    const sdPub = 6 + rnd() * 9;
    const sdSeal = sdPub * (1.05 + rnd() * 0.3);
    const publicReps = Array.from({ length: nPub }, () => normal(rnd, publicMean, sdPub));
    const sealedReps = Array.from({ length: nSeal }, () => normal(rnd, publicMean * factor, sdSeal));
    const accession = `ECO-${(i * 7 + 12) % 97 + 1}`;
    return { houseSlug: h.slug, accession: h.slug === "zurich-zymurgists" ? "ECO-77" : accession, name: STRAIN_NAMES[i], publicReps, sealedReps };
  });

  const tests = base.map((e) => welch(e.sealedReps, reference.reps));
  const adj = holm(tests.map((t) => t.p));
  const pubOrder = [...base.keys()].sort((a, b) => summarise(base[b].publicReps).mean - summarise(base[a].publicReps).mean);
  const sealOrder = [...base.keys()].sort((a, b) => summarise(base[b].sealedReps).mean - summarise(base[a].sealedReps).mean);

  const entries: ResultEntry[] = base.map((e, i) => {
    const pub = summarise(e.publicReps);
    const seal = summarise(e.sealedReps);
    const pAdj = adj[i];
    const verdict: ResultEntry["verdict"] = pAdj < 0.05 ? (tests[i].diff > 0 ? "above" : "below") : "ns";
    return {
      ...e,
      public: pub,
      sealed: seal,
      vsRef: tests[i],
      pAdj,
      stars: stars(pAdj),
      verdict,
      publicRank: pubOrder.indexOf(i) + 1,
      sealedRank: sealOrder.indexOf(i) + 1,
      ratio: seal.mean / pub.mean,
    };
  });
  entries.sort((a, b) => a.sealedRank - b.sealedRank);

  const xs = entries.map((e) => e.public.mean);
  const ys = entries.map((e) => e.sealed.mean);
  const regression = ols(xs, ys);
  const overfit = entries.filter((e) => e.sealed.mean < regression.predict(e.public.mean) - regression.piBand(e.public.mean)).map((e) => e.houseSlug);

  return {
    slug: challenge.slug,
    unit: "mg/L",
    reference,
    entries,
    anova: anova(entries.map((e) => e.sealedReps)),
    regression,
    overfit,
  };
}
