# WR-THYAPP-001 · THYLORA App

**Lane:** THYLORA app — mobile Chairman + public experience
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-mobile-app-shell-0afw1q`
**Opened:** 2026-09-14

---

## 1 · Authority position

Read before execution, and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains
  `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`.
  **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- The existing surfaces `app/` (Build 7 · witness hotfix), `public-site/` and
  `rae-link/` keep working. `app/` was **not modified at all**.
- This is a **fifth surface**. It is not a dashboard, not a second backend, not a
  second identity system, not a second storefront and not a second Ask Ersatz.

Dashboard ≠ mobile shell ≠ member app ≠ RAE Link ≠ backend ≠ storefront.
That separation is held in this delta, and `tests/continuity.test.mjs` fails the
build if it is broken.

---

## 2 · Execution delta

### Added — the shell (`thylora-app/`)

| File | Contents |
|---|---|
| `index.html` | 13 registry sections + Account, mobile-first markup |
| `styles.css` | Phone-first stylesheet, 44px tap targets, no sideways scroll |
| `app.js` | Surface controller; moves the rules in `lib/` onto the screen |
| `lib/registry.js` | **The one place** the shell names a backend object |
| `lib/identity.js` | Chairman authorization from server-written claims only |
| `lib/router.js` | Route resolution: ALLOW / SIGN_IN / BLOCK |
| `lib/state.js` | Persistence with an honest durability report |
| `lib/analytics.js` | Money-distance, arrivals, prompt coverage ledger |
| `sw.js`, `manifest.webmanifest` | Installable at `/thylora-app/`, own cache and scope |

### Added — backend schema (reviewable, **not applied**)

`db/thylora-app/` — 4 numbered migrations, 15 tables, 1 view, 2 functions, full RLS.
See `db/thylora-app/README.md` for the application order and the two
pre-application checks.

### Changed — one duplicate removed

`lib/thylora-backend.js` is now the single definition of the Supabase project,
publishable key and session key. `rae-link/lib/backend.js` re-exports it instead
of holding a second copy; every symbol the RAE Link surface imports is still
provided, and the RAE Link suite (48 tests) still passes unchanged.

`app/app.js` was deliberately left alone — it is a witnessed production file
whose service worker concatenates it with a hotfix at request time. It keeps its
own copy of the constants, and a continuity test now fails if that copy ever
drifts from the canonical values.

### Changed — additive only

`vercel.json`: two rewrites for `/thylora-app`. `package.json`: a
`test:browser` script. No existing route, script or asset was altered.

---

## 3 · Access model

The Chairman workspace is gated in two independent places, and they read the
same claim so they cannot disagree:

| Layer | Mechanism | What it decides |
|---|---|---|
| Shell | `lib/identity.js` + `lib/router.js` | whether the section is **drawn** |
| Backend | `thy_is_chairman()` + RLS (`0003`, `0004`) | whether a token may **read** |

Authority comes from `app_metadata.thylora_role` (or `thylora_roles`) in the
verified access token. `app_metadata` is writable only by the backend.

**`user_metadata` is ignored on purpose.** It is writable by the signed-in user,
so honouring a role found there would let any member promote themselves to
Chairman. This is proven twice: once in the unit suite and once in the browser,
with a session that carries `CHAIRMAN` in `user_metadata` and `MEMBER` in
`app_metadata`. It is refused.

A blocked route is **not rendered at all** — the route falls back to Home, so an
unauthorized reader never sees the workspace's shape. A stored "last section" of
`chairman` does not reopen it: the guard runs again on restore.

---

## 4 · What is proven, and how

`npm test` — **101 unit tests, all passing** (48 pre-existing RAE Link tests
unchanged, 53 new).
`npm run test:browser` — **27 browser tests, all passing**, driving the real
shell in headless Chromium at a 390 × 844 viewport.

| Claim | Evidence |
|---|---|
| Authenticated routing | Chairman refused signed-out, refused for a member, refused for a self-promoted `user_metadata` role, refused on an expired token, refused on a malformed token, opened for an authorized identity, closed again on sign-out, and not reopened from stored state |
| Mobile layout | Every one of the 14 sections checked at 390px: no element crosses the viewport edge, the document never scrolls sideways, and every button, select and input is ≥ 44px tall |
| State persistence | Language, English-subtitle setting, last transmission, unsent Ask Ersatz question and follows all survive a **real page reload** and are re-applied to the controls; a storage-refusing device is reported instead of faked |
| Backend continuity | Every request during a full sweep of all 13 sections went to `jvsdxhrfhtlgaknhjxlz.supabase.co` and nowhere else; the shared session key is read, and no auth token is copied into shell state; voice command, approve/reject and department routing all post to `submit_thylora_chairman_command_v1` — the same RPC `dashboard-current-head.html` uses |
| Honest degradation | A withheld table renders "not provisioned yet … This is not an empty feed", an unsent question is kept as a draft, a failed checkout says "Nothing was charged", and an arrival row with a null latitude is counted but **not** plotted |

### Three defects the proof caught and fixed

1. `Number(null) === 0`, so an arrival row with a missing latitude passed
   coordinate validation and would have been plotted on the equator as though
   measured. Coordinates are now rejected before coercion and range-checked.
2. `checkBackend()` cleared `#homeNotice` on a healthy backend, silently wiping
   the Chairman refusal message that shared that element. Refusals moved to
   their own `#routeNotice`.
