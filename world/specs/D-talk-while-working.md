# D · Talk While Working, with Nahla Mercer as on-duty operator

App `THY-TALK-WHILE-WORKING-APP-001` (registry `IN PRODUCTION` v1; **runtime not witnessed**) · code `world/lib/backtrace.js` · tables drafted: `thy_twiw_sessions`, `thy_twiw_raw_segments`, `thy_twiw_markers`

Operator: **Nahla Mercer** (`nahla-mercer`, WORLD_ACTIVE, life registry PRE_DEBUT_DESIGN), Process Memory & Human Handoff Desk, work entity `THY-HQ-NY-OPS-TRANSCRIPTION-001`. Her own anchor method, *object + action + location + reason + time*, is the marker schema, and her known limits (not a mechanic, clinician or lawyer) are the routing rule.

> Illustrative session below. It's a **design example, not a recorded event**. No real session exists yet.

## 1. Session start
```
session_id        TWIW-EX-0001
operator          nahla-mercer   (accountable; recording refused without an operator)
user              user-ex-1      (the person working)
recording_known_to_user: true    (schema check: must be true)
earth             2026-09-26T09:00:00-04:00  America/New_York
native            anchor-relative: N native days + H Earth hours after "Day 83 Aethon 4 hours 5 minutes"
```
## 2. Operator assignment
Assigned from the shift registry. Her exact shift binding is **OPEN** in the packet. The assignment row records who assigned her and why (desk load, domain). She may decline a session outside her training, and the declination is recorded.

## 3. Raw transcript (verbatim, append-only)
| seg | t | speaker | source | text | conf |
|---|---|---|---|---|---|
| R1 | 09:02 | user | OPERATOR_SPEECH | "Putting the torque wrench in the second drawer so it's with the filter kit." | 0.95 |
| R2 | 09:05 | unknown | BACKGROUND | "…wrench is on the bench…" | 0.40 |
| R3 | 09:07 | user | OPERATOR_SPEECH | "Drain plug washer on the tray, I think." | 0.70 |
| R4 | 09:09 | user | OPERATOR_SPEECH | "Correction: washer's in the parts cup, not the tray." | 0.96 |

## 4. Speaker vs background distinction
`source` is one of OPERATOR_SPEECH, OTHER_SPEAKER or BACKGROUND. **Background audio can never create a PLACE, MOVE or TAKE.** This is enforced in code and by the schema check `bg_cannot_place`. Nahla may log R2 only as a MENTION flagged uncertain, and then ask the user to confirm.

## 5. Structured events (BACKTRACE markers)
| marker | object | action | location | reason | raw | uncertain |
|---|---|---|---|---|---|---|
| BT-…-0001 | torque-wrench | PLACE | bay2/drawer2 | kept with filter kit | R1 | no |
| BT-…-0002 | drain-washer | PLACE | bay2/tray | — | R3 | **yes** (conf < 0.8) |
| BT-…-0003 | torque-wrench | MENTION | — | background | R2 | yes |
| BT-…-0004 | drain-washer | PLACE | bay2/parts-cup | speaker correction | R4 | no · **supersedes 0002** |

## 6. Uncertainty correction
A correction is a **new marker** with `supersedes`. The superseded marker stays readable, and the raw segment is never edited (both tables are append-only by trigger). This is the rule Nahla took the job for: *corrections preserved rather than quietly overwritten.*

## 7. BACKTRACE: reverse reading and place recovery
* Each marker stores `prev_hash` and `hash` (sha-256 of its body), so the chain is tamper-evident. `verifyChain()` fails if any stored field is altered.
* **Reverse reading.** `backtrace(object)` walks newest to oldest and skips superseded markers.
* **Place recovery.** `whereIs(object)` returns the last PLACE/MOVE with a location and grades it:
  * `LAST_KNOWN`: clean.
  * `LAST_KNOWN_UNCERTAIN`: the placement itself was uncertain, or later markers (USE, background mention) cast doubt.
  * `MOVED_AFTER_LAST_PLACEMENT`: a TAKE or HANDOFF happened after it.
  * `UNKNOWN`: no placement exists. The app says so rather than guessing.
* Here the wrench is `LAST_KNOWN_UNCERTAIN` at bay2/drawer2, because a background voice said "bench". The washer is `LAST_KNOWN` at bay2/parts-cup.

## 8. Expert routing
"What's the torque spec for this drain plug?" is a mechanical question, so Nahla routes it. `routeToExpert` refuses unless a **verified role holder id** exists. Otherwise the question is held OPEN. No fake credentials (`release_rules.no_fake_professional_credentials`).

## 9. Handoff receipt
`closeWithReceipt()` lists every object touched with its state and location, the open routes, the chain validity and the head hash. `closable_as_clean` is true only if every object is `LAST_KNOWN`. **"All set" isn't a valid close.** That's the exact thing that irritated Nahla yesterday, per her packet.

## 10. Process-improvement extraction
`extractImprovements()` turns patterns into candidate rule changes:
* CORRECTION_PATTERN: require location + reason at the moment of placement.
* BACKGROUND_AUDIO: confirm with the speaker before a record.
* MISSING_REASON: prompt for a reason on every PLACE.

This matches her growth pattern: *change the rule so the next person doesn't repeat the mistake.*

## BACKTRACE marker architecture (summary)
```
raw segment (verbatim) ──cites──► marker {object, action, location, reason, t, source, uncertain, supersedes, prev_hash, hash}
                                          │ chain
                                          ▼
                    backtrace(object): newest → oldest, minus superseded
                    whereIs(object):   last trustworthy location + doubts
                    receipt:           every object resolved or listed UNKNOWN; head hash sealed
```
Bonus basis stays as in her packet: recoverable handoffs, uncertainty correctly flagged, useful process improvements, verified reductions in rework. **Never pay for hiding errors.**
