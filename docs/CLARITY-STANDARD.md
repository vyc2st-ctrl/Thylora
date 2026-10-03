# THYLORA Clarity Standard

Status: DRAFT for Chairman adoption · 3 October 2026
Applies to: every packet, record, dashboard label, product tag and assistant answer.

## The finding

> If we are not clear, they interpret it their way. Once they interpret it their
> way, they keep interpreting it that way and pass it down. If it is clear, it
> explains itself, and everybody gets the exact same understanding from it.
> (Chairman, 3 October 2026)

We call this **interpretation drift**. One unclear word becomes one private
guess. The guess is handed down as if it were the rule. After a few handoffs the
office is running on a meaning nobody chose.

**The aim is clear and complete, not simple.** Simplicity drops the detail that
closes off the second reading.

## The rules

| # | Rule | Fails | Passes |
|---|---|---|---|
| 1 | **Clock time, never bare duration** | "back in 10 minutes" | "10 minutes: returns at 10:40 AM" |
| 2 | **Who tells whom** | "the update is communicated" | "the clerk tells counsel and the parties in the courtroom" |
| 3 | **Before and after carry their boundaries** | "Q before vs. Q after" | "average of the 20 court days before 6 Oct vs. the 20 after" |
| 4 | **Write the thing, not the label** | "Purpose: administrative" | "Purpose: judge reviews Exhibit 4" |
| 5 | **Every equation shown in form** | "ΔQ is the change" | Expression alone → key to every letter → *the question it asks* → worked example |
| 6 | **One letter, one meaning on a page** | PV = A×T×U×T (two T's) | PV = A×T×U×R |
| 7 | **Keep labels outside the expression** | C(ourt) = H × ... | C = H × Q × K, and in the key: C = court quality |
| 8 | **Name the source and the frame** | an unlabeled quote | Earth source: black frame. Simulation: red frame + our seal |
| 9 | **Never feature a subset without saying why** | showing only questions 3 and 9 | "3 and 9 are featured because they measure timing. All 12 are answered on the sheet." |
| 10 | **Titles carry their meaning** | "Adjudication review status" | "Has a real, verified judge reviewed this? Not yet: ..." |
| 11 | **Say why a sentence exists, or remove it** | "Earth judges did not prepare this" with no lead-in | Say up front who prepared it; then the disclaimer is not needed |
| 12 | **No bare jargon headings** | "Workflow handoff circulation" | "How a ruling moves from the bench to the clerk to the next office" |

## How we teach ambiguity without being ambiguous

1. Show an unclear sentence.
2. Everyone writes down what it means. Compare: the answers always differ.
3. Show the clear version, and **show the one direction we want**.
4. The lesson is not "be careful". It is "write it so there is only one way to read it."

## QYRIS inspection 10: interpretation drift

Added to the nine existing QYRIS inspections (see `workrooms/WR-RAELINK-001.md`, section 5).

**Ask of every sentence:** *Could two careful readers act differently on this?*
If yes, it is a gap. Route it by adding the missing time, actor, boundary,
definition or source until there is one reading left.

The rule-based detector in the deployment repo (`question_engineering_detect_text_v1`)
is the natural home for automatic flags: bare durations ("in 10 minutes", "soon"),
passive actions with no actor ("is communicated"), undefined single letters, and
"before/after" without dates.
