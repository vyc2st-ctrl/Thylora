# WR-PERSONS-001 · THYLORA Person & Life Continuity

**Lane:** World person continuity · no random filler people · royal household ·
castle workforce · deterministic crowds · portrait continuity · life continuity
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-character-continuity-0nf5dq`
**Opened:** 2026-09-18
**Image generation:** none. No image was generated, requested or implied by this delta.

---

## 0 · Backend read, performed first

The instruction was to read the backend first. Result, stated plainly before
anything else:

| Asked for | Found |
|---|---|
| `THY-CONTINUITY-BOOT-002` | **Not present** anywhere in the repository |
| latest carryforward | **Not present** as a document. The string "carryforward" appears once, inside `dashboard-current-head.html` as dashboard UI text, not as a continuity record |
| `THY-WORLD-CONTINUITY-FLOOR-001` | **Not present** as a document. Adopted in this delta as the continuity reference every person and scene carries |
| `studio_world_characters` | **Not present** |
| `studio_scene_character_snapshots` | **Not present** |
| `studio_character_state_ledger` | **Not present** |
| `thylora_person_identity` | **Not present** |
| `thylora_person_serial_registry` | **Not present** |

What the repository backend *does* contain is `db/rae-link/` — the RAE Link
media network: 40 `rael_*` tables covering identity, channels, media pipeline,
rights, audience, monetization and entitlements. It holds **no person state, no
body state, no scene snapshot and no life ledger.** There was nothing to reuse
for this objective beyond its doctrine and two of its rules, both adopted here
(world/simulated truth, and guardian authority for minors).

`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the
egress proxy at 2026-09-18T05:40:34Z, so the **live** backend could not be
inspected. The five named objects may exist there. Every one of them is
therefore created only if absent and topped up column by column, so a live
table of another shape gains the continuity columns rather than colliding.
This is the same blocker recorded as **B1** in `WR-RAELINK-001.md`, unchanged.

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority
  for the Chairman dashboard. Authority remains `vyc2st-ctrl/thylora-executive-dashboard`
  → `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability was removed, renamed or disconnected.**
- `WR-RAELINK-001` is untouched. No `rael_*` object is altered, and no `rael_*`
  file is edited.
- Production DDL is **not applied**. Held for Chairman execution, by rule.

---

## 2 · Execution delta

### Added — backend schema (reviewable, **not applied**)

`db/persons/` — 3,778 lines, 47 tables, 37 functions, 50 RLS policies,
99 check constraints, 10 numbered migrations, plus a validation harness and a
readback script. See `db/persons/README.md` for the file-by-file table.

### Not added

No surface, no route, no navigation entry, no test file, no image. This delta is
schema, seed, validation and documentation only.

---

## A · Existing person tables we can reuse

**None for person state.** The honest answer is that this lane starts from zero.

What is reusable is **doctrine and two enforceable rules** from `db/rae-link/`:

| From RAE Link | Reused how |
|---|---|
| `rael_channels_world_truth` — a world entity can never be presented as an Earth person and must carry a visible disclosure | Re-implemented as `thyp_character_world_truth` on `studio_world_characters` |
| `rael_profiles_guardian_required` / `rael_consent_minor_guardian` — a minor is never active without a recorded guardian | Re-implemented as `thyp_identity_guardian_required`, and extended to `thyp_portrayal_minor_guardian` |
| `rael_channel_class` separating `EARTH_PERSON` from `EDEREARIAH_INHABITANT` | The Earth/world separation is the axis of `thylora_person_identity` + `thyp_earth_portrayal_links` |
| "Medical detail is structurally refused" | `thyp_bio_profile` exists only as *simulated* attributes of a fictional character, constrained `simulated_only = true`, and is refused entirely while an Earth portrayal link records no consent |
| Migration doctrine: additive only, soft references, `to_regclass` guards, RLS on everything, gate-reports-everything-at-once | Held throughout `db/persons/` |
| `rael_channels.world_place_ref`, `rael_media_assets` | Left alone. A published image of a scene can carry `continuity_ref` and the scene code as a soft reference; no second truth is created |

**No second source of truth was created.** Where RAE Link already owns a
concept (channels, media assets, rights, money) this lane does not restate it.

---

## B · Missing fields

Against the Chairman's list, everything was missing, because no person table
existed. The list below is what the instruction named and where it now lives.

| Required | Now held in |
|---|---|
| identity | `thylora_person_identity` |
| age, date/time state | `studio_world_characters.birth_world_date` / `as_of_world_date` / `as_of_world_time` / `age_years` (arithmetic-checked) |
| height, weight, body dimensions | `thyp_body_lock` (10 dimensional columns) |
| skin tone, hair, face geometry | `thyp_body_lock` (tone, undertone, hair colour/texture/length/hairline/style, eye colour, `face_geometry` jsonb + hash) |
| voice | `thyp_voice_profile` |
| handedness, mobility | `thyp_body_lock.handedness`, `.mobility` |
| simulated biological profile, blood type | `thyp_bio_profile` (consent-gated, `simulated_only`) |
| cognition / personality | `thyp_cognition_profile` |
| knowledge | `thyp_knowledge_items` + `thyp_person_knowledge` |
| skills | `thyp_skills` + `thyp_person_skills` |
| memory ledger | `thyp_memory_ledger` |
| relationships | `thyp_relationships` |
| occupation, rank | `thyp_occupations` + `thyp_person_occupation` |
| home, room, work location | `thyp_person_assignments` (`HOME`/`ROOM`/`WORK`/`BOARDING`/`SCHOOLING`) over `thyp_places` |
| schedule | `thyp_schedules` + `thyp_schedule_blocks` |
| education | `thyp_education_tracks` / `_subjects` / `_curriculum` / `thyp_person_education` / `thyp_education_progress` |
| wardrobe, possessions | `thyp_wardrobe_items`, `thyp_possessions` |
| income / status | `thyp_person_status` |
| religious / cultural state where canonically defined | `thyp_person_status` — canon-gated, see §J |
| life events | `thyp_life_events` |
| current emotional state | `thyp_person_condition` |
| injuries | `thyp_injuries` |
| current scene state | `studio_scene_character_snapshots` |
| work history | `thyp_work_history` |

**Fields deliberately left absent:** no precise real-world location, no IP, no
real medical record, no real-person biometric. There is no column for any of
them, which is the only refusal that survives a future change of mind.

---

## C · Proposed persistent person schema

Three tiers, and there is no fourth:

```
NAMED_PERSISTENT       a person with a name or a pending name, full state
RECURRING_BACKGROUND   a recurring worker with a persistent ID and full state
DETERMINISTIC_CROWD    generated from (cohort seed, index), still serialled
```

A person row cannot exist without a tier, which is the structural end of the
"extra". The spine:

```
thylora_person_serial_registry   serials, never reused, retirement reasoned
  └── thylora_person_identity    who; Earth/world status; guardian; name state
        ├── thyp_earth_portrayal_links   depicts a real person? consent lives here
        └── studio_world_characters      the world character spine
              ├── thyp_body_lock (+ _history)   dimensional truth, sha256-sealed
              ├── thyp_voice_profile
              ├── thyp_bio_profile            simulated only, consent-gated
              ├── thyp_cognition_profile
              ├── thyp_person_status          rank, income, canon-gated culture
              ├── thyp_person_condition       emotion now
              ├── thyp_injuries
              ├── thyp_wardrobe_items / thyp_possessions
              ├── thyp_person_occupation → thyp_occupations
              ├── thyp_person_assignments → thyp_places
              ├── thyp_schedules → thyp_schedule_blocks
              ├── thyp_person_education → thyp_education_tracks → _curriculum
              ├── thyp_person_skills / thyp_person_knowledge
              ├── thyp_memory_ledger / thyp_life_events / thyp_work_history
              ├── thyp_relationships
              ├── thyp_portraits (+ _subjects, + _provenance)
              ├── studio_scene_character_snapshots   the gate
              └── studio_character_state_ledger     append-only history
