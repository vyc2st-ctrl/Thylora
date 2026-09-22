# GATE LAW — dynamic versioned gates

**Work:** `THY-WORK-DYNAMIC-GATE-LAW-588`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Status:** written and verified against PostgreSQL 16. **Not applied.**

A gate in `thy_omniview_gates` records *that* a gate is open. It does not record
*which rule* is in force, and it can be changed in place with no trace. This pack
makes the rule itself the record.

## The four laws, and where each one lives

| Law | Enforced by |
|---|---|
| HOLD CURRENT RULE STRONGLY | `thy_gate_law_current` is the highest version, unfiltered by state |
| NO SILENT MUTATION | `thy_gate_law_no_rewrite` refuses every UPDATE and DELETE; no RLS policy grants either |
| NO OLD RULE OVERRIDING NEWER RULE | `GATE_LAW_STALE_VERSION` and `GATE_LAW_SUPERSEDES_MISMATCH` in the chain guard |
| EXPLICIT SUPERSESSION ONLY | `thy_gate_law_supersession_explicit`: v1 supersedes nothing and says so; every later version names what it replaces |

A state change is a new version. There is no setter that edits `gate_state`.

## The eleven fields

`SCOPE` · `AUTHORITY` · `EVIDENCE` · `CONTEXT` · `TRIGGER` · `STATE` ·
`EXCEPTION` · `VERSION` · `SUPERSEDES` · `READBACK` · `NEXT REVIEW`

Two of them cannot be left silent:

- **EXCEPTION** is `not null`. A gate with no exception must say `NO EXCEPTION`,
  so silence is never read as permission.
- **NEXT REVIEW** is a date **or** a stated reason there is none, so "forever" is
  a decision rather than a default.

The field order is returned as data by `thy_gate_law_field_order()`, so a surface
cannot quietly reorder the law it is displaying.

## Apply order

| File | Contents |
|---|---|
| `0001_gate_law.sql` | The table, the eleven fields, the append-only trigger, the chain guard |
| `0002_gate_read.sql` | `thy_gate_law_current`, `thy_gate_declare`, `thy_gate_supersede`, `thy_gate_current`, `thy_gate_law_readback` |
| `0003_rls_policies.sql` | Signed-in sessions read; only the service role writes; nothing updates or deletes |
| `0004_seed_gate_law.sql` | The six gates in force at sequence 588, each from evidence in this repository |

## Verify

```
sudo service postgresql start
db/gate-law/validation/run.sh        # exit 0
```

That applies the pack twice (idempotency), runs 11 "expect reject" cases, and
runs `proof_gate_law.sql`, which takes one gate through three versions and proves
the current rule holds while both superseded rules stay readable.

`tests/gate-law.test.mjs` pins the same laws from the repository side, so a
constraint cannot be deleted while the comment describing it survives.

## Applying to the backend of record

Not done here, and not to be done from a build session. Applying this pack to
`thylora-dash` is a production mutation held for the Chairman. `GATE-BACKEND-EGRESS`
is itself one of the seeded gates and records why: egress to the backend was
denied in this session and in `WR-RAELINK-001`.
