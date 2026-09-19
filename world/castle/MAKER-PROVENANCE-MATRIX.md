# Every Object Has A Maker — Castle-Wide Provenance Matrix

**Work code:** `THY-WORK-WINDSOR-MIRROR-CASTLE`
**Scope:** **globally binding on EdereAriah Castle.** Not a sample.
**Rule:** every visible manufactured or crafted object category in this castle
carries the twelve-slot record below. Where THYLORA already holds maker or
company canon, that canon is used. Where it does not, the slot reads `OPEN`.
**No company name is invented in this file.**

---

## 1 · The twelve slots

| # | Slot | Definition |
|---|---|---|
| 1 | `OBJECT` | The specific thing |
| 2 | `OBJECT CLASS` | The category it belongs to |
| 3 | `MAKER PERSON` | The named hand |
| 4 | `WORKSHOP / COMPANY / GUILD` | The body that stood behind the hand |
| 5 | `PLACE MADE` | Where it was made |
| 6 | `DATE / ERA MADE` | When |
| 7 | `MATERIAL SOURCE` | Where the substance came from |
| 8 | `BUYER / COMMISSIONER` | Who ordered and paid |
| 9 | `PRICE / VALUE IF KNOWN` | What it cost |
| 10 | `MAKER MARK / SERIAL` | How it identifies itself |
| 11 | `REPAIR HISTORY` | What has been done to it since |
| 12 | `CURRENT HOLDER / USER` | Who has it now, and who uses it |

Machine form: `db/world/maker_provenance.sql` and `world/LIVING-MAP.json`.

---

## 2 · The rule of the matrix

1. An object without a maker record is **not finished world**. It is a prop.
2. `OPEN` is a legitimate, countable state. **A fabricated maker is not.**
3. A maker record may be filled from three places only:
   - existing THYLORA maker/company canon,
   - a Chairman authoring decision,
   - a verified Earth-mirror attribution **explicitly labelled as mirror**.
4. Slot 7 (`MATERIAL SOURCE`) reaches back to a supplier, which reaches back to
   a place, which reaches back to a person. The chain does not stop at the
   workshop door.
5. Slot 12 (`CURRENT HOLDER / USER`) is what makes the object **living**.
   A pan whose current user is Inés Morales is a different object from the
   same pan in a store.

---

## 3 · Priority classes — the twenty-four

Applied first, per instruction. Each carries all twelve slots.

| # | Object class | Where it lives | Maker state | Mirror exemplar available |
|---|---|---|---|---|
| 01 | **Stoves / hearths** | S01 Great Kitchen | **OPEN** | Yes — Windsor Great Kitchen retains **original Edward III fireplaces** (`S1`, W9) |
| 02 | **Pots** | S01 | **OPEN** | Partial — form and copper practice evidenced pictorially (W20, W21) |
| 03 | **Pans** | S01 | **OPEN** | Partial — as above |
| 04 | **Knives** | S01, S07 | **OPEN** | No verified maker retrieved |
| 05 | **Plates** | S10, S11 | **OPEN** | Partial — Royal Collection service ware, maker not retrieved this run |
| 06 | **Bowls** | S11 | **OPEN** | No |
| 07 | **Glass** | S11 | **OPEN** | No |
| 08 | **Tables** | U11–U34, S20 | **OPEN** | Yes — **Morel & Seddon**, Windsor commission 1826–30 (`S1`, W7) |
| 09 | **Chairs** | U11–U34 | **OPEN** | Yes — **Morel & Seddon open armchair, RCIN 2412; sofa, RCIN 31373** (`S1`, W18, W19) |
| 10 | **Cabinets** | U30–U34, U50 | **OPEN** | Yes — Morel & Seddon scheme, Green Drawing Room c.1826 (`S1`, W7) |
| 11 | **Doors** | throughout | **OPEN** | No verified maker retrieved |
| 12 | **Locks** | throughout | **OPEN** | No |
| 13 | **Hinges** | throughout | **OPEN** | No |
| 14 | **Lamps** | throughout | **OPEN** | Indirect — a **faulty spotlight** was the 1992 ignition source (`S1`, W4); lighting is a hazard-bearing class |
| 15 | **Textiles** | U12, S12, throughout | **OPEN** | Yes — **Waterloo Chamber carpet, woven by prisoners in Agra, India**, for Queen Victoria's Golden Jubilee; 24 m × 12 m, ≈2 tons, world's largest seamless rug (`S1`, W17) |
| 16 | **Uniforms** | staff, chapel, guard | **OPEN** | No verified maker retrieved |
| 17 | **Books** | U50 Royal Library | **OPEN** | Partial — collection identified, makers not retrieved |
| 18 | **Paper** | U51 Print Room, M03 Archives | **OPEN** | No |
| 19 | **Ink** | M03, U51 | **OPEN** | No |
| 20 | **Carts** | S15, G-range | **OPEN** | No |
| 21 | **Tools** | S22 works yard | **OPEN** | No |
| 22 | **Crates** | S15 receiving | **OPEN** | No |
| 23 | **Barrels** | S13 cellars | **OPEN** | No |
| 24 | **Carved and painted interior fabric** *(added — the mirror forces it)* | U10–U25 | **OPEN** | Yes — **Grinling Gibbons** (carving), **Antonio Verrio** (painting), **René Cousin** (gilding), Windsor 1675–84 (`S1`, W1, W8) |

