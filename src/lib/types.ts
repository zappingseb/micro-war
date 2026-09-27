/**
 * MicroWar domain types.
 *
 * Deliberately close to PLAN.md §7 so the mock backend can be swapped for a
 * real API without reshaping the UI.
 */

export type OrganismId = "ecoli" | "strep" | "pseudo" | "acineto";

export interface Organism {
  id: OrganismId;
  /** Full binomial, italicised in the UI. */
  name: string;
  short: string;
  /** Non-colour redundant signal — colour is never the only cue. */
  glyph: string;
  accent: string;
  /** Why this colour, in one line. Shown as a tooltip on the organism key. */
  colourRationale: string;
  role: string;
}

export type TrackId =
  | "product-titer"
  | "antibiotic-titer"
  | "chroma"
  | "arena"
  | "media-cup"
  | "robustness"
  | "sprint"
  | "purity";

export interface Track {
  id: TrackId;
  name: string;
  objective: string;
  readout: string;
  /** Unit shown on leaderboards and match scores. */
  unit: string;
  instrument: string;
}

export type ChallengeStatus = "open" | "running" | "sealed" | "closed" | "upcoming";

/** What the entrant supplies; the other half is fixed by the organizer. */
export type SubmissionMode = "strain" | "media" | "pairing";

export interface Challenge {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  track: TrackId;
  organism: OrganismId;
  status: ChallengeStatus;
  submissionMode: SubmissionMode;
  /** ISO date the submission window closes. */
  closesAt: string;
  sealedRevealAt: string;
  entrants: number;
  houses: number;
  plates: number;
  prize: string;
  sponsor?: string;
  summary: string;
  /** Plain-language scoring description; the full formula lives on /scoring. */
  scoring: string;
  publicConditions: number;
  sealedConditions: number;
  replicateFloor: number;
  art: PlateArt;
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "mythic" | "legendary";

export interface StatLine {
  titer: number;
  inhibition: number;
  growth: number;
  robust: number;
  chroma: number;
}

/** Parameters for the procedurally-drawn plate artwork (see PlateArt component). */
export interface PlateArt {
  /** Agar base colour. */
  agar: string;
  /** Colony / pigment colour. */
  colony: string;
  /** Secondary pigment for ring or halo structures. */
  accent: string;
  /** Growth pattern. */
  pattern: "colonies" | "swarm" | "halo" | "rings" | "lawn";
  /** Deterministic seed so the same card always renders the same plate. */
  seed: number;
}

export interface Card {
  id: string;
  accession: string;
  name: string;
  organism: OrganismId;
  houseSlug: string;
  season: number;
  rarity: Rarity;
  edition: string;
  /** Biosafety containment class, displayed on every card. See PLAN.md §12. */
  bsl: "BSL-1" | "BSL-2";
  /** Derived from measured phenotype, not chosen by the lab. */
  keywords: string[];
  stats: StatLine;
  flavour: string;
  licence: string;
  art: PlateArt;
  /** Accession of the parent strain, for the lineage view. */
  parent?: string;
  /** Populated when the card's data has been cited — unlocks Legendary. */
  citation?: string;
}

export interface MediaCard {
  id: string;
  accession: string;
  name: string;
  houseSlug: string;
  /** The "mana cost" analogue: component count + reproducibility difficulty. */
  complexity: number;
  base: string;
  carbon: string;
  nitrogen: string;
  ph: number;
  agarPercent: number;
  supplements: string[];
  /** Cost per litre in EUR — a cheap defined medium beating a rich one wins. */
  costPerLitre: number;
  reproducibility: number;
  flavour: string;
}

export interface House {
  slug: string;
  name: string;
  /** The real institution. Labelled as unaffiliated until a lab signs up. */
  institution: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  founded: number;
  motto: string;
  primary: string;
  secondary: string;
  signatureOrganism: OrganismId;
  pi: string;
  members: number;
  elo: number;
  division: "I" | "II";
  trophies: string[];
  record: { p: number; w: number; d: number; l: number };
}

export interface TableRow {
  houseSlug: string;
  p: number;
  w: number;
  d: number;
  l: number;
  /** "Goals" are the track metric — mm of halo, CFU, whatever the track scores. */
  gf: number;
  ga: number;
  pts: number;
  form: ("W" | "D" | "L")[];
}

export interface Group {
  id: string;
  name: string;
  rows: TableRow[];
}

export type FixtureStatus = "scheduled" | "live" | "final" | "void";

export interface Fixture {
  id: string;
  competition: string;
  group: string;
  matchday: number;
  status: FixtureStatus;
  home: FixtureSide;
  away: FixtureSide;
  track: TrackId;
  /** Hours into the incubation run; drives the timelapse scrubber. */
  elapsedHours: number;
  totalHours: number;
  kickoff: string;
  replicates: number;
  controlDrift: number;
  commentary: CommentaryEntry[];
}

export interface FixtureSide {
  houseSlug: string;
  cardId: string;
  score: number;
  cfu: number;
  mumax: number;
  /** Kinetic curve samples, one per imaging interval. */
  curve: number[];
}

export interface CommentaryEntry {
  at: string;
  text: string;
  kind: "event" | "void" | "note" | "score";
}

export interface LeaderboardEntry {
  rank: number;
  delta: number;
  houseSlug: string;
  cardId: string;
  score: number;
  ci: number;
  /** Sealed-panel result is withheld until the reveal. */
  sealed: number | null;
  replicates: number;
}

export interface Stream {
  id: string;
  title: string;
  channel: string;
  live: boolean;
  viewers: number;
  /** "ambient" is the 24/7 incubator-rack timelapse feed. */
  kind: "match" | "ambient" | "reveal" | "howto" | "jury";
  houseSlug?: string;
  startsAt: string;
  art: PlateArt;
}

export interface TickerItem {
  id: string;
  houseSlug: string;
  text: string;
  value: string;
  direction: "up" | "down" | "flat";
}

export interface Season {
  number: number;
  name: string;
  houses: number;
  continents: number;
  plates: number;
  /** ISO timestamp the sealed panel opens — drives the hero countdown. */
  sealedOpensAt: string;
  strapline: string;
}
