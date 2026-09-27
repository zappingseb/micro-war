# MicroWar — Platform Plan

> A Kaggle-style competitive benchmarking platform for microbiology labs, wrapped in a
> collectible-card-game presentation layer. Labs submit **strains** and **media**; every
> entry is scored on objective, automated plate-imaging data; results become collectible
> cards, league tables and live streams.

**Status:** planning / pre-demo
**Reference stack:** Reshape Biotech Smart Incubator + High-throughput Imaging Device + Discovery Platform
**Visual reference:** secretlair.wizards.com (card-drop retail), reshapebiotech.com (dark instrument UI)

---

## 0. Positioning — read this before writing copy

This is **not** a war game. It is a *serious game*: a structured, incentivised,
reproducible benchmarking arena that gets labs around the world screening the same
problems against the same measurement standard, so that antimicrobial leads, production
strains and growth media get found faster than any single lab could manage.

The collectible-card / championship framing exists for three concrete reasons:

1. **Recruitment.** Academic labs do not join "a benchmarking consortium". They join a
   league where their lab has a crest, a record and a rival.
2. **Legibility.** A strain's real assay stats (inhibition zone, titer, growth rate,
   robustness) map naturally onto a card stat line. A card is a very efficient way to
   render a multi-dimensional phenotype.
3. **Outreach.** Timelapse plate imagery is genuinely beautiful. It is the best public
   science communication asset microbiology has and nobody streams it.

**Tone rule:** playful chrome, serious substance. Every gamified surface must be one
click from the underlying protocol, raw images and scoring formula. Nothing is scored by
vibes except the explicitly-jury-judged art track.

**Naming caution:** "MicroWar" reads well to gamers and badly to a university ethics
board, an antimicrobial-resistance funder, or a journalist. Recommend keeping *MicroWar*
as the product/brand wordmark but subtitling everything with the real proposition —
e.g. *"MicroWar — the open league for antimicrobial and bioproduction discovery."*
Alternatives worth testing: **Petri League**, **Agar Arena**, **The Culture League**,
**Colony** (see §16).

---

## 1. Users & roles

| Role | Who | Entry point |
|---|---|---|
| **Spectator** | Anyone — students, the public, funders, press, scientists browsing | `Login → Spectator`, or fully anonymous browsing |
| **Participant** | A verified researcher belonging to a verified lab/house | `Login → Participant` |
| **Lab Admin (House Captain)** | PI or lab manager; manages roster, shipments, consent | Participant + elevated |
| **Judge** | Invited panel for the Art track and for tie-breaks | Invite-only console |
| **Organizer** | Platform staff running challenges, plate maps, scoring | Admin console |
| **Operator** | Wet-lab staff at the central facility running the instruments | Ops console (tablet-first) |
| **Sponsor / Partner** | Funder or industry partner sponsoring a challenge | Read-only dashboard + branded challenge page |
| **Safety Reviewer** | Reviews every submission for biosafety + dual-use before acceptance | Review queue |

### 1.1 The Login → mode split (requested)

The landing page header carries a single **`LOG IN`** button. Clicking it opens a
full-screen modal — styled as two facing foil cards — offering:

```
┌──────────────────────────┐   ┌──────────────────────────┐
│      ENTER AS            │   │      ENTER AS            │
│      SPECTATOR           │   │      PARTICIPANT         │
│                          │   │                          │
│  Watch the league.       │   │  Enter your strains.     │
│  Follow houses, predict  │   │  Submit media recipes.   │
│  brackets, browse the    │   │  Claim your lab's crest. │
│  card vault.             │   │                          │
│                          │   │  Requires institutional  │
│  No verification needed. │   │  verification.           │
│                          │   │                          │
│   [ CONTINUE ]           │   │   [ CONTINUE ]           │
└──────────────────────────┘   └──────────────────────────┘
        e-mail / SSO                ORCID · institutional SSO
                                    (eduGAIN) · invite code
```

- **Spectator** → lightweight account (e-mail magic link or social). Unlocks following,
  predictions, fantasy league, badges, comment/watch. Can be skipped entirely — the
  whole public site is readable logged-out.
- **Participant** → identity-verified. **ORCID** is the primary rail (it is the identifier
  microbiologists already have), with institutional SSO and organizer invite codes as
  fallbacks. Gated behind lab verification + biosafety attestation before a submission
  can be made.
- A spectator account can be **upgraded** to participant later without losing badges or
  prediction history. This matters: students spectate first, then their PI joins.
- Mode is remembered and shown in the header as a small chip (`◉ SPECTATOR` /
  `◈ PARTICIPANT`) so people always know which surface they are on. A participant can
  toggle into the spectator view to see what the public sees.

---

## 2. The competition model

### 2.1 Organisms (the four "colours")

Four playable genera, each with a signature accent colour drawn from its real phenotype.
This is the game's colour-identity system, and it is scientifically honest.

| Organism | Role in league | Accent | Why that colour |
|---|---|---|---|
| *Escherichia coli* | The workhorse — production chassis | Chartreuse / electric lime | Classic lab-strain green, LB-plate association |
| *Streptococcus* spp. | The duelist — hemolysis & bacteriocins | Crimson | β-hemolysis clears blood agar |
| *Pseudomonas aeruginosa* | The artist — pigments & antagonism | Cyan / teal | Pyocyanin is literally blue-green; pyoverdine fluoresces |
| *Acinetobacter baumannii* | The survivor — robustness & AMR target | Amber / violet | Desiccation-resistant; the priority AMR pathogen |

*P. aeruginosa* deserves special billing in the Art track — it natively produces
pyocyanin (blue-green), pyoverdine (fluorescent yellow-green), pyorubin (red) and
pyomelanin (brown). It is a four-colour paintbox on its own.

> **Biosafety note that shapes the whole product:** *A. baumannii* and *S. pyogenes* are
> BSL-2 and two of them are on the WHO priority-pathogen list. The platform must be
> designed so that the *default* competitive entry is a **safe surrogate or attenuated /
> avirulent strain**, and any work on the real priority pathogens happens only at
> accredited central facilities under the §12 governance model. This is not a footnote;
> it is a first-class design constraint and a selling point to funders.

### 2.2 Challenge tracks

