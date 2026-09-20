# THY-WORK-DASHBOARD-APP-USABLE-FASTLANE-556A

Sequence 556A · Chairman control plane · 2026-09-20

Code for this work lives in the deployment repository, not here. Per
`DASHBOARD_AUTHORITY.md` this repo is development/history source; the Chairman
dashboard ships from `vyc2st-ctrl/thylora-executive-dashboard` to
`thylora-public-world`. This file is the continuity record.

- Code branch: `vyc2st-ctrl/thylora-executive-dashboard@claude/dashboard-app-usability-fastlane-s3dl51`
- Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
- Runtime: `thylora-public-world` (Vercel), `https://thylora-public-world.vercel.app`

## A · Backend head

| | |
|---|---|
| Highest registry sequence | `THY-WORK-CUSTOMER-JOB-SHORTLIST-556` (IMPLEMENTATION_ACTIVE) |
| This work | `THY-WORK-DASHBOARD-APP-USABLE-FASTLANE-556A` |
| Graph | 28 nodes · 90 edges · 116 versions · layers Earth, EdereAirah |

## B · Prior 555 receipt

`THY-WORK-DASHBOARD-APP-FASTLANE-555` **did not carry completion evidence.**
At first read `created_at` equalled `updated_at` (2026-09-20 11:42:49Z) and the
`evidence` object held only the intent flags it was opened with.

Its acceptance test, measured against the live deployment:

| Criterion | Witnessed |
|---|---|
| Production deployment witnessed | met |
| Stale deployment evidence reconciled | met (this work) |
| Control surface shows live state | met |
| No duplicate app created | met |
| Chairman can act without raw backend | **not met** before this work |
| Approval route reachable in production | **not met** — still 404 |

**Correction recorded mid-session.** A concurrent session wrote graph node
`THY-DASHBOARD-CONTROL-SURFACE-001` at 17:30Z under `source_ref` 555, proving
555 is being actively worked by another agent. The earlier SUPERSEDED state was
withdrawn; 555 now reads `ACTIVE_PARALLEL_WITH_556A_SCOPE_SPLIT`. Both evidence
sets are preserved. Scope split:

- **555** (concurrent session): STORE, SOCIAL, GRAPH, MATH, REPORTS surfaces.
- **556A** (this session): TODAY opening screen, installable PWA, Store Draw
  gate enforcement, rendered mobile/iPad witness.

Both edit the same repository. **Branches must be merged before promotion.**

## C · Live deployment witness

Read from the Vercel deployment API and from git objects, not from registry rows.

| Surface | Witnessed state |
|---|---|
| Production deployment | `dpl_CYd64iR6miVsVhfGQWEup9EY87P1`, target `production`, READY |
| Production commit | `90003f3` — the RELEASE-FIX-538 branch tip |
| Master head | `a634249` — deployed only as a preview, never promoted |
| Root `/` | serves the Chairman dashboard (`index.html`) |
| `/app` | rewrites to `app/index-v8.html` |
| **Approval route** | **absent from production.** `chairman-approval.html`, its CSS and JS, and the `/chairman-approval` and `/approve` rewrites exist only from `367aea4`, which production predates |
| Control surface | present — TODAY, LIVING MAP, QYRIS, PREVIEW, AGENT JOBS, APPROVALS all in the deployed `index.html` |
| Supabase reads | live, publishable key, RLS-gated |
| Auth | Supabase email/password, `persistSession` + `autoRefreshToken` |
| Graph | read-only from the dashboard |

## D · Backend truth at time of writing

active 38 · blocked 4 · needs Chairman 4 · sellable now 1 · social waiting 28 ·
draw gate 0 PASS / 6 FAIL · preview packets 4, all HELD · router jobs 97 ·
QYRIS checks 74 · control lanes 42.

Only sellable product: *Twelve Miles for Flour — An Unkle Seezin Trail Story*.

## E · What 556A added

**Backend** — `thylora_chairman_today_v1()`. One read, ten blocks. STABLE, not
SECURITY DEFINER, explicit `search_path`, matching `thylora_control_surface_v1`,
so RLS still decides what the caller sees.

**TODAY screen** — `js/chairman-today.js`, `css/chairman-today.css`, mounted as
the first panel in `index.html`. Every block names its source table. An empty
block says it is empty; an unrecorded value reads `NOT RECORDED`.

**Store value gate** — `LAW-STORE-DRAW-VALUE-001`, D = A×H×W×T×M×P, rendered
with all six factors, D, PASS/FAIL and the lowest factor highlighted. A subject
whose `gate_state` is not PASS gets no RELEASE control — it is told which factor
holds it. All 6 scored candidates currently FAIL.

**PWA** — root-scope `manifest.webmanifest`, `sw.js`, and `icons/`. The repo had
**no icons at any size**, which alone blocked installability; the only manifest
was scoped to `/app/`. The root worker is network-first for the shell and never
intercepts Supabase, so no session or row is served from cache.

**Navigation** — the bottom tab bar's "Today" pointed at the old control-surface
panel; it now lands on the opening screen. `dashboard-identity-link-build8.js`
anchored above everything in `main`; it now anchors below TODAY.

## F · Mobile witness

`tests/mobile-witness.mjs` drives the real `index.html` in Chromium 1194 at real
device viewports, replaying a verbatim `thylora_chairman_today_v1()` capture
through the shipped module. Assertions are on what the browser laid out.

| Viewport | Overflow | Min tap | Ten blocks | TODAY first | FAIL exposing RELEASE |
|---|---|---|---|---|---|
| 390×844 @3x | 0px | 46px | yes | yes | 0 |
| 844×390 @3x | 0px | 46px | yes | yes | 0 |
| 820×1180 @2x | 0px | 46px | yes | yes | 0 |
| 1180×820 @2x | 0px | 46px | yes | yes | 0 |

Screenshots in `evidence/` of the deployment repo. This is a render witness, not
a production sign-in witness: it runs against a local server with a stubbed
session and does not stand in for the Chairman opening the live URL.

## G · Remaining blockers

1. **Production still serves `90003f3`.** The approval route 404s live. Fixed by
   promoting master (plus this branch) — a Chairman deployment decision.
2. **This branch is not merged.** 556A and the concurrent 555 branch both touch
   the dashboard; merge before promoting.
3. **No production sign-in witness.** Nobody has yet opened the live URL as
   Chairman and confirmed TODAY renders against a real session.
4. **Store draw gate: 0 PASS, 6 FAIL.** Nothing new can be released until a
   candidate's lowest factor is raised.
5. **Egress.** This session could not reach `thylora-public-world.vercel.app`
   directly; the proxy denied CONNECT. Deployment state was read through the
   Vercel API and git objects instead.

## H · Next executable action

Merge `claude/dashboard-app-usability-fastlane-s3dl51` (and the concurrent 555
branch) into master, then promote master to production on `thylora-public-world`.
That single promotion restores the approval route and puts TODAY in front of the
Chairman.

## I · Restart point

Read `THY-WORK-DASHBOARD-APP-USABLE-FASTLANE-556A` in
`thylora_execution_work_registry`, then `thylora_chairman_today_v1()` for live
state, then graph node `SURFACE-CHAIRMAN-TODAY-001` and its `PART_OF` edge to
`THY-DASHBOARD-CONTROL-SURFACE-001`.
