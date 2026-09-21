-- THY-WORK-INES-LIFE-ECONOMY-575
-- Inés Morales as a complete living worker/person.
-- Additive only. No existing row is overwritten. No REE amount is invented.
-- Every proposal carries an explicit decision state. UNKNOWN stays UNKNOWN.

begin;

-- ---------------------------------------------------------------
-- 1. WARDROBE SUPPLY CHAIN — role / business SLOTS only, no names
-- ---------------------------------------------------------------
create table if not exists public.thylora_wardrobe_supply_chain (
  slot_code               text primary key,
  estate_code             text not null,
  time_region             text not null default '1700s',
  supply_stage            text not null,
  stage_order             int  not null,
  slot_kind               text not null check (slot_kind in ('ROLE','WORKSHOP','BUSINESS','MERCHANT','ESTATE_PRODUCTION')),
  slot_label              text not null,
  identity_code           text,
  identity_state          text not null default 'OPEN_IDENTITY',
  responsible_role_code   text,
  pays_from_account       text,
  zone_path               jsonb not null default '[]'::jsonb,
  no_invented_makers      boolean not null default true,
  open_fields             jsonb not null default '[]'::jsonb,
  state                   text not null default 'STRUCTURE_OPEN_IDENTITY',
  source_query_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

insert into public.thylora_wardrobe_supply_chain
 (slot_code, estate_code, supply_stage, stage_order, slot_kind, slot_label,
  responsible_role_code, pays_from_account, zone_path, open_fields, source_query_id)
values
 ('WRD-SLOT-FIBRE','ER-CASTLE-ROYAL-001','FIBRE_ORIGIN',10,'ESTATE_PRODUCTION',
  'Fibre origin — estate-grown or bought fibre for household cloth',
  'HH-1700-PROVISIONER','CAS-ACC-WARDROBE','["SEC-Z-FARMS","SEC-Z-DELIVERY","SEC-Z-GATE"]',
  '["fibre class","estate-grown vs bought","yield","season"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-WEAVER','ER-CASTLE-ROYAL-001','CLOTH_MAKING',20,'WORKSHOP',
  'Weaver / cloth workshop — turns fibre into cloth',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","loom count","cloth widths","price"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-CLOTH-MERCHANT','ER-CASTLE-ROYAL-001','CLOTH_SUPPLY',30,'MERCHANT',
  'Cloth merchant — supplies bought cloth, thread and fasteners to the household',
  'HH-1700-PROVISIONER','CAS-ACC-WARDROBE','["SEC-Z-ROADS","SEC-Z-DELIVERY","SEC-Z-GATE"]',
  '["merchant identity","market calendar","credit terms","price"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-WARDROBE-KEEPER','ER-CASTLE-ROYAL-001','HOUSEHOLD_ISSUE',40,'ROLE',
  'Household wardrobe keeper — holds staff cloth stock, issues and records replacement',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WAREHOUSES"]',
  '["person identity","issue cadence","stock count","allowance rule"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-CUTTER','ER-CASTLE-ROYAL-001','CUTTING',50,'WORKSHOP',
  'Cutter — takes measurements and cuts the cloth to pattern',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","pattern system","measurement record"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-SEAMSTRESS','ER-CASTLE-ROYAL-001','SEWING',60,'WORKSHOP',
  'Seamstress / dressmaker workshop — makes up the garment',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","hands employed","making time","price"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-FITTER','ER-CASTLE-ROYAL-001','FITTING',70,'WORKSHOP',
  'Fitting — fits the made garment to the wearer and adjusts',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS","SEC-Z-COURTYARD"]',
  '["who attends the fitting","where the fitting happens","adjustment allowance"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-MENDER','ER-CASTLE-ROYAL-001','REPAIR',80,'WORKSHOP',
  'Mender — repairs garments in service; distinct from making a new one',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","repair cadence","what the wearer mends herself"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-LAUNDRY','ER-CASTLE-ROYAL-001','WASHING',90,'ROLE',
  'Laundry — washes the apron and work dress; drives apron replacement rate',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-COURTYARD"]',
  '["person identity","wash cycle","water source","drying place"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-SHOEMAKER','ER-CASTLE-ROYAL-001','FOOTWEAR_MAKING',100,'WORKSHOP',
  'Shoemaker — makes the sturdy flat shoes the lock sheet requires',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","last / measurement record","price"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('WRD-SLOT-COBBLER','ER-CASTLE-ROYAL-001','FOOTWEAR_REPAIR',110,'WORKSHOP',
  'Cobbler — resoles and repairs shoes; a kitchen floor wears soles fast',
  'HH-1700-STEWARD','CAS-ACC-WARDROBE','["SEC-Z-WORKSHOPS"]',
  '["workshop identity","resole cadence","price"]','THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (slot_code) do nothing;

-- ---------------------------------------------------------------
-- 2. GARMENT REGISTRY — the actual things Inés wears
-- ---------------------------------------------------------------
create table if not exists public.thylora_person_garment_registry (
  garment_code            text primary key,
  person_code             text not null,
  garment_class           text not null,
  lock_requirement        text,
  ownership_state         text not null,
  ownership_rule          text,
  issued_by_slot          text,
  made_by_slot            text,
  fitted_by_slot          text,
  repaired_by_slot        text,
  washed_by_slot          text,
  replacement_cadence_state text not null default 'OPEN',
  allowance_state         text not null default 'OPEN',
  cost_state              text not null default 'OPEN_NO_CANON_PRICE',
  instrument_code         text not null default 'REE',
  in_service_count_state  text not null default 'OPEN',
  open_fields             jsonb not null default '[]'::jsonb,
  source_refs             jsonb not null default '[]'::jsonb,
  state                   text not null default 'STRUCTURE_DEFINED_NO_PRICE',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

insert into public.thylora_person_garment_registry
 (garment_code, person_code, garment_class, lock_requirement, ownership_state, ownership_rule,
  issued_by_slot, made_by_slot, fitted_by_slot, repaired_by_slot, washed_by_slot,
  open_fields, source_refs)
values
 ('GAR-INES-WORKDRESS-001','ER-ROYAL-COOK-001','WORK_DRESS',
  'Practical period work dress in hard-wearing dark or muted cloth; sleeves secured above the wrist for work.',
  'PROPOSED_WEARER_OWNS_AFTER_ISSUE',
  'PROPOSED: once issued or bought, the dress is hers — it is not withdrawn at the end of a service day and it is not a livery loan. Chairman decision required.',
  'WRD-SLOT-WARDROBE-KEEPER','WRD-SLOT-SEAMSTRESS','WRD-SLOT-FITTER','WRD-SLOT-MENDER','WRD-SLOT-LAUNDRY',
  '["cloth class","dye source","regional cut","dress size","exact measurements","price","replacement cadence","how many in service"]',
  '["LOCK-ER-ROYAL-COOK-001","THY-WORK-INES-LIFE-ECONOMY-575"]'),
 ('GAR-INES-APRON-001','ER-ROYAL-COOK-001','APRON',
  'Washable apron. Her standing shows in the quality of her apron, not in what she wears over it.',
  'PROPOSED_HOUSEHOLD_ISSUE',
  'PROPOSED: the apron is household-issued and household-replaced, because the household requires it and the household laundry consumes it. Chairman decision required.',
  'WRD-SLOT-WARDROBE-KEEPER','WRD-SLOT-SEAMSTRESS',null,'WRD-SLOT-MENDER','WRD-SLOT-LAUNDRY',
  '["cloth class","how many in rotation","wash cycle","replacement cadence","price"]',
  '["LOCK-ER-ROYAL-COOK-001","THY-WORK-INES-LIFE-ECONOMY-575"]'),
 ('GAR-INES-SHOES-001','ER-ROYAL-COOK-001','SHOES',
  'Sturdy flat shoes. Flat is locked; brown is proposed, not locked.',
  'PROPOSED_WEARER_OWNS_AFTER_ISSUE',
  'PROPOSED: hers, with the household contributing to resoling because the kitchen floor causes the wear. Chairman decision required.',
  'WRD-SLOT-WARDROBE-KEEPER','WRD-SLOT-SHOEMAKER','WRD-SLOT-SHOEMAKER','WRD-SLOT-COBBLER',null,
  '["shoe size","last record","sole material","resole cadence","price"]',
  '["LOCK-ER-ROYAL-COOK-001","THY-WORK-INES-LIFE-ECONOMY-575"]')
on conflict (garment_code) do nothing;

-- ---------------------------------------------------------------
-- 3. COST EQUATION — components, every amount OPEN
-- ---------------------------------------------------------------
create table if not exists public.thylora_garment_cost_components (
  component_code          text primary key,
  garment_code            text not null,
  component_order         int  not null,
  component_name          text not null,
  cost_direction          text not null check (cost_direction in ('ADD','SUBTRACT')),
  supplier_slot_code      text,
  amount_state            text not null default 'OPEN_AMOUNT',
  instrument_code         text not null default 'REE',
  note                    text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_garment_cost_components
 (component_code, garment_code, component_order, component_name, cost_direction, supplier_slot_code, note)
values
 ('GCC-DRESS-010','GAR-INES-WORKDRESS-001',10,'FABRIC','ADD','WRD-SLOT-CLOTH-MERCHANT','Main cloth. Quantity depends on the cut and on her measurements, which are UNKNOWN.'),
 ('GCC-DRESS-015','GAR-INES-WORKDRESS-001',15,'LINING','ADD','WRD-SLOT-CLOTH-MERCHANT','Only if the cut has a lining. Whether it does is OPEN.'),
 ('GCC-DRESS-020','GAR-INES-WORKDRESS-001',20,'THREAD','ADD','WRD-SLOT-CLOTH-MERCHANT',null),
 ('GCC-DRESS-030','GAR-INES-WORKDRESS-001',30,'FASTENERS','ADD','WRD-SLOT-CLOTH-MERCHANT','Lacing, hooks or pins. Which, is OPEN.'),
 ('GCC-DRESS-040','GAR-INES-WORKDRESS-001',40,'CUTTING','ADD','WRD-SLOT-CUTTER','Labour.'),
 ('GCC-DRESS-050','GAR-INES-WORKDRESS-001',50,'SEWING','ADD','WRD-SLOT-SEAMSTRESS','Labour. The largest labour line.'),
 ('GCC-DRESS-060','GAR-INES-WORKDRESS-001',60,'FITTING','ADD','WRD-SLOT-FITTER','Labour plus her time off the floor.'),
 ('GCC-DRESS-070','GAR-INES-WORKDRESS-001',70,'EXPECTED_REPAIR','ADD','WRD-SLOT-MENDER','Lifetime mending carried into the cost of owning the dress, not the price on the day.'),
 ('GCC-DRESS-080','GAR-INES-WORKDRESS-001',80,'HOUSEHOLD_ALLOWANCE','SUBTRACT','WRD-SLOT-WARDROBE-KEEPER','Whatever the household pays toward staff clothing. Whether any allowance exists is OPEN.'),
 ('GCC-APRON-010','GAR-INES-APRON-001',10,'FABRIC','ADD','WRD-SLOT-CLOTH-MERCHANT','Plain washable cloth; far less of it than the dress.'),
 ('GCC-APRON-020','GAR-INES-APRON-001',20,'THREAD','ADD','WRD-SLOT-CLOTH-MERCHANT',null),
 ('GCC-APRON-030','GAR-INES-APRON-001',30,'TIES','ADD','WRD-SLOT-CLOTH-MERCHANT',null),
 ('GCC-APRON-040','GAR-INES-APRON-001',40,'SEWING','ADD','WRD-SLOT-SEAMSTRESS','Simple making; no fitting stage.'),
 ('GCC-APRON-050','GAR-INES-APRON-001',50,'EXPECTED_REPLACEMENT','ADD','WRD-SLOT-LAUNDRY','Aprons are consumed by washing, not by wearing out.'),
 ('GCC-APRON-060','GAR-INES-APRON-001',60,'HOUSEHOLD_ALLOWANCE','SUBTRACT','WRD-SLOT-WARDROBE-KEEPER','Proposed full household issue, which would make her out-of-pocket cost zero.'),
 ('GCC-SHOES-010','GAR-INES-SHOES-001',10,'LEATHER_UPPER','ADD','WRD-SLOT-SHOEMAKER',null),
 ('GCC-SHOES-020','GAR-INES-SHOES-001',20,'SOLE','ADD','WRD-SLOT-SHOEMAKER','The wear part.'),
 ('GCC-SHOES-030','GAR-INES-SHOES-001',30,'MAKING','ADD','WRD-SLOT-SHOEMAKER','Labour, including the last.'),
 ('GCC-SHOES-040','GAR-INES-SHOES-001',40,'FITTING','ADD','WRD-SLOT-SHOEMAKER',null),
 ('GCC-SHOES-050','GAR-INES-SHOES-001',50,'EXPECTED_RESOLE','ADD','WRD-SLOT-COBBLER','Recurring. Standing on flagstone through five service segments is what drives it.'),
 ('GCC-SHOES-060','GAR-INES-SHOES-001',60,'HOUSEHOLD_ALLOWANCE','SUBTRACT','WRD-SLOT-WARDROBE-KEEPER','Proposed: household pays resoling, wearer pays the shoes.')
on conflict (component_code) do nothing;

-- ---------------------------------------------------------------
-- 4. PRICE CALIBRATION — ratios only. No REE amount is written.
-- ---------------------------------------------------------------
create table if not exists public.thylora_price_calibration_proposals (
  proposal_code           text primary key,
  subject_code            text not null,
  subject_kind            text not null,
  proposal_kind           text not null,
  proposed_expression     text not null,
  ratio_basis             text,
  absolute_amount_state   text not null default 'NOT_STATED_NO_CANON_UNIT',
  instrument_code         text not null default 'REE',
  alternatives            jsonb not null default '[]'::jsonb,
  rationale               text,
  blocked_on              jsonb not null default '[]'::jsonb,
  earth_wage_claim        boolean not null default false,
  decision_state          text not null default 'CHAIRMAN_DECISION_REQUIRED',
  canon_state             text not null default 'PROPOSED_NOT_CANON',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_price_calibration_proposals
 (proposal_code, subject_code, subject_kind, proposal_kind, proposed_expression, ratio_basis,
  alternatives, rationale, blocked_on, source_query_id)
values
 ('CAL-WAGE-BAND-COOK','HH-1700-COOK','ROLE','WAGE_BAND',
  'Inés sits in WAGE-BAND-PROVISION at the band ceiling — the senior provision rate, above HH-1700-DEPUTY-COOK, below the household officer bands.',
  'Relative position only. No rate is stated.',
  '["A: one PROVISION band with a senior step for the Head Cook","B: two PROVISION bands, HEAD and HAND, with the Deputy at the top of HAND","C: Head Cook lifted out of PROVISION into a household officer band beside HH-1700-STEWARD"]',
  'The role registry already makes her senior: HH-1700-COOK directs four roles and reports to the Steward. The band must reflect that, and PAYL-CASTLE-001-HH-1700-COOK already names her on WAGE-BAND-PROVISION.',
  '["REE smallest unit unset","REE divisibility OPEN","no rate on any band"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('CAL-PAY-PERIOD','PAYP-CASTLE-001','PAY_PERIOD','PERIOD_LENGTH',
  'One pay period = four service cycles of seven service-cycle days, i.e. one wage settlement for every four relief days she takes.',
  'Expressed in service cycles because the native calendar is not locked.',
  '["A: pay every 7 service-cycle days — one relief day, one payment","B: pay every 28 service-cycle days — four relief days, one payment (proposed)","C: pay at quarter-turns of the estate year, once the native calendar exists"]',
  'The relief cycle is the only repeating unit the kitchen actually has. Anchoring pay to it means payroll and schedule cannot drift apart, and no Earth week is imported.',
  '["native calendar OPEN","PAYP-CASTLE-001 period_start and period_end OPEN"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('CAL-PAYMENT-DAY','PAYP-CASTLE-001','PAY_PERIOD','PAYMENT_DAY',
  'Paid on the morning of a relief day, by the Scribe, before she leaves the castle.',
  'Position in the cycle, not a named weekday.',
  '["A: morning of the relief day (proposed) — she has the money before a market visit","B: the service day after the relief day — the household books close first","C: on demand from the Steward — rejected, it makes pay discretionary"]',
  'HH-1700-SCRIBE already controls CAS-ACC-PAYROLL. Paying before the relief day is what makes a market/town off-day possible at all.',
  '["native calendar OPEN"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('CAL-DRESS-COST','GAR-INES-WORKDRESS-001','GARMENT','PRICE_RATIO',
  'DRESS COST / PAY PERIOD — proposed band: between one half and one and a half pay periods of her own wage.',
  'Ratio to her own pay period. No REE figure.',
  '["A: ~0.5 pay period — cloth is cheap on this estate and the household carries the making","B: ~1.0 pay period (proposed midpoint) — a made-to-measure garment costs about what she earns in a period","C: ~1.5 pay periods — cloth is dear and she buys it outright with no allowance"]',
  'A ratio can be reasoned about now; a price cannot, because REE has no smallest unit and no band has a rate. The ratio is what the Chairman is actually choosing — the REE figure falls out of it once a band rate exists.',
  '["REE smallest unit unset","CAL-WAGE-BAND-COOK undecided","CAL-PAY-PERIOD undecided","household allowance rule OPEN"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('CAL-APRON-COST','GAR-INES-APRON-001','GARMENT','PRICE_RATIO',
  'APRON COST / PAY PERIOD — proposed band: under one tenth of a pay period, and proposed to be borne by the household, not by her.',
  'Ratio to her own pay period. No REE figure.',
  '["A: household issue, her cost zero (proposed)","B: household issues the first, she replaces the rest","C: she buys all of them"]',
  'The apron is required by the household and consumed by household laundry. If she pays for it, the household is charging her for its own hygiene rule.',
  '["REE smallest unit unset","CAL-PAY-PERIOD undecided","apron rotation count OPEN"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('CAL-SHOE-COST','GAR-INES-SHOES-001','GARMENT','PRICE_RATIO',
  'SHOE COST / PAY PERIOD — proposed band: between one quarter and three quarters of a pay period for a new pair, with resoling at roughly one fifth of that each time.',
  'Ratio to her own pay period. No REE figure.',
  '["A: ~0.25 pay period new, she resoles at her own cost","B: ~0.5 pay period new, household pays resoling (proposed)","C: shoes are household-issued as safety equipment for a hearth floor"]',
  'Shoes are the only item with a genuine recurring cost, because the floor destroys soles. Pricing the resole matters more than pricing the pair.',
  '["REE smallest unit unset","CAL-PAY-PERIOD undecided","resole cadence OPEN","floor material UNKNOWN"]','THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (proposal_code) do nothing;

-- ---------------------------------------------------------------
-- 5. RELIEF / DAY OFF
-- ---------------------------------------------------------------
create table if not exists public.thylora_relief_cycle_proposals (
  proposal_code           text primary key,
  role_code               text not null,
  person_code             text,
  schedule_code           text not null,
  cycle_expression        text not null,
  relief_role_code        text not null,
  authority_on_relief_day text not null,
  day_list_signer         text not null,
  herb_control            text not null,
  menu_change_authority   text not null,
  shortage_route          text not null,
  emergency_recall_rule   text not null,
  unpaid_work_rule        text not null,
  coverage_proof          jsonb not null default '{}'::jsonb,
  blocked_on              jsonb not null default '[]'::jsonb,
  decision_state          text not null default 'CHAIRMAN_DECISION_REQUIRED',
  canon_state             text not null default 'PROPOSED_NOT_CANON',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_relief_cycle_proposals
 (proposal_code, role_code, person_code, schedule_code, cycle_expression, relief_role_code,
  authority_on_relief_day, day_list_signer, herb_control, menu_change_authority,
  shortage_route, emergency_recall_rule, unpaid_work_rule, coverage_proof, blocked_on, source_query_id)
values
 ('REL-INES-001','HH-1700-COOK','ER-ROYAL-COOK-001','SCHED-HH-1700-KITCHEN',
  'One full relief day in every seven service-cycle days. Counted in service cycles, not in weeks, until the native calendar is locked.',
  'HH-1700-DEPUTY-COOK',
  'HH-1700-DEPUTY-COOK holds full kitchen authority for the whole relief day, not only the DAY segment. The Head Cook is off the establishment for that day.',
  'HH-1700-PROVISIONER hands the day list to HH-1700-DEPUTY-COOK, who signs for it. The existing handoff rule already names "whichever of the two holds the kitchen" — on a relief day that is the Deputy.',
  'The daily herb cut at LAND-HERB-KITCHEN-001 passes to HH-1700-DEPUTY-COOK for that day under EST-PO-PROC-HERB-REQ. If Inés walks the herb ground on her relief day she does so by choice and cuts nothing for service.',
  'HH-1700-DEPUTY-COOK may substitute within the day list. A change that alters what reaches the family table goes to HH-1700-STEWARD, not to Inés at home.',
  'Shortage goes Deputy Cook to Provisioner to Steward. It does not reach Inés on a relief day.',
  'Recall is a named exception, not a habit: only HH-1700-STEWARD may recall her, only for fire loss, a failure of the kitchen fabric, or a household event the Deputy has not been briefed on. A recalled relief day is re-granted, not cancelled.',
  'No invisible unpaid Head Cook work. If she works a relief day, that day is either paid or re-granted, and the payroll line records which.',
  '{"night":"KIT-S-NIGHT held by HH-1700-SCULLERY — unaffected","first_light":"KIT-S-FIRSTLIGHT held by HH-1700-BAKER — unaffected","morning":"KIT-S-MORNING held by HH-1700-PROVISIONER — unaffected","day":"KIT-S-DAY normally held by HH-1700-COOK — held by HH-1700-DEPUTY-COOK, which is already the documented relief","close":"KIT-S-CLOSE held by HH-1700-SCULLERY — unaffected","fire_rule":"The kitchen is never unattended while the fire is alight. Satisfied: only one of five segments changes hands."}',
  '["native calendar OPEN","HH-1700-DEPUTY-COOK person identity OPEN_NO_PERSON","deputy wage band OPEN — a relief day costs the household nothing recorded until it has a rate"]',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (proposal_code) do nothing;

-- ---------------------------------------------------------------
-- 6. OFF-DUTY ROUTINE — rest is allowed to be rest
-- ---------------------------------------------------------------
create table if not exists public.thylora_person_off_duty_routine (
  block_code              text primary key,
  person_code             text not null,
  day_type                text not null check (day_type in ('NORMAL_RELIEF','MARKET_TOWN_RELIEF')),
  block_order             int  not null,
  segment                 text not null,
  activity                text not null,
  is_labour               boolean not null default false,
  serves_the_household    boolean not null default false,
  requires_relationship   boolean not null default false,
  dependency_state        text not null default 'NONE',
  zone_path               jsonb not null default '[]'::jsonb,
  canon_state             text not null default 'PROPOSED_NOT_CANON',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_person_off_duty_routine
 (block_code, person_code, day_type, block_order, segment, activity, is_labour, serves_the_household,
  requires_relationship, dependency_state, zone_path, source_query_id)
values
 ('OFF-N-010','ER-ROYAL-COOK-001','NORMAL_RELIEF',10,'NIGHT_BEFORE',
  'She does not bank the fire. She hands the kitchen over at KIT-S-CLOSE and does not come back to check it.',
  false,false,false,'NONE','["SEC-Z-KITCHENS"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-020','ER-ROYAL-COOK-001','NORMAL_RELIEF',20,'FIRST_LIGHT',
  'Sleeps through first light for the only time in the cycle. She wakes at the hour her body expects and lies there anyway.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-030','ER-ROYAL-COOK-001','NORMAL_RELIEF',30,'MORNING',
  'Washes properly rather than quickly. Hair down, then pinned again out of habit before she has decided to go anywhere.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-040','ER-ROYAL-COOK-001','NORMAL_RELIEF',40,'MORNING',
  'Eats food she did not plan and did not cook for anyone else. This is the part of the day that is most unlike her work.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-050','ER-ROYAL-COOK-001','NORMAL_RELIEF',50,'MIDDAY',
  'Mends her own clothes — a seam, a tie, a hem. Small, personal, not the mender''s work and not the household''s.',
  true,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-060','ER-ROYAL-COOK-001','NORMAL_RELIEF',60,'MIDDAY',
  'Knife care. She cleans and sets her own edge. She does not sharpen the kitchen''s knives on her own day.',
  true,false,false,'BLOCKED_ON_OBJECT_ROW: OBJ-INES-FAVORITE-KNIFE-001 is named in the 572 work row but the object registry holds zero rows.','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-070','ER-ROYAL-COOK-001','NORMAL_RELIEF',70,'AFTERNOON',
  'Locket custody. It stays closed and stays on her. Nothing about it is opened, explained or shown, on a relief day or any other.',
  false,false,false,'LOCKED_BY LOCK-ER-ROYAL-COOK-001','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-080','ER-ROYAL-COOK-001','NORMAL_RELIEF',80,'AFTERNOON',
  'Walks the herb ground because she likes it, not because the day list asks for it. She cuts nothing. The Deputy holds the cut that day.',
  false,false,false,'NONE','["SEC-Z-COURTYARD","SEC-Z-FARMS"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-090','ER-ROYAL-COOK-001','NORMAL_RELIEF',90,'AFTERNOON',
  'Quiet time. Sits. Does not fill it. This block exists so that rest is not silently converted into labour.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-100','ER-ROYAL-COOK-001','NORMAL_RELIEF',100,'EVENING',
  'Companionship. WHO is OPEN — no companion may be named until a relationship is authored. The only authored relations are Veronica Hall (locket, mechanism UNKNOWN), Clara Bennett (professional parity) and the children (she feeds them).',
  false,false,true,'BLOCKED_ON_RELATIONSHIP: no non-work companion exists in relationship_map.','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-N-110','ER-ROYAL-COOK-001','NORMAL_RELIEF',110,'NIGHT',
  'Sleeps a full night without a fire to listen for. Returns to KIT-S-FIRSTLIGHT the following cycle.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-010','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',10,'FIRST_LIGHT',
  'Wakes early by choice, not by duty. A town day is shaped by the cart and by the light, so it starts when a service day would.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-020','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',20,'FIRST_LIGHT',
  'Takes her pay. Under CAL-PAYMENT-DAY the Scribe pays her on the morning of a relief day; without that, this day cannot happen.',
  false,false,false,'BLOCKED_ON_DECISION: CAL-PAYMENT-DAY','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-030','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',30,'MORNING',
  'Leaves through the gate as a person, not as the kitchen. Canon: SEC-Z-GATE is a controlled crossing, so she is seen out and seen back in. The challenge form and written-pass rule are OPEN.',
  false,false,false,'OPEN_FIELD: SEC-Z-GATE challenge_form, written_pass_rule','["SEC-Z-COURTYARD","SEC-Z-GATE"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-040','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',40,'MORNING',
  'Travels the approach road. Canon movement on this estate is horse-drawn cart along SEC-Z-ROADS; whether she walks, rides a returning provision cart, or pays for a seat is OPEN.',
  false,false,false,'OPEN: travel means and distance to town','["SEC-Z-ROADS","SEC-Z-DELIVERY"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-050','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',50,'MIDDAY',
  'Personal spending — her own money on her own things. Distinct from CAS-ACC-PROVISIONS: nothing she buys on a relief day enters the household stores.',
  false,false,false,'BLOCKED_ON_CALIBRATION: no REE unit exists, so no purchase can be priced.','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-060','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',60,'MIDDAY',
  'Looks at cloth. This is the only routine block that touches the wardrobe chain: she sees what WRD-SLOT-CLOTH-MERCHANT has before the household orders anything for her.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-070','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',70,'MIDDAY',
  'Drops shoes at WRD-SLOT-COBBLER for resoling if they need it, and collects the previous pair. The single most likely errand of a town day.',
  true,false,false,'NONE','["SEC-Z-WORKSHOPS"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-080','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',80,'AFTERNOON',
  'Eats a meal she bought. Off-duty meals are not drawn from KIT-W-STAFF, which is the staff meal route on a service day.',
  false,false,false,'NONE','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-090','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',90,'AFTERNOON',
  'Saving. What she does not spend, she keeps. WHERE she keeps it is OPEN — no personal account exists for her in the banking registry, only the payroll line that pays her.',
  false,false,false,'BLOCKED: no ER-ROYAL-COOK-001 row in ersatzreality_financial_accounts','[]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-100','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',100,'EVENING',
  'Returns before the gate closes. SEC-Z-GATE night_closing_rule is OPEN, so how hard that deadline is, is not yet canon.',
  false,false,false,'OPEN_FIELD: SEC-Z-GATE night_closing_rule','["SEC-Z-ROADS","SEC-Z-GATE","SEC-Z-COURTYARD"]','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('OFF-M-110','ER-ROYAL-COOK-001','MARKET_TOWN_RELIEF',110,'NIGHT',
  'Sleeps. Does not inspect the kitchen on the way past, even though she passes it.',
  false,false,false,'NONE','["SEC-Z-KITCHENS"]','THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (block_code) do nothing;

-- ---------------------------------------------------------------
-- 7. RESIDENCE OPTIONS — three models, none canonized
-- ---------------------------------------------------------------
create table if not exists public.thylora_person_residence_options (
  option_code             text primary key,
  person_code             text not null,
  model_name              text not null,
  location_class          text not null,
  castle_anchor_code      text not null,
  zone_path               jsonb not null default '[]'::jsonb,
  resident_household_ref  text,
  walking_distance_state  text not null default 'UNKNOWN',
  meal_arrangement        text,
  lodging_treatment       text,
  privacy_note            text,
  storage_note            text,
  commute_effect          text,
  emergency_recall_effect text,
  wage_interaction        text,
  canon_state             text not null default 'PROPOSED_NOT_CANON',
  decision_state          text not null default 'CHAIRMAN_DECISION_REQUIRED',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_person_residence_options
 (option_code, person_code, model_name, location_class, castle_anchor_code, zone_path,
  resident_household_ref, meal_arrangement, lodging_treatment, privacy_note, storage_note,
  commute_effect, emergency_recall_effect, wage_interaction, source_query_id)
values
 ('RES-INES-A','ER-ROYAL-COOK-001','Castle service apartment','IN_CASTLE','ER-CASTLE-ROYAL-001',
  '["SEC-Z-KITCHENS","SEC-Z-COURTYARD"]',null,
  'Eats in the castle on service days. Off-duty meals are the problem: if she eats from the kitchen on her relief day she never leaves work.',
  'Lodging in kind, deducted from or added to the wage band. Which, is OPEN — and it changes what her wage actually means.',
  'Lowest. She lives inside her own workplace and inside a security zone. Off-duty is a room, not a life.',
  'Least. A room in a service range, so personal storage is small and the locket and knife travel on her.',
  'None. Steps, not a road.',
  'Strongest — she can be recalled in minutes, which is exactly why the recall rule must be narrow under REL-INES-001.',
  'Board and lodging would form part of pay. WAGE-BAND-PROVISION.in_kind_component is already OPEN on this exact question.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('RES-INES-B','ER-ROYAL-COOK-001','Estate cottage','ON_ESTATE','ER-CASTLE-ROYAL-001',
  '["SEC-Z-COURTYARD","SEC-Z-FARMS"]','ERH-CLASS-STAFF',
  'Cooks for herself off duty. Feeds herself the way she feeds everyone else — this is the model where her off-duty life is most legible.',
  'Estate staff housing. ERH-CLASS-STAFF already exists as an ESTATE_STAFF household on THT-CLASS-COTTAGE with head identity OPEN — she is the obvious candidate to be named into it.',
  'Real. A door that is hers, outside the security zone she works in.',
  'Adequate. Somewhere to keep clothes, a knife, and whatever she saves.',
  'A walk across estate ground. Distance UNKNOWN — the castle has no measured geometry yet.',
  'Workable. Slower than a room in the castle, fast enough for the Steward''s narrow recall rule.',
  'Cottage may be rent-free as part of pay, at reduced rent, or at full rent. OPEN, and it is the same in_kind question as A.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('RES-INES-C','ER-ROYAL-COOK-001','Nearby town residence','OFF_ESTATE','ER-CASTLE-ROYAL-001',
  '["SEC-Z-GATE","SEC-Z-ROADS"]',null,
  'Entirely her own. No household meal entitlement off duty, which makes food a real personal cost for the first time.',
  'She rents or holds it herself. The household pays no lodging, so the wage must carry it.',
  'Highest. She is a townswoman who works at the castle rather than a castle servant who sleeps.',
  'Most. A household of her own, with room for possessions the castle would never fit.',
  'A road journey each service day along SEC-Z-ROADS, through SEC-Z-GATE. This is the model where the commute is itself a cost in time and money.',
  'Weakest. A night recall is a road journey in the dark; the Deputy would have to hold longer, so the recall rule matters most here.',
  'The wage would have to be higher to cover lodging and travel, or the household would have to pay a travel allowance. Neither exists.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (option_code) do nothing;

-- ---------------------------------------------------------------
-- 8. ROUTES — nothing floats outside the castle geography
-- ---------------------------------------------------------------
create table if not exists public.thylora_person_route_registry (
  route_code              text primary key,
  person_code             text not null,
  route_kind              text not null,
  from_anchor             text not null,
  to_anchor               text not null,
  zone_path               jsonb not null default '[]'::jsonb,
  castle_anchor_code      text not null default 'ER-CASTLE-ROYAL-001',
  geometry_dependency     text not null default 'THY-WORK-CASTLE-DIMENSIONAL-TWIN-572',
  measurement_state       text not null default 'UNKNOWN',
  public_disclosure_state text not null default 'PRIVATE_EXACT_PUBLIC_ABSTRACT',
  note                    text,
  state                   text not null default 'STRUCTURE_DEFINED_NO_MEASUREMENT',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_person_route_registry
 (route_code, person_code, route_kind, from_anchor, to_anchor, zone_path, note, source_query_id)
values
 ('RTE-INES-WARDROBE','ER-ROYAL-COOK-001','WARDROBE',
  'WRD-SLOT-CLOTH-MERCHANT','THY-CASTLE-ROYAL-KITCHEN-001',
  '["SEC-Z-ROADS","SEC-Z-DELIVERY","SEC-Z-GATE","SEC-Z-COURTYARD","SEC-Z-WORKSHOPS","SEC-Z-WAREHOUSES"]',
  'Cloth arrives the same way food does — by cart, through the one controlled crossing. It is cut and sewn in the workshop zone and held by the wardrobe keeper before it reaches her.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('RTE-INES-RELIEF','ER-ROYAL-COOK-001','RELIEF_HANDOVER',
  'THY-CASTLE-ROYAL-KITCHEN-001','RES-INES-PENDING',
  '["SEC-Z-KITCHENS","SEC-Z-COURTYARD"]',
  'The handover walk at KIT-S-CLOSE. Its length is undefined until the Chairman picks a residence model, and its measurement is undefined until the castle twin carries dimensions.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('RTE-INES-TOWN','ER-ROYAL-COOK-001','OFF_DAY_TOWN',
  'RES-INES-PENDING','TOWN-PENDING',
  '["SEC-Z-COURTYARD","SEC-Z-GATE","SEC-Z-ROADS"]',
  'The market/town relief-day route. The town itself has no space row and no name — it is an anchor, not a place, until one is authored.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('RTE-INES-HERB','ER-ROYAL-COOK-001','OFF_DAY_CHOICE',
  'THY-CASTLE-ROYAL-KITCHEN-001','LAND-HERB-KITCHEN-001',
  '["SEC-Z-KITCHENS","SEC-Z-COURTYARD","SEC-Z-FARMS"]',
  'Canon already calls this a short same-day walk. On a relief day she may walk it by choice and cut nothing.',
  'THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (route_code) do nothing;

-- ---------------------------------------------------------------
-- 9. PERSON WORLD SHEET PROPOSALS — proposals only, sheet untouched
-- ---------------------------------------------------------------
create table if not exists public.thylora_person_world_sheet_proposals (
  proposal_code           text primary key,
  person_code             text not null,
  field_name              text not null,
  current_state           text not null,
  proposed_value          text,
  proposal_basis          text,
  stays_open_after_decision boolean not null default false,
  decision_state          text not null default 'CHAIRMAN_DECISION_REQUIRED',
  canon_state             text not null default 'PROPOSED_NOT_CANON',
  source_query_id         text,
  created_at              timestamptz not null default now()
);

insert into public.thylora_person_world_sheet_proposals
 (proposal_code, person_code, field_name, current_state, proposed_value, proposal_basis, stays_open_after_decision, decision_state, source_query_id)
values
 ('PWS-P-HEIGHT','ER-ROYAL-COOK-001','height_cm','CANON: 163',null,'No proposal. Already locked on LOCK-ER-ROYAL-COOK-001 and carried on the world sheet.',false,'NO_DECISION_NEEDED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-WEIGHT','ER-ROYAL-COOK-001','weight_range_kg','CANON: 72-77 kg',null,'No proposal. Locked.',false,'NO_DECISION_NEEDED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-AGE','ER-ROYAL-COOK-001','age','CANON: 55 on the lock sheet; the world sheet carries no age column','Carry age 55 onto the world sheet as a derived field, or add an age column.','The lock sheet and the world sheet disagree in shape, not in fact. Only aging may change her.',false,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-DRESS-SIZE','ER-ROYAL-COOK-001','dress_size_system / dress_size_value','UNKNOWN','Record no size. Record measurements instead, held by WRD-SLOT-CUTTER.','A 1700s garment is cut to measurements, not to a size system. Importing a modern size would be an Earth artefact, and EdereAirah has no size system of its own yet.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-DRESS-MEAS','ER-ROYAL-COOK-001','dress_measurements','NO FIELD EXISTS','Add a measurement record held by the cutter slot, not on the public sheet.','Her body measurements are personal. The castle already distinguishes private exact data from public abstract data.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-SHOE-SIZE','ER-ROYAL-COOK-001','shoe_size_system / shoe_size_value','UNKNOWN','Record a shoemaker''s last held by WRD-SLOT-SHOEMAKER rather than a numeric size.','Same reason as the dress size. A last is the period-true record and it is what a resole needs.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-LOCKET-MAT','ER-ROYAL-COOK-001','jewelry_spec.material','UNKNOWN',null,'NO PROPOSAL OFFERED. The locket is the key between her and Veronica Hall and the mechanism is marked DO_NOT_INVENT. Proposing a material would start describing the thing the lock forbids describing.',true,'HELD_BY_LOCK','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-LOCKET-DIM','ER-ROYAL-COOK-001','jewelry_spec.dimensions','NO FIELD EXISTS',null,'NO PROPOSAL OFFERED. Same hold. It stays closed, and closed includes unmeasured.',true,'HELD_BY_LOCK','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-KNIFE','ER-ROYAL-COOK-001','favorite_knife','CLAIMED_NOT_RECORDED: OBJ-INES-FAVORITE-KNIFE-001 appears in the THY-WORK-CASTLE-DIMENSIONAL-TWIN-572 evidence but thylora_castle_object_state_registry holds zero rows and thylora_object_maker_provenance holds only the open OBJCAT-KNIVES category.','Write the object row under KIT-EQ-CLASS-KNIFE with maker OPEN, custodian ER-ROYAL-COOK-001, brown handle as the only described feature.','The knife was locked to her at 573 but the lock has no row behind it. This is a real continuity gap, not a missing detail.',false,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-PAY','ER-ROYAL-COOK-001','pay','OPEN_AMOUNT on PAYL-CASTLE-001-HH-1700-COOK','See CAL-WAGE-BAND-COOK. Band position proposed; no rate proposed.','No REE rate can be written while REE has no smallest unit.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-SCHEDULE','ER-ROYAL-COOK-001','schedule','CANON: SCHED-HH-1700-KITCHEN, KIT-S-DAY held by HH-1700-COOK',null,'No proposal. Already canon.',false,'NO_DECISION_NEEDED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-RELIEF','ER-ROYAL-COOK-001','relief','PARTIAL: HH-1700-DEPUTY-COOK relieves her during DAY service. A full relief day does not exist.','See REL-INES-001 — one full relief day in seven service-cycle days.','Extends a documented relief mechanism instead of inventing a new one.',false,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-QUARTERS','ER-ROYAL-COOK-001','quarters','UNKNOWN. No senior staff quarters space exists; castle geometry holds two rows, castle and kitchen.','Three models: RES-INES-A castle apartment, RES-INES-B estate cottage (ERH-CLASS-STAFF already exists and is unclaimed), RES-INES-C town residence.','Not canonized. The choice changes her wage, her commute and the recall rule at once.',false,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-TENURE','ER-ROYAL-COOK-001','role_tenure_start / role_tenure_state','UNKNOWN','Do not fix a date. Fix a relation: she has held HH-1700-COOK long enough that the kitchen notices when she stops moving, and the face description reads thirty years of the work.','The lock sheet already implies long tenure in prose. Converting that to a year would invent a date the world cannot yet carry — the native calendar is not locked.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575'),
 ('PWS-P-HERB','ER-ROYAL-COOK-001','craft_experience_start / craft_experience_state','UNKNOWN','Record the authority, not the years: canon already gives the Royal Cook, not the Provisioner, control of the daily herb cut at LAND-HERB-KITCHEN-001 under EST-PO-PROC-HERB-REQ.','That control is the real evidence of herb experience and it is already in the backend. A number of years would be decoration on top of it.',true,'CHAIRMAN_DECISION_REQUIRED','THY-Q-20260921-INES-LIFE-ECONOMY-575')
on conflict (proposal_code) do nothing;

-- ---------------------------------------------------------------
-- 10. PAYROLL / WARDROBE ACCOUNT CONNECTION
-- ---------------------------------------------------------------
insert into public.thylora_castle_economy_accounts
 (account_code, estate_code, account_name, account_class, institution_code, instrument_code,
  funding_source, controlling_role, estate_function, balance_state, evidence_state, open_fields, world_layer)
values
 ('CAS-ACC-WARDROBE','ER-CASTLE-ROYAL-001','Staff clothing, footwear and household linen','EXPENDITURE',
  'INST-ROYAL-TREASURY-001','REE','Transfer from the household general purse',
  'HH-1700-STEWARD',null,'OPEN_NO_CANON_BALANCE','STRUCTURE_DEFINED_NO_TRANSACTIONS',
  array['allowance rule','replacement cadence','which garments the household buys and which the wearer buys','cloth supplier identity','dressmaker identity','shoemaker identity'],
  'EDEREAIRAH_CANON')
on conflict (account_code) do nothing;

insert into public.thylora_castle_economy_flows
 (flow_code, flow_order, direction, payer_account, payee_kind, payee_code, payee_label, category,
  estate_function, cadence, instrument_code, amount_state, evidence_state, note, open_fields)
values
 ('CAS-FLOW-300',300,'OUT','CAS-ACC-WARDROBE','BUSINESS','WRD-SLOT-CLOTH-MERCHANT','Cloth, thread and fasteners — supplier identity OPEN','Cloth and haberdashery',
  null,'OPEN','REE','OPEN_NO_CANON_RATE','MODELLED_NOT_TRANSACTED',
  'The first line of DRESS_COST. Settles through CAS-ACC-SUPPLIER-SETTLEMENT like every other merchant invoice.',
  array['supplier identity','price','purchase cycle']),
 ('CAS-FLOW-302',302,'OUT','CAS-ACC-WARDROBE','WORKSHOP','WRD-SLOT-SEAMSTRESS','Cutting, sewing and fitting — workshop identity OPEN','Garment making',
  null,'Per garment','REE','OPEN_NO_CANON_RATE','MODELLED_NOT_TRANSACTED',
  'The labour lines of DRESS_COST. Maker-provenance rule applies: a garment has a maker, and that maker is not invented.',
  array['workshop identity','making time','price']),
 ('CAS-FLOW-304',304,'OUT','CAS-ACC-WARDROBE','WORKSHOP','WRD-SLOT-MENDER','Garment repair — workshop identity OPEN','Garment repair',
  null,'OPEN','REE','OPEN_NO_CANON_RATE','MODELLED_NOT_TRANSACTED',
  'Repair is a recurring cost, not a one-off. What she mends herself on a relief day never reaches this account.',
  array['workshop identity','repair cadence','price']),
 ('CAS-FLOW-306',306,'OUT','CAS-ACC-WARDROBE','WORKSHOP','WRD-SLOT-SHOEMAKER','Shoes and resoling — workshop identity OPEN','Footwear',
  null,'OPEN','REE','OPEN_NO_CANON_RATE','MODELLED_NOT_TRANSACTED',
  'Shoes and resoling. The kitchen floor is what drives this line, which is why it belongs to the household and not only to her.',
  array['workshop identity','resole cadence','who pays — household or wearer','price'])
on conflict (flow_code) do nothing;

-- Head Cook payroll line: record the wardrobe and relief dependencies without touching the rate.
update public.thylora_castle_economy_flows
   set open_fields = array['wage band','pay period','payment day','any allowance in kind such as board or lodging','wardrobe allowance — see CAS-ACC-WARDROBE','relief-day treatment — see REL-INES-001'],
       updated_at  = now()
 where flow_code = 'CAS-FLOW-100'
   and 'wage band' = any(open_fields);

-- ---------------------------------------------------------------
-- 11. HOUSEHOLD ROLE SLOT — wardrobe keeper (no person named)
-- ---------------------------------------------------------------
insert into public.household_role_registry
 (role_code, role_name, domain, time_region, duties, backup_role_codes, residence_scope,
  story_eligible, state, primary_person_id)
select 'HH-1700-WARDROBE-KEEPER','Wardrobe & Linen Keeper','HOUSEHOLD','1700s',
  '["staff clothing stock","issue and record of garments","replacement cadence","household linen","routing garments to and from the mender"]'::jsonb,
  '["HH-1700-STEWARD"]'::jsonb,'TRAVELING_AND_PERMANENT',true,'OPEN_NO_PERSON',null
where not exists (select 1 from public.household_role_registry where role_code='HH-1700-WARDROBE-KEEPER');

commit;