| # | Track | Objective | Primary readout | Instrument mode |
|---|---|---|---|---|
| 1 | **Titer — Product** | Maximise yield of a target molecule | Colorimetric analysis, OD turbidity | HT imaging + microtiter |
| 2 | **Titer — Antibiotic** | Maximise inhibition of a reference indicator strain | Halo / zone-of-inhibition diameter | HT imaging, petri |
| 3 | **Chroma (Bacterial Art)** | Aesthetic colour / pattern expression | Timelapse RGB, colour-area segmentation + jury vote | Smart Incubator timelapse |
| 4 | **Arena (head-to-head)** | Out-compete an opponent strain in co-culture | Differential counts, antagonism assay | Timelapse + differential AI model |
| 5 | **Media Cup** | Best medium for a *fixed* reference strain | Growth kinetics, radial growth rate | Timelapse, kinetic |
| 6 | **Iron Gut (Robustness)** | Survive stress / preservative panels | Preservative testing, viable count | HT imaging |
| 7 | **Sprint (Growth Rate)** | Fastest µmax under defined conditions | Growth kinetics | Timelapse, 10-min interval |
| 8 | **Purity** | Cleanest co-culture / lowest contamination | Differential counts | HT imaging |
| 9 | **Open Discovery** | Sponsor-defined wildcard | Custom AI model | Varies |

Each challenge is configured as **strain-fixed** (you submit media) or
**media-fixed** (you submit strains) or **open** (you submit both, as a paired deck).

### 2.3 The two-leaderboard rule (Kaggle's best idea, kept)

Every challenge runs on a split panel:

- **Public plates** — a visible condition subset. Scores publish live to the public
  leaderboard during the season. This is the theatre.
- **Sealed plates** — a hidden condition subset, run at the close, revealed at the
  finale. The **private leaderboard decides the winner.**

This is not just anti-overfitting theatre — in wet-lab terms it is a **built-in
reproducibility test**. A strain that wins the public panel but collapses on the sealed
panel was fitted to one condition, and the platform says so publicly. That single
mechanic is the platform's strongest scientific claim.

Additional integrity mechanics:
- **Replicate floor:** n≥3 plates minimum, n≥6 for finals; score is the trimmed mean.
- **Blinded plate IDs:** operators and AI models see barcodes, never house names.
- **Reference controls on every plate map:** a known reference strain in fixed wells;
  a run whose control drifts out of tolerance is voided and re-run, not scored.
- **Batch/plate-position correction:** edge-effect and incubator-slot covariates are
  modelled out and the correction is published with the score.

### 2.4 Season structure ("the FIFA layer")

```
SEASON (≈ 1 year)
├── PRESEASON        Open Qualifiers — any lab, any strain, low-stakes ladder
├── GROUP STAGE      32 houses → 8 groups of 4 · round-robin · each fixture = a real co-culture run
├── KNOCKOUT         Ro16 → QF → SF → FINAL, best-of-3 plate runs
├── CUP COMPETITIONS Parallel single-track cups (Antibiotic Cup, Media Cup, Chroma Salon)
└── FINALE           Live-streamed sealed-panel reveal + awards
```

League table is a literal football table: **P / W / D / L / GF / GA / GD / Pts**, where
"goals" are the track's normalised metric. Draws are real (within measurement error =
draw), which is a nice honest touch: the confidence interval decides.

---

## 3. The card system

Every accepted submission mints a **card**. Cards are the platform's unit of identity,
shareability and collection.

### 3.1 Card anatomy

```
╔═══════════════════════════════╗
║ ◈ PYO-7 "MIDNIGHT BLOOM"      ║  ← Name (house-given) + accession
║ ┌───────────────────────────┐ ║
║ │                           │ ║
║ │   [ PLATE IMAGE / LOOP ]  │ ║  ← Real timelapse loop from the incubator
║ │                           │ ║
║ └───────────────────────────┘ ║
║ Pseudomonas aeruginosa · BSL1 ║  ← Organism line + containment class
║ House Davidoff · Season III   ║
║ ─────────────────────────────  ║
║ ◆ Keywords: SWARMING,         ║  ← Derived from measured phenotype
║   PYOCYANIN, BIOFILM          ║
║ ─────────────────────────────  ║
║ TITER      ██████░░░░  62      ║  ← Real normalised assay stats
║ INHIBITION █████████░  91      ║
║ GROWTH     ████░░░░░░  44      ║
║ ROBUST     ███████░░░  71      ║
║ CHROMA     ██████████  97      ║
║ ─────────────────────────────  ║
║ "It painted the whole plate    ║  ← Flavour text, written by the lab
║  before anyone noticed."       ║
║ ─────────────────────────────  ║
║ ★ MYTHIC · 1 of 1 · CC-BY-4.0  ║  ← Rarity, edition, data licence
╚═══════════════════════════════╝
```

### 3.2 Stat derivation (must be auditable)

| Stat | Source assay | Normalisation |
|---|---|---|
| **TITER** | Colorimetric / OD product quantification | Percentile vs. all season entries for that organism |
| **INHIBITION** | Halo diameter (mm) vs. reference indicator | Percentile, control-normalised |
| **GROWTH** | µmax from kinetic curve | Percentile |
| **ROBUST** | Viable count retention across stress panel | Percentile |
| **CHROMA** | Colour-area × saturation × pattern entropy | Percentile + jury modifier (Art track only) |

Every stat bar on every card links to `/cards/:id/evidence` — the raw plate images, the
fitted curve, the replicate spread, the run ID and the operator log. **No stat is ever
shown without a path to its evidence.** This is the line that separates this from a toy.

### 3.3 Media cards ("Lands")

Media are a second card type, deliberately styled differently (landscape orientation,
muted frame). A medium card carries: base, carbon source, nitrogen source, supplements,
pH, agar %, selective agents, and a **complexity cost** (how many components / how
expensive / how hard to reproduce). Complexity cost is the "mana cost" analogue and it
does real work: a cheap defined medium that performs as well as a rich complex one
is genuinely more valuable, and the game should reward that.

In Arena mode a house fields a **pairing**: one strain card + one media card. That is the
deck. The interaction between them is the actual science.

### 3.4 Rarity, earned not bought

| Tier | How it is earned |
|---|---|
| Common | Any accepted submission |
| Uncommon | Passed the sealed panel (reproducible) |
| Rare | Top 25% in any track |
| Epic | Podium finish |
| **Mythic (Foil)** | Track winner, or a stat that sets a season record |
| **Legendary** | Card whose data was cited in a peer-reviewed publication |

Nothing is purchasable. Rarity is a reproducibility signal, not a monetisation lever.
That **Legendary** tier is the real prize: it ties the game loop back to publication.

---

## 4. Complete sitemap

Legend: 🌐 public · ◉ spectator · ◈ participant · ⚙ organizer/ops · ⚖ judge

### 4.1 Public / spectator surface

