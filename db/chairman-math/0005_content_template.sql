-- THY-WORK-MATH-FAMOUS-THOUGHT-559 · 0005 · Public content template and drafts
--
-- Section 7: one reusable template, five parts in fixed order —
--   FAMOUS THOUGHT -> QUESTION -> EVIDENCE -> CONNECTION -> TRANSFER
-- Section 11: no publishing, no posters, no image generation. The table enforces
-- that: a draft cannot leave DRAFT without a PASS on both gates, and a draft
-- that carries a quotation with no source record cannot be stored at all.

begin;

create table if not exists thy_content_template (
  template_code   text primary key,
  part_order      text[] not null,
  description     text not null,
  version         integer not null default 1,
  status          text not null default 'ACTIVE',
  created_at      timestamptz not null default now(),
  constraint thy_template_status_known check (status in ('ACTIVE', 'SUPERSEDED')),
  constraint thy_template_five_parts check (cardinality(part_order) = 5)
);

insert into thy_content_template (template_code, part_order, description)
values (
  'TPL-FAMOUS-THOUGHT-001',
  array['FAMOUS_THOUGHT', 'QUESTION', 'EVIDENCE', 'CONNECTION', 'TRANSFER'],
  'The single reusable public form for famous-thought content. Every part is
   required. A card that would carry only the first part is a quote poster and is
   refused by thy_thought_draft_parts_complete.'
)
on conflict (template_code) do nothing;

create table if not exists thy_thought_draft (
  draft_code        text primary key,
  thought_code      text not null,
  template_code     text not null default 'TPL-FAMOUS-THOUGHT-001'
                      references thy_content_template (template_code),
  -- Display contract, section 5.
  person            text not null default 'UNKNOWN_DEFINITION',
  verified_quote    text,
  quote_source_ref  text,
  source_citation   text not null default 'UNKNOWN_DEFINITION',
  date_context      text not null default 'UNKNOWN_DEFINITION',
  next_question     text not null default 'UNKNOWN_DEFINITION',
  math_connection   text not null default 'UNKNOWN_DEFINITION',
  transfer_question text not null default 'UNKNOWN_DEFINITION',
  -- Template parts, section 7.
  part_famous_thought text not null default 'UNKNOWN_DEFINITION',
  part_question       text not null default 'UNKNOWN_DEFINITION',
  part_evidence       text not null default 'UNKNOWN_DEFINITION',
  part_connection     text not null default 'UNKNOWN_DEFINITION',
  part_transfer       text not null default 'UNKNOWN_DEFINITION',
  -- Gate state, sections 3 and 8.
  f_gate_verdict    text not null default 'FAIL',
  f_gate_value      integer,
  d_gate_verdict    text not null default 'FAIL',
  d_gate_value      integer,
  gate_blocking     text[] not null default '{}',
  status            text not null default 'DRAFT',
  graph_stable_id   text not null default 'SYSTEM-FAMOUS-THOUGHT-001',
  version           integer not null default 1,
  superseded_by     text references thy_thought_draft (draft_code),
  updated_at        timestamptz not null default now(),

  constraint thy_draft_status_known
    check (status in ('DRAFT', 'BLOCKED_PENDING_READBACK', 'READY', 'SUPERSEDED')),
  constraint thy_draft_verdicts_known
    check (f_gate_verdict in ('PASS', 'FAIL') and d_gate_verdict in ('PASS', 'FAIL')),
  -- A quotation may exist only with the source record it was read from.
  constraint thy_draft_quote_needs_source
    check (verified_quote is null or (quote_source_ref is not null
           and source_citation <> 'UNKNOWN_DEFINITION')),
  -- READY means both gates passed. Nothing else may be called ready.
  constraint thy_draft_ready_needs_both_gates
    check (status <> 'READY' or (f_gate_verdict = 'PASS' and d_gate_verdict = 'PASS')),
  -- Section 11 and section 7: the five parts must all be present before READY,
  -- which is what stops a quote-only poster from ever reaching a public surface.
  constraint thy_thought_draft_parts_complete
    check (status <> 'READY' or (
      part_famous_thought <> 'UNKNOWN_DEFINITION' and
      part_question       <> 'UNKNOWN_DEFINITION' and
      part_evidence       <> 'UNKNOWN_DEFINITION' and
      part_connection     <> 'UNKNOWN_DEFINITION' and
      part_transfer       <> 'UNKNOWN_DEFINITION'
    ))
);

comment on table thy_thought_draft is
  'Draft public content. There is no PUBLISHED status in this system: publishing
   is out of scope for work code THY-WORK-MATH-FAMOUS-THOUGHT-559.';

comment on constraint thy_draft_quote_needs_source on thy_thought_draft is
  'A verified quote without its source record is an unverified quote. Storing one
   is refused rather than corrected later.';

-- The four drafts, created in the fail-closed state the evidence supports.
insert into thy_thought_draft
  (draft_code, thought_code, status, gate_blocking)
values
  ('DRAFT-DOUGLASS-001',   'THOUGHT-DOUGLASS-001',   'BLOCKED_PENDING_READBACK',
   array['SOURCE_UNCERTAIN','SPEAKER_UNCERTAIN','WORDING_UNCERTAIN','CONTEXT_MISSING',
         'UNKNOWN_DEFINITION for D variables: A, H, W, T, M, P']),
  ('DRAFT-CARVER-001',     'THOUGHT-CARVER-001',     'BLOCKED_PENDING_READBACK',
   array['SOURCE_UNCERTAIN','SPEAKER_UNCERTAIN','WORDING_UNCERTAIN','CONTEXT_MISSING',
         'UNKNOWN_DEFINITION for D variables: A, H, W, T, M, P']),
  ('DRAFT-WASHINGTON-001', 'THOUGHT-WASHINGTON-001', 'BLOCKED_PENDING_READBACK',
   array['SOURCE_UNCERTAIN','SPEAKER_UNCERTAIN','WORDING_UNCERTAIN','CONTEXT_MISSING',
         'UNKNOWN_DEFINITION for D variables: A, H, W, T, M, P']),
  ('DRAFT-FORD-001',       'THOUGHT-FORD-001',       'BLOCKED_PENDING_READBACK',
   array['SOURCE_UNCERTAIN','SPEAKER_UNCERTAIN','WORDING_UNCERTAIN','CONTEXT_MISSING',
         'UNKNOWN_DEFINITION for D variables: A, H, W, T, M, P'])
on conflict (draft_code) do nothing;

-- The math connection is the one part of each card this session can state
-- without touching the quotation: it names which gate the card had to clear.
update thy_thought_draft set
  math_connection = 'This card is admitted by F = S × A × C × T (all four >= 4 and F >= 256) '
                 || 'and is tested for store and social value by D = A × H × W × T × M × P. '
                 || 'Both are currently FAIL: the source records were not readable in the '
                 || 'build session and the D variable meanings are UNKNOWN_DEFINITION.',
  updated_at = now()
where math_connection = 'UNKNOWN_DEFINITION';

create or replace function thy_thought_draft_supersede(p_old text, p_new text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_old is null or p_new is null or p_old = p_new then
    raise exception 'supersede requires two distinct draft codes';
  end if;
  if not exists (select 1 from thy_thought_draft where draft_code = p_new) then
    raise exception 'superseding draft % does not exist', p_new;
  end if;
  update thy_thought_draft
     set status = 'SUPERSEDED', superseded_by = p_new, updated_at = now()
   where draft_code = p_old;
end $$;

commit;
