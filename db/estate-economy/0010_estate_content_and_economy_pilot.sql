-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Tenant/estate content, the missing estate functions, and the castle economy pilot.
-- No tenant, farm, supplier or artist is named. No amount is fabricated.

-- ===========================================================================
-- A. EXTEND thylora_estate_function_registry with the functions sequence 532 did not open
-- ===========================================================================
insert into public.thylora_estate_function_registry
  (function_code, estate_code, domain, function_name, what_it_covers, known_structure, open_fields,
   responsible_role_code, time_region, state, source_query_id)
values
 ('EST-LEASE-RENT-001','ER-CASTLE-ROYAL-001','LAND','Lease and rent records',
  'The written terms a holding is held on and what is actually owed and paid.',
  jsonb_build_object('known', jsonb_build_array(
    'thylora_estate_tenancies now carries tenure form, rent form, rent period, term, succession and dispute path per holding',
    'rent settles into EST-ACCT-INCOME-RENT in the estate ledger'),
   'unknown', jsonb_build_array('the period settlement instrument','rent levels','whether rent is coin, share, labour or mixed')),
  array['rent_form','rent_level','settlement_instrument'],'HH-1700-SCRIBE','1700s',
  'STRUCTURE_IMPLEMENTED_VALUES_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-RESIDENT-HOUSEHOLDS-001','ER-CASTLE-ROYAL-001','WELFARE','Resident households',
  'Who actually lives on the estate, in which housing, under which holding.',
  jsonb_build_object('known', jsonb_build_array(
    'thylora_estate_resident_households carries household class, housing reference, condition state and welfare state',
    'welfare and housing condition are checked through thylora_estate_inspections'),
   'unknown', jsonb_build_array('household count','household heads','housing stock')),
  array['household_count','head_identities','housing_stock'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_IDENTITY_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-VEGETABLE-GROWERS-001','ER-CASTLE-ROYAL-001','LAND','Vegetable growers',
  'The worked vegetable ground that feeds the household daily, distinct from ornamental garden and from field crop.',
  jsonb_build_object('known', jsonb_build_array(
    'estate-grown food enters the kitchen as an estate requisition, not a purchase',
    'the Provisioner holds the requisition and the Head Cook holds the day list'),
   'unknown', jsonb_build_array('plot layout','grower identities','planting list','native plant names')),
  array['grower_identities','planting_list','native_plant_names','plot_layout'],'HH-1700-PROVISIONER','1700s',
  'STRUCTURE_IMPLEMENTED_IDENTITY_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-HOUSING-CONDITION-001','ER-CASTLE-ROYAL-001','WELFARE','Housing condition',
  'Whether the roofs, walls, hearths and floors residents live under are sound.',
  jsonb_build_object('known', jsonb_build_array(
    'a HOUSING_CONDITION inspection raises a maintenance work order when it finds a fault',
    'every repair is a provenance event'),
   'unknown', jsonb_build_array('inspection cycle','condition standard')),
  array['inspection_cycle','condition_standard'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_CYCLE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-WELL-WATER-001','ER-CASTLE-ROYAL-001','FACILITIES','Well and water checks',
  'Where the estate drinking and working water comes from and whether it is fit to use.',
  jsonb_build_object('known', jsonb_build_array(
    'water is carried to the kitchen at first light, so a water source and carry route exist',
    'the fire-response water source and the drinking water source are the same estate problem'),
   'unknown', jsonb_build_array('well count and position','carry route','fouling test','winter supply')),
  array['well_count','carry_route','water_fitness_test','winter_supply'],'HH-MOD-FACILITIES','1700s',
  'STRUCTURE_IMPLEMENTED_DETAIL_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-SANITATION-001','ER-CASTLE-ROYAL-001','FACILITIES','Sanitation',
  'Waste, drainage and the separation of foul from clean on a working estate.',
  jsonb_build_object('known', jsonb_build_array(
    'kitchen waste is routed by class through thylora_kitchen_waste_routes and never returns to a table once condemned',
    'ash, bone and compost have named destinations'),
   'unknown', jsonb_build_array('drainage layout','privy provision','distance rule between foul and water')),
  array['drainage_layout','privy_provision','foul_to_water_distance_rule'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_DETAIL_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ROAD-MAINTENANCE-001','ER-CASTLE-ROYAL-001','FACILITIES','Road maintenance',
  'Keeping the approach road and estate roads passable for a loaded cart.',
  jsonb_build_object('known', jsonb_build_array(
    'the castle is provisioned by cart along a working road, so the road is an operating dependency and not scenery',
    'a ROAD_MAINTENANCE inspection raises a work order with trade_class ROAD'),
   'unknown', jsonb_build_array('who owes road labour','repair season','surface and drainage method')),
  array['road_labour_obligation','repair_season','surface_method'],null,'1700s',
  'STRUCTURE_IMPLEMENTED_DETAIL_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ESTATE-INSPECTIONS-001','ER-CASTLE-ROYAL-001','RECORDS','Estate inspections',
  'The single inspection spine covering housing, water, sanitation, roads, stores, fire safety, general estate and resident welfare.',
  jsonb_build_object('known', jsonb_build_array(
    'thylora_estate_inspections carries eight inspection types and links each finding to a work order',
    'escalation path is a required field on every inspection'),
   'unknown', jsonb_build_array('cycle per type','who inspects','record form')),
  array['cycle_per_type','inspector_roles','record_form'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_CYCLE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-WORK-ORDERS-001','ER-CASTLE-ROYAL-001','FACILITIES','Maintenance work orders',
  'The instruction that turns a finding into a repair, and the record that turns a repair into provenance.',
  jsonb_build_object('known', jsonb_build_array(
    'a work order may be raised from an inspection, an incident, a routine cycle or a request',
    'provenance_event_required defaults true, so no repair is silent'),
   'unknown', jsonb_build_array('which trades are resident','repair authority threshold','cost')),
  array['resident_trades','repair_authority_threshold','cost'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_VALUES_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-INCIDENT-RECORDS-001','ER-CASTLE-ROYAL-001','SECURITY','Incident records',
  'One record spine for theft, robbery, fire, medical, intrusion, road attack and other emergency, in both the estate and security domains.',
  jsonb_build_object('known', jsonb_build_array(
    'thylora_estate_incidents carries domain, type, post, alarm method, first responder, muster rule and response sequence',
    'signals escalate voice challenge to horn to alarm bell; the runner carries anything touching the family range'),
   'unknown', jsonb_build_array('muster time','call-out authority','loss procedure','penalty rule')),
  array['muster_time','call_out_authority','loss_procedure','penalty_rule'],'HH-1700-CAPTAIN','1700s',
  'STRUCTURE_IMPLEMENTED_RULES_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-WAREHOUSING-001','ER-CASTLE-ROYAL-001','SUPPLY','Warehousing',
  'Bulk goods held between the receiving yard and the point of use.',
  jsonb_build_object('known', jsonb_build_array(
    'SEC-Z-WAREHOUSES is a distinct security layer with key custody held separately from the round'),
   'unknown', jsonb_build_array('warehouse count','capacity','stock rotation rule')),
  array['warehouse_count','capacity','rotation_rule'],'HH-1700-STEWARD','1700s',
  'STRUCTURE_IMPLEMENTED_DETAIL_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-DELIVERY-ROUTES-001','ER-CASTLE-ROYAL-001','SUPPLY','Delivery routes',
  'The route a cart follows from supplier or farm to the receiving yard.',
  jsonb_build_object('known', jsonb_build_array(
    'arrival is by cart on the approach road through the main gate',
    'SEC-Z-DELIVERY and SEC-P-DELIVERY-ESCORT cover the movement, at a minimum of two on escort'),
   'unknown', jsonb_build_array('escort threshold','halt points','night movement rule')),
  array['escort_threshold','halt_points','night_movement_rule'],'HH-1700-CAPTAIN','1700s',
  'STRUCTURE_IMPLEMENTED_RULES_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (function_code) do nothing;

update public.thylora_kitchen_waste_routes set sanitation_link = 'EST-SANITATION-001'
where sanitation_link = 'EST-SANITATION';

-- ===========================================================================
-- B. TENANT HOLDINGS - class spines with OPEN identity, following the
--    ROYCOL-CLASS-* convention already used by the royal collection registry.
-- ===========================================================================
insert into public.thylora_estate_tenancies
  (holding_code, holding_type, holding_name, responsible_role_code, open_fields, source_query_id)
values
 ('THT-CLASS-FARM','FARM','Farm holding (class spine)','HH-1700-SCRIBE',
  array['tenant_identity','holding_count','acreage','tenure_form','rent_form','rent_level','term_length','succession','dispute_path'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('THT-CLASS-COTTAGE','COTTAGE','Cottage holding (class spine)','HH-1700-STEWARD',
  array['tenant_identity','holding_count','tenure_form','rent_form','term_length','succession'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('THT-CLASS-GARDEN-PLOT','GARDEN_PLOT','Garden plot holding (class spine)','HH-1700-PROVISIONER',
  array['tenant_identity','plot_count','rent_form','produce_share_rule'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('THT-CLASS-WORKSHOP','WORKSHOP','Workshop holding (class spine)','HH-1700-STEWARD',
  array['tenant_identity','maker_slot_link','rent_form','tool_custody'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('THT-CLASS-PASTURE','PASTURE','Pasture holding (class spine)','HH-1700-STABLE',
  array['tenant_identity','grazing_right','stint_rule','rent_form'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('THT-CLASS-MILL','MILL','Mill holding (class spine)','HH-1700-SCRIBE',
  array['tenant_identity','whether_a_mill_exists','multure_rule','rent_form'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (holding_code) do nothing;

insert into public.thylora_estate_resident_households
  (resident_household_code, holding_code, household_class, open_fields, source_query_id)
values
 ('ERH-CLASS-TENANT','THT-CLASS-FARM','TENANT_FAMILY',
  array['head_identity','household_size','housing_unit'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ERH-CLASS-STAFF','THT-CLASS-COTTAGE','ESTATE_STAFF',
  array['head_identity','household_size','housing_unit'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ERH-CLASS-GUARD','THT-CLASS-COTTAGE','GUARD_FAMILY',
  array['head_identity','household_size','housing_unit'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ERH-CLASS-CRAFT','THT-CLASS-WORKSHOP','CRAFT_FAMILY',
  array['head_identity','household_size','housing_unit','maker_slot_link'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (resident_household_code) do nothing;

-- ===========================================================================
-- C. LAND UNITS - the herb ground is real canon; the rest are class spines
-- ===========================================================================
insert into public.thylora_estate_land_units
  (land_unit_code, unit_type, unit_name, worked_by_holding_code, worked_by_role_code,
   produce_classes, supplies_function_code, distance_from_castle, state, open_fields, source_query_id)
values
 ('LAND-HERB-KITCHEN-001','HERB_GARDEN','Kitchen herb ground',null,'HH-1700-COOK',
  array['CULINARY_HERB'],'EST-HERB-GARDEN-001','Short same-day walk from the kitchen',
  'CANON_ANCHORED_DETAIL_OPEN',
  array['native_plant_names','rosemary_mirror_plant_name','bed_layout','winter_supply_rule'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-FARM','FARM','Field farm (class spine)','THT-CLASS-FARM',null,
  array['GRAIN','FODDER'],'EST-FARMS-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['farm_names','farm_count','crop_list','yield_measure'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-VEGETABLE','VEGETABLE_GROUND','Vegetable ground (class spine)','THT-CLASS-GARDEN-PLOT','HH-1700-PROVISIONER',
  array['VEGETABLE'],'EST-VEGETABLE-GROWERS-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['grower_identities','planting_list','native_plant_names'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-ORCHARD','ORCHARD','Orchard (class spine)',null,null,
  array['FRUIT'],'EST-GARDENS-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['whether_an_orchard_exists','species','native_plant_names'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-PASTURE','PASTURE','Pasture (class spine)','THT-CLASS-PASTURE','HH-1700-STABLE',
  array['GRAZING','HAY'],'EST-ANIMAL-CARE-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['stint_rule','acreage'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-WOODLAND','WOODLAND','Woodland (class spine)',null,null,
  array['FUEL','TIMBER'],'EST-MAINTENANCE-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['whether_woodland_is_held','fuel_right','coppice_cycle'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('LAND-CLASS-FISHPOND','FISHPOND','Fishpond (class spine)',null,null,
  array['FISH'],'EST-PROVISIONING-001','OPEN','STRUCTURE_OPEN_DETAIL',
  array['whether_a_fishpond_exists'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (land_unit_code) do nothing;

-- ===========================================================================
-- D. ANIMAL CARE - horses are canon; the rest are class spines
-- ===========================================================================
insert into public.thylora_estate_animal_groups
  (animal_group_code, species_class, purpose, housed_at, responsible_role_code,
   feed_source_unit_code, state, open_fields, source_query_id)
values
 ('ANIMAL-HORSE-001','HORSE','DRAUGHT','SEC-Z-STABLES','HH-1700-STABLE','LAND-CLASS-PASTURE',
  'CANON_ANCHORED_DETAIL_OPEN',
  array['stable_count','headcount','farrier_provision','feed_chain','animal_retirement_rule'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-HORSE-RIDING-001','HORSE','RIDING','SEC-Z-STABLES','HH-1700-STABLE','LAND-CLASS-PASTURE',
  'CANON_ANCHORED_DETAIL_OPEN',
  array['headcount','remount_standard','escort_mount_allocation'],
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-CLASS-CATTLE','CATTLE','DAIRY','OPEN','HH-1700-STABLE','LAND-CLASS-PASTURE',
  'STRUCTURE_OPEN_DETAIL',array['whether_cattle_are_kept','headcount','dairy_route'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-CLASS-SHEEP','SHEEP','WOOL','OPEN','HH-1700-STABLE','LAND-CLASS-PASTURE',
  'STRUCTURE_OPEN_DETAIL',array['whether_sheep_are_kept','headcount','wool_route'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-CLASS-PIG','PIG','MEAT','OPEN','HH-1700-STABLE',null,
  'STRUCTURE_OPEN_DETAIL',array['whether_pigs_are_kept','headcount'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-CLASS-POULTRY','POULTRY','EGGS','OPEN','HH-1700-PROVISIONER',null,
  'STRUCTURE_OPEN_DETAIL',array['whether_poultry_are_kept','headcount'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('ANIMAL-CLASS-WORKING-DOG','WORKING_DOG','GUARD','OPEN','HH-1700-CAPTAIN',null,
  'STRUCTURE_OPEN_DETAIL',array['whether_dogs_are_kept','post_assignment'],'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (animal_group_code) do nothing;

-- ===========================================================================
-- E. INSPECTIONS - one standing definition per type, no fabricated findings
-- ===========================================================================
insert into public.thylora_estate_inspections
  (inspection_code, inspection_type, subject_reference, inspector_role_code, escalation_path,
   function_code, state, source_query_id)
values
 ('INSP-DEF-HOUSING','HOUSING_CONDITION','ERH-CLASS-TENANT','HH-1700-STEWARD',
  'Fault raises a work order with trade_class matching the fault; a fault that makes housing unfit escalates to the Chief Steward the same day.',
  'EST-HOUSING-CONDITION-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-WELL','WELL_WATER','EST-WELL-WATER-001','HH-MOD-FACILITIES',
  'Fouled or failing water escalates immediately: the kitchen cannot open its first-light segment without water.',
  'EST-WELL-WATER-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-SANITATION','SANITATION','EST-SANITATION-001','HH-1700-STEWARD',
  'Any finding that puts foul near water or near stores escalates ahead of routine repair.',
  'EST-SANITATION-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-ROAD','ROAD_MAINTENANCE','SEC-Z-ROADS',null,
  'A road that will not carry a loaded cart stops provisioning, so it escalates as a supply failure and not only as a repair.',
  'EST-ROAD-MAINTENANCE-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-GENERAL','ESTATE_GENERAL','ER-CASTLE-ROYAL-001','HH-1700-STEWARD',
  'Findings are routed to the responsible function owner named in thylora_estate_function_registry.',
  'EST-ESTATE-INSPECTIONS-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-WELFARE','RESIDENT_WELFARE','ERH-CLASS-TENANT','HH-1700-STEWARD',
  'A resident who is not housed, fed or fit to work escalates to the Chief Steward, who holds staff continuity.',
  'EST-WELFARE-INSPECTION-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-STORES','STORES_INVENTORY','KIT-ST-PANTRY','HH-1700-STEWARD',
  'A shortfall between tally and count is treated as a possible loss and opens an incident, not only a stores correction.',
  'EST-ANTI-THEFT-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INSP-DEF-FIRE','FIRE_SAFETY','SEC-Z-KITCHENS','HH-1700-COOK',
  'The banked fire is a permanent standing risk, so a fire-safety finding escalates to the Captain of the Guard as well as the Head Cook.',
  'EST-FIRE-RESPONSE-001','DEFINITION_STANDING_NO_RUN_YET','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (inspection_code) do nothing;

-- ===========================================================================
-- F. INCIDENT RESPONSE DEFINITIONS - the standing answer, not a fabricated event
-- ===========================================================================
insert into public.thylora_estate_incidents
  (incident_code, domain, incident_type, post_code, alarm_method, first_responder_role,
   response_sequence, function_code, state, source_query_id)
values
 ('INC-DEF-THEFT','ESTATE','THEFT','SEC-P-STORES','SIG-WRITTEN-PASS','HH-1700-STEWARD',
  jsonb_build_array('stores count against tally','secure the store and hold the keys','report to the Chief Steward','Captain informed if the loss crossed a guarded line','loss procedure OPEN'),
  'EST-ANTI-THEFT-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-ROBBERY','SECURITY','ROBBERY','SEC-P-ROAD-PATROL','SIG-HORN','HH-1700-CAPTAIN',
  jsonb_build_array('patrol horn','nearest post holds position','reserve mustered by alarm bell','escort recovered or pursued - pursuit authority OPEN'),
  'EST-ROAD-PATROL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-FIRE','ESTATE','FIRE','SEC-P-KITCHEN-FIRE','SIG-BELL-ALARM','HH-1700-SCULLERY',
  jsonb_build_array('the hand on the fire raises the alarm bell','kitchen hands smother or draw the fire','water carried from the estate water source - source and carry route OPEN','reserve mustered','Captain and Chief Steward informed'),
  'EST-FIRE-RESPONSE-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-MEDICAL','ESTATE','MEDICAL',null,'SIG-RUNNER',null,
  jsonb_build_array('injury sources this estate actually has are the kitchen, the stable, the road and building works','runner sent rather than general alarm','who holds medical duty is OPEN','where care is given is OPEN','when outside help is called is OPEN'),
  'EST-MEDICAL-001','DEFINITION_STANDING_RESPONDER_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-INTRUSION','SECURITY','INTRUSION','SEC-P-WALL-WALK','SIG-HORN','HH-1700-CAPTAIN',
  jsonb_build_array('wall or tower horn','gate closes','reserve mustered by alarm bell','inner layers hold rather than move outward','family range is reached by runner only'),
  'EST-GUARD-ROTATION-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-STRUCTURAL','ESTATE','STRUCTURAL_FAILURE',null,'SIG-RUNNER','HH-1700-STEWARD',
  jsonb_build_array('area cleared','work order raised with provenance_event_required true','repair authority OPEN'),
  'EST-MAINTENANCE-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-ANIMAL-LOSS','ESTATE','ANIMAL_LOSS','SEC-P-STABLES','SIG-BELL-ALARM','HH-1700-STABLE',
  jsonb_build_array('stable count','tack checked','Captain informed because remount readiness is a security dependency'),
  'EST-ANIMAL-CARE-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('INC-DEF-OTHER','ESTATE','OTHER_EMERGENCY',null,'SIG-BELL-ALARM','HH-1700-CAPTAIN',
  jsonb_build_array('alarm bell musters the reserve','Chief Steward holds household coordination','Captain holds movement and posts'),
  'EST-MEDICAL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (incident_code) do nothing;

-- ===========================================================================
-- G. WORK ORDER CLASSES
-- ===========================================================================
insert into public.thylora_estate_work_orders
  (work_order_code, raised_from, raised_from_reference, trade_class, subject_reference, status, source_query_id)
values
 ('WO-CLASS-MASONRY','ROUTINE_CYCLE','INSP-DEF-HOUSING','MASONRY','ER-CASTLE-ROYAL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-CARPENTRY','ROUTINE_CYCLE','INSP-DEF-HOUSING','CARPENTRY','ER-CASTLE-ROYAL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-ROOFING','ROUTINE_CYCLE','INSP-DEF-HOUSING','ROOFING','ER-CASTLE-ROYAL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-SMITH','ROUTINE_CYCLE','KIT-EQ-CLASS-CAULDRON','SMITH','THY-CASTLE-ROYAL-KITCHEN-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-GLAZING','ROUTINE_CYCLE','INSP-DEF-HOUSING','GLAZING','ER-CASTLE-ROYAL-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-WATER','INSPECTION','INSP-DEF-WELL','WATER','EST-WELL-WATER-001','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('WO-CLASS-ROAD','INSPECTION','INSP-DEF-ROAD','ROAD','SEC-Z-ROADS','DEFINITION_STANDING','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (work_order_code) do nothing;

-- ===========================================================================
-- H. ESTATE ACCOUNTS
-- ===========================================================================
insert into public.thylora_estate_accounts
  (estate_account_code, account_name, account_class, custodian_role_code, source_query_id)
values
 ('EST-ACCT-TREASURY','Estate treasury','HOLDING','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-FUNDING','Estate funding received','INCOME','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-INCOME-RENT','Tenant rent received','INCOME','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-INCOME-PRODUCE','Estate-grown produce value','INCOME','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-WAGES','Household staff wages','EXPENSE','HH-1700-STEWARD','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-SECURITY-PAYROLL','Guard and patrol payroll','EXPENSE','HH-1700-CAPTAIN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-PROVISIONS','Food and stores purchased','EXPENSE','HH-1700-PROVISIONER','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-ANIMALS','Animal keep and farriery','EXPENSE','HH-1700-STABLE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-REPAIRS','Repairs and maintenance','EXPENSE','HH-1700-STEWARD','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-MAINTENANCE-CONTRACTS','Standing maintenance contracts','OBLIGATION','HH-1700-STEWARD','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-COMMISSIONS','Art and object commissions','EXPENSE','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-COLLECTION-ACQUISITION','Collection acquisition - silver and jewelry','EXPENSE','HH-1700-STEWARD','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-SCRIPTORIUM','Books, paper and ink','EXPENSE','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-COOKWARE','Cookware and cutlery','EXPENSE','HH-1700-COOK','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-SUPPLIER-PAYABLE','Supplier obligations outstanding','OBLIGATION','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EST-ACCT-CROWN-EXTERNAL','Funding source outside the estate','EXTERNAL_COUNTERPARTY','HH-1700-SCRIBE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (estate_account_code) do nothing;

-- ===========================================================================
-- I. CASTLE ECONOMY PILOT - fifteen traced flows.
--    Every amount is OPEN_AMOUNT. Currency is OPEN because the 1700s estate
--    settlement instrument has never been established; REE is the CURRENT
--    EdereAirah currency and has not been confirmed as the period instrument.
-- ===========================================================================
insert into public.thylora_estate_ledger_entries
  (entry_code, flow_class, from_account_code, from_account_external, to_account_code, to_account_external,
   reason, currency_state, authority_role_code, authority_state, evidence, linked_reference, status, source_query_id)
values
 ('EFL-01-FUNDING','ESTATE_FUNDING',null,'EST-ACCT-CROWN-EXTERNAL','EST-ACCT-TREASURY',null,
  'Estate funding received from outside the estate. Who funds the estate and on what footing is OPEN.',
  'OPEN','HH-1700-SCRIBE','OPEN',
  jsonb_build_object('basis','Estate accounting is a registered function (EST-ACCOUNTING-001) whose ledger form, period, audit role and currency units are recorded as unknown.'),
  'EST-ACCOUNTING-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-02-TENANT-RENT','TENANT_PAYMENT',null,'THT-CLASS-FARM','EST-ACCT-INCOME-RENT',null,
  'Rent paid by a tenant holding. Rent form may be coin, share of produce, labour or mixed; which it is remains OPEN.',
  'OPEN','HH-1700-SCRIBE','OPEN',
  jsonb_build_object('basis','EST-TENANCY-001 records tenure form, rent form, term length, succession and dispute path as unknown.'),
  'EST-LEASE-RENT-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-03-STAFF-WAGES','STAFF_WAGE','EST-ACCT-TREASURY',null,'EST-ACCT-WAGES',null,
  'Household staff wages for the roles registered in household_role_registry.',
  'OPEN','HH-1700-STEWARD','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','household_role_registry holds the 1700s roles; HH-1700-STEWARD holds staff continuity.'),
  'household_role_registry','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-04-ROYAL-COOK','STAFF_WAGE','EST-ACCT-WAGES',null,null,'ER-ROYAL-COOK-001',
  'Compensation of the Head Cook. HH-1700-COOK is BOUND to ER-ROYAL-COOK-001 in household_role_registry, so the flow has a real payee slot; the amount and the pay period are OPEN.',
  'OPEN','HH-1700-STEWARD','ROLE_BINDING_CANON',
  jsonb_build_object('basis','household_role_registry HH-1700-COOK state=BOUND primary_person_id=ER-ROYAL-COOK-001','not_asserted','Veronica Hall has no kitchen role and none is created here.'),
  'HH-1700-COOK','STRUCTURE_OPEN_PAYEE_BOUND','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-05-FOOD-PURCHASE','FOOD_PURCHASE','EST-ACCT-TREASURY',null,'EST-ACCT-PROVISIONS',null,
  'Food and stores bought in. Supplier names, market days, payment form and credit terms are all OPEN.',
  'OPEN','HH-1700-PROVISIONER','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','EST-PROVISIONING-001: the Provisioner buys and receives, the Steward holds stores oversight, the day list passes to the Head Cook.'),
  'EST-PROVISIONING-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-06-ESTATE-GROWN','ESTATE_PRODUCE','EST-ACCT-INCOME-PRODUCE',null,'EST-ACCT-PROVISIONS',null,
  'Estate-grown food taken into the kitchen. This is an internal requisition, not a purchase, and it must not be counted as external spend.',
  'OPEN','HH-1700-COOK','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','EST-HERB-GARDEN-001: the Royal Cook, not the Provisioner, controls what is cut daily from the kitchen herb ground.'),
  'LAND-HERB-KITCHEN-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-07-ANIMAL-COSTS','ANIMAL_COST','EST-ACCT-TREASURY',null,'EST-ACCT-ANIMALS',null,
  'Keep, feed, farriery and veterinary provision for estate animals. Feed chain and farrier provision are OPEN.',
  'OPEN','HH-1700-STABLE','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','EST-ANIMAL-CARE-001 and household_role_registry HH-1700-STABLE.'),
  'ANIMAL-HORSE-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-08-SECURITY-PAYROLL','SECURITY_PAYROLL','EST-ACCT-TREASURY',null,'EST-ACCT-SECURITY-PAYROLL',null,
  'Payroll for the guard establishment. Seventeen posts are defined with minimum strengths; the approved establishment and pay are OPEN.',
  'OPEN','HH-1700-CAPTAIN','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','thylora_security_posts and SCHED-HH-1700-GUARD.','note','Minimum strengths are derived requirements, not an approved establishment.'),
  'thylora_security_posts','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-09-REPAIRS','REPAIR','EST-ACCT-TREASURY',null,'EST-ACCT-REPAIRS',null,
  'Repairs raised by inspection or incident. Whether the trade is resident or called in is OPEN.',
  'OPEN','HH-1700-STEWARD','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','EST-MAINTENANCE-001: every repair is a provenance event and belongs in the object repairs field.'),
  'EST-WORK-ORDERS-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-10-ART-COMMISSION','COMMISSION','EST-ACCT-TREASURY',null,'EST-ACCT-COMMISSIONS',null,
  'Commission of a work for the royal collection. No artist is named: eleven maker slots are open and unnamed.',
  'OPEN','HH-1700-SCRIBE','OPEN',
  jsonb_build_object('basis','thylora_royal_collection_registry holds eight class spines, all CLASS_OPEN_NO_ITEMS with maker_state OPEN.'),
  'ROYCOL-CLASS-PAINTINGS','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-11-SILVER-JEWELRY','COLLECTION_ACQUISITION','EST-ACCT-TREASURY',null,'EST-ACCT-COLLECTION-ACQUISITION',null,
  'Acquisition of silver or jewelry into the royal collection. Acquisition mode and value state are OPEN on every collection class.',
  'OPEN','HH-1700-STEWARD','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','ROYCOL-CLASS-SILVER custodian HH-1700-STEWARD; ROYCOL-CLASS-JEWELRY custodian OPEN.'),
  'ROYCOL-CLASS-SILVER','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-12-BOOKS-INK','SCRIPTORIUM','EST-ACCT-TREASURY',null,'EST-ACCT-SCRIPTORIUM',null,
  'Books, paper and ink. This is the working cost of the record function itself, which is why the Senior Scribe holds it.',
  'OPEN','HH-1700-SCRIBE','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','household_role_registry HH-1700-SCRIBE holds household records, messages, handoffs and court continuity; ROYCOL-CLASS-BOOKS custodian is HH-1700-SCRIBE.'),
  'ROYCOL-CLASS-BOOKS','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-13-COOKWARE','COOKWARE','EST-ACCT-TREASURY',null,'EST-ACCT-COOKWARE',null,
  'Cookware and cutlery issue, repair and replacement. Silver cutlery is custodied under the collection, not the kitchen.',
  'OPEN','HH-1700-COOK','ROLE_AUTHORITY_CANON',
  jsonb_build_object('basis','thylora_kitchen_equipment class slots; KIT-EQ-CLASS-CUTLERY links to ROYCOL-CLASS-SILVER.'),
  'thylora_kitchen_equipment','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-14-SUPPLIER-INVOICE','SUPPLIER_OBLIGATION','EST-ACCT-PROVISIONS',null,'EST-ACCT-SUPPLIER-PAYABLE',null,
  'A supplier obligation raised on receipt and settled later. Credit terms are OPEN, so the obligation cannot yet be aged.',
  'OPEN','HH-1700-SCRIBE','OPEN',
  jsonb_build_object('basis','EST-PROVISIONING-001 records payment form and credit terms as unknown.'),
  'thylora_kitchen_suppliers','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('EFL-15-MAINTENANCE-CONTRACT','MAINTENANCE_CONTRACT','EST-ACCT-TREASURY',null,'EST-ACCT-MAINTENANCE-CONTRACTS',null,
  'A standing maintenance obligation rather than a one-off repair. Which trades are kept on standing terms is OPEN.',
  'OPEN','HH-1700-STEWARD','OPEN',
  jsonb_build_object('basis','EST-MAINTENANCE-001 records resident trades versus called-in and repair cycle as unknown.'),
  'EST-MAINTENANCE-001','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (entry_code) do nothing;
