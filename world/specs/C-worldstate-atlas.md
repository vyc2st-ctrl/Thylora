# C · WorldState Atlas: primary simulation interface

App `THY-WORLDSTATE-ATLAS-APP-001` (registry state `IN PRODUCTION` v1. **No deployed runtime has been witnessed.**) · idea `THY-IDEA-WORLDSTATE-ATLAS-001` · tables drafted: `thy_atlas_places`, `thy_atlas_state`, `thy_atlas_app_launch_points` · district seed `world/atlas/district-proto-001.json`

The Atlas isn't a map drawn over the simulation. It's the simulation's front end: every pixel of live state must resolve to a stored row with a source.

## 1. Coordinate model

Nested local frames. Nothing needs a planetary datum, because EdereAirah geodesy is OPEN.

```
PLANET (frame origin OPEN) → REGION → DISTRICT → BLOCK → BUILDING → FLOOR → ROOM → ZONE
```

* Each place stores `origin_x_m, origin_y_m, origin_z_m` in **metres from its parent's origin** (+x east, +y north, +z up), a `rotation_deg`, and a `footprint` polygon in parent-local metres.
* A world position is the composition of frames from ROOM up to the highest frame that has a known origin. Anything above an OPEN origin renders as *relative only*.
* `measurement_state` is one of UNKNOWN, PROPOSED, MEASURED or CHAIRMAN_LOCKED. The renderer shows PROPOSED geometry dashed and UNKNOWN geometry not at all.
* **NightStep Spatial Consistency Doctrine** (`THY-SPATIAL-001`, CANONICAL_LOCKED) is enforced: *the outside and the inside are the same building.* A BUILDING footprint must contain all of its FLOOR footprints, and every ROOM must sit inside its FLOOR. Window and dimension rules are validated against the same frames.

## 2. Native / Earth time

Uses `world/lib/dual-time.js` (profile `THY-DUAL-TIME-EDEREAIRAH-003`).

* The header always shows the **Earth timestamp + timezone**, plus the **native value in anchor-relative form** ("N native days + H Earth hours after *Day 83 Aethon 4 h 5 m*").
* Native daypart, month, season and full-orbit names stay OPEN. The Atlas displays a code (daypart 0/1/2), never an invented name.
* A 33-Earth-hour native day has 3 dayparts of 11 hours each. A full orbit is 507 Earth-read days. The rule that reconciles the two is OPEN, so the scrubber steps in Earth milliseconds.

## 3. Layers

| Layer | Source rows | Rendering rule |
|---|---|---|
| Geography | `thy_atlas_places` level REGION/DISTRICT | footprint + name, or `name OPEN` |
| District / block | `thy_atlas_places` | streets are ZONE rows. No street names are invented |
| Building / floor / room | `thy_atlas_places` + existing HQ floor/room registries (soft ref) | interior must match exterior (NightStep) |
| People state | `thy_atlas_state` entity_kind PERSON | position + activity **only if** mode = HAPPENED with `source_event_id`, or SCHEDULED with `source_schedule_ref` |
| Vehicle state | `thy_atlas_state` VEHICLE + `transport_vehicle_registry` | condition, location, driver |
| Event state | `thy_world_events` (occurred = true) | pin with its cause list on hover |
| Historical scrubber | any row with `earth_from ≤ t < earth_to` | replays; never interpolates a person between two HAPPENED points |
| Scheduled-state layer | mode = SCHEDULED | drawn hollow / ghosted: **scheduled ≠ happened** |
| Visibility | `visibility_class` PUBLIC / PRIVATE / AUTHORITY / RESTRICTED | the viewer's grant decides what is fetched, not just what is drawn |
| Launch points | `thy_atlas_app_launch_points` | open the linked Living Business App at that place/time |

## 4. Rules copied from the app record's `release_rules` and `privacy_rules` (enforced in schema)

* `world_state_requires_source_event`. A HAPPENED state row must cite an event (`happened_needs_source`).
* `scheduled_not_equal_happened`. A SCHEDULED row must cite a schedule (`scheduled_needs_schedule`) and renders differently.
* `no_fake_live_state`. If no row exists for time *t*, the entity shows **no state**. It is not shown at a last-known position as if it were live.
* `locate_not_equal_track`. Finding a person in a single query is not the same as following them. Continuous follow of a PRIVATE person requires AUTHORITY visibility and is logged.
* `public_state_separate_from_private_state`. PRIVATE rows never leave the server for a PUBLIC viewer.

## 5. District prototype specification: DISTRICT-PROTO-001

**Purpose:** the smallest district that can host one real simulated day for a WORLD_ACTIVE person. It is built around Nahla Mercer's commute because her packet already has a home ref, a work ref, a vehicle rationale, a meal plan, shift logic and irritation maps.

| Element | Content | State |
|---|---|---|
| District name | not authored | **OPEN** |
| Frame | local metres, origin at the district's south-west corner; parent frame OPEN | PROPOSED |
| Extent | 1,600 m × 1,200 m (enough for a short urban commute) | PROPOSED |
| Places | `BLDG-HOME-NAHLA` → `HOME-NAHLA-MERCER-001`; `BLDG-WORK-OPS` → `THY-HQ-NY-OPS-TRANSCRIPTION-001`; one food stop; one fuel/charge + service point; one intersection zone that can be blocked | refs **dangling**: neither entity exists in `thylora_world_entities` yet |
| People | Nahla Mercer (FOCUS); mother, younger sibling, cousin (PERSISTENT, names OPEN); coworkers (HOUSEHOLD/BACKGROUND until authored); commuter cell (BACKGROUND) | per packet |
| Vehicle | compact five-seat liftback, native maker/model OPEN, service record travels with the vehicle | per packet |
| Scheduled layer | shift window (to bind to the shift registry), main break, family contact | exact times **OPEN** |
| Event feed | `tick()` rules: scheduleConflict, irritationTrigger, weatherDelay, needThreshold | code exists; live binding pending |
| Launch points | `BLDG-WORK-OPS` → Talk While Working; service point → Service Cluster Engineering; food stop → KynWrks / Cali Taste Lab | proposed |
| Visibility | public: buildings, streets, public events. Private: Nahla's home interior, family events. Authority: shift and handoff receipts | per her privacy_policy |

**Acceptance for "district live":**
1. The places are inserted with footprints that pass NightStep containment.
2. One Earth day of Nahla's schedule shows as the scheduled layer.
3. At least one `tick()` run writes occurred events whose causes resolve to real rows.
4. The scrubber replays that day.
5. A PUBLIC viewer cannot fetch her home interior.
6. The page is witnessed on the authoritative deployment (`thylora-public-world`), not on this repository.

## 6. Build order (now target, not aspiration)

1. Apply `db/world/0001_world_engine.sql` (needs Chairman execution).
2. Author the two dangling entities or let the Chairman name them.
3. Seed `district-proto-001.json` into `thy_atlas_places`.
4. Build a canvas/SVG renderer reading `thy_atlas_places` + `thy_atlas_state`, with a scrubber and visibility.
5. Merge into `vyc2st-ctrl/thylora-executive-dashboard`, the authority repo per `DASHBOARD_AUTHORITY.md`.
