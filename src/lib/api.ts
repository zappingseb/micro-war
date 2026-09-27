/**
 * The mock backend — the ONLY module that knows where data comes from.
 *
 * Every function is async and carries a small simulated latency so loading
 * states are built now and the call sites are already shaped for a real
 * network. Swapping to a live API in Phase 1 is a one-file change (PLAN.md §13.1).
 */
import {
  CARDS,
  CHALLENGES,
  FIXTURES,
  HOUSES,
  ORGANISMS,
  SEASON,
  STREAMS,
  TICKER,
  TRACKS,
} from "./fixtures";
import type {
  Card,
  Challenge,
  Fixture,
  House,
  Organism,
  OrganismId,
  Season,
  Stream,
  TickerItem,
  Track,
  TrackId,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const latency = () => delay(20 + Math.random() * 60);

export async function getSeason(): Promise<Season> {
  await latency();
  return SEASON;
}

export async function listChallenges(filter?: { status?: Challenge["status"] }): Promise<Challenge[]> {
  await latency();
  return filter?.status ? CHALLENGES.filter((c) => c.status === filter.status) : CHALLENGES;
}

export async function getChallenge(slug: string): Promise<Challenge | null> {
  await latency();
  return CHALLENGES.find((c) => c.slug === slug) ?? null;
}

export async function listHouses(): Promise<House[]> {
  await latency();
  return [...HOUSES].sort((a, b) => b.elo - a.elo);
}

export async function getHouse(slug: string): Promise<House | null> {
  await latency();
  return HOUSES.find((h) => h.slug === slug) ?? null;
}

export async function listCards(filter?: { rarity?: Card["rarity"][] }): Promise<Card[]> {
  await latency();
  return filter?.rarity ? CARDS.filter((c) => filter.rarity!.includes(c.rarity)) : CARDS;
}

export async function getCard(id: string): Promise<Card | null> {
  await latency();
  return CARDS.find((c) => c.id === id) ?? null;
}

export async function listFixtures(competition: string): Promise<Fixture[]> {
  await latency();
  return FIXTURES.filter((f) => f.competition === competition);
}

export async function getFixture(id: string): Promise<Fixture | null> {
  await latency();
  return FIXTURES.find((f) => f.id === id) ?? null;
}

export async function listStreams(): Promise<Stream[]> {
  await latency();
  return STREAMS;
}

export async function getTicker(): Promise<TickerItem[]> {
  await latency();
  return TICKER;
}

/** Reference data is synchronous — it is part of the game's rules, not its state. */
export function organism(id: OrganismId): Organism {
  return ORGANISMS[id];
}

export function track(id: TrackId): Track {
  return TRACKS[id];
}

export function houseBySlug(houses: House[], slug: string): House | undefined {
  return houses.find((h) => h.slug === slug);
}
