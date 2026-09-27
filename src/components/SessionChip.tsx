"use client";

import Link from "next/link";
import { logout, useSession } from "@/lib/session";

export function SessionChip() {
  const state = useSession();
  if (state === "pending") return <span className="h-8 w-24" aria-hidden />;
  if (!state) {
    return (
      <Link
        href="/login/"
        className="rounded-full bg-ink-high px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-void transition hover:bg-white"
      >
        Log in
      </Link>
    );
  }
  const participant = state === "participant";
  return (
    <span className="flex items-center gap-2">
      <Link
        href={participant ? "/account/" : "/challenges/titer-cup-ii/"}
        className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${participant ? "border-foil-a/60 text-foil-b" : "border-hair text-ink-mid"}`}
      >
        {participant ? "◈ participant" : "◉ spectator"}
      </Link>
      <button type="button" onClick={logout} className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low hover:text-ink-high">
        Log out
      </button>
    </span>
  );
}