```

Sealing: `thyp_body_lock_hash(row)` is an immutable sha256 over every
dimensional and appearance column. It is computed by trigger, never typed. "The
same person" is therefore a value that can be compared, not a paragraph someone
re-reads and re-imagines. Every lock a person has ever held is kept in
`thyp_body_lock_history` with the world date it was sealed.

---

## D · Royal family current state

Seeded exactly as instructed, at a world date held **PROVISIONAL** in
`thyp_world_clock` (the instruction gave ages, not a calendar; birth months and
days are 1 January placeholders, and ages resolve exactly at the stated date).

| Serial | Person | Name state | Age | Birth (provisional) | Chamber | Education track | Schedule blocks/week | Body lock |
|---|---|---|---|---|---|---|---|---|
| THY-P-0001 | Head of royal household | PENDING_CHAIRMAN | — | — | PL-CH-H | — | 0 | **awaiting Chairman** |
| THY-P-0002 | Vyctor Ebenezer | CONFIRMED | 24 | 1463-01-01 | PL-CH-A | TRK-YOUTH-GOVERN | 60 | **awaiting Chairman** |
| THY-P-0003 | Jordyn | CONFIRMED | 18 | 1469-01-01 | PL-CH-B | TRK-YOUTH-GOVERN | 60 | **awaiting Chairman** |
| THY-P-0004 | Cali | CONFIRMED | 16 | 1471-01-01 | PL-CH-C | TRK-ROYAL-SENIOR | 66 | **awaiting Chairman** |
| THY-P-0005 | Kennedy | CONFIRMED | 12 | 1475-01-01 | PL-CH-D | TRK-ROYAL-UPPER | 66 | **awaiting Chairman** |
| THY-P-0006 | Kylee | CONFIRMED | 10 | 1477-01-01 | PL-CH-E | TRK-ROYAL-MIDDLE | 66 | **awaiting Chairman** |
| THY-P-0007 | Grandson, age 7 | PENDING_CHAIRMAN | 7 | 1480-01-01 | PL-CH-F | TRK-ROYAL-EARLY | 66 | **awaiting Chairman** |
| THY-P-0008 | Mateo | CONFIRMED | 6 | 1481-01-01 | PL-CH-G | TRK-ROYAL-EARLY | 66 | **awaiting Chairman** |

Four decisions inside that table, each stated rather than slipped through:

1. **The second grandson has no name, so none was written.** He holds a real
   serial, a real age, a real chamber and a real timetable, with
   `name_state = 'PENDING_CHAIRMAN'` and a placeholder label. The instruction
   ended random filler people; inventing a name would have been exactly that.
2. **The head of the household holds a serial with a pending name.** A minor is
   never active without a recorded guardian, so a guardian had to exist for
   Cali, Kennedy, Kylee, the grandson and Mateo. Rather than invent a person,
   the head is registered with a pending name and stands as recorded guardian.
3. **No body locks were seeded for these eight, so none of them can appear in
   imagery yet.** Complexion, hair and dimensions for these people are the
   Chairman's to state — and five of the eight are minors, four of whom map to
   real children. The instruction said "preserve established complexion / hair
   / family continuity"; nothing in this repository establishes it, and
   inventing it would have been the same failure in a different costume. The
   gate therefore returns `BODY_LOCK_ABSENT` for all eight. **That is the
   correct blocked state, not an oversight**, and it is the one item on the
   critical path to using this system for royal imagery (§L).
4. **No family tree was asserted beyond what was said.** Guardian and ward
   links are written. Parent, sibling and grandparent links are not, because
   the instruction gave ages and two grandsons, not a lineage. The database
   would have accepted them; canon did not supply them.

Identity is preserved by construction: the serial is the identity, ageing moves
`as_of_world_date` forward and recomputes `age_years` from the birth date, and
`STATE_REWIND_REFUSED` stops anyone being moved back.

---

## E · Royal household education model

**No modern school is expressible.** `thyp_instruction_mode` contains exactly
nine values and none of them is a school: `HOUSEHOLD_TUTOR`, `GOVERNOR`,
`GOVERNESS`, `HOUSEHOLD_SCHOOLROOM`, `APPRENTICESHIP`, `GUILD_MASTER`,
`GRAMMAR_STYLE`, `NOBLE_HOUSEHOLD_SERVICE`, `PRACTICAL_OBSERVATION`.

Ten tracks seeded, 19 subjects, 83 curriculum lines with weekly minutes by age
band, 276 day-template blocks across six working days and one day of rest and
devotion:

| Track | Learner class | Mode | Ages |
|---|---|---|---|
| TRK-ROYAL-EARLY | Royal child | Governess | 4–7 |
| TRK-ROYAL-MIDDLE | Royal child | Household tutor | 8–11 |
| TRK-ROYAL-UPPER | Royal child | Governor | 12–15 |
| TRK-ROYAL-SENIOR | Royal child | Governor | 16–17 |
| TRK-YOUTH-GOVERN | Older youth | Apprenticeship | 18–25 |
| TRK-YOUTH-MIL | Older youth | Apprenticeship | 18–25 |
| TRK-PAGE-SERVICE | Page / ward | Noble household service | 7–17 |
| TRK-STAFF-ROOM | Staff child | Household schoolroom | 5–13 |
| TRK-LOCAL-GRAMMAR | Local child | Grammar-style | 7–14 |
| TRK-LOCAL-GUILD | Local youth | Guild or master | 12–19 |

Royal children carry reading and writing, mathematics, history and lineage,
languages, geography and maps, household and governance, music, riding,
physical training, practical observation, etiquette and diplomacy, craft and
devotion — weighted by age. Older youth carry governance, records, estate work,
trade, household management, military and guard knowledge, and engineering.
Pages and wards learn by service. Staff and local children have the household
schoolroom, grammar-style instruction, or a guild master.

**Exact schedules by age** are built by `thyp_build_education_schedule`, not
written by hand: it scales the age-matched curriculum to the teaching minutes
the day template actually has, allocates by largest remaining need in
deterministic order, and never overwrites a meal, rest, devotion, service or
physical-training slot. 450 blocks were generated for the seven royal learners.
Kylee (10) on a working day, as generated:

```
06:30–07:00 DEVOTION      07:00–07:45 MEAL          08:00–09:30 LESSON  mathematics
09:45–11:15 LESSON reading & writing                11:30–12:30 MEAL
12:45–14:15 LESSON languages                        14:30–15:30 PHYSICAL
15:45–16:45 PRACTICAL history                       17:00–18:00 FREE
18:00–19:00 MEAL
```

Four gates hold it honest: a curriculum line cannot sit outside its own track's
age band; a subject cannot be taught below its own minimum age; a learner
cannot be enrolled on a track whose band excludes them; and a tutor-delivered
track cannot be enrolled with no tutor named.

---

## F · Castle staff population model

24 named recurring staff, each with a persistent serial, a body lock, a voice,
a cognition profile, a status, a condition, a post with a rank, a work
assignment, a residence and a household. The roles the instruction named are
all present: guards, grooms, cart handlers, wheelwrights, smiths, masons,
carpenters, cooks, laundry, gardeners, herb workers, clerks, tutors, nurses and
caregivers, stable staff, cleaners, repair staff, messengers, merchants,
visitors, craft workers — plus governess, governor of studies, high steward,
keeper of records and page in the catalogue (26 occupations).

**On the instruction "do not make all workers Black, do not make all workers
white — build a natural population mix":** this is enforced structurally, and
kept off the work tables entirely.

- Appearance is declared as **tone bands on a ten-step scale**
  (`thyp_population_groups`, `POP-BAND-1` … `POP-BAND-6`), not as ethnic
  labels. The Chairman may rename, re-weight or repalette them.
- A cohort declares its **population mix**, and
  `thyp_cohort_population_mix` refuses the mix unless it sums to 100%, names at
  least two bands, and lets **none exceed 85%**. A monolithic crowd is an
  unwritable row.
- The mix belongs to the **cohort**, never to a job. **No table in this lane
  carries an appearance attribute on any work table** — verified by the
  readback, which counts appearance-like columns on `thyp_occupations`,
  `thyp_person_occupation` and `thyp_work_history` and gets **0**. The schema
  cannot express "this kind of work is done by this kind of person" even if
  someone tried.
- Hair texture and eye colour palettes are offered in full to every band by
  default, so nothing is stereotyped by assumption. Narrowing them is a canon
  decision, not a default.

The 60-person castle-works cohort produced, from its declared mix:

| Band | People | Share |
|---|---|---|
| POP-BAND-1 | 11 | 18.3% |
| POP-BAND-2 | 5 | 8.3% |
| POP-BAND-3 | 14 | 23.3% |
| POP-BAND-4 | 13 | 21.7% |
| POP-BAND-5 | 11 | 18.3% |
| POP-BAND-6 | 6 | 10.0% |

Six bands present, largest share 23.3%.

A post also has a minimum age, enforced: `OCCUPATION_MIN_AGE` refused staffing
a six-year-old to a forge. When the crowd generator draws a post a person is
too young for, it leaves them a household member instead of mis-staffing them.

---

## G · Crowd generation without random faces

`thyp_crowd_generate(cohort_code)` is a pure function of the cohort's recorded
seed. **`random()` is not called anywhere in this schema** — verified by the
readback, which scans every `thyp_*` function definition for it and gets **0**.

For each index `i`, everything is derived from `sha256(seed | cohort | i)`:
population band, occupation, age, birth date, household, height, weight,
shoulder, waist, head circumference, foot length, skin tone, hair colour, hair
texture, hair length, eye colour, handedness and five face-geometry ratios.

Each crowd person then receives:

- a serial from the **same registry** as a named person (`THY-C-000001` …);
- an identity row at tier `DETERMINISTIC_CROWD`, with a placeholder label and
  `name_state = 'PENDING_CHAIRMAN'` — a crowd person is unnamed, not nameless;
- a world character row with a disclosure, a birth date and an arithmetic-exact
  age;
- a sealed body lock, so they satisfy `BODY_LOCK`;
- a post and a work assignment where the age allows, so they satisfy `ROLE`;
- a household drawn from **registered** village or staff households, so they
  satisfy `LOCATION_REASON` and have a home before they have a face.

Guards that keep it honest:

- `thyp_crowd_cohorts.household_kinds` defaults to `{VILLAGE, STAFF_QUARTER}`.
  **The royal household is not a crowd pool** — a person does not become family
  by being generated near the family.
- `POPULATION_GROUP_UNREGISTERED` refuses a cohort naming an unregistered band,
  because an unregistered band is not reproducible.
- `CROWD_TIER_REQUIRED` refuses a crowd row for a person who is not tier
  `DETERMINISTIC_CROWD`. A crowd person cannot be quietly promoted into a named
  character by editing a field; a named recurring person is a separate,
  deliberate record.
- Re-running the generator creates **0** new people, and the derivation hash for
  index 0 still equals `sha256('THY-SEED-CASTLE-WORKS-0001|COH-CASTLE-WORKS|0')`.
  Same seed, same people, forever.

---

## H · Portrait continuity system

`thyp_portraits` cannot hold a generic royal portrait. Every one of these is
`not null` or check-constrained: a **specific subject**, the **age** depicted,
the **world date** depicted, the **body lock** the subject held then, the
**room** it hangs in, its **width, height and depth**, its **medium** and
**support material**, its **frame material**, its **version number**, and its
**provenance** — who made it (a person or a named reference) and who
commissioned it, with dates.

Checked rather than trusted, by trigger:

- `PORTRAIT_AGE_MISMATCH` — the claimed age must be the arithmetic of the
  subject's birth date at the depicted date.
- `PORTRAIT_BODY_LOCK_UNKNOWN` — the depicted body must be one the subject
  actually held, present in `thyp_body_lock_history`.
- `PORTRAIT_BODY_LOCK_NOT_YET_HELD` — and held **by** the date depicted. A
  portrait cannot show a body its subject did not yet have.
- `PORTRAIT_PLACE_INVALID` — a portrait hangs in a room, hall, wing, chapel,
  schoolroom or gatehouse, not in a road.
- `PORTRAIT_VERSION_SUBJECT_CHANGED` / `PORTRAIT_VERSION_NOT_FORWARD` — a new
  version replaces an earlier portrait of the **same** subject and moves
  forward. It never overwrites: the previous row stays.
- `thyp_portrait_provenance` refuses `update` and `delete`.
- `thyp_portrait_subjects` carries the further subjects of a group portrait,
  each still a specific person at a specific age with a lock they held.

One worked portrait is seeded — the high steward at his books, oil on oak
panel, 82.0 × 104.0 × 6.5 cm, carved oak frame with a dark wax finish, hung on
the north wall of the record room 145 cm from the floor, version 1, five
provenance events from commission to hanging.

**No royal portrait is seeded**, and not by omission: a portrait requires a lock
the subject actually held, and the royal family's locks are the Chairman's to
supply (§D, §L).

---

## I · Life / memory update rule

```
STATE(t+1) = STATE(t) + EVENTS + LEARNING + RELATIONSHIP_CHANGES
                      + PHYSICAL_AGING + WORK_HISTORY + MEMORY_WRITES