| # | Route | Page |
|---|---|---|
| 1 | `/` | 🌐 Landing — hero drop, live ticker, featured cards, countdown |
| 2 | `/season/current` | 🌐 Season hub — standings snapshot, fixtures, storylines |
| 3 | `/season/:year` | 🌐 Past-season archive |
| 4 | `/challenges` | 🌐 Challenge index — filter by track/organism/status/prize |
| 5 | `/challenges/:slug` | 🌐 Challenge overview |
| 6 | `/challenges/:slug/rules` | 🌐 Rules & eligibility |
| 7 | `/challenges/:slug/protocol` | 🌐 Wet-lab protocol + instrument settings |
| 8 | `/challenges/:slug/scoring` | 🌐 Scoring formula, worked example, code snippet |
| 9 | `/challenges/:slug/leaderboard` | 🌐 Public + (after close) private leaderboard |
| 10 | `/challenges/:slug/entries` | 🌐 All entered cards |
| 11 | `/challenges/:slug/timeline` | 🌐 Key dates, shipping deadlines, run windows |
| 12 | `/challenges/:slug/discussion` | ◉ Forum thread |
| 13 | `/challenges/:slug/data` | 🌐 Released image sets + CSVs |
| 14 | `/leaderboards` | 🌐 Leaderboard hub |
| 15 | `/leaderboards/global` | 🌐 All-time house ranking (Elo-style) |
| 16 | `/leaderboards/track/:track` | 🌐 Per-track |
| 17 | `/leaderboards/organism/:organism` | 🌐 Per-organism |
| 18 | `/leaderboards/rookies` | 🌐 First-season houses only |
| 19 | `/leaderboards/students` | 🌐 Undergrad / teaching-lab division |
| 20 | `/houses` | 🌐 All houses — world grid |
| 21 | `/houses/:slug` | 🌐 House page — crest, record, signature strain |
| 22 | `/houses/:slug/roster` | 🌐 Members |
| 23 | `/houses/:slug/vault` | 🌐 Public card collection |
| 24 | `/houses/:slug/history` | 🌐 Season-by-season record |
| 25 | `/houses/:slug/rivalries` | 🌐 Head-to-head records |
| 26 | `/scientists/:handle` | 🌐 Individual profile (ORCID-linked) |
| 27 | `/cards` | 🌐 Card gallery — filter by organism/rarity/stat/house |
| 28 | `/cards/:id` | 🌐 Card detail |
| 29 | `/cards/:id/evidence` | 🌐 Raw plates, curves, replicates, run log |
| 30 | `/cards/:id/lineage` | 🌐 Derivation tree (parent strain → mutants) |
| 31 | `/media-cards` | 🌐 Media/recipe card index |
| 32 | `/media-cards/:id` | 🌐 Recipe detail + reproducibility score |
| 33 | `/watch` | 🌐 Streaming hub — live now, upcoming, channels |
| 34 | `/watch/:channel` | 🌐 Embedded player + chat + live plate data sidebar |
| 35 | `/watch/schedule` | 🌐 Broadcast calendar |
| 36 | `/watch/vod` | 🌐 Archive of past broadcasts |
| 37 | `/boards` | 🌐 Competition boards index |
| 38 | `/boards/:competition` | 🌐 Group tables + bracket (the "FIFA board") |
| 39 | `/boards/:competition/fixtures` | 🌐 Fixture list / match-day calendar |
| 40 | `/boards/:competition/bracket` | 🌐 Knockout bracket |
| 41 | `/boards/:competition/match/:id` | 🌐 **Match centre** — side-by-side timelapse, live score |
| 42 | `/gallery` | 🌐 Bacterial-art gallery (the outreach jewel) |
| 43 | `/gallery/:artworkId` | 🌐 Artwork detail — full timelapse, artist statement |
| 44 | `/gallery/exhibitions/:slug` | 🌐 Curated exhibition |
| 45 | `/atlas` | 🌐 World map of participating labs |
| 46 | `/hall-of-fame` | 🌐 Champions, records, retired cards |
| 47 | `/awards/:season` | 🌐 Season awards ceremony page |
| 48 | `/science` | 🌐 How the scoring works, in plain language |
| 49 | `/methods` | 🌐 Assay library index |
| 50 | `/methods/:assay` | 🌐 Assay explainer (halo, viable count, kinetics…) |
| 51 | `/protocols` | 🌐 Downloadable protocol library |
| 52 | `/equipment` | 🌐 The measurement stack — incubator, imager, AI models |
| 53 | `/datasets` | 🌐 Open data index |
| 54 | `/datasets/:id` | 🌐 Dataset detail + DOI + citation |
| 55 | `/publications` | 🌐 Papers using platform data |
| 56 | `/dispatch` | 🌐 News / blog |
| 57 | `/dispatch/:slug` | 🌐 Article |
| 58 | `/education` | 🌐 Teaching-lab pack — run MicroWar as a course module |
| 59 | `/rules` | 🌐 Platform-wide competition rules |
| 60 | `/biosafety` | 🌐 Biosafety policy & containment classes |
| 61 | `/ethics` | 🌐 **Responsible-research & dual-use policy** |
| 62 | `/shipping` | 🌐 How to ship a strain (per-region, with forms) |
| 63 | `/sponsors` | 🌐 Sponsors & prize pool |
| 64 | `/partners` | 🌐 Institutional partners |
| 65 | `/about` | 🌐 Mission & team |
| 66 | `/faq` | 🌐 FAQ |
| 67 | `/press` | 🌐 Press kit |
| 68 | `/contact` | 🌐 Contact |
| 69 | `/legal/*` | 🌐 Terms, privacy, data use, IP & licensing |
| 70 | `/login` | 🌐 **Mode chooser — Spectator / Participant** |
| 71 | `/signup/spectator` | 🌐 Light signup |
| 72 | `/signup/participant` | 🌐 ORCID / SSO + lab verification |
| 73 | `/signup/house` | 🌐 Register a new house (PI-gated) |

### 4.2 Spectator-authenticated surface ◉

| # | Route | Page |
|---|---|---|
| 74 | `/me` | Spectator profile |
| 75 | `/me/following` | Followed houses, cards, challenges |
| 76 | `/me/badges` | Spectator badge collection |
| 77 | `/me/notifications` | Alerts (fixture starting, sealed reveal) |
| 78 | `/predict/:competition` | Bracket pick'em |
| 79 | `/fantasy` | Fantasy league hub |
| 80 | `/fantasy/lineup` | Draft a lineup of strain + media cards |
| 81 | `/fantasy/league/:id` | Private fantasy league |

### 4.3 Participant surface ◈

