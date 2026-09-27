"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allows, useSession, type Mode } from "@/lib/session";

/**
 * Client-side access gate. Renders children for an allowed session mode,
 * otherwise a locked panel with a blurred glimpse and a login prompt that
 * returns the reader here afterwards.
 */
export function Gate({ requires, title, blurb, children }: { requires: Mode; title: string; blurb: string; children: React.ReactNode }) {
  const state = useSession();
  const path = usePathname();

  if (state === "pending") return <div className="min-h-[40vh]" aria-busy="true" />;
  if (allows(state, requires)) return <>{children}</>;

  const glyph = requires === "participant" ? "◈" : "◉";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-hair">
      <div className="pointer-events-none max-h-[28rem] select-none overflow-hidden opacity-60 blur-[6px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-void/40 via-void/85 to-void">
        <div className="mx-4 max-w-md rounded-2xl border border-hair bg-panel p-8 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          <span className="display foil-text text-5xl">{glyph}</span>
          <p className="eyebrow mt-3">{requires === "participant" ? "Participants only" : "Spectators & participants"}</p>
          <h2 className="display mt-2 text-3xl text-ink-high">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-mid">{blurb}</p>
          <Link
            href={`/login/?next=${encodeURIComponent(path)}`}
            className="mt-6 inline-block rounded-full bg-ink-high px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
          >
            Log in as {requires}
          </Link>
          <p className="mt-3 font-mono text-[10px] text-ink-low">Free · no verification for spectators</p>
        </div>
      </div>
    </div>
  );
}