```

`thyp_advance_person(person_serial, to_world_date)` implements it and returns
what it applied. It counts the life events, learning advances, relationship
changes and memory writes falling in the interval; closes posts that ended and
writes them into `thyp_work_history`; moves `as_of_world_date` and recomputes
`age_years` from the birth date; re-enrols the learner when their age band moves
them to the next track and rebuilds their timetable; and reports the lot.

**No silent reset**, four ways:

1. `studio_character_state_ledger` refuses `update` and `delete` by trigger —
   `LEDGER_APPEND_ONLY`.
2. An `after update` trigger on `studio_world_characters` writes a ledger row
   with before and after state, so a **direct column write still leaves a
   trail**.
3. `STATE_REWIND_REFUSED` stops a person's state pointer moving backward in
   world time.
4. `LEARNING_REGRESSION` refuses a skill or subject level dropping with no
   recorded cause — an unhealed injury is the only accepted cause.

**Nothing is invented by ageing.** When the age changes, the body lock is
flagged `review_due` with a reason naming the change, rather than the function
guessing new dimensions. Growth is a Chairman decision; noticing that growth is
owed is the database's job.

Memory is gated on presence. `FIRSTHAND_WITHOUT_PRESENCE` refuses a firsthand
memory of a scene the person has no cleared snapshot in — a person cannot
remember a room they were never gated into. `MEMORY_SOURCE_REQUIRED` refuses a
told or overheard memory that names no source. `MEMORY_BEFORE_BIRTH` and
`KNOWLEDGE_BEFORE_BIRTH` / `KNOWLEDGE_BEFORE_EXISTENCE` refuse knowing things
too early. `GENERATION_ORDER` refuses a parent born after their child.

---

## J · What can be implemented now

All of it is written, validated and reviewable now; what follows is what it
does without any authority this build lacks.

1. **The gate is live and reports everything at once.**
   `thyp_visible_gate(scene, person)` returns all six factors of `P_visible`
   and **every** blocker in one call, each with a code, a plain-language detail
   and the route that fixes it. No round trip per problem.
2. **A filler person is unwritable.** `studio_scene_character_snapshots` rejects
   a row with any factor missing, and the trigger refuses a row whose body lock,
   age, time state, location reason or continuity reference does not resolve.
3. **The castle is populated and gated.** 92 registered people — 8 royal
   household, 24 named recurring staff, 60 deterministic crowd — 84 of them
   cleared into one courtyard scene, with the royal eight correctly blocked.
4. **Exact schedules exist.** 450 blocks for seven royal learners, generated
   from the curriculum by age.
5. **Crowds are reproducible.** Same seed, same people; regeneration adds none.
6. **Portrait continuity works end to end**, demonstrated on one portrait with
   full provenance.
7. **Life advance works**, demonstrated: the steward advanced two world years,
   ledger rows written, body lock flagged for review.
8. **Canon is not invented.** Religious and cultural state stays `NOT_DEFINED`
   for all 92 people, because `thyp_status_religion_canon` requires a named
   canonical source before a code may be stored. Unnamed people hold real
   serials with pending names.
9. **The Earth line is held.** No medical, biometric or precise-location column
   exists for a real person. A world character depicting a real person needs an
   explicit portrayal link; a link to a real **minor** cannot exist without
   recorded guardian consent; and simulated biology is refused outright while
   any active link records no consent.

---

## K · What requires new schema or migration

Everything in this lane is new schema. The apply itself is the migration, and
it is held:

| Item | State |
|---|---|
| `db/persons/0001…0010` | Written, validated on PostgreSQL 16.13, **not applied**. Production DDL is held for Chairman execution |
| The five Chairman-named tables | Created only if absent; columns added additively if a live table exists with another shape. **The live shape is unverified** (403 on CONNECT) |
| `pgcrypto` on the live backend | Required — `digest()` seals body locks and derives crowd people. Unverified |
| `thyp_` prefix collision on the live backend | Unverified |
| Any existing live person data | If the five tables already hold rows, they are kept. The guards add columns and never rewrite. The **post-apply readback** is what tells us what actually landed |

No migration is needed for anything the Chairman must still decide — those are
data, and §L names them.

---

## L · Exact next executable action

**One action, and it is the Chairman's:**

> Apply `db/persons/0001_person_identity_spine.sql` … `0010_seed_castle_population.sql`
> to `thylora-dash` in numeric order, one transaction per file, then run
> `db/persons/validation/readback.sql` and read section 14.

Then, in order, and nothing here needs an authority this build lacked:

1. **Supply the royal family's body locks** — height, weight, body dimensions,
   complexion, hair and face geometry for THY-P-0001 … THY-P-0008. This is the
   single item blocking royal imagery: eight `BODY_LOCK_ABSENT` verdicts clear
   the moment it lands, and it is deliberately the Chairman's to state.
2. **Confirm or replace the world date** in `thyp_world_clock` and the eight
   birth dates together. Ages are exactly as instructed at the current date;
   the calendar under them is `PROVISIONAL`.
3. **Name the two pending people** — the head of the royal household and the
   grandson aged 7 — by setting `display_name` and `name_state = 'CONFIRMED'`.
4. **State the family lineage** you want written, if any, beyond guardian and
   ward. `GENERATION_ORDER` will check it.
5. **Then, and only then, royal portraits.** With locks and dates confirmed,
   `thyp_portraits` will accept them, subject-linked, age-linked, room-linked,
   dimensioned, framed, versioned and provenance-recorded.
6. Optional, unblocked either way: more crowd cohorts per place and season;
   tone-band palettes narrowed from canon; `thyp_person_skills` and
   `thyp_knowledge_items` populated as the world's history is written.

**Do not:** generate any image for a person whose gate verdict is `BLOCKED`;
invent a complexion, a name, a birth date or a religion to unblock a row; apply
this DDL to production without Chairman execution; or edit
`dashboard-current-head.html`.

---

## 3 · Evidence

| Claim | Evidence |
|---|---|
| Migrations apply cleanly | All 10 applied to a fresh PostgreSQL 16.13 database: 47 tables, 50 RLS policies, 37 functions, 99 check constraints |
| Migrations are idempotent | Applied **three times** to the same database: no error, and identical counts each pass (92 people, 450 blocks, 84 snapshots, 5 provenance rows) |
| Constraints actually fire | **37 of 37 "expect reject" cases rejected by the database**, not by a comment |
| Reproducible | `db/persons/validation/run.sh` runs the whole check from a fresh database, **exit 0** |
| RLS coverage | `rls_disabled_tables = 0` across all 47 tables |
| A filler person is unwritable | `thyp_snapshot_p_visible` rejects a snapshot missing any factor; the trigger rejects `TIME_STATE_MISMATCH`, `BODY_LOCK_MISMATCH`, `BODY_LOCK_ABSENT`, `BODY_LOCK_ABSENT_FOR_DATE`, `AGE_STATE_MISMATCH`, `NO_LOCATION_REASON`, `CONTINUITY_REF_MISMATCH` |
| The gate reports everything at once | A not-yet-born person at an undated body state returns both `BODY_LOCK_ABSENT_FOR_DATE` and `NOT_YET_BORN` in one call |
| No later body in an earlier frame | `BODY_LOCK_ABSENT_FOR_DATE` on a 1450 scene for a person whose only sealed lock is 1487; `PORTRAIT_BODY_LOCK_NOT_YET_HELD` on the matching portrait |
| Age cannot drift | `thyp_character_age_arithmetic` rejected age 44 on a birth date implying 20; `PORTRAIT_AGE_MISMATCH` rejected a portrait claiming 99 for a 47-year-old |
| No monolithic crowd | `thyp_cohort_population_mix` rejected a single-group cohort and a 90% cohort; the 60-person cohort produced 6 bands, largest share 23.3% |
| Appearance is never tied to work | 0 appearance-like columns on `thyp_occupations`, `thyp_person_occupation`, `thyp_work_history` |
| Crowds are deterministic | 0 `thyp_*` functions call `random()`; regeneration creates 0 new people; index 0's derivation hash equals `sha256(seed\|cohort\|0)` |
| Crowd people are not family | `household_kinds` excludes `ROYAL` by default; the royal household holds exactly its 8 members, and all 60 crowd people have a village or staff household |
| No modern school is expressible | `thyp_instruction_mode` has 9 values, none a school |
| Schedules are exact and derived | 450 blocks generated for 7 learners; meals, rest, devotion and physical training never overwritten; overlap refused by `SCHEDULE_OVERLAP` |
| Education cannot be mis-assigned | `CURRICULUM_OUTSIDE_TRACK_BAND`, `SUBJECT_BELOW_MIN_AGE`, `ENROLMENT_AGE_OUTSIDE_TRACK`, `TUTOR_REQUIRED`, `OCCUPATION_MIN_AGE` all fired |
| History cannot be edited | `LEDGER_APPEND_ONLY` on update and on delete; `PROVENANCE_APPEND_ONLY` on update; a direct column write still writes a ledger row |
| Time does not run backward | `STATE_REWIND_REFUSED`; `LEARNING_REGRESSION` with no recorded cause |
| Memory is gated on presence | `FIRSTHAND_WITHOUT_PRESENCE`, `MEMORY_SOURCE_REQUIRED`, `KNOWLEDGE_BEFORE_BIRTH`, `GENERATION_ORDER` all fired |
| The Earth line is held | `PORTRAYAL_CONSENT_REQUIRED` refused simulated biology under an unconsented portrayal link; `thyp_portrayal_minor_guardian` refused a link to a real minor with no guardian consent |
| Canon is not invented | `thyp_status_religion_canon` refused a religion code with no canonical source; all 92 people read `NOT_DEFINED` |
| Ageing does not guess | `thyp_advance_person` advanced the steward 47 → 48 → 49 and returned `body_lock_review_due = true` with a reason, changing no dimension |
| No image generated | None. No image tool was called and no image asset was produced |

### Not measured, and not claimed

Live-backend compatibility, live query latency under load, and the shape of any
pre-existing live rows in the five named tables. All three need the backend host
and are named as blockers rather than estimated.

---

## 4 · Unresolved blockers

### B1 · Backend unreachable from the build session — **HARD** (unchanged from WR-RAELINK-001)
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the
egress proxy at 2026-09-18T05:40:34Z (organization policy denial).
Consequences: the live shape of the five Chairman-named tables could not be
verified; every reference to them is guarded; no live read or latency
measurement was possible. Validation *did* run — against local PostgreSQL
16.13, three times over, with behavioural checks committed alongside.
**Needs:** a session with egress to the backend host, or a Chairman-run apply
followed by `validation/readback.sql`.

### B2 · Production DDL is a held action — **BY RULE**
Applying `db/persons/0001…0010` mutates the production backend. Held for
Chairman execution. The files are complete and reviewable; nothing was applied.

### B3 · Royal family body locks — **CHAIRMAN DATA, HIGHEST PRIORITY**
Eight people are blocked from imagery on `BODY_LOCK_ABSENT`. Complexion, hair
and dimensions are the Chairman's to state; four of the eight map to real
children, and inventing their appearance was refused. This is the only item on
the critical path to royal imagery.

### B4 · World calendar is provisional — **CHAIRMAN DATA**
Ages are exactly as instructed. The world date (`1487-06-21`) and all eight
birth months and days are placeholders held `PROVISIONAL` in
`thyp_world_clock`. Replace the date and the birth dates together.

### B5 · Two people are unnamed — **CHAIRMAN DATA**
The head of the royal household and the grandson aged 7 hold real serials with
`name_state = 'PENDING_CHAIRMAN'`. No name was invented.

### B6 · Lineage beyond guardianship is unstated — **CHAIRMAN CANON**
Parent, sibling and grandparent links were not written because they were not
given. `GENERATION_ORDER` will check whatever is supplied.

### B7 · Tone bands are a neutral default — **CHAIRMAN CANON**
`POP-BAND-1` … `POP-BAND-6` are tone bands on a ten-step scale, with full hair
and eye palettes offered to every band. This is the least assumption-laden
default available; narrowing or renaming them is a canon decision.

---

## 5 · QYRIS gap report

Inspections against every design decision. **Routed** means removed or handled
in this delta; **held** means it needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A person could be placed in a frame with no identity, role, reason, body, time state or continuity | **Routed** — `thyp_snapshot_p_visible` + `thyp_snapshot_gate` block on all six and name the route for each |
| 1b | Missing prerequisite | Learning the blockers one at a time | **Routed** — `thyp_visible_gate` returns *every* unmet factor in one call |
| 1c | Missing prerequisite | A snapshot *declaring* a body lock, age or reason it does not have | **Routed** — each claim is resolved against the world, not trusted |
| 2 | Hidden handoff | State advancing with no record of what changed | **Routed** — `studio_character_state_ledger` is append-only and written by trigger, so a direct column write still leaves a trail |
| 2b | Hidden handoff | A person silently aged or de-aged between scenes | **Routed** — age is the arithmetic of the birth date at the depicted date, checked in three places |
| 2c | Hidden handoff | A person's *present* body appearing in a *past* scene | **Routed** — found by probing the seeded world during this build. `thyp_body_lock_at` resolves the lock held at the scene's date through `thyp_body_lock_history`; `BODY_LOCK_ABSENT_FOR_DATE` and `PORTRAIT_BODY_LOCK_NOT_YET_HELD` refuse the rest |
| 3 | Authority mismatch | A browser session able to invent a person or move a body lock | **Routed** — RLS on all 47 tables, no write policy for any client role, and every mutating function revoked from `anon` / `authenticated` |
| 3b | Authority mismatch | A crowd person promoted to family by editing a field | **Routed** — `CROWD_TIER_REQUIRED`, and `household_kinds` excludes `ROYAL` from crowd pools |
| 3c | Authority mismatch | A world character presented as an Earth person | **Routed** — `thyp_character_world_truth` forces `WORLD_SIMULATED` plus a disclosure, mirroring `rael_channels_world_truth` |
| 4 | Evidence gap | Continuity assertable with no proof | **Routed** — the body lock is a sha256 over every appearance column, computed by trigger, so sameness is a comparable value |
| 4b | Evidence gap | Live backend shape unverifiable | **Partly routed, remainder held → B1.** Routed: validated end to end on PostgreSQL 16.13 three times by a committed harness; guarded creates and soft references make a wrong assumption degrade instead of corrupt; a readback script says what actually landed. Held: live-backend compatibility |
| 5 | Unnecessary waiting | Nothing usable until the Chairman supplies every field | **Routed** — 84 of 92 people are cleared and usable now; the 8 who are not are blocked for a stated reason with a named route |
| 5b | Unnecessary waiting | One missing table blanking everything | **Routed** — `to_regclass` guards and exception-wrapped FKs; a missing or differently-shaped target degrades one reference |
| 6 | Creator friction | "Not ready" with no reason | **Routed** — every blocker carries a code, a plain-language detail and a route |
| 6b | Creator friction | A schedule that collides with meals or itself | **Routed** — `SCHEDULE_OVERLAP`; meal, rest, devotion, service and physical slots are never overwritten |
| 7 | Rights / privacy risk | Real children's complexion, weight and blood type invented to fill a schema | **Routed, and it cost a feature.** No royal body locks were seeded; `thyp_bio_profile` is `simulated_only` and refused under an unconsented portrayal link; a portrayal link to a real minor cannot exist without recorded guardian consent. The consequence — 8 people blocked from imagery — is carried openly as B3 rather than papered over |
| 7b | Rights / privacy risk | A real person's medical record drifting into world records | **Routed** — no medical, biometric or precise-location column exists for an Earth person; the Earth side holds identity and consent only |
| 7c | Rights / privacy risk | Simulated world people mistaken for real people | **Routed** — disclosure required on every character, and `world_status` cannot be `EARTH_REAL` |
| 7d | Rights / privacy risk | The workforce encoding "this work is for this kind of person" | **Routed** — appearance lives on cohorts and tone bands only; 0 appearance columns on any work table; the mix must name ≥2 bands with none above 85% |
| 8 | Continuity opportunity | Portraits as generic set dressing | **Routed** — a portrait cannot exist without a specific subject, age, date, room, dimensions, frame, medium, version and provenance |
| 8b | Continuity opportunity | A new portrait overwriting the old | **Routed** — `version_no` + `replaces_portrait_serial`; the predecessor row stays |
| 9 | Failure / recovery | A crowd regenerating into different faces | **Routed** — no `random()`; every attribute derives from `sha256(seed\|cohort\|index)`; regeneration adds 0 people |
| 9b | Failure / recovery | Re-running the seed duplicating rows | **Routed** — found during this build: `thyp_portrait_provenance` had no uniqueness and doubled to 10 rows on the second pass. Unique index added; three passes now give identical counts |
| 9c | Failure / recovery | Crowd people drawn into the royal household | **Routed** — found by the readback during this build: 5 crowd people had been assigned to `THY-H-0001`. `household_kinds` now defaults to village and staff quarters; the royal household holds exactly its 8 members |
| 9d | Failure / recovery | Ageing silently resizing a person | **Routed** — `review_due` is flagged with a reason; no dimension is guessed |
| 9e | Failure / recovery | A person remembering a scene they were never in | **Routed** — `FIRSTHAND_WITHOUT_PRESENCE` |

**31 gaps inspected · 29 routed or removed · 1 partly routed · 1 held against a
named blocker.** Three of them (2c, 9b, 9c) were found by probing the seeded
world during this build rather than by reading the diff, and all three are
fixed with a behavioural check committed alongside.

---

## 6 · Handoff to backend

**To:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`) · Chairman execution
**From:** WR-PERSONS-001 · branch `claude/thylora-character-continuity-0nf5dq`
**Continuity reference carried by every person and scene:** `THY-WORLD-CONTINUITY-FLOOR-001`

