# thylora_operating_surface_v1

This function is **already applied** to the live backend `thylora-dash`
(`jvsdxhrfhtlgaknhjxlz`). Merging this repository does **not** require
re-applying it — the backend is shared, not per-deployment.

It was applied as these recorded Supabase migrations, in order:

1. `operating_surface_brand_slots_and_visit_log`
2. `seed_brand_asset_slots_from_backend_evidence`
3. `thylora_operating_surface_v1`
4. `thylora_record_chairman_visit_v1`
5. `thylora_operating_surface_v1_fix_provider_readback`
   — corrects the provider-readback subquery to key on `readback_at`
     (the table has no `updated_at`) and surfaces verified price/currency.
6. An in-place patch that changed workroom bucketing so **BLOCKED means
   "cannot proceed"**, not merely "has open blockers": a workroom is BLOCKED
   only when it has no unblocked task rows *and* a non-empty blocker list.
   ACTIVE rows still carry their open blockers via `open_blockers`.

## Contract

`thylora_operating_surface_v1(p_since timestamptz default null) returns jsonb`

- `SECURITY DEFINER`, `STABLE`, `search_path = public, auth`
- Gate: `public.thylora_is_chairman() or public.thylora_is_trusted_server()`.
  Refuses with `{allowed:false, reason:'CHAIRMAN_OR_TRUSTED_SERVER_ONLY'}`.
  `EXECUTE` is revoked from `public` and `anon`.
- Returns keys: `authority`, `deployment_truth`, `chairman_home`,
  `today_board`, `store`, `news`, `social`, `action_cards`, `workrooms`,
  `bridge`, `brand_assets`, `truth`.
- Reads only. The sole write in this feature is
  `thylora_record_chairman_visit_v1`.

## Exporting the applied definition

To check the live definition into this file verbatim:

```sql
select pg_get_functiondef('public.thylora_operating_surface_v1(timestamptz)'::regprocedure);
```

The database is the authority for this function's current text.
