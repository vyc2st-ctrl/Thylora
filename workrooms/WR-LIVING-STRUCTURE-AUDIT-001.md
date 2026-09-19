# WR-LIVING-STRUCTURE-AUDIT-001 · Living-structure completion audit

**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Work code:** `THY-WORK-LIVING-STRUCTURE-AUDIT-001` · **Run:** `THY-LSA-20260919`
**QYRIS:** PASS, check `2535e146-cbd5-45fb-a61f-1afa004cefae`, layer `THY-QYRIS-PLAIN-SPEECH-001`
**Head read:** 525 at start; 526 and 527 landed during the run and are incorporated. Written back at **528**.
**Watchdog:** inspected, **not duplicated** — pg_cron job 3 `thylora_enforce_standing_invariants_v1()` every minute, job 1 `thylora_recovery_heartbeat()` every 15 minutes.

Read-only over canon. No image generated, no product created, nothing published, no canon row altered.

---

## Controlling finding

**The world is built downward from people and never upward from places.**
Every audited lane has IDENTITY. Almost none has PLACE, TIME or OPERATIONS. That is the mechanism
behind the Chairman's correction at 523: a finished-looking artifact sits on nothing, so the next
scene has to invent its surroundings again, and the invention has to be redone every time.

34 findings: 2 BLOCKER · 3 CONTRADICTION · 24 DEFECT · 5 NOTE/UNKNOWN.

---

## Royal Cook / Rosemary — 1 of 9 dimensions complete

| Required | State | Evidence |
|---|---|---|
| Building | **MISSING** | No castle or residence entity exists. Only the free-text location "Castle network" on `THY-SCHED-CASTLE-SOCIAL-001` |
| Kitchen wing, room | **MISSING** | `thylora_hq_room_registry` = 0 rows; no world room registry exists at all |
| Date, time, shift, season | **MISSING** | Scene carries none; royal household assigned to no time-region |
| Staff hierarchy | **PARTIAL** | `HH-1700-COOK` Head Cook exists with deputy and provisioner beneath — Inés Morales is **not bound to it** |
| Other royal cooks | **MISSING** | Exactly one cook person exists |
| Supply route, garden, market | **MISSING** | No such record anywhere |
| Equipment, stove/hearth, makers, marks | **MISSING** | `household_object_provenance` = 0 rows |
| Wardrobe | **COMPLETE** | `LOCK-ER-ROYAL-COOK-001` — the one living rule in the lane |
| Pay, status, days off | **MISSING** | `payroll` = 0 rows |
| VLEGH | **MISSING** | 4 rows, all Earth-actual family-studio sources |
| Product / story origin | **MISSING** | `HERB-FILE-001-NO-PROVIDER-OBJECT`, all 10 readiness flags false |
| Voice | **MISSING** | 4 voice profiles, none is hers |
| Mirror reveal, QR, serial, provenance | **MISSING** | `qr_destination: UNKNOWN`; no serial among 38 |

**Contradiction (LSA-RC-14):** the scene manifest still reads `cook_name_state: UNKNOWN_PENDING_CHAIRMAN`
while the entity reads `CHAIRMAN_FINALIZED` per sequence 509. Flagged, not edited.

**Open by canon, not omission:** locket CLOSED, connection to Veronica Hall UNKNOWN, native plant name OPEN.

**Handed forward:** sequence 527 directs a real historical EdereAriah castle with founding, dynasty,
kitchens, staff, suppliers, streets, time and history (Malbork as the Earth mirror, shown second).
`LSA-RC-01`, `-02`, `-06` go there. **Do not build that castle twice.**

---

## Football / sports — MISSING on 19 of 24 dimensions

- 33 team rows. 30 are `ERFL-SLOT-03` … `ERFL-SLOT-32`: every field null or `UNRESOLVED`, all marked `IMPLEMENTATION_ACTIVE`.
- **No table exists anywhere** for players, rosters, contracts, draft, scouting, stadiums, coaches,
  front office, medical, training, facilities, equipment issue, travel, schedule, results, statistics or fans.
- **COMPLETE:** governance. `ER-SA-001` with four commissioner seats carrying portfolios, recusal triggers, required evidence.
- **PARTIAL:** merchandise `GGL-MERCH-001`, equipment `KJ-FOOT-EQ-001`, network `ER-SN-001` — all six readiness gates OPEN/PARTIAL/PENDING.
- **Blocking everything:** `ERFL-001` vs `GGL-001` is `HELD_IDENTITY_CONFLICT_REVIEW`. Any roster or stadium built now may be built twice.

---

## Product origin — measured, 102 rows

| Origin element | Present |
|---|---|
| Source idea / design | 101 |
| Rights | 63 |
| Serial | 49 |
| Passport | 48 |
| Manufacturing / supplier | 46 |
| **Any maker role** (author, editor, artist, press, factory, distributor) | **27** |
| **Earth transmission** | **1** |

Reading as files: four Kyxie safety systems, three DMaK, three Kid to Kid, ~12 ER digital-publishing
packs incl. five NSSM 200 rows (serial + passport, no maker); seven Question Engineering rows,
Counterpoint Deck, Heirloom Hunt, Open Table Cards, Family Passport Collection, Sports Intelligence
Spine (nothing at all). Even the two coloring books name people without naming a press, editor,
factory or distributor.

---

## Building / room inheritance

| Room | Building | District/City | Time | Owner | Purpose |
|---|---|---|---|---|---|
| — (0 rooms) | `THY-STR-HQ-001`, 29 floors | — | — | THYLORA | per floor |
| `HERB-ROYAL-KITCHEN-001` | **none** | **none** | **none** | **none** | herb/food introduction |
| kitchen-dining (measured) | `ER-HOME-HOMEWORK-001` | **UNRECORDED** | uncalibrated | Rowan household | homework |
| — | — | `ER-PLACE-BELL-CROSSING-001` | `UNKNOWN — OPEN CONFLICT` | — | settlement |

`thylora_scene_execution_contract` and `studio_scene_manifests` are both empty although
`thylora_enforce_studio_scene_contract` exists to police them.

---

## Operational Time v1 gaps

`THY-DUAL-TIME-EDEREARIAH-002` is RECOVERY_ACTIVE on **one** hard anchor — 2026-09-17 10:05 EDT =
Day 83 Aethon 4h05 — with a 507 Earth-read-day orbit and the 2026-08-03 continuity epoch candidate.

**Still OPEN:** native day length · sub-day units · month/cycle names · season names and boundaries ·
weekday names · year numbering.

**Consequence:** a scene can carry an Earth mirror timestamp and a Continuity Day today. It cannot
carry a native date, a native time of day, a season, or a season-derived weather stamp. All four
`thylora_world_schedule` rows read `WORLD_CLOCK_UNCALIBRATED`, and `THY-PUNCH-TIMESTAMP-001` is
LOCKED requiring date **and** time — so the audited scenes fail a gate already in force.

---

## Restart point

**Without the Chairman:** (1) bind Inés Morales to `HH-1700-COOK` and its deputies; (2) populate
`thylora_hq_room_registry` for the 29 defined floors; (3) write scene execution contracts so the
installed trigger has something to police; (4) add maker chains to products that already carry
serial and passport.

**Only the Chairman:** (1) ERFL vs GGL identity ruling; (2) native day length beneath the Aethon
timeseal; (3) EdereAriah native name for the rosemary-mirror plant; (4) the locket connection;
(5) royal household time-region; (6) correction of the stale `cook_name_state`.

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
