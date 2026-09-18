# THYLORA Persons database migrations

Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). These files are the
reviewable schema for world person continuity. **They are not applied by this
repository.** Applying DDL to the live backend is a production mutation and is
held for Chairman execution.

Purpose, in one line: **end random filler people.** Every visible person in
THYLORA world imagery must resolve to a persistent identity or an approved
deterministic crowd-person identity, and the database refuses the alternative.

## Apply order

| File | Contents |
|---|---|
| `0001_person_identity_spine.sql` | Serial registry, identity, Earth portrayal links, guardian rule |
| `0002_person_state.sql` | World characters, body lock (hashed), voice, simulated biology, cognition, status, condition, injuries, wardrobe, possessions |
| `0003_place_household_work.sql` | Places, households, occupation catalogue, assignments, schedules |
| `0004_education_model.sql` | Tracks, subjects, curriculum by age band, day templates, enrolment, progress — seeded |
| `0005_scenes_visibility_crowd.sql` | Scenes, visit grants, location-reason resolver, scene snapshots with the `P_visible` gate, crowd cohorts, crowd persons |
| `0006_life_continuity.sql` | Relationships, skills, knowledge, memory ledger, life events, work history, append-only state ledger |
| `0007_portrait_continuity.sql` | Body lock history, portraits, group subjects, append-only provenance |
| `0008_functions.sql` | Population groups, gate, scene clearing, schedule builder, deterministic crowd generation, `STATE(t+1)`, readback |
| `0009_rls_policies.sql` | Row level security across every table in the lane |
| `0010_seed_castle_population.sql` | World clock, castle and settlement, workforce, royal household, named staff, one crowd cohort, one scene, one portrait |

Run in numeric order in one transaction per file.

## The five Chairman-named objects

`thylora_person_serial_registry`, `thylora_person_identity`,
`studio_world_characters`, `studio_scene_character_snapshots` and
`studio_character_state_ledger` were named in the instruction and were **not
found in this repository**. They may exist on the live backend, which this
session could not reach. Each is therefore:

1. created only if absent, with the full documented shape;
2. topped up column by column with `add column if not exists`, so a live table
   of a different shape **gains** the continuity columns instead of colliding;
3. never dropped, renamed or rewritten;
4. referenced by foreign keys only inside exception blocks — a shape mismatch
   degrades to a soft reference with a `notice`, it does not fail the migration.

Everything new is prefixed `thyp_`. No existing object in this repository uses
that prefix.

## Design rules held throughout

1. **Additive only.** Every object is new. Nothing is dropped or rewritten.
2. **A person with no reason cannot be written.** `P_visible = IDENTITY ×
   ROLE × LOCATION_REASON × BODY_LOCK × TIME_STATE × CONTINUITY` is a check
   constraint plus a trigger on `studio_scene_character_snapshots`, not a note
   in a document. A missing factor is a rejected row.
3. **Claims are resolved, not trusted.** A snapshot may *state* a body lock, an
   age and a location reason; the trigger checks each one against the world and
   refuses the row if any is untrue.
4. **Age is arithmetic.** `age_years` must equal the birth date evaluated at the
   date being depicted, in the character row, the scene snapshot and the
   portrait. Nobody is quietly aged or de-aged.
5. **The body lock is dated.** A scene or portrait is checked against the lock
   the person held *at that world date*, resolved through
   `thyp_body_lock_history`. A later body cannot appear in an earlier frame.
6. **No `random()`.** It is not called anywhere in this schema. Every crowd
   person is a pure function of `(cohort seed, index)`: regenerate and the same
   people return with the same serials, households, posts and bodies.
7. **No monolithic crowd.** A cohort's population mix must sum to 100%, name at
   least two groups, and let none exceed 85%. The mix belongs to the cohort.
   **No table in this lane links appearance to work** — the schema cannot
   express "this kind of work is done by this kind of person."
8. **No modern school.** The instruction-mode enum has no modern-school value.
   What exists is household tutoring, a household schoolroom, apprenticeship,
   guild or master learning, grammar-style instruction, noble household service
   and practical observation.
9. **No silent reset.** `studio_character_state_ledger` and
   `thyp_portrait_provenance` refuse `update` and `delete` by trigger. A direct
   column write on `studio_world_characters` still leaves a ledger row, and a
   person's state pointer cannot move backward in world time.
10. **Nothing invented to fill a row.** An unnamed person holds a real serial
    with `name_state = 'PENDING_CHAIRMAN'`. Religious and cultural state is
    written only where canonically defined. Ageing flags the body lock for
    review rather than guessing new dimensions.
11. **Fictional records, and the Earth line held.** World characters are
    simulated world character records. Nothing asserts they are conscious. A
    world character that depicts a real person carries an explicit portrayal
    link; a link to a real minor cannot exist without recorded guardian
    consent, and simulated biological attributes are refused while any active
    link records no consent.
12. **Access is not authority.** Reading the world does not grant writing it.
    Every mutating function is revoked from `anon` and `authenticated`.

## Validation

`validation/run.sh` applies all ten files to a throwaway local database —
twice, to prove idempotency — then runs `validation/behaviour.sql`, which
asserts that each rule rejects what it claims to reject.

```
sudo service postgresql start
db/persons/validation/run.sh
```

Result on PostgreSQL 16.13, 2026-09-18: **exit 0**. 47 tables, 50 RLS policies,
37 functions, 99 check constraints, 0 tables with RLS disabled. 92 registered
people (8 royal household, 24 named recurring staff, 60 deterministic crowd),
450 schedule blocks, 84 cleared scene snapshots, 1 portrait with 5 provenance
events. **37 of 37 "expect reject" cases rejected by the database**, not by a
comment. Applied three times over: identical counts each pass.

`validation/readback.sql` is the readback to run **after** applying to the live
backend. It reads only and prints fourteen checks the Chairman can verify by
eye, including which people are still blocked from imagery and why.

`validation/supabase_stub.sql` is reused from `db/rae-link/validation/` — it
creates a minimal `auth.users`, `auth.uid()` and the `anon` / `authenticated`
roles so the migrations run outside Supabase. It is scaffolding only and is
never applied to a real backend.

## Verification still owed

Validation ran on PostgreSQL 16.13 locally, not on the live backend.
`jvsdxhrfhtlgaknhjxlz.supabase.co:443` returned **403 on CONNECT** from the
egress proxy on 2026-09-18 — the same denial recorded as blocker **B1** in
`workrooms/WR-RAELINK-001.md`. Before applying, confirm on the live backend:

1. the live Postgres version;
2. that `pgcrypto` is available (`digest()` is used to seal body locks and to
   derive crowd people);
3. whether `thylora_person_identity`, `thylora_person_serial_registry`,
   `studio_world_characters`, `studio_scene_character_snapshots` or
   `studio_character_state_ledger` already exist, and with what shape — the
   guards degrade safely, but the resulting shape should be read back;
4. that no existing object already uses the `thyp_` prefix.
