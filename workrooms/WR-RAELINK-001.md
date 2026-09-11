# WR-RAELINK-001 · RAE Link

**Lane:** RAE Link owned media platform · creator economy · streaming · social interaction · revenue distribution
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/rae-link-platform-build-u1gr83`
**Opened:** 2026-09-11

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- Existing surfaces `app/` (Build 7 · command rooms · spine forward) and
  `public-site/` were changed **additively only**: one navigation entry each.
- RAE Link is a **fourth surface**. It is not a dashboard, not a second backend,
  not a second identity system, and not a second product catalogue.

Dashboard ≠ RAE Link consumer app ≠ backend ≠ creator portal ≠ media player ≠ Shopify.
That separation is held in this delta.

---

## 2 · Execution delta

### Added — backend schema (reviewable, **not applied**)

`db/rae-link/` — 1,754 lines, 40 tables, 14 functions, 10 numbered migrations.

| File | Contents |
|---|---|
| `0001_identity_channels.sql` | Profiles, channels, channel classes, staff roles, follows |
| `0002_media_pipeline.sql` | Assets, resumable uploads, renditions, captions, scans, moderation, append-only pipeline trail |
| `0003_rights_provenance_consent.sql` | Rights gate, provenance, consent, takedown, appeals |
| `0004_audience_interaction.sql` | Views, daily rollups, reactions, comments, reports, notifications, rate counters |
| `0005_monetization_ledger.sql` | Revenue lanes, split policies, revenue events, ledger entries, payouts, adjustments |
| `0006_access_entitlements.sql` | Plans, subscriptions, purchases, entitlements, store/EDF links |
| `0007_family_partnership.sql` | Family Story Partnership / GiveForward Studio and its safeguards |
| `0008_rls_policies.sql` | Row-level security on all 40 tables |
| `0009_functions.sql` | Publish gate, publish, view capture, settlement, statements, feed, search |
| `0010_registry_link.sql` | `to_regclass`-guarded links into existing THYLORA registries |

### Added — RAE Link surface

`rae-link/` — no framework, no runtime dependency, no external script.

- `index.html` · `styles.css` · `manifest.webmanifest` · `app.js`
- `lib/backend.js` — one client, one session key (`thylora_app_auth_session`, shared with `app/`)
- `lib/rights.js` — rights gate, channel truth, consent and partnership validation
- `lib/pipeline.js` — pipeline state machine, publication gate, resumable-upload arithmetic
- `lib/ledger.js` — monetization math in integer minor units
- `lib/providers.js` — 25 capabilities, provider-agnostic

Viewer surfaces: Watch, Search, Following, My Library, Account.
Creator surfaces: Creator Studio (declare → rights gate → drafts → publication gate), Earnings.
Shared: Family Partnership, Build Map.

### Added — tests

`tests/` — **48 tests, all passing** (`npm test`).
15 monetization · 15 pipeline/gate · 13 rights/safeguard · 5 provider.

### Added — documentation

`docs/RAE-LINK-ARCHITECTURE.md`, `-MONETIZATION.md`, `-RIGHTS-PRIVACY.md`,
`-PROVIDER-MAP.md`, `-COSTS.md`, plus `db/rae-link/README.md`.

### Changed — additive only

| File | Change |
|---|---|
| `vercel.json` | Added `/rae-link` and `/rae-link/` rewrites. Existing rewrites untouched. |
| `app/index.html` | One tab link to `../rae-link/`, matching the existing Time Run pattern. |
| `public-site/index.html` | One nav entry and one route from the existing Watch section. |
| `package.json` | New. Test script only; no dependencies. |

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/workflows/*`, `.github/triggers/*`, `app/app.js`, `app/hotfix-*.js`,
`app/sw.js`, `public-site/app.js`, `time-run.html`, all Time Run and sports-betting assets.

---

