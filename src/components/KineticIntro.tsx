"use client";

import { useEffect, useRef } from "react";
import { PlateArt } from "./PlateArt";

const WORDS = ["PYOCYANIN", "VIOLACEIN", "PYOVERDINE"];

/**
 * Scroll-driven manifesto between the hero and the drops. The section is
 * tall and its inner panel is sticky, so scrolling plays a scene: plates
 * drift at different depths, lines slide and skew past each other, and a
 * pigment word tears apart letter by letter. All motion is a function of one
 * CSS variable (--p, 0→1) written from a rAF scroll listener; the CSS does
 * the rest. Nothing moves under prefers-reduced-motion.
 */
export function KineticIntro() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="kinetic relative h-[260vh] border-b border-hair" aria-label="Manifesto">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Depth layers */}
        <div className="k-plate k-plate-a pointer-events-none absolute -left-[10vw] top-[10vh] w-[38vw] opacity-70">
          <PlateArt art={{ agar: "#160a24", colony: "#a86ad8", accent: "#2fe6d6", pattern: "swarm", seed: 61 }} animate={false} className="w-full" />
        </div>
        <div className="k-plate k-plate-b pointer-events-none absolute right-[4vw] top-[55vh] w-[26vw] opacity-80">
          <PlateArt art={{ agar: "#0a1a24", colony: "#2fe6d6", accent: "#b8ff3c", pattern: "colonies", seed: 62 }} animate={false} className="w-full" />
        </div>
        <div className="k-plate k-plate-c pointer-events-none absolute left-[55vw] -top-[8vh] w-[18vw] opacity-60">
          <PlateArt art={{ agar: "#1c0a10", colony: "#ff3b5c", accent: "#ffb020", pattern: "halo", seed: 63 }} animate={false} className="w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="k-line k-line-1 display text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.9] text-ink-high">
            Not a war.
          </p>
          <p className="k-line k-line-2 display text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.9] text-ink-high">
            A <span className="foil-text">league.</span>
          </p>
          <p className="k-line k-line-3 display k-outline text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.9]">
            Same plates. Same optics.
          </p>

          <div className="k-word mt-8 flex flex-wrap gap-x-[0.02em]" aria-label={WORDS[0]}>
            {WORDS[0].split("").map((ch, i) => (
              <span
                key={i}
                className="k-letter display inline-block text-[clamp(2.4rem,8vw,6.5rem)] leading-none"
                style={{ "--i": i - 4 } as React.CSSProperties}
                aria-hidden
              >
                {ch}
              </span>
            ))}
          </div>

          <p className="k-caption mt-8 max-w-xl text-base leading-relaxed text-ink-mid sm:text-lg">
            Every entry is imaged on the same instrument, scored by the same model, and published with its raw plates. The card is just the fastest way to read a phenotype.
          </p>
        </div>

        <div className="k-marquee pointer-events-none absolute bottom-6 left-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-ink-low">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="mx-8">
              submit → ship → image → score → publish → cite
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
