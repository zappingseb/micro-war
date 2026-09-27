import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Log in" };

const MODES = [
  {
    glyph: "◉",
    title: "Spectator",
    blurb: "Watch the league. Follow houses, predict brackets, browse the card vault.",
    note: "No verification needed.",
    rails: "e-mail magic link · social",
    cta: "Continue as spectator",
    foil: false,
  },
  {
    glyph: "◈",
    title: "Participant",
    blurb: "Enter your strains. Submit media recipes. Claim your lab's crest.",
    note: "Requires institutional verification and a biosafety attestation.",
    rails: "ORCID · institutional SSO (eduGAIN) · invite code",
    cta: "Continue as participant",
    foil: true,
  },
];

/** The Login → mode split from PLAN.md §1.1: two facing foil cards. */
export default function LoginPage() {
  return (
    <main className="grain relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(123,92,255,0.18),transparent_55%)]" />
      <Container className="relative flex flex-1 flex-col justify-center py-16">
        <Link href="/" className="display self-start text-2xl text-ink-high">
          MICRO<span className="foil-text">WAR</span>
        </Link>
        <p className="eyebrow mt-10">Log in</p>
        <h1 className="display mt-2 text-5xl text-ink-high sm:text-6xl">Enter as</h1>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {MODES.map((m) => (
            <article key={m.title} className={`rounded-xl p-[1.5px] ${m.foil ? "foil-border" : "bg-hair"}`}>
              <div className="flex h-full flex-col rounded-[10px] bg-panel p-8">
                <span className={`display text-6xl ${m.foil ? "foil-text" : "text-ink-low"}`}>{m.glyph}</span>
                <h2 className="display mt-4 text-4xl text-ink-high">{m.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-ink-mid">{m.blurb}</p>
                <p className="mt-4 font-mono text-[11px] text-ink-low">{m.note}</p>
                <p className="mt-6 border-t border-hair pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low">{m.rails}</p>
                <button
                  type="button"
                  className="mt-6 rounded-full bg-ink-high py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
                >
                  {m.cta}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-2xl font-mono text-[11px] leading-relaxed text-ink-low">
          A spectator account upgrades to participant later without losing badges or prediction history. This is a static demo: neither button authenticates yet.
        </p>
      </Container>
    </main>
  );
}