## 3 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 48 tests, 48 pass, 0 fail, 132 ms |
| Allocation loses no money | 715 bases from 0–5000 at 3333/3333/3334 all reconcile exactly |
| Rounding favours people over the house | base = 1 across three parties → beneficiary receives it, platform receives 0 |
| Unresolved tax holds rather than pays | `payout_state = HELD_TAX_UNRESOLVED`, `net_payable = 0`, creator share still computed and visible |
| Gate reports everything at once | An empty context returns 7 blockers, each naming its route |
| Rights precede upload | `STAGES.indexOf('RIGHTS_GATE') < STAGES.indexOf('UPLOAD')` asserted |
| World channels cannot pose as Earth people | DB constraint `rael_channels_world_truth` + `WORLD_DISCLOSURE_MISSING` gate blocker + `validateChannelTruth` |
| Medical detail is structurally refused | No medical column exists; `medical_details_collected` constrained to `false`; 14 field names refused by `validateConsent` |
| Guardian authority required for children | `rael_consent_minor_guardian` check + `GUARDIAN_REQUIRED` |
| No vendor lock | Every one of 25 capabilities carries ≥ 2 alternates (asserted) |
| Settlement throughput | 100,000 three-way settlements in 159 ms (~1.6 µs each) |
| Pool allocation | 50,000,000 minor units across 10,000 assets in 10.2 ms, reconciled exactly |
| Surface weight | 91,537 bytes raw / **26,241 bytes gzipped** first load, no images, no framework |
| Migrations apply cleanly | All 10 applied to a fresh PostgreSQL 16 database: 40 tables, 38 RLS policies, 14 functions, 89 check constraints, 10 lanes and 8 prohibitions seeded |
| Migrations are idempotent | The same 10 files re-applied to the same database with no error |
| Constraints actually fire | 10 of 10 "expect reject" cases rejected by the database, not by a comment |
| SQL and JS agree to the cent | Same fixture (gross 9999, fee 313, 10/40/50 split): both produce base 9686, beneficiary 4844 with the rounding cent, creator 3874, platform 968, sum 9686 |
| Gate blocks server-side | An incomplete asset returns 6 blockers from `rael_publish_gate`, matching the client gate |
| Holds are computed, not erased | Unresolved tax → 2 entries `HELD` / `TAX_STATE_UNRESOLVED`, creator share 8712 still visible |
| Splits are not retroactive | Revenue predating every policy returns `NO_ACTIVE_SPLIT_POLICY` and writes zero ledger rows |
| RLS coverage | `rls_disabled_tables = 0` across all 40 tables |
| Reproducible | `db/rae-link/validation/run.sh` runs the whole check from a fresh database, exit 0 |

### Latency and performance — what is and is not measured

**Measured:** settlement and allocation throughput; surface byte weight; test
suite runtime. All above, on this machine, 2026-09-11.

**Not measured, and not claimed:** end-to-end publish latency, playback
start time, feed query latency under load, CDN times. Those require the live
backend and a chosen delivery provider — neither reachable from this session.
They are named in blockers rather than estimated.

---

## 4 · Unresolved blockers

### B1 · Backend unreachable from the build session — **HARD**
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the
egress proxy (organization policy denial), logged at 2026-09-11T18:59:07Z.

Consequences, all carried honestly rather than papered over:
- The live schema could **not** be inspected. Every link to an existing registry
  (`products`, `thylora_departments`, `family_story_archives`, passports) is a
  **soft reference** guarded by `to_regclass`, not a blind foreign key.
- Migrations **were** validated — against a local PostgreSQL 16 instance, twice
  over for idempotency, with the behavioural checks in
  `db/rae-link/validation/`. What remains unverified is narrower and named:
  compatibility with the **live backend's** Postgres version, its existing
  objects, and whether any name already collides with the `rael_` prefix.
- No live read, write or latency measurement was possible.

**Needs:** a session with egress to the backend host, or a Chairman-run apply.
The validation harness reduces the risk of that apply but does not remove it.

### B2 · Production DDL is a held action — **BY RULE**
Applying `db/rae-link/0001…0010` mutates the production backend. Per the
execution rules this is held for Chairman execution. The files are complete and
reviewable; nothing was applied.

### B3 · Provider decisions require accounts and spend — **HELD**
16 of 25 capabilities are open. Each commits money, a credential or an account
only the Chairman can open: object storage, resumable upload, transcode, CDN,
captions, moderation, virus scan, **creator payouts**, tax calculation, email,
observability, backups, mobile runtimes. Defaulting any of them would invent an
authority this build does not have.

