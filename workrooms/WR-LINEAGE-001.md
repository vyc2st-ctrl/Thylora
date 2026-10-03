# WR-LINEAGE-001 · Root House

**Lane:** family lineage research — four lines, people first
**Opened:** 2026-10-03 · **Branch:** `claude/root-house-lineage-full-thread`
**Backend of record:** `thylora-dash` (migrations written and validated, **not applied**)

## Delta
| Added | What |
|---|---|
| `lineage/` (`/lineage`, `/root-house`) | Root House surface: The House, Four Lines, Parlor (STEEPED + Monster Night), Canada Desk, The Vault, Worker, Credits |
| `lineage/lib/lineage.js` | Ahnentafel seats, four lines, grades, living-privacy rule, credits, task routing, Canada tests |
| `lineage/lib/researchers.js` | 10 world-character researchers, parametric silhouettes, credit lines |
| `lineage/lib/sources.js` | 127 record collections |
| `lineage/lib/worker.js` · `scripts/lineage-worker.mjs` · `.github/workflows/root-house-worker.yml` | Scheduled research worker (daily 11:17 UTC + on family.json change) |
| `lineage/lib/teatable.js` | STEEPED nightly game, Elder cards → family-told stories |
| `lineage/family.json` | Seed: Canada story preserved, no names yet |
| `db/lineage/0001`, `0002` + `validation/` | 10 tables, RLS, grade guard trigger, append-only credits, generated catalog seed |
| `rae-link/lib/countdown.js` + The Window tab | Countdown show rules |
| `CLAUDE.md`, `THREAD.md` | Standing full-thread rule + Lanes Board |
| Docs | `LINEAGE-CANADA-MEMPHIS.md`, `RAE-LINK-THE-WINDOW.md`, `FIRST-POSTS.md` |

Changed additively: `vercel.json` (3 rewrites), `app/index.html` and `public-site/index.html` (one nav link each), `rae-link/index.html` + `app.js` (one tab).
Not touched: dashboard files, existing workflows, `app/app.js`, hotfixes, service worker.

## Evidence
| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 66 pass, 0 fail (48 existing + 18 new) |
| Seats never overlap | 124 seats across 5 generations, each in exactly one line (asserted) |
| Memory is never promoted without records | Same record twice stays POSSIBLE; disagreeing records → CONTESTED (asserted in JS and by DB trigger) |
| Migrations apply and re-apply | PostgreSQL 16, two passes, 0 errors |
| DB rules fire | 6 of 6 expect-reject cases rejected; RLS: other user sees 0 trees, owner sees 1; `rls_disabled_tables=0` |
| Worker survives provider failure | Errors recorded, run completes (asserted) |
| Pages load clean | Chromium: Root House 0 script errors, no horizontal scroll at 390 px |

## Blockers
- **B1 · No names yet** — the worker has nothing to search. Needs seats 2–7.
- **B2 · Archive hosts unreachable from this session** (loc.gov, archive.org returned no connection). The worker runs on GitHub Actions, which has open internet — verified only offline here.
- **B3 · Production DDL** — held Chairman action.
- **B4 · Reference images** — the two pictures were not attached to this session.
