# THYLORA Famous Thought library — WORK_CODE THY-WORK-COMPLETE-QUOTE-LIBRARY-561

Source query: `THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-561` (carryforward sequence 561).
Delivery carryforward: `THY-Q-20260920-COMPLETE-QUOTE-LIBRARY-DELIVERED-565` (sequence 565,
after reading newer deltas 562, 563 and 564).

This is a **source-verified reasoning library**, not a quote collection. A quotation only
enters it if the exact wording was found in the cited source document during this pass, and
it is only public-ready if it resolves the full meaning chain:

    THOUGHT -> TENSION -> QUESTION -> EVIDENCE -> CONNECTION -> ACTION -> DESTINATION

## What is in the backend

| Table | Role |
|---|---|
| `thylora_famous_thought_registry` | existing registry; 23 ACTIVE records + 6 HELD |
| `thylora_famous_thought_gate_evaluations` | existing F = S x A x C x T gate; PASS needs every factor >= 4 and F >= 256 |
| `thylora_famous_thought_publication_map` | existing meaning chain: tension, question, evidence, connection, action, destination |
| `thylora_famous_thought_theme_registry` | new — the 20 required themes |
| `thylora_famous_thought_themes` | new — thought/theme tags |
| `thylora_famous_thought_people_in_time` | new — problem faced, what they knew, what they could not know, context, reasoning rule, where the rule fails, transfer today |
| `thylora_famous_thought_math_bindings` | new — foreign-keyed to `thylora_math_equation_registry`, so a thought can never bind to an equation whose variables have not been recovered |
| `thylora_famous_thought_holds` | new — the dispute record for every refused quotation |
| `thylora_store_draw_gate_evaluations` | existing D = A x H x W x T x M x P gate, run over every public draft card |

Nothing here duplicates the existing registries. No new dashboard and no new top-level app
was created.

## Read model for the existing MATH / FAMOUS THOUGHT surfaces

* `thylora_famous_thought_public_v1` — view: only ACTIVE, F-gate PASS, meaning-chain PASS
* `thylora_famous_thought_card_v1(thought_id)` — one public card in the required format
* `thylora_famous_thought_library_v1(theme, person)` — theme filter and person filter
* `thylora_famous_thought_today_v1(date)` — TODAY'S THOUGHT, deterministic for a given date
* `thylora_famous_thought_random_v1()` — RANDOM VERIFIED THOUGHT
* `thylora_famous_thought_dashboard_v1()` — header counters plus today's card

## Migrations applied to `thylora-dash` (jvsdxhrfhtlgaknhjxlz), 2026-09-20

1. `famous_thought_library_schema_561`
2. `famous_thought_records_561_part1` … `part4`
3. `famous_thought_people_in_time_561_part1`, `part2`
4. `famous_thought_holds_561`
5. `famous_thought_content_value_gate_561`
6. `famous_thought_graph_writeback_561`
7. `famous_thought_qyris_work_continuity_565`

The `.sql` files in this directory are the idempotent reproduction of those migrations, in
order. `records_561.json`, `holds_561.json` and `inherited_four_561.json` are the underlying
record set in human-readable form.

## Readback (verified after apply)

```
public_ready 23 · registered 29 · held_or_rejected 6 · themes_covered 20/20
people_in_time_complete 23 · equations_bound 4 · F-gate PASS 23, FAIL 6
D-gate rows 23, PASS 0, max D 1440 against a 4096 threshold
graph: 40 nodes, 117 edges, 137 version rows
```

## Standing rules this library enforces

* No quote aggregators as authority. Every accepted record cites a primary text, a national
  archive, a university archive, a government archive or an authoritative foundation.
* A rejected quote is a successful gate result. Refusals are recorded, not discarded, so the
  same line cannot be re-proposed as if it had never been checked.
* UNKNOWN remains UNKNOWN.
* No card is published. `publication_state` is `DRAFT_ONLY_NO_CHAIRMAN_APPROVAL_TO_PUBLISH`.
