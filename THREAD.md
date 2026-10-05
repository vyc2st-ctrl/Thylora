# THYLORA — the whole thread (Lanes Board)

Updated every session, in the same commit as the work (see `CLAUDE.md` §1).
Last update: 2026-10-05 ET · backend custody 656 / ledger 656 (ledger 655 has no custody row — gap preserved) · branch `claude/root-house-lineage`

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
| 9 | **The Window (our TRL)** | `rae-link/lib/countdown.js` · RAE Link tab | **FORMAT + RULES BUILT · world-licensed** | Show clock, 6 segments, vote rules, tests | `rael_votes` migration | Pick the name; studio, hosts |
| 10 | **First post** | `docs/FIRST-POSTS.md` | **3 drafts** | Rebuilt around "people first" | Pick A, B or C | Pick one |
| 11 | **RAE Link media network** | `rae-link/` · WR-RAELINK-001 | Built, held | — | Apply backend; choose providers | B1–B7 in WR-RAELINK-001 |
| 12 | **Store + memberships** | `public-site/store.html` | Live surface, purchase buttons gated | — | Connect checkout | Payment provider |
| 13 | **Shows** (Bramble + Wick, Dividend Circle, Green Milk) | `app/` World Shows, Story Studio | Development | — | Character bibles → pilots | Casting decisions |
| 14 | **Money** (ledger, payouts, GAME-BET-001) | `rae-link/lib/ledger.js`, `app/sports-betting.*` | Built, held | — | Payout provider (highest-cost open decision) | Provider + legal |
| 15 | **Operating logic** (ask the next question, preserve source, evidence trail, no frozen system) | `app/` Continuity, `CLAUDE.md` | **Now written into every session** | `CLAUDE.md` full-thread rule + Prime Directive | Keep enforcing | — |
| 17 | **Spine Forward check-in** | `SPINE.md` · `/spine` · `scripts/spine-forward.mjs` | **BUILT** | Correction: repo spine must mirror backend custody/ledger heads (641/640), not stand alone; Claude Code now reads backend directly | Script reads backend when secrets exist | GitHub Actions secrets (Chairman types them into GitHub, never into chat) |
| 18 | **World: people, companies, economy (Our World only)** | `world/registry.json` | **SEEDED** | Backend already holds 118 active personnel, 67 departments, 6 market companies, 326 master-ledger rows — repo registry is a small mirror | Feed the spine from backend tables | — |
| 19 | **First image** | `world/image-queue.json` IMG-001 | **QUEUED** | Brief written, waiting in the back | Produce once references arrive | The two reference pictures |
| 20 | **World value chains** (raise → kill → sell meat + skin → tan → make → sell) | backend `thylora_world_value_chain` | **BUILT · 1 chain, 10 steps** | Policy THY-POLICY-WORLD-LAYER-ECONOMY-BOUNDARY-643 LOCKED; CHAIN-CATTLE-HIDE-001 seeded, all OPEN | Name herder/butcher/tanner; record first hide sale; mark ECON-COMMODITIES PARTIAL (update timed out twice) | REE smallest unit · what one hide sells for |
| 21 | **Earth family in staff table** | backend `thylora_department_personnel` (7 rows, INVITED_NOT_ACCEPTED) | **HELD** | Untouched; excluded from worker counts | Move to an Earth-invitations list if the Chairman says so | Keep as invitations, or move out? |
| 22 | **REE value + Ma Sweet banknote** | backend `currency_visual_registry` REE-VALUE-ANCHOR-PROPOSAL-654 | **PROPOSED** | 1 REE ≈ 1 EUR buying power; 100 minor units; name idea "sweet"; blue note, her portrait and clothes, her people on the back | Chairman confirms anchor + unit + that her note IS the REE note | Yes/no on all three |
| 23 | **Ma Sweet (great-grandmother, came out of Canada)** | backend `genealogy_research_intake` GEN-MAT-MASWEET-001 (FAMILY_RESTRICTED) | **FAMILY_TOLD · photo received** | Recorded; nation UNVERIFIED | Census + Tennessee death-certificate tests once side and name are known | Kid Wright's mother or Hester Harris's? Her given name? |
| 24 | **Thread sync** | backend `thylora_thread_handoff_bus` THY-HANDOFF-654-MASWEET-REE-SYNC | **POSTED** | Rule: read both heads before writes · obey ledger guard · claim lanes on the bus · proposals stay PROPOSED | Every thread reads the bus first | — |
| 25 | **Lineage Hypothesis Gate** | `lineage/lib/gate.js` · backend MATH-LINEAGE-HYPOTHESIS-GATE-656 (PROPOSED) | **BUILT** | No default story; family word holds ("enslaved" = 0); 5 origin hypotheses at 20% each; word gate blocks unproven claims; race-change detector; Canada tests rewritten (Indigenous records + race column) | Run census race series on the maternal line | Ma Sweet: grandfather's or grandmother's mother? Her given name? |
| 26 | **Public-record trace (both sides)** | backend `genealogy_research_intake` +3 rows `GEN-EVID-*-656` (FAMILY_RESTRICTED) | **MOVED** | Maternal grandparents proven as a couple by 2 obituaries; household in Mississippi 1929–1947; father's parents named in a Social Security index (INDICATED); Covington memory belongs to the father's side | 1930/1940/1950 census for the maternal household → grandmother's parents (Ma Sweet test) | Order a Tennessee/Mississippi death certificate if wanted |
| 27 | **DNA route** | `docs/LINEAGE-CANADA-MEMPHIS.md` §7 | **WRITTEN** | AncestryDNA raw file → FamilyTreeDNA, MyHeritage, GEDmatch (free); mtDNA answers Ma Sweet directly if she is the grandmother's mother | Chairman downloads raw file | Upload when ready |
| 28 | **Import any family tree** | `lineage/lib/gedcom.js` | **BUILT** | GEDCOM import from Ancestry/FamilySearch/MyHeritage, seated by Ahnentafel | Wire upload button | Export tree from Ancestry if one exists |
| 29 | **RAE Link creator payouts (RAE-PAY-1)** | `rae-link/lib/payouts.js` · backend THY-RAELINK-PAYOUT-PLAN-656 | **PROPOSED · tested** | Beats best Earth share on every lane (ads 75% vs 55%; subs 95%; tips 100% + fee paid; media 92%; affiliate 80%); weekly pay, no threshold; founding half-fee; Window Top-10 bonus | Chairman picks | YES to RAE-PAY-1, or change any lane |
| 30 | **Our World is licensed** | backend THY-POLICY-WORLD-LICENSED-656 (OPERATIONAL) | **LOCKED** | No Earth restrictions inside Our World; Earth gate only when real Earth money/people cross | — | — |
| 31 | **Family Archive Department oversight** | backend THY-DEPT-FAMILY-ARCHIVE-OVERSIGHT-656 | **REGISTERED** | Princess MaryAnn oversees the Root House; no prior record existed | Add her as a world person | Her exact title |
| 32 | **Film 1923 · Tamara · REE · Bell Crossing · Dashboard seats** | backend packets from seq 651 | **EXISTING — not rebuilt** | Read, not duplicated | Waiting on Chairman decisions listed at 651 | Film premise + Nation; Tamara go/amounts by Oct 8 (auction Oct 11); REE smallest unit; Bell Crossing era |
| 16 | **Dashboard** | `thylora-executive-dashboard` (other repo) | Not this repo | — | — | — |

## Why the "one topic" problem kept coming back — and the fix
Chat memory resets between sessions, so a promise made in chat dies with the chat.
The fix is a file the system reads every time: **`CLAUDE.md`** (full-thread rule +
Prime Directive) and **this board**, updated in every commit. It stays fixed because it
lives in the repo, not in a conversation.
