# World Completeness — The Castle Equation

**Work code:** `THY-WORK-WINDSOR-MIRROR-CASTLE`
**Attached to:** `EDEREARIAH-CASTLE-DOSSIER.md`
**Lane:** MATH (permanent creative-development lane)

---

## 1 · The whole equation

```
C_w = I × P × T × O × M × R × E
```

---

## 2 · The parts, named

| Part | Name | What it is |
|---|---|---|
| `C_w` | **Left side** | The thing being measured — world completeness |
| `=` | **Equal sign** | The claim of equality: the left side *is* the right side, not merely close to it |
| `I × P × T × O × M × R × E` | **Right side** | The seven things that, multiplied, make it |

### 2.1 Left side
`C_w` — **completeness of the world**, for one named subject. Here: EdereAriah
Castle. `C_w` is a single number. It is not a feeling and not an opinion.

### 2.2 Equal sign
`=` is the strongest sign in the line. It says: there is **nothing else**.
Completeness is not `I × P × T × O × M × R × E` *plus atmosphere*, *plus
intention*, *plus how much you love it*. Whatever is not on the right side
does not count toward the left side.

### 2.3 Right side — the seven variables

| Sym | Variable | Question it answers | Where it lives in this dossier |
|---|---|---|---|
| **I** | **Identity** | What is it called, and what is it? | Dossier §1, §3.1 |
| **P** | **Place** | Where is it, and what is around it? | Dossier §2.5, `ROOM-BUILDING-MAP.md` |
| **T** | **Time** | When was it made, changed, damaged, repaired? | Dossier §2.3, §3.3, §5 |
| **O** | **Objects** | What things are in it? | `MAKER-PROVENANCE-MATRIX.md` §3 |
| **M** | **Makers** | Who made those things, where, for whom? | `MAKER-PROVENANCE-MATRIX.md` §1, §5 |
| **R** | **Relationships** | Who stands in what relation to whom and to what? | `ROYAL-KITCHEN.md` §3–§4, §7 |
| **E** | **Evidence** | How do we know, and how good is the knowing? | `WINDSOR-MIRROR-SOURCES.md` |

---

## 3 · Three meanings of the same equation

### 3.1 Child meaning

> A place is really real when you can answer seven questions about it.
>
> **What is it called? Where is it? When was it made? What's inside it?
> Who made those things? Who lives and works there? How do we know?**
>
> And here's the trick: it's **times**, not **plus**. If you can't answer even
> one of the seven, you don't get a small score — you get **nothing**. Because
> anything times zero is zero.
>
> A castle with beautiful rooms and no cook is not a castle. It's a picture of
> one.

### 3.2 Adult meaning

The model is **multiplicative, not additive**, and that is the whole point.

An additive model (`C_w = I + P + T + O + M + R + E`) lets you buy completeness
with volume: pile up a thousand objects and you outscore a world with a
thousand objects **and** the people who made them. That is how worlds end up
rich in scenery and empty of life.

A multiplicative model refuses that trade. **Any single variable at zero sends
the whole product to zero**, no matter how large the other six are. Completeness
is therefore a *chain*, and the score is set by the weakest link — not by the
average, and certainly not by the total.

This is also why `OPEN` is an honest state rather than a failure. `OPEN` names
exactly which factor is currently holding the product at zero. An invented
maker name would raise **M** on paper while silently destroying **E** — and
since it is a product, the result would still be zero, but you would no longer
be able to see it.

### 3.3 Scholar meaning

`C_w` is a **conjunctive completeness functional** over a documentation lattice.
Each variable is normalised to `[0, 1]` — fraction of required slots resolved
at acceptable evidence grade — and the aggregation operator is the product,
i.e. a strict t-norm.

Properties that follow, and why they were chosen:

| Property | Consequence |
|---|---|
| **Strict conjunctivity** | `∃ v = 0 ⟹ C_w = 0`. No compensation between dimensions. A world cannot buy its way out of a missing dimension. |
| **Monotonicity** | `∂C_w/∂v ≥ 0` for every `v`. Resolving any slot never lowers the score. |
| **Sensitivity at the margin** | `∂C_w/∂v = C_w / v`. The *smallest* variable has the *largest* marginal return. The model tells you where to work next, and it is always the weakest factor. |
| **Scale invariance under relabelling** | The product is symmetric; no dimension is privileged by position. |
| **E as a gate, not an addend** | Because **E** multiplies rather than adds, unevidenced content cannot raise completeness. Fabrication is mathematically self-defeating in this model, not merely discouraged by policy. |

