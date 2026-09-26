# I · Test Rebuild Lab: construct-audit specification

Idea `THY-IDEA-TEST-REBUILD-LAB-001` · code `world/lib/construct-audit.js` · table drafted: `thy_test_construct_audits`

Each test item is audited on eight fields. Each burden is scored 0 (none) to 3 (dominant).

| Field | Question | Scale |
|---|---|---|
| intended_skill | What is this item *supposed* to measure? One sentence. | text (required) |
| prerequisite_knowledge | What must a student already know that isn't the intended skill? | list |
| language_burden | How much reading, vocabulary or syntax load is there beyond the skill? | 0–3 |
| ambiguity | Is there more than one defensible answer? | 0–3 |
| trick_burden | Does the item reward noticing a trap rather than using the skill? | 0–3 |
| time_pressure | Does speed matter more than the skill? | 0–3 |
| transfer_value | Does a correct answer predict use outside the test? | 0–3 (higher is better) |
| can / cannot prove | generated from the fields above | text lists |

**Construct-irrelevant load** = language + ambiguity + trick + time.
* **0–2 → CLEAN.** A right answer is reasonable evidence of the skill.
* **3–5 → CONTAMINATED.** A right answer shows the skill plus the ability to clear the other burdens. A wrong answer is ambiguous.
* **6+ → REBUILD.** The item mostly measures something else.

Generated "cannot prove" statements (examples from the code):
* language ≥ 2: *a wrong answer does not show absence of the skill; reading load may explain it*
* ambiguity ≥ 2: *the answer key cannot prove the alternative is wrong*
* trick ≥ 2: *rewards noticing a trap, not the intended skill*
* time ≥ 2: *speed is being measured alongside the skill*
* prerequisites present: *a wrong answer may reflect a missing prerequisite*
* transfer ≤ 1: *a correct answer says little about use outside the test*

**Rebuild step:** for each REBUILD or CONTAMINATED item, produce a rebuilt item that holds `intended_skill` fixed and drives the other burdens to ≤ 1, then pilot both versions and compare.

**Pilot:** one **publicly released** test set, never a secure or live exam. Each item is cited to its public source. Selecting the set is next work.
