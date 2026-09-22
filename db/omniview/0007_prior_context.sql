-- OMNIVIEW · 0007 · Pre-ledger context
-- Work: THY-WORK-SEQUENCE-CHANGE-LEDGER-587
--
-- Sequences 1-586 were never written to this ledger, and back-dating them would
-- destroy the meaning of truth_class. They are instead READ where they already
-- live — thylora_query_carryforward — and returned clearly labelled PRE_LEDGER,
-- so continuity is available without the ledger lying about its own history.
--
-- EVIDENCE GAP: this build session could not reach jvsdxhrfhtlgaknhjxlz.supabase.co
-- (egress denied), so the live shape of thylora_query_carryforward could not be
-- verified. Every read below is guarded by to_regclass and a column check: if the
-- table is absent or shaped differently, it reports that instead of failing.

begin;

create or replace function thy_sequence_prior_context(p_limit int default 25, p_before bigint default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare rows jsonb; cutoff bigint;
begin
  if to_regclass('public.thylora_query_carryforward') is null then
    return jsonb_build_object(
      'source','thylora_query_carryforward','available',false,
      'reason','REGISTRY_ABSENT',
      'note','Pre-ledger history is not readable from this database. The ledger still starts at 587.',
      'rows','[]'::jsonb);
  end if;

  if not exists (select 1 from information_schema.columns
                  where table_name = 'thylora_query_carryforward' and column_name = 'sequence_no') then
    return jsonb_build_object(
      'source','thylora_query_carryforward','available',false,
      'reason','SHAPE_MISMATCH',
      'note','The carryforward table exists but carries no sequence_no. Not read.',
      'rows','[]'::jsonb);
  end if;

  cutoff := coalesce(p_before, (select min(sequence_no) from thy_sequence_ledger));

  begin
    execute $q$
      select coalesce(jsonb_agg(r order by (r->>'sequence_no')::bigint desc), '[]'::jsonb) from (
        select jsonb_build_object(
                 'sequence_no', c.sequence_no,
                 'truth_class', 'UNVERIFIED',
                 'origin',      'PRE_LEDGER',
                 'session_label', c.session_label,
                 'user_message',  left(c.user_message, 500),
                 'assistant_message', left(c.assistant_message, 500),
                 'created_at', c.created_at) as r
          from thylora_query_carryforward c
         where $1 is null or c.sequence_no < $1
         order by c.sequence_no desc
         limit greatest($2, 1)) q
    $q$ into rows using cutoff, p_limit;
  exception when others then
    return jsonb_build_object('source','thylora_query_carryforward','available',false,
      'reason','READ_REFUSED','note',sqlerrm,'rows','[]'::jsonb);
  end;

  return jsonb_build_object(
    'source','thylora_query_carryforward',
    'available', true,
    'origin','PRE_LEDGER',
    'ledger_floor', (select min(sequence_no) from thy_sequence_ledger),
    'rule','These rows are context, not ledger rows. They carry no authority, no truth class above UNVERIFIED, and no restart point.',
    'rows', coalesce(rows,'[]'::jsonb),
    'qyris', thy_omniview_qyris('PRE_LEDGER', null, jsonb_build_array(
      jsonb_build_object('table','thylora_query_carryforward','rows', jsonb_array_length(coalesce(rows,'[]'::jsonb))))));
end $$;

revoke execute on function thy_sequence_prior_context(int,bigint) from public, anon;
grant  execute on function thy_sequence_prior_context(int,bigint) to authenticated;

commit;
