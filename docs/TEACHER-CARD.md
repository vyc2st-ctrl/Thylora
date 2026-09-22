# THYLORA · Teacher Card

**Work item:** THY-WORK-TEACHER-UNDERSTANDING-586
**Code:** `understanding/teacher-card.js` · **Tests:** `tests/teacher-card.test.mjs`

```
ASK → HEAR → FIND GAP → CHANGE REPRESENTATION → TRANSFER TEST
```

| Step | What it is for |
|---|---|
| **ASK** | Put a real question in front of the learner and let them answer it wrong. |
| **HEAR** | Listen to the whole answer, including the part that is right. |
| **FIND GAP** | Name the one missing move — not "they don't get division". |
| **CHANGE REPRESENTATION** | Show the same truth in a mode they have not refused yet. |
| **TRANSFER TEST** | A different problem needing the same move. They do it, not you. |

`validateLoop()` refuses a loop with a step missing and a loop run out of order. Skip
HEAR and the gap is a guess. Skip CHANGE REPRESENTATION and you repeat a failed telling
louder. Skip TRANSFER TEST and you never learn whether the change worked.

## The worked example — 84 ÷ 7

```
84 = 70 + 14
70 ÷ 7 = 10
14 ÷ 7 = 2
therefore 84 ÷ 7 = 12
```

`decompose(84, 7)` produces exactly those four lines, and the test asserts them
character for character.

**The likely gap:** the learner can divide by 7 inside the times table and stops at 70.
The missing move is not division — it is *permission to break 84 apart*. Naming it that
way is the difference between a five-minute fix and a term of remediation.

### It is a method, not a memorised case

`decompose()` is the general form: break the dividend into chunks you can already divide,
divide each chunk, add the answers. Tested on 96 ÷ 8, 72 ÷ 6, 136 ÷ 8, 91 ÷ 7. An inexact
division reports its remainder rather than hiding it (85 ÷ 7 → 12 remainder 1), and the
function throws on a zero divisor, a negative dividend or a non-integer rather than
returning a confident wrong answer.

## Five representations of the same division

| Mode | The way in |
|---|---|
| `PARTIAL_QUOTIENTS` | Break it into pieces you already own. |
| `AREA` | One rectangle of area 84 with one side 7, cut once. |
| `EQUAL_GROUPS` | Deal 84 counters into 7 piles, ten to each pile first. |
| `NUMBER_LINE` | Start at 84, jump back 7 at a time. Ten jumps, then two. |
| `MONEY` | $84 split 7 ways. Hand out $10 each first, then the rest. |

Five, so that a learner who bounces off one has four more before anyone concludes
anything about *them*.

## The transfer test

`transferProblemFor(84, 7)` returns **96 ÷ 8**. Different numbers, same move.

> Pass condition: the learner breaks 96 into friendly chunks **without being told to**,
> and reaches 12.

A test with the same numbers tests memory. The card generates different ones, and a test
asserts the generated task is never the original problem.

## What to say when they answer "10 remainder 14"

> "Good — 70 is done. What's left?"

Then wait. Do not finish it for them. The waiting *is* the TRANSFER TEST.
