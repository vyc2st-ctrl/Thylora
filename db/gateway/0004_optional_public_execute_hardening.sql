-- THYLORA CONNECTION GATEWAY · 0004 · OPTIONAL hardening: close blanket PUBLIC EXECUTE
--
-- THIS FILE IS OPTIONAL AND IT TOUCHES EXISTING OBJECTS. 0001-0003 are additive;
-- this one is not. It requires an explicit Chairman decision. The gateway works
-- without it - but with a residual exposure, stated plainly below.
--
-- THE FINDING (verified on thylora-dash, 2026-09-17)
--
-- 27 functions in schema public carry EXECUTE for PUBLIC, 15 of them
-- SECURITY DEFINER. Among them:
--
--   thylora_export_b2b_rights_package(text)   SECURITY DEFINER
--   thylora_evaluate_rights_gate(text)        SECURITY DEFINER
--   public_get_thylora_wares_v1()             SECURITY DEFINER
--   thylora_submit_*  (11 functions)          SECURITY DEFINER
--
-- PUBLIC means every role, including every role created in the future. So the
-- new thylora_gateway role does NOT reach only the nine gateway functions; it
-- also inherits these 27 through PUBLIC. The same is true of anon today, which
-- is how these functions are presently reached - this is a PRE-EXISTING state,
-- not one the gateway introduces. But the gateway would inherit it, and a
-- capability boundary that leaks by default is not a boundary.
--
-- WHAT THIS FILE DOES, AND WHY IT IS SAFE
--
-- For every non-trigger function in public that PUBLIC can execute, it first
-- GRANTS execute explicitly to anon and authenticated - which changes nothing,
-- because those roles already hold that access through PUBLIC - and only then
-- REVOKES it from PUBLIC.
--
-- Effective access for anon, authenticated, service_role and postgres is
-- therefore IDENTICAL before and after. What changes is that the grant becomes
-- explicit and auditable, and roles that are neither anon nor authenticated -
-- thylora_gateway among them - stop inheriting it.
--
-- Trigger functions are skipped: they are invoked by the trigger, not by a
-- caller, and revoking them buys nothing.
--
-- Run 0001-0003 first. Idempotent: a second run finds nothing left to change.

begin;

do $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select p.oid,
           quote_ident(n.nspname) || '.' || quote_ident(p.proname)
             || '(' || pg_get_function_identity_arguments(p.oid) || ')' as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.prorettype <> 'trigger'::regtype
       and has_function_privilege('public', p.oid, 'EXECUTE')
       -- never touch the gateway's own functions: they are granted explicitly
       -- to thylora_gateway and were never granted to PUBLIC.
       and p.proname not like 'thylora_gw_%'
  loop
    -- Preserve today's effective access, explicitly.
    execute format('grant execute on function %s to anon, authenticated', r.sig);
    -- Then close the blanket grant.
    execute format('revoke execute on function %s from public', r.sig);
    n := n + 1;
  end loop;
  raise notice 'THYLORA gateway hardening: converted % blanket PUBLIC EXECUTE grants into explicit anon/authenticated grants', n;
end $$;

-- Stop the next function created in this schema from re-opening the hole.
-- Applies to objects created by this role from here on, not retroactively.
alter default privileges in schema public revoke execute on functions from public;

commit;
