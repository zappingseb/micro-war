import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { LoginCards } from "@/components/LoginCards";

export const metadata: Metadata = { title: "Log in" };

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
        <div className="mt-10">
          <LoginCards />
        </div>
        <p className="mt-8 max-w-2xl font-mono text-[11px] leading-relaxed text-ink-low">
          A spectator account upgrades to participant later without losing badges or prediction history. This is a static demo: the mode is remembered in your browser and nothing is verified.
        </p>
      </Container>
    </main>
  );
}
