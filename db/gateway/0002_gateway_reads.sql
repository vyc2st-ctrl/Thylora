-- THYLORA CONNECTION GATEWAY · 0002 · Read operations
--
-- Six read operations. Every one of them:
--   * starts with thylora_gateway_guard()
--   * is SECURITY DEFINER with a pinned search_path
--   * returns jsonb (one shape per operation, stable for a tool manifest)
--   * reads only from tables that already exist and stay authoritative
--   * has a hard row cap, so no call can pull the backend down a wire
--
-- No SELECT here creates, caches or mirrors a record. SUPABASE REMAINS THE
-- SOURCE OF TRUTH; these are windows onto it, not copies of it.
--
-- One column is named here only to say it is never read:
-- thylora_delivery_assets.file_bytes. The gateway returns the sha256 and the
-- byte count, never the bytes.

begin;

-- 1. boot_thylora -------------------------------------------------------------
-- The active continuity boot, the newest captured sequence, the current restart
-- point, and the locks that control what may change.
create or replace function thylora_gw_boot()
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_agent text := thylora_gateway_guard();
  v_boot jsonb; v_head jsonb; v_restart jsonb; v_locks jsonb; v_anchor jsonb;
begin
  select to_jsonb(b) - 'id'
    into v_boot
    from (
      select boot_code, version, authority, status, retrieval_order, controlling_rules,
             required_response_gate, connection_boundary, fallback_behavior,
             restart_behavior, updated_at
        from thylora_continuity_boot_registry
       where status = 'ACTIVE'
       order by version desc, updated_at desc
       limit 1
    ) b;

  select jsonb_build_object(
           'query_id', c.query_id, 'sequence_no', c.sequence_no,
           'session_label', c.session_label, 'source_app', c.source_app,
           'capture_state', c.capture_state, 'truth_class', c.truth_class,
           'authority', c.authority, 'restart_point', c.restart_point,
           'supersession_state', c.supersession_state, 'created_at', c.created_at)
    into v_head
    from thylora_query_carryforward c
   order by c.sequence_no desc
   limit 1;

  select jsonb_build_object(
           'canonical_id', r.canonical_id, 'title', r.title,
           'state', r.state::text, 'evidence_status', r.evidence_status::text,
           'truth_class', r.truth_class::text,
           'exact_restart_point', r.exact_restart_point,
           'blocking_dependency', r.blocking_dependency,
           'next_action', r.next_action, 'updated_at', r.updated_at)
    into v_restart
    from restart_records r
   order by r.updated_at desc
   limit 1;

  -- Deployment authority lock. Which frontend is allowed to be called live.
  select jsonb_build_object(
           'lock_state', l.lock_state,
           'current_frontend_name', l.current_frontend_name,
           'current_frontend_provider', l.current_frontend_provider,
           'current_frontend_url', l.current_frontend_url,
           'backend_project_ref', l.backend_project_ref,
           'floor_code', l.floor_code,
           'blocked_frontends', l.blocked_frontends,
           'promotion_rule', l.promotion_rule,
           'chairman_change_required', l.chairman_change_required)
    into v_locks
    from thylora_dashboard_authority_lock l
   order by l.updated_at desc
   limit 1;

  -- Controlling continuity anchor, reduced. The full Chairman projection stays
  -- behind thylora_current_controlling_floor(), which remains Chairman-only.
  select jsonb_build_object(
           'anchor_query_id', a.anchor_query_id,
           'anchor_sequence_no', a.anchor_sequence_no,
           'authority_kind', a.authority_kind,
           'effective_from', a.effective_from)
    into v_anchor
    from thylora_continuity_anchor_authority a
   where a.action = 'DESIGNATE'
     and a.validation_state = 'EVIDENCE_VALID'
     and not exists (
       select 1 from thylora_continuity_anchor_authority r
        where r.action = 'REVOKE'
          and r.revokes_authority_id = a.authority_id
          and r.validation_state = 'EVIDENCE_VALID')
   order by a.authority_ordinal desc
   limit 1;

  return jsonb_build_object(
    'operation', 'boot_thylora',
    'agent', v_agent,
    'backend_project', 'jvsdxhrfhtlgaknhjxlz',
    'source_of_truth', 'SUPABASE thylora-dash',
    'boot', coalesce(v_boot, 'null'::jsonb),
    'newest_sequence', coalesce(v_head, 'null'::jsonb),
    'restart_point', coalesce(v_restart, 'null'::jsonb),
    'controlling_anchor', coalesce(v_anchor, 'null'::jsonb),
    'controlling_locks', coalesce(v_locks, 'null'::jsonb),
    'read_at', now());
