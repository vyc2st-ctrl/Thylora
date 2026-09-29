# WR-PROD-FLOOR-001 · Production Floor — eight lanes

**Opened:** 2026-09-28 · **Source:** `SOURCE-DIRECTIVE.md` (Chairman VYC, verbatim)
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). Read live this session; **no production row, policy or schema was written.**
**Authority:** `DASHBOARD_AUTHORITY.md` holds. Nothing here deploys the Chairman dashboard.
**Earlier prompt → reconciled.** The "other prompt" is the parallel run **WR-SPINE-624** (backend row written 2026-09-28 20:54 UTC). Per the Chairman's instruction, **624 is primary wherever the two overlap** (lanes A, C contract, D, E, H). This workroom stands alone on Lane F, the Lane G intake engine, Lane B Transmission 001 concept selection, and two security findings. Read `RECONCILIATION-WR-SPINE-624.md` first. ⚠ 624's recorded repo branch `claude/thylora-production-director-hyxdyx` is **not on origin**, so its code is not retrievable from the repo.

## Read order

1. `00-RECOVERED-STATE.md` — what the backend and repo held before any lane started. The source of truth for "existing canon".
2. The lane packets. Each ends with the 20-part Department Return and a Backend Change Packet.

| Lane | File | Department (existing canon unless marked) | Code shipped | Verified completion (explicit denominator) |
|---|---|---|---|---|
| A · Animal life | `LANE-A-ANIMAL-LIFE.md` | LIVING_WORLD_ATLAS + Wildlife Refuge & Return (working name, THY-TRANS-WILDLIFE-607) | — | see file §20 |
| B · First transmission | `LANE-B-FIRST-TRANSMISSION.md` | EDEREARIAH_NEWSROOM with the host departments per concept | — | 105/105 concept fields written; publication gates 2/17 |
| C · Dashboard / API | `LANE-C-DASHBOARD-API.md` | WR-APP-QA-DEPLOY, BACKEND/FRONTEND_ENGINEERING | `api/*`, `db/dashboard-cut/*`, `tests/api.test.mjs` | **17/30 acceptance checks = 56.7%** |
| D · Store / Back-to-Buy / QR / suppliers | `LANE-D-STORE-BACKTOBUY-QR-SUPPLIERS.md` | THY-DEPT-STORE-OPS-001 | `store/lib/*`, `tests/store.test.mjs` | design 7/7; live operation 0/4 |
| E · Court help | `LANE-E-COURT-HELP.md` | Court Workflow & Record Integrity Office (PROPOSED unit of EDEREARIAH_LAW_HOUSE) | simulation generator in Appendix A | 55/65 drafted with no open dependency; 0/65 canon-approved |
| F · Comparative harm | `LANE-F-COMPARATIVE-HARM.md` | FOOD_INGREDIENT_INVESTIGATION (method owner); Earth sources credited | — | 320/806 evidence cells verified = 39.7% |
| G · Help desk | `LANE-G-HELP-DESK.md` | THY-DEPT-QUESTION-NAV-001 | `helpdesk/lib/intake.js`, `tests/helpdesk.test.mjs` | 19/25 = 76% |
| H · Network / banking | `LANE-H-NETWORK.md` | SYSTEMS, DATABASE_AND_INFRASTRUCTURE | — | design 7/7; build checks 10/30 = 33.3% |

## Fixes applied in this repo (not in production)

| Fix | File | Evidence |
|---|---|---|
| Service worker cached every signed-in backend read and served it offline, even after sign-out | `app/sw.js` (cache v9 → v10; only same-origin, unauthenticated assets cached; v9 purged on activate) | `tests/sw.test.mjs`: 4/4 pass on fix; 3/4 **fail** on the original |
| Session restore never refreshed tokens (R5 dashboard copy) | `api/client.js` (portable fix; the authoritative dashboard lives in another repo) | `tests/api.test.mjs` 6 client tests |

## Held for Chairman approval (written, validated, not applied)

| Item | File | Validation |
|---|---|---|
| DASHCUT-0001: five Chairman read policies (Every-Word ledger, lanes, tasks, store readiness, regression evidence currently read as 0 rows) | `db/dashboard-cut/0001_chairman_read_policies.sql` | `db/dashboard-cut/validation/run.sh` → VALIDATION PASS (defect reproduced, idempotent, isolation holds) |
| API v1 contract | `api/thylora-api-v1.openapi.yaml` | parses; all refs resolve; 15/15 cut items mapped |

## Test suite

`npm test` → see the commit message for the exact count at commit time.

## Chairman decisions — consolidated

Each lane file lists its own decisions in full. The ones that unblock the most work:

1. **Apply DASHCUT-0001.** Two minutes. Moves the dashboard from 56.7% to 73.3% and makes store readiness, lanes and the Every-Word ledger visible.
2. **Transmission 001:** approve Concept A (the existing doctor-arrival canon, extended) and define "ELP" (Lane B D-01…D-05).
3. **EdereAirah physics:** gravity, atmosphere and day length. They are proposed in Lane A; every species depends on them.
4. **Payout provider:** unblocks Back-to-Buy, RAE Link creator payouts and family partnership (Lane D B-D1 = RAE Link B4).
5. **Seal and QR public domain** (Lane B D-16 = Lane D D-D4).
6. **Court office:** unit of the Law House or standalone; approve or rename the three PROPOSED staff (Lane E).
7. **REE purchase rule:** whether Earth money may ever buy REE (Lane H; the default is no).
