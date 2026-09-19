# Rosemary — Full Route, Garden to Hand

**Work code:** `THY-WORK-WINDSOR-MIRROR-CASTLE`
**Earth mirror:** **ROSEMARY** — same plant, same properties
**Native EdereAriah name:** **OPEN — until the Chairman authors or selects it**
**Terminates at:** **Inés Morales**, S01 Great Kitchen

---

## 1 · The plant, verified (`S1`)

| Field | Value | Source |
|---|---|---|
| Accepted botanical name | ***Salvia rosmarinus*** Spenn. | R1, R2 |
| Former name / synonym | *Rosmarinus officinalis* L. | R3 |
| Reclassification | **2017** — moved from genus *Rosmarinus* into *Salvia* | R1, R2 |
| Family | **Lamiaceae** (mint family) | R1 |
| Habit | Small **evergreen** shrub | R1 |
| Native range | **Dry, rocky areas of the Mediterranean region** | R1, R2 |
| Spread | Introduced and cultivated across Europe, Asia and the Americas | R1 |
| Part used | Leaf (*rosmarini folium*); essential oil (*rosmarini aetheroleum*) | R4, R5 |
| Key constituents | **Rosmarinic acid** (polyphenol), flavones, flavanols; volatile oil | R6, R11 |

**Mirror instruction held:** the EdereAriah plant is **the same underlying
plant with the same properties**. Only the name changes, and the name is not
yet authored.

---

## 2 · Source — garden / farm

| Slot | State | Constraint from the mirror |
|---|---|---|
| Primary source | **OPEN** | Must be a **dry, rocky, well-drained, sun-facing** ground. Rosemary does not come from wet bottomland |
| Castle kitchen garden bed | **OPEN** — `ROOM-BUILDING-MAP.md` G09 | An evergreen shrub, so it is **cut year-round**, not harvested in one season |
| Estate farm / herb ground | **OPEN** | |
| Wild or naturalised stand | **OPEN** | |
| Grower (person) | **OPEN** | `MAKER-PROVENANCE-MATRIX.md` slot 3 logic applies to grown things too |
| Propagation | **OPEN** | Mirror: cuttings, not seed, for a true-to-type plant |
| Bed aspect and drainage | **OPEN** | **Load-bearing** — determines whether the castle can grow its own at all |

**Decision the Chairman owns:** does the castle **grow** its rosemary or **buy**
it? The whole route below forks on that one answer, and both forks are drawn.

---

## 3 · Supplier

| Slot | State |
|---|---|
| Supplier name | **OPEN — no name invented** |
| Supplier type (estate / market / merchant house) | **OPEN** |
| Standing order or per-occasion | **OPEN** |
| Contract / warrant | **OPEN** |
| Existing THYLORA supplier canon | **NONE FOUND in this repository** — may exist in `thylora-dash`, unreadable this run |

---

## 4 · Transport

| Fork | Route | State |
|---|---|---|
| **A — grown on the estate** | G09 kitchen garden → cut → basket/tray → service road → S15 receiving | **OPEN** (short, same-day, no preservation problem) |
| **B — bought in** | supplier → cart/crate → town road → tradesman's entrance → S15 receiving | **OPEN** |
| Container | **OPEN** | `MAKER-PROVENANCE-MATRIX.md` classes 20 (carts), 22 (crates) |
| Condition on arrival | **OPEN** | Fresh-cut sprig vs. dried bundle — different storage, different use |
| Frequency | **OPEN** | |

---

## 5 · Receiving and storage

| Stage | Room | State |
|---|---|---|
| Receiving | **S15** | **BOUND** |
| Check / weigh / record | S15 | OPEN |
| Herb store / stillroom | **S05** | **BOUND** |
| Fresh holding | S03 larder (cool) | OPEN |
| Dried holding | S04 dry store / S05 hanging | OPEN |
| Drying method | **OPEN** | Mirror: hung in bunches, dark, airy |
| Shelf life discipline | **OPEN** | |

---

## 6 · Inés' preparation — the terminus

This is where the route ends and the person begins.

| Step | State | Notes |
|---|---|---|
| Who prepares | **Inés Morales** | **BOUND this run** |
| Where | **S01 Great Kitchen**, her station at the hearth | **BOUND** |
| Strip leaf from woody stem | **OPEN as practice detail** | The stem is not eaten; it may be kept for smoke or for skewers |
| Chop fine / bruise / leave whole sprig | **OPEN** | Three different decisions for three different dishes |
| Infuse in fat or oil | **OPEN** | Mirror: rosemary is fat-soluble in character; oil and butter carry it |
| Infuse in liquid | **OPEN** | |
| Bundle for the pot and withdraw | **OPEN** | |
| Dry, then store | **OPEN** | |
| Her tools | Knife (class 04), board, pan (class 03) | **Maker slots OPEN** |

