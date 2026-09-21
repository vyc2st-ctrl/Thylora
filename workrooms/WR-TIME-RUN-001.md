# WR-TIME-RUN-001 · Time Run operations

**Head:** `THY-WORK-TIME-RUN-OPS-VERONICA-582`
**Sequence:** 582
**Authoritative run:** `THY-TIME-RUN-001` · 1700s road lane
**App room:** `/app/time-run.html`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-time-run-ops-rtzonr`
**Opened:** 2026-09-21

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment
  authority for the Chairman dashboard. Authority remains
  `vyc2st-ctrl/thylora-executive-dashboard` → `thylora-public-world`.
  **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`.
  **No baseline capability was removed, renamed or disconnected.**
- `app/` Build 7 and `rae-link/` were changed **additively only**. The existing
  Time Run room keeps every section it had; `app/time-run.js` is byte-unchanged.
- The four canonical Time Run registries are **not redefined**:
  `thylora_time_run_registry`, `thylora_time_run_host_rules`,
  `thylora_time_run_events`, `thylora_time_run_award_catalog`.

### Backend read attempted and refused

The four registries were read first, as directed. The backend host is **not
reachable from this build session** — `curl` exit 56 against
`jvsdxhrfhtlgaknhjxlz.supabase.co`, the same egress condition recorded in
`db/rae-link/README.md`. Consequently:

- Nothing in `db/time-run/` hard-links to a registry whose live shape is
  unverified. Every link is a soft `*_ref` text column resolved through
  `to_regclass`-guarded functions in `0013_functions_registry_link.sql`.
- Time Run was **not rediscovered or reinvented.** The canon carried forward
  is the canon already in the room at `app/time-run.html` and in the head
  directive, made operational rather than restated.

---

## 2 · Execution delta

### Added — backend schema (reviewable, **not applied**)

`db/time-run/` — 14 numbered migrations, ~48 tables, 6 functions, 4 triggers.

| File | Contents |
|---|---|
| `0001_run_core.sql` | Era profiles, runs, legs, stops, rest days |
| `0002_team_crew.sql` | Teams, 20 crew roles, crew slots, helpers/workers/local hires |
| `0003_vehicles_animals.sql` | Vehicle classes, vehicles, repair caravan, repair events, animals, animal care |
| `0004_host_lodging.sql` | Host communities, host homes, 10 host-home rules, lodging |
| `0005_logistics.sql` | Money conversion and ledger, clothing, provisions, comms, weather/road, medical, security |
| `0006_help_ledger.sql` | Help kinds, help orders with consent and anti-extraction locks, emergency lane |
| `0007_living_time.sql` | Capability gate, cross-era encounters, cross-era disclosure |
| `0008_death_recovery.sql` | Death record (final), 14-stage body return protocol |
| `0009_person_lane.sql` | Persons, relations, first-meeting guard, the closed locket |
| `0010_person_seed.sql` | Veronica Hall origin sequence, arrival, household stances |
| `0011_awards_voting.sql` | 14 award classes, viewer voting, people voting, results |
| `0012_rls.sql` | Row level security across every `thytr_*` table |
| `0013_functions_registry_link.sql` | App-room read functions, guarded registry links |
| `0014_run_001_seed.sql` | Era profiles, vehicle classes, comm channels, THY-TIME-RUN-001 |

### Added — app room delta (additive)

| File | Change |
|---|---|
| `app/lib/time-run-ops.mjs` | **New.** Crew, money, capability gate, help validation, death/recovery state machine, relations, awards. 28 exports. No DOM, no network. |
| `app/time-run-room.js` | **New.** Module. Renders the visible QYRIS stamp and eight new operations sections from the same rules the tests read. |
| `app/time-run.html` | **Additive only.** QYRIS stamp section + 8 sections (`#operations`, `#crew`, `#vehicles`, `#hosting`, `#helping`, `#technology`, `#recovery`, `#award-classes`) + 6 hero links + 1 module script tag. Every pre-existing section, id and script is intact. |
| `app/time-run.css` | **Appended only.** Qyris stamp, ops map, role groups, capability columns. No existing selector changed. |
| `app/time-run.js` | **Unchanged.** Still the sole reader of `thylora_time_run_host_rules`. |