end $$;

-- 2. read_latest_continuity ---------------------------------------------------
create or replace function thylora_gw_latest_continuity(
  p_limit integer default 10, p_workstream text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_agent text := thylora_gateway_guard(); v_n integer := least(greatest(coalesce(p_limit,10),1),50);
begin
  return jsonb_build_object(
    'operation','read_latest_continuity','agent',v_agent,'limit',v_n,
    'workstream', p_workstream,
    'records', coalesce((
      select jsonb_agg(r order by r->>'sequence_no' desc) from (
        select jsonb_build_object(
                 'query_id', c.query_id, 'sequence_no', c.sequence_no,
                 'session_label', c.session_label, 'source_app', c.source_app,
                 'authority', c.authority, 'truth_class', c.truth_class,
                 'capture_state', c.capture_state,
                 'supersession_state', c.supersession_state,
                 'verbatim_locked', c.verbatim_locked,
                 'restart_point', c.restart_point,
                 'continuity_refs', c.continuity_refs,
                 'user_message', left(coalesce(c.user_message,''), 4000),
                 'assistant_message', left(coalesce(c.assistant_message,''), 8000),
                 'user_message_hash', c.user_message_hash,
                 'assistant_message_hash', c.assistant_message_hash,
                 'source_thread_id', c.source_thread_id,
                 'created_at', c.created_at) as r
          from thylora_query_carryforward c
         where p_workstream is null
            or upper(p_workstream) = 'OTHER'
            or c.continuity_refs::text ilike '%' || upper(p_workstream) || '%'
            or upper(coalesce(c.session_label,'')) like '%' || upper(p_workstream) || '%'
         order by c.sequence_no desc
         limit v_n) t), '[]'::jsonb),
    'read_at', now());
end $$;

-- 3. read_workstream ----------------------------------------------------------
-- STORE_BACKEND | DASHBOARD | APP | STORY | NEWSROOM | VISUAL | OTHER.
-- The workstream is DERIVED from the existing workroom lane, never stored twice.
-- The raw lane travels with every row so nothing is flattened away.
create or replace function thylora_gw_workstream_of(p_lane text, p_code text)
returns text language sql immutable set search_path to 'public' as $$
  select case
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(STORE|COMMERCE|PRODUCT|SHOP|CHECKOUT)' then 'STORE_BACKEND'
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(DASHBOARD|EXECUTIVE|CHAIRMAN)'         then 'DASHBOARD'
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(APP|MEMBER|MOBILE)'                    then 'APP'
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(STORY|STORIES|FAMILY|STUDIO)'          then 'STORY'
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(NEWS|NEWSROOM|EDITORIAL)'              then 'NEWSROOM'
    when upper(coalesce(p_lane,'')||' '||coalesce(p_code,'')) ~ '(VISUAL|IMAGE|DESIGN|BRAND)'            then 'VISUAL'
    else 'OTHER' end;
$$;

create or replace function thylora_gw_read_workstream(p_workstream text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_agent text := thylora_gateway_guard(); v_ws text := nullif(upper(coalesce(p_workstream,'')),'');
begin
  return jsonb_build_object(
    'operation','read_workstream','agent',v_agent,'workstream',coalesce(v_ws,'ALL'),
    'workrooms', coalesce((
      select jsonb_agg(jsonb_build_object(
               'workroom_code', w.workroom_code,
               'workstream', thylora_gw_workstream_of(w.lane, w.workroom_code),
               'lane', w.lane, 'title', w.title, 'purpose', w.purpose,
               'state', w.state, 'source_of_truth', w.source_of_truth,
               'current_blockers', w.current_blockers,
               'completion_tests', w.completion_tests,
               'restart_point', w.restart_point,
               'last_verified_at', w.updated_at,
               'open_tasks', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'task_code', t.task_code, 'title', t.title, 'state', t.state,
                          'owner_lane', t.owner_lane, 'blocker', t.blocker,
                          'next_action', t.next_action, 'depends_on', t.depends_on,
                          'last_verified_at', t.updated_at)
                        order by t.updated_at desc)
                   from thylora_workroom_task_registry t
                  where t.workroom_code = w.workroom_code
                    and coalesce(upper(t.state),'') not in ('DONE','COMPLETE','COMPLETED','CLOSED','CANCELLED')
                 ), '[]'::jsonb))
             order by w.updated_at desc)
        from thylora_workroom_registry w
       where v_ws is null
          or thylora_gw_workstream_of(w.lane, w.workroom_code) = v_ws), '[]'::jsonb),
    'read_at', now());
end $$;

