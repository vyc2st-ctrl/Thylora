# THYLORA Dashboard backend migrations

`0001_r6_workspace.sql` adds the custody tables for the R6 Chairman workspace:
margin notes, prompt coverage atoms, preview decisions, and the Global Arrival
Matrix.

Target backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`).

The migration is additive — it creates new tables only and does not alter or
drop anything the current head reads.

**It has not been applied.** Applying it needs backend credentials this
repository does not hold. Until it is applied, the R6 workspace keeps notes and
ledgers on the Chairman's device and reports `PENDING_CUSTODY` on screen rather
than claiming backend custody it does not have.

Three rules are enforced in the schema itself rather than only in the client,
because the client can be bypassed and the rules are the Chairman's:

- `DEFERRED_WITH_REASON` without a reason is rejected by a check constraint.
- Arrival above `ABSENT` without an evidence reference is rejected.
- No delete policy exists on notes or atoms, so under row level security an atom
  cannot quietly stop existing. A correction is a new row naming the one it
  supersedes.