### Added — SQL validation harness

`db/time-run/validation/` — `run.sh`, `supabase_stub.sql`, `behaviour.sql`.
Applies all 14 migrations twice against a throwaway local PostgreSQL database
and then attempts every forbidden act.

**Result: 14/14 apply clean, 14/14 idempotent, 30/30 behavioural checks land as
expected** (24 refusals raised, 6 permitted acts accepted). The harness found
and fixed two real defects before push:

1. `thytr_recovery_two_escorts` used `is distinct from`, false for two nulls, so
   no recovery could be opened at all — escorts are legitimately null until D8.
   Now null-tolerant, and D8 additionally rejects two escorts who are the same
   person.
2. `thytr_money_conversion` and `thytr_death` left their two-role columns
   nullable while a `distinct from` check silently required both. Now `not null`.

### Added — tests

`tests/time-run-ops.test.mjs` — **49 tests.** Suite total **97 passing**
(`npm test`), up from 48, with no existing test modified.

Coverage: crew readiness and command redundancy · local-hire fairness ·
integer money and two-role conversion · capability gate both directions ·
help-order consent, payment and double verification · death finality ·
all seven recovery gates · a full 14-stage origin-era return · local interment
as a complete outcome · no first meeting Vyctor/Inés · the one open first
meeting Vyctor/Veronica · sealed kinship degree · closed locket · no automatic
branch universe · award classes not speed-weighted · viewer and people votes
never summed · standing suspended not lost.

### Added — documentation

`docs/TIME-RUN-OPERATIONS.md` · `docs/TIME-RUN-LIVING-TIME.md` ·
`docs/TIME-RUN-PERSON-LANE.md` · `db/time-run/README.md` · this workroom.

---

## 3 · Exact Chairman decisions taken

Decisions made to finish the operations map, each reversible by seal.

| # | Decision | Why | Reverse by |
|---|---|---|---|
| D1 | **Team size band 8–26.** | 8 is the minimum that can move and repair a caravan safely. 26 is where lodging and feeding stop being absorbable by an ordinary host community. | Re-seal `thytr_team_size_planned` bounds in `0002`. |
| D2 | **20 crew roles, 15 required for READY, minimum ready crew 20.** | Every named operational need in the directive has exactly one owning role. | Edit `thytr_crew_role.required_for_ready`. |
| D3 | **Command is two roles, never one.** | Mirrors the existing protection-architecture rule already in the room: no single point of failure. | Not recommended. |
| D4 | **The witness keeper cannot hold command.** | The keeper of the help and money ledgers is not the person whose standing those ledgers decide. | Not recommended. |
| D5 | **Seven vehicles per full 1700s team.** | Lead, passenger, freight, repair caravan, feed and water, kitchen, medical. | Add classes in `0014`. |
| D6 | **The medical cart is the recovery transit vehicle and is not award eligible.** | It should never be built to win anything. | `thytr_vehicle_class.award_eligible`. |
| D7 | **14 award classes, none speed-weighted.** | Directive: many award classes, safe speed only, preserve life before competition. | Chairman seal required for any speed-weighted class. |
| D8 | **Viewer votes and people-of-the-era votes are separate columns, never summed.** | Two publics with two different stakes. | Not recommended. |
| D9 | **Recovery protocol is 14 stages, D0–D13.** | Built to the directive's "exact return/recovery protocol". | Re-seal `thytr_recovery_stage`. |
| D10 | **The host community is answered before any message leaves for another era (D5).** | The people standing in front of the team come before the people who are not. | Not recommended. |
| D11 | **Two escorts for a returning body, never one.** | Custody integrity, and the weight of it on one person. | Not recommended. |
| D12 | **Local interment is a complete disposition, not a failure.** | A community that asks to keep its dead is not obstructing the Run. | Not recommended. |
| D13 | **Money is integer minor units per era unit; conversion needs two distinct roles.** | Same rule already held in RAE Link. Period money is the largest quiet lever on a local economy. | Not recommended. |
| D14 | **Sealed person data has no client read policy at all.** | Persons, relations, origin beats, the locket, deaths, recoveries and conversions are service-role only. A flag can be ignored; an absent policy cannot. | Chairman seal. |
| D15 | **Veronica's street community stays unnamed, enforced by a locked column.** | Directive: do not invent names for the people she lived among *yet*. | Chairman seal when the names are ready. |
| D16 | **Household objectors and supporters are recorded by role, not by name.** | Same reason. Keeps the conflict real without inventing people. | Chairman seal. |
| D17 | **Vyctor keeps silence in the encounter, recorded as `SILENCE_KEPT`.** | Disclosure is permitted in this world; choosing not to disclose is a recorded act, not an absence. | Chairman seal. |
| D18 | **`kinshipDegree()` returns a seal, not a null.** | An absent value invites someone to fill it. A seal does not. | Not recommended. |