### B4 · Creator payout provider — **HIGHEST-COST OPEN DECISION**
The only HIGH exit cost in the map. Changing payout providers later re-verifies
every creator's identity. `HELD_IDENTITY` exists as a payout state so earnings
accrue visibly while this is unresolved — a creator is never told "no money",
only "held, and here is why".

### B5 · Legal and public launch — **HELD**
Terms of service, creator agreement, beneficiary agreement, tax posture and
jurisdiction, and the public-launch rights/safety review all require signature.

### B6 · Mobile store acceptance — **DEVICE-ONLY**
iOS and Android acceptance is a Chairman device action. The surface is a
standalone-capable PWA today, which is the most that can be done without it.

### B7 · Cost figures are modelled, not quoted — **EVIDENCE GAP**
No vendor pricing page was reachable. `docs/RAE-LINK-COSTS.md` is a planning
band, explicitly labelled, to be overwritten with real quotes before commitment.

---

## 5 · QYRIS gap report

Nine inspections against every design decision. **Routed** means removed or
handled in this delta; **held** means it needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | Publication could proceed without rights, scan, rendition, poster, captions or review | **Routed** — `rael_publish_gate` / `publishGate()` block on all seven and name the route for each |
| 1b | Missing prerequisite | A creator learning blockers one at a time = one round trip per problem | **Routed** — the gate returns *every* unmet prerequisite in one call |
| 2 | Hidden handoff | Upload → transcode → moderation could hand off with no record of who moved it | **Routed** — `rael_pipeline_events` is append-only and written by trigger, so a direct column write still leaves a trail |
| 2b | Hidden handoff | A dropped upload silently restarting from zero | **Routed** — chunk map held in **our** database; `nextUploadChunk` resumes at the first gap, including a middle gap |
| 3 | Authority mismatch | Channel read access implying publish rights | **Routed** — RLS separates read from `OWNER/MANAGER/EDITOR`; publish re-checks the gate server-side |
| 3b | Authority mismatch | A browser session able to move money | **Routed** — `rael_settle_revenue_event` revoked from `anon` and `authenticated`; service role only |
| 3c | Authority mismatch | An Earth channel claiming world-production rights | **Routed** — `WORLD_BASIS_ON_EARTH_CHANNEL` |
| 4 | Evidence gap | "Paid" assertable with no proof | **Routed** — `PAID` requires date + processor + reference + evidence matching net payable, enforced in constraint *and* code |
| 4b | Evidence gap | Live backend shape unverifiable | **Partly routed, remainder held → B1.** Routed: the schema is validated end to end on PostgreSQL 16 by a harness committed alongside it, and soft references plus `to_regclass` guards make a wrong assumption degrade instead of corrupt. Held: live-backend compatibility |
| 4c | Evidence gap | Cost and latency numbers unverifiable | **Held → B7.** Labelled as modelled; unmeasured latency is named, not estimated |
| 5 | Unnecessary waiting | Creator blocked from all work until the backend exists | **Routed** — the rights gate runs locally; a creator does real work before provisioning, and the app says plainly that it is the client copy of the same rule |
| 5b | Unnecessary waiting | One missing table blanking the whole page | **Routed** — `safeRead` envelopes; one absent table degrades one panel |
| 6 | Creator/customer friction | "Not ready" with no reason | **Routed** — every blocker carries a code, a plain-language detail and a route |
| 6b | Creator/customer friction | Losing paid content when a subscription ends | **Routed** — purchase entitlements are perpetual by constraint; cancellation cannot revoke them |
| 6c | Creator/customer friction | A creator losing access to their own work | **Routed** — publication grants the owner a perpetual `CREATOR_OWNERSHIP` entitlement |
| 6d | Creator/customer friction | Second sign-in for a second surface | **Routed** — same backend, same session key; sign in once |
| 7 | Rights/privacy risk | Precise location or IP retained on views | **Routed** — no such column exists; coarse country and a rotating session key only |
| 7b | Rights/privacy risk | Medical detail drifting into family records | **Routed** — no medical field; `medical_details_collected` constrained `false`; 14 field names refused |
| 7c | Rights/privacy risk | Simulated world media mistaken for a real person | **Routed** — DB constraint, publish-gate blocker, and a class tag on every tile and search result |
| 7d | Rights/privacy risk | Takedown with no appeal | **Routed** — `rael_appeals` covers moderation, takedown, payout and account |
| 8 | Monetization opportunity | Single revenue lane | **Routed** — 10 lanes seeded, each with its own split policy, pooled or direct |
| 8b | Monetization opportunity | Published media not linked to store/EDF | **Routed** — `rael_asset_products` + `rael_product_is_purchasable`, which asks the **existing** store registry rather than holding a second product truth |
| 8c | Monetization opportunity | Affiliate revenue without viewer disclosure | **Routed** — the lane carries `requires_disclosure = true` |
| 9 | Failure/recovery | Rounding losing cents at scale | **Routed** — remainder distributed to beneficiary → creator → platform; `Σ = base` asserted or it throws |
| 9b | Failure/recovery | Publishing over a previous version | **Routed** — `version_no` + `replaces_asset_id`; a new version never overwrites |
| 9c | Failure/recovery | Refund/chargeback exceeding gross | **Routed** — base floors at 0; `DEDUCTIONS_EXCEED_GROSS` refuses settlement |
| 9d | Failure/recovery | Money silently absorbed when a pool has no eligible watch time | **Routed** — returned as `NO_ELIGIBLE_WATCH_TIME` with the undistributed amount named |
| 9e | Failure/recovery | Backup and observability strategy | **Held → B3** (both are open provider decisions) |

