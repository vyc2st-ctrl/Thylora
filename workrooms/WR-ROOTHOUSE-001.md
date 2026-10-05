# WR-ROOTHOUSE-001 · The Root House

**Lane:** Family lineage research: four grandparent lines, record sources, research desks, credit
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), schema held
**Branch:** `claude/root-house-lineage` · **Opened:** 2026-10-03

## Delta

| Added | What |
|---|---|
| `lineage/index.html`, `app.js`, `styles.css`, `silhouettes.js` | The Root House surface: Building, Four Lines, Research Plans, Canada Question, Record Sources, Credit Wall |
| `lineage/lib/lineage.js` | Ahnentafel model, line mapping, research planner, coverage, credit ledger |
| `lineage/lib/sources.js` | 47 real record sources with holder, years, places, access, yield |
| `lineage/lib/researchers.js` | 9 world-staff researchers, distinct silhouettes, desk routing |
| `db/lineage/0001_root_house.sql` | 4 tables, confidence guard, credit guard, RLS — **held** |
| `tests/lineage.test.mjs` | 12 tests |
| `CLAUDE.md`, `docs/THREAD-MASTER.md`, `docs/FAMILY-TEA-NIGHT.md`, `docs/SHOW-THE-WINDOW.md` | Standing rules and the running thread |

| Changed (additive) | What |
|---|---|
| `vercel.json` | `/lineage` rewrites |
| `app/index.html` | One "Root House" tab link next to RAE Link |

Not touched: dashboard files, authority files, workflows, RAE Link, Time Run, sportsbook.

## Evidence

- `npm test` → 60 tests, 60 pass (48 existing + 12 new).
- Migration applied twice to local PostgreSQL 16 with the Supabase stub: no errors (idempotent).
- Behaviour: PROVEN without a finding → rejected; finding without a credit → rejected at commit; credited finding then PROVEN → accepted.
- Surface rendered in Chromium at iPad size: 8 floors, 9 researchers, 14 research plans, no script errors.

## Blockers

- **B1 · Names (NEEDS FROM CHAIRMAN).** Nothing can be searched in a record index without at least one name.
- **B2 · Schema apply (HELD BY RULE).** `db/lineage` waits for Chairman apply; tree saves on device and exports JSON until then.
- **B3 · Reference images (NEEDS FROM CHAIRMAN).** The two building pictures did not reach the session.
- **B4 · Paid sources.** Ancestry, Fold3, Newspapers.com and DNA tests cost money; free alternatives are listed first in each plan.
