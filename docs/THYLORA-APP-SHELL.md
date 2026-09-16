# THYLORA App shell — architecture

The mobile Chairman + public experience, served at `/thylora-app`.
Workroom: `WR-THYAPP-001`.

## Where it sits

```
                    thylora-dash  (jvsdxhrfhtlgaknhjxlz)
                    ONE backend · ONE session key
                                 │
   ┌──────────────┬──────────────┼──────────────┬──────────────────┐
   │              │              │              │                  │
public-site/    app/        rae-link/     thylora-app/    thylora-executive-
(marketing)  (member app,  (owned media)  (THIS LANE)     dashboard  (separate
              Build 7)                                     repo · deployment
                                                           authority)
```

Every surface reads `lib/thylora-backend.js` for the project, the publishable
key and the session key, so **one sign-in works everywhere**. The Chairman
dashboard is a different repository and is untouched by this lane.

## The 13 sections

| Section | Access | Reads |
|---|---|---|
| Home | public | `public_get_site_metrics` |
| Transmissions | public | `thy_transmissions`, `thy_transmission_tracks` |
| Earth Watch | public | `thy_earth_watch_signals` |
| EdereAriah | public | `rael_channels` (world-simulated classes) |
| Ask Ersatz | public | `thy_ersatz_questions` → `submit_ersatz_question_v1` |
| Casefiles | public | `thy_casefiles`, `thy_casefile_evidence` |
| World Map | public | `thy_global_arrivals` |
| Store | public | `products` → `begin_storefront_checkout_v1` |
| My Purchases | public · needs session | `orders`, `entitlements`, `digital_product_passports` |
| My Questions | public · needs session | `thy_ersatz_questions` |
| People / Correspondents | public | `thy_correspondents`, `thy_follows` |
| Live Link | public | `thy_live_sessions` |
| **Chairman** | **authorized identity only** | departments, approvals, prompt ledger, margin notes, sketches, money-distance, arrivals |

Plus `Account`, the shell's own sign-in surface, which is outside the registry.

## One contract, one file

`thylora-app/lib/registry.js` is the only place the shell names a backend
object. Each section declares its reads and writes; `app.js` resolves them
through `refFor()` and never hard-codes a path of its own.

This is what keeps the lane from drifting into a competing backend. Two tests
enforce it:

- `tests/continuity.test.mjs` fails if any `/rest/v1/<name>` appearing in
  `thylora-app/` is not declared in the registry.
- The same suite fails if a second Supabase project, a second session key, a
  second question pipeline, a second checkout or a second dashboard appears
  anywhere in the repository.

### Reused, never rebuilt

| Capability | Existing object |
|---|---|
| Chairman voice command, approve, reject, route to department | `submit_thylora_chairman_command_v1` — the same RPC the authoritative dashboard calls |
| Department registry | `thylora_departments` |
| Store, purchases, entitlements, serialized assets | `products`, `orders`, `entitlements`, `digital_product_passports` |
| Mirror-world companion | `rael_channels` |
| Public traffic totals | `public_get_site_metrics` |

Each object also records **which lane provisions it**, so `HELD` never quietly
implies "this lane will create it". `begin_storefront_checkout_v1` (commerce)
and `rael_channels` (RAE Link) are held by other lanes and are deliberately
absent from `db/thylora-app`.

## Access model

Authority is a **server claim**, read from `app_metadata.thylora_role` (or
`thylora_roles`) in the access token. `app_metadata` is writable only by the
backend.

`user_metadata` is ignored. It is user-writable, so trusting a role there would
be a privilege escalation — any member could promote themselves. There is also
no client-side allowlist of email addresses; an address is not proof.

Three outcomes, and the difference between the last two is deliberate:

- **ALLOW** — draw the section.
- **SIGN_IN** — the section is public but personal (My Purchases, My
  Questions). It is still drawn, with a sign-in prompt where the personal rows
  would be. Redirecting would hide a public surface.
- **BLOCK** — the Chairman workspace without Chairman authority. The section is
  not drawn at all and the route falls back to Home, so an unauthorized reader
  cannot even see its shape.

The shell's guard decides what is **drawn**. `thy_is_chairman()` and the RLS
policies in `db/thylora-app/0004` decide what a token may **read**. A tampered
browser can open the view and still receive nothing.

## Degradation posture

An absent table is reported as **"not provisioned yet"**, an unreachable backend
as **unreachable**, and a real error with its message. None of the three is ever
drawn as an empty list, because an empty list reads as "no content" — which
would be a false statement about the archive.

