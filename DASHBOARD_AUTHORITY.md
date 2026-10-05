# THYLORA Dashboard Authority

Current deployment authority is **not this repository**.

Authoritative runtime project: `thylora-public-world`

Authoritative deployment repository: `vyc2st-ctrl/thylora-executive-dashboard`

Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

This `vyc2st-ctrl/Thylora` repository may contain development/history source, experiments, app assets, or material to be intentionally merged forward. It must not be treated as the deployment source of truth for the Chairman dashboard unless the Chairman explicitly changes authority.

Rule: changes intended for the live Chairman dashboard must be merged into `vyc2st-ctrl/thylora-executive-dashboard` and witnessed on `thylora-public-world` before they are called live.

---

## Pending merge-forward

**Dashboard R6 Chairman workspace** (`THY-DASH-R6-WORKSPACE-001`) — live readback,
margin notes, Pencil canvas, preview room, Prompt Coverage Ledger, Global Arrival
Matrix and Store Money-Distance.

- Source: `dashboard/r6/`, backend migration `db/dashboard/0001_r6_workspace.sql`,
  account in `workrooms/WR-DASH-R6-001.md`.
- Footprint on `dashboard-current-head.html`: two lines at the end of the body
  (one stylesheet, one module). 14 insertions, 0 deletions. No baseline
  capability is altered.
- **Not deployed. Not witnessed on iPad.** Under the rule above, it must be
  merged into `vyc2st-ctrl/thylora-executive-dashboard` and witnessed on
  `thylora-public-world` before any part of it is called live.

Note for whoever performs that merge: `dashboard-current-head.html` in this
repository carries release marker `THY-UI-20260823-0925-R5`, while the patch
workflows in `.github/workflows/` reference markers through
`THY-UI-20260824-1300-R8`. This snapshot is therefore behind the authoritative
head, which is a further reason the R6 lane must be applied to the authoritative
repository rather than deployed from here.

**THYLORA Media Router** (`THY-MEDIA-ROUTER-001`) — provider-agnostic video
generation from registered THYLORA assets, driving the `studio_render_jobs`
pipeline that already exists on `thylora-dash`.

- Source: `dashboard/r6/lib/media-router.js`, `dashboard/r6/lib/media-provenance.js`,
  `dashboard/r6/media-router-room.js`; migration `db/dashboard/0002_media_router.sql`;
  account in `workrooms/WR-MEDIA-ROUTER-001.md`.
- Creates no new pipeline and no new job table. The backend read of 2026-09-15
  confirmed `studio_render_jobs` and `studio_render_attempts` already exist with
  zero rows; this lane is their missing driver.
- **Cannot spend money as shipped.** Every provider rate card is unverified and
  every provider credential is absent, by design, until the Chairman supplies
  both.
- **Not deployed. Not witnessed on iPad. No provider has ever been called.**

---

## Pending merge-forward — Runway, Money Truth, Chairman Action Queue (2026-10-05)

Chairman instruction (sequence 664,
`THY-Q-20261005-MAH-RUNWAY-REGISTERED-MONEY-UNSEEN-ACTION-QUEUE-664`):
hook up Runway so he can put his account in; evaluate the money nobody has
talked about and put it in the backend; make the dashboard move to completion
without him, all the way to where it needs him, then alert him with one prompt
with minimum gaps where he clicks to activate what needs activating.

### Already APPLIED to thylora-dash (jvsdxhrfhtlgaknhjxlz)

| What | Where |
| --- | --- |
| `provider_code` vocabulary widened additively; `provider_kind`, `chairman_console_url`, `chairman_action_label` added | `db/dashboard/0003_runway_money_action_queue.sql` |
| RUNWAY registered `CHAIRMAN_AUTH_REQUIRED`, secret NAME only | same |
| Runway / Shopify / Supabase cost rows, amounts deliberately NULL | same |
| 4 new `chairman_action_cards` rows, all `spend_on_this_step = 0.00 USD` | same |
| `thylora_money_truth_v1()`, `thylora_chairman_action_queue_v1()`, `thylora_chairman_action_queue_withheld_v1()` | `db/dashboard/0003_functions.sql` |

Both files were read back out of the live database and match it. `0001` and
`0002` remain **UNAPPLIED** — do not assume otherwise.

### Awaiting merge into vyc2st-ctrl/thylora-executive-dashboard

| File | Change |
| --- | --- |
| `dashboard/r6/action-queue-room.js` | NEW. The "Needs you" room. |
| `dashboard/r6/custody.js` | `rpc()` added. Additive; no existing method touched. |
| `dashboard/r6/workspace.js` | One import, one room tab, one map entry, one lazy read. |
| `dashboard/r6/workspace.css` | `.thy-r6-panel` / `.thy-r6-stack` appended. No existing rule modified. |
| `dashboard/r6/proof/witness.mjs` | 5 Action Queue checks added. |

Witness: **138/138** across iPad Pro 11 portrait, iPad Pro 11 landscape and
desktop 1440x900 (`THY_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
node dashboard/r6/proof/witness.mjs`).

### Three invariants a future session must not break

1. **`chairman_action_cards` is the authoritative action store.** The queue
   function reads it. Do not create a second action table.
2. **The money picture and the queue are FUNCTIONS, not tables.** A stored copy
   is how a $1.00 test order came to stand in for a $1.99 real sale on the
   dashboard for three weeks.
3. **Clicking never closes a gate.** The Action Queue room has no mark-as-done
   control, and the witness run asserts its absence. Evidence closes gates.

### Rank 1 is still the reason the dashboard is not up

`THY-ACT-20260917-PROMOTE-EA21B42-001` is OPEN. `thylora-public-world`
production alias serves commit `308fb39`; master is ahead at `ea21b42` and
carries the Chairman dashboard assets. Until that alias is promoted, **no**
dashboard work from **any** session is visible to the Chairman. This session has
no Vercel alias scope and egress to the canonical host returns 403 on CONNECT,
so it could not promote and does not claim to.