3. Crossing from an Earth Watch signal into its casefile raced the evidence
   fetch and reported "no evidence attached" for a casefile that had two
   documents. The crossing now waits for the read, and "no rows" is no longer
   worded the same as "the table is not provisioned".

---

## 5 · Blockers — what is NOT claimed

1. **No live round trip was performed.** This build environment's network policy
   refuses `CONNECT` to `jvsdxhrfhtlgaknhjxlz.supabase.co` (403 at the proxy).
   Continuity was therefore proven two ways that do not need the network —
   structurally, by scanning the whole repository, and behaviourally, against an
   intercepted backend answering with the canonical contract. **A live read and
   a live Chairman command must still be witnessed from a networked device.**
2. **The migrations are held, not applied.** Until `0001`–`0004` are applied,
   every `thy_*` surface reports "not provisioned yet".
3. **Checkout is not connected.** `begin_storefront_checkout_v1` belongs to the
   commerce lane and provider-side billing remains unproven. The Store lists
   cleared products and refuses to imply a charge it cannot complete.
4. **No transmission media URL.** The registry exposes no playable media
   endpoint, so the player states what it has and what it is waiting for rather
   than fabricating a source.
5. **The `orders` column names are assumed** by the `thy_order_arrivals` view
   and must be confirmed before `0002` is applied. This is flagged in the
   migration itself and in `db/thylora-app/README.md`.

---

# Delta 2 · Media Studio + continuity correction (2026-09-15)

**Lane:** THYLORA app — Chairman Media Studio · routes through `WR-AI-ROUTING-001`
**Read first:** current Supabase continuity, via the authoritative dashboard
repository `vyc2st-ctrl/thylora-executive-dashboard` (cloned and read, not
modified).

## 6 · What reading continuity first changed

The dashboard's own contract (`docs/CHAIRMAN_DASHBOARD_SURFACE.md`) and modules
named objects that Delta 1 had duplicated. Three corrections were made **before**
any new work:

| Delta 1 invented | Canonical object now used | Why it matters |
|---|---|---|
| `thy_is_chairman()` | `thylora_is_chairman()` | Two gates can disagree, and the weaker one wins |
| `thy_approvals` | `thylora_approval_queue_safe_v1()` + `submit_thylora_review_gate_decision_v1()` → `thylora_chairman_review_decisions` | A second ledger splits the Chairman's own record of what he decided |
| `thy_margin_notes` | `thylora_margin_note_add_v1()` / `thylora_margin_queue_v1()` → `thylora_chairman_margin_notes` | The dashboard reconciles the Live Margin queue; a second notes store is invisible to it |

`db/thylora-app/0003` now **refuses to apply** if `thylora_is_chairman()` is
absent, rather than quietly creating a parallel gate. Every RLS policy in `0004`
uses the canonical gate. `tests/continuity.test.mjs` fails the build if any of
the three duplicates reappears.

