# WR-GRAPH-HARDENING-564

**Work codes:** THY-WORK-GRAPH-HARDENING-564, THY-WORK-TODAY-VALUE-POST-564
**Date:** 2026-09-20
**Authoritative graph:** Postgres only (`thylora-dash`, `jvsdxhrfhtlgaknhjxlz`). No Neo4j. No SPARQL server. No image generation. Nothing published.
**Not touched:** THY-WORK-CHAIRMAN-ATTENTION-CLOSEOUT-563.

> This repository is development/history source. Deployment authority remains
> `thylora-public-world` via `vyc2st-ctrl/thylora-executive-dashboard` per `DASHBOARD_AUTHORITY.md`.
> Nothing here changes the dashboard. The backend is the record; this file is the readable trace.

---

## 1. The findings source is a view, not a table

`thylora_graph_integrity_findings_v1` is a **VIEW**. It recomputes on every read, and a repair
deletes the row that justified it. The directive named 35 findings. The first read returned
exactly 35; a concurrent session writing sequence 561 added a `Finding`-typed node mid-run and
took it to 36.

So the graded set was frozen before any repair, in a new table
`thylora_graph_finding_classification_v1`, under `snapshot_code = 'GRAPH-564-SNAPSHOT-A'`
with its timestamp. The classification survives its own repair, and the 35→36 drift is on the
record instead of silently absorbed.

## 2. Classification — 36 findings, 29 cleared, 7 held

| Class | n | Disposition |
|---|---|---|
| MISSING_TYPE_CONTRACT | 29 | **APPLIED** — types registered |
| MISSING_TYPE_CONTRACT (Surface / ControlSurface) | 2 | **HELD** — Chairman naming decision |
| LEGACY_SCHEMA_MISMATCH (edge type mismatches) | 5 | **HELD** — Chairman ontology decision |

**The 31 `NODE_UNKNOWN_TYPE` findings are not bad data.** Each node is Chairman-authored, carries
authority, truth class, source ref and a version row, and is internally consistent. The registry
was seeded with ten types and never extended as the graph grew. The defect is in the registry.

Registering the type is the meaning-preserving repair. Re-typing the nodes (`Character`→`Person`,
`StoryObject`→`Object`) would have cleared the same findings **by changing what the records say** —
that is the repair that needs Chairman approval, and it was not taken.

Eight types registered ACTIVE, with `allowed_layers` derived from observed use, not assumed:

| Type | Layers | Distinct from |
|---|---|---|
| Character | EdereAirah | `Person` — Person is an Earth-record identity |
| StoryObject | EdereAirah | `Object` — Object is tracked on the Earth record |
| StorySystem | EdereAirah | `System` — System is a THYLORA operational system |
| StoryWork, StoryEpisode | EdereAirah | — |
| Product, ProductCandidate, Finding | Earth | — |

**`Surface` and `ControlSurface` were deliberately NOT registered ACTIVE.** They are one concept
split by two concurrent sessions at 555 and 556A — the 556A version row already records the
near-duplicate. Registering both would turn a naming accident into permanent vocabulary. Both are
stored `HELD` so the duplication stays visible.

## 3. Three defects the diagnostics do not report

### 3.1 REAL_DEFECT — the pre-write firewall raised instead of refusing · **REPAIRED**

`thylora_graph_firewall_v1` aborted with **SQLSTATE 22P02, "malformed array literal"**.

`v_reasons` is `text[]`. The `format(...)` appends return a typed `text` and resolve as
`anyarray || anyelement`. The two **bare, untyped string literals** resolved as
`anyarray || anyarray`, so Postgres tried to parse an English sentence as an array literal:

```sql
v_reasons := v_reasons || 'Node has no version row. Unregistered nodes may not be written from.'
v_reasons := v_reasons || 'EVIDENCE: UNKNOWN. No EVIDENCED_BY edge. ...'
```

The pre-write firewall therefore **raised an exception for exactly the two conditions it exists to
catch** — a node with no version row, and a node with no evidence edge — against the sequence 555
rule that these functions return a reason rather than raise.