| # | Route | Page |
|---|---|---|
| 82 | `/app` | Dashboard — active entries, deadlines, run status |
| 83 | `/app/challenges` | My challenges (entered / eligible / watching) |
| 84 | `/app/submit` | **Submission wizard — entry point** |
| 85 | `/app/submit/:id/type` | Step 1 — strain / media / pairing |
| 86 | `/app/submit/:id/strain` | Step 2 — taxonomy, genotype, provenance, parent strain |
| 87 | `/app/submit/:id/media` | Step 2b — recipe builder (component table + cost calc) |
| 88 | `/app/submit/:id/safety` | Step 3 — **biosafety + dual-use declaration** |
| 89 | `/app/submit/:id/consent` | Step 4 — data licence, publication consent, MTA |
| 90 | `/app/submit/:id/shipping` | Step 5 — courier, manifest, permits, tracking |
| 91 | `/app/submit/:id/card` | Step 6 — name it, flavour text, art preview |
| 92 | `/app/submit/:id/review` | Step 7 — review & submit |
| 93 | `/app/submissions` | All my submissions |
| 94 | `/app/submissions/:id` | **Status pipeline** (see §6.5) |
| 95 | `/app/submissions/:id/results` | Plate images, curves, score breakdown |
| 96 | `/app/submissions/:id/dispute` | Raise a scoring appeal |
| 97 | `/app/vault` | My house's cards |
| 98 | `/app/deck` | Deck builder — pair strain + media for Arena |
| 99 | `/app/house` | House profile management (crest, bio, colours) |
| 100 | `/app/house/members` | Roster & invitations |
| 101 | `/app/house/inventory` | Strain & media inventory |
| 102 | `/app/house/equipment` | Declared local instruments |
| 103 | `/app/notebook` | Run log / digital notebook entries |
| 104 | `/app/data` | Download my raw images & data |
| 105 | `/app/analytics` | My performance over time, stat radar vs. field |
| 106 | `/app/messages` | Organizer & house messaging |
| 107 | `/app/api` | API tokens & docs |
| 108 | `/app/settings` | Account, notifications, privacy |

### 4.4 Organizer / operator surface ⚙

| # | Route | Page |
|---|---|---|
| 109 | `/admin` | Ops dashboard |
| 110 | `/admin/challenges` | Challenge authoring list |
| 111 | `/admin/challenges/:id/edit` | Challenge builder |
| 112 | `/admin/challenges/:id/scoring` | Scoring-formula editor + dry-run |
| 113 | `/admin/challenges/:id/panel` | Public/sealed condition-panel designer |
| 114 | `/admin/intake` | Sample accessioning queue |
| 115 | `/admin/intake/:id` | Accession detail + chain of custody |
| 116 | `/admin/safety-review` | **Biosafety & dual-use review queue** |
| 117 | `/admin/runs` | Run scheduling |
| 118 | `/admin/runs/:id/platemap` | Plate-map designer (randomisation, controls) |
| 119 | `/admin/runs/:id/qc` | Run QC — control drift, edge effects, voids |
| 120 | `/admin/runs/:id/images` | Image review & validation |
| 121 | `/admin/devices` | Instrument fleet status |
| 122 | `/admin/devices/:id` | Device detail — throughput, calibration, uptime |
| 123 | `/admin/scores` | Score computation, embargo & publication |
| 124 | `/admin/disputes` | Appeals queue |
| 125 | `/admin/houses` | House verification |
| 126 | `/admin/cards` | Card minting & art moderation |
| 127 | `/admin/streams` | Stream scheduling & overlay control |
| 128 | `/admin/content` | CMS — dispatch, pages, exhibitions |
| 129 | `/admin/audit` | Immutable audit log |
| 130 | `/admin/sponsors` | Sponsor & prize management |

### 4.5 Judge surface ⚖

| # | Route | Page |
|---|---|---|
| 131 | `/judge` | Jury console — assigned ballots |
| 132 | `/judge/:challenge/ballot` | Blind scoring ballot for Chroma track |
| 133 | `/judge/:challenge/deliberation` | Panel discussion (post-ballot) |

**Total: ~133 routes / ~65 distinct page templates.**

---

## 5. Design system

### 5.1 What the references actually taught us

**Secret Lair** (observed live): the store itself is *light* — white sections, centred
section headers with an outlined `ALLE ANZEIGEN →` pill on the right, 3-up product card
carousels with arrow affordances, a small badge (`FOIL`) above the product title,
struck-through original price next to sale price, and a **full-bleed black CTA button**
at the bottom of every card. The *darkness* lives in the hero: a full-width hand-drawn
comic panel with hand-lettered display type ("COMING SOON"), a persistent top promo bar,
and a sticky slim nav with centred logo, search and cart.

**Reshape** (observed live): deep navy-black canvas (`#0B0F19`-ish), single warm amber
CTA, generous whitespace, alternating asymmetric feature cards, product photography on
black, and — most useful — the **actual Discovery Platform UI**: plate thumbnails in a
status grid (`Needs validation` / `Positive` / `Negative` / `Error`), a plate detail
panel (`SP-123-432`, total colonies `34`, total area `42mm²`, location `HT002 · Column A,
Row 1`, activity log), and a hero plate render with **detected colonies overlaid as
coloured dots and a floating `CFU count 473` chip**.

That last element is the single most valuable visual in the whole research pass. It is
*already* a game HUD. MicroWar's match centre should look like it.

### 5.2 Direction

**Dark-first**, unlike Secret Lair's store but true to the "nerd card game" brief and
consistent with Reshape's instrument aesthetic. Rationale: plate imagery is mostly dark
agar and glowing colonies — it reads far better on black, and the fluorescence/pigment
colours pop.

```
--bg-void        #07090F   page
--bg-panel       #0E1220   cards, panels
--bg-raised      #161B2E   hover, elevated
--border-hair    #232A42
--ink-high       #F2F5FF
--ink-mid        #A8B0C8
--ink-low        #5F6884

--ecoli          #B8FF3C   chartreuse
--strep          #FF3B5C   crimson
--pseudo         #2FE6D6   pyocyanin cyan
--acineto        #FFB020   amber
--foil-a         #7B5CFF   foil gradient start
--foil-b         #2FE6D6   foil gradient end
--gold           #E8C46A   mythic / champion
```

**Typography**
- Display: a heavy condensed grotesque or a fantasy-adjacent serif for headings and card
  names (Secret Lair leans hand-lettered; we go *structured-heavy* so data stays legible).
- UI/body: a clean grotesk (Inter / Söhne-like).
- Data & accessions: monospace (`PYO-7`, `SP-123-432`, `42mm²`).

**Signature components**
1. **Foil card** — 3D tilt on pointer move, diagonal shine sweep, animated gradient
   border for Mythic. Prefers-reduced-motion disables tilt.
2. **Plate HUD** — circular plate image with detected-colony dot overlay and a floating
   metric chip. Directly borrowed from the Reshape UI. Used in match centre, card
   evidence, and stream overlays.
