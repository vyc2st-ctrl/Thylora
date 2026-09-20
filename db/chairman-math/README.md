# Chairman math and Famous Thought migrations

Work code: `THY-WORK-MATH-FAMOUS-THOUGHT-559`
Workroom: [`workrooms/WR-MATH-THOUGHT-559.md`](../../workrooms/WR-MATH-THOUGHT-559.md)
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

These files are the reviewable schema for the Chairman math display layer and the
Famous Thought gate. **They are not applied by this repository.** Applying DDL to
the live backend is a production mutation and is held for Chairman execution.

## Evidence gap, stated first

The build session could not reach the backend. Outbound `CONNECT` to
`jvsdxhrfhtlgaknhjxlz.supabase.co` was refused by the egress proxy with `403`, so
none of the following could be read:

| Object | State in this session |
|---|---|
| `thylora_graph_nodes` / `_edges` / `_versions` | UNREADABLE |
| `thylora_graph_context_v1(stable_id)` | UNREADABLE |
| `thylora_math_equation_registry` | UNREADABLE |
| `thylora_famous_thought_registry` | UNREADABLE |
| `thylora_famous_thought_gate_evaluations` | UNREADABLE |

Consequently every statement here is guarded by `to_regclass` / `to_regprocedure`
and column checks. If a target is absent or shaped differently, the statement
no-ops with a notice instead of failing the migration or inventing a competing
table. No registry is recreated, copied or superseded by these files.

## Apply order

| File | Contents |
|---|---|
| `0001_graph_preflight.sql` | Preflight ledger, read-only graph context lookup, the STABLE ID → CONTEXT → LAYER → AUTHORITY → VERSION → EVIDENCE → WRITE gate |
| `0002_math_display.sql` | Equation display layer (whole / left / equal / right / variables / PLAIN / EVERYDAY / TECHNICAL / real-life), soft resolver into the equation registry, supersede function, unrecovered-equation register |
| `0003_gates.sql` | `thy_famous_thought_f_gate_v1` (F = S × A × C × T) and `thy_store_value_d_gate_v1` (D = A × H × W × T × M × P), plus the advisory session-evaluation table |
| `0004_people_in_time.sql` | The seven-question reasoning frame, one row per famous thought |
| `0005_content_template.sql` | The single reusable content template and the four drafts |
| `0006_graph_writeback.sql` | Declared graph intent, duplicate prevention, and the section 10 writeback report |

Run in numeric order, one transaction per file.

## Design rules held throughout

1. **Additive only.** Every object is new. Nothing existing is dropped, renamed
   or rewritten, and the three registries named in the work order are referenced,
   never recreated.
2. **No second source of truth.** The registries stay where they are; these
   tables hold a display layer and soft references (`registry_ref`), resolved
   through `thy_math_resolve_equation_ref`.
3. **UNKNOWN remains UNKNOWN.** Every definition column defaults to
   `UNKNOWN_DEFINITION`, and `thy_math_variable_authority_honest` forbids an
   undefined variable from carrying an authority.
4. **Both gates fail closed.** An unscored variable produces no product at all;
   a missing source, speaker, wording, context or question fails the gate
   regardless of the arithmetic.
5. **Supersede, never delete.** `thy_math_supersede_equation`,
   `thy_people_in_time_supersede` and `thy_thought_draft_supersede` mark and
   link; no row is removed.
6. **No publishing.** `thy_thought_draft` has no `PUBLISHED` status, and `READY`
   is unreachable unless both gates pass *and* all five template parts are
   filled — which is what prevents a quote-only poster from ever existing here.
7. **Preflight before write.** `thy_math_graph_writeback_v1` creates nothing
   unless `thy_math_graph_preflight_v1` returned `write_allowed` for that stable
   id in the same run.

## Validation

`validation/run.sh` applies all six files to a throwaway local database — twice,
to prove idempotency — then runs `validation/behaviour.sql`, which asserts that
each rule rejects what it claims to reject and counts the rejections.

```
sudo service postgresql start
db/chairman-math/validation/run.sh
```

Result on PostgreSQL 16, 2026-09-20: **exit 0, RESULT: pass**. Twelve clean
migration applications (six files, two passes), eleven of eleven "expect reject"
cases rejected by the database, and the graph writeback reporting
`nodes_created 0 / edges_created 0` with outcome `REFUSED_GRAPH_UNREACHABLE` —
which is the correct result while the overlay cannot be read.

The SQL gates and the JavaScript gates in `math-thought/lib/gates.js` are the
same arithmetic and are checked against each other:

```
npm test          # 73 tests, including 17 gate tests
```

| Case | SQL | JS |
|---|---|---|
| all fours (4,4,4,4) | PASS, F = 256 | PASS, F = 256 |
| one variable low (3,5,5,5) | FAIL, F = 375 | FAIL, F = 375 |
| perfect scores, source uncertain | FAIL | FAIL |
| unscored variable | no product | `f_value: null` |
| D with unrecovered meanings | FAIL | FAIL |
| D with attention but no help | FAIL | FAIL |

## Verification still owed

Validation ran on PostgreSQL 16 locally, not on the live backend. Before
applying: confirm that the three registries exist with the assumed code columns
(`equation_code`, `thought_code`), that `thylora_graph_edges` uses
`from_stable_id` / `to_stable_id` / `relation`, that
`thylora_graph_context_v1(text)` returns a row exposing `layer`, `authority` and
`version`, and that no existing object already uses the `thy_math_`,
`thy_thought_` or `thy_people_` prefixes.
