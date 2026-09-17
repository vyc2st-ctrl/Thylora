-- THYLORA CONNECTION GATEWAY · 0001 · Gateway identity and authority predicate
--
-- The gateway is a NON-PRIVILEGED database identity. It is not service_role,
-- not postgres, and not the Chairman.
--
-- Why this file exists at all:
--   thylora_is_trusted_server() is defined as `auth.role() = 'service_role'`.
--   Service role bypasses RLS on all 707 public tables. Any gateway built on
--   service_role would therefore hand every connected AI client unbounded read
--   and write access to the whole backend, which is exactly what the gateway
--   directive forbids. So the gateway gets its own role with ZERO table
--   privileges, and reaches data only through the named functions in 0002/0003.
--
-- Additive only. No existing role, function, policy or grant is altered.

begin;

-- 1. THE ROLE -----------------------------------------------------------------
-- NOLOGIN: nobody connects as this role directly. It is only ever assumed via a
-- signed JWT carrying `role: thylora_gateway`, minted by the edge function.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'thylora_gateway') then
    create role thylora_gateway nologin noinherit;
  end if;
end $$;

-- PostgREST must be able to switch into the role; it may not do anything else.
grant thylora_gateway to authenticator;
grant usage on schema public to thylora_gateway;

-- Explicitly withhold everything. Stated rather than assumed, so a future
-- default-privilege change cannot silently widen the gateway.
revoke all on all tables    in schema public from thylora_gateway;
revoke all on all sequences in schema public from thylora_gateway;
revoke all on all functions in schema public from thylora_gateway;
alter default privileges in schema public revoke all on tables    from thylora_gateway;
alter default privileges in schema public revoke all on functions from thylora_gateway;

-- 2. PREDICATES ---------------------------------------------------------------
create or replace function thylora_is_gateway()
returns boolean language sql stable set search_path to 'public','auth' as $$
  select coalesce(auth.role(), '') = 'thylora_gateway';
$$;

comment on function thylora_is_gateway() is
  'True when the caller is the connection gateway. Distinct from thylora_is_trusted_server(): the gateway is NOT service_role and does NOT bypass RLS.';

-- Which external agent is behind this call. Set by the edge function as a JWT
-- claim; it cannot be forged by the agent because the agent never holds the
-- JWT signing secret - it holds only its own gateway key.
create or replace function thylora_gateway_agent()
returns text language sql stable set search_path to 'public','auth' as $$
  select nullif(upper(coalesce(auth.jwt() ->> 'agent_code', '')), '');
$$;

create or replace function thylora_gateway_thread()
returns text language sql stable set search_path to 'public','auth' as $$
  select nullif(auth.jwt() ->> 'source_thread', '');
$$;

-- Every gateway function starts with this. One place to deny, one error code.
create or replace function thylora_gateway_guard()
returns text language plpgsql stable set search_path to 'public' as $$
declare a text;
begin
  if not (thylora_is_gateway() or thylora_is_chairman() or thylora_is_trusted_server()) then
    raise exception 'THY-DENY: caller is not the THYLORA connection gateway'
      using errcode = 'insufficient_privilege';
  end if;
  a := thylora_gateway_agent();
  if thylora_is_gateway() then
    if a is null then
      raise exception 'THY-DENY: gateway call carries no agent_code claim'
        using errcode = 'insufficient_privilege';
    end if;
    if not exists (
      select 1 from thylora_autonomy_credentials c
      where c.credential_code = 'GATEWAY_AGENT:' || a and c.enabled
    ) then
      raise exception 'THY-DENY: agent % is not an enabled gateway agent', a
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return coalesce(a, case when thylora_is_chairman() then 'CHAIRMAN' else 'TRUSTED_SERVER' end);
end $$;

-- 3. KEY VERIFICATION ---------------------------------------------------------
-- The one gateway function that runs BEFORE an agent is known, so it cannot use
-- thylora_gateway_guard(). It takes a digest, never a key, and returns only the
-- agent code - no secret ever travels back out.
create or replace function thylora_gw_authenticate(p_key_sha256 text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_code text;
begin
  if not thylora_is_gateway() then
    raise exception 'THY-DENY: only the gateway may authenticate agents'
      using errcode = 'insufficient_privilege';
  end if;
  if coalesce(p_key_sha256,'') !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('authenticated', false, 'reason', 'MALFORMED_DIGEST');
  end if;
  select replace(c.credential_code, 'GATEWAY_AGENT:', '')
    into v_code
    from thylora_autonomy_credentials c
   where c.credential_code like 'GATEWAY_AGENT:%'
     and c.enabled
     and c.secret_value = lower(p_key_sha256)
   limit 1;
  if v_code is null then
    return jsonb_build_object('authenticated', false, 'reason', 'NO_ENABLED_AGENT');
  end if;
  return jsonb_build_object('authenticated', true, 'agent_code', v_code);
end $$;

grant execute on function thylora_gw_authenticate(text) to thylora_gateway;
revoke execute on function thylora_gw_authenticate(text) from public, anon;

-- 4. AGENT REGISTRY -----------------------------------------------------------
-- Reuses the existing credential table rather than creating a second one.
-- secret_value holds a SHA-256 hex digest of the agent key, never the key.
-- Rows are seeded by the Chairman at apply time; none are created here, because
-- creating a credential is an authority act, not a migration.
comment on table thylora_autonomy_credentials is
  'Shared secret store. Gateway agents use credential_code = ''GATEWAY_AGENT:<AGENT>'' where AGENT is CHATGPT | CLAUDE | GEMINI | DASHBOARD | APP. secret_value is a sha256 hex digest of the agent key.';

commit;
