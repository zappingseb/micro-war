import type { ChallengeResults } from "@/lib/results";
import type { Challenge, House } from "@/lib/types";
import { houseBySlug } from "@/lib/api";
import { fmtP } from "@/lib/stats";
import { BarCI } from "./charts/BarCI";
import { Scatter, type BandSample } from "./charts/Scatter";
import { Strip } from "./charts/Strip";

/**
 * The results of a closed challenge: headline figures, three charts, the
 * full table (which doubles as every chart's table view) and the methods.
 */
export function ResultsView({ results, houses, challenge }: { results: ChallengeResults; houses: House[]; challenge: Challenge }) {
  const name = (slug: string) => houseBySlug(houses, slug)?.name ?? slug;
  const winner = results.entries[0];
  const publicLeader = results.entries.find((e) => e.publicRank === 1)!;
  const reg = results.regression;

  const xs = results.entries.map((e) => e.public.mean);
  const xMin = Math.min(...xs) - 10;
  const xMax = Math.max(...xs) + 10;
  const band: BandSample[] = Array.from({ length: 41 }, (_, i) => {
    const x = xMin + ((xMax - xMin) * i) / 40;
    return { x, fit: reg.predict(x), ci: reg.ciBand(x), pi: reg.piBand(x) };
  });

  const nAbove = results.entries.filter((e) => e.verdict === "above").length;
  const nBelow = results.entries.filter((e) => e.verdict === "below").length;

  return (
    <div className="space-y-12">
      {/* Headline */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Sealed-panel winner" value={name(winner.houseSlug)} sub={`${winner.sealed.mean.toFixed(1)} ± ${winner.sealed.ci95.toFixed(1)} ${results.unit} · public rank ${winner.publicRank}`} accent />
        <Tile label="Public-panel leader" value={name(publicLeader.houseSlug)} sub={`${publicLeader.public.mean.toFixed(1)} → ${publicLeader.sealed.mean.toFixed(1)} sealed · rank ${publicLeader.sealedRank}`} />
        <Tile label="Entries vs reference" value={`${nAbove} above · ${nBelow} below`} sub={`${results.entries.length - nAbove - nBelow} not significant · Holm-adjusted α 0.05`} />
        <Tile label="One-way ANOVA (sealed)" value={`F(${results.anova.df1}, ${results.anova.df2}) = ${results.anova.f.toFixed(1)}`} sub={`p ${fmtP(results.anova.p)} · η² ${results.anova.eta2.toFixed(2)}`} />
      </div>

      {/* Chart 1 */}
      <figure className="rounded-2xl border border-hair bg-panel p-5 sm:p-6">
        <figcaption className="mb-4">
          <p className="eyebrow">Figure 1</p>
          <h3 className="display text-2xl text-ink-high">Sealed-panel titer by entry</h3>
          <p className="mt-1 max-w-3xl text-sm text-ink-mid">
            Mean of n = {winner.sealed.n} replicates with 95% confidence intervals (t-distribution). Each entry is tested against the reference chassis with Welch&apos;s t-test; p-values are Holm–Bonferroni adjusted for {results.entries.length} comparisons.
          </p>
        </figcaption>
        <BarCI
          rows={results.entries.map((e) => ({
            id: e.houseSlug,
            label: name(e.houseSlug),
            sub: `${e.accession} “${e.name}”`,
            value: e.sealed.mean,
            ci: e.sealed.ci95,
            n: e.sealed.n,
            verdict: e.verdict,
            stars: e.stars,
            pAdj: e.pAdj,
            ratio: e.ratio,
          }))}
          reference={{ value: results.reference.summary.mean, ci: results.reference.summary.ci95, label: "reference" }}
          unit={results.unit}
          labelled={results.entries.slice(0, 3).map((e) => e.houseSlug)}
        />
      </figure>

      {/* Chart 2 */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <figure className="rounded-2xl border border-hair bg-panel p-5 sm:p-6">
          <figcaption className="mb-4">
            <p className="eyebrow">Figure 2</p>
            <h3 className="display text-2xl text-ink-high">The reproducibility test</h3>
            <p className="mt-1 text-sm text-ink-mid">
              Sealed mean regressed on public mean, one point per entry. A strain that only works in the public condition falls below the 95% prediction band.
            </p>
          </figcaption>
          <Scatter
            points={results.entries.map((e) => ({
              id: e.houseSlug,
              label: name(e.houseSlug),
              sub: e.accession,
              x: e.public.mean,
              y: e.sealed.mean,
              overfit: results.overfit.includes(e.houseSlug),
              note: e.sealedRank === 1 ? "winner" : results.overfit.includes(e.houseSlug) ? "public leader · overfit" : undefined,
            }))}
            band={band}
            fit={{ slope: reg.slope, slopeCi: reg.slopeCi95, intercept: reg.intercept, r2: reg.r2, p: reg.p, n: reg.n }}
            unit={results.unit}
            xLabel="Public panel mean"
            yLabel="Sealed panel mean"
          />
        </figure>
        <div className="space-y-3">
          <Callout title="What the fit says">
            Sealed titer rises {reg.slope.toFixed(2)} {results.unit} per {results.unit} of public titer (95% CI {(reg.slope - reg.slopeCi95).toFixed(2)}–{(reg.slope + reg.slopeCi95).toFixed(2)}), explaining {(reg.r2 * 100).toFixed(0)}% of the variance (R² {reg.r2.toFixed(2)}, p {fmtP(reg.p)}, n {reg.n}). A slope below 1 is expected: the sealed panel adds harder media and a lower temperature.
          </Callout>
          <Callout title="Who fell outside">
            {results.overfit.length ? (
              <>
                {results.overfit.map(name).join(", ")} sat below the prediction band: a public-rank {publicLeader.publicRank} entry that kept only {(publicLeader.ratio * 100).toFixed(0)}% of its titer on the sealed media. The platform says so publicly, and the card stays Common.
              </>
            ) : (
              "Every entry sat inside the prediction band."
            )}
          </Callout>
          <Callout title="Why two panels">
            Public plates are the theatre; sealed plates decide. Kaggle&apos;s private leaderboard, translated into a wet-lab reproducibility test.
          </Callout>
        </div>
      </div>

      {/* Chart 3 */}
      <figure className="rounded-2xl border border-hair bg-panel p-5 sm:p-6">
        <figcaption className="mb-4">
          <p className="eyebrow">Figure 3</p>
          <h3 className="display text-2xl text-ink-high">Replicate spread · top six on the sealed panel</h3>
          <p className="mt-1 text-sm text-ink-mid">Every replicate, both panels. The label under each panel is the sealed / public ratio.</p>
        </figcaption>
        <Strip
          groups={results.entries.slice(0, 6).map((e) => ({
            id: e.houseSlug,
            label: name(e.houseSlug).replace("The ", ""),
            publicReps: e.publicReps,
            sealedReps: e.sealedReps,
            publicMean: e.public.mean,
            publicCi: e.public.ci95,
            sealedMean: e.sealed.mean,
            sealedCi: e.sealed.ci95,
          }))}
          unit={results.unit}
        />
      </figure>

      {/* Table */}
      <section>
        <p className="eyebrow">Full results · table view</p>
        <h3 className="display mb-4 text-2xl text-ink-high">Final leaderboard</h3>
        <div className="overflow-x-auto rounded-2xl border border-hair">
          <table className="w-full min-w-[64rem] font-mono text-[11px]">
            <thead className="bg-panel text-left text-ink-low">
              <tr>
                {["#", "Pub #", "Δ", "House", "Strain", `Public (${results.unit})`, `Sealed (${results.unit})`, "n", "Δ vs ref (95% CI)", "t", "df", "p", "p Holm", "", "ratio"].map((h, i) => (
                  <th key={i} className="whitespace-nowrap px-3 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.entries.map((e) => {
                const d = e.publicRank - e.sealedRank;
                return (
                  <tr key={e.houseSlug} className="border-t border-hair text-ink-mid hover:bg-white/[0.03]">
                    <td className="px-3 py-2 tabular-nums text-ink-high">{e.sealedRank}</td>
                    <td className="px-3 py-2 tabular-nums">{e.publicRank}</td>
                    <td className={`px-3 py-2 tabular-nums ${d > 0 ? "text-ecoli" : d < 0 ? "text-strep" : "text-ink-low"}`}>{d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : "•"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-high">{name(e.houseSlug)}</td>
                    <td className="whitespace-nowrap px-3 py-2">{e.accession} “{e.name}”</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{e.public.mean.toFixed(1)} ± {e.public.ci95.toFixed(1)}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-ink-high">{e.sealed.mean.toFixed(1)} ± {e.sealed.ci95.toFixed(1)}</td>
                    <td className="px-3 py-2 tabular-nums">{e.sealed.n}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{e.vsRef.diff >= 0 ? "+" : ""}{e.vsRef.diff.toFixed(1)} ({(e.vsRef.diff - e.vsRef.diffCi95).toFixed(1)}, {(e.vsRef.diff + e.vsRef.diffCi95).toFixed(1)})</td>
                    <td className="px-3 py-2 tabular-nums">{e.vsRef.t.toFixed(2)}</td>
                    <td className="px-3 py-2 tabular-nums">{e.vsRef.df.toFixed(1)}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtP(e.vsRef.p)}</td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">{fmtP(e.pAdj)}</td>
                    <td className={`px-3 py-2 ${e.verdict === "above" ? "text-ecoli" : e.verdict === "below" ? "text-strep" : "text-ink-low"}`}>{e.stars}</td>
                    <td className={`px-3 py-2 tabular-nums ${results.overfit.includes(e.houseSlug) ? "text-strep" : ""}`}>{e.ratio.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-hair bg-panel/60 text-ink-low">
                <td className="px-3 py-2" colSpan={4}>Reference</td>
                <td className="px-3 py-2">{results.reference.name}</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2 tabular-nums">{results.reference.summary.mean.toFixed(1)} ± {results.reference.summary.ci95.toFixed(1)}</td>
                <td className="px-3 py-2">{results.reference.summary.n}</td>
                <td className="px-3 py-2" colSpan={7}>SD {results.reference.summary.sd.toFixed(1)} · SEM {results.reference.summary.sem.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Methods */}
      <section className="rounded-2xl border border-hair bg-panel p-5 sm:p-6">
        <p className="eyebrow">Methods</p>
        <h3 className="display mb-3 text-2xl text-ink-high">How these numbers were produced</h3>
        <div className="grid gap-x-8 gap-y-4 text-sm leading-relaxed text-ink-mid md:grid-cols-2">
          <p>
            <b className="text-ink-high">Assay.</b> {challenge.scoring} Public panel: {challenge.publicConditions} condition; sealed panel: {challenge.sealedConditions} undisclosed conditions run after close. n ≥ {challenge.replicateFloor} replicates per entry and panel; voided replicates are excluded before analysis.
          </p>
          <p>
            <b className="text-ink-high">Intervals.</b> Mean ± t<sub>0.975, n−1</sub> · s/√n. Confidence intervals on the difference to the reference use the Welch–Satterthwaite degrees of freedom.
          </p>
          <p>
            <b className="text-ink-high">Tests.</b> Welch&apos;s two-sample t-test, two-sided, each entry&apos;s sealed replicates against the reference chassis. Family-wise error controlled with Holm–Bonferroni step-down over all {results.entries.length} comparisons. Group differences summarised by one-way ANOVA with η².
          </p>
          <p>
            <b className="text-ink-high">Regression.</b> Ordinary least squares of sealed mean on public mean (n = {reg.n} entries). Confidence band: ŷ ± t·s<sub>e</sub>·√(1/n + (x−x̄)²/S<sub>xx</sub>); prediction band adds 1 under the root. Entries below the lower prediction limit are flagged as fitted to the public condition.
          </p>
        </div>
        <p className="mt-4 font-mono text-[11px] text-ink-low">
          Demo data: replicates are drawn from seeded normal distributions; every statistic above is computed from those draws, nothing is typed in. Distribution functions via the regularised incomplete beta.
        </p>
      </section>
    </div>
  );
}

function Tile({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-foil-a/50 bg-panel shadow-[0_0_40px_-16px_rgba(123,92,255,0.6)]" : "border-hair bg-panel"}`}>
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 text-xl font-semibold leading-tight ${accent ? "foil-text" : "text-ink-high"}`}>{value}</p>
      <p className="mt-1 font-mono text-[11px] text-ink-mid">{sub}</p>
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hair bg-panel p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foil-b">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">{children}</p>
    </div>
  );
}