3. **Stat bar** — segmented 10-block bar, organism-coloured, with the numeric percentile.
4. **League table** — dense monospace-numeric football table with promotion/relegation
   colour bands.
5. **Countdown drop banner** — Secret Lair's "COMING SOON" pattern: full-bleed art,
   oversized display type, countdown, `NOTIFY ME`.
6. **Live ticker** — marquee of recent results (`House Davidoff ▲ 34mm halo · PYO-7`).
7. **Bracket** — SVG knockout tree, connector lines, house crests, live-match pulse.
8. **Timelapse loop** — autoplay muted looping plate growth, used as card art.

**Motion:** colonies *grow*. Loading states, transitions and reveals should use radial
growth easing rather than generic fades. The season-reveal moment is a timelapse
fast-forward. Everything respects `prefers-reduced-motion`.

**Accessibility:** organism colour is never the only signal — always paired with a glyph
(`◆ ◈ ◉ ◇`) and the organism name. Contrast ≥ 4.5:1 for all data text. Full keyboard
path through the bracket and league table.

---

## 6. Key page specifications

### 6.1 `/` Landing

```
┌─ promo bar: "Season III sealed panel opens in 4d 02:11:39 →" ────────────┐
├─ sticky nav: [MICROWAR]  CHALLENGES  BOARDS  HOUSES  CARDS  WATCH   🔍 [LOG IN] ┤
│                                                                          │
│  ╔═══════════ HERO: full-bleed timelapse of a pigmented plate ═════════╗ │
│  ║            SEASON III · THE PYOCYANIN OPEN                          ║ │
│  ║            [oversized display type]                                 ║ │
│  ║            32 houses · 4 continents · 1,280 plates                  ║ │
│  ║            [ ENTER A STRAIN ]  [ WATCH LIVE ]                       ║ │
│  ╚═════════════════════════════════════════════════════════════════════╝ │
│                                                                          │
│  ── LIVE TICKER ──────────────────────────────────────────────────────── │
│                                                                          │
│  NEW DROPS — open challenges            [ VIEW ALL → ]                   │
│  [card] [card] [card]  ◀ ▶            ← Secret Lair 3-up carousel        │
│                                                                          │
│  ON THE BOARD — this match day         [ VIEW ALL → ]                    │
│  [match centre strip: 4 live fixtures with plate thumbs + live scores]   │
│                                                                          │
│  THE VAULT — featured cards            [ VIEW ALL → ]                    │
│  [foil card] [foil card] [foil card]                                     │
│                                                                          │
│  WATCH — live now on Twitch                                              │
│  [stream embed] [channel list]                                           │
│                                                                          │
│  THE HOUSES — world atlas strip                                          │
│  [rotating globe / map with 32 pins]                                     │
│                                                                          │
│  HOW IT WORKS — 4 steps: Submit → Ship → Image → Score                   │
│  THE SCIENCE — "every stat links to its plate"                           │
│  SPONSORS · PARTNERS · FOOTER                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 `/boards/:competition/match/:id` — Match centre (the showpiece)

Two houses, side by side, with the *actual plates* as the pitch:

```
┌────────────────────────────────────────────────────────────────────┐
│  GROUP C · MATCH DAY 3 · LIVE  ⏱ 18h 22m into 48h run              │
│                                                                    │
│   HOUSE DAVIDOFF          34  –  27         THE LYNGBY LYSOGENS    │
│   ◈ PYO-7 "Midnight Bloom"    (mm halo)     ◆ ECO-12 "Ironside"    │
│                                                                    │
│  ┌──────────────────┐                   ┌──────────────────┐       │
│  │  [PLATE HUD]     │                   │  [PLATE HUD]     │       │
│  │  colony overlay  │                   │  colony overlay  │       │
│  │  ⬤ CFU 473       │                   │  ⬤ CFU 388       │       │
│  └──────────────────┘                   └──────────────────┘       │
│   ▶ timelapse scrubber ─────────────────────────────────●          │
│                                                                    │
│  ── GROWTH CURVES (live, overlaid) ─────────────────────────────── │
│  [dual-line kinetic chart, organism-coloured, CI bands]            │
│                                                                    │
│  ── MATCH STATS ────────────────────────────────────────────────── │
│  Halo diameter  34mm ████████░░ / ██████░░░░ 27mm                  │
│  µmax           0.42 ██████░░░░ / ████████░░ 0.51                  │
│  Replicates     n=6  · control drift 2.1% ✓ within tolerance       │
│                                                                    │
│  ── COMMENTARY FEED ───────────────  ── PLATE GALLERY ──────────── │
│  18:22 Pyocyanin front reaches       [thumb][thumb][thumb][thumb]  │
│        the inhibition edge                                         │
│  12:04 Davidoff replicate 4 voided                                 │
│        (lid condensation)                                          │
│                                                                    │
│  [ PROTOCOL ]  [ RAW DATA ]  [ DISPUTE ]                           │
└────────────────────────────────────────────────────────────────────┘
```

### 6.3 `/watch` — Streaming hub

- **Live now:** embedded Twitch players (primary), YouTube Live fallback.
- **Channel model:** one platform channel (`twitch.tv/microwar`) for flagship broadcasts,
  plus per-house channels labs can link. Houses streaming their own bench work is the
  growth engine — a PhD student streaming a plate pour is exactly the content.
- **Always-on ambient channel:** a 24/7 timelapse feed of the incubator rack. Zero
  production cost, infinite content, genuinely hypnotic. This is the "lofi beats to study
  to" of microbiology and it may be the single best marketing asset in the plan.
- **Data sidebar synced to stream:** live CFU counts, halo measurements, current
  leaderboard — driven from the same API as the match centre.
- **Broadcast formats:** Match Day Live, Sealed Panel Reveal, Plate Pour (how-to), Jury
  Deliberation (Chroma track), Post-season awards.
- Schedule with calendar export; VOD archive with chapter markers per fixture.

### 6.4 `/houses` — The fantasy-house layer

Real institutions get a house identity. **All house names are invented for the game and
must be clearly labelled as such** — no real university should appear to endorse the
platform before it has actually signed up. Naming rule: derive from the *place*, not the
institution's trademark, wherever possible.

| Institution | House | Colours | Signature organism |
|---|---|---|---|
| UC Davis | **The Davidoffs** | Gold / navy | *P. aeruginosa* |
| DTU Lyngby | **The Lyngby Lysogens** | Ice blue | *E. coli* |
| Wageningen | **The Wageningen Wildtypes** | Field green | *E. coli* |
| ETH Zürich | **The Zürich Zymurgists** | White / red | *E. coli* |
| Imperial College London | **The Kensington Kinetics** | Oxblood | *S. pyogenes* |
| Max Planck | **The Planck Plasmids** | Slate | *A. baumannii* |
| Karolinska | **The Solna Selectors** | Cobalt | *S. pyogenes* |
| University of Tokyo | **The Hongo Halos** | Indigo | *A. baumannii* |
| Tsinghua | **The Tsinghua Titers** | Vermilion | *E. coli* |
| NUS Singapore | **The Kent Ridge Colonies** | Teal | *P. aeruginosa* |
| KAIST | **The Daejeon Diffusers** | Steel | *A. baumannii* |
| Oxford | **The Oxford Oxidants** | Deep blue | *S. pyogenes* |
| Cambridge | **The Cam Conjugators** | Light blue | *E. coli* |
| TU Delft | **The Delft Dilutions** | Delft blue | *P. aeruginosa* |
| Ghent | **The Ghent Gradients** | Amber | *P. aeruginosa* |
| Chalmers | **The Göteborg Glycolytics** | Sea green | *E. coli* |
| EPFL | **The Lausanne Lysates** | Crimson | *S. pyogenes* |
| UNAM | **The Coyoacán Colonies** | Sun orange | *A. baumannii* |
| Cape Town | **The Table Mountain Titrators** | Protea pink | *P. aeruginosa* |
| IIT Bombay | **The Powai Plasmids** | Saffron | *E. coli* |
| Melbourne | **The Parkville Phages** | Bottle green | *S. pyogenes* |
| Toronto | **The Ontario Operons** | Maple red | *A. baumannii* |
| USP São Paulo | **The Paulista Pseudomonads** | Emerald | *P. aeruginosa* |
| Seoul National | **The Gwanak Gradients** | Jade | *A. baumannii* |

Each house page: crest (procedurally generated from organism + colours), motto, city,
PI, roster, season record, signature card, rivalry list, streak, trophy cabinet.

### 6.5 `/app/submissions/:id` — The status pipeline

This page is the participant's trust anchor. A physical sample left their lab; they need
to know exactly where it is and what happened to it.

```
DRAFT → SUBMITTED → SAFETY REVIEW → ACCEPTED → SHIPPED → RECEIVED
→ ACCESSIONED → QC → PLATED → INCUBATING → IMAGED → ANALYSED
→ SCORED → PUBLISHED  (→ DISPUTED → RE-RUN)
```

Each stage carries a timestamp, an actor, and an artefact (courier tracking number,
accession barcode, plate map position, run ID, image count, score breakdown). The
`INCUBATING` stage shows the **live timelapse of their own plates** — that is the moment
a participant becomes an evangelist.

---

## 7. Data model (core entities)

```
Organisation ──< House ──< Member (Scientist, ORCID)
House ──< Submission ──< Sample ──< Aliquot
Submission ──> StrainRecord | MediaRecipe | Pairing
StrainRecord ──> Taxonomy, Genotype, Provenance, ParentStrain(self-ref), BSL
MediaRecipe ──< Component (name, concentration, unit, supplier, cost)
Challenge ──< ConditionPanel ──< Condition (public|sealed)
Challenge ──< Entry (Submission × Challenge)
Run ──< PlateMap ──< Well/Plate ──> Entry | Control
Plate ──< Image (timestamp, lighting mode, device)
Image ──> AnalysisResult (model version, CFU, area, halo mm, RGB, OD)
Entry ──< Measurement ──> Score (raw, normalised, CI, corrections applied)
Score ──> LeaderboardPosition (public|private)
Entry ──> Card (rarity, edition, art, flavour, licence)
Competition ──< Group ──< Fixture ──> MatchResult
Fixture ──> Run (the physical run backing the fixture)
Stream ──> Fixture | Challenge
Dispute ──> Score, Resolution
AuditEvent (append-only, everything)
```

**Non-negotiables:** every `Score` is reproducible from `AnalysisResult` + published
formula + model version; every `AnalysisResult` names its model version; `AuditEvent` is
append-only.

---

## 8. Instrument & data integration

The measurement layer is what makes this credible. Mapped to the Reshape stack observed:

| Need | Reshape capability |
|---|---|
| Kinetic growth, timelapse, art track | **Smart Incubator** — 75 petri / 50 MTP per rack, imaging from every 10 min, 5 temperature zones, top/bottom light + fluorescence, ambient+3 °C to 40 °C |
| Bulk endpoint scoring, viable counts | **HT Imaging Device** — ~600–650 plates/hr, ~8 s/plate, 12.3 MP, dual lighting, barcode, output carousel |
| Analysis | **Discovery Platform** AI models — total viable count, differential counts, halo/zone, growth kinetics, OD turbidity, colorimetric, radial growth, antagonism, fluorescence, morphology |
| Integration | API access for LIMS integration (Industry tier); organisation-specific organism libraries; model builder for custom assays |

**Integration architecture**

```
Reshape Discovery API ──▶ MicroWar Ingest Service
                            │
                            ├─ image objects → CDN (public) / cold store (raw)
                            ├─ AnalysisResult → normalisation & batch correction
                            ├─ control drift check → void or accept run
                            └─ Score → leaderboard + card stat refresh
                                          │
                                          └─▶ WebSocket → live match centre + stream overlay
