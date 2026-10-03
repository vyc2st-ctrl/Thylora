# WR-647 · Pending backend writes (not yet applied)

**Custody 647 is captured and complete.** `THY-Q-20261003-MAH-CW-MARYANN-STORE10-647`: 13,625 chars, SHA-256 `ac3f7e62…2c03`, `complete_source_custody = 1`. It is also in `chairman_source_messages` thread `CLAUDE-CODE-HEAD-SPINE-FORWARD-20261003` #2.

**Applied:** migration `thy_647_gate_codes_store10_ask_headlock` adds three gate codes to `thylora_gate_definitions_gate_code_check`.

**NOT applied:** the two state-write attempts timed out (60 s) and rolled back. Readback on 2026-10-03 ~19:10 UTC shows none of the rows below exist. Apply in the order listed, one file per call, and read each back before the next.

Head state at last read: ledger 649, custody 648. Ledger 646 and 649 have no custody rows; they came from other sessions and were not invented here. Ledger 647 was written by another session ("Reconciled from verified custody 647 only").

| File | What it does |
|---|---|
| 01_names.sql | Victoria Asley → Ashley; C&W Auto & Customs → C & W Auto and Custym (business + market company, IDs kept); name-lock log |
| 02_people_term.sql | Clarence Whitfield + Walter Peete (EARTH_PERSON, not activated); LOCKED term THY-TERM-CW-AUTO-CUSTYM-001 |
| 03_ideas.sql | C&W restoration/teach/honest-garage; Mary Ann Royal Archive House (first building); youngest-brother scholarships; agree/disagree cards; open expression submissions |
| 04_math_gates.sql | MATH-STORE-FLOW-647, MATH-CONTINUITY-HEADLOCK-647 (PROPOSED), MATH-CHAIRMAN-GAUGE-647 (ACTIVE); 3 gates ACTIVE |
| 05_restart.sql | Restart record THY-RESTART-647-CW-MARYANN-STORE10 |

The C & W business already existed: `CW-AUTO-CUSTOMS-001`, created 2026-08-27, with 52 workers linked in custody 648. So 03 adds the program detail to it; it does not create a new company.