### What to apply

```
db/persons/0001_person_identity_spine.sql
db/persons/0002_person_state.sql
db/persons/0003_place_household_work.sql
db/persons/0004_education_model.sql
db/persons/0005_scenes_visibility_crowd.sql
db/persons/0006_life_continuity.sql
db/persons/0007_portrait_continuity.sql
db/persons/0008_functions.sql
db/persons/0009_rls_policies.sql
db/persons/0010_seed_castle_population.sql
```

Numeric order, one transaction per file. Each file is idempotent; re-applying is
safe and was proven three times over.

### What it will create

47 tables, 37 functions, 50 RLS policies, 99 check constraints. Of the tables,
five carry the names the Chairman gave and are created **only if absent**; the
other 42 are new and prefixed `thyp_`. Nothing existing is dropped, renamed or
rewritten, and no `rael_*` object is touched.

### What it will seed

A world clock (provisional), 1 realm, 1 settlement, 3 neighbourhoods, 1 market,
and a castle of 27 rooms, halls, yards and workshops (33 places in all), 26 occupations, 14 households, 19 education
subjects, 10 tracks, 83 curriculum lines, 276 day-template blocks, 6 population
tone bands, 92 people (8 royal household, 24 named recurring staff, 60
deterministic crowd), 450 schedule blocks, 1 scene with 84 cleared snapshots,
and 1 portrait with 5 provenance events.