Repair: `::text` on the two literals. Verdicts, order of checks and returned JSON shape unchanged.
**Changes meaning: no.**

Verified on the live condition *before* backfill masked it:

| Call | Before | After repair | After backfill |
|---|---|---|---|
| `SYSTEM-MATH-ENGINE-001` (0 version rows) | raises 22P02 | `FAIL_CLOSED` + reason | `PASS` |
| `LAW-STORE-DRAW-VALUE-001` (control) | `PASS` | `PASS` | `PASS` |
| unknown id | `UNKNOWN_IDENTITY` | `UNKNOWN_IDENTITY` | `UNKNOWN_IDENTITY` |

The findings view could never have caught this: it compares data against the registry and never
executes the gate, so a gate that cannot run is invisible to it.

### 3.2 REAL_DEFECT — predicate contracts are never enforced on write · **NOT REPAIRED, HELD**

`thylora_graph_validate_edge_v1` reads `thylora_graph_predicates` (layer, literal_allowed,
cross_layer_allowed) and **never reads `thylora_graph_predicate_contracts` at all**.
`subject_types`, `object_types`, `max_current_per_subject` and `inverse_predicate` are declared and
enforced nowhere on write — advisory only, checked on read by the findings view.

**This is the single root cause of all five edge type-mismatch findings.** They are one hole, not
five accidents. Fixing only the five edges leaves the hole open.

Not repaired on purpose: switching enforcement on would make the three non-conforming edges fail on
any `UPDATE` and render them uneditable. Correct order is Chairman contract decision → widening →
enforcement → re-verify. **Changes meaning: yes.**

### 3.3 BAD_VERSION — audit-history gap · **REPAIRED**

1 node and 20 edges from sequences 558–561 had no `thylora_graph_versions` row, against
CONT-LOCK-004. 21 rows backfilled on the sequence 554 additive pattern. No node or edge modified.
This gap was also the condition that reached the broken firewall line in 3.1.

## 4. The five edge mismatches — exact records

| Edge | Problem | Safe repair | Meaning |
|---|---|---|---|
| `EDGE-HOLDS-JARO-RAINSIDE` | subject `Character`, object `StoryObject`; `HOLDS` allows `Person` → `Title,Object` | widen contract arrays | additive; no assertion rewritten |
| `EDGE-SUCCEEDS-EP002-TWELVEMILES` | both `StoryWork`; `SUCCEEDS` allows `Person,Title` | widen contract arrays | additive |
| `EDGE-EVIDENCE-FIND-DEMAND-TO-SHELF-DECISION-558` | object `Finding`; `EVIDENCED_BY` allows `Evidence` | widen to admit `Finding` | additive |

Each edge asserts a true, evidenced relation. The contract vocabulary simply predates the node-type
vocabulary in use. **All three widenings are Chairman decisions and were not applied.**

## 5. External bootstrap — reviewed, nothing adopted

| Check | Result |
|---|---|
| `PER-001` / `TITLE-001` / `EV-001` copied | **0** — absent |
| `EdereAriah` misspelling in nodes / edges / RDF | **0** — `EdereAirah` intact |
| `https://thylora.example/ns#` adopted | **0** — appears nowhere |
| `MERGE + SET since=date()` overwriting start dates | **none** — the one `since` property is prose ("the morning Twelve Miles for Flour ends"), not a date |

## 6. RDF v2 — validated, not served

All seven required elements present across 381 triples:

`rdf:type` 40 · `thy:id` 40 · `thy:name` 40 · `thy:layer` 78 · `thy:status` 40 · `thy:version` 40 ·
relationships 79 (`evidenced_by`, `holds`, `located_in`, `part_of`, `separate_from`, `succeeds`)

Every subject is `urn:thylora:`; `evidence_id` and `authority` non-null on every row.

**Two gaps recorded rather than papered over:**
1. `thy:` and `rdf:` prefixes are **used but declared nowhere**. `urn:thylora:` is a URN with no
   http(s) base, so the output is RDF-*shaped* but not yet a valid serialization. This is the adapter.
2. A node that also carries a `LAYER` edge emits `thy:layer` twice with the same value. Harmless
   under RDF set semantics; noted.

