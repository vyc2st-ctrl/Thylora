# THYLORA graph overlay — story lane firewall

**Work code:** `THY-WORK-GRAPH-STORY-FIREWALL-551`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Sequence:** 551 (overlay itself landed at 550)

This directory holds the reviewable source of the graph continuity firewall.
It is **not** the deployment authority for anything — see `DASHBOARD_AUTHORITY.md`.
The functions in `0001_continuity_firewall.sql` are already applied to the live
backend; this file exists so the rule can be read and re-applied, not so it can
be re-invented.

## What the overlay is

Four tables, created at sequence 550:

| Table | Holds |
|---|---|
| `thylora_graph_nodes` | Entities with a stable ID, a layer, an authority and a truth class |
| `thylora_graph_edges` | Typed relationships, layer-validated by trigger |
| `thylora_graph_predicates` | The closed predicate vocabulary |
| `thylora_graph_versions` | SemVer history; nothing is ever deleted |

Read with `thylora_graph_context_v1(stable_id)`. Export with `thylora_rdf_triples_v1`.

**Layers are `Earth` and `EdereAirah`, always explicit.** Trigger
`thylora_graph_validate_edge_v1` raises `GRAPH_CROSS_LAYER_BLOCKED` for any edge
that spans them on a predicate whose `cross_layer_allowed` is false — which today
is every predicate.

## Predicates

Locked: `HOLDS`, `SUCCEEDS`, `LOCATED_IN`, `SUPERSEDES`, `EVIDENCED_BY`, `LAYER`.
Additive and available: `PART_OF`, `SEPARATE_FROM`.

`DERIVED_FROM` is **proposed, not created.** No predicate can currently link an
Earth-layer product to the EdereAirah story property it derives from, so those
bindings are held in node properties rather than faked with `PART_OF`. Approving
it means inserting one row with `cross_layer_allowed = true`. See finding
`GRAPH-551-F06`.

## The hard story boundary

    STORY-BRAMBLE-001  SEPARATE_FROM  STORY-UNKLE-SEEZIN-TRAIL-001

and its reciprocal. Cross-merge is prohibited.

- **Bramble** — Bramble, WYCK, THE BRAMBLE BOX, `BRAMBLE-EP-001`
  "The Moment Before You Don't Ask", classroom trust/questioning continuity.
- **Unkle Seezin Trail** — Unkle Seezin, Caleb, Lottie James, Old Jaro,
  Bell Crossing, *Twelve Miles for Flour*, Rain-Side Beans, trail/camp continuity.

## Using the firewall

Call it before any story or product write:

```sql
select thylora_graph_firewall_v1('ER-CHAR-CALEB-001', 'STORY-BRAMBLE-001');
-- verdict: FAIL_CLOSED
--   "Entity is PART_OF STORY-UNKLE-SEEZIN-TRAIL-001, not STORY-BRAMBLE-001."

select thylora_graph_firewall_v1('ER-CHAR-CALEB-001', 'STORY-UNKLE-SEEZIN-TRAIL-001');
-- verdict: PASS

select thylora_graph_firewall_v1('OBJ-TRAIL-LAMP-001', 'STORY-UNKLE-SEEZIN-TRAIL-001');
-- verdict: UNKNOWN_IDENTITY  (there is no trail-lamp entity; do not invent one)
```

`write_allowed` is true only on `PASS`. Everything else fails closed.

## Name custody

Two protected tokens must never be silently rewritten, and neither is resolved:

- **SEEZIN** — the token is intact in every record. The *honorific* is not:
  `thylora_world_entities` says "Uncle Seezin", `thylora_person_identity` and the
  published series line say "Unkle Seezin", the published body text says bare
  "Seezin". Honorific state: **UNRESOLVED**.
- **WYCK** — `thylora_person_name_canon` locks WYCK at `CHAIRMAN_LOCK`;
  `thylora_world_entities` `CHAR-WICK-001` stores "Wick" at `CHAIRMAN_CONFIRMED`;
  the live storefront renders "Bramble Wick". Chairman decision 5.

Both are carried forward on the graph nodes with `never_silently_normalize=true`.

## Standing rules

1. Find the stable ID, read the node, both edge directions, version history,
   evidence, layer and authority **before** creating or modifying anything.
2. A stable ID that already exists is never duplicated.
3. Missing evidence is `UNKNOWN`. It is not filled in.
4. Earth and EdereAirah stay explicit.
5. Nothing is deleted. Supersede and preserve history.
6. Breaking meaning or structure → `MAJOR`. Safe additive → `MINOR`.
   Non-meaning correction → `PATCH`.
7. Access is not authority.
8. No complete / live / built / sold claim without evidence.
9. Source text outranks summary.
