/**
 * Small, dependency-free statistics used by the results pages.
 *
 * Everything here is textbook frequentist inference:
 *  - descriptive: mean, sample SD, SEM, t-based confidence intervals
 *  - Welch's two-sample t-test (unequal variances, Welch–Satterthwaite df)
 *  - Holm–Bonferroni step-down correction for multiple comparisons
 *  - one-way ANOVA (F-test)
 *  - ordinary least squares with confidence and prediction bands
 *
 * Distribution functions use the regularised incomplete beta function
 * (Lentz continued fraction, as in Numerical Recipes), which gives the t and
 * F CDFs; quantiles are found by bisection on the CDF.
 */

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function variance(xs: number[]) {
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
}

export const sd = (xs: number[]) => Math.sqrt(variance(xs));
export const sem = (xs: number[]) => sd(xs) / Math.sqrt(xs.length);

/* ── Special functions ─────────────────────────────────────────────────── */

function lnGamma(x: number): number {
  // Lanczos approximation, g = 7, n = 9
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-14;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regularised incomplete beta I_x(a, b). */
export function incBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** CDF of Student's t with `df` degrees of freedom. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = 0.5 * incBeta(df / 2, 0.5, x);
  return t >= 0 ? 1 - p : p;
}

/** Two-sided p-value for a t statistic. */
export const tTwoSided = (t: number, df: number) => 2 * (1 - tCdf(Math.abs(t), df));

/** Quantile of Student's t (bisection on the CDF). */
export function tQuantile(p: number, df: number): number {
  let lo = -200;
  let hi = 200;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Upper-tail probability of an F statistic with (df1, df2). */
export function fUpper(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  return incBeta(df2 / 2, df1 / 2, df2 / (df2 + df1 * f));
}

/* ── Inference ─────────────────────────────────────────────────────────── */

export interface Summary {
  n: number;
  mean: number;
  sd: number;
  sem: number;
  /** Half-width of the 95% confidence interval (t-based). */
  ci95: number;
}

export function summarise(xs: number[]): Summary {
  const n = xs.length;
  const s = sd(xs);
  const se = s / Math.sqrt(n);
  return { n, mean: mean(xs), sd: s, sem: se, ci95: tQuantile(0.975, n - 1) * se };
}

export interface WelchResult {
  t: number;
  df: number;
  p: number;
  /** Difference of means, a − b, with its 95% CI. */
  diff: number;
  diffCi95: number;
}

/** Welch's t-test for a vs b (unequal variances). */
export function welch(a: number[], b: number[]): WelchResult {
  const va = variance(a) / a.length;
  const vb = variance(b) / b.length;
  const diff = mean(a) - mean(b);
  const se = Math.sqrt(va + vb);
  const t = diff / se;
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1));
  return { t, df, p: tTwoSided(t, df), diff, diffCi95: tQuantile(0.975, df) * se };
}

/** Holm–Bonferroni step-down adjusted p-values (same order as input). */
export function holm(ps: number[]): number[] {
  const idx = ps.map((p, i) => [p, i] as const).sort((x, y) => x[0] - y[0]);
  const m = ps.length;
  const adj = new Array<number>(m);
  let running = 0;
  idx.forEach(([p, i], k) => {
    running = Math.max(running, Math.min(1, (m - k) * p));
    adj[i] = running;
  });
  return adj;
}

export function stars(p: number): string {
  if (p < 0.001) return "***";
  if (p < 0.01) return "**";
  if (p < 0.05) return "*";
  return "n.s.";
}

export interface AnovaResult {
  f: number;
  df1: number;
  df2: number;
  p: number;
  /** Proportion of variance explained by group (η²). */
  eta2: number;
}

export function anova(groups: number[][]): AnovaResult {
  const all = groups.flat();
  const grand = mean(all);
  const k = groups.length;
  const n = all.length;
  const ssb = groups.reduce((a, g) => a + g.length * (mean(g) - grand) ** 2, 0);
  const ssw = groups.reduce((a, g) => a + g.reduce((s, x) => s + (x - mean(g)) ** 2, 0), 0);
  const df1 = k - 1;
  const df2 = n - k;
  const f = ssb / df1 / (ssw / df2);
  return { f, df1, df2, p: fUpper(f, df1, df2), eta2: ssb / (ssb + ssw) };
}

export interface Regression {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  n: number;
  df: number;
  /** Residual standard error. */
  se: number;
  slopeSe: number;
  slopeCi95: number;
  /** p-value for H0: slope = 0. */
  p: number;
  xMean: number;
  sxx: number;
  predict: (x: number) => number;
  /** Half-width of the 95% confidence band for the mean response at x. */
  ciBand: (x: number) => number;
  /** Half-width of the 95% prediction interval for a new observation at x. */
  piBand: (x: number) => number;
}

/** Ordinary least squares y ~ x with confidence and prediction bands. */
export function ols(xs: number[], ys: number[]): Regression {
  const n = xs.length;
  const xm = mean(xs);
  const ym = mean(ys);
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - xm) ** 2;
    sxy += (xs[i] - xm) * (ys[i] - ym);
    syy += (ys[i] - ym) ** 2;
  }
  const slope = sxy / sxx;
  const intercept = ym - slope * xm;
  const df = n - 2;
  const ssRes = ys.reduce((a, y, i) => a + (y - (intercept + slope * xs[i])) ** 2, 0);
  const se = Math.sqrt(ssRes / df);
  const slopeSe = se / Math.sqrt(sxx);
  const tq = tQuantile(0.975, df);
  const r = sxy / Math.sqrt(sxx * syy);
  const tSlope = slope / slopeSe;
  return {
    slope,
    intercept,
    r,
    r2: r * r,
    n,
    df,
    se,
    slopeSe,
    slopeCi95: tq * slopeSe,
    p: tTwoSided(tSlope, df),
    xMean: xm,
    sxx,
    predict: (x) => intercept + slope * x,
    ciBand: (x) => tq * se * Math.sqrt(1 / n + (x - xm) ** 2 / sxx),
    piBand: (x) => tq * se * Math.sqrt(1 + 1 / n + (x - xm) ** 2 / sxx),
  };
}

/* ── Deterministic sampling for fixtures ───────────────────────────────── */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller normal deviate from a uniform source. */
export function normal(rnd: () => number, mu = 0, sigma = 1) {
  const u = 1 - rnd();
  const v = rnd();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const fmt = (x: number, d = 1) => x.toFixed(d);
export const fmtP = (p: number) => (p < 0.001 ? "< 0.001" : p.toFixed(3));
