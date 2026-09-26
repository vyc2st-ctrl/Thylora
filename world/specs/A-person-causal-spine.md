# A · Person Causal Spine compiler

Idea lane `THY-IDEA-PERSON-CAUSAL-SPINE-001` · code `world/lib/causal-spine.js`, `world/lib/population.js` · table draft `thy_person_spine_questions`, `thy_person_resolution_state`

## Why it exists

A trait word such as *irritated*, *afraid*, *likes*, *skilled*, *trusts* or *took the job because* describes a person without explaining them. If a scene uses the bare word, the author has to supply the rest, and that is where author convenience gets in. The compiler stops a bare trait from driving behaviour until the trait has been expanded into cause and history.

## Input → output

```
Chairman seed questions (5)  ─┐
                              ├─► compileSpine(packet, seeds)
Persisted life packet ────────┘        │
                                        ├─ 5 seeds × 8 dimensions = 40 questions
                                        ├─ 1 interaction question per seed pair = 10
                                        └─ 50 derived questions, each OPEN or EVIDENCE_IN_PACKET
```

The eight dimensions every broad trait must expand through:

| Dimension | The question it forces |
|---|---|
| CONTEXT | Where does this show up, and where does it not? (uses the person's own `continuity_policy.context_domains`) |
| RELATIONSHIP | With whom is it stronger, weaker or different, and why? |
| TIME | When does it rise or fall: time of day, point in shift, fatigue, hunger, season? |
| CAUSE | What concrete cause produces it, and what would have to be missing for it not to happen? |
| PRIOR_EVENTS | Which earlier events formed it: when, where, who? |
| CONTRADICTIONS | Where does the person act against it, and what does the exception reveal? |
| CURRENT_STATE | What is it today and yesterday, and what triggered that? |
| CHANGE_OVER_TIME | How has it changed across their life, and what would change it next? |
| INTERACTION (pairs) | When two traits are active together, which one decides, and what past event set that order? |

## Rules held in code and schema

1. **The compiler never answers.** `answer` is always `null` at compile time. In the table, `answer` can only be set when `status` is `ANSWERED_REVIEWED` or `CHAIRMAN_LOCKED` (check constraint `answer_needs_review`).
2. **Evidence isn't an answer.** `EVIDENCE_IN_PACKET` means a packet path holds material a reviewer must read. Strings starting `OPEN` or `UNKNOWN` don't count as evidence.
3. **A trait isn't ready until every dimension has evidence.** `traitReadiness()` returns the missing dimensions. The event engine treats a trait that isn't ready as OPEN.
4. **Backfill never overwrites.** Running the compiler again adds question rows and never replaces a reviewed answer.

## Nahla Mercer: live packet run (presence-only, not committed)

Seeds: *What irritates her? / What is she afraid of? / Why did she take the job? / Who does she trust? / Why did she choose that car?*

Result: **50 derived questions. 15 have evidence in the packet and 35 are OPEN.** None of the five traits is ready yet. Two gaps show up for every trait: **TIME** and **CHANGE_OVER_TIME**. Her packet describes the irritations well but doesn't yet say when they peak or how they have changed since her previous job. That gap is where authoring should go next.

The run used a copy of her packet that records only whether each field is present. It lives in the session scratchpad. Her restricted fields (family tensions, private finances, private health) weren't copied into git, as her `privacy_policy` requires. The repo test uses a synthetic fixture.

## Population scaling: lower compute, never lower history

```
BACKGROUND  ─ population cell: counts and flows (commuters, at-home, rates)
HOUSEHOLD   ─ shared schedule, budget, vehicle, meals
PERSISTENT  ─ individual with a life packet and event log, stepped coarsely
FOCUS       ─ active agent: full spine, decision by decision
```

* **Demotion** takes a snapshot of the active state into `summaries[]` and appends a `RESOLUTION_CHANGE` event. It never truncates history.
* Once someone exists as an individual, their **storage tier can't drop below PERSISTENT**, even when their compute folds into a household or background step.
* **Promotion** reloads the full history before the person acts again (`reloaded_history_len`).
* Background cells subtract persistent individuals so nobody is counted twice or overwritten by a statistic.
* In the schema, a trigger rejects any update that reduces `history_len`.
