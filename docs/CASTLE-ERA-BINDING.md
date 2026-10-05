# The castle · era-binding model

**Workroom:** WR-TIMERUN-581, reconciled by **WR-RECONCILE-667** at live head 667
**Canon node:** `ER-CASTLE-ROYAL-001` · **Subordinate record:** `data/place/THY-PLACE-CASTLE-001.json`
**Executable form:** `time-run/lib/place.js` · **Schema:** `db/time-run/0001_eras_places.sql`

## Correction at live head 667

This document was written at 581 without backend access. Three things in it were wrong
and are corrected here. **Nothing is deleted; the superseded material is marked.**

1. **The castle already exists in canon** as `ER-CASTLE-ROYAL-001` — *"ROYAL CASTLE —
   CANONICAL NAME OPEN (DO NOT GUESS)"*, truth_state `OPEN_PENDING_CHAIRMAN_NAME_RECOVERY`,
   geometry `THY-SPC-CASTLE-001`, Earth mirror **Windsor Castle**, `measurement_state`
   **UNKNOWN**, disclosure `PRIVATE_EXACT_PUBLIC_ABSTRACT`. `THY-PLACE-CASTLE-001` was a
   duplicate and is now subordinate to it.
2. **All three name candidates are WITHDRAWN.** See *Naming* below.
3. **The invariants below were invented**, not read from canon. They are `ASSUMED, NOT
   CANON` and must be derived from the dimensional-twin work
   `THY-WORK-CASTLE-DIMENSIONAL-TWIN-572` before use.

Known canon occupant: **`ER-ROYAL-COOK-001` — Inés Morales, Royal Cook, `CHAIRMAN_LOCKED`.**
Known canon space: `THY-CASTLE-ROYAL-KITCHEN-001` — Royal Kitchen.

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

`compareStrata()` is the test. The strata below are **proposed, not canon** (`PROPOSED_ERA_STRATUM_NOT_CANON`). Across the 1700s, 1922 and current strata:
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

**PEETE CASTLE is prohibited**, and that prohibition stands — enforced in
`PROHIBITED_NAMES`, in `isProhibitedName()`, and in two database check constraints.

### All three candidates are WITHDRAWN

The live record for this place reads **"ROYAL CASTLE — CANONICAL NAME OPEN (DO NOT
GUESS)"** with truth_state **`OPEN_PENDING_CHAIRMAN_NAME_RECOVERY`**.

That changes the task. This is **name recovery, not name selection**: the Chairman already
has a name for this castle, and it is to be recovered from him, not derived by me.

Three further facts make the withdrawal unavoidable:

- **`THY-NAME-PROVENANCE-001` is LOCKED** and prohibits *"silently replac[ing] canon names
  with assistant-invented fantasy names."*
- **There is no EdereAirah language.** All 919 public tables in the live backend were
  searched for language, lexicon, morpheme or tongue columns. The only match is
  `er_vehicle_brand_language_registry` (vehicle brands). The morphemes the three candidates
  were built from had no canonical source and could not have had one.
- **Precedent.** At sequence 660 the Chairman answered "no" to exactly this kind of derived
  proposal (*Sayreth House*), and it was withdrawn. Names stay his word until he gives them.

| Withdrawn candidate | Reading it claimed | Disposition |
|---|---|---|
| **Ederehald** | The enduring hold | `WITHDRAWN_DO_NOT_GUESS` |
| **Ariahdura** | The land's threshold | `WITHDRAWN_DO_NOT_GUESS` |
| **Torvaenah** | The high stone that faces the water | `WITHDRAWN_DO_NOT_GUESS` |

All three are **retained in full** in `data/place/THY-PLACE-CASTLE-001.json` with their
derivations and the reason for withdrawal, so nothing is lost and nothing is repeated.
None was ever canon.

### The derivation law survives the withdrawal

**NATIVE LAND + LANGUAGE + HISTORY** still holds as the law, and
`validateNativeName()` still enforces it — a name with no derivation is an assignment, and
assignments are refused. It simply **cannot be exercised here**: the language is UNKNOWN
and the name is to be recovered.

### One open question about the gate itself

`THY-NAME-PROVENANCE-001`'s `naming_output_rule` asks that each naming task provide
**Earth-name options, EdereAirah-name options and hybrid options**. The 581 work gave only
one class (hybrid/derived) and gave it against a DO-NOT-GUESS record. Whether a *labelled*
hybrid proposal is permitted for a place under name recovery is a Chairman question, listed
in `WR-RECONCILE-667` §9. Until he says so, **nothing is proposed.**

### The language is genuinely unknown

Searched and absent, not withheld. Naming the EdereAirah native language — or confirming
there is none, and that names come from Earth and hybrid source classes only — is a
Chairman decision.
