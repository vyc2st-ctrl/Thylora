-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Money system reconciliation. REE, RRE and PEETE DOLUP are NOT collapsed together:
-- canon holds them as three separate instruments and that separation is preserved.
-- This migration EXTENDS the existing public.financial_instrument_registry with the
-- reconciliation fields the Chairman asked for, then fills only what canon already says.
-- Nothing unresolved is invented; unresolved mechanics are written as OPEN.


-- ---------------------------------------------------------------------------
-- 1. EdereAirah spelling lock (exact spelling: EdereAirah)
--    Stale authoritative variants are marked superseded, not deleted.
-- ---------------------------------------------------------------------------
insert into public.thylora_world_term_registry
  (term_code, canonical_term, term_class, pronunciation, definition, voice_variants, use_rules, truth_class, state)
values
  ('THY-TERM-EDEREAIRAH-001', 'EdereAirah', 'WORLD / PLANET NAME', null,
   'The world layer in which THYLORA canon operates. Exact spelling is EdereAirah.',
   '["EdereAirah"]'::jsonb,
   jsonb_build_object(
     'exact_spelling', 'EdereAirah',
     'use_in', 'all new authoritative work',
     'superseded_variants', jsonb_build_array('EdereAriah','EDEREARIAH','Edereairah'),
     'destructive_rewrite_prohibited', true,
     'historical_rows_rule', 'Existing source history is NOT rewritten destructively. Stale variants are marked superseded where they carry authority.'
   ),
   'CHAIRMAN_CANON', 'LOCKED')
on conflict (term_code) do update set
  canonical_term = excluded.canonical_term,
  definition     = excluded.definition,
  voice_variants = excluded.voice_variants,
  use_rules      = excluded.use_rules,
  truth_class    = excluded.truth_class,
  state          = excluded.state,
  updated_at     = now();

insert into public.thylora_name_variant_dispositions (run_code, target_table, target_column, disposition, reason)
select v.run_code, v.target_table, v.target_column, v.disposition, v.reason
from (values
  ('THY-NAME-EDEREAIRAH-533','thylora_master_ledger','world_layer','SUPERSEDED_NOT_REWRITTEN',
   'Historical rows carry world_layer EdereAriah / EDEREARIAH. Exact spelling is EdereAirah. Source history preserved; variant marked superseded for all new authoritative work.'),
  ('THY-NAME-EDEREAIRAH-533','thylora_history_chronicle','world_layer','SUPERSEDED_NOT_REWRITTEN',
   'Chronicle rows carry EDEREARIAH. Preserved as written record; new authoritative work uses EdereAirah.'),
  ('THY-NAME-EDEREAIRAH-533','thylora_historical_medicine_evidence','world_layer','SUPERSEDED_NOT_REWRITTEN',
   'HME-ROSEMARY-MIRROR row carries EDEREARIAH_CANON and an EdereAriah subject name. Preserved; superseded by EdereAirah for new work.'),
  ('THY-NAME-EDEREAIRAH-533','thylora_person_identity','identity_layer','CURRENT_SPELLING_CONFIRMED',
   'Rows already normalized to EDEREAIRAH_WORLD. No change required.')
) as v(run_code, target_table, target_column, disposition, reason)
where not exists (
  select 1 from public.thylora_name_variant_dispositions d
  where d.run_code = v.run_code and d.target_table = v.target_table and d.target_column = v.target_column
);

-- ---------------------------------------------------------------------------
-- 2. Reconciliation fields on the existing instrument registry
-- ---------------------------------------------------------------------------
alter table public.financial_instrument_registry
  add column if not exists what_it_is            text,
  add column if not exists what_it_is_not        text,
  add column if not exists unit_name             text,
  add column if not exists transfer_rule         text,
  add column if not exists accounting_role       text,
  add column if not exists redemption_rule       text,
  add column if not exists earth_exchange_status text,
  add column if not exists supply_rule           text,
  add column if not exists divisibility_rule     text,
  add column if not exists open_mechanics        text[] not null default '{}',
  add column if not exists separation_rule       text,
  add column if not exists reconciled_at         timestamptz,
  add column if not exists reconciled_by_work    text;