**One duplication is recorded and NOT yet resolved:** `thy_prompt_ledger`
overlaps the canonical `thylora_query_carryforward` (which already stores
captured prompts with `capture_state` and `supersession_state`). A
`carryforward_query_id` column was added so the two can be joined, but the
reconciliation into a single read has not been done. It is action 7 below.

## 7 · The THYLORA Media Router

The router is the **`thylora-ai-router` Edge Function** — the same deployed
function the dashboard declares as `THYLORA_AI_ROUTER_FUNCTION` and exercises
from its system-health panel, reported ACTIVE at v12 in the dashboard's
acceptance evidence. It holds the provider credentials server-side.

`lib/thylora-backend.js` gained `invokeFunction()`, so the router is reached
through the one canonical client with the Chairman's own bearer token. **No
password, API key or provider secret exists anywhere in this lane** — asserted
by a test that strips comments and scans both the migrations and the shell.

The studio never names a provider. `mode` carries the Chairman's cost/fidelity
instruction (`AUTOMATIC` / `BUDGET` / `BEST_FIDELITY` → `BALANCED` /
`LOWEST_COST` / `HIGHEST_QUALITY`) and the router selects the route, so changing
a provider on the backend is not a change here.

## 8 · What the Media Studio reuses rather than rebuilds

The registered asset and its provenance **already existed** in the RAE Link
media lane. The studio reads them; it does not copy them.

| Need | Existing object |
|---|---|
| Registered asset, master image, version chain | `rael_media_assets` — `version_no` + `replaces_asset_id`, "a new version never overwrites the published record it replaces" |
| Parent/derivative provenance | `rael_provenance_events` — `DERIVED` / `AI_ASSISTED` with `derived_from_ref` and `tool_disclosure` |
| Continuity locks | `rae-link/lib/pipeline.js` `publishGate()` — the studio shows the blockers the pipeline enforces, verbatim |
| Rights gate | `rael_rights_records` |
| Serial number + QR destination | `digital_product_passports` |
| Approve / revise / reject | `submit_thylora_review_gate_decision_v1` (`REVISE` → `CHANGES_REQUESTED`, the canonical decision that reopens a gate) |
| Revision notes + markup | `thylora_margin_note_add_v1`, markup riding in its existing `p_anchor_context` jsonb |
| Publishing queue | `thylora_edf_publish_v1` — freezes release metadata, immutable afterwards |

Added by `db/thylora-app/0005` (held): `thy_media_animation_jobs`,
`thy_media_markups`, `thy_media_release_requirements`, and the
`thy_media_job_continuity` view.

**Logo requirements did not previously exist anywhere** in either repository.
`thy_media_release_requirements.logo_required` is deliberately **nullable**:
`NULL` means "not yet decided" and the studio says so, because defaulting to
`false` would read as "no logo needed".

## 9 · The no-generation-claim rule

> No media generation claim unless the provider returned a successful asset.

Enforced in two places that cannot disagree:

- **UI** — `generationClaim()` in `thylora-app/lib/media-studio.js` is the only
  function permitted to say a generation happened. A submitted job, a running
  job, a `200 SUCCEEDED` with an empty body, a non-http asset reference and a
  router error all return `generated: false` with the reason stated on screen.
  A provider "success" is recorded as `RETURNED`, never `REVIEW`; only finding a
  locatable asset moves it to `REVIEW`.
- **Database** — the `thy_job_no_claim_without_provider_asset` constraint in
  `0005` refuses to store a job in `REVIEW`, `APPROVED` or `QUEUED_FOR_PUBLISH`
  unless `provider_result` is present, reports `SUCCEEDED`, and carries a
  locatable asset. This is the floor under the UI rule, so no other writer can
  mark a job reviewable without provider evidence.

## 10 · Apple Pencil markup

The Chairman draws directly over the frame; the canvas overlays the result in a
shared stacking context, and `touch-action: none` lets a Pencil draw instead of
scrolling the page. Strokes are stored as **vectors, frame-relative 0..1**, so a
markup drawn on an iPad in portrait replays correctly at any size — not a
flattened screenshot.

