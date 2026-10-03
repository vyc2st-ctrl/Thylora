# Chairman Logic Protocol

**Registry:** `THY-LOGIC-PROTOCOL-001` · **Opened:** 2026-10-03 · **Workroom:** WR-HERITAGE-001
Feeds the *Chairman Operating Logic Blueprint* named on the app's Continuity page. It adds to
that blueprint and does not replace it.

---

## 1 · Standing rule: two or three kinds of logic in every exchange

Every response to the Chairman names **two or three** of the modes below and applies each one
to the topic at hand, not as a generic definition. Rotate them so all of them get used over time.

| Mode | What it handles | Plain question it asks |
|---|---|---|
| **Erotetic** | The logic of questions: what counts as a real answer | "What question is this actually answering, and what would a complete answer look like?" |
| **Deontic** | Obligation, permission, prohibition | "What must happen, what may happen, what must not?" |
| **Defeasible** | Conclusions that hold *until* new evidence overturns them | "What do we believe for now, and what would make us drop it?" |
| **Modal** | Possible vs. necessary | "Could this be otherwise, or must it be this way?" |
| **Temporal** | Before, after, always, until | "What was true then, what is true now, what stays true?" |
| **Epistemic** | Knowing vs. believing vs. guessing | "Who knows this, how do they know, and how sure are they?" |
| **Abductive** | Inference to the best explanation | "What explanation, if true, would make all of this unsurprising?" |
| **Paraconsistent** | Holding contradictions without everything collapsing | "Two sources disagree. How do we keep both without throwing the whole thing out?" |
| **Fuzzy** | Degrees instead of yes/no | "How much is it true: 0.2, 0.8?" |
| **Counterfactual** | What would have happened if… | "If this one thing were different, what else changes?" |
| **Dialectical** | Thesis → antithesis → synthesis | "What's the strongest opposite view, and what survives both?" |
| **Deductive / Inductive** | Certain from rules / probable from patterns | "Does it *have* to follow, or does it *usually* follow?" |

**Applied to the Blackfoot family story (example of the rule in use):**
- *Defeasible:* "Our family is Blackfoot" is held as true for the family until a record says
  otherwise. It is not thrown out early and not proven early.
- *Epistemic:* the grandmother *knew* she was told it, but she did not *know* the 1850 facts
  herself. The knowledge sits one generation upstream.
- *Abductive:* which explanation makes every record unsurprising: the Montana Blackfeet, a
  Five Civilized Tribes link, or "black foot" used as a local label?

---

## 2 · Objects that remember how they changed

### The starting point (the Chairman's own insight)

> "What would happen is what had happened. Nothing different could happen, because it had
> already happened. So we start there."

This is the distinction between the **event** and the **record of the event**. The event is
fixed. Every object that took part carries its own record, shaped by:

1. **Vantage:** where it was standing
2. **Sensitivity:** what it is able to register
3. **Change:** how the event altered it, and how it has changed since

Two objects can be in the same event and come away with different records, and both records
can be honest. That's why the Family Story Archive keeps the SOURCE STORY and adds each
FAMILY PERSPECTIVE instead of overwriting it.

### Counting (the Chairman's own reasoning, made formal)

"Every object" implies there is **at least one**. "Two objects remember differently" requires
**at least two**. Add the event itself, which remembers nothing but is still the thing being
remembered, and the minimum is **three**: the event, record A and record B.

### What happens when two objects remember the same event differently

"They proceed according to their context." Here is what that looks like for each pair:

| Pair | Same event | Record A | Record B | What happens next |
|---|---|---|---|---|
| **Two humans** | A family argument in 1985 | The child remembers the shouting | The parent remembers the reason | They argue, or a third layer forms ("here is what we each saw") |
| **Two animals** | A wolf and an elk at the same river | The wolf: food was here | The elk: danger was here | Both change behavior; the river gets used differently forever |
| **Two birds** | The same storm | The one that sheltered: this tree is safe | The one that was blown off course: this route is dangerous | Different migration paths, and over generations, different populations |
| **Two vehicles** | The same collision | Car A: crumpled front, airbag log | Car B: crushed door, speed log | The two black-box logs are reconciled into one reconstruction |
| **Two buildings** | The same earthquake | The stone building: cracks in its walls | The timber building: it flexed and settled | Engineers read both records, and building codes change |
| **Two land masses** | The same continental split | Africa's coastline | South America's coastline | Matching shapes, fossils and rock layers: the record that proved continental drift |
| **Two weather systems** | They collide | The cold front | The warm front | The disagreement *is* the storm: their difference produces something new |

**Pattern:** when the records disagree, three things can happen:
1. **Conflict:** each insists on its own record.
2. **Reconciliation:** the records are laid side by side and the overlap is treated as the
   most likely truth (the vehicles, the land masses).
3. **Creation:** the difference itself becomes a new thing (the weather systems, the family's
   comedy layer, the Green Milk story).

### "No spoons"

There is no spoon to bend, only the record of bending. Change the record and the event stays
the same, but what everyone *does next* changes. This is why the SOURCE STORY is protected.

---

## 3 · Seeing the math: [f(x + Δx) − f(x)] / Δx

**Read it as a picture, not a calculation:**

- `f(x)`: where you are now (the height of a hill at the spot you're standing)
- `f(x + Δx)`: where you'd be after one small step forward (Δx is the step size)
- the top line `f(x + Δx) − f(x)`: how much higher or lower that step took you
- divide by `Δx`: **rise over run**, the steepness of the hill right there

Make the step smaller and smaller, and that steepness stops being an average and becomes the
**exact slope at one point**. That's the derivative. It's the same idea as "how fast is this
changing right now?"

**Why x stays a letter:** x isn't hidden. It's left open on purpose so that one answer works
for *every* spot on the hill at once. You plug in a number only when you want one particular
spot.

### Worked: f(x) = 1/x²

Algebra (the general answer, good for every x):

```
[ 1/(x+Δx)² − 1/x² ] / Δx
= [ x² − (x+Δx)² ] / [ Δx · x² · (x+Δx)² ]
= [ −2x·Δx − Δx² ] / [ Δx · x² · (x+Δx)² ]
= [ −2x − Δx ] / [ x² · (x+Δx)² ]
→ as Δx shrinks to 0:  −2x / x⁴  =  −2 / x³
```

Numbers (watch it close in, at x = 2):

| Step Δx | f(2 + Δx) | Rise ÷ run |
|---|---|---|
| 0.1 | 0.226757 | −0.232426 |
| 0.01 | 0.247519 | −0.248137 |
| 0.001 | 0.249750 | −0.249813 |
| → 0 | — | **−0.25 = −2/2³** ✓ |

**What it means:** the curve 1/x² is always going *down* (negative slope) and flattens as x
grows. That's the same shape as how gravity, light and sound weaken with distance.

---

## 4 · When the right question won't come

The Chairman said the frustration comes from "not thinking of the right question at that
moment." These starters are always available. Pick one and say it out loud:

- "What am I looking at, and what is it *called*?" (naming)
- "Who made this record, when, and why?" (source)
- "What's the next document back from this one?" (one step upstream)
- "What would prove me wrong?" (defeasible check)
- "What does this connect to that I already have?" (cross-reference)
- "Send this to myself to finish later." (custody: the thought is saved, not lost)

The SPINE FORWARD voice command (🎙 THYLORA) already accepts any of these as a spoken command.