### Pre-apply checks the apply cannot do for itself

1. Live Postgres version.
2. `pgcrypto` present — `digest()` seals body locks and derives crowd people.
3. Whether any of the five named tables already exists, and its shape.
4. Whether anything already uses the `thyp_` prefix.

### Verify readback

```
psql -f db/persons/validation/readback.sql
```

Fourteen checks, read-only. Expected on a clean apply:

| # | Check | Expect |
|---|---|---|
| 1 | Objects present | 47 tables · 37 functions · 50 policies · **0** RLS-disabled tables |
| 2 | The five named objects | all five `PRESENT` |
| 3 | Royal household | 8 rows; ages 24, 18, 16, 12, 10, 7, 6 and one undated head; 2 rows `PENDING_CHAIRMAN` (the head and the grandson); body lock column reads `AWAITING CHAIRMAN` on all 8 |
| 4 | Workforce | every listed occupation shows ≥1 person, split named-persistent vs deterministic-crowd |
| 5 | Population mix | 6 bands present, largest share 23.3% |
| 6 | Appearance on work tables | **0** |
| 7 | `random()` in this lane | **0** |
| 8 | Instruction modes | 9 values, **none** a modern school |
| 9 | One child's day | 10 blocks: devotion, meal, three lessons, meal, physical, practical, free, meal |
| 10 | Scene gate | 84 `CLEARED`; the royal 8 `BLOCKED` on `BODY_LOCK_ABSENT` |
| 11 | Portrait | 1 row, all required fields populated, 5 provenance events |
| 12 | Ledger | append-only triggers = 2 |
| 13 | Serial registry | `PERSON_WORLD` 32 · `CROWD_PERSON` 60 · `HOUSEHOLD` 14 · `PORTRAIT` 1 · **0 retired** |
| 14 | Still awaiting the Chairman | world date `PROVISIONAL` · **2** royal household with a pending name · **24** staff identified by role, not yet named · 60 crowd people unnamed by design · **8** royal household without a body lock, blocked from imagery |

