-- Applied to jvsdxhrfhtlgaknhjxlz as migration 20260919173806
-- thy_chairman_approval_screen_537
--
-- One authenticated read behind the Chairman approval screen. Everything the
-- screen shows comes from here: the packet, the delivery asset actually bound
-- to the product, the page count recomputed from the stored bytes (not copied
-- from prose), the listed price, what the buyer receives, the storefront state,
-- and the Chairman's own last decision.
--
-- The card order is the order the Chairman named in the directive.

create or replace function public.thylora_chairman_approval_screen_v1()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_cards jsonb;
  v_order constant text[] := array[
    'PKT-BRAMBLE-001','PKT-CITYPOWER-001','PKT-LASTMATCH-001','PKT-HANDOFF-001'
  ];
begin
  if not public.thylora_is_chairman() then
    return jsonb_build_object(
      'ok', false,
      'reason', 'CHAIRMAN_ONLY: this approval screen is readable by the Chairman only.');
  end if;

  select u.email into v_email from auth.users u where u.id = v_uid;

  select coalesce(jsonb_agg(card order by card_rank), '[]'::jsonb)
    into v_cards
  from (
    select
      coalesce(array_position(v_order, p.packet_code), 999) as card_rank,
      jsonb_build_object(
        'packet_code',          p.packet_code,
        'product_title',        p.product_title,
        'product_gid',          p.product_gid,
        'price',                p.price,
        'page_count_recorded',  p.page_count,
        -- Page count read from the stored PDF this call, never from prose.
        'page_count_in_bytes',  pages.page_objects,
        'page_count_agrees',    (pages.page_objects is not null
                                 and pages.page_objects = p.page_count),
        'what_buyer_receives',  p.what_buyer_receives,
        'delivery_method',      p.delivery_method,
        'mobile_readability',   p.mobile_readability,
        'page_order',           p.page_order,
        'cover_url',            p.cover_url,
        'remaining_blocker',    p.remaining_blocker,
        'packet_state',         p.packet_state,
        'packet_artifact_hash', p.artifact_hash,
        'bound_asset', case when a.asset_id is null then null else jsonb_build_object(
          'asset_id',       a.asset_id,
          'filename',       a.filename,
          'mime_type',      a.mime_type,
          'bytes',          octet_length(a.file_bytes),
          'content_sha256', a.content_sha256,
          'release_state',  a.release_state) end,
        'has_bound_bytes',      (a.file_bytes is not null),
        'artifact_current',     (a.content_sha256 is not null
                                 and a.content_sha256 = p.artifact_hash),
        'can_open_preview',     (a.file_bytes is not null),
        'storefront', jsonb_build_object(
          'product_state',   r.product_state,
          'active_allowed',  r.active_allowed,
          'rights_passed',   r.rights_passed,
          'delivery_connected', r.delivery_connected),
        'last_decision', case when d.decision is null then null else jsonb_build_object(
          'decision',         d.decision,
          'note',             d.note,
          'decided_at',       d.decided_at,
          'decided_by_email', d.decided_by_email) end
      ) as card
    from public.thylora_chairman_preview_packets p
    left join public.thylora_delivery_assets a
      on a.external_product_id = p.product_gid
    left join public.thylora_store_product_readiness r
      on r.external_product_id = p.product_gid
    left join lateral (
      select dd.decision, dd.note, dd.decided_at, dd.decided_by_email
      from public.thylora_chairman_preview_decisions dd
      where dd.packet_code = p.packet_code
      order by dd.decided_at desc, dd.decision_ordinal desc
      limit 1
    ) d on true
    left join lateral (
      select (select count(*)
              from regexp_matches(encode(a.file_bytes, 'escape'), '/Type\s*/Page[^s]', 'g')) as page_objects
      where a.file_bytes is not null
    ) pages on true
  ) ranked;

  return jsonb_build_object(
    'ok', true,
    'generated_at', now(),
    'chairman', jsonb_build_object('user_id', v_uid, 'email', v_email),
    'preview_endpoint',
      'https://jvsdxhrfhtlgaknhjxlz.supabase.co/functions/v1/chairman-preview',
    'token_lifetime_minutes', 15,
    'cards', v_cards);
end
$function$;

grant execute on function public.thylora_chairman_approval_screen_v1() to authenticated, service_role;

comment on function public.thylora_chairman_approval_screen_v1() is
  'Chairman approval screen read. Page count is recomputed from the stored PDF bytes on every call so the screen cannot show a page count the artifact does not have.';
