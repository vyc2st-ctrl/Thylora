# Edition Preview for Approval

Workstream: `STORE_BACKEND` · Thread: six Edition v2 preview surface
Policy served: **THY-APPROVAL-MUST-BE-VIEWABLE-001**

## The problem this closes

The Chairman's only current view of an EDF package is
`thylora_edf_release_board_v1`, which returns **facts about** a package — block
count, character count, "cover present", "source hash present" — and never the
package itself. The only function that returns real content,
`thylora_open_edf_v1`, serves a **PUBLISHED** package to an **entitled customer**.
And publishing freezes release metadata permanently.

So the sequence the Chairman is offered today is: approve metadata, publish
irreversibly, and only then can anybody read the thing. He is asked to press a
one-way button on an artifact he has never seen.

This directory gives him the artifact first.

## What is here

| Path | What it is |
|---|---|
| `sql/0000_preflight_schema.sql` | Read-only. Prints the real EDF schema so the migration can be confirmed before it is applied. |
| `sql/0001_edf_chairman_preview.sql` | The migration: adapter view, content digest, preview board, preview, append-only decision table and the digest-checked write. |
| `index.html`, `preview.js`, `preview.css` | Standalone Chairman reading surface. No vendored dependency; speaks to PostgREST and GoTrue directly, as `rae-link/lib/backend.js` does. |
| `dashboard-panel/edition-preview.js` | The same surface as a dashboard panel, in the executive dashboard's house style. |
| `INTEGRATION.md` | How to promote the panel into `vyc2st-ctrl/thylora-executive-dashboard`. |
| `BINDING.md` | Exactly what binds the preview to the artifact under approval, and how to check it. |

## What this will not do

- **No publication.** There is no `thylora_edf_publish_v1` call anywhere in this
  directory, and none may be added. Publishing remains the separate,
  validator-gated act on the dashboard's *Complete the Release* panel.
- **No activation or scheduling.** Nothing here changes package state.
- **No write to `thylora_edf_packages`.** Not one column.
- **No overwritten history.** The single table created is append-only, with
  `UPDATE`/`DELETE` revoked *and* trigger-blocked.
- **APPROVE does not release.** It records that the Chairman read this exact
  content and finds it fit. The release step stays where it was.

## Status — read this before relying on any of it

**The backend was not reachable from the session that built this.** Outbound
CONNECT to `jvsdxhrfhtlgaknhjxlz.supabase.co` was denied by the environment's
egress policy (`connect_rejected`, gateway 403). The same wall is recorded in the
dashboard repo's own `docs/CONTINUITY-FLOOR.md`, from an earlier session.

Consequences, stated plainly:

1. **The six Edition v2 products were not enumerated, and their existence was not
   verified.** `thylora_edf_packages` could not be read. No product code, title,
   hash or version in this repository is asserted as real — the surface shows
   whatever the backend actually returns and nothing is hardcoded.
   `sql/0000_preflight_schema.sql` section 4 is the query that answers the count.
2. **`THY-CONTINUITY-BOOT-002`, the newest carryforward, the current restart
   point and `THY-APPROVAL-MUST-BE-VIEWABLE-001` were not read from the
   backend.** They live in `thylora_query_carryforward`, `restart_records` and
   `thylora_continuity_floor_state()`. They are not in either repository. The
   policy is served here as its title states it; if its recorded text says more,
   that text has not been seen.
3. **The migration is not applied and cannot be applied from here.** It also
   needs its adapter view confirmed against the live schema first.
4. **Nothing was recorded back into the backend.** The recording path is built
   and specified; the write itself waits on the migration.
5. **Nothing was published, activated or scheduled** — which is also what was
   asked for.

## Order of operations

1. Run the preflight; confirm the adapter view.
2. Apply the migration.
3. Open the standalone surface, or promote the panel per `INTEGRATION.md`.
4. Read each edition. Record APPROVE / REVISE / HOLD against what was read.
5. Publish — separately, deliberately, on the existing panel — only for editions
   carrying a current APPROVE.
