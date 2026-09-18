# PERIOD_TECH_PROFILE_CASTLE_001

Workroom: `WR-WORLD-CASTLE-001`
Reference implementation: `world/lib/period.js` · Emitted state: `world/data/period-tech-profile-castle-001.json`
Schema: `db/world-castle/0006_period_technology.sql`
Date: 2026-09-18

> This castle represents ONE historical period on the planet. Technology is
> constrained to that time state. Other time periods may exist elsewhere on the
> planet but do not bleed into this scene.

## Period state: UNRESOLVED

| Field | Value |
|---|---|
| `period_id` | `THYW-PERIOD-CASTLE-001` |
| `resolved` | **false** |
| era label | UNKNOWN |
| calendar basis | UNKNOWN |
| earliest / latest bound | UNKNOWN |
| region tradition | UNKNOWN |

Basis: no readable source establishes the period. `WR-CASTLE-001` carries the
open backend blocker *"exact world sites/names unresolved"*, and the one scene
reference is an unreadable file.

**The profile therefore ships as a gate with an empty allow-list.** Every one of
the thirteen categories reads `UNRESOLVED` with zero admitted items:

`TRANSPORT` · `LIGHTING` · `TOOLS` · `MASONRY` · `WOODWORKING` · `METALWORK` ·
`COMMUNICATIONS` · `HOUSEHOLD_SYSTEMS` · `EDUCATION_MATERIALS` ·
`WEAPONS_SECURITY` · `AGRICULTURE` · `MEDICINE` · `RECORDKEEPING`

`thyw_period_allowed` refuses every insert while `period_resolved` is false.
Nothing can be admitted by default.

---

## Why the allow-list is empty rather than filled with a plausible kit

This is the decision in this document that most deserves to be argued with, so it
is stated plainly rather than buried.

"Castle" in a general-audience reading collapses immediately to a Norman keep:
curtain wall, gatehouse, portcullis, arrow loops, a Western European high
medieval kit. If this profile had been filled in on that reading, every
downstream decision would have inherited it silently — the bond pattern of the
masonry specs, the cart gauge in the traveller profiles, the roof timbering, the
lighting sources in every room, the recordkeeping materials in the archive — and
each of those would then have been defended as canon by the next session, because
it would be sitting in a table looking like evidence.

Nothing in any readable source says this castle is European. What the sources do
say is that it sits on **EdereAriah**, and that the backend's own blocker on the
castle workroom is *"exact world sites/names unresolved"*. The backend is already
telling us this is open.

So the candidate list below is plural, and its ordering carries no preference.
Fortified royal stone and earthen architecture is not a European invention and
was never confined to Europe; a survey frame that treats the European case as the
default and everything else as an alternative has made a canon decision before
the Chairman has.

This matters practically as well as in principle. The choice of tradition changes
real numbers in this survey — it is not a labelling question:

- **Great Zimbabwe dry-stone** would make the mortar fields of every masonry spec
  resolve to **zero**, not UNKNOWN. Coursed dry-stone walling has no mortar bed
  and no perpend.
- **Benin City / Hausa earthwork** would make the primary wall material earthen
  rather than cut stone, changing unit dimensions, weathering rules, crew
  attribution classes and the entire load path.
- **Gondarine Fasil Ghebbi** would give cut-stone battlemented towers with a
  royal compound plan, closer to the assumed reading but arrived at by evidence
  rather than by default.
- **South Asian fort-palace** traditions would imply layered gates and ramped
  approaches sized for elephants and carts, which changes every turning-radius
  and gate-clearance figure in the access matrix.

The empty allow-list is not indecision. It is the only state that leaves all four
of those open until the Chairman closes them.

## Candidate traditions — PROPOSED, none canon

Order carries no preference. Each is a real building tradition with real
defensive or royal stone or earthen architecture, i.e. each could host a scene of
a castle, a cart and workers.

