# THYLORA — the whole thread (Lanes Board)

Updated every session, in the same commit as the work (see `CLAUDE.md` §1).
Last update: 2026-10-03 14:25 UTC (session 3 · backend custody seq 641) · branch `claude/root-house-lineage-full-thread`

| # | Lane | Where it lives | Status | Moved this session | Next action | Needs from Chairman |
|---|---|---|---|---|---|---|
| 1 | **Family lines (4)** — FF, FM, MF, MM | `lineage/` · `/lineage` | **BUILT · names already in backend** | Correction: names live in `genealogy_research_intake` (FAMILY_RESTRICTED): father, mother, both maternal grandparents, possible paternal grandparents + 1 obituary source (2026-10-03) | Point Root House + worker at the backend table, not repo `family.json` | GitHub secrets so the scheduled worker can read the backend |
| 2 | **Canada → Memphis clue** | `docs/LINEAGE-CANADA-MEMPHIS.md` · Canada Desk | **FAMILY_TOLD, 6 tests ready** | Full breakdown + counterarguments | Run Test 1 on the maternal Wright/Harris line (Covington · Memphis · Mississippi) | Whose great-grandmother: the Chairman's or Eddie Ree's? |
| 3 | **Research building + people** | `lineage/lib/researchers.js` | **BUILT** | 10 researchers, all different silhouettes, credited, labelled world characters | Upgrade art from the Chairman's two reference images | Re-attach the two pictures (not received this session) |
| 4 | **Sources ("millions")** | `lineage/lib/sources.js` · The Vault | **127 collections** | US, Canada, Tennessee/Memphis, pre-1870, church, DNA | Keep adding; each holds thousands–billions of records | — |
| 5 | **Backend worker** | `.github/workflows/root-house-worker.yml` | **BUILT, runs daily after merge** | Searches Library of Congress + Internet Archive for every named person; writes leads | Merge to main so the schedule runs | Merge approval |
| 6 | **Backend database** | `db/lineage/0001–0002` | **VALIDATED locally, not applied** | 10 tables, RLS on all, grade guard, append-only credits | Apply to `thylora-dash` | Held Chairman action |
| 7 | **Tea Table (STEEPED)** | Root House · Parlor | **BUILT** | Nightly game, Elder cards feed the family lines | Play it; bring back the first Elder answer | — |
| 8 | **Monster Night** | Parlor | **LISTED** | Dracula, Frankenstein, Bride, Conjuring 2 + Black horror lineage | — | Age calls on R-rated picks |
| 9 | **The Window (our TRL)** | `rae-link/lib/countdown.js` · RAE Link tab | **FORMAT + RULES BUILT** | Show clock, 6 segments, vote rules, tests | `rael_votes` migration | Pick the name; studio, hosts |
| 10 | **First post** | `docs/FIRST-POSTS.md` | **3 drafts** | Rebuilt around "people first" | Pick A, B or C | Pick one |
| 11 | **RAE Link media network** | `rae-link/` · WR-RAELINK-001 | Built, held | — | Apply backend; choose providers | B1–B7 in WR-RAELINK-001 |
| 12 | **Store + memberships** | `public-site/store.html` | Live surface, purchase buttons gated | — | Connect checkout | Payment provider |
| 13 | **Shows** (Bramble + Wick, Dividend Circle, Green Milk) | `app/` World Shows, Story Studio | Development | — | Character bibles → pilots | Casting decisions |
| 14 | **Money** (ledger, payouts, GAME-BET-001) | `rae-link/lib/ledger.js`, `app/sports-betting.*` | Built, held | — | Payout provider (highest-cost open decision) | Provider + legal |
| 15 | **Operating logic** (ask the next question, preserve source, evidence trail, no frozen system) | `app/` Continuity, `CLAUDE.md` | **Now written into every session** | `CLAUDE.md` full-thread rule + Prime Directive | Keep enforcing | — |
| 17 | **Spine Forward check-in** | `SPINE.md` · `/spine` · `scripts/spine-forward.mjs` | **BUILT** | Correction: repo spine must mirror backend custody/ledger heads (641/640), not stand alone; Claude Code now reads backend directly | Script reads backend when secrets exist | GitHub Actions secrets (Chairman types them into GitHub, never into chat) |
| 18 | **World: people, companies, economy** | `world/registry.json` | **SEEDED** | Backend already holds 118 active personnel, 67 departments, 6 market companies, 326 master-ledger rows — repo registry is a small mirror | Feed the spine from backend tables | — |
| 19 | **First image** | `world/image-queue.json` IMG-001 | **QUEUED** | Brief written, waiting in the back | Produce once references arrive | The two reference pictures |
| 16 | **Dashboard** | `thylora-executive-dashboard` (other repo) | Not this repo | — | — | — |

## Why the "one topic" problem kept coming back — and the fix
Chat memory resets between sessions, so a promise made in chat dies with the chat.
The fix is a file the system reads every time: **`CLAUDE.md`** (full-thread rule +
Prime Directive) and **this board**, updated in every commit. It stays fixed because it
lives in the repo, not in a conversation.
