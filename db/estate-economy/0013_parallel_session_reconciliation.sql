-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- A second session worked sequence 533 concurrently under source_query_id
-- THY-Q-20260919-IMPLEMENT-ESTATE-ECONOMY-533 and wrote into the tables this run
-- created. Both sets are real work. Nothing is deleted.
--
-- Rule applied: where BOTH sessions wrote a pure definition row for the same thing,
-- THIS session supersedes ITS OWN row in favour of the other session's instance-coded
-- row. The other session's rows are never modified. Where the two rows are genuinely
-- different layers (a class spine versus an instance slot), both are kept and linked.

create table if not exists public.thylora_estate_parallel_reconciliation (
  reconciliation_code   text primary key,
  table_name            text not null,
  this_session_key      text not null,
  other_session_key     text,
  relationship          text not null,   -- SUPERSEDED_BY_OTHER | CLASS_TO_INSTANCE | NO_COUNTERPART
  survivor_key          text not null,
  reason                text not null,
  this_session_query_id text not null default 'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533',
  other_session_query_id text not null default 'THY-Q-20260919-IMPLEMENT-ESTATE-ECONOMY-533',
  created_at            timestamptz not null default now()
);

alter table public.thylora_estate_parallel_reconciliation enable row level security;
drop policy if exists chairman_read_thylora_estate_parallel_reconciliation
  on public.thylora_estate_parallel_reconciliation;
create policy chairman_read_thylora_estate_parallel_reconciliation
  on public.thylora_estate_parallel_reconciliation
  for select to authenticated using (public.thylora_is_chairman());

insert into public.thylora_estate_parallel_reconciliation
  (reconciliation_code, table_name, this_session_key, other_session_key, relationship, survivor_key, reason)
