-- THYLORA · Edition v2 Chairman Preview · PREFLIGHT (READ ONLY)
-- ============================================================
-- Run this FIRST, in the thylora-dash SQL editor, signed in with an account
-- that can read the catalog. It writes nothing and changes nothing.
--
-- Why this file exists
-- --------------------
-- The session that authored the preview surface could not reach
-- jvsdxhrfhtlgaknhjxlz.supabase.co (egress policy denied CONNECT), so it could
-- not read the live schema. 0001_edf_chairman_preview.sql therefore declares
-- its read of the EDF content tables in ONE place -- the view
-- thylora_edf_preview_source -- and this preflight prints the facts needed to
-- confirm or correct that view before anything is applied.
--
-- Do not apply 0001 until section 2 and section 3 below have been read and the
-- view in 0001 matches the real column names.

-- 1. Which EDF objects actually exist -------------------------------------
select n.nspname as schema, c.relname as object,
       case c.relkind when 'r' then 'table' when 'v' then 'view'
                      when 'm' then 'matview' when 'p' then 'partitioned' end as kind
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname like '%edf%'
  and n.nspname not in ('pg_catalog','information_schema')
order by 1, 2;

-- 2. Columns of every EDF table, so the adapter view can be checked --------
select table_schema, table_name, ordinal_position, column_name, data_type, is_nullable
from information_schema.columns
where table_name like '%edf%'
  and table_schema not in ('pg_catalog','information_schema')
order by table_schema, table_name, ordinal_position;

-- 3. Existing EDF functions and their signatures --------------------------
--    thylora_edf_release_board_v1 / _validate_v1 / _set_release_metadata_v1 /
--    _publish_v1 are already in use by the dashboard. The preview functions
--    must not duplicate or replace any of them.
select n.nspname as schema,
       p.proname as function,
       pg_get_function_identity_arguments(p.oid) as arguments,
       case p.prosecdef when true then 'SECURITY DEFINER' else 'INVOKER' end as security,
       pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname like '%edf%' or p.proname = 'thylora_is_chairman'
order by 1, 2;

-- 4. How many packages exist, and in what state ---------------------------
--    This is the ONLY honest answer to "are there six Edition v2 products".
--    Nothing outside the backend can answer it.
select state, count(*) as packages
from public.thylora_edf_packages
group by state
order by state;

-- 5. Is pgcrypto available? 0001 needs digest() for the content binding ----
select extname, extnamespace::regnamespace as installed_in
from pg_extension
where extname in ('pgcrypto');
