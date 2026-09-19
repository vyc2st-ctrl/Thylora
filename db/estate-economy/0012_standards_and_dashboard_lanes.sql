-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- L. History presentation standard, M. historical medicine standard,
-- N. dashboard lanes on the EXISTING control lane registry.

-- ===========================================================================
-- L. HISTORY PRESENTATION STANDARD - recorded as a requirement only.
--    No stone-castle origin research was performed in this run.
-- ===========================================================================
insert into public.thylora_forward_quality_standards
  (standard_code, scope, authority, floor_definition, forward_rules, recovery_rules, state)
values
 ('THY-STD-HISTORY-PRESENTATION-001',
  'Every future presentation of Earth history in any THYLORA surface',
  'Chairman directive, sequence 533',
  jsonb_build_object(
    'required_fields', jsonb_build_array(
      'DATE','PLACE','SOURCE','WHAT SOURCE SAYS','HOW PEOPLE WERE DESCRIBED / DEPICTED',
      'GEOGRAPHY','ANCESTRY / ETHNICITY IF EVIDENCED','POLITICAL IDENTITY','RELIGION','UNKNOWN'),
    'unknown_is_a_value','A field with no evidence is written UNKNOWN. It is never filled by inference and never silently dropped.'),
  jsonb_build_object(
    'no_racial_shortcut','Broad identity words must not be used as racial shortcuts. What a source says about how people were described or depicted is recorded separately from ancestry, separately from political identity and separately from religion.',
    'ancestry_requires_evidence','ANCESTRY / ETHNICITY is written only where it is evidenced, and the evidence is named. Otherwise UNKNOWN.',
    'edereairah_is_not_mythology','EdereAirah history is never labelled mythology, legend or folklore. It is world-layer history and is presented as such.',
    'earth_and_world_stay_separate','Earth evidence does not transfer into EdereAirah and EdereAirah canon is not presented as Earth evidence.',
    'construction_phase_vs_transmission','A documented construction phase at a site is a different claim from a claim about who originated or transmitted the building knowledge. The two must not be merged.'),
  jsonb_build_object(
    'on_breach','A presentation missing a required field is returned to the author with the missing field named, rather than published with the gap hidden.'),
  'ACTIVE')
on conflict (standard_code) do update set
  floor_definition = excluded.floor_definition,
  forward_rules    = excluded.forward_rules,
  recovery_rules   = excluded.recovery_rules,
  state            = excluded.state,
  updated_at       = now();

-- ===========================================================================
-- M. HISTORICAL MEDICINE STANDARD
-- ===========================================================================
insert into public.thylora_forward_quality_standards
  (standard_code, scope, authority, floor_definition, forward_rules, recovery_rules, state)
values
 ('THY-STD-HISTORICAL-MEDICINE-001',
  'Every record in thylora_historical_medicine_evidence and every surface that presents historical remedy material',
  'Chairman directive, sequence 533',
  jsonb_build_object(
    'required_layers', jsonb_build_array(
      'HISTORICAL USE','SOURCE WORDING','FIRSTHAND / CONTEMPORARY REPORT','LATER EVIDENCE','UNKNOWN'),
    'layers_stay_separate','The five layers are recorded separately and are never merged into a single verdict.'),
  jsonb_build_object(
    'firsthand_report_is_preserved','If a historical person says this helped me or this cured me, that is recorded as their reported experience, in their wording, under FIRSTHAND / CONTEMPORARY REPORT.',
    'never_erased','A documented historical use or a firsthand report is never deleted, edited away or suppressed because later evidence is weak or absent.',
    'never_universalized','A firsthand report is never converted into a general claim of efficacy, a dosage, a recommendation or a treatment.',
    'later_evidence_is_its_own_layer','Modern or later evidence is recorded in its own layer with its actual strength stated, including LIMITED_NOT_ESTABLISHED and NOT_APPLICABLE_WORLD_LAYER.',
    'unknown_is_stated','Where a layer has nothing in it, it is written UNKNOWN or OPEN rather than left blank.'),
  jsonb_build_object(
    'on_breach','A record that presents historical use as proven treatment, or that has dropped a documented historical use, is corrected by restoring the layer, not by rewriting the source.'),
  'ACTIVE')
