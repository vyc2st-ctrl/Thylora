# QYRIS TRANSFER — Q → Y → R → I → S → T → Q′

**Work:** `THY-WORK-TRANSFER-RECURSION-588`
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Status:** written and verified against PostgreSQL 16. **Not applied.**

QYRIS already existed twice: as the visible read trace on every OMNIVIEW answer
(`db/omniview/0003_read_model.sql`) and as the question grammar on the QYRIS
surface (`db/qyris/`). Neither closed the loop — both answer a question and stop.

This pack is the recursion.

| Stage | Name | Asks |
|---|---|---|
| Q | QUESTION | What is actually being asked? |
| Y | YIELD | What does opening that question yield? Name the unknowns. |
| R | READ | What was actually read, and what was not touched? |
| I | INTEGRATION | What does the read change in what is held as true? |
| S | SETTLEMENT | What is settled now, and which gate moved? |
| T | TRANSFER | What does the next context inherit? |
| Q′ | — | Becomes the Q of the next cycle. |

## The two laws

**TRANSFER CREATES THE NEXT CONTEXT.** A cycle closes by creating its successor.
`thy_qyris_transfer` opens the next cycle itself rather than trusting a caller to
remember; a transfer with no next question is refused (`QYRIS_NO_NEXT_CONTEXT`).
The only way a chain ends without a successor is `thy_qyris_terminate`, which
demands a stated reason.

**PRESERVE OPEN FRONTIER.** Everything a cycle raised and did not settle is
carried into the successor, each carried item recording the row it came from. A
frontier item can be carried or explicitly closed with a reason. It cannot be
deleted (`QYRIS_FRONTIER_IMMUTABLE`), and a chain cannot end while one is open
(`QYRIS_FRONTIER_OPEN`).

The loop also runs in order — a stage cannot be recorded before the stages it
depends on, and transfer is the sixth stage, not the second.

## Apply order

| File | Contents |
|---|---|
| `0001_transfer_recursion.sql` | Cycles, stages, frontier; the order guard and the immutability guards |
| `0002_transfer_path.sql` | `thy_qyris_open`, `thy_qyris_record`, `thy_qyris_frontier_add/close`, `thy_qyris_transfer`, `thy_qyris_terminate` |
| `0003_loop_read.sql` | `thy_qyris_loop` (VISIBLE QYRIS: six stages, frontier, successor) and `thy_qyris_chain` |
| `0004_rls_policies.sql` | Signed-in sessions read the loop; only the service role writes it |
| `0005_seed_cycle_588.sql` | The cycle **this build actually ran** on the SPINE, with the frontier it genuinely left open |

`0005` records Q through S and stops. **T is not written by the seed**: the
transfer is what creates 589, and that is the Chairman's act, not this file's.

## Verify

```
sudo service postgresql start
db/qyris-transfer/validation/run.sh   # exit 0
```

11 "expect reject" cases and `proof_transfer.sql`, which runs the loop twice and
proves two open items survive two transfers while an explicitly closed item does
not travel.