values
 ('REC-INSP-HOUSING','thylora_estate_inspections','INSP-DEF-HOUSING','INSP-HOUSING-001','SUPERSEDED_BY_OTHER','INSP-HOUSING-001','Both sessions wrote a housing-condition inspection definition. The other session row survives as the operating row.'),
 ('REC-INSP-WELL','thylora_estate_inspections','INSP-DEF-WELL','INSP-WELL-WATER-001','SUPERSEDED_BY_OTHER','INSP-WELL-WATER-001','Duplicate well/water inspection definition.'),
 ('REC-INSP-SANITATION','thylora_estate_inspections','INSP-DEF-SANITATION','INSP-SANITATION-001','SUPERSEDED_BY_OTHER','INSP-SANITATION-001','Duplicate sanitation inspection definition.'),
 ('REC-INSP-ROAD','thylora_estate_inspections','INSP-DEF-ROAD','INSP-ROAD-001','SUPERSEDED_BY_OTHER','INSP-ROAD-001','Duplicate road-maintenance inspection definition.'),
 ('REC-INSP-GENERAL','thylora_estate_inspections','INSP-DEF-GENERAL','INSP-ESTATE-GENERAL-001','SUPERSEDED_BY_OTHER','INSP-ESTATE-GENERAL-001','Duplicate general estate inspection definition.'),
 ('REC-INSP-WELFARE','thylora_estate_inspections','INSP-DEF-WELFARE','INSP-WELFARE-001','SUPERSEDED_BY_OTHER','INSP-WELFARE-001','Duplicate resident-welfare inspection definition.'),
 ('REC-INSP-STORES','thylora_estate_inspections','INSP-DEF-STORES','INSP-STORES-001','SUPERSEDED_BY_OTHER','INSP-STORES-001','Duplicate stores-inventory inspection definition.'),
 ('REC-INSP-FIRE','thylora_estate_inspections','INSP-DEF-FIRE','INSP-FIRE-001','SUPERSEDED_BY_OTHER','INSP-FIRE-001','Duplicate fire-safety inspection definition.'),
 ('REC-INC-THEFT','thylora_estate_incidents','INC-DEF-THEFT','INC-PROC-THEFT-001','SUPERSEDED_BY_OTHER','INC-PROC-THEFT-001','Duplicate theft response procedure.'),
 ('REC-INC-ROBBERY','thylora_estate_incidents','INC-DEF-ROBBERY','INC-PROC-ROBBERY-001','SUPERSEDED_BY_OTHER','INC-PROC-ROBBERY-001','Duplicate robbery / road-attack response procedure.'),
 ('REC-INC-FIRE','thylora_estate_incidents','INC-DEF-FIRE','INC-PROC-FIRE-001','SUPERSEDED_BY_OTHER','INC-PROC-FIRE-001','Duplicate fire response procedure.'),
 ('REC-INC-MEDICAL','thylora_estate_incidents','INC-DEF-MEDICAL','INC-PROC-MEDICAL-001','SUPERSEDED_BY_OTHER','INC-PROC-MEDICAL-001','Duplicate medical response procedure.'),
 ('REC-INC-INTRUSION','thylora_estate_incidents','INC-DEF-INTRUSION','INC-PROC-INTRUSION-001','SUPERSEDED_BY_OTHER','INC-PROC-INTRUSION-001','Duplicate intrusion response procedure.'),
 ('REC-INC-STRUCTURAL','thylora_estate_incidents','INC-DEF-STRUCTURAL','INC-PROC-STRUCTURAL-001','SUPERSEDED_BY_OTHER','INC-PROC-STRUCTURAL-001','Duplicate structural-failure response procedure.'),
 ('REC-INC-ANIMAL','thylora_estate_incidents','INC-DEF-ANIMAL-LOSS','INC-PROC-ANIMAL-LOSS-001','SUPERSEDED_BY_OTHER','INC-PROC-ANIMAL-LOSS-001','Duplicate animal-loss response procedure.'),
 ('REC-INC-OTHER','thylora_estate_incidents','INC-DEF-OTHER','INC-PROC-EMERGENCY-GENERAL-001','SUPERSEDED_BY_OTHER','INC-PROC-EMERGENCY-GENERAL-001','Duplicate general emergency response procedure.'),
 ('REC-WO-MASONRY','thylora_estate_work_orders','WO-CLASS-MASONRY','WO-CLASS-FABRIC-001','SUPERSEDED_BY_OTHER','WO-CLASS-FABRIC-001','Masonry and carpentry are covered by the other session single castle-fabric class.'),
 ('REC-WO-CARPENTRY','thylora_estate_work_orders','WO-CLASS-CARPENTRY','WO-CLASS-FABRIC-001','SUPERSEDED_BY_OTHER','WO-CLASS-FABRIC-001','Covered by the castle-fabric class.'),
 ('REC-WO-ROOFING','thylora_estate_work_orders','WO-CLASS-ROOFING','WO-CLASS-FABRIC-001','SUPERSEDED_BY_OTHER','WO-CLASS-FABRIC-001','Covered by the castle-fabric class.'),
 ('REC-WO-GLAZING','thylora_estate_work_orders','WO-CLASS-GLAZING','WO-CLASS-FABRIC-001','SUPERSEDED_BY_OTHER','WO-CLASS-FABRIC-001','Covered by the castle-fabric class.'),
 ('REC-WO-SMITH','thylora_estate_work_orders','WO-CLASS-SMITH','WO-CLASS-COOKWARE-001','SUPERSEDED_BY_OTHER','WO-CLASS-COOKWARE-001','Smith work on kitchen metal is covered by the other session cookware and cutlery class.'),
 ('REC-WO-WATER','thylora_estate_work_orders','WO-CLASS-WATER','WO-CLASS-WATER-001','SUPERSEDED_BY_OTHER','WO-CLASS-WATER-001','Duplicate well and water work class.'),
 ('REC-WO-ROAD','thylora_estate_work_orders','WO-CLASS-ROAD','WO-CLASS-ROAD-001','SUPERSEDED_BY_OTHER','WO-CLASS-ROAD-001','Duplicate road work class.'),
 ('REC-TEN-FARM','thylora_estate_tenancies','THT-CLASS-FARM','HOLD-ARABLE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot are different layers. The class spine is load-bearing for economy flow EFL-02-TENANT-RENT; the instance slot is the holding a tenant would actually hold.'),
 ('REC-TEN-COTTAGE','thylora_estate_tenancies','THT-CLASS-COTTAGE','HOLD-COTTAGE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-TEN-GARDEN','thylora_estate_tenancies','THT-CLASS-GARDEN-PLOT','HOLD-MARKET-GARDEN-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-TEN-WORKSHOP','thylora_estate_tenancies','THT-CLASS-WORKSHOP','HOLD-WORKSHOP-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-TEN-PASTURE','thylora_estate_tenancies','THT-CLASS-PASTURE','HOLD-PASTURE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-TEN-MILL','thylora_estate_tenancies','THT-CLASS-MILL',null,'NO_COUNTERPART','THT-CLASS-MILL','Only this session opened a mill holding class. Whether a mill exists is OPEN.'),
 ('REC-LAND-HERB','thylora_estate_land_units','LAND-HERB-KITCHEN-001','LU-HERB-GARDEN-001','CLASS_TO_INSTANCE','BOTH','Both describe the kitchen herb ground. This session row is load-bearing for economy flow EFL-06-ESTATE-GROWN and for the herb store KIT-ST-HERB; both are blocked on the same open plant name.'),
 ('REC-LAND-FARM','thylora_estate_land_units','LAND-CLASS-FARM','LU-FARM-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-LAND-VEG','thylora_estate_land_units','LAND-CLASS-VEGETABLE','LU-MARKET-GARDEN-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot. The other session also holds LU-KITCHEN-GARDEN-001 for household-facing vegetable ground.'),
 ('REC-LAND-PASTURE','thylora_estate_land_units','LAND-CLASS-PASTURE','LU-PASTURE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-LAND-ORCHARD','thylora_estate_land_units','LAND-CLASS-ORCHARD',null,'NO_COUNTERPART','LAND-CLASS-ORCHARD','Only this session opened an orchard class. Whether an orchard exists is OPEN.'),
 ('REC-LAND-WOODLAND','thylora_estate_land_units','LAND-CLASS-WOODLAND',null,'NO_COUNTERPART','LAND-CLASS-WOODLAND','Only this session opened a woodland class. Whether woodland is held is OPEN.'),
 ('REC-LAND-FISHPOND','thylora_estate_land_units','LAND-CLASS-FISHPOND',null,'NO_COUNTERPART','LAND-CLASS-FISHPOND','Only this session opened a fishpond class. Whether a fishpond exists is OPEN.'),
 ('REC-ANIMAL-DRAUGHT','thylora_estate_animal_groups','ANIMAL-HORSE-001','AG-DRAUGHT-001','CLASS_TO_INSTANCE','BOTH','Both cover draught horses. This session row is load-bearing for economy flow EFL-07-ANIMAL-COSTS.'),
 ('REC-ANIMAL-RIDING','thylora_estate_animal_groups','ANIMAL-HORSE-RIDING-001','AG-RIDING-HORSE-001','CLASS_TO_INSTANCE','BOTH','Both cover riding and carriage horses.'),
 ('REC-ANIMAL-CATTLE','thylora_estate_animal_groups','ANIMAL-CLASS-CATTLE','AG-CATTLE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-ANIMAL-SHEEP','thylora_estate_animal_groups','ANIMAL-CLASS-SHEEP','AG-SHEEP-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-ANIMAL-PIG','thylora_estate_animal_groups','ANIMAL-CLASS-PIG','AG-SWINE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot. The kitchen waste route KIT-W-FEED points at this session row.'),
 ('REC-ANIMAL-POULTRY','thylora_estate_animal_groups','ANIMAL-CLASS-POULTRY','AG-POULTRY-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-ANIMAL-DOG','thylora_estate_animal_groups','ANIMAL-CLASS-WORKING-DOG',null,'NO_COUNTERPART','ANIMAL-CLASS-WORKING-DOG','Only this session opened a working-dog class. Whether dogs are kept is OPEN.'),
 ('REC-HH-TENANT','thylora_estate_resident_households','ERH-CLASS-TENANT','RH-ARABLE-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-HH-STAFF','thylora_estate_resident_households','ERH-CLASS-STAFF','RH-RESIDENT-STAFF-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-HH-CRAFT','thylora_estate_resident_households','ERH-CLASS-CRAFT','RH-WORKSHOP-001','CLASS_TO_INSTANCE','BOTH','Class spine and instance slot.'),
 ('REC-HH-GUARD','thylora_estate_resident_households','ERH-CLASS-GUARD',null,'NO_COUNTERPART','ERH-CLASS-GUARD','Only this session opened a guard-family household class.'),
 ('REC-ACCT-SET','thylora_estate_accounts','EST-ACCT-* (16 accounts)','EST-ACC-* (5 accounts)','CLASS_TO_INSTANCE','BOTH','The EST-ACCT-* set is load-bearing: all 15 traced economy flows post into it. The other session EST-ACC-* set adds rent roll, produce in kind, animal husbandry, land maintenance and resident welfare. Both are kept; a single chart of accounts is a Chairman decision.'),
 ('REC-LANE-OVERWRITE','thylora_control_lane_registry','CASTLE, ROYAL_KITCHEN, ROSEMARY, MAKERS, ROYAL_COLLECTION, PEOPLE_IN_TIME, HISTORY_EVIDENCE, FOOTBALL, ECONOMY, BANKING, MARKETS, HISTORICAL_MEDICINE, VEHICLES','same lane codes','SUPERSEDED_BY_OTHER','this session text','The other session created these lanes first. This session upsert at 15:50 replaced their NOW/NEXT/BLOCKED/OUTPUT/DONE WHEN text. The prior text is not recoverable: thylora_continuity_audit_shadow does not cover thylora_control_lane_registry. The current text is accurate against the live backend, but it is this session wording and it displaced theirs.'),
 ('REC-LANE-PRESERVED','thylora_control_lane_registry','none','ALISTAIR_FAMILY, SUPERCAR, FAMILY_PORTRAIT, GRANDMOTHER_PORTRAIT, EDEREAIRAH_NAME_LOCK','NO_COUNTERPART','other session lanes','Five lanes created only by the other session were left untouched by this run, as required by the do-not-drop rule.')
on conflict (reconciliation_code) do nothing;

-- Mark THIS session's superseded rows. The rows are preserved, never deleted,
-- and the other session's rows are not modified.
update public.thylora_estate_inspections i
set state = 'SUPERSEDED_BY_PARALLEL_SESSION', updated_at = now()
from public.thylora_estate_parallel_reconciliation r
where r.table_name = 'thylora_estate_inspections'
  and r.relationship = 'SUPERSEDED_BY_OTHER'
  and i.inspection_code = r.this_session_key;

update public.thylora_estate_incidents c
set state = 'SUPERSEDED_BY_PARALLEL_SESSION', updated_at = now()
from public.thylora_estate_parallel_reconciliation r
where r.table_name = 'thylora_estate_incidents'
  and r.relationship = 'SUPERSEDED_BY_OTHER'
  and c.incident_code = r.this_session_key;

update public.thylora_estate_work_orders w
set status = 'SUPERSEDED_BY_PARALLEL_SESSION', updated_at = now()
from public.thylora_estate_parallel_reconciliation r
where r.table_name = 'thylora_estate_work_orders'
  and r.relationship = 'SUPERSEDED_BY_OTHER'
  and w.work_order_code = r.this_session_key;
