# WR-CASTLE-NATIVE-NAME-580 · Castle Native Name & Time Traversal

**Work items:** `THY-WORK-CASTLE-NATIVE-NAME-580` · `THY-WORK-CASTLE-DIMENSIONAL-TWIN-572`
**Sequence:** 580
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-wave1-products-wcupku`
**Opened:** 2026-09-21

---

## 1 · Result, stated first

**No name is returned. A name could not be returned honestly, and the missing
dependency is a language source.**

The rule given was **NATIVE LAND → LANGUAGE → HISTORY → NAME**. That chain has
four links. This pass could not establish the first three, so producing the
fourth would not have been research — it would have been invention wearing the
costume of research. The instruction was explicit that this must not happen, and
it has not.

What is returned instead: a complete source-recovery report, and a schema in which
a fabricated name is **structurally impossible to enter** rather than merely
discouraged.

---

## 2 · Source recovery — what was searched, and what was found

Every record class the spine named was searched across the entire repository,
case-insensitively, excluding only `.git` internals.

| Record class required | Searched for | Found |
|---|---|---|
| Land records | `land`, `parcel`, `deed`, `estate`, `acreage` | **none** — the `land` hits are `landscapes` and `destination` |
| Regional history | `regional`, `chronicle`, `county`, `territory` | **none** — the `regional` hits are sales-analytics copy |
| Language records | `language`, `lexicon`, `root word`, `etymolog`, `dialect` | **none** — every `language` hit is an HTML `lang` attribute |
| People / tribe / nation records | `tribe`, `nation`, `indigenous` | **none** — the `nation` hits are `destination` and `impersonation` |
| Old place forms | `place name`, `formerly known`, `old name` | **one adjacent surface**, see below |
| Castle chronology | `chronolog`, castle-context era locks | **none** |
| Mirror registry | `mirror`, `registry` | **one adjacent pattern**, see below |

The literal term **`castle` returns zero matches across every tracked file.**
There is no castle record in this repository at all — not a name, not a
chronology, not a stub.

### Two adjacent findings worth carrying forward

Neither is a castle record. Both tell the next session where the castle records
are likely to be shaped, and should not be re-searched from scratch.

**The mirror pattern already exists, and its shape is known.** `app/app.js`
queries a backend table with the columns:

```
thylora_name · earth_english_name · home_world_place · earth_mirror_place ·
stadium_reference · status · unresolved
```

It is `sports_team_registry` — teams, not places or castles — but it is the
established THYLORA world-to-Earth mirroring pattern, and it already carries an
explicit **`unresolved`** flag. That flag is the precedent this naming work
should follow: THYLORA already models "we do not have this name yet" as a first
class state rather than as a blank. `0012_castle_time_traversal.sql` follows the
same principle through `name_dependency` and `missing_at()`.

**A place-naming surface exists.** `app/index.html` carries a
**"Flags & Place Names"** room, described as "Names, emblems and places". Its
data is not in this repository; it reads from the backend. That room is the most
likely home of any old place forms, and is the first place to look once backend
access exists.

**This is expected and is not a contradiction.** `DASHBOARD_AUTHORITY.md` states
plainly that this repository is development source and **not** the record of
truth; the backend of record is `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), which
this session has no credential for and no network route to. The castle records
are very likely there. They could not be read from here.

---

## 3 · The missing language-source dependency

Returned as the spine required — the dependency, not a guess.

**Blocking dependency: a language record tying a specific Indigenous language to
the specific land the castle stands on.**

Without it, none of the seven fields the spine asked for can be produced:

| Required output | Why it cannot be produced |
|---|---|
| Root word | There is no lexicon to draw a root from |
| Meaning | A meaning without a lexicon is a guess |
| Pronunciation | Cannot be given for a word that does not exist |
| Historical use | Requires a historical record; none exists here |
| Source / provenance | The dependency itself |
| Compound construction | Requires the grammar of a specific language |
| Final candidate | Is the sum of the six above |

Constructing anything that *sounds* Indigenous from the shape of other languages
would be fabrication regardless of care taken, and would attach a false origin to
a real place and a real people. It was not done.

**Two further dependencies sit beyond the language record**, and both must be
satisfied before any candidate is accepted rather than merely proposed:

- **Which people, and which nation.** A language record alone does not say who
  holds authority over its use for naming.
- **Permission from the custodians of that language.** Not implied by access to a
  record. The schema treats a name accepted without granted permission as an error.

---

## 4 · Forbidden and constrained, enforced in the database

