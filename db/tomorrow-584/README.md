# `db/tomorrow-584/` — backend write for tomorrow's starting packet

**State: WRITTEN · NOT APPLIED.**

Work codes: `THY-WORK-TOMORROW-FLOOR-584`, `THY-WORK-STORE-UTILITY-ARTIFACT-583`,
`THY-WORK-WORLD-SERIES-584`, `THY-WORK-DAILY-LANGUAGE-584`.
Backend of record: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

---

## Read this before applying

The authoring session **could not read the backend**. `jvsdxhrfhtlgaknhjxlz.supabase.co:443`
answered **403 to CONNECT** at the egress proxy on **2026-09-22T04:07:20Z**.

The highest sequence attested in any reachable source is **522**. **Sequences 523
through 584, and any newer deltas, are unread.**

This means the live schema shape was never inspected. Every statement in
`0001_tomorrow_floor.sql` is therefore guarded by `to_regclass` and by column
checks, following the pattern already in `db/rae-link/0010_registry_link.sql`. If
a target table is absent or shaped differently, the statement **no-ops with a
notice**. It never fails the run, and it never invents a competing table.

**Where the backend and this packet disagree, the backend is right.** The
standing rule — *current backend outranks historical prompts* — applies to this
packet, which is itself a historical prompt from the backend's point of view.

---

## Order of operations

```
1.  psql … -f 0002_readback.sql     # BEFORE — read the head, see the gap
2.  review the section A output     # is the live head beyond 584?
3.  psql … -f 0001_tomorrow_floor.sql
4.  psql … -f 0002_readback.sql     # AFTER — verify every row landed
```

**Step 4 is not optional.** An apply that is not read back is not a write, it is
a hope.

---

## What `0001` writes

| Target | What | Creates anything new? |
|---|---|---|
| `thylora_execution_work_registry` | 4 work items | No — rows in an existing registry |
| `thylora_qyris_work_item_checks` | 4 complete five-field checks, **all HOLD** | No |
| `thylora_control_lane_registry` | Binds 3 **existing** lanes to the new work codes | **No lane is created** |
| `thylora_query_carryforward` | 1 ordinary `CURRENT` row carrying the restart point | No |

## What `0001` deliberately does NOT write

- **No authority designation.** Per `docs/CONTINUITY-FLOOR.md`, the controlling
  floor moves only on a `DESIGNATE` event in `thylora_continuity_anchor_authority`
  with valid evidence. A newer `CURRENT` row does **not** move the floor —
  treating recency as authority is the original defect that rule exists to
  prevent. Readback check **B** fails loudly if this packet ever appears in the
  authority ledger.
- **No language lane.** No lane among the 17 covers language. Creating one would
  be this packet making a structural decision belonging to the Chairman.
  `THY-WORK-DAILY-LANGUAGE-584` will render under TODAY and show as unbound in
  LIVING MAP. That gap is intentional and visible — Chairman decision **D5**.
- **No second anything.** No second work registry, QYRIS store, product truth,
  approval system, router or lane registry.

## Why every QYRIS check is HOLD

All four work items sit in an active state, and none has an unblocked path to
done. Marking any of them PASS would make a board look green that is not. The
rule this backend already enforces — *no active, ready or done state without a
QYRIS PASS* — is applied here to this packet's own rows first.

These four work codes are **this session's own work**, so authoring their checks
is the work owner doing it, not a surface passing its own gate.

## What `0002` verifies

| Check | Verifies |
|---|---|
| **A** | The live head, and the size of the unread gap against 522 |
| **B** | The continuity floor did **not** move |
| **C** | All 4 work rows landed, each with an acceptance test |
| **D** | Every QYRIS check has all five fields — naming which is blank, not counting |
| **E** | No packet work item is active without a check |
| **F** | Lane count has not fallen below 17; the 3 bindings applied |
| **G** | The language lane gap is still visible (expected) |
| **H** | The restart point landed as an execution record, not an authority |
| **I** | Everything still held, with the route out of each |

`0002` writes nothing and is safe to run at any time, on any head.

A check reporting `NOT_PRESENT` means the table does not exist on this backend
and the check could not run. **It is never reported as a pass.**
