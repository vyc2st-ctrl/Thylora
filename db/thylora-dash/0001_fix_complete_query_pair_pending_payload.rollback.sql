-- ROLLBACK PATH for 0001_fix_complete_query_pair_pending_payload.sql
-- thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- This restores thylora_complete_query_pair byte-for-byte to the definition that
-- was live before the repair, captured from pg_get_functiondef() at 2026-09-18.
-- It is a pure function replacement: no table, row, column, grant, policy or
-- trigger is touched, and no carryforward row is read or written. Running it
-- reinstates the defect (completion becomes a silent no-op for any row holding
-- 'PENDING_RESPONSE_PAYLOAD'), so it is a revert path, not a fix.
--
-- Rows completed while the repair was live keep their payloads; this script
-- cannot and does not undo them.

CREATE OR REPLACE FUNCTION public.thylora_complete_query_pair(p_query_id text, p_assistant_message text, p_message_hash text, p_compressed_summary jsonb DEFAULT NULL::jsonb, p_custody_context jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(query_id text, sequence_no bigint, message_hash text, capture_state text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$ begin update public.thylora_query_carryforward t set assistant_message=case when t.assistant_message is null then p_assistant_message else t.assistant_message end, assistant_message_hash=case when t.assistant_message is null then encode(digest(convert_to(p_assistant_message,'UTF8'),'sha256'),'hex') else t.assistant_message_hash end, message_hash=case when t.assistant_message is null then p_message_hash else t.message_hash end, compressed_summary=case when p_compressed_summary is not null then coalesce(t.compressed_summary,'{}'::jsonb)||p_compressed_summary else t.compressed_summary end, custody_context=case when p_custody_context is not null then coalesce(t.custody_context,'{}'::jsonb)||p_custody_context else t.custody_context end where t.query_id=p_query_id; if not found then raise exception 'QUERY_ID_NOT_FOUND'; end if; return query select t.query_id,t.sequence_no,t.message_hash,t.capture_state,t.created_at from public.thylora_query_carryforward t where t.query_id=p_query_id; end $function$;