Pencil pressure and tilt are recorded. A finger or mouse reports `0` or exactly
`0.5`, which is not a measurement, so it is stored as `null` and counted
separately: `pencil_stroke_count` never includes touch input.

A revision request carries the markup into the canonical margin queue, and the
note body always states that a markup is attached and how many strokes were
drawn with Pencil, so a reader of the margin queue is never left guessing what
"see markup" refers to.

## 11 · What is proven, and how

`npm test` — **149 unit tests, all passing** (48 pre-existing RAE Link, 101 shell).
`npm run test:browser` — **45 browser tests, all passing**, including 16 driving
the Media Studio at **iPad Pro 11" portrait (834 × 1194)** with real
`pointerType: 'pen'` events carrying pressure and tilt, dispatched over CDP.

| Claim | Evidence |
|---|---|
| Chairman-only | Studio refused signed-out, refused for a member, refused for a self-promoted `user_metadata` role; absent from the nav; never rendered |
| Registered asset → master + locks | Opens `RAEL-ASSET-0001`, shows the registered POSTER rendition, and displays serial `THY-REP-0001-000137`, the QR destination and `LOGO-THY-001` |
| Locks actually block | An asset with no passport shows `PASSPORT_MISSING` and the submit button is **disabled**, not merely discouraged |
| Router path | Called at `/functions/v1/thylora-ai-router` with a bearer token; body carries the task, mode, routing preference, parent version and parent checksum, and **no credential** |
| Progress | Stage label and percentage shown; a running job's label never implies an asset exists |
| **No false claim** | A `200 SUCCEEDED` **with no asset** reports "No media has been generated … returned no locatable asset", shows no preview, and leaves all three decision buttons disabled |
| Pencil markup | Two pen strokes recorded with graded pressure, frame-relative coordinates, `2 with Pencil`; undo removes one |
| Markup → revision | Markup stored as vectors, then the revision reaches `thylora_margin_note_add_v1` with `p_anchor_kind: MEDIA_FRAME`, the markup ref in `p_anchor_context`, and the decision recorded as `CHANGES_REQUESTED` in the canonical ledger |
| Approve | Recorded as `APPROVED` in the canonical ledger, **not** smuggled through the command spine as free text |
| Publishing handover | Provenance written first, naming the parent, disclosing `thylora-ai-router` and the router audit id, carrying serial, QR and logo as evidence, then handing `p_edf_code` to `thylora_edf_publish_v1` |
| iPad layout | No element crosses 834px, no sideways document scroll, every control ≥ 44px |

### Three defects the proof caught and fixed

1. `publishGate()` returns an envelope `{ ready, blockers }`, not an array. The
   locks panel was reading it as iterable and every lock test failed.
2. `renderResult()` owned `#msDecisionState` and wiped the decision confirmation
   the Chairman had just earned. The recorded outcome moved to its own
   `#msDecisionOutcome` — the same one-element-two-owners bug as the routing
   notice in Delta 1.
3. The Chairman workspace's approval buttons still assumed the invented
   `thy_approvals` shape and would not have matched the canonical
   `canonical_id`-keyed rows.

## 12 · NOT PROVEN — the iPad witness is outstanding

**This is not complete.** The Chairman asked for proof on his actual iPad, and
that has not happened:

- The proof above runs headless Chromium at iPad Pro dimensions with synthesised
  pen events. That is **not** Safari on iPadOS with a physical Apple Pencil.
  Real-device behaviour that is NOT covered: Safari's `touch-action` and
  `setPointerCapture` handling, palm rejection, Pencil hover, Scribble
  interference, real pressure curves, and the iPadOS install/standalone path.
- **No live round trip was performed.** This environment's network policy
  refuses `CONNECT` to `jvsdxhrfhtlgaknhjxlz.supabase.co` (403 at the proxy), so
  the router was intercepted, not called. No media has been generated by any
  provider through this code.
- `db/thylora-app/0001`–`0005` are **held, not applied**.

Everything the studio would need is therefore still gated. See the action count
in `docs/THYLORA-APP-SHELL.md` §Remaining actions.
