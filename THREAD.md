# THYLORA — the whole thread (Lanes Board)

Updated every session, in the same commit as the work (see `CLAUDE.md` §1).
Last update: 2026-10-05 ET · backend custody 662 / ledger 668 (this session; heads were 667/667 before its ledger write) · branch `claude/thread-checkin-checkout-662`

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
| 18 | **World: people, companies, economy (Our World only)** | `world/registry.json` | **SEEDED** | Backend already holds 118 active personnel, 67 departments, 6 market companies, 326 master-ledger rows — repo registry is a small mirror | Feed the spine from backend tables | — |
| 19 | **First image** | `world/image-queue.json` IMG-001 | **QUEUED** | Brief written, waiting in the back | Produce once references arrive | The two reference pictures |
| 20 | **World value chains** (raise → kill → sell meat + skin → tan → make → sell) | backend `thylora_world_value_chain` | **BUILT · 1 chain, 10 steps** | Policy THY-POLICY-WORLD-LAYER-ECONOMY-BOUNDARY-643 LOCKED; CHAIN-CATTLE-HIDE-001 seeded, all OPEN | Name herder/butcher/tanner; record first hide sale; mark ECON-COMMODITIES PARTIAL (update timed out twice) | REE smallest unit · what one hide sells for |
| 21 | **Earth family in staff table** | backend `thylora_department_personnel` (7 rows, INVITED_NOT_ACCEPTED) | **HELD** | Untouched; excluded from worker counts | Move to an Earth-invitations list if the Chairman says so | Keep as invitations, or move out? |
| 22 | **REE value + Ma Sweet banknote** | backend `currency_visual_registry` REE-VALUE-ANCHOR-PROPOSAL-654 | **PROPOSED** | 1 REE ≈ 1 EUR buying power; 100 minor units; name idea "sweet"; blue note, her portrait and clothes, her people on the back | Chairman confirms anchor + unit + that her note IS the REE note | Yes/no on all three |
| 23 | **Ma Sweet (great-grandmother, came out of Canada)** | backend `genealogy_research_intake` GEN-MAT-MASWEET-001 (FAMILY_RESTRICTED) | **FAMILY_TOLD · photo received** | Recorded; nation UNVERIFIED | Census + Tennessee death-certificate tests once side and name are known | Kid Wright's mother or Hester Harris's? Her given name? |
| 24 | **Thread sync** | backend `thylora_thread_handoff_bus` THY-HANDOFF-654-MASWEET-REE-SYNC | **POSTED** | Rule: read both heads before writes · obey ledger guard · claim lanes on the bus · proposals stay PROPOSED | Every thread reads the bus first | — |
| 25 | **Personal gift cup** (inscription; giver and recipient in backend, FAMILY_RESTRICTED) | backend `household_object_provenance` (custody 662 row) | **REGISTERED · photo not received** | Registered as personal provenance, not merch; gift date UNKNOWN | Attach the photo; link the giver to the family record once confirmed | Re-attach the photo; say which family member gave it |
| 26 | **Collaboration lead (woman in video)** | backend WDR-COLLAB-LEAD-WOMAN-VIDEO-662 | **HELD · identity UNKNOWN** | No prior record found; no duplicate; no face-only identification | Draft invitation once the handle is known | Post URL or account handle; what you like about how she talks |
| 27 | **ErsatzReality site + brand** | backend WDR-ERSATZREALITY-WEB-BRAND-SYSTEM-662 | **VERIFIED: ersatzreality.com is a live Shopify store** | One-site plan; the 10-section map fits Shopify pages; seal + Facebook-cover spec (lion removed) | Build the missing pages in Shopify once approved | Approve ersatzreality.com as the one public site; send banner + seal files |
| 28 | **Rapid money conveyor (R_p)** | backend WDR-RAPID-MONEY-CONVEYOR-RP-662 · MATH-REVENUE-PATH-PRIORITY-662 | **RANKED** | No outside buyer yet for any product, so finish what's built: 7 products are only missing the checkout check | Store lane checks checkout on those 7 | — |
| 29 | **Show: HOW DID THAT WORD GET HERE?** | backend WDR-SHOW-HOW-DID-THAT-WORD-GET-HERE-662 | **PILOT STRUCTURE** | 9-step method; child, history and adult layers | Source ledger for the pilot | Speaker's handle (no contact yet) |
| 30 | **Show: Nature before the name (Newton)** | backend WDR-SHOW-NATURE-BEFORE-THE-NAME-662 | **PILOT STRUCTURE** | Phenomenon ≠ observer ≠ discoverer ≠ formalizer ≠ namer | Source ledger for the pilot | — |
| 31 | **Jerusalem, Utah 1925 claim** | backend WDR-PROD-JERUSALEM-UTAH-1925-CLAIM-662 · MATH-CLAIM-PROVENANCE-662 | **RESEARCH** | Claim traced to Facebook/Instagram reposts (Sept 2026); original archive UNKNOWN; Utah location DISPUTED | Match the frames to Library of Congress collections | Re-attach the video |
| 16 | **Dashboard** | `thylora-executive-dashboard` (other repo) | Not this repo | — | — | — |

## Why the "one topic" problem kept coming back — and the fix
Chat memory resets between sessions, so a promise made in chat dies with the chat.
The fix is a file the system reads every time: **`CLAUDE.md`** (full-thread rule +
Prime Directive) and **this board**, updated in every commit. It stays fixed because it
lives in the repo, not in a conversation.
