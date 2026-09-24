# THYLORA One-App Architecture: Living Business App Reconciliation

**Workroom:** THYLORA HEAD — SPINE FORWARD · ONE-APP ARCHITECTURE
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`, ca-central-1, ACTIVE_HEALTHY)
**Read at:** 2026-09-24
**Mode:** read-only. No record was deleted, merged, updated or inserted. No DDL. No deploy.
**Raw evidence:** `docs/evidence/one-app-reconciliation-2026-09-24.json`

---

## 0 · Answer first

Of the 12 `living_business_app_registry` entries:

| Class | Count | Entries |
|---|---|---|
| **Separate deployed app** (its own Vercel project or origin) | **0** | none |
| **Deployed screen, not linked** (exists as a page inside the live THYLORA app, reachable only by URL) | **1** | `LBA-GAME-BET-001` |
| **Business instance, not deployed** (real business record, deep backend, no UI) | **1** | `CW-LIVING-APP-001` (C&W Auto & Customs) |
| **Backend-only platform spec** (tables exist, no UI, launch gated) | **1** | `APP-ADULT-CREATOR-001` |
| **Template** (no business bound, no UI, no route) | **9** | `LBA-GENERAL-001` + 8 presets |

**None of the 12 is a separately deployed app.** Every row's `state` says `IN PRODUCTION`, but for 11 of the 12 there is no UI anywhere. Read `IN PRODUCTION` as "registered/seeded", not as "deployed".

**Recommended conceptual shape:** there is one THYLORA experience. The 9 templates are **one Living Business App module** with a template picker. C&W is the **first business room** created from that module. The Sportsbook is a **screen in the Sports & Games section**. The Adult Creator Platform is the **one entry that must stay a separate, walled surface**. It shares the backend and identity but is never linked from the family app.

---

## 1 · Where things actually live (hosts)

| Host | What it is | Evidence |
|---|---|---|
| Vercel `thylora-public-world` | **Deployment authority.** Chairman dashboard, `/app` (member app, `index-v8.html`), `/public-site`, `/store`, `/family` | Git-linked to `vyc2st-ctrl/thylora-executive-dashboard`. Production deploy `dpl_CYd64iR6miVsVhfGQWEup9EY87P1`, sha `90003f3`, READY |
| Vercel (11 other projects) | `thylora-store`, `-warehouse`, `-submit`, `-library`, `-library-open`, `-head-current`, `-current-head`, `-head-authority-probe`, `-dashboard-recovery`, `-independent-dashboard`, `storefront-dashboard` | `list_projects`. **No project is named for, or serves, any of the 12 registry entries** |
| This repo `vyc2st-ctrl/Thylora` | Development source: `public-site/`, `app/`, `rae-link/`, `db/rae-link/` | **No Vercel project is Git-linked to this repo** (`list_projects repoUrl=…/Thylora` → 0). Matches `DASHBOARD_AUTHORITY.md` |
| Shopify theme `149333082189` (unpublished) | Store lanes | `thylora_store_lane_routes`: 5 lanes, all `TEMPLATE_BUILT_IN_REPO_NOT_YET_UPLOADED_TO_THEME` |

---

## 2 · Reconciliation, entry by entry

Columns: **UI module** = row in `thylora_ui_modules` (76 rows). **Public** = row in `public_site_navigation` (13 rows). **Code** = files in either repo. **C&W / business link** = `business_id` resolved against `businesses` (7 rows).

### 2.1 `LBA-GAME-BET-001`: THYLORA Sportsbook + Chairman Casino

| Check | Result |
|---|---|
| UI module | **YES.** `thylora_ui_modules.module_key = GAME-BET-001`, section `SPORTS`, route `/app/sports-betting.html`, `ACTIVE`, source `game_bet_operators` |
| Code | **YES, in both repos.** `app/sports-betting.{html,js,css}` (this repo, commit `e4a9a83`, 2026-08-26) and the same files in `thylora-executive-dashboard/app/` |
| Deployed | **YES as a page on `thylora-public-world`**, not as its own app |
| Linked in navigation | **NO.** Not referenced from `app/index.html`, `app/index-v8.html`, any `app/*.js`, or `sw.js` in either repo. It is reachable only by typing the URL. |
| Backend | 22 `game_bet_*` tables. Seeded: `market_catalog` 11, `staff_roster` 9, `game_lab` 4, `report_policy` 3, `casino_games` 2, `operators` 1, `intelligence_reports` 1. **All transactional tables are 0**: tickets, markets, events, accounts, rounds, sessions, odds history, audit events |
| Module record | `thylora_module_records` `GAME-BET-001` = `GOVERNING_PRODUCT_PROTOCOL`, `IMPLEMENTATION_ACTIVE` |
| Business link | `business_id = ER-CHAIRMAN-HOUSE-001`. **Not in `businesses`.** It appears only inside `game_bet_operators` |
| Omniview | `thy_omniview_links` GAME-BET-001 ↔ FOOTBALL is `BLOCKED`: "whether it belongs to FOOTBALL canon is not established" |
| Section drift | The UI module sits in section `SPORTS`. Every other sports module (`sports`, `franchise`, `games`) sits in `Sports & Games`, so this is an orphan section key |

**Verdict:** a deployed **screen** that is not linked. It is not a template, and it is not a Living Business App in the template sense. It is a product surface.
**One-app placement:** Sports & Games → *Sportsbook + Casino*, beside Sports Front Office. Age/identity gate on entry, per its own `customer_flow`.

### 2.2 `CW-LIVING-APP-001`: C&W Auto & Customs, Living Business App

| Check | Result |
|---|---|
| UI module | **NO** |
| Public nav | **NO** dedicated route. The public site mentions C&W only as the "FIRST BUSINESS RECORD" text card inside `#residency` (this repo, `public-site/index.html`); the authority repo's public site does not mention C&W |
| Code | **NO** C&W-specific screen in either repo. `app/app.js` lists all `businesses` rows generically in the Business Factory view, so C&W would show there as one row |
| Deployed | **NO** |
| Business link | `business_id = CW-AUTO-CUSTOMS-001` → **resolves** in `businesses`: *ErsatzReality Enterprise presents C&W Auto & Customs*, `IMPLEMENTATION_ACTIVE`, `PRIVATE_DEVELOPMENT`, `REVIEW_ACTIVE`, from factory session `BF-CUST-001-CW` |
| Template lineage | `template_type = BUSINESS_FACTORY_CUSTOMER_001`. That value matches no template row; it names the Business Factory's first customer |

C&W records found in `thylora-dash` (text search across all 906 public tables):

| Record | Evidence |
|---|---|
| Business | `businesses` CW-AUTO-CUSTOMS-001 |
| Factory session | `business_factory_sessions` BF-CUST-001-CW `IMPLEMENTATION_ACTIVE` |
| Residency | `business_residency_applications` THY-BRA-CW-AUTO-001, `ACCEPTED WITH CORRECTIONS`, publish `PRIVATE`, desired "Living Business App / website presence" |
| Program | `program_registry` CW-GATE1-001 `IMPLEMENTATION_ACTIVE` (Gate-1 business + facility spec) |
| Workroom | `thylora_workroom_registry` WR-CNW-GARAGE-001 `ACTIVE_SIMULATION_PRODUCTION`: 52 staff, 10 episodes, 10 simulation projects, 0 Earth employees |
| Automotive backend | `er_automotive_*` and `er_vehicle_*`: staff assignments 52, revenue matrix 18, vehicle class matrix 12, show episodes 10, build sheets 10, project pipeline 10, identifier map 8, gap registry 8, plus others |
| Store | `thylora_store_product_readiness`: 3 C&W-related products, all `DRAFT`, `active_allowed=false` (Engineering Notebook Vol. 1; Eight Things Cars Still Get Wrong, flagged as a duplicate of Vol. 1 awaiting a Chairman decision; Gap Hunt, which cross-references the C&W gap registry) |
| Store lane | `LANE-HOW` lists "C&W Engineering Notebook Vol. 1" `IN DEVELOPMENT` |
| Staff | `thylora_department_personnel` 52 rows |
| Autonomy | THY-AUTO-CW-DATA-PATCH-PLAN-001 `WAITING_CHAIRMAN` (documents only, no DDL) |

**ID drift (recorded, not fixed):** the residency record uses `business_id = THY-BIZ-CW-AUTO-001`. The `businesses` table uses `CW-AUTO-CUSTOMS-001`. The two IDs name the same business, but no column joins them.

**Verdict:** the **first business instance**. It has the deepest backend of any entry and no UI.
**One-app placement:** a business room at `Business → C&W Auto & Customs`, rendered by the Living Business App module against `CW-AUTO-CUSTOMS-001`. Its registry modules (vehicle intake, provenance, Stories From the Garage, auction/show archive, stewardship) are tabs inside that room. Its products surface through the existing Shop, not a second store. Public exposure stays gated by its own release rules (`no_sale_without_DPP`, `no_public_release_without evidence`).

### 2.3 `APP-ADULT-CREATOR-001`: THYLORA Adult Creator Platform

| Check | Result |
|---|---|
| UI module | **NO** |
| Public nav | **NO** |
| Code | **NO.** "adult" in either repo appears only as age-gate copy inside `sports-betting.*` and in RAE Link rights code |
| Deployed | **NO** |
| Backend | 17 `adult_*` tables. Only `adult_desks` (11) and `adult_operating_instruments` (13) hold rows; the other 15 are 0 |
| Business link | `business_id = DEPT-ADULT-001` is a **department** (`thylora_departments`, *Adult Rights, Venues & Monetization Authority*), not a `businesses` row |
| Launch gates (own record) | no Earth-facing launch before adult-capable processor approval; jurisdiction matrix; age/identity and consent gate; no Stripe for adult content; no minors |

**Verdict:** a **backend-only platform spec**.
**One-app placement: do not fold it into the family app.** The member app hosts the Six surfaces (six-learning, six-dashboards, family) and `CHILD_DATA_DEFAULT_DENY` rules. The registry's own `privacy_rules` say "no minors" and "no The Six". This is the one entry that should become its **own walled surface** (separate origin or route tree). It would share only the backend, identity and ledger, with no navigation link from the family app. Its creator economics overlap RAE Link's ledger and rights gate (`db/rae-link/0005`, `0003`). A future build should reuse those engines rather than create a second payout system.

### 2.4 The nine templates

All nine: `business_id = null`, `source = CHAIRMAN_DIRECTIVE`, `version 1`, the **same `created_at` (2026-08-25 14:07:32.222622)**. That timestamp means they were seeded in one batch. The seeding command is `thylora_chairman_commands` THY-CMD-20260825-BUSINESS-RESIDENCY-001 (`evidence_output.templates = SEEDED`, DASHUL: *"frontend/public-site source must be connected and tested before live claim"*). None has a UI module, public route, code or business instance.

| app_code | template_type | modules | customer_flow | privacy/release rules | Notes |
|---|---|---|---|---|---|
| `LBA-GENERAL-001` | GENERAL | 14 | 7 steps | filled | **The base template.** Its modules are a superset frame (identity, products, services, education, staff, approvals, privacy, publication, revisions) |
| `LBA-DISPENSARY-DEMO-001` | DISPENSARY_DEMO | 10 | 10 steps | filled | Demonstration-only; regulated actions need external authority |
| `LBA-SALON-001` | SALON_BARBER | 8 | **empty** | **empty** | preset |
| `LBA-MECHANIC-001` | MECHANIC | 10 | **empty** | **empty** | preset; closest fit for C&W and for `EARTH-MIDAS-USER-CASE-001` (automotive repair, not linked) |
| `LBA-REPAIRSHOP-001` | REPAIR_SHOP | 7 | **empty** | **empty** | preset; ~70% overlap with MECHANIC (diagnosis/safety/parts/labor/approval) |
| `LBA-MUSEUM-001` | MUSEUM | 8 | **empty** | **empty** | preset; provenance modules overlap C&W's provenance/archive modules |
| `LBA-CLOTHING-001` | CLOTHING | 9 | **empty** | **empty** | preset; fits `KJ-KYXIE-ATHLETICS-001` (apparel, not linked) |
| `LBA-RESTAURANT-001` | RESTAURANT | 8 | **empty** | **empty** | preset; fits `BUS-B653F34F28A5` "couple of brews" (bar, not linked) |
| `LBA-FARM-001` | FARM | 8 | **empty** | **empty** | preset |

**Verdict:** **templates.** Conceptually one template (`GENERAL`) plus eight module-list presets. Seven of the nine have empty `customer_flow`, `privacy_rules` and `release_rules`. They inherit nothing today, so without GENERAL's rules they would ship with no privacy or release gates.
**One-app placement:** one *Living Business App* module inside Business Factory. The public nav already reserves `/client-app-builder`, which should become the template picker. A business chooses a preset, the preset's modules become tabs, and GENERAL's privacy/release rules apply to every preset.

---

## 3 · The one-app map

```
THYLORA (one experience, one identity: thylora_app_auth_session, one backend: thylora-dash)
│
├── Public world  (/  → public_site_navigation, 13 routes)
│   ├── Business Residency · Business Admission ──────── business_residency_*  (C&W: ACCEPTED WITH CORRECTIONS)
│   ├── Client App Builder ─────────────────────────── [TEMPLATE PICKER: 9 LBA templates]
│   ├── Shop ──────────────────────────────────────── Shopify lanes + thylora_store_product_readiness (C&W notebooks, DRAFT)
│   └── Watch ──────────────────────────────────────── RAE Link viewer (/rae-link)
│
├── Member app  (/app)
│   ├── Business Factory ─── businesses (7)
│   │   └── Living Business App module  = LBA-GENERAL-001 + 8 presets
│   │       └── Business room: C&W Auto & Customs  = CW-LIVING-APP-001 → CW-AUTO-CUSTOMS-001
│   │           tabs: vehicle intake · provenance · Stories From the Garage · auction/show archive · stewardship · store
│   ├── Sports & Games
│   │   ├── Sports Front Office (sports_team_registry)
│   │   └── Sportsbook + Casino  = LBA-GAME-BET-001  (page exists; add the nav link)
│   ├── Time Run · RAE Link · Family Stories · Explore · EDF …
│
├── Chairman dashboard  (thylora-public-world, 76 thylora_ui_modules)
│   └── Business & Counsel → Business Residency  (reviews every business room above)
│
└── WALLED: Adult Creator Platform  = APP-ADULT-CREATOR-001
    separate origin/route tree · 18+ gate · no link from family app · shares backend, identity, RAE ledger engine
    NOT BUILT; launch gated by its own release rules
```

---

## 4 · Drift and contradictions found (recorded, none changed)

1. **`IN PRODUCTION` overstates 11 of 12 rows.** Only GAME-BET has a live page.
2. **Public nav routes do not resolve in this repo.** `public_site_navigation` marks `/business-residency`, `/business-admission`, `/client-app-builder`, `/what-we-build`, `/watch`, `/learn-and-make`, `/stories`, `/warehouse`, `/about`, `/sign-in` as `IN PRODUCTION`. In `public-site/index.html` these exist as **in-page anchors** (`#residency`, `#builder`…), and `vercel.json` has no rewrites for them.
3. **Sportsbook is deployed but orphaned.** It has no nav link and no service-worker cache entry in either repo, and its UI-module section key is `SPORTS` rather than `Sports & Games`.
4. **Two unresolvable `business_id`s:** `ER-CHAIRMAN-HOUSE-001` (GAME-BET) and `DEPT-ADULT-001` (a department).
5. **C&W has two IDs:** `CW-AUTO-CUSTOMS-001` (businesses) and `THY-BIZ-CW-AUTO-001` (residency).
6. **Seven templates carry no rules.** `customer_flow`, `privacy_rules` and `release_rules` are all empty.
7. **MECHANIC and REPAIRSHOP overlap heavily.** Merging them would be a Chairman decision; this pass does not propose deleting either.
8. **Existing businesses are not bound to templates.** Midas → MECHANIC, KJ Kyxie → CLOTHING, "couple of brews" → RESTAURANT are natural fits, but no row links them.
9. **C&W duplicate products.** Engineering Notebook Vol. 1 and Eight Things draw on the same eight gap records. Both are already flagged in the readiness table as awaiting a Chairman decision.

---

## 5 · Next executable work (not performed; each needs a decision or a separate pass)

| # | Work | Authority |
|---|---|---|
| 1 | Add a *Sportsbook + Casino* link under Sports & Games in the **authority repo** app (`index-v8.html`), behind the age gate | Merge in `thylora-executive-dashboard`, witness on `thylora-public-world` |
| 2 | Build one Living Business App renderer: reads `living_business_app_registry` by `app_code` and `businesses` by `business_id`, and renders `modules` as tabs | Build |
| 3 | Instantiate C&W as the first room through that renderer, private by default | Build; public exposure is a Chairman decision |
| 4 | Make GENERAL's `privacy_rules` / `release_rules` the inherited floor for all presets | Additive backend change; Chairman approval |
| 5 | Record a crosswalk `THY-BIZ-CW-AUTO-001 ↔ CW-AUTO-CUSTOMS-001` rather than rewriting either ID | Additive |
| 6 | Correct the `state` vocabulary (`TEMPLATE_SEEDED` / `INSTANCE_BACKEND_ONLY` / `SCREEN_DEPLOYED`), using a new column or a new version row so the history is kept | Chairman decision |
| 7 | Adult platform: a separate-surface decision plus reuse of RAE Link rights/ledger. Nothing to build until its processor and jurisdiction gates pass | Chairman + DEPT-ADULT-001 |
