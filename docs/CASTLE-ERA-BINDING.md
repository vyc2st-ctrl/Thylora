# The castle · era-binding model

**Workroom:** WR-TIMERUN-581 · **Record:** `data/place/THY-PLACE-CASTLE-001.json`
**Executable form:** `time-run/lib/place.js` · **Schema:** `db/time-run/0001_eras_places.sql`

## One place, many living eras

The castle is **one stable location across living eras**. Its rooms, walls,
repairs, objects, occupants, staff, businesses, furniture, art and family
relationships **change by era**. Its place identity does not.

| Invariant — change it and it is another place | Era-variable — expected to differ |
|---|---|
| `place_id` | rooms |
| `native_name` | walls |
| `site_ground` | repairs |
| `orientation` | objects |
| `approach` | occupants |
| `water_relation` | staff |
| `footprint_origin` | businesses, furniture, art, family relationships, name rendering |

`compareStrata()` is the test. Across the 1700s, 1922 and current strata:
`same_place: true`, `broken_invariants: []`, and nine era-variable fields differ.

## The three strata on record

| | **1700s** | **1922** | **Current** |
|---|---|---|---|
| Walls | Full curtain wall; ditch maintained | Breached on the south side, ditch filled | Breach consolidated and left **visible as a record of the 1922 state** |
| Light and power | Candle, lamp, hearth | Electric on main floors; telephone at the steward's desk | Current services throughout, concealed |
| Stable court | Horses, tack, smithy at the gate | Motor garage | Grounds tenancies |
| Businesses | Stable, smithy, farm rents at the hall | Estate office, garage, let grain store | Working offices, events use of the hall |
| Staff | Steward, cook, stable hands, house staff, chaplain | Housekeeper, driver, groundsman, clerk | Site manager, maintenance, grounds, office |
| People | **LIVING** | **LIVING** | **LIVING** |

The 1922 breach surviving into the current era as a deliberate visible record is
the model working: era change accumulates on one place rather than replacing it.

## Naming

**PEETE CASTLE is prohibited.** The prohibition is enforced three ways: in
`PROHIBITED_NAMES`, in `isProhibitedName()` (which also catches any name
containing *Peete*), and in the database (`trun_places_name_not_prohibited`,
`trun_name_candidate_not_prohibited`).

The name must derive from **NATIVE LAND + LANGUAGE + HISTORY**. A name with no
derivation is an assignment, and assignments are refused:
`validateNativeName()` requires all three sources plus at least two glossed
morphemes, and the database requires `jsonb_array_length(morphemes) >= 2`.

### Three candidates — none canon

| | **NAME-A · Ederehald** | **NAME-B · Ariahdura** | **NAME-C · Torvaenah** |
|---|---|---|---|
| Land | EdereAriah | EdereAriah | EdereAriah |
| Morphemes | *edere* "that which endures" (the root the land name carries) + *hald* "a holding, a keep" | *ariah* "given ground, the land" + *dura* "threshold, doorway, place of crossing" | *tor* "high stone" + *vaen* "facing the water" + *-ah* place suffix |
| Reading | The enduring hold | The land's threshold | The high stone that faces the water |
| History it records | The structure remained while its occupants, trades and families changed. Named for what it did, not who held it. | The site has always been where people enter the land and leave it — gate, customs house, receiving hall, and under Time Run, threshold between living eras. | Named for how it was first sighted from the water: high stone standing toward the approach, visible before anything else on the shore. |
| Strength | Ties the castle to the land name and to the one fact true in every era. | Earns its name from the site's function and pre-carries the threshold role. | Purely geographic. True in every era regardless of holder or mechanic. |
| Weakness | Any enduring building in EdereAriah could carry it. | If `ENTRY_EXIT` does not resolve to EE-A, the name points at a mechanic that was not chosen. | Requires the water relation to be fixed as an invariant before sealing. |

**The name is invariant; its rendering is not.** Spelling drift and local usage
are era-variable and recorded per stratum (`Ariah Dura` in the 1700s →
`Ariahdura` later). `renderingFor()` returns `same_name: true` regardless.

### A language is still missing

All three derivations name their language as *"native tongue of EdereAriah
(CANDIDATE)"*. **The language itself is unnamed in the backend.** Until it is
named, every derivation rests on an unnamed source. This is recorded as a
Chairman decision rather than invented here.