```

- **Custom models to commission:** a *pigment-area / pattern-entropy* model for the
  Chroma track, and a *co-culture dominance* model for Arena. Reshape's Industry tier
  includes a model builder and one custom model — that is the hook.
- **Barcode = blinding.** Plates carry accession barcodes only. The mapping from barcode
  to house is held server-side and not exposed to operators or to the model.
- **Federated mode (phase 3):** labs that own their own Reshape hardware run challenges
  locally and stream results up, with a calibration cartridge to make cross-site data
  comparable. This is how the platform scales past one central facility.

---

## 9. Scoring engine

```
raw_metric        (e.g. halo diameter mm, CFU, µmax, ΔRGB)
  → control_normalised   (÷ reference control on same plate)
  → batch_corrected      (mixed model: plate position, incubator slot, run date)
  → trimmed_mean         (across n≥3 replicates, trim outliers)
  → normalised_score     (percentile vs. field, or vs. absolute target)
  → track_weighting      (challenge-specific formula, published)
  → final_score + 95% CI
```

- Formula published as runnable code on `/challenges/:slug/scoring`.
- Ties inside the CI are **draws**, not coin-flips.
- Composite challenges use an explicit weighted sum with published weights; no hidden
  judge discretion outside the Chroma track.
- Chroma track: 60% quantitative (pigment area × saturation × pattern entropy) + 40%
  blind jury ballot, ballots published after the fact.

---

## 10. Gamification (beyond cards)

- **House Elo** across seasons; promotion/relegation between Division I and II.
- **Season pass** of free challenges/objectives (spectators and participants both).
- **Badges:** first submission, sealed-panel survivor, giant killer, record breaker,
  100 plates, cited-in-publication, art-gallery selection.
- **Fantasy league:** spectators draft a lineup of strain + media cards and score from
  real assay outcomes. This is the mechanism that gets non-scientists watching.
- **Pick'em brackets** for knockout rounds.
- **Trophy cabinet** per house; **retired cards** in the Hall of Fame.
- **Teaching-lab division** — a separate ladder so undergraduate courses can compete
  without facing research groups. `/education` ships a course module. This is the
  highest-leverage growth channel in the whole plan: one course = 30 new participants
  per semester, every semester.

---

## 11. Content & editorial

A league without storytelling is a spreadsheet. Editorial surfaces:

- **Dispatch** — match reports auto-drafted from run data, then human-edited.
- **Storylines** on the season hub — rivalries, streaks, upsets.
- **Lab profiles** — who these scientists actually are.
- **Method explainers** at `/methods/:assay` — genuinely useful, and the SEO engine.
- **Exhibitions** — curated bacterial-art collections; partner with a museum.
- **Post-season report** — an open dataset + DOI. The academic deliverable that
  justifies participation to a PI.

---

## 12. Governance, safety & trust

This section is a product requirement, not legal boilerplate. It is also the reason
institutions will say yes.

- **Containment policy.** Default competitive entries are BSL-1 surrogates or attenuated
  strains. Any BSL-2 work is confined to accredited central facilities. `/biosafety`
  states the policy publicly and every card displays its containment class.
- **Dual-use review.** Every submission passes a **responsible-research screen** before
  acceptance (`/admin/safety-review`). The platform optimises for *antimicrobial
  discovery and bioproduction*, and explicitly does not run challenges that select for
  increased virulence, transmissibility or host range. State this prominently at
  `/ethics` — it is a feature for funders, not a disclaimer.
- **AMR-responsible framing.** The Antibiotic Titer track is about *finding new
  inhibitory compounds*, with resistance-development monitoring built into the protocol.
- **Shipping & permits.** Per-region guidance, MTAs, import permits, courier integration,
  and a hard block on submissions from jurisdictions without a valid path.
- **IP & licensing.** Explicit, chosen at submission: default open (CC-BY for data,
  OpenMTA for material) with an embargo option for labs with pending publications.
  Nobody submits a strain without knowing who owns what.
- **Data integrity.** Blinded barcodes, published model versions, append-only audit log,
  reproducible scoring, public dispute process.
- **Moderation.** Art track submissions, flavour text and house names are moderated;
  stream chat is moderated.

---

## 13. Technical architecture

### 13.1 Demo architecture — **decided**

The demo is **Next.js compiled to a single static artifact**, with a **mock backend in
JavaScript** bundled into it. No server, no database, no runtime dependency.

**Deploy target: `https://engel-wolf.com/documents/micro-war/index.html`** — a
subdirectory of an existing site, not a domain root. That single fact drives the config.