| Rule | How it is held |
|---|---|
| `PEETE CASTLE` is forbidden | `thy_castle_forbidden_name` check constraint. An insert attempting it is rejected by PostgreSQL. |
| Windsor is **ERC only** | `external_reference.classification` is checked equal to `'ERC'`; `usable_for_naming` is checked `false`. Both a `usable_for_naming = true` insert and a non-ERC classification were **rejected** in validation. |
| No fabricated language | `name_candidate.source_id` is `NOT NULL REFERENCES language_source`. With no language record on file, **no candidate row can exist**. Verified: the insert fails with a foreign-key violation. |
| No hollow candidate | Root, meaning, pronunciation, historical use, provenance, compound construction and final candidate are all `NOT NULL` with non-blank checks. |
| No acceptance without permission | `guard_name_acceptance()` refuses `state = 'accepted'` unless the language source records `permission_state = 'granted'`. |
| The blocker is data, not prose | `thy_castle.name_dependency` holds all eight dependencies, seeded `MISSING`. `thy_castle.naming_unblocked()` returns **false** and will keep returning false until every one carries a record. |

---

## 5 · Time traversal — state

`THY-WORK-CASTLE-DIMENSIONAL-TWIN-572`. Spine delivered in
`db/store-wave1/0012_castle_time_traversal.sql`, proven against PostgreSQL 16.13.

**One stable castle ID.** `thy_castle.castle.castle_id` is the primary key and
never changes — not across eras, not when the castle is eventually named. A
permanent `stable_ref` UUID sits beside it.

**A selected date loads all ten aspects**, exactly as specified:

geometry · room use · occupants · family connection · objects · repairs ·
business and supplier relationships · paintings · furniture · staff

`thy_castle.load_at(castle_id, date)` returns one row per aspect: the most recently
*recorded* layer whose *historical* era covers that date, with its source and its
confidence (`recorded` / `inferred` / `unverified`).

**Old state is never overwritten.** `era_layer` is append-only, enforced by a
`BEFORE UPDATE OR DELETE` trigger that raises `ERA_LAYER_IS_APPEND_ONLY`. A
correction is a new layer pointing at what it supersedes. Verified in validation:
after correcting one aspect, **2 layers are held and the corrected one loads** —
the superseded layer is still readable.

**An empty castle says it is empty.** `missing_at()` names every aspect with no
record for a date. Verified: at 1890-01-01 with one aspect recorded, it reports
**1 present, 9 missing** — it does not return plausible blanks.

**What the spine cannot do yet:** it holds no castle data, because none exists in
this repository to hold. It is an empty, working structure waiting on the same
backend read as everything else in §2.

---

## 6 · Evidence

`db/store-wave1/validation/run.sh` → **VALIDATION PASSED**, PostgreSQL 16.13.

| Expect-reject case | Result |
|---|---|
| Updating a castle era layer | **rejected** |
| Deleting a castle era layer | **rejected** |
| A name candidate with no language source | **rejected** |
| An external reference marked usable for naming | **rejected** |
| An external reference classified as anything but ERC | **rejected** |

| Readback | Value |
|---|---|
| `naming_unblocked()` | **false** |
| Dependencies not yet present | **8 of 8** |
| Layers held after a correction | **2** — nothing erased |
| Aspects present / missing at 1890-01-01 | **1 / 9** |

`tests/store-wave1.test.mjs` additionally asserts the forbidden name appears on
no surface, the ten aspects are all present in the schema, and all eight
dependencies are seeded `MISSING` — so no dependency can be quietly marked
satisfied without a record behind it.

---

## 7 · Restart point

1. Obtain backend access to `thylora-dash`.
2. Read the castle records there: land, regional history, language, people or
   nation, old place forms, chronology, mirror registry. **Start with the
   "Flags & Place Names" room's backing table and with whatever follows the
   `sports_team_registry` mirroring pattern** — §2 establishes both as the most
   likely shape and location. Do not re-run the repository search; §2 is its
   result.
3. For each one found, insert a `thy_castle.language_source` row — with its
   citation and custodian — and flip the matching `name_dependency` to `PRESENT`.
   **Never flip one without a record behind it.**
4. When `naming_unblocked()` returns true, and only then, propose candidates with
   all seven fields filled from the sources.
5. Seek permission from the language custodians. A candidate cannot reach
   `accepted` until `permission_state = 'granted'`.
6. If the records do not exist in the backend either, then the dependency is
   external to THYLORA entirely, and the next step is a real archive or a real
   community — not this repository, and not a generated word.

---

## 8 · Held throughout

No fabricated Native language. No name produced without a source. `PEETE CASTLE`
forbidden and refused by the database. Windsor kept as external reference corpus
only. No old castle state overwritten. One stable castle ID preserved.
