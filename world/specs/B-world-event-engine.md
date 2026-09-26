# B · World Event Engine

Code `world/lib/event-engine.js` · table draft `thy_world_events`

## Principle

Plot comes out of state and interaction. The engine has no "story beat" input. Every event is proposed by a rule that reads world state, and it carries the state ids that caused it.

```
people ─┐
schedules ─┤
needs ─┤        ┌── rules (read state, propose candidates with causes + base p)
weather ─┼──────►│
resources ─┤        └── validate ─► clamp p to [0.02, 0.98] ─► seeded roll ─► occurred / not
institutions ─┤                                                          │
conflicts ─┤                                                          ▼
prior events ─┘                                         persistent state deltas (no reset)
```

## Rules in the first cut

| Rule | Reads | Emits |
|---|---|---|
| `scheduleConflict` | overlapping schedule rows; `assumed_by` without `confirmed_by_person` | SCHEDULE_CONFLICT (p 0.95 when someone assumed availability) |
| `irritationTrigger` | a prior event whose tags match the person's own `irritation_map[context]`; fatigue | IRRITATION, then irritation +1 and patience −1 |
| `weatherDelay` | precipitation × schedule rows that need travel × vehicle condition | TRAVEL_DELAY |
| `needThreshold` | hunger ≥ 0.7, the person's own meal plan | MEAL (plan pulled from the packet or left OPEN) |
| `institutionDeadline` | deadlines inside the next 24 h | DEADLINE_PRESSURE |
| `resourceShortfall` | level < needed | RESOURCE_SHORTFALL |

## Guarantees (tested)

* **No cause, no event.** An empty cause list, a cause that isn't `kind:id`, or `forced_by_author` is rejected, including through `injectAuthorEvent()`. The table repeats this with `causes_not_empty`.
* **Bounded chance.** Chance only chooses among candidates the state already supports. p is clamped to [0.02, 0.98], so nothing is ever certain or impossible by fiat.
* **Replayable.** Every tick takes a seed (mulberry32). The same world and the same seed give the same result. Seed, p and roll are stored on each event.
* **State persists.** Deltas write to the person's state, and the next tick reads the changed state.

## Worked example (from the test, shaped on Nahla's real current-day irritation)

State: a relative sets up a 16:30 pickup (`assumed_by: relative-1`, not confirmed) inside a 09:00–17:30 shift. Rain is falling at 4 mm/h. Hunger is 0.75 and fatigue 0.5.

Candidates: SCHEDULE_CONFLICT (causes `schedule:shift-1`, `schedule:pickup-1`, `assumption:relative-1`), IRRITATION (causes `event:msg-1`, `irritation_map:family`), TRAVEL_DELAY (causes `weather:wx-1`, `schedule:pickup-1`, `vehicle:veh-1`), MEAL.

Nobody wrote "Nahla is annoyed today". Her irritation map, the family message and her schedule produce it.

## Next

* Bind to live `thylora_world_schedule`, `thylora_world_households` and `thylora_person_life_events`, reading only.
* Add rules for relationship repair or strain (from `primary_relationship_network`), money, and illness. Each rule needs its own cause kinds.
* A scene renderer may only consume `occurred = true` events and their causes.
