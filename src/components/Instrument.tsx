import { PlateHUD } from "./PlateHUD";
import { Badge, Container, SectionHead } from "./ui";

const DEVICES = [
  {
    name: "Smart Incubator",
    role: "Timelapse",
    body: "Plates incubate under a camera. Every plate is photographed on a fixed interval, so a match is a movie, not a single end-point photo.",
    specs: [
      ["Imaging interval", "10 min"],
      ["Run length", "24–48 h"],
      ["Output", "RGB timelapse"],
    ],
  },
  {
    name: "High-throughput Imaging",
    role: "End-point",
    body: "Stacks of plates are imaged in one pass for titer, halo and robustness panels. Same optics, same lighting, every house.",
    specs: [
      ["Panel", "public + sealed"],
      ["Replicate floor", "n ≥ 6"],
      ["Output", "calibrated stills"],
    ],
  },
  {
    name: "Discovery Platform",
    role: "Analysis",
    body: "Detection models count colonies, measure zones of inhibition and separate co-cultures. Every number carries its plate image and run ID.",
    specs: [
      ["Models", "count · halo · differential"],
      ["Status", "validated · positive · negative"],
      ["Trace", "run ID + operator log"],
    ],
  },
] as const;

const PIPELINE = ["Accessioned", "QC", "Plated", "Incubating", "Imaged", "Analysed", "Scored", "Published"];

/**
 * The instrument stack behind every score. Described in capability terms,
 * with the platform's own numbers; the vendor's datasheet is not reproduced.
 */
export function Instrument() {
  return (
    <section id="instrument" className="scroll-mt-16 border-t border-hair py-16 sm:py-20">
      <Container>
        <SectionHead eyebrow="The instrument" title="Same optics for every house" />
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-md">
            <PlateHUD art={{ agar: "#0a1a24", colony: "#2fe6d6", accent: "#b8ff3c", pattern: "colonies", seed: 473 }} className="aspect-square" />
            <div className="mt-4 flex items-center justify-between rounded-lg border border-hair bg-panel px-4 py-3 font-mono text-[11px]">
              <span className="text-ink-mid">
                SP-123-432 · <span className="text-ink-low">HT002 · Column A, Row 1</span>
              </span>
              <Badge tone="foil">Positive</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {DEVICES.map((d) => (
              <article key={d.name} className="grid gap-3 rounded-xl border border-hair bg-panel p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="eyebrow">{d.role}</p>
                  <h3 className="display mt-1 text-2xl text-ink-high">{d.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mid">{d.body}</p>
                </div>
                <dl className="grid content-start gap-1.5 font-mono text-[11px] sm:w-44 sm:border-l sm:border-hair sm:pl-4">
                  {d.specs.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-ink-low">{k}</dt>
                      <dd className="text-ink-high">{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>

        <ol className="mt-10 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className={`rounded-sm border px-2 py-1 ${i === 3 ? "border-strep/60 text-strep" : "border-hair text-ink-mid"}`}>
                {i === 3 && <span className="live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-strep" aria-hidden />}
                {step}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-ink-low" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
        <p className="mt-3 font-mono text-[11px] text-ink-low">
          Reference stack: a smart incubator with in-situ imaging, a high-throughput plate imager, and an analysis platform with colony-detection models. A participant watches their own plates live during <span className="text-strep">Incubating</span>.
        </p>
      </Container>
    </section>
  );
}
