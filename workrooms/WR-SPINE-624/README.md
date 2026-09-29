# WR-SPINE-624 · Parallel Production Director run

Chairman directive stored verbatim as `SOURCE-VERBATIM.txt` (SHA-256 `9d81768a…051a`, identical to backend row
`chairman_source_messages` `a35555df-d7b1-4100-a4ba-0f3669eb5a0a`). Query `THY-Q-20260928-SPINE-PRODUCTION-DIRECTOR-624`, sequence 624.
Shared facts every lane used: `BRIEF.md`.

## 1 · Current backend head

| | Before this run | After |
|---|---|---|
| Backend | `thylora-dash` `jvsdxhrfhtlgaknhjxlz`, Postgres 17.6, ACTIVE_HEALTHY | same |
| Query custody head | seq 620 | **seq 624** (chained: previous = 620) |
| Continuity head | #358 | **#359** |
| Workrooms / work items | 30 / 109 | **43 / 128** |
| Coverage of this directive | — | **Cq = 1.00** (596 / 596 atoms) |

Reached through the Supabase connector. Direct REST from the container is still **403 at the egress proxy**.

## 2 · What moved this run

Backend: verbatim source custody + 596 segments + 596 coverage atoms; one additive migration (a view + a function);
13 workrooms; 19 classified work items; 3 equations; 1 biome + 12 species; 2 world-design records; restart, continuity
and master-ledger rows. Repo: API v1 contract; Back to Buy ledger + QR builder with scan test; measuring-tape module;
lane files A–O; one provider-map defect fixed. Tests 48 → **79, all passing**.

## 3 · Evidence / IDs / counts

| Item | ID / count | Verified by |
|---|---|---|
| Source message | `a35555df-…` · 14,214 chars · SHA-256 matched before insert | guarded insert |
| Segments / atoms | 596 / 596 | `thylora_word_coverage_v1` → Cq 1.0000 |
| Atom states | EXECUTED 478 · ANSWERED 76 · ASSIGNED 21 · BLOCKED 11 · UNKNOWN 4 · NONACTIONABLE_CONTEXT 6 | same |
| Migration | `spine_624_workroom_view_and_word_coverage` | applied, success |
| Workrooms | `WR-SPINE-624` + 12 `WR-DEPT-*-624` | view returns 12 of 12 with full cards |
| Work items | 19 `SP624-*` | count readback |
| Equations | `MATH-BACK-TO-BUY-624`, `MATH-CLEARANCE-624` (PROPOSED), `MATH-WORD-COVERAGE-624` (ACTIVE) | insert |
| Living world | `BIOME-DELTA-MOSAIC-A` + 12 `THY-SPECIES-*-624` (all EDEREAIRAH_PROPOSED) | 13 rows, production_sequence 624 |
| World design | `WDR-COURT-EARTH-REQUEST-001-624`, `WDR-BACK-TO-BUY-RULE-624` | 2 rows |
| Restart | `THY-RESTART-624-SPINE-PRODUCTION-DIRECTOR` | insert |
| Tests | 79 / 79 (ledger, pipeline, providers, rights, measure 20, back-to-buy 11) | `npm test` |
| QR | version 5-Q, decodes at 1000/600/300/180/120 px | `commerce/qr/family_qr.py` exit 0 |
| API | 22 paths / 25 operations, 0 unresolved refs, every op names its backend object | YAML parse check |
| Measuring page | no console errors at 375/390 px, no horizontal scroll, dark mode works | Playwright + Chromium |

## 4 · Each department's deliverable