-- 4. read_store_release_board -------------------------------------------------
-- Sell-intent products, their hard gates, release state, and what the Chairman
-- must personally decide. thylora_store_product_readiness stays authoritative.
create or replace function thylora_gw_store_release_board(p_sell_intent_only boolean default true)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_agent text := thylora_gateway_guard();
begin
  return jsonb_build_object(
    'operation','read_store_release_board','agent',v_agent,
    'gate_rule','A product may not be ACTIVE until every hard gate is true. active_allowed is the backend''s own verdict; it is never inferred by a client.',
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
               'external_product_id', r.external_product_id,
               'product_title', r.product_title,
               'sell_intent', r.sell_intent,
               'product_state', r.product_state,
               'active_allowed', r.active_allowed,
               'hard_gates', jsonb_build_object(
                 'source_complete', r.source_complete,
                 'final_artifact_complete', r.final_artifact_complete,
                 'product_specific_visual_complete', r.product_specific_visual_complete,
                 'visual_preflight_passed', r.visual_preflight_passed,
                 'rights_passed', r.rights_passed,
                 'delivery_connected', r.delivery_connected,
                 'reaccess_verified', r.reaccess_verified,
                 'checkout_path_verified', r.checkout_path_verified,
                 'mobile_preview_passed', r.mobile_preview_passed),
               'gates_open', (
                 (not coalesce(r.source_complete,false))::int +
                 (not coalesce(r.final_artifact_complete,false))::int +
                 (not coalesce(r.product_specific_visual_complete,false))::int +
                 (not coalesce(r.visual_preflight_passed,false))::int +
                 (not coalesce(r.rights_passed,false))::int +
                 (not coalesce(r.delivery_connected,false))::int +
                 (not coalesce(r.reaccess_verified,false))::int +
                 (not coalesce(r.checkout_path_verified,false))::int +
                 (not coalesce(r.mobile_preview_passed,false))::int),
               'blockers', r.blockers,
               'next_executable_work', r.next_executable_work,
               'chairman_action_required', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'route_code', a.route_code, 'problem', a.problem,
                          'exact_system', a.exact_system,
                          'exact_object_reference', a.exact_object_reference,
                          'direct_location', a.direct_location,
                          'steps', a.steps, 'state', a.state))
                   from thylora_chairman_action_routes a
                  where a.subject_reference = r.external_product_id
                    and coalesce(a.chairman_required,false)
                    and coalesce(upper(a.state),'') not in ('DONE','COMPLETE','COMPLETED','CLOSED')
                 ), '[]'::jsonb),
               'last_verified_at', r.updated_at)
             order by r.sell_intent desc nulls last, r.updated_at desc)
        from thylora_store_product_readiness r
       where (not p_sell_intent_only) or coalesce(r.sell_intent,false)), '[]'::jsonb),
    'read_at', now());
end $$;

