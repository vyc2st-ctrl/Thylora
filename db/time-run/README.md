# Time Run database migrations

Head: **THY-WORK-TIME-RUN-OPS-VERONICA-582**
Authoritative run: **THY-TIME-RUN-001**
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

These files are the **reviewable** schema for Time Run operations. **They are not
applied by this repository.** Applying DDL to the live backend is a production
mutation and is held for Chairman execution.

## The four canonical registries are not redefined here

`thylora_time_run_registry`, `thylora_time_run_host_rules`,
`thylora_time_run_events` and `thylora_time_run_award_catalog` already exist and
remain the registries of record. Nothing in `db/time-run/` creates, drops,
renames or rewrites them. They are reached only through the guarded soft
resolution in `0013_functions_registry_link.sql`, which uses `to_regclass` and
never assumes a column name.

The live schema could not be inspected from this build session — the backend
host is not reachable under the session egress policy (`curl` exit 56). That is
the same condition recorded for the RAE Link build, and it is why there is not a
single blind foreign key from `thytr_*` into an existing THYLORA table.

## Apply order

| File | Contents |
|---|---|
| `0001_run_core.sql` | Era profiles, runs, legs, stops, rest days |
| `0002_team_crew.sql` | Teams, 20 crew roles, crew slots, helpers/workers/local hires |
| `0003_vehicles_animals.sql` | Vehicle classes, vehicles, repair caravan, repair events, animals, animal care |
| `0004_host_lodging.sql` | Host communities, host homes, 10 host-home rules, lodging |
| `0005_logistics.sql` | Money conversion and ledger, clothing, provisions, communications, weather and road, medical, security |
| `0006_help_ledger.sql` | Help kinds, help orders with consent and anti-extraction locks, emergency lane |
| `0007_living_time.sql` | Capability gate, cross-era encounters, cross-era disclosure |
| `0008_death_recovery.sql` | Death record (final), 14-stage body return / recovery protocol |
| `0009_person_lane.sql` | Persons, relations, first-meeting guard, the closed locket, origin/household tables |
| `0010_person_seed.sql` | Veronica Hall origin sequence and arrival; household stances |
| `0011_awards_voting.sql` | 14 award classes, viewer voting, people voting, results |
| `0012_rls.sql` | Row level security across all `thytr_*` tables |
| `0013_functions_registry_link.sql` | App-room read functions, guarded registry links |
| `0014_run_001_seed.sql` | Era profiles, vehicle classes, comm channels, THY-TIME-RUN-001 |

Run in numeric order, one transaction per file.

## Locks the schema enforces, not just documents

| Lock | Where |
|---|---|
| Death cannot be undone, deleted, or made reversible | `thytr_death_is_final()` triggers, `0008` |
| Returning a body does not return a life | `thytr_recovery.restores_life` locked false, `0008` |
| Recovery stages run forward, one at a time, through blocking gates | `thytr_recovery_advance()`, `0008` |
| A returning body travels with two escorts, never one | `THYTR-REC-005`, `0008` |
| The host community is answered before any era is left | `THYTR-REC-003`, `0008` |
| Later-era capability cannot be recorded as functioning | `thytr_capability_gate()`, `0007` |
| No first meeting between Vyctor Ebeneezer and Inés Morales | `thytr_no_first_meeting_regression()`, `0009` |
| Kinship degree between Inés and Veronica is not stored | `0009`, relation `KINSHIP_EXISTS_DEGREE_UNKNOWN` |
| The locket has no contents column | `thytr_sealed_object`, `0009` |
| Help is never invoiced to the people helped | `payment_taken_from_local` locked false, `0006` |
| Local labour is never unpaid | `local_labour_unpaid` locked false, `0006` |
| Standing is never lost for stopping to preserve life | `run_standing_lost` locked false, `0006` |
| A host community may withdraw at any time | `may_withdraw_anytime` locked true, `0004` |
| Escorts never police host communities | `policing_local_people` locked false, `0005` |
| A meeting that happened entered history | `became_history` locked true, `0007` |
| Branch universes are not created automatically | `branch_universe_created` locked false, `0007` |
| Something said is not unsaid | `disclosure.reversed` locked false, `0007` |
| The street people of Veronica's origin are not named | `names_invented`, `named_person` locked false, `0009` |

## Validation

`db/time-run/validation/run.sh` applies every migration twice against a
throwaway local PostgreSQL database — never the THYLORA backend — and then runs
`behaviour.sql`, which attempts each forbidden act in turn. An `ERROR` line in
that section is the **passing** result.

```
sudo service postgresql start
db/time-run/validation/run.sh
```

Result on this branch: **14/14 migrations apply cleanly, 14/14 apply again
idempotently, and all 30 behavioural checks land as expected** — 24 refusals
raised and 6 permitted acts accepted (knowledge carried backward, a continued
acquaintance between Vyctor and Inés, the one open first meeting with Veronica,
a clean double-verified help order, a reviewed vote round, and a full escorted
recovery reaching stage D10).

The harness found and fixed two real defects before this branch was pushed:

1. `thytr_recovery_two_escorts` used `is distinct from`, which is false for two
   nulls — so a recovery could not be opened at all, since escorts are
   legitimately null until stage D8. Now null-tolerant, and the D8 trigger
   rejects two escorts that are the same person.
2. `thytr_money_conversion` and `thytr_death` left their two-role columns
   nullable while a `distinct from` check silently required both. Those columns
   are now `not null`, which is what the rule actually means.

## Design rules held throughout

1. **Additive only.** Every object is new and prefixed `thytr_`.
2. **No second source of truth.** Registry, host rules, events and award catalogue
   stay where they already live; `thytr_*` holds a soft `*_ref` text column.
3. **Soft references, not blind foreign keys.** Nothing hard-links to a table
   whose shape is unverified.
4. **Money is integer minor units,** per era unit. No floating point money.
5. **Two people, never one,** for money conversion, death confirmation and body
   escort. Initiation and witness are separate roles.
6. **Sealed means no read policy,** not a flag a client can ignore. Persons,
   relations, origin beats, the locket, deaths and recoveries have no client
   select policy at all.
7. **Every write is service-role.** No client insert, update or delete policy is
   created anywhere in this schema.
