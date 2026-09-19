-- Applied to jvsdxhrfhtlgaknhjxlz as migration 20260919173843
-- thy_chairman_preview_decision_rpc_537
--
-- RELEASE / REVISE / HOLD, recorded from the Chairman's own session.
--
-- RELEASE     records the approval and moves the product into the Shopify
--             activation workflow: active_allowed becomes true, the next
--             executable work becomes the activation itself, and a queued
--             EXTERNAL_WRITE autonomy task is raised. No second confirmation.
-- REVISE      keeps the product DRAFT, captures the note, activates nothing.
-- HOLD        preserves everything, activates nothing.
--
-- This function does NOT call Shopify. Activation is an external write on a
-- live storefront; it is queued for the worker that holds those credentials,
-- and the queue row is the Chairman's authority for it.

create or replace function public.thylora_chairman_preview_decision_v1(
  p_packet_code text,
  p_decision    text,
  p_note        text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_uid     uuid := auth.uid();
  v_email   text;
  v_note    text := nullif(btrim(coalesce(p_note, '')), '');
  p         public.thylora_chairman_preview_packets%rowtype;
  a         public.thylora_delivery_assets%rowtype;
  v_before  text;
  v_after   text;
  v_decision_id uuid;
  v_task    text;
begin
  if not public.thylora_is_chairman() or v_uid is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'CHAIRMAN_ONLY: a release decision requires an authenticated Chairman session.');
  end if;

  if p_decision not in ('RELEASE','REVISE','HOLD') then
    return jsonb_build_object(
      'ok', false,
      'reason', format('INVALID_DECISION: expected RELEASE, REVISE or HOLD, got %L', p_decision));
  end if;

  select * into p from public.thylora_chairman_preview_packets
   where packet_code = p_packet_code for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'PACKET_NOT_FOUND: ' || p_packet_code);
  end if;

  select * into a from public.thylora_delivery_assets
   where external_product_id = p.product_gid;

  -- A decision is about a specific artifact. If no bytes are bound there is
  -- nothing the Chairman can have seen, so the decision is refused rather than
  -- recorded against an absent file.
  if a.file_bytes is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'NO_BOUND_DELIVERY_BYTES: this packet has no delivery asset carrying file bytes.');
  end if;

  select u.email into v_email from auth.users u where u.id = v_uid;

  v_before := p.packet_state;
  v_after  := case p_decision
                when 'RELEASE' then 'APPROVED'
                when 'REVISE'  then 'REVISE'
                when 'HOLD'    then 'HELD'
              end;

  update public.thylora_chairman_preview_packets
     set packet_state = v_after
   where packet_code = p_packet_code;

  insert into public.thylora_chairman_preview_decisions(
    packet_code, product_gid, decision, packet_state_before, packet_state_after,
    note, decided_by, decided_by_email, evidence)
  values (
    p_packet_code, p.product_gid, p_decision, v_before, v_after,
    v_note, v_uid, v_email,
    jsonb_build_object(
      'product_title',        p.product_title,
      'price',                p.price,
      'page_count_recorded',  p.page_count,
      'packet_artifact_hash', p.artifact_hash,
      'delivery_asset_id',    a.asset_id,
      'delivery_filename',    a.filename,
      'delivery_sha256',      a.content_sha256,
      'delivery_bytes',       octet_length(a.file_bytes),
      'artifact_current',     (a.content_sha256 = p.artifact_hash),
      'work_code',            'THY-WORK-PREVIEW-WITNESS-NOW-537',
      'decision_surface',     'CHAIRMAN_APPROVAL_SCREEN',
      'backend_write_time',   now()))
  returning decision_id into v_decision_id;

  if p_decision = 'RELEASE' then
    insert into public.thylora_product_release_decisions(
      external_product_id, product_title, approved_visual_url,
      visual_approved, rights_release_confirmed, decided_by, decision_note, evidence)
    select p.product_gid, p.product_title, p.cover_url, true, true, v_uid,
           coalesce(v_note, 'RELEASED from the Chairman approval screen after opening the bound preview.'),
           jsonb_build_object(
             'packet_code',        p.packet_code,
             'preview_decision_id', v_decision_id,
             'delivery_sha256',    a.content_sha256,
             'decision_source',    'CHAIRMAN_APPROVAL_SCREEN_537');

    update public.thylora_store_product_readiness
       set active_allowed       = true,
           next_executable_work = 'SHOPIFY ACTIVATION: set product status ACTIVE and publish to Online Store + Shop. Chairman RELEASE recorded ' || to_char(now(), 'YYYY-MM-DD HH24:MI') || ' UTC.',
           evidence             = coalesce(evidence, '{}'::jsonb) || jsonb_build_object(
             'chairman_release_decision', jsonb_build_object(
               'decision_id',  v_decision_id,
               'packet_code',  p.packet_code,
               'decided_at',   now(),
               'decided_by',   v_email,
               'note',         v_note)),
           updated_at = now()
     where external_product_id = p.product_gid;

    v_task := 'THY-AUTO-SHOPIFY-ACTIVATE-' || p.packet_code;
    insert into public.thylora_autonomy_tasks(
      canonical_id, title, directive, department_code, source_reference,
      priority, state, autonomy_class, evidence)
    values (
      v_task,
      'Shopify activation — ' || p.product_title,
      'Chairman RELEASE recorded on ' || p.packet_code || '. Set the Shopify product to ACTIVE and publish it to Online Store + Shop. Change nothing else: no price, description, cover or artifact change is authorized by this task.',
      'STORE_BACKEND',
      p.product_gid,
      90, 'QUEUED', 'EXTERNAL_WRITE',
      jsonb_build_object(
        'preview_decision_id', v_decision_id,
        'packet_code',         p.packet_code,
        'external_product_id', p.product_gid,
        'delivery_sha256',     a.content_sha256,
        'authorized_by',       v_email))
    on conflict (canonical_id) do update
      set state       = 'QUEUED',
          blocker     = null,
          priority    = 90,
          evidence    = excluded.evidence,
          updated_at  = now();
  else
    -- REVISE and HOLD both withhold activation. Nothing is published, nothing
    -- is scheduled, and the artifact is left exactly as it is.
    update public.thylora_store_product_readiness
       set active_allowed       = false,
           next_executable_work = case p_decision
             when 'REVISE' then 'CHAIRMAN REVISE: hold at DRAFT and act on the Chairman note recorded ' || to_char(now(), 'YYYY-MM-DD HH24:MI') || ' UTC.'
             else 'CHAIRMAN HOLD: preserve current state. No activation, no publication, no change.' end,
           evidence             = coalesce(evidence, '{}'::jsonb) || jsonb_build_object(
             'chairman_preview_decision', jsonb_build_object(
               'decision',    p_decision,
               'decision_id', v_decision_id,
               'packet_code', p.packet_code,
               'decided_at',  now(),
               'decided_by',  v_email,
               'note',        v_note)),
           updated_at = now()
     where external_product_id = p.product_gid;
  end if;

  return jsonb_build_object(
    'ok', true,
    'decision_id',       v_decision_id,
    'packet_code',       p_packet_code,
    'decision',          p_decision,
    'packet_state_before', v_before,
    'packet_state_after',  v_after,
    'note',              v_note,
    'decided_by_email',  v_email,
    'decided_at',        now(),
    'activation_queued', (p_decision = 'RELEASE'),
    'activation_task',   v_task);
end
$function$;

grant execute on function public.thylora_chairman_preview_decision_v1(text, text, text) to authenticated, service_role;

comment on function public.thylora_chairman_preview_decision_v1(text, text, text) is
  'Records the Chairman RELEASE / REVISE / HOLD decision on a preview packet. RELEASE queues Shopify activation; REVISE and HOLD withhold it. Never calls Shopify itself.';