-- ---------------------------------------------------------------------------
-- 3. REE — active EdereAirah currency
-- ---------------------------------------------------------------------------
update public.financial_instrument_registry set
  what_it_is = 'An active EdereAirah currency. It prices goods and services inside the approved EdereAirah economy, records wages and rewards, and settles approved internal obligations.',
  what_it_is_not = 'Not Earth legal tender. Not an Earth bank balance. Not a verified Earth exchange rate. Not a regulated cryptocurrency. Not a synonym for RRE or PEETE DOLUP.',
  unit_name = 'Ree',
  transfer_rule = 'Transferable between registered EdereAirah accounts. Every posting must name a from-side, a to-side, a reason and an authority. No transfer may be recorded without an evidenced amount.',
  accounting_role = 'Unit of account and means of settlement for EdereAirah accounting and commerce, including estate, household, personal and business ledgers.',
  redemption_rule = 'No Earth cash redemption. Chairman approved a 1 REE = 1 USD reference parity on 2026-08-15 as a reference only; that parity is not a redemption right and creates no Earth claim.',
  earth_exchange_status = 'DISABLED - earth_legal_tender false, earth_exchange_enabled false.',
  supply_rule = 'OPEN. Issuance is ACTIVE but supply rules await the formal monetary constitution. No supply figure may be stated.',
  divisibility_rule = 'OPEN. Divisible flag and smallest unit are unresolved. Denomination plan recorded in currency_visual_registry REE-VISUAL-001 is 1,5,10,15,20,35,50,100,200,500,1000.',
  open_mechanics = array['supply_rule','divisibility','smallest_unit','formal_monetary_constitution','final_vector_glyph_chairman_visual_review'],
  separation_rule = 'REE, RRE and PEETE DOLUP are three separate instruments. They must never be merged, aliased or treated as synonyms.',
  reconciled_at = now(),
  reconciled_by_work = 'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533',
  world_layer = 'EDEREAIRAH'
where instrument_code = 'REE';

-- ---------------------------------------------------------------------------
-- 4. RRE — Bowie family value instrument
-- ---------------------------------------------------------------------------
update public.financial_instrument_registry set
  what_it_is = 'A registered value instrument reserved to the Bowie family line. Classification is active; economics are not yet defined.',
  what_it_is_not = 'Not Earth legal tender. Not an automatic claim of ownership by any named person. Not evidence that the Bowie line created THYLORA. Not a synonym for REE or PEETE DOLUP. Not issued.',
  unit_name = 'OPEN',
  transfer_rule = 'OPEN. Transferability is unresolved and must not be assumed.',
  accounting_role = 'Family-line value recognition and legacy accounting once rules are approved. It has no settlement role today.',
  redemption_rule = 'OPEN. No redemption exists.',
  earth_exchange_status = 'DISABLED - earth_legal_tender false, earth_exchange_enabled false.',
  supply_rule = 'OPEN. NOT_ISSUED.',
  divisibility_rule = 'OPEN.',
  open_mechanics = array['issuance','holders','transfer','redemption','succession','symbol','unit','precise_value_class'],
  separation_rule = 'REE, RRE and PEETE DOLUP are three separate instruments. They must never be merged, aliased or treated as synonyms.',
  reconciled_at = now(),
  reconciled_by_work = 'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533',
  world_layer = 'EDEREAIRAH'
where instrument_code = 'RRE';

-- ---------------------------------------------------------------------------
-- 5. PEETE DOLUP — classification pending
-- ---------------------------------------------------------------------------
update public.financial_instrument_registry set
  what_it_is = 'A canonically spelled THYLORA financial term whose exact financial class has never been resolved. It is preserved as a distinct instrument slot.',
  what_it_is_not = 'Not Earth legal tender. Not an automatic synonym for Ree. Not an automatic synonym for RRE. Not issued. Not classified.',
  unit_name = 'OPEN',
  transfer_rule = 'OPEN. Nothing may be transferred in PEETE DOLUP while its class is unresolved.',
  accounting_role = 'OPEN. It carries no accounting role until classified.',
  redemption_rule = 'OPEN.',
  earth_exchange_status = 'DISABLED - earth_legal_tender false, earth_exchange_enabled false.',
  supply_rule = 'OPEN. NOT_ISSUED.',
  divisibility_rule = 'OPEN.',
  open_mechanics = array['instrument_class','issuer_detail','unit','transfer','accounting_role','redemption','supply','divisibility'],
  separation_rule = 'REE, RRE and PEETE DOLUP are three separate instruments. They must never be merged, aliased or treated as synonyms.',
  reconciled_at = now(),
  reconciled_by_work = 'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533',
  world_layer = 'EDEREAIRAH'
where instrument_code = 'PEETE_DOLUP';

-- ---------------------------------------------------------------------------
-- 6. Guard: no instrument may claim Earth legal tender or Earth exchange
--    without a separately evidenced authority record.
-- ---------------------------------------------------------------------------
alter table public.financial_instrument_registry
  drop constraint if exists financial_instrument_registry_earth_claim_chk;
alter table public.financial_instrument_registry
  add constraint financial_instrument_registry_earth_claim_chk
  check (
    (coalesce(earth_legal_tender, false) = false and coalesce(earth_exchange_enabled, false) = false)
    or authority_record is not null
  );