---

## 4 · Held without modification

- Crown invite-only privilege; Crown as caretaker, not ruler.
- Host homes and communities; a host may withdraw at any time.
- Teams; helpers and workers; local helpers paid in era money.
- Multiple era-specific vehicles; era-specific laws, money and travel.
- Safe speed only; help people; no exploitation; preserve life before competition.
- Viewer voting; people voting; vehicle awards; many award classes.
- Real friendships; corruption still exists and is recorded, not laundered.
- 1700s buggy events; historic horse events; motor-era events; disaster-response lane.
- All eras alive; visitors physically enter; meetings become history; cross-era
  speech permitted; **no automatic branch universes.**
- Death real and final; body may return; **death not undone.**
- Destination-era capability governs technology; identity, memory, knowledge and
  experience carry backward.
- **No first meeting between Vyctor Ebeneezer and Inés Morales.**
- **Kinship degree Inés ↔ Veronica unknown; locket closed.**
- Reference image is reference only. **No image generation performed.**
- **No new random people created anywhere in this delta.**

---

## 5 · Writeback

Nothing was written to the live backend. Writeback is held for Chairman
execution and consists of exactly four acts:

1. **Apply `db/time-run/0001` → `0014`** in numeric order, one transaction per
   file, against `thylora-dash`.
2. **Reconcile the soft refs.** Once `thylora_time_run_registry`,
   `thylora_time_run_host_rules`, `thylora_time_run_events` and
   `thylora_time_run_award_catalog` can be inspected, replace the guarded text
   refs with real keys where — and only where — the live column shapes support
   it. `thytr_host_home_rule.host_rules_ref` and
   `thytr_award_class.catalog_ref` are the two that matter first.
3. **Release the public rows.** Set `public_release = true` on the host-home
   rules and award classes intended for the room. The room reads only released
   rows; nothing internal leaks by default.
4. **Seal the years.** `thytr_era_profile.years_sealed` is false for all four
   eras. Exact event years remain open until the Chairman seals them per run.

Nothing in steps 2–4 requires a code change.

---

## 6 · Restart point

**Restart from:** `WR-TIME-RUN-001` · head `THY-WORK-TIME-RUN-OPS-VERONICA-582`
· branch `claude/thylora-time-run-ops-rtzonr`.

Read in this order: this workroom → `db/time-run/README.md` →
`docs/TIME-RUN-OPERATIONS.md` → `docs/TIME-RUN-LIVING-TIME.md` →
`docs/TIME-RUN-PERSON-LANE.md` → `app/lib/time-run-ops.mjs`.

**Open and deliberately unresolved:**

| Item | State |
|---|---|
| Exact event years per era | Open until sealed |
| Kinship degree, Inés ↔ Veronica | Sealed unknown |
| The locket | Closed |
| Names of the people Veronica lived among | Withheld, enforced by locked column |
| Host community and host home records for THY-TIME-RUN-001 | Not yet seeded; structure ready |
| Crew slot occupancy | Slots open; no personal names invented |
| Route legs and stops for THY-TIME-RUN-001 | Not yet seeded; structure ready |
| Motor-era and Historic Egypt vehicle fleets | Classes seeded, fleets not |
| Award catalogue reconciliation | Held for writeback step 2 |

**Next natural move:** seed host communities, host homes and the route for
THY-TIME-RUN-001 — the only two structures in the operations map with tables
ready and no rows. Neither requires inventing a person.
