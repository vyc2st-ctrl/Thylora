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
