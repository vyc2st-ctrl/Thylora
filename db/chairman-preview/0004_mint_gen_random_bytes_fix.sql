-- Applied to jvsdxhrfhtlgaknhjxlz as migration 20260919174015
-- thy_preview_token_mint_gen_random_bytes_fix_537
--
-- ROOT-CAUSE REPAIR. thylora_preview_token_mint_v1() was unusable: it is
-- SECURITY DEFINER with search_path pinned to 'public', and gen_random_bytes()
-- belongs to pgcrypto in the extensions schema, so every Chairman mint raised
--   42883: function gen_random_bytes(integer) does not exist
-- before a token row could be written. thylora_chairman_preview_tokens holding
-- zero rows was not evidence that the Chairman had not looked; it was evidence
-- that no mint had ever succeeded.
--
-- The pinned search_path is deliberately left narrow. Only the one missing
-- schema prefix is added.

create or replace function public.thylora_preview_token_mint_v1(p_packet_code text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_gid text;
  v_token text;
  v_has_bytes boolean;
begin
  if not thylora_is_chairman() then
    return jsonb_build_object('ok', false,
      'reason', 'CHAIRMAN_ONLY: preview tokens are minted by the Chairman only.');
  end if;

  select p.product_gid into v_gid
  from thylora_chairman_preview_packets p where p.packet_code = p_packet_code;
  if v_gid is null then
    return jsonb_build_object('ok', false, 'reason', 'PACKET_NOT_FOUND: ' || p_packet_code);
  end if;

  select (a.file_bytes is not null) into v_has_bytes
  from thylora_delivery_assets a where a.external_product_id = v_gid;
  if coalesce(v_has_bytes, false) = false then
    return jsonb_build_object('ok', false,
      'reason', 'NO_BOUND_DELIVERY_BYTES: this packet has no delivery asset carrying file bytes, so there is nothing to render.');
  end if;

  -- Schema-qualified: pgcrypto is installed in "extensions", which is not on
  -- this function's pinned search_path.
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into thylora_chairman_preview_tokens(token, packet_code, product_gid, issued_to, expires_at)
  values (v_token, p_packet_code, v_gid, auth.uid(), now() + interval '15 minutes');

  return jsonb_build_object('ok', true, 'token', v_token, 'packet_code', p_packet_code,
    'expires_at', now() + interval '15 minutes');
end $function$;

grant execute on function public.thylora_preview_token_mint_v1(text) to anon, authenticated, service_role;
