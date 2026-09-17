# Operating Surface — merge-forward bundle

**This directory is not the deployed dashboard.** Per
`thylora_dashboard_authority_lock`, deployment authority is:

| | |
|---|---|
| Authoritative repo | `vyc2st-ctrl/thylora-executive-dashboard` |
| Vercel project | `thylora-public-world` (the only one) |
| URL | https://thylora-public-world.vercel.app |
| Backend | `thylora-dash` / `jvsdxhrfhtlgaknhjxlz` |

`vyc2st-ctrl/Thylora` is development/history source only. Nothing here is
live until it is merged into the authoritative repo **and** the Chairman
promotes the production alias.

No new dashboard was created. No new Vercel project was created. No Lovable
project was revived. No blocked frontend was promoted.

## What this adds

An **operational completion layer** on the existing Current Head dashboard:
ten new panels driven by one Chairman-gated backend read.

| Panel | Host element |
|---|---|
| Chairman Home (active / ready / blocked / needs you / can proceed / changed since last visit) | `data-panel="operating-home"` |
| Today / Now board, grouped by area | `data-panel="operating-today"` |
| Store traffic (shelves, verified price, checkout evidence, drafts) | `data-panel="operating-store"` |
| ErsatzReality News (ER-NEWS-001, Neyra Sol, claim ledger, publication lock) | `data-panel="operating-news"` |
| Social control (six explicit publication states, channels, Global Arrival) | `data-panel="operating-social"` |
| Chairman action cards (five questions each) | `data-panel="operating-actions"` |
| Traffic production board (story → publication) | `data-panel="operating-bridge"` |
| Workroom continuity | `data-panel="operating-rooms"` |
| Brand assets (UNKNOWN stays UNKNOWN) | `data-panel="operating-brand"` |
| System truth (DOCUMENTED / ANALYSIS / UNKNOWN) | `data-panel="operating-truth"` |

## How to merge into the authoritative repo

The files here mirror the authoritative repo's paths, so this is a copy:

```
js/operating-surface.js                 -> js/operating-surface.js          (new)
tests/operating-surface-render.mjs      -> tests/operating-surface-render.mjs (new)
tests/operating-surface-fixture.json    -> tests/operating-surface-fixture.json (new)
index.html                              -> index.html                        (patched)
```

`index.html` here is the full patched file taken from authoritative master
`ea21b42`. If master has moved on, re-apply the patch instead of copying:

1. Insert the block marked
   `<!-- ===================== THYLORA OPERATING SURFACE ===================== -->`
   immediately **before** `<section class="hero" id="home">`.
2. Insert the `Operating surface` drawer section immediately **before**
   `<div class="drawer-section"><h3>Workspaces</h3>`.
3. Insert `<script src="js/operating-surface.js"></script>` immediately
   **before** `<script src="js/app.js"></script>` — `app.js` must stay last.

Nothing else in `index.html` changes. No existing module, panel or control
is removed or reordered.

### Backend

Already applied to `thylora-dash`. See `db/migrations/`. Nothing to run.

## Verify before calling it done

```bash
node tests/operating-surface-render.mjs   # 49 checks, phone + iPad + denied + signed-out
```

Then the two things this bundle cannot do for you:

1. **Promote the production alias** to master — Chairman action card
   `THY-ACT-20260917-PROMOTE-EA21B42-001`. As of 2026-09-17 the alias still
   serves commit `308fb39`; `/js/chairman-dash.js` returns 404 there.
2. **Witness it signed in** as Chairman on the authoritative URL.

Until both happen, `THY-OPSURF-REG-20260917-012` stays `NOT_TESTED` and the
board must not be called live.