---

## 4 · Existing THYLORA maker/company canon

**Searched this run:** repository-wide (`grep -ril` across all tracked files).
**Result: no EdereAriah maker or company canon found in this repository.**

Maker canon, if it exists, lives in `thylora-dash`, which **this session could
not reach** (network policy refused `jvsdxhrfhtlgaknhjxlz.supabase.co`,
HTTP 403 at the proxy). Therefore:

- Every maker slot above is `OPEN` **pending a backend read**, not `OPEN`
  because nothing exists.
- **No name was generated to fill a gap.** That is the instruction and it was
  held without exception.

Reconciliation query for a backend-enabled session:

```
GET /rest/v1/thylora_query_carryforward?select=*&sequence_no=gte.500&order=sequence_no.asc
```
…then scan for any maker, workshop, guild, company or supplier already named,
and back-fill slots 3, 4 and 8 before any new authoring.

---

## 5 · Worked slot sheets — mirror grade

These four are filled **to demonstrate the matrix at full depth**. Every value
is an Earth-mirror fact at `S1`. **They are not EdereAriah canon.** They are
the standard EdereAriah objects must be written to.

### 5.1 Seat furniture — Morel & Seddon armchair
| Slot | Value |
|---|---|
| OBJECT | Open armchair, RCIN 2412 |
| OBJECT CLASS | Chairs |
| MAKER PERSON | Nicholas Morel; George Seddon |
| WORKSHOP / COMPANY / GUILD | **Morel & Seddon** — partnership formed 1826/1827 expressly to furnish the Castle |
| PLACE MADE | London |
| DATE / ERA MADE | c. 1826–1830 |
| MATERIAL SOURCE | OPEN |
| BUYER / COMMISSIONER | **George IV** |
| PRICE / VALUE IF KNOWN | OPEN — scheme described as among the most lavish and costly interior schemes carried out in England |
| MAKER MARK / SERIAL | RCIN 2412 |
| REPAIR HISTORY | OPEN |
| CURRENT HOLDER / USER | Royal Collection, Windsor Castle |
| Source | W7, W19 |

### 5.2 Floor textile — Waterloo Chamber carpet
| Slot | Value |
|---|---|
| OBJECT | Waterloo Chamber carpet, RCIN 35837 |
| OBJECT CLASS | Textiles |
| MAKER PERSON | **OPEN — unnamed.** Woven by **prisoners** |
| WORKSHOP / COMPANY / GUILD | Prison workshop, **Agra** |
| PLACE MADE | **Agra, India** |
| DATE / ERA MADE | For Queen Victoria's **Golden Jubilee** |
| MATERIAL SOURCE | OPEN |
| BUYER / COMMISSIONER | The Crown |
| PRICE / VALUE IF KNOWN | OPEN |
| MAKER MARK / SERIAL | RCIN 35837 |
| REPAIR HISTORY | OPEN |
| CURRENT HOLDER / USER | In use, Waterloo Chamber |
| Dimensions | **24 m × 12 m, ≈2 tons — the world's largest seamless rug** |
| Source | W15, W17 |