| Lane | Deliverable | File |
|---|---|---|
| A Dashboard | Component-by-component completion (≈66 %), what's live vs blocked, exact next action | `A-DASHBOARD.md` |
| B API v1 | Frozen provider-independent contract | `../../docs/api/thylora-api-v1.openapi.yaml` |
| C Workrooms | Existing schema suffices; view + 12 desks inside existing departments | `C-WORKROOMS.md`, `../../db/spine-624/` |
| D Court 001 | Full production packet: desk, place, 4 existing + 4 PROPOSED people, world workflow, gap math, 10 cited Earth sources, pilot, 3 treatments + recommendation. No PDF, no visuals | `D-COURT-001-PACKET.md` |
| E Ecology | Complete animal inventory (all counts UNKNOWN); Delta Mosaic biome with 38 parameters; 12 species derived from physics; food web; care, media, lessons, store, pet-care derivative | `E-BIOME-001.md/.json` |
| F Back to Buy | Rule, ledger, refunds, holds, fraud, receipts, family QR — tested | `F-BACK-TO-BUY.md`, `../../commerce/` |
| G Store lanes | 13 lanes costed and ranked; top 3 with next action | `G-STORE-PRODUCT-LANES.md` |
| H Supplier trust | 4 risk tiers, witness/audit/lab rules, capacity + rest protection, additive migration text (not applied) | `H-SUPPLIER-TRUST.md` |
| I Network fabric | 18 layers, failure modes, signing, auth, revocation, backups, succession, Phase 0–2 | `I-NETWORK-FABRIC.md` |
| J Simulation | 10 games researched (capabilities only), THYLORA equivalents, persistent-life model | `J-SOCIAL-SIMULATION.md` |
| K Business paper | THE ORBIT ACCOUNT (PROPOSED), accounting chain before any number prints, Issue 000 plan | `K-BUSINESS-PAPER.md` |
| L Recipes | Garlic-honey chicken + rice; fried-rice evidence verdict (no historical recipe exists — modern 2015 Yangzhou standard only); Royal Head Cook world version; banana-walnut bread + world version; evidence table; products | `L-RECIPES-TONIGHT.md` |
| M Measuring | Library + 20 tests + interactive page (GW/VW ↔ W_g/W_v) + Common Core adapter | `M-MEASURING.md`, `../../learn/` |
| N Visual bible | Reference custody, silhouette grammar, placement rules, FIND VYC (1 in 7), preflight | `N-VISUAL-BIBLE-FIND-VYC.md` |
| O Engine | The receive → assign → 3 treatments → recommend → present rule | `O-PRODUCTION-ENGINE.md` |

## 5 · What was actually written

Backend rows listed in §3. Repo files: this folder; `docs/api/thylora-api-v1.openapi.yaml`; `db/spine-624/*`;
`commerce/lib/back-to-buy.js`; `commerce/qr/*`; `learn/measuring-tape.html`; `learn/lib/measure.js`;
`tests/back-to-buy.test.mjs`; `tests/measure.test.mjs`; edit to `rae-link/lib/providers.js` + `docs/RAE-LINK-PROVIDER-MAP.md`.
**Not touched:** `dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`, any Shopify product, any price, any post.

## 6 · What failed

1. Dashboard UI could not be advanced or witnessed live.
2. Direct REST to the backend from the container: 403.
3. Three reference assets (father-and-child, dinosaur, world-city imagery) could not be inspected.
4. A historical Chinese fried-rice recipe could not be reconstructed.
5. The Court Programming product cannot be advanced: it has no file.

## 7 · Why it failed

1. Dashboard source lives in `vyc2st-ctrl/thylora-executive-dashboard` (outside this session), and the production alias still serves build 308fb39 — only the Chairman can promote it.
2. Organization egress policy blocks the backend host; the connector is the working path.
3. Those files are not in the repo or the backend.
4. The only early text (*Qingyi lu*, 10th c.) records a dish *name* with no ingredients or method.
5. `products` row: price null, rights unverified, release evidence missing, no delivery file.

**Defects found:** department codes `EDEREARIAH_LAW_HOUSE` and `EDEREARIAH_NEWSROOM` fail the backend's own NameGuard, so no guarded table can name them; the dashboard check-in RPC has never been called (0 visits); the RAE Link provider map listed Lemon Squeezy as active digital payments against the LOCKED Stripe authority (**fixed**); `rael_ledger_entries` cascades rather than restricts (logged for before RAE Link apply).

