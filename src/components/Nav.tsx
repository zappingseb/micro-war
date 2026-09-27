import Link from "next/link";
import { Countdown } from "./Countdown";
import { Container } from "./ui";

const LINKS = [
  ["Challenges", "#drops"],
  ["Boards", "#board"],
  ["Houses", "#houses"],
  ["Cards", "#vault"],
  ["Watch", "#watch"],
  ["Instrument", "#instrument"],
] as const;

export function Nav({ sealedOpensAt, seasonLabel }: { sealedOpensAt: string; seasonLabel: string }) {
  return (
    <>
      <div className="border-b border-hair bg-panel text-center font-mono text-[11px] tracking-[0.14em] text-ink-mid">
        <Container className="flex items-center justify-center gap-2 py-1.5">
          <span className="uppercase">{seasonLabel} sealed panel opens in</span>
          <Countdown target={sealedOpensAt} compact />
          <Link href="#drops" className="text-ink-high hover:text-foil-b">
            →
          </Link>
        </Container>
      </div>
      <header className="sticky top-0 z-40 border-b border-hair bg-void/85 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-6">
          <Link href="/" className="display text-2xl tracking-[-0.02em] text-ink-high">
            MICRO<span className="foil-text">WAR</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid transition hover:text-ink-high">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-ink-low sm:inline">◉ spectator</span>
            <Link
              href="/login"
              className="rounded-full bg-ink-high px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
            >
              Log in
            </Link>
          </div>
        </Container>
      </header>
    </>
  );
}