**28 gaps inspected · 24 routed or removed · 1 partly routed · 3 held against a named blocker.**
No gap was reported and left unrouted where a safe reversible route existed.

---

## 6 · Restart vector

If this work resumes cold, start here:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`, this file.
   Confirm dashboard authority still sits outside this repository.
2. **Verify the floor:** `npm test` → expect 48 passing. Then
   `sudo service postgresql start && db/rae-link/validation/run.sh` → expect
   exit 0, 40 tables, 38 policies, 89 check constraints, and the settlement
   parity fixture reading base 9686 / 4844 / 3874 / 968.
3. **Check blocker B1 first.** Try the backend host. If reachable, the next
   executable action is to **read the live schema** and convert the soft
   references in `0010_registry_link.sql` into verified links.
4. **If the Chairman has applied the migrations:** open `/rae-link`. The chip
   reads `BACKEND · READY` when all five probes pass. Then the next work is
   seeding channels and running one media item end to end through the gate.
5. **If not applied:** the surface still runs. Creator Studio's rights gate and
   the Earnings worked example are fully functional client-side.
6. **Next executable state**, in order, none of which needs an authority this
   build lacked:
   - Playback surface for a published asset (watch page, comments, reactions) —
     the tables and RLS already exist.
   - Channel creation form (`rael_channels` insert with `validateChannelTruth`
     enforced client-side before the DB constraint sees it).
   - Upload client against `rael_upload_sessions` using `nextUploadChunk`,
     provider-agnostic, behind `providers.resolve('resumable_upload')`.
   - Comment and reaction UI on the watch page.
   - Notification surface reading `rael_notifications`.
7. **Do not:** create a dashboard here, apply DDL to production without Chairman
   execution, open a vendor account, or default an OPEN provider decision.

---


---

# DELTA 2 · MVP production slice
**Opened:** 2026-09-11 · continues from the merged spine at `61b974a`. The
architecture was not redesigned; this slice builds the first usable creator and
viewer path on top of it.

## WHAT BUILT

### Creator path — create channel → upload → rights → draft → publish check

| Piece | Where |
|---|---|
| Channel creation, with class truth checked before insert | `rael_create_channel` · `views/studio-upload.js` |
| Resumable upload engine (chunk plan, progress, pause, resume, retry with backoff, recovery) | `lib/upload.js` |
| Upload custody in our own database (session resumes, never restarts) | `rael_start_upload` / `rael_record_chunk` / `rael_complete_upload` |
| TUS 1.0.0 transport — the real protocol, provider-agnostic, carries no credential of its own | `lib/upload.js` |
| Structural file validation by magic bytes, size and content hash | `lib/media.js` · `rael_record_validation` |
| Poster and thumbnail capture in the browser (no transcode provider needed) | `lib/media.js` `capturePoster` |
| Metadata normalization and caption (WebVTT) validation | `lib/media.js` |
| Publication gate, already built in the spine, now reachable from the draft list | `rael_publish_gate` |

### Viewer path — open channel → watch → follow → comment/react

| Piece | Where |
|---|---|
| Channel page with follower count, follow toggle, staff-only draft visibility | `rael_channel_page` · `views/channel.js` |
| Watch page with player, captions track, rights line, version marker | `rael_watch_page` · `views/watch.js` |
| Follows and five reaction kinds | `rael_toggle_follow` · `rael_set_reaction` |
| Governed comments: structural screening, rate limit, held-not-deleted | `rael_post_comment` · `rael_screen_comment` · `lib/moderation.js` |
| Comment visibility decided server-side; author and staff always see held comments | `rael_list_comments` |
| Staff moderation with a checked transition and a recorded reason | `rael_moderate_comment` · `rael_comment_moderation` |
| Report hooks routing rights claims to takedown and safety to review | `rael_submit_report` · `lib/moderation.js` `routeReport` |

### Cross-cutting

- **QYRIS error and gap surface** (`lib/qyris.js`): every failure becomes a record
  with severity, route, whether the work survived, and what to do next. Database
  constraint names are translated into sentences a person can act on.
- **Accessibility hooks** (`lib/a11y.js`): live-region announcements, focus
  management on view change, focus trap and restore in the report dialog,
  reduced-motion respect, and a spoken description of the Earth/simulated
  distinction so the class label is not colour-only.
- **Shareable routes** (`lib/router.js`): `#channel/<slug>` and `#player/<asset>`
  are real addresses, and a param route with no param falls back instead of
  rendering nothing.
