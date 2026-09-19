# People in Time — Famous Words, Context + Logic Show

**Lane:** PEOPLE IN TIME (permanent) · **Foreground**
**Instruction held:** *"Do not rewrite the pilot."*
**Compliance:** the pilot was **not opened, not edited, not regenerated, not
reconstructed.** Nothing in this file is pilot content.

Return is restricted to the four items requested: current state, first seeded
figure, verification gaps, next executable step.

---

## 1 · Current state

**FOREGROUND — HELD — UNREAD THIS SESSION.**

The pilot record lives in `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). This session
could not reach it: outbound HTTPS to that host was refused by the environment's
network policy with **HTTP 403 on CONNECT**, recorded twice in the agent proxy
failure log. That is a network-policy condition, not a missing pilot and not a
backend fault.

What is true and can be stated without reading it:

| Field | State |
|---|---|
| Pilot exists | **Asserted by the Chairman** — carried as true |
| Pilot rewritten this run | **No** |
| Pilot content reproduced anywhere in this delta | **No** |
| Lane position | **Foreground**, as instructed |
| Lane content modified | **No** |

**Deliberate refusal:** a plausible "current state" could have been written
from the lane's title alone. It would have read well and it would have been
fabrication, and under `C_w = I × P × T × O × M × R × E` a fabricated state
raises nothing and destroys **E**. The state is reported as unread.

---

## 2 · First seeded figure

**OPEN — pending backend read.**

Not guessed. The first seeded figure is a fact of the record, and the record
was not readable. A wrong name here would propagate into every downstream
episode, context frame and logic segment built on it.

Readback that resolves it:
```
GET /rest/v1/thylora_query_carryforward
    ?select=sequence_no,session_label,user_message,assistant_message
    &or=(user_message.ilike.*people in time*,assistant_message.ilike.*people in time*)
    &order=sequence_no.asc
```

---

## 3 · Verification gaps

| # | Gap | Severity |
|---|---|---|
| 1 | Pilot record unread — backend blocked | **Blocking** |
| 2 | First seeded figure unknown | **Blocking** |
| 3 | Episode/segment structure of "Context + Logic Show" unread | High |
| 4 | Sourcing standard for the **"Famous Words"** component unread — it is unknown whether each quotation carries a primary citation, a date, and a first-appearance check | **High, and structural** |
| 5 | Whether the lane already has an attribution-failure policy for misattributed quotations | High |
| 6 | Relationship between this lane and FAMOUS PEOPLE / HOW THEY THINK — overlap or division of labour unresolved | Medium |
| 7 | Whether the pilot's figure set intersects the Windsor maker-figures surfaced this run | Low |

**Gap 4 is the one to fix first after the read.** A show built on famous words
lives or dies on quotation provenance; misattributed quotations are the single
most common failure mode in that format, and the lane's defence against it is
currently unknown.

---

## 4 · Next executable step

**One step, and it is executable the moment the backend is reachable:**

> Read the People in Time pilot record from `thylora_query_carryforward`, extract
> the first seeded figure and the pilot's quotation-sourcing standard, and
> return them **verbatim from the record** — then, and only then, grade gaps 3
> through 7 against what the record actually says.

**Do not** author a figure. **Do not** author a format. **Do not** touch the
pilot.

If the backend stays blocked, the equivalent step without it: the Chairman
pastes the pilot record into the next turn, and this file is completed from
that paste — still without rewriting the pilot.