**Readback performed on the validated local instance, 2026-09-18:** every one of
the fourteen matched the table above. The same script is what confirms the live
apply; until it runs there, §K's unverified rows stay unverified.

**If readback section 3 or 10 shows a royal family member cleared rather than
blocked, stop.** It means a body lock was supplied from somewhere other than the
Chairman, and that is the one thing this lane exists to prevent.

---

## 7 · Restart vector

If this work resumes cold, start here:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`,
   `workrooms/WR-RAELINK-001.md`, this file, `db/persons/README.md`.
2. **Verify the floor:** `sudo service postgresql start && db/persons/validation/run.sh`
   → expect exit 0, 47 tables, 50 policies, 99 check constraints, and 37 of 37
   reject cases rejected. Then `npm test` → expect 48 passing (RAE Link,
   untouched by this delta).
3. **Check blocker B1 first.** Try the backend host. If reachable, the next
   executable action is to **read the live shape** of the five Chairman-named
   tables and record it here.
4. **If the Chairman has applied the migrations:** run
   `db/persons/validation/readback.sql` and compare against §6's table. Then the
   next work is B3 — the royal family's body locks.
5. **If not applied:** everything is still reviewable and the harness still
   proves it. Nothing further can land without the apply.
6. **Do not:** generate an image for a person whose gate verdict is `BLOCKED`;
   invent a complexion, name, birth date, lineage or religion to unblock a row;
   apply DDL to production without Chairman execution; create a dashboard here;
   or edit `dashboard-current-head.html`.

---

## 8 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Schema | Written · **validated on PostgreSQL 16.13** · idempotent over three passes · **not applied to the live backend** (B1, B2) |
| Seed | 92 people · 84 cleared for imagery · 8 blocked for a stated reason |
| Gate | Live. `P_visible` enforced by constraint and trigger, not by document |
| Crowds | Deterministic. No `random()` anywhere in the lane |
| Education | Period-appropriate by construction. No modern school is expressible |
| Portraits | System complete · 1 worked example · royal portraits held on B3 |
| Life continuity | `STATE(t+1)` implemented · ledger append-only · no rewind |
| Chairman data owed | B3 body locks · B4 calendar · B5 two names · B6 lineage · B7 tone bands |
| Image generation | **None.** No image was generated |
| Baseline regression | **None.** No baseline capability removed, renamed or disconnected |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
NO PERSON APPEARS WITHOUT AN IDENTITY THAT SURVIVES THE FRAME.