- **Deployment config** (`config.js`): one place to wire an upload endpoint. It is
  `null`, and the surface says so rather than pretending.

### Schema

`db/rae-link/0011_mvp_slice.sql` — 601 lines, additive. One new table
(`rael_comment_moderation`), four new columns, 14 new functions. Totals after
0011: **41 tables · 28 functions · 39 RLS policies · 90 check constraints.**

## WHAT TESTED

| Suite | Result |
|---|---|
| `npm test` — unit | **104 passing** (ledger 15, pipeline 15, rights 13, providers 5, upload 18, media 12, moderation 15, qyris 11) |
| `npm run test:db` — schema | **exit 0**: 11 migrations apply cleanly, then again for idempotency; 10/10 constraint rejections fire |
| `npm run test:db` — isolation | **23/23 passing** cross-user checks |
| `npm run test:e2e` — browser | **18 passing** in Chromium at 390×844 and 320×640 |

Against the mission's test list:

| Required | Evidence |
|---|---|
| Build | Page loads in Chromium with no uncaught script error |
| Unit tests | 104 passing |
| Rights gate | Gate returns every unmet prerequisite with its route; unresolved basis never passes; expired term blocks |
| Unauthorized path | Member A cannot start an upload, record a chunk, moderate a comment, publish, read a statement or settle money on member B's records — 23 checks, all refused |
| Failed upload recovery | Persistent failure returns `recoverable`, keeps recorded chunks, and a fresh engine recovers server-side state and finishes without re-sending chunk 0 |
| Private/draft/public states | A draft is invisible to a stranger on the table, on the channel page and on the watch page; visible to its own channel staff |
| Comment moderation state | Screening holds rather than deletes; REMOVED is terminal; an author always sees their own held comment; a stranger never does |
| Mobile viewport | No horizontal scroll at 390px or 320px; 44px touch targets; heading clears the sticky bar |
| No cross-user data leakage | 23/23 — including upload sessions, entitlements, ledger entries, revenue events, payouts and consents |

### Three real defects the tests caught and this delta fixes

1. **RLS was never the thing deciding access.** The migrations granted no table
   privileges to `anon`/`authenticated`, so on a clean Postgres every policy was
   dead weight behind a blanket table-level denial. Supabase projects usually
   carry blanket grants, but the live backend could not be inspected (B1), so
   assuming them was exactly the wrong move. `0008` now states the privileges it
   needs — read granted broadly and narrowed by policy, write granted only where
   a policy exists, and never on money, consent or audit tables.