The same rule applies to work in progress: an Ask Ersatz question that could not
be sent is kept as a draft and said to be unsent; a margin note that could not
be saved says so and stays in the box; a checkout that could not start says
"Nothing was charged".

## State

`localStorage` under `thylora_app_shell` holds the chosen language, the English
subtitle setting, the last section, the last transmission, unsent drafts and
follows. Every read and write is guarded, with an in-memory fallback, because
storage can be absent or can throw (private browsing, cleared site data, an
embedded webview). `saveState()` returns `{ state, durable }` and a failed write
is **never** reported as a save.

The auth session is deliberately not stored here — it stays in the canonical
client's `sessionStorage` key so one sign-in covers every THYLORA surface.

## Chairman arithmetic

`thylora-app/lib/analytics.js` holds the three readouts that are maths rather
than presentation, so the numbers on screen are the numbers under test.

- **Money-distance** — revenue matched to the arrival region it came from and
  banded by great-circle distance from a *declared* origin. With no active row
  in `thy_origin` it reports `ORIGIN_NOT_DECLARED` and shows revenue by region
  without distance; it never assumes a headquarters. The headline figure is
  revenue-weighted, so one large distant order is not averaged away by many
  small local ones. Refunds are excluded, mixed currencies are reported rather
  than added together, and a region with no usable coordinate is counted in
  revenue and disclosed as unmeasured.
- **Global arrivals** — arrivals, sessions and country count, with per-region
  shares in basis points.
- **Prompt coverage ledger** — coverage and delivery are **separate** numbers. A
  partial counts as half, so partial work is neither dismissed nor reported as
  finished. Covered-but-undelivered is surfaced as its own figure, because that
  gap is what the ledger exists to expose.

Money is integer minor units and shares are basis points throughout, matching
the THYLORA ledger convention. No floating-point money.

## Proving it

```
npm test            # 101 unit tests   — rules, state, arithmetic, continuity
npm run test:browser # 27 browser tests — real shell, headless Chromium, 390×844
```

The browser proof intercepts the canonical backend rather than calling it, so it
runs without network access, and drives: authenticated routing, per-section
layout at phone width, 44px tap targets, persistence across a real reload, and
the fact that every request goes to the one canonical project.

**Not proven here:** a live round trip. This build environment refuses
`CONNECT` to the backend host, so a live read and a live Chairman command must
still be witnessed from a networked device. See `WR-THYAPP-001` §5 for the full
list of what is not claimed.

---

# Media Studio (Chairman only)

Added 2026-09-15. Workroom `WR-THYAPP-001` Delta 2, routing through
`WR-AI-ROUTING-001`.

## The flow

```
registered asset  →  master image + continuity locks  →  Animate
      │                                                     │
      │                                          mode: AUTOMATIC | BUDGET
      │                                                | BEST_FIDELITY
      │                                                     ↓
      │                                   THYLORA Media Router (Edge Function)
      │                                    thylora-ai-router · secrets server-side
      │                                                     ↓
      │                            progress → provider answer → asset check
      │                                                     ↓
      └──────────  Apple Pencil markup over the frame  ←  preview
                                  │
                   approve · revise · reject
                                  │
              ┌───────────────────┴───────────────────┐
              ↓                                       ↓
   thylora_margin_note_add_v1            submit_thylora_review_gate_decision_v1
   (revision + markup, one queue)        (append-only decision ledger)
                                                      ↓
                                        rael_provenance_events (parent + tool)
                                                      ↓
                                        thylora_edf_publish_v1 (freezes release)
```

## The one rule that governs the screen

> No media generation claim unless the provider returned a successful asset.

`generationClaim()` is the only function permitted to say a generation happened.
A submitted job, a running job, a `200 SUCCEEDED` with an empty body, a
non-`http` asset reference, and a router error all report **not generated**, with
the reason shown. A provider success is recorded as `RETURNED`, never `REVIEW`;
only finding a locatable asset promotes it.

The database carries the same rule as a constraint
(`thy_job_no_claim_without_provider_asset`), so no other writer can mark a job
reviewable without provider evidence.

## Provenance that survives the round trip

The animate request carries `parent_asset_code`, `parent_version_no` and
`parent_checksum_sha256`. On handover, a `rael_provenance_events` row is written
**before** anything is published, with `event_type: AI_ASSISTED`,
`derived_from_ref` naming the parent, `tool_disclosure` naming the router,
model and router audit id, and evidence carrying the serial number, QR
destination, logo requirement and parent checksum.

