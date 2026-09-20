# Dashboard completion 555 — where the work actually landed

Work code: `THY-WORK-DASHBOARD-APP-FASTLANE-555`
Backend head at completion: sequence **557** (`thylora-dash`, `jvsdxhrfhtlgaknhjxlz`)

## Why nothing here changed

`DASHBOARD_AUTHORITY.md` in this repository says it plainly:

> Current deployment authority is **not this repository**.
> Authoritative deployment repository: `vyc2st-ctrl/thylora-executive-dashboard`

The 555 directive required finishing the **existing** dashboard and forbade building a
second one. The existing dashboard is the one deployed to `thylora-public-world`, and it
is built from `vyc2st-ctrl/thylora-executive-dashboard` — not from here. Adding the five
missing sections to `dashboard-current-head.html` in this repository would have produced
exactly the second dashboard the directive forbids: a divergent copy in a repository its
own authority file says is not the deployment source.

So the code landed in the authoritative repository, and this file records where.

## Where it landed

| | |
|---|---|
| Repository | `vyc2st-ctrl/thylora-executive-dashboard` |
| Branch | `claude/thylora-dashboard-completion-37annk` |
| Commit | `1e8f68e` |
| Preview deployment | `dpl_GP8VRWJoXZaTMMyUEk51AJKuiYeQ` — READY |
| Preview URL | https://thylora-public-world-git-claude-thylora-dashboar-a797b8-thylora.vercel.app |
| Merged to master | **No.** That is a Chairman decision. |

Sections added to the existing control surface: **STORE, SOCIAL, GRAPH, MATH, REPORTS**.
Already present: TODAY, QYRIS, APPROVALS, AGENT JOBS, LIVING MAP (and PREVIEW, kept).

Backend added: `thylora_dashboard_completion_v1()`, `thylora_graph_lookup_v1(stable_id)`.
Migration: `db/0002_dashboard_completion.sql` in that repository.

## Deployment truth as witnessed on 2026-09-20

| Surface | State | Evidence |
|---|---|---|
| `thylora-public-world.vercel.app` (canonical, LOCKED) | **CURRENT** | serves `dpl_HQeRmtCokwDTU3BiuTiX5i6DVdZd` = master `a634249` |
| `thylora-public-world-thylora.vercel.app` | **CURRENT** | serves `dpl_CYd64iR6miVs` = `90003f36` — a real deployment, but not the canonical URL |
| Dashboard JS | **CURRENT** | every script and stylesheet `index.html` references resolves; a full Chromium load produced no 4xx for any dashboard asset. The older "dashboard JS 404" registry claim is **STALE**. |
| Chairman approval route | **CURRENT** | `chairman-approval.html` and its `/chairman-approval` rewrite are both on master `a634249`, which is what the canonical URL serves |
| Authenticated dashboard | **UNKNOWN** | not read under an authenticated Chairman session; the egress proxy in the build environment denies CONNECT to `supabase.co` and `vercel.app` |
| Supabase connection | **CURRENT** | `jvsdxhrfhtlgaknhjxlz` ACTIVE_HEALTHY; both new functions exercised live on the allow and the refuse path |

A record naming `90003f36` as the commit serving production named the wrong deployment.
`git merge-base --is-ancestor` proves `90003f36` **is** an ancestor of `a634249`, so that
content is live — only the deployment id was wrong. Reconciled in
`thylora_execution_work_registry` under `THY-WORK-DASHBOARD-RELEASE-FIX-538`.

## This repository is still not the deployment source

Nothing above changes `thylora_dashboard_authority_lock`. `dashboard-current-head.html`
here remains development/history source and was deliberately left untouched. If the
Chairman ever wants authority moved, that is an explicit Chairman decision, not a
side effect of this work.
