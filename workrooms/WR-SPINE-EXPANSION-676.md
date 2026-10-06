# WR-SPINE-EXPANSION-676 — Expansion lanes (executed at custody 677)

Mirror of backend `thylora_workroom_task_registry` (`workroom_code = 'WR-SPINE-EXPANSION-676'`).
**The backend is the source of truth.** Each task's evidence key `move_677` holds the full work.
Family names, children's stories and recipes live **only** in the backend (FAMILY_RESTRICTED).

All 17 expansion tasks were verified as separate rows. None was folded into WR-OPP-COLLAB-675 L15.
Two lanes named in the 676 summary had no task row, so they were recovered as tasks:
EXP676-RECIPE and EXP676-VERIFY-675. That makes 19 rows, with 17 movement records.

**Held:** no sends, publishing, purchases, imagery or money movement.

| Task | What moved | Blocker type | Next action |
|---|---|---|---|
| ACCOUNTS | Chairman Loochy account opened (pending review, balance 0); two name-lock drifts in family profiles fixed to the Chairman-locked spellings; custodial child-account DDL written + validated (held) | IDENTITY/RIGHTS: written consent from each child's parent; LEGAL: Loochy counsel review; ENGINEERING: DDL held | Approve DDL; record consent per child |
| VEYRA | Option A recommended: Veyra is a spoken nickname for REE amounts; ledgers store REE only; no second currency | AUTHORITY: needs Chairman lock | Lock Option A; resolve GAP-677-01 |
| SERIAL | Universal L·V·B·u matrix: 14 line codes, 9 fields mapped for physical and digital, version/batch triggers, stop rule; MATH-SERIAL-UNIVERSAL-677 (PROPOSED) | ENGINEERING: one serial-issuer function needed | Draft issuer DDL (held) |
| NETWORK | Value Current referral-credit chain, fairness rules, regulated-category exclusions, fraud controls; existing credit instruments only; MATH-REFERRAL-CREDIT-677 (PROPOSED) | LEGAL: credit accounting + exclusions; ENGINEERING: needs order record | referral_event DDL (held) |
| AZTEC | 90-second opening draft, 4-claim evidence board with grades, Prime Directive breakdown, pronunciation call (8 terms), outreach categories only | SOURCE/RIGHTS: Exhibit 001 caption source missing (GAP-677-03); freshness T=0 | Ingest caption source; pull citations |
| VESSEL | Canon recovered (THE NIGHTSTEP, CHAIRMAN_LOCKED story canon); 5 derived checks; 15-row requirements/test matrix | ENGINEERING: no class/flag/calcs; CANON: pressure-hull contradiction (GAP-677-04); NAME: "VELMORA" unsourced (GAP-677-02) | Build sheet for NS-001; pressure-hull answer |
| KIDS | Two story drafts + two guide roles + lemonade recipe (backend only) | RIGHTS/CHANNEL: no delivery channel to children | Chairman shares at his discretion |
| LABEL-QUEST | Label Detective game; curiosity points only; fruit-snack activity | EVIDENCE: cited ingredient glossary needed | 10-ingredient cited glossary |
| HYGIENE | Service design split from device inventions; acceptance criteria; device questions | ENGINEERING + LEGAL (local code) | Guest journey with reset checklist |
| MOBILITY-SYSTEM | 7-hazard tree with ADVISE / ASSIST / PROHIBITED / REQUIRES-AUTHORITY classes; no outside takeover of controls | ENGINEERING; AUTHORITY (public traffic control) | Standard + test per hazard |
| MOTION | 4 sensing zones, staged lighting, failure = lights on | ENGINEERING: sensor modality | Bench-test 3 sensors |
| VEHICLE | Hazard-first: sealing never blocks escape | ENGINEERING | Water-entry egress sequence |
| MEDIA | Reporter lock-sheet fields; Dusty consent path; timeline rule | RIGHTS: no release from the real person; CANON | Lock reporter sheet |
| CARDS | Common schema + 5 sample cards (no real politicians) | DESIGN: play loop | Draw–ask–answer–score loop |
| SHOE | Fit spec built on existing Kyxie One / Cradle / Flex / Catch canon; serial per pair | IDENTITY: "Hobbs Choice" reference unidentified; ENGINEERING | Foot-scan protocol |
| GLYPH | Text wire spec + bilingual key-map | ENGINEERING: vector, code point, build | Code point + key-map file |
| CREATOR-SCOUT | Verified blocked; rule restated | TOOL: no follower identities in connected tools | Use existing public dossiers |
| RECIPE (recovered) | Two-banana bread recipe (backend) | Not kitchen-tested | Bake once |
| VERIFY-675 (recovered) | Self-readback of 675: all artifacts present, fingerprint OK | Needs an independent verifier | Another agent signs |

## Held DDL
`db/family-accounts-677/0001_custodial_child_accounts.sql`: the custodian owns the account and
the child is the beneficiary through the child's existing family profile, so no login or UUID is
invented for a child. Validated locally (`validation/run.sh`): it applies cleanly twice, and it
rejects a duplicate child account, a second personal account, a custodial account with no child,
and activation without both consent and counsel references.

## Gaps
GAP-677-01 REE anchor conflict (proposal 654 says EUR; the active reference is USD) ·
GAP-677-02 "VELMORA" has no source · GAP-677-03 the Exhibit 001 source is missing ·
GAP-677-04 vessel pressure-hull contradiction · GAP-677-05 task codes are globally unique.
