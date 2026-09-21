# Before You Buy — delta

**Product:** `THY-BEFORE-YOU-BUY-001` · **Workroom:** WR-STORE-QYRIS-581
**State:** MECHANISM LOCKED · PAGES DRAFTED · **NOT DESIGNED, NOT PRICED, NOT RELEASED**
**Advanced:** 2026-09-21 · in parallel with QuickCheck, which was pushed first

---

## What advanced in this delta

The mechanism moved from a title to **five defined columns and a four-state
readout**, with the wait rule specified well enough to be implemented and
tested. The page map is drafted. Nothing is designed or priced.

## The problem it addresses

The moment before a purchase you will probably regret — and the narrower
problem inside it: you are comparing two things, and the option that would win
is the one you excluded before you started comparing.

## Mechanism — locked

| Column | What the reader writes | Why it is there |
|---|---|---|
| **1 · The job** | What am I hiring this to do? One sentence, in the form "so that ___". | If you cannot name the job, you are buying a feeling, and a feeling has no price comparison. |
| **2 · True total** | Purchase **+ running cost for 12 months + what it forces me to buy next + what it costs to get rid of.** | The sticker price is the one number that is never the real number. The fourth term is the one people never write. |
| **3 · The uncompared alternative** | You are comparing A and B. **Name C** — the option you excluded without pricing it. | Usually: the thing you already own, repaired. Sometimes: not solving it at all. This column is the product's whole reason to exist. |
| **4 · Exit path** | How do I get out, and what is this worth in twelve months? | An exit you cannot describe is an exit you do not have. |
| **5 · The wait** | A fixed wait, set by price band against your own declared comfortable spend. | A wait you set *before* you want the thing is the only wait you will keep. |

### The wait rule — specified

The reader declares one number at the top of the sheet: **a spend they would not
think twice about.** Call it C. The wait is then a table, not a feeling:

| Price | Wait |
|---|---|
| Up to C | No wait |
| Up to 3 × C | 24 hours |
| Up to 10 × C | 7 days |
| Above 10 × C | 14 days, and the sheet is re-run at the end of it |

Asking for C rather than income keeps the sheet usable by anyone without
requiring them to write down what they earn.

### Readout — four states

| State | Fires when |
|---|---|
| **Buy it** | The job is named, the true total is affordable, C was priced and lost fairly, the exit is describable, and the wait has elapsed. |
| **Buy the cheaper one** | The named job is fully done by a cheaper option in the same comparison. |
| **Wait N days** | The wait has not elapsed. N comes from the table, not from judgement. |
| **You already own the answer** | Option C — the thing you already own, repaired or used differently — does the named job. |

## Page map — drafted, 12 pages

| # | Page |
|---|---|
| 1 | Cover |
| 2 | What this is / what it is not (it is not an anti-spending pamphlet) |
| 3 | The job — "so that ___" |
| 4 | True total — the four-term diagram |
| 5 | The term everyone forgets: what it costs to get rid of |
| 6 | The uncompared alternative |
| 7 | Exit path |
| 8 | The wait, and the table |
| 9 | The readout |
| 10–11 | Worked example |
| 12 | The sheet (fillable) + credits, serial, provenance, rights |

## Worked example — chosen, not written

**A tool or appliance purchase where option C — repair the one already owned —
has never been priced.** Chosen because it exercises every column, produces the
"you already own the answer" state, and sits naturally next to the QuickCheck
worked example without repeating it.

## Relationship to the other two products

Three instruments, three different moments, **no overlap**:

| | Moment | Question |
|---|---|---|
| **QuickCheck** | Before committing to a decision | Does this reasoning hold? |
| **Stuck Loop Reset** | When you cannot get to a decision at all | What is keeping this lap running? |
| **Before You Buy** | Before a purchase | What is the real total, and what did I exclude without pricing? |

Before You Buy calls QuickCheck only when the purchase is genuinely large
relative to C. It does not wrap QuickCheck, and QuickCheck does not know it
exists.

## Not done

- No page design, no CSS, no HTML, no fillable sheet.
- Wait table and readout specified but **not implemented and not tested**.
- No serial beyond the product code. No price. No store copy. No rights block.
- Worked example chosen but not written out.