A published version is never overwritten. `rael_media_assets` already models this
(`version_no` + `replaces_asset_id`), and the studio shows
`PUBLISHED_VERSION_IMMUTABLE` rather than offering an edit.

## Apple Pencil

Strokes are vectors in frame-relative `0..1` coordinates, so a markup drawn on
an iPad in portrait replays correctly anywhere — not a flattened screenshot.
Pencil pressure and tilt are recorded; a finger or mouse reports `0` or exactly
`0.5`, which is not a measurement, so it is stored as `null` and counted
separately. `pencil_stroke_count` never includes touch input.

## Authority

The Chairman is resolved from the **canonical `thylora_user_roles` table**, the
same way the authoritative dashboard does it (`role === 'chairman'`, lowercase).
A JWT `app_metadata` role is also accepted. `user_metadata` is ignored — it is
user-writable, so honouring it would let any member promote themselves.

Reading continuity first caught that the shell had been checking only the JWT
claim, which would have **refused the Chairman his own studio** on the live
backend.

---

# Remaining actions

**From the current code state to live usable operation of the Media Studio:
12 actions.** None of them is a code change in this repository.

### Blocking generation (nothing can be animated until these are done)

| # | Action | Who |
|---|---|---|
| 1 | Extend `thylora-ai-router` to accept the `ANIMATE_MEDIA` task and return `{status, asset_url \| storage_key, model, audit_canonical_id, review_gate_canonical_id}`. v12 routes text providers (GEMINI, GROK); an animate task shape is **unconfirmed**. | backend |
| 2 | Choose and credential a media/animation provider in backend secrets. The provider map still lists `video_transcode` and `image_processing` as **OPEN** decisions. | Chairman |
| 3 | Create a review gate per animation result, so a decision has a `review_gate_canonical_id` — either returned by the router or written on job submit. Without it, approve/revise/reject cannot reach the ledger and the studio says so rather than recording locally. | backend |

### Blocking the studio opening at all

| # | Action | Who |
|---|---|---|
| 4 | Apply `db/rae-link/0001`–`0010` — the asset registry, renditions, provenance and rights the studio reads. | backend |
| 5 | Apply `db/thylora-app/0001`–`0005` — the shell's surfaces plus the job, markup and requirements tables. `0003` and `0005` refuse to apply if `thylora_is_chairman()` is absent. | backend |
| 6 | Register at least one asset in `rael_media_assets` with a READY master rendition at a resolvable URL, and bind a passport so it carries a serial number and QR destination. | production |

### Pre-application confirmations (two assumed column names)

| # | Action | Who |
|---|---|---|
| 7 | Confirm the live `orders` column names and adjust the `thy_order_arrivals` view in `0002`. | backend |
| 8 | Confirm `digital_product_passports` exposes `qr_destination` (this lane assumes that name) and adjust the registry select if it differs. | backend |

### Required before anything publishes

| # | Action | Who |
|---|---|---|
| 9 | Declare release requirements per asset: decide `logo_required` and attach `logo_asset_ref`. `logo_required` is deliberately `NULL` until decided, and the studio blocks on `LOGO_REQUIREMENT_UNSET` rather than assuming no logo is needed. | Chairman |

### Outstanding continuity

| # | Action | Who |
|---|---|---|
| 10 | Reconcile `thy_prompt_ledger` with the canonical `thylora_query_carryforward` into one read. A `carryforward_query_id` join column exists; the reconciliation does not. | backend |

### Delivery and witness

| # | Action | Who |
|---|---|---|
| 11 | Deploy `/thylora-app` to the live runtime — either merge it forward into `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`, or publish this repository. Deployment authority is **not** this repository. | Chairman |
| 12 | **Witness on the actual iPad.** Safari on iPadOS with a physical Apple Pencil: open a registered asset, animate, mark up a frame, revise, approve, queue. The proof in this repository is headless Chromium at iPad dimensions with synthesised pen events — it does not cover Safari's `touch-action`/`setPointerCapture` behaviour, palm rejection, Pencil hover, Scribble interference, real pressure curves, or the iPadOS install path. | Chairman |

## What is proven now

`npm test` — 155 unit tests. `npm run test:browser` — 47 browser tests, 18 of
them driving the Media Studio at iPad Pro 11" portrait with real
`pointerType: 'pen'` events carrying pressure and tilt.

## What is not claimed

No media has been generated by any provider through this code. No live round
trip was performed: this environment's network policy refuses `CONNECT` to
`jvsdxhrfhtlgaknhjxlz.supabase.co`, so the router was intercepted, not called.
The migrations are held, not applied. **This is not complete, because action 12
has not happened.**
