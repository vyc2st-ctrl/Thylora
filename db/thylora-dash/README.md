# thylora-dash backend repairs

Backend project: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

This directory holds SQL for repairs applied to the THYLORA continuity backend,
kept here as the custody record. It is development/history source; per
`DASHBOARD_AUTHORITY.md` this repository is not the deployment authority for the
Chairman dashboard. Each repair ships as a pair:

| Applied | Rollback |
| --- | --- |
| `0001_fix_complete_query_pair_pending_payload.sql` | `0001_fix_complete_query_pair_pending_payload.rollback.sql` |

Every repair here is tested inside `begin; ... rollback;` against the live
backend before it is applied, and the applied definition is read back from
`pg_get_functiondef()` afterwards.
