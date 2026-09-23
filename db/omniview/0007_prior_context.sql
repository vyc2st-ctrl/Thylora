-- OMNIVIEW · 0007 · Carryforward context outside the ledger
-- Work: THY-WORK-SEQUENCE-CHANGE-LEDGER-587, THY-WORK-OMNIVIEW-LIVE-APPLY-591
--
-- The ledger never back-dates rows it did not witness. Sequences that live only
-- in thylora_query_carryforward are READ where they already live and returned
-- clearly labelled, so continuity is available without the ledger lying about
-- its own history.
--
-- 591 CORRECTIONS (made before first live apply, after reading the live shape):
--  * The reviewed function was SECURITY DEFINER and granted to every signed-in
--    session. That would have bypassed thylora_query_carryforward's Chairman-only
--    policy and handed raw user/assistant messages to any account. It is now
--    SECURITY INVOKER: the carryforward table's own RLS decides who sees what.
--  * The reviewed function read only sequences BELOW the ledger floor. The live
--    ledger has gaps (carryforward 588, 589 and 590 are not ledger rows), so it
--    now returns every carryforward sequence that is not a ledger row, each
--    labelled PRE_LEDGER (below the floor) or NOT_IN_LEDGER (inside a gap).
--  * Reads are ordered by created_at inside a sequence, because the live table
--    holds 590 rows over 591 sequence numbers and a sequence may repeat.
--  * Only the two expected failures are converted into a reported state
--    (SHAPE_MISMATCH, READ_REFUSED). The reviewed catch-all "when others" is
--    gone: it would have turned any real fault into a quiet empty answer.

begin;

drop function if exists thy_sequence_prior_context(int,bigint);

create function thy_sequence_prior_context(p_limit int default 25, p_before bigint default null)
returns jsonb language plpgsql stable security invoker set search_path = public as $$
declare rows jsonb; v_floor bigint;
begin
  if to_regclass('public.thylora_query_carryforward') is null then
    return jsonb_build_object(
      'source','thylora_query_carryforward','available',false,
      'reason','REGISTRY_ABSENT',
      'note','Carryforward history is not readable from this database.',
      'rows','[]'::jsonb);
  end if;

  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public'
                    and table_name = 'thylora_query_carryforward' and column_name = 'sequence_no') then
    return jsonb_build_object(
      'source','thylora_query_carryforward','available',false,
      'reason','SHAPE_MISMATCH',
      'note','The carryforward table exists but carries no sequence_no. Not read.',
      'rows','[]'::jsonb);
  end if;

  v_floor := (select min(sequence_no) from thy_sequence_ledger);

  begin
    execute $q$
      select coalesce(jsonb_agg(r order by (r->>'sequence_no')::bigint desc, r->>'created_at' desc), '[]'::jsonb) from (
        select jsonb_build_object(
                 'sequence_no', c.sequence_no,
                 'truth_class', 'UNVERIFIED',
                 'origin', case when $3 is null or c.sequence_no < $3 then 'PRE_LEDGER' else 'NOT_IN_LEDGER' end,
                 'session_label', c.session_label,
                 'user_message',  left(c.user_message, 500),
                 'assistant_message', left(c.assistant_message, 500),
                 'created_at', c.created_at) as r
          from thylora_query_carryforward c
         where ($1 is null or c.sequence_no < $1)
           and not exists (select 1 from thy_sequence_ledger l where l.sequence_no = c.sequence_no)
         order by c.sequence_no desc, c.created_at desc
         limit greatest($2, 1)) q
    $q$ into rows using p_before, p_limit, v_floor;
  exception
    when undefined_column or undefined_table then
      return jsonb_build_object('source','thylora_query_carryforward','available',false,
        'reason','SHAPE_MISMATCH','note',sqlerrm,'rows','[]'::jsonb);
    when insufficient_privilege then
      return jsonb_build_object('source','thylora_query_carryforward','available',false,
        'reason','READ_REFUSED','note','This session may not read thylora_query_carryforward.','rows','[]'::jsonb);
  end;

  return jsonb_build_object(
    'source','thylora_query_carryforward',
    'available', true,
    'origin','CARRYFORWARD_NOT_LEDGER',
    'ledger_floor', v_floor,
    'rule','These rows are context, not ledger rows. They carry no authority, no truth class above UNVERIFIED, and no restart point.',
    'rows', coalesce(rows,'[]'::jsonb),
    'qyris', thy_omniview_qyris('PRE_LEDGER', null, jsonb_build_array(
      jsonb_build_object('table','thylora_query_carryforward','rows', jsonb_array_length(coalesce(rows,'[]'::jsonb))),
      jsonb_build_object('table','thy_sequence_ledger','rows', (select count(*) from thy_sequence_ledger)))));
end $$;

revoke execute on function thy_sequence_prior_context(int,bigint) from public, anon;
grant  execute on function thy_sequence_prior_context(int,bigint) to authenticated;

commit;