```
next.config.ts
  output: "export"                      → npm run build emits a self-contained out/
  basePath: "/documents/micro-war"      → REQUIRED: site is served from a subpath
  assetPrefix: "/documents/micro-war/"  → REQUIRED: or every JS/CSS/font 404s
  trailingSlash: true                   → /foo/index.html works on any static host
  images.unoptimized                    → no image-optimisation server in a static export
```

**`basePath` is the whole ballgame for a subpath deploy.** Without it the exported HTML
requests `/_next/static/...` from the domain root, which on `engel-wolf.com` is somebody
else's directory, and the page loads as unstyled HTML with no JS. With it, Next rewrites
every `_next` asset URL *and* every `<Link href>` automatically.

Rules that follow from the subpath, all of which are easy to get wrong:
- Use `next/link` and `next/image` everywhere. They apply `basePath` for free.
  A hand-written `<a href="/cards">` will break — it must be `<Link href="/cards">`.
- Anything referenced from `public/` (favicon, OG image, fonts) needs the prefix
  applied manually: read `process.env.NEXT_PUBLIC_BASE_PATH` rather than hardcoding,
  so a root-domain deploy still works.
- Set `metadataBase` in the root layout to the full deploy URL, or OG/Twitter tags
  emit relative URLs that no social scraper can resolve.
- Keep `basePath` in an env var (`NEXT_PUBLIC_BASE_PATH`), defaulting to `""`, so the
  same source builds for both a root-domain deploy and the `/documents/micro-war/`
  deploy without editing config.

Result: `out/` is a plain folder of HTML/JS/CSS. Upload its **contents** into
`documents/micro-war/` on the web host and the entry point is
`documents/micro-war/index.html`. It drops equally onto S3, nginx, GitHub Pages, or a
USB stick. Nothing to operate, nothing to pay for, and it can be handed to a lab as a
zip.

**Constraint to accept up front:** a static artifact at a subpath has **no server-side
routing**. Deep links work only because `trailingSlash: true` writes a real
`index.html` into every route folder. There is no custom 404 rewrite and no redirect
capability unless the host provides one — so the app must never depend on server
rewrites, and any "not found" state has to be handled client-side.

**The mock backend** lives in one file, `src/lib/api.ts`, and is the *only* module that
knows where data comes from. Every page and component calls it; nothing imports fixtures
directly. Swapping to the real API in Phase 1 is a one-file change.

```ts
// src/lib/api.ts — the seam
export async function getSeason(): Promise<Season>
export async function listChallenges(f?: ChallengeFilter): Promise<Challenge[]>
export async function getChallenge(slug: string): Promise<Challenge | null>
export async function getLeaderboard(slug: string): Promise<LeaderboardEntry[]>
export async function listHouses(): Promise<House[]>
export async function getHouse(slug: string): Promise<House | null>
export async function listCards(f?: CardFilter): Promise<Card[]>
export async function getCard(id: string): Promise<Card | null>
export async function getGroups(competition: string): Promise<Group[]>
export async function listFixtures(competition: string): Promise<Fixture[]>
export async function getFixture(id: string): Promise<Fixture | null>
export async function listStreams(): Promise<Stream[]>
export async function getTicker(): Promise<TickerItem[]>
```

Rules for the seam:
- Every function is `async` and returns a Promise, even though the data is local —
  so the call sites are already shaped for a real network.
- Include a small simulated latency (`await delay(120 + Math.random() * 180)`) so
  loading states get built and tested now rather than retrofitted.
- **Server Components await these at build time**, so the artifact ships prerendered
  HTML (good for SEO, press links and the pitch).