| Key | Note |
|---|---|
| `BENIN_CITY_WALLS_AND_PALACE` | Edo earthwork walls and royal palace complex, Benin City. Directly connected to material already preserved in this project's own research pack — `research/historical-evidence-2026-08-29.md` holds British Museum catalogue provenance for Edo objects associated with the February 1897 expedition and looting. |
| `GONDARINE_FASIL_GHEBBI` | Ethiopian Gondarine stone castle complex — battlemented towers, cut-stone walls, royal compound. |
| `GREAT_ZIMBABWE_DRY_STONE` | Coursed dry-stone enclosure walling; no mortar, so the mortar fields of a masonry spec resolve to zero rather than UNKNOWN. |
| `HAUSA_CITY_WALLS_KANO_ZARIA` | Massive earthen city walls and gates with royal compounds inside. |
| `SWAHILI_COAST_CORAL_STONE` | Coral-rag and lime-mortar coastal stone towns and forts. |
| `NUBIAN_MEROITIC_FORTIFIED` | Nile-corridor fired-brick and stone fortified royal architecture. |
| `MAGHREBI_KSAR_KASBAH` | Rammed-earth and mudbrick fortified compounds with corner towers. |
| `WEST_EUROPEAN_STONE_CASTLE` | Curtain wall, gatehouse, keep. One candidate among several, not the default. |
| `LEVANTINE_ANATOLIAN_FORTRESS` | Ashlar curtain and tower fortress traditions. |
| `SOUTH_ASIAN_FORT_PALACE` | Fort-palace complexes with layered gates and ramped elephant/cart approaches. |
| `EAST_ASIAN_CASTLE` | Dry-stone battered plinth carrying a timber-framed superstructure. |

Selection is Chairman-only: `thyw_period_candidate_traditions.selected` requires
`selected_by = 'CHAIRMAN'` and a timestamp.

A caution that belongs with this list: these are Earth traditions named as
*reference frames for reconstruction*, not as claims about EdereAriah's own
history. If the Chairman selects one, what is being selected is the material and
constructional logic the survey reasons with — bond, binder, load path, gate
geometry — not an assertion that an Earth polity exists in this world.

---

## Prohibited — the anachronism floor

These are prohibited for **every** candidate tradition above, so they can be
asserted before the period is chosen. Each is recorded `INFERRED`, not
`VERIFIED`, because the period itself is not verified.

| Category | Prohibited |
|---|---|
| `LIGHTING` | `ELECTRIC_LIGHTING`, `GAS_MANTLE_LIGHTING` |
| `TRANSPORT` | `INTERNAL_COMBUSTION_VEHICLE`, `RAILWAY`, `PNEUMATIC_TYRE` |
| `COMMUNICATIONS` | `ELECTRICAL_TELEGRAPH`, `RADIO`, `TELEPHONE` |
| `TOOLS` | `POWER_TOOL` |
| `MASONRY` | `PORTLAND_CEMENT`, `REINFORCED_CONCRETE`, `STEEL_FRAME` |
| `METALWORK` | `BESSEMER_BULK_STEEL` |
| `HOUSEHOLD_SYSTEMS` | `PRESSURISED_MAINS_PLUMBING`, `MECHANICAL_REFRIGERATION` |
| `EDUCATION_MATERIALS` | `INDUSTRIAL_WOOD_PULP_PAPER`, `MASS_SCHOOL_DESK_FURNITURE` |
| `WEAPONS_SECURITY` | `BREECH_LOADING_RIFLE`, `SMOKELESS_POWDER` |
| `AGRICULTURE` | `MECHANISED_TRACTOR` |
| `MEDICINE` | `GERM_THEORY_ANTISEPSIS`, `ANTIBIOTICS` |
| `RECORDKEEPING` | `PHOTOGRAPHY`, `TYPEWRITER`, `DIGITAL_RECORD` |

An item may not sit on both lists at once — `thyw_assert_not_both_lists()`
refuses it.

## Admission verdicts

`admits(profile, category, item)` returns one of:

| Verdict | When |
|---|---|
| `PROHIBITED` | On the anachronism floor, or off a resolved allow-list |
| `HELD_PERIOD_UNRESOLVED` | Not on the floor, but the period is unresolved — **held, not allowed** |
| `ALLOWED` | On a resolved allow-list |
| `REFUSED` | Unknown category |

Today every non-floor item returns `HELD_PERIOD_UNRESOLVED`. Nothing is admitted
by default, ever.

## Two standing rules

**Bleed.** Other time periods may exist elsewhere on EdereAriah. No object may
enter this scene from a frame outside `THYW-FRAME-CASTLE-001`'s lineage, and no
technology may enter that is not on this profile's allow-list.

**School architecture.** Learning and tutorial spaces are recorded as rooms of
this period's household — not as classrooms. `MASS_SCHOOL_DESK_FURNITURE` sits on
the prohibited floor for that reason, and `thyw_zone_class` carries
`LEARNING_TUTORIAL` rather than any classroom term.