2. **`[hidden]` did not hide.** `.form label{display:block}` overrode it, which
   showed the simulated-media disclosure field on an Earth channel — a mislabeling
   bug in the exact place this product must not have one.
3. **Touch targets were 36px**, below the 44px minimum, on the primary navigation.

Each now has a test that fails if it regresses.

## WHAT IS LIVE

**Nothing is live.** No deployment happened in this slice and none was requested.
The surface runs locally; the branch is pushed; the Chairman dashboard, its
baseline and its authority document remain untouched.

## WHAT IS ONLY LOCAL

| Item | Status |
|---|---|
| `db/rae-link/0001…0011` | Validated on local PostgreSQL 16 — **not applied to the live backend** |
| The RAE Link surface | Runs against a local static server; not deployed |
| Backend reads | Never executed against `thylora-dash` — egress to that host is denied (B1) |
| Upload bytes | Never moved. No storage or upload provider is configured, and none was invented |
| Screenshots | `tests/e2e/evidence-*.png`, captured locally at 390px |

## BLOCKERS

Carried from the spine, unchanged unless noted:

- **B1 · Backend unreachable** — `jvsdxhrfhtlgaknhjxlz.supabase.co:443` still
  returns 403 on CONNECT from this session's egress policy. Everything in this
  slice is therefore validated locally and unverified against the live backend.
- **B2 · Production DDL held** for Chairman execution. 0011 joins 0001–0010.
- **B3/B4 · Provider decisions** — 16 open. This slice is blocked most directly by
  `object_storage` + `resumable_upload` (no bytes move) and `video_transcode`
  (no playback). The engine, the custody records and the TUS client are finished
  and waiting on an endpoint, not on more code.
- **B5 · Legal** · **B6 · Mobile store acceptance** · **B7 · Costs modelled, not quoted** — unchanged.
- **New, minor: no automated malware scan.** `lib/media.js` checks structure and
  says plainly it is not a malware scan; the publish gate blocks on a missing
  scan regardless. Closing this needs the `virus_scan` provider decision.

## NEXT EXECUTABLE

None of these needs an authority this session lacked:

1. Playback controls and resume position on the watch page (tables exist).
2. Comment threading in the UI — `parent_id` is already stored and returned.
3. Notification surface reading `rael_notifications` (follows, held comments, moderation outcomes).
4. Creator moderation queue: one page listing held comments and open reports across a channel's media.
5. Caption upload wired to `rael_media_captions` using the existing `validateVtt`.
6. Channel settings: rename, description, avatar, staff roles via `rael_channel_members`.

Blocked until a provider decision: real byte upload, transcoding, playback URLs,
malware scanning.

## RESTART VECTOR — DELTA 2

1. `npm test` → 104 passing. `npm run test:e2e` → 18 passing (needs
   `/opt/pw-browsers/chromium`). `sudo service postgresql start && npm run test:db`
   → exit 0, 23/23 isolation.
2. Check B1 first: if the backend is reachable, read the live schema, then apply
   `0001…0011` under Chairman execution.
3. If the migrations are applied: open `/rae-link#studio`, create a channel, select
   the draft, attach a file. Everything up to the byte transfer will work; the
   upload panel will name the missing provider.
4. To wire uploads: set `upload_endpoint` in `rae-link/config.js` to a TUS endpoint
   and nothing else changes — the engine, the chunk map and the recovery path are done.
5. Do not: deploy, apply DDL without Chairman execution, open a vendor account,
   default an OPEN provider decision, or build a dashboard here.

## 7 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Schema | 0001–0011 written · **validated on PostgreSQL 16** · idempotent · **not applied to the live backend** (B1, B2) |
| Surface | Spine + MVP slice built · runs · degrades honestly without the backend · not deployed |
| Tests | **104 unit · 18 browser · 23 cross-user isolation · 10 constraint rejections · 11 migrations × 2 passes** |
| Creator path | Create channel → upload (engine done, transport open) → rights → draft → publish check |
| Viewer path | Open channel → watch → follow → comment/react → report |
| Provider decisions | 9 of 25 chosen · 16 open (B3, B4) |
| Legal | Held (B5) |
| Mobile store | Held (B6) |
| Costs | Modelled only (B7) |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected. |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
