# WR-LINEAGE-001 · Family Lineage

**Lane:** family history, kinship, oral testimony, record confirmation
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`). Schema is in source. It is **not applied**.
**Opened:** 2026-10-03

## 1 · What was placed

| Path | Purpose |
|---|---|
| `db/family-lineage/0001_lineage.sql` | Backend schema: `fl_*` tables, functions, RLS |
| `db/family-lineage/validation/` | Throwaway-database proof. Reuses the RAE Link Supabase stub rather than copying it |
| `family-lineage/lib/lineage.js` | Kinship derivation, correction rendering, account checks, seed generation |
| `family-lineage/fixtures/example-account.json` | Invented family used by tests and validation |
| `family-lineage/accounts/` | Real accounts. **Git-ignored: this repository is public.** They go to the backend under owner-only RLS, never to source |
| `tests/lineage.test.mjs` | 9 tests. The full suite is 57 of 57 passing |

Nothing existing was changed. `family_story_archives` stays the archive. A testimony
points at it by `archive_code`, so there is no second archive.

## 2 · The correction asked for today

A teller asked for a phrase ("your out here") to be removed from a quoted line in
a generated PDF, ending the line at "come on". This is stored as an append-only
teller correction. Both spellings
(`your out here`, `you're out here`) are covered, and it applies to PDF, page and audio
output. Any document rendered through `fl_apply_corrections` drops the phrase and
ends the line at "come on". The original dictation is kept, unedited, for the owner.

**The PDF itself is not in this repository or this session.** It cannot be edited
here until it is uploaded. Once it is uploaded, the corrected version is one render away.

## 3 · Gaps found in the existing system

1. **Live family tables have no schema in source.** `family_story_archives` and
   `family_story_audit` are written by the app, but no DDL for them exists in this repo.
   Nobody can review, restore or migrate them from source.
2. **The story-save logic exists in three copies:** `app/app.js`, `app/hotfix-build7-witness.js`
   and `app/hotfix-20260831.js`. The last one is loaded by nothing. It is dead code that
   looks live.
3. **The Build 7 Safari save fix only reaches people after the service worker installs.**
   `hotfix-build7-witness.js` is injected by `sw.js` and not by `index.html`. A first
   visit, or a cleared cache, runs the unfixed save path.
4. **A story can save without its audit row.** The hotfix catches a failed audit insert
   and shows "audit log warning". The archive row stays with no trail.
5. **The archive is flat text.** It has no people, no parents and no sides of the family.
   A half relation (same father, different mother) cannot be expressed or checked. → closed by `fl_parentage`
   and `fl_sibling_kind`.
6. **There is no correction path.** `source_confidence` is hard-coded `MEMORY_REPORTED`,
   and a teller cannot fix a quote without overwriting history. → closed by `fl_corrections`.
7. **Memory is never pointed at records.** → closed by `fl_record_tasks` and `fl_open_questions`.
8. **Generated documents (PDFs) are not stored or versioned anywhere.** That is why
   today's PDF could not be found.

Items 1–4 are reported, not changed. They touch the accepted app floor, and
`DASHBOARD_AUTHORITY.md` rules require witness before change.