on conflict (standard_code) do update set
  floor_definition = excluded.floor_definition,
  forward_rules    = excluded.forward_rules,
  recovery_rules   = excluded.recovery_rules,
  state            = excluded.state,
  updated_at       = now();

-- Add a correctly spelled current record for the rosemary-mirror plant and mark the
-- stale-spelling row superseded. The old row is preserved, not rewritten.
insert into public.thylora_historical_medicine_evidence
  (subject_code, subject_name, world_layer, historical_use, historical_use_state,
   source_claim, source_claim_state, modern_evidence, modern_evidence_state,
   sources, conversion_ban, state, source_query_id)
values
 ('HME-ROSEMARY-MIRROR-EDEREAIRAH',
  'Rosemary-mirror plant - EdereAirah native name OPEN',
  'EDEREAIRAH_CANON',
  'OPEN. The EdereAirah plant mirrors Earth rosemary in role: a kitchen-garden herb cut daily by the Royal Kitchen from LAND-HERB-KITCHEN-001 under the Head Cook. Its in-world documented use is not yet written.',
  'OPEN',
  'OPEN. No in-world source claim exists yet because no in-world herbal, healer or household record has been written for it.',
  'OPEN',
  'NOT_APPLICABLE. EdereAirah is a world layer; Earth clinical evidence does not transfer into it and must never be presented as in-world proof.',
  'NOT_APPLICABLE_WORLD_LAYER',
  '[]'::jsonb,
  'HISTORICAL USE AND SOURCE CLAIM MUST NEVER BE PRESENTED AS PROVEN MODERN TREATMENT. DOCUMENTED HISTORICAL USE MUST NEVER BE DELETED. FIRSTHAND REPORT IS PRESERVED AS REPORTED EXPERIENCE AND IS NEVER UNIVERSALIZED.',
  'OPEN_BLOCKED_ON_PLANT_NAME',
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (subject_code) do nothing;

update public.thylora_historical_medicine_evidence
set state = 'SUPERSEDED_SPELLING_SEE_HME-ROSEMARY-MIRROR-EDEREAIRAH',
    updated_at = now()
where subject_code = 'HME-ROSEMARY-MIRROR-EDEREARIAH';

update public.thylora_historical_medicine_evidence
set conversion_ban = 'HISTORICAL USE AND SOURCE CLAIM MUST NEVER BE PRESENTED AS PROVEN MODERN TREATMENT. DOCUMENTED HISTORICAL USE MUST NEVER BE DELETED. FIRSTHAND REPORT IS PRESERVED AS REPORTED EXPERIENCE AND IS NEVER UNIVERSALIZED.',
    updated_at = now()
where subject_code = 'HME-ROSEMARY-EARTH';

-- ===========================================================================
-- N. DASHBOARD LANES - added to the EXISTING thylora_control_lane_registry.
--    The 17 existing lanes are preserved. Nothing is reset.
-- ===========================================================================
insert into public.thylora_control_lane_registry
  (lane_code, lane_order, title, source_of_truth, source_note,
   now_text, next_text, blocked_text, output_text, done_when_text, chairman_decision, last_movement_at)
values
 ('EDEREAIRAH',18,'EdereAirah','thylora_world_term_registry + thylora_name_variant_dispositions',
  'Spelling authority and world-layer naming.',
  'Exact spelling EdereAirah is LOCKED as THY-TERM-EDEREAIRAH-001. Four stale-variant dispositions recorded as SUPERSEDED_NOT_REWRITTEN; no source history was rewritten.',
  'New authoritative writes use EdereAirah. Historical rows stay as written.',
  null,'One locked spelling with superseded variants named',
  'Every new authoritative record uses EdereAirah and no old row was destroyed',
  null, now()),
 ('CASTLE',19,'Castle','thylora_estate_function_registry + thylora_world_entities',
  'ER-CASTLE-ROYAL-001.',
  '28 estate functions now registered: the 16 from sequence 532 plus 12 added this run. 12 security layers, 17 posts, 16 rotations and 6 signals exist under the castle.',
  'Chairman resolves the castle name, city, territory and founding line.',
  'The castle NAME, city, territory, founding date, founding authority and ownership line are all still OPEN.',
  'A castle that operates rather than one that is only described',
  'The dossier has a name and a founding line instead of fifteen OPEN fields',
  'Name the castle, or rule that it stays OPEN', now()),
 ('TENANTS',20,'Tenants','thylora_estate_tenancies + thylora_estate_resident_households',
  'Tenant holdings, leases and resident households.',
  '6 holding class spines and 4 resident household class spines exist, each with a real structural slot and OPEN_IDENTITY. No tenant was invented.',
  'Chairman supplies tenant identities, or rules that holdings stay as class spines.',
  'Tenure form, rent form, term length, succession and dispute path are OPEN, so no lease can be written yet.',
  'A tenant register with real terms',
  'At least one holding carries a named tenant and a stated rent form',
  'Supply tenant identities and the rent form: coin, share of produce, labour or mixed', now()),
 ('ESTATE',21,'Estate','thylora_estate_inspections + thylora_estate_work_orders + thylora_estate_land_units',
  'Estate operations: land, animals, provisioning, inspections, incidents, maintenance.',
  '7 land units, 7 animal groups, 8 standing inspection definitions, 8 incident response definitions and 7 work-order classes are in place. The kitchen herb ground and the estate horses are canon-anchored; the rest are class spines.',
  'Run the first real inspection against a real subject once tenant and housing identities exist.',
  'Inspection cycles, the water source and carry route, and who authorises a repair are OPEN.',
  'An estate that inspects, repairs and records rather than one that is described',
  'One inspection has run and raised one work order with a provenance event',
  'Set the inspection cycle, or rule that it follows the season once the native calendar is resolved', now()),
 ('SECURITY',22,'Security','thylora_security_zones + thylora_security_posts + thylora_security_staffing_requirement_v1',
  'Layered period-appropriate security.',
  '12 layers from the approach road to the inner residence. 17 posts with derived minimum strengths, 16 relief rotations, 6 signals. The family-range post strength is deliberately WITHHELD. No two-guards-protect-everything logic remains.',
  'Chairman approves an establishment, which converts derived minimums into a real roster.',
  'Post strengths are derived REQUIREMENTS, not an approved establishment. Watch length, relief interval, tower count, muster time and call-out authority are OPEN.',
  'A post structure with a staffing requirement per layer',
  'The Chairman has approved an establishment and each post has a named holder or a stated vacancy',
  'Approve the guard establishment, or hold it at derived minimums', now()),
 ('ROYAL_KITCHEN',23,'Royal Kitchen','thylora_kitchen_posts + thylora_kitchen_shift_segments + thylora_kitchen_stores',
  'THY-CASTLE-ROYAL-KITCHEN-001.',
  '8 kitchen posts bound to existing household roles, 5 shift segments taken directly from SCHED-HH-1700-KITCHEN, 6 stores, 7 waste routes, 10 supplier slots and 9 cookware classes. HH-1700-COOK stays BOUND to ER-ROYAL-COOK-001.',
  'Name the Deputy Cook, Provisioner, Scullery and Baker, or hold them as OPEN roles.',
  'Veronica Hall has no kitchen role and none was created: her role is unresolved in canon.',
  'A kitchen that runs a day rather than one that is described',
  'One full day runs end to end through the five segments with named hands',
  'Resolve Veronica Hall role, or confirm it stays unresolved', now()),
 ('ROSEMARY',24,'Rosemary','thylora_historical_medicine_evidence + LAND-HERB-KITCHEN-001',
  'The herb lane and its Earth mirror.',
  'Earth rosemary record holds all five evidence layers separated. A correctly spelled EdereAirah mirror record now exists; the stale-spelling row is marked superseded and preserved.',
  'Chairman supplies the native plant name, which unblocks the herb garden and the herb store.',
  'BLOCKED on the EdereAirah native plant name. EST-HERB-GARDEN-001 is OPEN_BLOCKED_ON_PLANT_NAME.',
  'One named EdereAirah plant with its own in-world use record',
  'The plant has a native name and an in-world documented use',
  'Name the rosemary-mirror plant in EdereAirah', now()),
 ('MAKERS',25,'Makers','thylora_object_maker_provenance + thylora_estate_tenancies THT-CLASS-WORKSHOP',
  'The eleven open maker slots.',
  'Workshop holdings now exist as a tenancy class and SEC-Z-WORKSHOPS is a security layer, so a maker has somewhere to stand. All eleven maker slots remain unnamed.',
  'Chairman names makers, or rules that they stay as slots.',
  'Every maker slot is OPEN. No maker was invented.',
  'Named makers with workshops, tools and provenance',
  'At least one maker is named and holds a workshop with a provenance chain',
  'Name makers, or confirm the eleven slots stay OPEN', now()),
 ('ROYAL_COLLECTION',26,'Royal collection','thylora_royal_collection_registry',
  'Eight registered collection classes.',
  'All 8 classes remain CLASS_OPEN_NO_ITEMS. SEC-Z-COLLECTION now gives the collection a security layer with a standing watch, and EST-ACCT-COLLECTION-ACQUISITION gives acquisitions a ledger destination.',
  'Chairman accessions a first item, or rules the classes stay item-free.',
  'Every item, maker, date, value and custodian below class level is OPEN.',
  'Accessioned items with makers and provenance',
  'At least one class holds a real accession with a maker state that is not OPEN',
  'Accession a first item, or confirm classes stay open', now()),
 ('ECONOMY',27,'Economy','thylora_estate_ledger_entries + thylora_estate_accounts',
  'The castle economy pilot.',
  '16 estate accounts and all 15 required flows are traced end to end with FROM, TO, REASON, AMOUNT, CURRENCY, DATE, AUTHORITY, EVIDENCE and STATUS. Every amount is OPEN_AMOUNT. Nothing was fabricated.',
  'Chairman sets the period settlement instrument, which unblocks every amount field at once.',
  'CURRENCY is OPEN on all 15 flows: the 1700s estate settlement instrument has never been established, and REE has not been confirmed as the period instrument.',
  'A working estate ledger with real postings',
  'One flow carries a RECORDED amount in a named instrument with evidence',
  'Name the 1700s estate settlement instrument, or confirm REE covers the period', now()),
 ('BANKING',28,'Banking','ersatzreality_financial_accounts + ersatzreality_financial_ledger + thylora_bank_*',
  'Personal and household banking.',
  '7 account types registered and mapped onto the 24 live ErsatzReality Financial accounts. The ledger now carries counterparty, direction, reason, authority, evidence and amount_state. Facilities, rate schedules, statements and fraud/security events exist as structures.',
  'Open a family account and a youth account against real holders.',
  'No rate, fee or credit limit is set: none exists in canon and none was invented.',
  'Accounts that receive, transfer, hold and report',
  'One evidenced REE credit is posted and one statement is issued',
  'Approve the first evidenced REE issuance, and set interest and fee policy or confirm there is none', now()),
 ('MARKETS',29,'Markets','thylora_world_market_* tables',
  'Market operating structure.',
  '5 venues, 6 sessions, 6 regulations and 6 EdereAirah businesses registered as PRIVATE companies. ZERO quote rows were written. A check constraint now makes it impossible to record a TEST or SIMULATION price as evidenced.',
  'Admit a company to a venue, which is the first act that can produce a real quote.',
  'No company is listed and no evidenced trade exists, so there is no market price. This is the correct state, not a gap.',
  'A market that prices real listings',
  'One company is admitted to a venue and one evidenced in-world trade produces a quote',
  'Admit a first company to a venue, or hold every company private', now()),
 ('BUSINESSES',30,'Businesses','businesses + business_accounts + thylora_business_*',
  'Business finance.',
  '7 businesses and 17 business accounts carry finance class and payroll flags. Purchase orders, invoices with both ledger sides, settlements, insurance, tax ledger, asset register, owner equity and period results all exist as structures.',
  'Raise the first real purchase order and invoice against one business.',
  'No business transaction rows exist yet, so no period result can be computed. Period results stay OPEN while any posting is OPEN_AMOUNT.',
  'Businesses that invoice, pay, own assets and report a result',
  'One business has a settled invoice and a computed period result',
  'Pick the first business to run a full finance cycle', now()),
 ('MONEY_SYSTEM',31,'Money system','financial_instrument_registry + currency_visual_registry',
  'REE, RRE and PEETE DOLUP.',
  'All three reconciled on eleven fields each and kept strictly separate. REE ACTIVE. RRE REGISTERED but NOT_ISSUED. PEETE DOLUP CLASSIFICATION_PENDING and NOT_ISSUED. A constraint now blocks any Earth legal-tender or Earth-exchange claim without an authority record.',
  'Chairman settles the monetary constitution: supply, divisibility and smallest unit.',
  'REE supply rule, divisibility and smallest unit are OPEN. RRE economics are OPEN. PEETE DOLUP class is OPEN.',
  'Three separately defined instruments with stated mechanics',
  'REE has a supply rule and a smallest unit, and RRE and PEETE DOLUP each have a settled class',
  'Settle REE supply and divisibility; classify PEETE DOLUP; define RRE issuance', now()),
 ('PEOPLE_IN_TIME',32,'People in time','thylora_people_in_time_state',
  'PIT-STATE-001.',
  'Lane is ACTIVE with figure NOT_SELECTED, by rule. Selection follows a thinking problem; the problem never follows the figure. Marcus Aurelius remains banned as a default.',
  'A figure is selected only when a specific thinking problem appears that their recorded thinking bears on.',
  'No figure is selected and none should be. The dashboard shows the lane active with an empty figure rather than filling it.',
  'A figure chosen by a problem',
  'A real problem selects a figure and the selection is evidenced',
  null, now()),
 ('HISTORY_EVIDENCE',33,'History / evidence','thylora_forward_quality_standards THY-STD-HISTORY-PRESENTATION-001',
  'Earth history presentation requirement.',
  'The ten-field presentation standard is recorded and ACTIVE, including the rule that broad identity words are not racial shortcuts and that EdereAirah history is never labelled mythology. No stone-castle origin research was performed in this run, as directed.',
  'Apply the standard to the next Earth-history presentation.',
  null,'Earth history presented field by field with UNKNOWN stated',
  'The next Earth-history surface carries all ten fields',
  null, now()),
 ('HISTORICAL_MEDICINE',34,'Historical medicine','thylora_historical_medicine_evidence + THY-STD-HISTORICAL-MEDICINE-001',
  'Five-layer evidence discipline.',
  'The five-layer standard is ACTIVE: historical use, source wording, firsthand report, later evidence, unknown. A firsthand report is preserved as reported experience and is never universalized or erased. Both rosemary records carry the ban.',
  'Record the first firsthand historical report under the new layer.',
  null,'Remedy records with layers that never collapse into a verdict',
  'A firsthand report is stored in its own layer alongside later evidence',
  null, now()),
 ('FOOTBALL',35,'Football','sports_team_registry + ERFL registries',
  'Sports lane. Not this run work.',
  'Held as found. 33 sports_team_registry rows and the ERFL records from sequence 501 are untouched by this run.',
  'The owning session continues it.',
  'Not this run work. Read only, not duplicated and not interrupted.',
  'Football program continuity',
  'The owning session reports it complete', null, now()),
 ('VEHICLES',36,'Vehicles','er_automotive_* and er_vehicle_* registries',
  'Vehicle program. Not this run work.',
  'Held as found. 31 er_* automotive and vehicle registries including the build ledger and project pipeline are untouched by this run.',
  'The owning session continues it.',
  'Not this run work. Read only, not duplicated and not interrupted.',
  'Vehicle program continuity',
  'The owning session reports it complete', null, now())
on conflict (lane_code) do update set
  now_text          = excluded.now_text,
  next_text         = excluded.next_text,
  blocked_text      = excluded.blocked_text,
  output_text       = excluded.output_text,
  done_when_text    = excluded.done_when_text,
  chairman_decision = excluded.chairman_decision,
  source_of_truth   = excluded.source_of_truth,
  source_note       = excluded.source_note,
  last_movement_at  = now(),
  updated_at        = now();

-- Existing lanes this run did not own: fill only where the lane is currently blank,
-- so no other session's text is overwritten.
update public.thylora_control_lane_registry set
  now_text = 'Held as found by sequence 533. Owned by another session.',
  next_text = 'The owning session continues it.',
  blocked_text = 'Not this run work. Read only, not duplicated and not interrupted.',
  output_text = coalesce(output_text, title || ' continuity'),
  done_when_text = coalesce(done_when_text, 'The owning session reports it complete'),
  last_movement_at = now(), updated_at = now()
where lane_code in ('CREATIVE','MIRROR','MATH','VLEGH','TIME','WORLD_BUILDINGS','PEOPLE',
                    'PRODUCT_ORIGIN_MAKERS','SPORTS_ENGINEERING','REPORTS','EMAIL','IDEA_QUEUE')
  and now_text is null;