The last row is the reason **E** belongs on the right side at all. In an
additive model, evidence is a virtue. In this model, **evidence is a gate**.

---

## 4 · Real castle example — worked twice

Scoring convention: each variable = fraction of its required slots resolved at
acceptable evidence grade. Slot counts are taken from this dossier set.

### 4.1 Windsor Castle — the Earth mirror, as read this run

| Var | Resolved | Basis | Score |
|---|---|---|---|
| **I** | Name, place, status, founder, line all verified | Dossier §2.1 | **1.00** |
| **P** | 3 wards, room sequence, 13 acres, estate extent verified | §2.2, §2.5 | **0.90** |
| **T** | 10 dated phases, fire and restoration dated to the day | §2.3, §5 | **0.95** |
| **O** | Object classes evidenced; most individual objects not enumerated | Matrix §3 | **0.40** |
| **M** | Wykeham, May, Verrio, Gibbons, Cousin, Wyatville, Pugin, Morel & Seddon named; Agra weavers unnamed | Matrix §5, §6 | **0.55** |
| **R** | Household structure, kitchen hierarchy, chapel jurisdiction known | Kitchen §1 | **0.60** |
| **E** | **All 44 sources are `S1`. Zero `S0`.** Every fetch blocked | Sources §0 | **0.50** |

```
C_w(Windsor) = 1.00 × 0.90 × 0.95 × 0.40 × 0.55 × 0.60 × 0.50
             = 0.0564
```

**Reading:** even the real, thoroughly documented castle scores **0.056**, and
the two factors dragging it down are **O** (0.40) and **E** (0.50). The model
is telling us, correctly, that this run got *structure* but not *inventory* and
not *full-page evidence*.

### 4.2 EdereAriah Castle — as it stands after this run

| Var | Resolved | Score |
|---|---|---|
| **I** | Native name, city, territory, founder — **all OPEN** | **0.00** |
| **P** | Ward and room *slots* cut from a verified mirror; no EdereAriah name or dimension | 0.35 |
| **T** | Phase *shape* established; no EdereAriah date | 0.10 |
| **O** | 24 classes enumerated and slotted; none filled | 0.15 |
| **M** | Twelve-slot schema live; **zero** makers named, **zero** invented | 0.05 |
| **R** | Inés bound to room, wing, route and chain of command; ranks OPEN | 0.30 |
| **E** | Provenance discipline live; backend unread | 0.30 |

```
C_w(EdereAriah) = 0.00 × 0.35 × 0.10 × 0.15 × 0.05 × 0.30 × 0.30
                = 0.0000
```

**Reading — and this is the finding of the run:**

The castle is at **exactly zero**, and it is at zero for **one reason**:
**I = 0**. The castle has no name.

Six of seven variables moved forward this run. The product did not, and cannot,
until `I` leaves zero. By the sensitivity rule (`∂C_w/∂v = C_w / v`), **the
highest-return action available is the one the Chairman alone can take: name
the castle.** Everything else is currently multiplying by nothing.

### 4.3 What one action buys

Set `I = 1.00` — name, city, territory, founder authored — and nothing else
changes:

```
C_w = 1.00 × 0.35 × 0.10 × 0.15 × 0.05 × 0.30 × 0.30 = 0.0000236
```

From **exactly zero** to a live, non-zero, measurable world. Then **M** (0.05)
becomes the weakest link and the backend read becomes the next highest-return
move — because it may already hold maker canon.

---

## 5 · Standing rule this equation imposes on THYLORA

1. **Invention cannot raise completeness.** It raises a numerator while
   collapsing **E**. In a product, that is a net loss you can no longer see.
2. **`OPEN` is a coordinate, not a shrug.** It names which factor is holding
   the product down.
3. **Work the smallest variable.** The maths says so; it is not a preference.
4. **A world with no people is zero**, however many rooms it has — that is
   **R** going to zero.
5. **A world with no evidence is zero**, however much of it there is.