**Note for the History / Evidence lane:** slot 3 here reads *"unnamed, woven by
prisoners."* The object is world-famous; the hands that made it are not
recorded by name. That asymmetry is itself a finding and is logged in
`world/lanes/THINKING-LANES.md` §4 as an evidence-lane case.

### 5.3 Carved interior fabric — Grinling Gibbons
| Slot | Value |
|---|---|
| OBJECT | Carved cornices and limewood carving, State Apartments and royal chapel |
| OBJECT CLASS | Carved and painted interior fabric |
| MAKER PERSON | **Grinling Gibbons** (Dutch-born sculptor) |
| WORKSHOP / COMPANY / GUILD | Gibbons' workshop, under the architect **Hugh May** |
| PLACE MADE | Windsor Castle, in situ / London |
| DATE / ERA MADE | From **1677**, within the 1675–1684 campaign |
| MATERIAL SOURCE | OPEN (limewood) |
| BUYER / COMMISSIONER | **Charles II** |
| PRICE / VALUE IF KNOWN | OPEN |
| MAKER MARK / SERIAL | OPEN |
| REPAIR HISTORY | **Only 3 of 22 wall and ceiling decorations survived George IV's restoration**; further loss in the 1992 fire |
| CURRENT HOLDER / USER | In situ, Windsor Castle |
| Source | W1, W8 |

### 5.4 Painted ceiling — Antonio Verrio
| Slot | Value |
|---|---|
| OBJECT | Illusionistic ceiling and wall paintings, State Apartments |
| OBJECT CLASS | Carved and painted interior fabric |
| MAKER PERSON | **Antonio Verrio** (c. 1639–1707), Italian |
| WORKSHOP / COMPANY / GUILD | Under **Hugh May**; gilding by **René Cousin**, French |
| PLACE MADE | Windsor Castle, in situ |
| DATE / ERA MADE | **1675–1684** |
| MATERIAL SOURCE | OPEN |
| BUYER / COMMISSIONER | **Charles II** |
| PRICE / VALUE IF KNOWN | OPEN |
| MAKER MARK / SERIAL | OPEN |
| REPAIR HISTORY | Largely lost in the George IV remodel; see 5.3 |
| CURRENT HOLDER / USER | In situ, Windsor Castle |
| Source | W1, W8 |

---

## 6 · Fabric-level makers — the building is an object too

| Element | Maker / directing hand (mirror `S1`) | Material source (mirror `S1`) |
|---|---|---|
| Motte and timber castle | William the Conqueror's works, c. 1070 | Local timber — OPEN |
| Round Tower, stone, 1170 | Henry II's works | **Heath stone / sarsen, Bagshot Sands, near Bagshot, Surrey**; chalk core |
| Upper Ward palace, from 1357 | **William of Wykeham, Bishop of Winchester**, directing for Edward III | **Kentish Ragstone** (Kent), **Caen stone** (Normandy) |
| St George's Chapel, 1475–1528 | Edward IV → Henry VIII | OPEN |
| State Apartments, 1675–84 | **Hugh May** | OPEN |
| Exterior remodel, 1824–40 | **Sir Jeffry Wyatville**; **A.W.N. Pugin** as a boy of fifteen | OPEN |
| Post-fire rebuild, 1992–97 | Restoration Committee under **Prince Philip, Duke of Edinburgh**; lead practices **OPEN** | OPEN |
| Round Tower timbers | **OPEN** — Historic England research report 53-2003 unread this run | OPEN |

---

## 7 · Count

| State | Priority classes |
|---|---|
| Filled with EdereAriah canon | **0** |
| `OPEN`, pending backend read | **24** |
| Backed by a verified mirror exemplar | **6** (01, 08, 09, 10, 15, 24) |
| Filled with invented names | **0** — held |