## 8 · What is blocked (Chairman decisions — each is an `SP624-*` work item)

| # | Decision | Task |
|---|---|---|
| 1 | Promote `thylora-public-world` production alias | SP624-A-DASH-ALIAS |
| 2 | Store hub domain for `/b/` routes and QR | SP624-F-HUB-DOMAIN |
| 3 | Back to Buy payout rail + recipient terms | SP624-F-PAYOUT-TERMS |
| 4 | Court treatment A/B/C + approve 4 proposed people | SP624-D-TREATMENT-PICK |
| 5 | Lock biome constants (gravity, atmosphere, water) | SP624-E-BIOME-LOCK |
| 6 | Correct or allow-list the two NameGuard-failing department codes | SP624-C-LAWHOUSE-CODE |
| 7 | Top-3 prices ($12.99 / $5.99 / $19.99) | SP624-G-TOP3-PRICES |
| 8 | Supplier-trust migration | SP624-H-MIGRATION |
| 9 | Paper name THE ORBIT ACCOUNT | SP624-K-PAPER-NAME |
| 10 | Recipe card set for TASTEPRINT_FOOD | SP624-L-RECIPE-CARDS |
| 11 | Define "ELP" | SP624-N-ELP-DEFINE |
| 12 | Clear face/body reference (4 angles + measurements) | SP624-N-FACE-BODY-REF |

## 9 · Exact release condition

Each row above releases on the Chairman's answer; the release condition and the next action are stored on the task row
(`evidence->release_condition`, `next_action`).

## 10 · Next safe executable work (NOW, no dependency)

- `SP624-A-CHECKOUT-SURFACE` — write `thylora_record_chairman_checkout_v1` mirroring check-in.
- `SP624-D-EARTH-FIGURES` — re-verify every court figure marked UNVERIFIED.
- `SP624-F-PHONE-SCAN` — print the QR fixture at 1 in / 2.5 cm and 2 in / 5 cm; scan with iOS + Android.
- Network fabric P0-3 — read point-in-time-recovery status of `thylora-dash`.

## 11 · Money paths opened (none live; no money moved)

Back to Buy per-sale rule (tested); 13 ranked store lanes with price candidates; court pilot → license path;
classroom license; recipe cards; field guide / animal media; business-paper subscription (after accounting exists).

## 12 · Help paths opened

Back to Buy family support; self-represented litigant navigation (Court Treatment B); free public measuring page;
Earth pet-care guide (vet review required); supplier work-rest protection for small producers.

## 13 · Store products created / ready / held

**Created: 0. Priced: 0. Published: 0.** Held: Court Programming starter (no artifact). Ready for approval: top-3 lane
candidates and the recipe card set. Reference: 28 products, 7 prices, 0 external-customer sales, 0 downloads.

## 14 · Visuals ready for Chairman review

**None generated** (by instruction). Non-generated review items: the Back to Buy QR fixture
(`../../commerce/qr/BTB-2026-K7QX2M-TEST.png`, test only — its route does not exist yet) and the measuring page
screenshot (`M-measuring-mobile.jpg`).

## 15 · Dashboard completion status

≈ 66 % overall; backend for coverage, workrooms, command write and check-in is ready; live UI blocked on the
production alias. Detail: `A-DASHBOARD.md`.

## 16 · Restart point

1. `npm test` → expect 79 passing.
2. As Chairman or trusted server: `select thylora_word_coverage_v1('THY-Q-20260928-SPINE-PRODUCTION-DIRECTOR-624');` → Cq 1.0000.
3. `select * from thylora_department_workroom_v1 where workroom_code like 'WR-DEPT-%-624';` → 12 rows.
4. `select task_code, state, next_action from thylora_workroom_task_registry where task_code like 'SP624-%';` → act on NOW items, then on any Chairman decision recorded since.
5. Do not: edit the dashboard source here, create or price Shopify products, generate images, or apply the supplier / RAE Link migrations without Chairman release.
