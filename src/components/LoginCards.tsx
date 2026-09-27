"use client";

import { login, type Mode } from "@/lib/session";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MODES: { mode: Mode; glyph: string; title: string; blurb: string; note: string; rails: string; foil: boolean }[] = [
  {
    mode: "spectator",
    glyph: "◉",
    title: "Spectator",
    blurb: "Watch the league. Follow houses, predict brackets, browse the card vault, open sealed results.",
    note: "No verification needed.",
    rails: "e-mail magic link · social",
    foil: false,
  },
  {
    mode: "participant",
    glyph: "◈",
    title: "Participant",
    blurb: "Enter your strains. Submit media recipes. Claim your lab's crest. Track every sample you ship.",
    note: "Requires institutional verification and a biosafety attestation.",
    rails: "ORCID · institutional SSO (eduGAIN) · invite code",
    foil: true,
  },
];

/** The two facing cards of the Login → mode split (PLAN.md §1.1). */
export function LoginCards() {
  const enter = (mode: Mode) => {
    login(mode);
    const next = new URLSearchParams(window.location.search).get("next");
    // `next` is an in-app path without the basePath; a full navigation avoids
    // the client router fetching payloads that a static host may not serve.
    const safe = next && /^\/[a-z0-9\-\/]*$/i.test(next) && !next.startsWith("//") ? next : null;
    window.location.assign(BASE + (safe ?? (mode === "participant" ? "/account/" : "/challenges/titer-cup-ii/")));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {MODES.map((m) => (
        <article key={m.mode} className={`rounded-xl p-[1.5px] ${m.foil ? "foil-border" : "bg-hair"}`}>
          <div className="flex h-full flex-col rounded-[10px] bg-panel p-8">
            <span className={`display text-6xl ${m.foil ? "foil-text" : "text-ink-low"}`}>{m.glyph}</span>
            <h2 className="display mt-4 text-4xl text-ink-high">{m.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-mid">{m.blurb}</p>
            <p className="mt-4 font-mono text-[11px] text-ink-low">{m.note}</p>
            <p className="mt-6 border-t border-hair pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low">{m.rails}</p>
            <button
              type="button"
              onClick={() => enter(m.mode)}
              className="mt-6 rounded-full bg-ink-high py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
            >
              Continue as {m.title.toLowerCase()}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
