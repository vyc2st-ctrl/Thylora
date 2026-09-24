-- THY-AUDIT-SYSTEM-PROMOTION-20260924-001 / repair R1
-- STATUS: PROPOSED — NOT APPLIED. Requires Chairman approval. Validate on a Supabase branch first.
--
-- Plain meaning: every insert/update/delete on a listed mechanism table writes
-- one append-only row to audit_events, so the W (witness) factor becomes
-- measurable by table name. It does not add, change or remove any business row.
--
-- Before applying, confirm:
--   1. The truth_class enum label to use (read: select distinct truth_class from audit_events).
--      It is written below as :'truth_class' and must be replaced.
--   2. The evidence_status enum accepts 'NONE' (it is the column default).

create or replace function public.thy_witness_row_change_v1()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_key text  := coalesce(v_row->>'id', v_row->>'code', v_row->>'work_code', v_row->>'policy_code',
                          v_row->>'product_id', md5(v_row::text));
begin
  insert into public.audit_events
    (canonical_id, event_type, entity_type, entity_id, actor_user_id, truth_class,
     previous_state, requested_state, payload, payload_hash)
  values
    ('THY-WITNESS-' || tg_table_name || '-' || v_key || '-' || txid_current(),
     'ROW_' || tg_op, tg_table_name, v_key, auth.uid(), /* REPLACE */ :'truth_class',
     case when tg_op <> 'INSERT' then to_jsonb(old)->>'state' end,
     case when tg_op <> 'DELETE' then to_jsonb(new)->>'state' end,
     jsonb_build_object('op', tg_op, 'table', tg_table_name),
     md5(v_row::text));
  return null;
end $$;

-- First wave (dashboard floor + commerce). Additive; drop-free.
do $$
declare t text;
begin
  foreach t in array array[
    'approval_queue','products','business_products','digital_product_passports','productions',
    'thylora_qyris_work_item_checks','membership_plans','prices','thylora_product_entitlements'
  ] loop
    execute format(
      'create trigger thy_witness_%1$s after insert or update or delete on public.%1$I
         for each row execute function public.thy_witness_row_change_v1()', t);
  end loop;
end $$;