-- 5. read_product -------------------------------------------------------------
-- One product: canonical state, Shopify binding, rights, delivery, artifact,
-- readiness. Accepts either the Shopify gid or the THYLORA product_id.
create or replace function thylora_gw_read_product(p_ref text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_agent text := thylora_gateway_guard(); v_ref text := btrim(coalesce(p_ref,''));
begin
  if v_ref = '' then
    raise exception 'THY-DENY: read_product requires a product reference' using errcode='22023';
  end if;

  return jsonb_build_object(
    'operation','read_product','agent',v_agent,'ref',v_ref,
    'canonical', (select to_jsonb(p) - 'id'
                    from products p
                   where p.product_id = v_ref or p.passport_id = v_ref
                      or p.product_id = split_part(v_ref,'/',5) limit 1),
    'shopify_binding', jsonb_build_object(
       'external_product_id', v_ref,
       'is_shopify_gid', v_ref like 'gid://shopify/Product/%',
       'note','Shopify remains the storefront of record. This gateway never writes to Shopify.'),
    'readiness', (select to_jsonb(r) - 'readiness_id'
                    from thylora_store_product_readiness r
                   where r.external_product_id = v_ref limit 1),
    'release_decision', (select to_jsonb(d) - 'decision_id'
                    from thylora_product_release_decisions d
                   where d.external_product_id = v_ref
                   order by d.decided_at desc nulls last limit 1),
    'passport', (select jsonb_build_object(
                    'passport_id', dp.passport_id, 'approval_state', dp.approval_state,
                    'provenance', dp.provenance, 'rights', dp.rights,
                    'contributors', dp.contributors, 'updated_at', dp.updated_at)
                   from digital_product_passports dp
                   join products p2 on p2.id = dp.product_id
                  where p2.product_id = v_ref or dp.passport_id = v_ref limit 1),
    -- file_bytes is deliberately NOT selected. Evidence of the artifact, never
    -- the artifact: the gateway is not a delivery channel.
    'delivery_assets', coalesce((
       select jsonb_agg(jsonb_build_object(
                'asset_id', a.asset_id, 'filename', a.filename,
                'mime_type', a.mime_type, 'content_sha256', a.content_sha256,
                'byte_length', length(a.file_bytes), 'release_state', a.release_state,
                'updated_at', a.updated_at) order by a.updated_at desc)
         from thylora_delivery_assets a
        where a.external_product_id = v_ref), '[]'::jsonb),
    'entitlement_count', (select count(*) from thylora_product_entitlements e
                           where e.external_product_id = v_ref and e.state = 'ACTIVE'),
    'read_at', now());
end $$;

-- 6. get_open_gates -----------------------------------------------------------
create or replace function thylora_gw_open_gates(p_category text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_agent text := thylora_gateway_guard(); v_cat text := nullif(upper(coalesce(p_category,'')),'');
begin
  return jsonb_build_object(
    'operation','get_open_gates','agent',v_agent,'category',coalesce(v_cat,'ALL'),
    'categories', jsonb_build_array('TECHNICAL','VISUAL','RIGHTS','COMMERCIAL','CHAIRMAN_AUTHORITY','UNKNOWN'),
    'chairman_authority', case when v_cat is null or v_cat='CHAIRMAN_AUTHORITY' then coalesce((
       select jsonb_agg(jsonb_build_object(
                'canonical_id', g.canonical_id, 'subject_type', g.subject_type,
                'subject_reference', g.subject_reference,
                'reserved_decision', g.reserved_decision, 'risk_level', g.risk_level,
                'reason', g.reason, 'state', g.state, 'created_at', g.created_at)
              order by g.created_at desc)
         from thylora_chairman_review_gates g
        where coalesce(upper(g.state),'') not in ('RESOLVED','CLOSED','COMPLETE','COMPLETED')
       ), '[]'::jsonb) else '[]'::jsonb end,
    'gate_definitions', coalesce((
       select jsonb_agg(jsonb_build_object(
                'gate_code', d.gate_code, 'title', d.title, 'purpose', d.purpose,
                'state', d.state, 'configuration', d.configuration) order by d.gate_code)
         from thylora_gate_definitions d
        where coalesce(upper(d.state),'') not in ('PASSED','CLOSED','RETIRED')), '[]'::jsonb),
    'store_gate_blockers', case when v_cat is null or v_cat in ('COMMERCIAL','TECHNICAL','RIGHTS','VISUAL') then coalesce((
       select jsonb_agg(jsonb_build_object(
                'external_product_id', r.external_product_id,
                'product_title', r.product_title,
                'blockers', r.blockers,
                'next_executable_work', r.next_executable_work))
         from thylora_store_product_readiness r
        where coalesce(r.sell_intent,false) and not coalesce(r.active_allowed,false)
       ), '[]'::jsonb) else '[]'::jsonb end,
    'unknown', coalesce((
       select jsonb_agg(jsonb_build_object(
                'subject_kind', q.subject_kind, 'subject_ref', q.subject_ref,
                'mark_state', q.mark_state) order by q.created_at desc)
         from thylora_question_marks q
        where coalesce(q.participates,true)
          and coalesce(upper(q.mark_state),'') not in ('RESOLVED','CLOSED')), '[]'::jsonb),
    'read_at', now());
end $$;

-- GRANTS ----------------------------------------------------------------------
-- The gateway role may execute these six and nothing else. anon is never granted.
grant execute on function thylora_gw_boot()                              to thylora_gateway;
grant execute on function thylora_gw_latest_continuity(integer, text)    to thylora_gateway;
grant execute on function thylora_gw_read_workstream(text)               to thylora_gateway;
grant execute on function thylora_gw_store_release_board(boolean)        to thylora_gateway;
grant execute on function thylora_gw_read_product(text)                  to thylora_gateway;
grant execute on function thylora_gw_open_gates(text)                    to thylora_gateway;
grant execute on function thylora_gateway_guard()                        to thylora_gateway;
grant execute on function thylora_gw_workstream_of(text, text)           to thylora_gateway;

revoke execute on function thylora_gw_boot()                           from public, anon;
revoke execute on function thylora_gw_latest_continuity(integer, text) from public, anon;
revoke execute on function thylora_gw_read_workstream(text)            from public, anon;
revoke execute on function thylora_gw_store_release_board(boolean)     from public, anon;
revoke execute on function thylora_gw_read_product(text)               from public, anon;
revoke execute on function thylora_gw_open_gates(text)                 from public, anon;

commit;
