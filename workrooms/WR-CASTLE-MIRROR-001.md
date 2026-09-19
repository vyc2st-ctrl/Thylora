# WR-CASTLE-MIRROR-001 · Historical Castle + Earth Mirror

**Work code:** `THY-WORK-HISTORICAL-CASTLE-MIRROR`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/edereariah-castle-dossier-8tf23d`
**Head read:** sequence 527 → 528 → 529 · **Written:** sequence 530
**QYRIS:** `THY-QYRIS-PLAIN-SPEECH-001` · verdict **PASS** · Chairman approval required
**Constraints held:** no image generation · no new store products · no publication

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for the
  Chairman dashboard. Nothing here touches `dashboard-current-head.html`.
- `dashboard-baseline.json` floor `THY-DASH-FLOOR-20260823-001` — no baseline capability
  removed, renamed or disconnected.
- The living-structure completion audit (sequence 528, `THY-WORK-LIVING-STRUCTURE-AUDIT-001`)
  is owned elsewhere and was **not duplicated or interrupted**.

---

## 2 · Mirror correction

The brief at sequence 527 named **Malbork**. Sequence **529** — written after that brief —
records the Chairman **rejecting Malbork** and asking for a famous English castle.

**Windsor Castle is the Earth mirror.** The Malbork record was kept and marked
`SUPERSEDED` rather than deleted, because its structural findings still hold as generic
working-castle evidence.

Sequence 529 also raises two standing rules that this delta obeys:

- the EdereAriah castle **may closely match Windsor's exterior and interior** architectural
  and functional layout, while keeping its own names, people, companies and events;
- **every visible made object** must resolve to a maker, workshop, company, guild, household
  or supplier — or carry an explicit **OPEN** provenance.

---

## 3 · Central finding

**The castle had never been registered.**

Before this delta it existed in canon only as the words `Castle network` in the
`location_label` of one schedule row, `THY-SCHED-CASTLE-SOCIAL-001`. The Royal Cook mission,
the royal kitchen and the rosemary lane were all standing on a building with no record.

It is registered now as `ER-CASTLE-ROYAL-001`, and what is missing is **named rather than
filled in**.

### The castle name is not guessable

`THY-FAMILY-VESSEL-CASTLE-PRIVACY-001` states it directly: *do not guess the castle name*.
Two other records rename themselves to it on recovery:

| Record | Waiting state |
|---|---|
| `THY-FAMILY-VESSEL-CASTLE-PRIVACY-001` | THE NIGHTSTEP holds the name until recovery |
| `THY-PEETE-CROWN-REFINERY-NAME-001` | `final_name_state: PENDING_CANONICAL_CASTLE_NAME_RECOVERY` |
| `ER-CASTLE-ROYAL-001` | `OPEN_PENDING_CHAIRMAN_NAME_RECOVERY` |

One name unblocks three records. It is a **retrieval task, not a naming task.**

---

## 4 · Backend delta

| Record | Table | Class / State |
|---|---|---|
| `ER-CASTLE-ROYAL-001` | `thylora_world_entities` | `OPEN_PENDING_CHAIRMAN_NAME_RECOVERY` · INTERNAL |
| `THY-CASTLE-HISTORICAL-DOSSIER-001` | `thylora_world_design_records` | EDEREARIAH_PROPOSED · REQUIREMENTS_DEFINED |
| `THY-CASTLE-BUILDING-MAP-001` | `thylora_world_design_records` | INTERNAL_ONLY_NO_PUBLIC_INTERIOR_MAP |
| `THY-CASTLE-ROYAL-KITCHEN-001` | `thylora_world_design_records` | EDEREARIAH_PROPOSED · REQUIREMENTS_DEFINED |
| `THY-CASTLE-MAKER-SLOTS-001` | `thylora_world_design_records` | 11 slots, all OPEN |
| `THY-MIRROR-WINDSOR-001` | `thylora_world_design_records` | EARTH_ACTUAL · REGISTERED |
| `THY-MIRROR-MALBORK-001` | `thylora_world_design_records` | EARTH_ACTUAL · **SUPERSEDED** |
| `THY-PLANT-ROSEMARY-0001` | `thylora_living_world_records` | EDEREARIAH_PROPOSED · REQUIREMENTS_DEFINED |
| 6 × `VLEGH-*` | `vlegh_registry` | REGISTERED |
| QYRIS check | `thylora_qyris_work_item_checks` | PASS · approval required |
| Sequence 530 | `thylora_query_carryforward` | CAPTURED · CURRENT |

All fifteen records were read back after writing.

---

## 5 · Castle dossier — 3 of 15 fields answerable, 12 OPEN

| Field | State |
|---|---|
| Native castle name | **OPEN — do not guess** |
| City | OPEN |
| Territory | OPEN |
| Founding date | OPEN — the calendar cannot yet express a year |
| Founding authority | OPEN |
| Original purpose | OPEN |
| Primary materials | **CANON PARTIAL** — warm red brick, stone. Sources OPEN. |
| Architectural phases | OPEN |
| Expansion history | OPEN |
| Ruling / ownership history | OPEN |
| Major events | OPEN |
| Current royal use | **CANON PARTIAL** — active social rhythm, HOUSEHOLD_PRIVATE |
| Current residents | OPEN |
| Current workforce | **CANON PARTIAL** — three locked people, five unassigned 1700s roles |

**Edereaireum** (`THY-TERM-EDEREAIREUM-001`) is LOCKED with all properties UNKNOWN and was
**not** assigned to any object.

---

## 6 · Royal kitchen

Placed in the service range, ground level: against an outside wall so the flue draws, beside
the kitchen court so water and cut herbs arrive without crossing the household, under the
dining rooms with its own serving stair, downhill of the well and uphill of the drain.

Room hierarchy: main kitchen → pastry/bake room · larder · **locked spicery** → still room ·
scullery → kitchen court. The spicery key is the Head Cook's rank.

Shift shape inherits the existing household standard — *continuous authority with named
relief, no unattended handoff*. **Clock hours are OPEN**; the world clock is uncalibrated and
no hour was fabricated.

**Inés Morales**, 55, Spanish, one Royal Cook among several. Her **closed locket** is recorded
as personal, not uniform, keyed to **Veronica Hall** (23) with the exact connection UNKNOWN,
and is never described as opened.

**Name collision flagged:** Clara Bennett (governess, 61) is a different person from Carla
Bennett and Maya Bennett (ErsatzReality Studios staff). Do not merge.

---

## 7 · Rosemary

Earth mirror: *Salvia rosmarinus* Spenn., formerly *Rosmarinus officinalis* L. Same plant,
same properties. **EdereAriah native name is OPEN and was not invented.**

The three claim classes are kept strictly separate and the documented medicinal history is
**recorded, not suppressed**:

- **HISTORICAL USE** — Mediterranean roasting herb; folk-medicine preparations for renal
  colic, dysmenorrhea and muscle spasm; memory and purification in ancient Greece and Rome;
  Egyptian burial use with traces reported in tombs c. 3000 BCE; garlands for students at
  examinations; used at both weddings and funerals.
- **SOURCE CLAIM** — the EMA registers rosemary leaf and oil on **traditional use**, and
  states plainly that there is *insufficient evidence from clinical trials*; the registration
  rests on plausibility plus 30+ years of documented safe use.
- **MODERN EVIDENCE** — small and preliminary in humans. Animal work far exceeds it.

> Long and real as history. Plausible and regulated as tradition. **Not established as
> treatment.**

Supply route: herb-garden bed against a warm wall → cut in the morning → kitchen court →
weighed, tallied, cut-time recorded → used fresh the same day, or hung in the still room and
bundled into the locked spicery.

---

## 8 · Time state

Governing profile `THY-DUAL-TIME-EDEREARIAH-002`, `never_fabricate_native_time: true`.

- Orbit: **507 Earth-read days** · Hester System · Kaeleenrah V · Orbit 5
- Continuity epoch anchor: **2026-08-03**
- Only exact anchor: **Chairman TIMESEAL 2026-09-17 10:05 EDT = Day 83 Aethon, 4 hours 5 minutes**
- Unresolved: native day length, sub-day units, month/cycle names, season names and
  boundaries, weekday names, year numbering

**No in-world date or clock value was written into any record in this delta.**

---

## 9 · Earth mirror — Windsor

Sourced from the Royal Collection Trust, royal.uk, Historic England (1117776, 1001434) and
Britannica. The single strongest mirror object is the **Great Kitchen**: the oldest working
kitchen in the country, built in the reign of Edward III, in use over 750 years, with original
1360s fireplaces still in place, and still cooking for State occasions.

It proves on Earth what EdereAriah is claiming — a royal kitchen is an institution with a
lineage, not a room.

Forbidden transfers are enumerated in the record: every Earth monarch, every Earth date, the
Order of the Garter, St George, the ward names, and Thames / London / England / Windsor.

---

## 10 · Privacy

`THY-FAMILY-VESSEL-CASTLE-PRIVACY-001`: **no public interior images or interior maps by
default.** Sequence 529 permits *authoring* an interior matched to Windsor. These are
compatible and the delta treats them as such — the building map is stored INTERNAL, the
family range is withheld, and nothing interior is publication-eligible.

---

## 11 · Exact executable next step

Search Chairman source material for the parents/family castle name:
`thylora_chairman_source_messages`, `thylora_chairman_source_segments`,
`thylora_chairman_source_shorthand_expansion`, `thylora_shorthand_dictionary`,
`thylora_transmission_registry`.

Nothing downstream of the name should be authored until it resolves.

## 12 · Restart point

`RESTART 530` — full text in `thylora_query_carryforward.restart_point` at sequence 530.