**SPARQL examples were not assessed.** The directive refers to "supplied SPARQL examples"; none were
supplied in it, and none are stored in the backend. Assessing them from memory would have been
invention. Supply them and they can be checked against the shapes above.

## 7. Missing graph capabilities

| Capability | State |
|---|---|
| authority, truth class, UNKNOWN discipline, evidence provenance, version, supersession, layer firewall | **ALREADY EXISTS** |
| audit history | **PARTIAL → now complete for current rows**; no trigger prevents the next gap |
| temporal validity | **PARTIAL** — `temporal` flag declared; `since`/`until` are free-text properties, unenforced |
| cardinality, inverse relationships | **MISSING** — `max_current_per_subject`, `inverse_predicate` declared, enforced nowhere |
| conflict resolution | **PARTIAL** — conflicts recorded honestly in node properties, never adjudicated |
| approval authority | **PARTIAL** — every row reads `authority='Chairman'`; no distinct approver identity |
| security | **PARTIAL** — graph lookup is READ_ONLY behind `thylora_is_chairman()`; no row-level policy on graph tables |
| deletion policy | **ALREADY EXISTS** in doctrine (supersede, never delete); **MISSING** as enforcement |
| ontology governance | **MISSING** — the Surface/ControlSurface split is the proof |
| SHACL equivalent | **PARTIAL** — contracts are the shape language; unenforced (§3.2) |
| RDF validation | **NOT NEEDED YET** — no external consumer |

## 8. Today post — prepared, gated, **not published**

`THY-SOC-FTHOUGHT-FORD-20260920-01` · `THOUGHT-FORD-001`

Quote copied verbatim from `thylora_famous_thought_registry.quote_excerpt`, never rewritten from
memory. The THOUGHT→ACTION chain is the **stored** `publication_map` row, not re-authored.

**D = A×H×W×T×M×P = 3×4×3×4×1×1 = 144**, minimum factor 1 — computed by the gate trigger, not
asserted. PASS needs min ≥ 3 and D ≥ 4096. **FAIL. No score was raised to reach PASS.**

Two real blockers:
- **No approved asset.** Every approved, rights-cleared asset is an EdereAirah *Twelve Miles* trail
  scene or an Edition v2 product component. Binding one to an Earth-layer Ford post would be taking
  another story's image. Return: **COPY_READY_VISUAL_REQUIRED**. No image generated.
- **No public destination.** All 23 famous-thought map rows point at internal registries or nodes.
  This is what holds M and P at 1 — the lane is gated shut by destination, not by content quality.

**QR: NO.** The destination is not store-driving, and rule 8 forbids attaching an unrelated store QR
to produce traffic — especially with the 558 baseline at zero external paid customers.

The queue row carries `scheduled_for` and `published_at` NULL, and
`trg_thylora_require_content_value_before_schedule_v1` will refuse to schedule it while its
evaluation is FAIL. The gate was exercised, not bypassed.

## 9. Readback verification

| Check | Value |
|---|---|
| findings open now | **7** (was 36) |
| classified in snapshot A | 39 rows (36 view findings + 3 discovered defects) |
| repairs applied / held | 31 / 8 |
| nodes total | 43 |
| nodes without version row | **0** |
| edges without version row | **0** |
| nodes failing firewall | **0** |
| node types ACTIVE / HELD | 18 / 2 |
| RDF v2 triples | 381 |
| forbidden namespace / `EdereAriah` in RDF | 0 / 0 |
| post published | **0** |
| post gate | FAIL, D=144 |

## 10. Restart point

**`THY-RESTART-20260920-GRAPH-HARDENING-564`**

Open, and all four are Chairman's:
1. Name the canonical control-surface type; supersede the loser (never delete).
2. Decide the three predicate-contract widenings → then enable contract enforcement in the write
   trigger → then re-verify every existing edge passes.
3. Decide whether the famous-thought lane gets a public destination.
4. Supply a famous-thought visual, or approve the lane going text-only.

Continuity log row **355**, `THY-WORK-GRAPH-HARDENING-564`.