---

## 7 · Culinary uses

| Use | State | Mirror basis |
|---|---|---|
| Roast meats | **OPEN as EdereAriah practice** | Long-standing Mediterranean and European practice |
| Bread | **OPEN** | |
| Oil and butter infusion | **OPEN** | |
| Stock and braise aromatics | **OPEN** | |
| Preserved / salted goods | **OPEN** | |
| Drink / cordial | **OPEN** | |
| Which of these Inés actually does | **OPEN** | The distinction between *what is done* and *what she does* is deliberate |

---

## 8 · Historical medicinal uses (`S1` — reported as historical, not endorsed)

Recognised for **medicinal and cosmetic properties in ancient Greece and by the
Romans**, used as a **tonic, stimulant and carminative** for **dyspepsia,
headache and nervous tension**, and **to strengthen the memory**. (R6)

The memory association is the oldest and most persistent claim attached to this
plant. It is the reason the plant carries a cultural meaning of **remembrance**
across centuries.

---

## 9 · Source claims vs. modern evidence

Split deliberately. Claim and evidence are not the same thing and are not
merged here.

### 9.1 What is formally accepted as *traditional* use (`S1`, R4, R5)

The European Medicines Agency lists rosemary leaf preparations for:
- symptomatic relief of **dyspepsia** and **mild spasmodic gastrointestinal**
  complaints;
- relief of **minor muscular and articular pain**;
- **minor peripheral circulatory disorders**.

**The EMA's own qualifier, carried verbatim in force:** *traditional medicinal
use* means the use "is exclusively based upon **long-standing medicinal use
and not based on results from clinical studies**."

That qualifier is the most important line in this section. A regulatory listing
under "traditional use" is **not** a finding of efficacy.

### 9.2 What human trials actually show (`S1`)

| Study | Finding | Weight |
|---|---|---|
| Moss & Oliver — rosemary aroma, cognition and mood (R7) | Aroma of rosemary essential oil differentially affected cognition and mood in healthy adults | Small, acute, healthy volunteers |
| Pengelly et al. — elderly population (R8) | **Biphasic dose-dependent** effect on speed of memory; the **lowest dose (750 mg)** showed a statistically significant benefit vs. placebo — **higher doses did not** | Small; the dose-response is non-linear, which cuts against a simple "more is better" claim |
| Moss et al. — acute rosemary water (R9) | A number of statistically significant but **small** beneficial effects on cognition, consistent with the aroma findings | Small effect sizes, acute |
| Animal systematic review + meta-analysis (R10) | Cognitive improvement robust across species, extract type, treatment duration and memory type | **Animal only.** Does not transfer to humans on its own |

### 9.3 Honest reading

1. The **traditional** claim (memory, digestion) is ancient, continuous and
   well documented as a *claim*.
2. The **regulatory** position accepts it explicitly on tradition, **not** on
   clinical evidence.
3. The **human trial** evidence is real but **small, acute, and non-linear in
   dose**. It is not a demonstration that rosemary treats or prevents any
   cognitive disorder.
4. The **strongest** evidence base is in **animals**, and that is the weakest
   kind of evidence for a human claim.
5. **Nothing here supports a medical claim in the THYLORA world or outside it.**
   The world may carry the *belief* — that is historically accurate. It must
   not carry the *proof*.

---

## 10 · Native name

| Field | Value |
|---|---|
| EdereAriah native name for rosemary | **OPEN** |
| Authority to set it | **Chairman authors or selects** |
| Held until then | Referred to as "rosemary" in all THYLORA records, flagged as mirror-name |

This is the single named blocker on closing the rosemary lane.

---

## 11 · Route at a glance

```
[SOURCE]                          OPEN — grow or buy: Chairman's fork
  dry rocky sunny ground · evergreen · cut year-round
        |
[GROWER]  OPEN                    person, not just a place
        |
[SUPPLIER] OPEN                   no name invented
        |
[TRANSPORT] OPEN                  cart/crate — maker slots open
        |
[S15 RECEIVING] ................. BOUND
        |
[S05 HERB STORE / STILLROOM] .... BOUND      (fresh → S03 larder)
        |
[S01 GREAT KITCHEN] ............. BOUND
        |
[INÉS MORALES] .................. BOUND — preparation detail OPEN
        |
[USE] culinary OPEN · medicinal belief historical, evidence weak
        |
[NAME] .......................... OPEN — Chairman
```
