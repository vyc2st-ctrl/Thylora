-- THYLORA backend continuity repair -- thylora-dash (jvsdxhrfhtlgaknhjxlz)
-- Applied as Supabase migration: fix_complete_query_pair_pending_response_payload
-- Reported in carryforward #460 (THY-Q-20260918-HERB-FILE-001-460).
--
-- DEFECT
--   thylora_complete_query_pair guarded every written column with
--     case when t.assistant_message is null then <new> else <old> end
--   but thylora_capture_query_pair stores the literal placeholder
--   'PENDING_RESPONSE_PAYLOAD', which is not null. For a placeholder row every
--   branch selected the existing value, the UPDATE matched the row so "if not
--   found" never fired, and the function returned a success row having written
--   nothing. Completion was a permanent, silent no-op.
--
-- REPAIR
--   A row counts as incomplete when assistant_message IS NULL
--   OR assistant_message = 'PENDING_RESPONSE_PAYLOAD'.
--   Signature, return type, SECURITY DEFINER and grants are unchanged.
--   Completed historical messages are never overwritten. The already-complete
--   case now raises ASSISTANT_MESSAGE_ALREADY_COMPLETE instead of silently
--   succeeding -- the silent success is what hid this defect. A replay of the
--   identical payload stays idempotent and merges metadata only.
--
-- Rollback: db/thylora-dash/0001_fix_complete_query_pair_pending_payload.rollback.sql

create or replace function public.thylora_complete_query_pair(
  p_query_id text,
  p_assistant_message text,
  p_message_hash text,
  p_compressed_summary jsonb default null::jsonb,
  p_custody_context jsonb default null::jsonb)
returns table(query_id text, sequence_no bigint, message_hash text, capture_state text, created_at timestamp with time zone)
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_pending constant text := 'PENDING_RESPONSE_PAYLOAD';
  v_existing text;
begin
  -- A completion must carry a real response payload. Never accept null, blank,
  -- or the capture-time placeholder through the completion path.
  if p_assistant_message is null
     or btrim(p_assistant_message) = ''
     or p_assistant_message = v_pending then
    raise exception 'ASSISTANT_MESSAGE_PAYLOAD_REQUIRED';
  end if;

  select t.assistant_message
    into v_existing
    from public.thylora_query_carryforward t
   where t.query_id = p_query_id
     for update;

  if not found then
    raise exception 'QUERY_ID_NOT_FOUND';
  end if;

  if v_existing is null or v_existing = v_pending then
    -- Incomplete row. This is the row class the defect stranded.
    update public.thylora_query_carryforward t
       set assistant_message = p_assistant_message,
           assistant_message_hash = encode(digest(convert_to(p_assistant_message, 'UTF8'), 'sha256'), 'hex'),
           message_hash = coalesce(p_message_hash, t.message_hash),
           compressed_summary = case
             when p_compressed_summary is not null
               then coalesce(t.compressed_summary, '{}'::jsonb) || p_compressed_summary
             else t.compressed_summary end,
           custody_context = case
             when p_custody_context is not null
               then coalesce(t.custody_context, '{}'::jsonb) || p_custody_context
             else t.custody_context end
     where t.query_id = p_query_id;

  elsif v_existing = p_assistant_message then
    -- Idempotent replay of the same payload. The verbatim message is left exactly
    -- as stored; only supplied metadata is merged.
    if p_compressed_summary is not null or p_custody_context is not null then
      update public.thylora_query_carryforward t
         set compressed_summary = case
               when p_compressed_summary is not null
                 then coalesce(t.compressed_summary, '{}'::jsonb) || p_compressed_summary
               else t.compressed_summary end,
             custody_context = case
               when p_custody_context is not null
                 then coalesce(t.custody_context, '{}'::jsonb) || p_custody_context
               else t.custody_context end
       where t.query_id = p_query_id;
    end if;

  else
    -- A completed historical message is never overwritten -- and never silently
    -- skipped either, which is what hid the original defect.
    raise exception 'ASSISTANT_MESSAGE_ALREADY_COMPLETE';
  end if;

  return query
  select t.query_id, t.sequence_no, t.message_hash, t.capture_state, t.created_at
    from public.thylora_query_carryforward t
   where t.query_id = p_query_id;
end
$function$;