- **"Live" surfaces are client islands** over the same data: the ticker, the live match
  score, the countdown, the timelapse scrubber. A `useLiveFixture(id)` hook walks the
  stored kinetic curve forward on a timer so a match visibly progresses while someone is
  watching the demo. This is what makes a fixture-driven demo feel like a live platform.
- Every dynamic route needs `generateStaticParams()` — required by `output: "export"`.

### 13.2 Production architecture — Phase 1+

```
Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
   · RSC for public/SEO pages, client islands for live views
   · Framer Motion for card/foil motion
   · visx or Recharts for kinetic curves
   · MapLibre for /atlas

API: tRPC or REST + OpenAPI (public read API is a product in itself)
Realtime: WebSocket / SSE for live scores, ticker, stream overlays
DB: PostgreSQL + Prisma. TimescaleDB for kinetic time-series.
Object store: S3-compatible; CDN for plate imagery; cold tier for raw TIFFs
Auth: Auth.js — ORCID OAuth (participants), magic link/social (spectators), SSO (institutions)
Search: Typesense/Meilisearch across cards, houses, methods
Queue: background workers for ingest, scoring, card minting
Streaming: Twitch embed + EventSub; overlay served as a browser source for OBS
Infra: Vercel or containerised; Postgres managed; IaC
Observability: structured logs, run-level tracing, score-recompute diffing
```

The static demo upgrades cleanly: drop `output: "export"`, point `src/lib/api.ts` at the
real endpoints, keep every component untouched.

### 13.3 Plate artwork without a photo library

The demo has no real plate photography and must not borrow any. Draw plates
**procedurally in SVG** from a seeded `PlateArt` descriptor (`agar`, `colony`, `accent`,
`pattern`, `seed`). Five patterns cover every track: `colonies`, `swarm`, `halo`,
`rings`, `lawn`. Deterministic seeding means a card always renders the same plate.

This is better than stock imagery for three reasons: it is legally clean, it scales to
hundreds of unique cards for free, and it can be **animated** — colonies growing from
scale 0 is the timelapse effect, and it doubles as the loading state.

---

## 14. Build phases

| Phase | Scope | Outcome |
|---|---|---|
| **0 — Demo** *(this brief)* | Landing, challenge index + 1 full challenge, leaderboard, houses, card gallery, match centre, watch, login mode-chooser. JSON fixtures, no backend. | Something to show labs and funders |
| **1 — Pilot** | Real auth (ORCID), submission wizard, safety review, manual scoring, one real challenge, 4–8 houses | One real challenge run end-to-end |
| **2 — Instrumented** | Reshape API ingest, automated scoring, live match centre, streaming overlay, card minting | The league actually runs itself |
| **3 — League** | Full season structure, brackets, fantasy, open datasets + DOIs, education division | A season with 32 houses |
| **4 — Federated** | Distributed instruments, cross-site calibration, custom AI models, sponsor challenges | Global scale |

---

## 15. Demo scope — **decided**

Build **Phase 0** as a dark, card-styled **Next.js static export** over the mock backend
in `src/lib/api.ts`. **The landing page is the showpiece** and gets the most design
effort; everything else is built to a consistent but lighter standard.

| Route | Fidelity | Notes |
|---|---|---|
| `/` | **Showpiece** | Full-bleed procedural plate hero, countdown, live ticker, 3-up drop carousel, board strip, foil vault shelf, atlas strip, how-it-works |
| `/login` | High | Spectator / Participant mode chooser as two facing foil cards |
| `/challenges` | High | Filterable index |
| `/challenges/[slug]` | High | One fully-specified challenge (*The Pyocyanin Open*) |
| `/leaderboards` | Medium | Global ranking, public vs. sealed columns |
| `/houses` | High | World grid of 24 houses |
| `/houses/[slug]` | Medium | 2 fleshed out, rest generated |
| `/cards` | High | ~24 foil cards with tilt + shine |
| `/cards/[id]` | High | Stat bars + evidence view |
| `/boards/[competition]` | Medium | Group tables + bracket |
| `/boards/[competition]/match/[id]` | High | Match centre, live-updating |
| `/watch` | Medium | Stream placeholders + schedule + ambient channel |

Fixture content: 1 season, 24 houses, 24 strain cards, 8 media cards, 8 groups,
48 fixtures (1 live), 12 challenges, 6 streams, 20 ticker items.

**Build & deploy**

```bash
npm run build                 # → out/  (static, basePath-aware)
# upload contents of out/ into  documents/micro-war/  on engel-wolf.com
# entry point: https://engel-wolf.com/documents/micro-war/index.html
```

Add an `npm run deploy` script once the transport is chosen (§15.1). Until then the
artifact is produced by `npm run build` and uploaded by hand.

### 15.1 Deployment — open

`engel-wolf.com` is an existing site; the transport into `documents/micro-war/` is not
yet known to this plan. Candidates, in order of preference for an automated push:

1. **rsync over SSH** — `rsync -avz --delete out/ user@host:~/public_html/documents/micro-war/`.
   Best option: atomic-ish, incremental, scriptable, no extra service.
2. **SFTP/FTP** — works with most shared hosting; use `lftp mirror -R`.
3. **Git-based deploy** — if the host pulls from a repo, push a `gh-pages`-style branch
   containing the built `out/`.
4. **CI push** — GitHub Actions builds on tag and deploys via (1) or (2) using
   repository secrets. This is the end state.

Whichever is chosen, the built artifact must **not** be committed to `main`. Either
publish it to a separate deploy branch or build it in CI.

---

## 16. Open questions

1. **Deployment transport to `engel-wolf.com`** — SSH/rsync, SFTP, or a host control
   panel? Needed before the push can be automated. *(blocking §15.1)*
2. **GitHub access** — no `gh` CLI and no GitHub token on this machine. Needed to create
   the private repo. *(blocking)*
3. **Name** — keep *MicroWar*, or test *Petri League* / *Agar Arena* / *The Culture
   League* with the first three target labs?
4. **Centralised or federated measurement** in the pilot? Centralised is far easier to
   make fair; federated is far easier to scale. Recommend centralised for Phase 1.
5. **Is Reshape a partner or just a reference?** The plan assumes their API. If they are
   an actual partner the demo should be co-branded and the `/equipment` page becomes a
   joint asset.
6. **Prize model** — sponsor cash, instrument time, co-authorship, or compute/reagent
   credits? Co-authorship and free plate-runs may motivate academics more than cash.

**Answered:** delivery format → Next.js static export to a single hostable artifact
(§13.1); showpiece → landing page (§15); hosting → `engel-wolf.com/documents/micro-war/`
with `basePath` (§13.1).
