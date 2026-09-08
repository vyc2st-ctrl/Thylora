# Q336 — Why the Publish EDF package control is not on the Chairman's page

Run code: `Q336_DEPLOY_DIAGNOSIS`
Backend finding: `thylora_run_findings` → `VERCEL_PRODUCTION_PINNED_AT_PR10_COMMIT`
(finding_id `2c5951eb-85f2-4713-99b8-e73a16214b15`, recorded 2026-09-08T11:52:14Z)

This document exists so the next session does not repeat the diagnosis.

## 1. Which page the Chairman is on — identified, not guessed

The Chairman's screenshot shows the header brand **THYLORA CURRENT HEAD** and the
chip **BUILD 8 · CURRENT HEAD · BACKEND FIRST**.

- `index.html` (repo root of `vyc2st-ctrl/thylora-executive-dashboard`) carries
  `<div class="brand">THYLORA CURRENT HEAD</div>` and `<div class="release">…</div>`.
- `js/dashboard-repair-build8.js` line 10 rewrites any `.release` node whose text
  matches `/R5|workspace restored/i` to the exact literal
  `BUILD 8 · CURRENT HEAD · BACKEND FIRST`.
- `js/app.js` loads `js/dashboard-repair-build8.js` dynamically.

No other page in the repository produces that pair of strings. `app/index-v8.html`
is titled "THYLORA App" with the chip "BUILD 8 · PRODUCTION FLOOR". The Supabase
Edge Function `thylora-current-head` serves its own standalone page with neither string.

**The Chairman is on the Vercel-served root `index.html`.**

## 2. Which commit that page is — proved from the artifact

Master history, newest first:

| commit | when (UTC) | what |
| --- | --- | --- |
| `8ff25e5` | 2026-09-07 18:46 | Merge PR #11 — Complete the Release + Webhook Signature Health |
| `308fb39` | 2026-09-07 18:29 | Add webhook signature health |
| `bb29861` | 2026-09-07 17:32 | Add the two remaining Chairman store-release actions |
| `c72688a` | 2026-09-07 16:58 | Merge PR #10 — EDF release control + customer library |

**Lower bound — production is at least `c72688a`.** The Chairman sees the Store
Release board and the `Run validation` button. Both come from
`js/edf-release-approval.js`, which does not exist before `c72688a`.

**Upper bound — production is not `8ff25e5`.** In `index.html` at `8ff25e5` the
heading is *static markup*, not JavaScript output:

```html
<article class="r5-panel" style="grid-column:1/-1">
  <h3>Complete the Release <span class="sub" …>· publish the file · approve customer copy</span></h3>
  <div data-panel="store-release-actions">…Loading remaining release actions…</div>
</article>
```

That heading renders from the HTML document alone. It does not depend on
JavaScript, on sign-in, or on any RPC succeeding. If the browser had received
`8ff25e5`, the words "Complete the Release" would appear even with every script
broken. The Chairman reports they do not appear.

Master contains no commits between `c72688a` and `8ff25e5` other than the two
PR-11 branch commits, so by elimination:

> **Production is serving `c72688a` exactly. Master head `8ff25e5` has never been
> deployed.** The merge is real; the deployment is not.

## 3. The stale page cannot be repaired from the backend

`js/edf-release-approval.js` at `c72688a` renders only two hardcoded controls,
`data-er-validate` and `data-er-approve`. It renders no server-supplied action
list, and every server string it prints goes through `escapeHtml`. Its only RPCs
are `thylora_edf_release_board_v1`, `thylora_edf_validate_v1` and
`thylora_edf_set_release_metadata_v1` — there is no publish call anywhere in the
deployed bundle.

**No database change, RPC change, or data shape can put a Publish control on that
page.** A new deployment is the only mechanism.

## 4. Deploy authority — every route tested, each result recorded

| attempt | result |
| --- | --- |
| `list_teams` | OK — team `Thylora` / `team_ocj6ZlW5L0jOKimxxawkv5vS`, plan pro |
| `list_projects` (that team) | **zero projects returned** |
| `get_project thylora-public-world` | **404 Not Found** |
| `list_deployments prj_GgQXKc3WWdteedBnr68Lxi2GQdYP` | **403 Forbidden** — "You don't have permission to list the deployment" |
| `deploy_to_vercel` (preview, throwaway) | **SUCCEEDED**, status READY |
| `get_project` on the project just created by this session | **404 Not Found** |
| `update_project_deployment_protection` on that same project | **404 Not Found** |
| `create_git_project` linked to the repo | project created, **git link unverifiable — 404** |
| `web_fetch_vercel_url` | "Unable to create shareable URL" |
| `curl https://thylora-public-world.vercel.app/` | **403 CONNECT** — network egress policy denial |
| `WebFetch` same URL | **EGRESS_BLOCKED** |

Read authority is absent on *every* project, including projects this session
creates. Deploy-create authority exists. Authority on the project actually
serving the Chairman is absent entirely.

### Why no parallel dashboard was shipped

A duplicate could be deployed to a new Vercel URL. It was not, because this
session cannot read deployment protection on the projects it creates, so it
cannot prove the Chairman would not meet a Vercel login wall, and cannot fetch
the result to prove the page renders. Handing over a URL under those conditions
would breach *do not claim deployed until live evidence proves it*. The correct
fix restores the surface the Chairman already uses rather than forking it.

Two empty scaffold projects were created inside team `Thylora` during authority
probing and could not be deleted from here: `thylora-head-authority-probe` and
`thylora-head-current` (`prj_39J5LnALT3dTuEcvGzxed2lEAtbk`). Neither serves
THYLORA content. They are disclosed here so they are not mistaken later for a
live surface.

## 5. State re-verified at diagnosis time

`EDF-TWELVE-MILES-FOR-FLOUR-001` — `state = DRAFT`, `published_at = null`,
`age_classification = FAMILY`, `rights_territories = ["WORLDWIDE"]`.

## 6. What unblocks it

A production deployment of `master` @ `8ff25e5` onto the project serving
`thylora-public-world`. That requires Vercel account authority this session does
not hold. It is the only remaining Chairman-only step in the release lane.

What is *not* still unknown: what the code should be, whether the merge landed,
whether the backend is ready, or where the control lives. All of that is settled.
