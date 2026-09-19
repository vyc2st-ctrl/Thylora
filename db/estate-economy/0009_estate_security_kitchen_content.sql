-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Content for ER-CASTLE-ROYAL-001. Every row is either taken from canon or is a
-- structural class slot with OPEN identity. No person, farm name, supplier name or
-- headcount is invented.

alter table public.thylora_security_posts add column if not exists derivation_note text;
alter table public.thylora_kitchen_posts  add column if not exists derivation_note text;

-- ===========================================================================
-- SECURITY ZONES - twelve layers, outermost first
-- ===========================================================================
insert into public.thylora_security_zones
  (zone_code, zone_name, layer_order, what_it_protects, access_rule, escalates_to_zone_code, open_fields, state, source_query_id)
values
 ('SEC-Z-ROADS','Approach road and estate roads',1,
  'The road the castle is provisioned along. Canon: approach road, horse-drawn cargo cart.',
  'Open road under patrol. What a patrol may stop is OPEN.','SEC-Z-GATE',
  array['patrol_range','patrol_interval','stop_authority'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-DELIVERY','Delivery routes',2,
  'The route a cart follows from supplier or farm to the receiving yard, including halts.',
  'Escorted or patrolled movement. Escort coordination sits with HH-1700-CAPTAIN.','SEC-Z-GATE',
  array['escort_threshold','halt_points','night_movement_rule'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-FARMS','Farms and tenant land',3,
  'Working farmland and tenant holdings that feed the estate and the settlement.',
  'Worked ground, not closed ground. Watch is by patrol, not by post.','SEC-Z-WALL',
  array['patrol_coverage','tenant_alarm_path'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-WALL','Outer curtain wall and wall towers',4,
  'The outer defensive line named in castle canon.',
  'Closed line. Entry only through the gate.','SEC-Z-GATE',
  array['tower_count','wall_walk_length'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-GATE','Main gate and gatehouse',5,
  'The single controlled crossing between road and estate. Also the point where goods become stores.',
  'Controlled entry. Challenge and admit. Receiving is both a stores act and a security act.','SEC-Z-COURTYARD',
  array['challenge_form','written_pass_rule','night_closing_rule'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-COURTYARD','Working courtyard',6,
  'The working yard inside the gate through which carts, staff and animals move.',
  'Inside the wall, still a public-facing working space.','SEC-Z-STABLES',
  array['yard_closing_rule'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-STABLES','Stables and tack',7,
  'Horses, carriage, tack and remount readiness. Canon custody: HH-1700-STABLE.',
  'Restricted to stable staff and authorised riders.','SEC-Z-WORKSHOPS',
  array['tack_room_locking','night_stable_watch'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-WORKSHOPS','Workshops',8,
  'Maker workshops on the estate. Eleven maker slots are open and unnamed.',
  'Restricted to the maker holding the workshop and their hands.','SEC-Z-WAREHOUSES',
  array['tool_custody','workshop_roster'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-WAREHOUSES','Warehouses and bulk stores',9,
  'Bulk goods held between receiving and use.',
  'Key-held. Key-holding rule is OPEN.','SEC-Z-KITCHENS',
  array['key_holding_rule','inventory_cycle'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-KITCHENS','Kitchens and kitchen stores',10,
  'The Royal Kitchen, its pantry, larder, herb store and cellar. Canon: the fire is never dead.',
  'Kitchen staff under HH-1700-COOK; stores oversight under HH-1700-STEWARD.','SEC-Z-COLLECTION',
  array['key_holding_rule','after_service_locking'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-COLLECTION','Royal collection and plate',11,
  'Paintings, sculpture, silver, jewelry, books and manuscripts, ceremonial and historic household objects.',
  'Custodian-controlled. Eight collection classes are registered and all items are OPEN.','SEC-Z-RESIDENCE',
  array['strongroom_location','inventory_cycle','viewing_rule'],'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-Z-RESIDENCE','Inner residence / family range',12,
  'The family range. Detail is deliberately withheld in canon and stays withheld here.',
  'WITHHELD. Public detail is not permitted at this layer.',null,
  array['withheld_by_design'],'STRUCTURE_DEFINED_DETAIL_WITHHELD','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (zone_code) do nothing;

-- ===========================================================================
-- SECURITY POSTS - staffing expressed as a derived minimum requirement,
-- never as an approved establishment, and never as "two guards for everything".
-- ===========================================================================
insert into public.thylora_security_posts
  (post_code, zone_code, post_name, post_class, day_strength_required, night_strength_required,
   strength_state, state, patrol_range, patrol_mode, communication_method_code, responsible_role_code,
   derivation_note, open_fields, source_query_id)
values
 ('SEC-P-GATE-DAY','SEC-Z-GATE','Main gate - day watch','STANDING',2,null,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-VOICE-CHALLENGE','HH-1700-CAPTAIN',
  'Minimum 2: a controlled crossing needs one to challenge and hold the gate and one to carry word inward without leaving the gate unheld. Canon states the gate is a guard post with post relief.',
  array['exact_establishment_requires_chairman'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-GATE-NIGHT','SEC-Z-GATE','Main gate - night watch','NIGHT',null,2,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-BELL-ALARM','HH-1700-CAPTAIN',
  'Minimum 2 for the same reason as the day watch. Night strength is not reduced below the day minimum because the gate is the single controlled crossing.',
  array['exact_establishment_requires_chairman'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-GATEHOUSE','SEC-Z-GATE','Gatehouse - record and pass','STANDING',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-WRITTEN-PASS','HH-1700-SCRIBE',
  'Minimum 1 at all times: receiving is a stores act as well as a security act, so the tally and the pass must be written by someone who is not holding the gate.',
  array['tally_record_form'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-WALL-TOWER','SEC-Z-WALL','Wall tower watch','STANDING',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-HORN','HH-1700-CAPTAIN',
  'Minimum 1 per manned tower. The number of towers is OPEN in canon, so this is a per-tower requirement and not a total.',
  array['tower_count','which_towers_are_manned'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-WALL-WALK','SEC-Z-WALL','Curtain wall walk','PATROL',1,2,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Wall circuit','FOOT','SIG-HORN','HH-1700-CAPTAIN',
  'Night strength 2 because a wall walk in darkness cannot both hold a sighting and carry word.',
  array['circuit_interval'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-COURTYARD','SEC-Z-COURTYARD','Courtyard watch','STANDING',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-VOICE-CHALLENGE','HH-1700-CAPTAIN',
  'Minimum 1: the yard is inside the wall but is a working, public-facing space while carts and staff move.',
  array['yard_closing_rule'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-STABLES','SEC-Z-STABLES','Stable watch','NIGHT',null,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-BELL-ALARM','HH-1700-STABLE',
  'Minimum 1 overnight. Animals and tack are both theft and fire exposure, and remount readiness is a canon duty.',
  array['day_cover_from_stable_staff'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-WORKSHOPS','SEC-Z-WORKSHOPS','Workshop range round','PATROL',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Workshop range','FOOT','SIG-BELL-ALARM','HH-1700-CAPTAIN',
  'Minimum 1 on round. Workshops hold tools and part-made work rather than plate, so they are covered by round rather than by standing post.',
  array['round_interval'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-WAREHOUSES','SEC-Z-WAREHOUSES','Warehouse and bulk store round','PATROL',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Store range','FOOT','SIG-BELL-ALARM','HH-1700-STEWARD',
  'Minimum 1 on round, with key custody held separately from the round so that the person who checks the lock is not the person who can open it.',
  array['key_holding_rule'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-KITCHEN-FIRE','SEC-Z-KITCHENS','Kitchen fire watch','NIGHT',null,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-BELL-ALARM','HH-1700-COOK',
  'Exactly 1 by canon: SCHED-HH-1700-KITCHEN states that at night the fire is banked with one hand watching it. This is a kitchen duty that is also the estate fire watch.',
  array[]::text[],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-STORES','SEC-Z-KITCHENS','Kitchen stores check','STANDING',1,null,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-WRITTEN-PASS','HH-1700-STEWARD',
  'Minimum 1 during stores hours. Stores oversight is a named canon duty of the Chief Steward.',
  array['inventory_cycle'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-COLLECTION','SEC-Z-COLLECTION','Royal collection watch','STANDING',1,1,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-BELL-ALARM','HH-1700-STEWARD',
  'Minimum 1 at all times. The collection is the estate concentration of value: eight registered classes including silver and jewelry.',
  array['strongroom_location','second_person_rule_for_opening'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-RESIDENCE','SEC-Z-RESIDENCE','Inner residence watch','STANDING',null,null,
  'OPEN','STRUCTURE_DEFINED_STRENGTH_WITHHELD',null,null,'SIG-RUNNER','HH-1700-CAPTAIN',
  'Strength WITHHELD. The family range is withheld in canon; publishing its watch strength would describe the family range by implication.',
  array['withheld_by_design'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-ROAD-PATROL','SEC-Z-ROADS','Approach road patrol','PATROL',2,2,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Approach road and estate roads','MIXED','SIG-HORN','HH-1700-CAPTAIN',
  'Minimum 2. A patrol away from the walls must be able to hold a stop and still send word back; a single rider can do one or the other.',
  array['patrol_range','patrol_interval','stop_authority'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-DELIVERY-ESCORT','SEC-Z-DELIVERY','Delivery escort','ESCORT',2,2,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Supplier or farm to receiving yard','MIXED','SIG-HORN','HH-1700-CAPTAIN',
  'Minimum 2 when an escort is called. The threshold at which a cart requires escort rather than patrol cover is OPEN.',
  array['escort_threshold'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-FARM-PATROL','SEC-Z-FARMS','Farm and tenant land patrol','PATROL',2,null,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN','Estate farmland and tenant holdings','MIXED','SIG-HORN','HH-1700-CAPTAIN',
  'Minimum 2 in daylight. Tenant land is worked ground, so cover is by patrol and by a tenant alarm path rather than by standing post.',
  array['patrol_coverage','tenant_alarm_path'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-P-RESERVE','SEC-Z-COURTYARD','Reserve / quick response','RESERVE',2,2,
  'REQUIREMENT_SET','STRUCTURE_DEFINED_IDENTITY_OPEN',null,null,'SIG-BELL-ALARM','HH-1700-CAPTAIN',
  'Minimum 2 held off-post at all times, sized to relieve or reinforce the largest single standing post (the gate, at 2). Canon notes a post-relief system implies someone is off-post and therefore available. Muster time and call-out authority are OPEN.',
  array['reserve_size_beyond_minimum','muster_time','call_out_authority','standing_orders'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (post_code) do nothing;

-- ===========================================================================
-- RELIEF ROTATIONS - every held post gets a named relief path, identities OPEN
-- ===========================================================================
insert into public.thylora_security_rotations
  (rotation_code, post_code, watch_label, relieved_by_post_code, source_query_id)
values
 ('SEC-R-GATE-DAY','SEC-P-GATE-DAY','DAY','SEC-P-GATE-NIGHT','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-GATE-NIGHT','SEC-P-GATE-NIGHT','NIGHT','SEC-P-GATE-DAY','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-GATEHOUSE','SEC-P-GATEHOUSE','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-WALL-TOWER','SEC-P-WALL-TOWER','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-WALL-WALK','SEC-P-WALL-WALK','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-COURTYARD','SEC-P-COURTYARD','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-STABLES','SEC-P-STABLES','NIGHT','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-WORKSHOPS','SEC-P-WORKSHOPS','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-WAREHOUSES','SEC-P-WAREHOUSES','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-KITCHEN-FIRE','SEC-P-KITCHEN-FIRE','NIGHT','SEC-P-STORES','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-STORES','SEC-P-STORES','DAY','SEC-P-KITCHEN-FIRE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-COLLECTION','SEC-P-COLLECTION','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-ROAD-PATROL','SEC-P-ROAD-PATROL','CONTINUOUS','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-DELIVERY-ESCORT','SEC-P-DELIVERY-ESCORT','ON_CALL','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-FARM-PATROL','SEC-P-FARM-PATROL','DAY','SEC-P-RESERVE','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SEC-R-RESERVE','SEC-P-RESERVE','CONTINUOUS',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (rotation_code) do nothing;

-- ===========================================================================
-- SIGNALS - period-appropriate only
-- ===========================================================================
insert into public.thylora_security_signals
  (signal_code, signal_name, signal_class, carries_meaning, escalates_to_signal, state, source_query_id)
values
 ('SIG-VOICE-CHALLENGE','Voice challenge','VOICE_CHALLENGE','Halt and identify at a controlled crossing.','SIG-HORN','STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SIG-WRITTEN-PASS','Written pass and tally','WRITTEN_PASS','Authorised admission, and the written record of what crossed the gate.',null,'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SIG-HORN','Horn','HORN','Call from wall, tower or patrol: something is approaching or wrong.','SIG-BELL-ALARM','STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SIG-BELL-ALARM','Alarm bell','BELL','General alarm. Fire or intrusion. Muster the reserve.',null,'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SIG-RUNNER','Runner','RUNNER','Carried word where a signal would be heard too widely, including anything touching the family range.',null,'STRUCTURE_DEFINED','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SIG-BEACON','Beacon','BEACON','Distance signal beyond horn range. Whether the estate keeps a beacon is OPEN.',null,'STRUCTURE_OPEN','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (signal_code) do nothing;

-- ===========================================================================
-- ROYAL KITCHEN - posts bound to existing household roles
-- ===========================================================================
insert into public.thylora_kitchen_posts
  (kitchen_post_code, post_name, section, held_by_role_code, reports_to_role_code,
   hands_required_state, hands_required, never_unattended, derivation_note, open_fields, source_query_id)
values
 ('KIT-P-HEAD','Head Cook','SERVICE','HH-1700-COOK','HH-1700-STEWARD','RECORDED',1,true,
  'Canon: HH-1700-COOK holds kitchen leadership, menus, stores and food continuity, and is BOUND to ER-ROYAL-COOK-001.',
  array[]::text[],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-DEPUTY','Deputy Cook','SERVICE','HH-1700-DEPUTY-COOK','HH-1700-COOK','RECORDED',1,false,
  'Canon: stands in for the Head Cook and holds service continuity in the Head Cook absence. Person OPEN.',
  array['person_identity'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-FIRE','Fire and hearth','FIRE','HH-1700-SCULLERY','HH-1700-COOK','RECORDED',1,true,
  'Canon: the kitchen is never unattended while the fire is alight, and at night one hand watches the banked fire. Fire tending and banking is a named scullery duty.',
  array['person_identity'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-OVEN','Oven and bread','OVEN','HH-1700-BAKER','HH-1700-COOK','RECORDED',1,false,
  'Canon: bread and pastry oven, first-light draw, oven heat continuity.',
  array['person_identity'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-STORES','Kitchen stores','STORES','HH-1700-PROVISIONER','HH-1700-COOK','RECORDED',1,false,
  'Canon: buying and receiving, stores count and spoilage control, and the day list handed to the Head Cook.',
  array['person_identity','supplier_names'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-SCULLERY','Scullery','SCULLERY','HH-1700-SCULLERY','HH-1700-DEPUTY-COOK','OPEN',null,false,
  'Canon names water, washing and carrying as scullery duties but does not state how many hands the kitchen keeps.',
  array['hands_required','person_identity'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-HERB','Herb cutting','HERB','HH-1700-COOK','HH-1700-STEWARD','RECORDED',1,false,
  'Canon: the Royal Cook, not the Provisioner, controls what is cut daily from the kitchen herb ground, which is a short same-day walk from the kitchen.',
  array['native_plant_names','rosemary_mirror_plant_name'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-P-DRESSING','Dressing and service','DRESSING','HH-1700-DEPUTY-COOK','HH-1700-COOK','OPEN',null,false,
  'Section exists because service must be plated and sent; its establishment is not stated in canon.',
  array['hands_required','service_route_to_family_range'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (kitchen_post_code) do nothing;

-- ===========================================================================
-- KITCHEN SHIFT SEGMENTS - taken directly from SCHED-HH-1700-KITCHEN
-- ===========================================================================
insert into public.thylora_kitchen_shift_segments
  (segment_code, segment_order, segment_name, what_happens, holding_role_code, relief_role_codes,
   fire_state, handoff_requirement, source_query_id)
values
 ('KIT-S-NIGHT',1,'Night','Fire banked, one hand watching it.','HH-1700-SCULLERY',
  array['HH-1700-DEPUTY-COOK'],'BANKED',
  'The hand on the fire does not stand down until first light is raised by the incoming hand.','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-S-FIRSTLIGHT',2,'First light','Fire raised, water on, bread drawn.','HH-1700-BAKER',
  array['HH-1700-DEPUTY-COOK','HH-1700-SCULLERY'],'RAISED',
  'Oven state and water state pass to the Head Cook or Deputy Cook before service planning.','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-S-MORNING',3,'Morning','Stores checked against the day list.','HH-1700-PROVISIONER',
  array['HH-1700-STEWARD'],'RAISED',
  'The Provisioner hands the day list to whichever of the Head Cook or Deputy Cook holds the kitchen.','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-S-DAY',4,'Day','Service.','HH-1700-COOK',
  array['HH-1700-DEPUTY-COOK'],'SERVICE',
  'Head Cook hands over to Deputy Cook. Menus, stores state and anything short are named at handover.','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-S-CLOSE',5,'Close','Fire banked again.','HH-1700-SCULLERY',
  array['HH-1700-DEPUTY-COOK'],'CLOSING',
  'The kitchen is not left until the fire is banked and the night hand is on it.','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (segment_code) do nothing;

-- ===========================================================================
-- KITCHEN STORES
-- ===========================================================================
insert into public.thylora_kitchen_stores
  (store_code, store_type, store_name, custodian_role_code, security_zone_code, open_fields, source_query_id)
values
 ('KIT-ST-PANTRY','PANTRY','Kitchen pantry','HH-1700-PROVISIONER','SEC-Z-KITCHENS',
  array['key_holding_rule','inventory_cycle'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-ST-DRY','DRY_STORE','Dry store','HH-1700-PROVISIONER','SEC-Z-KITCHENS',
  array['key_holding_rule','keeping_condition'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-ST-COLD','COLD_STORE','Cold store','HH-1700-PROVISIONER','SEC-Z-KITCHENS',
  array['cooling_method','keeping_condition'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-ST-LARDER','MEAT_LARDER','Meat larder','HH-1700-PROVISIONER','SEC-Z-KITCHENS',
  array['hanging_rule','keeping_condition'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-ST-HERB','HERB_STORE','Herb store','HH-1700-COOK','SEC-Z-KITCHENS',
  array['drying_method','winter_supply_rule','native_plant_names'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-ST-CELLAR','CELLAR','Cellar','HH-1700-STEWARD','SEC-Z-KITCHENS',
  array['key_holding_rule','issue_authority'],'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (store_code) do nothing;

-- ===========================================================================
-- WASTE AND LEFTOVER ROUTING
-- ===========================================================================
insert into public.thylora_kitchen_waste_routes
  (route_code, waste_class, routed_to, routed_to_reference, decided_by_role_code, sanitation_link, source_query_id)
values
 ('KIT-W-LEFTOVER','SERVABLE_LEFTOVER','Staff table','KIT-P-DRESSING','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-STAFF','STAFF_TABLE','Household staff meal','HH-1700-STEWARD','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-FEED','ANIMAL_FEED','Estate animals','ANIMAL-CLASS-PIG','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-COMPOST','COMPOST','Kitchen and herb ground','LAND-HERB-KITCHEN-001','HH-1700-COOK','EST-SANITATION','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-ASH','ASH','Ash disposal and reuse','OPEN','HH-1700-SCULLERY','EST-SANITATION','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-BONE','BONE','Stock, then disposal','OPEN','HH-1700-COOK','EST-SANITATION','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-W-SPOILED','SPOILED','Rejected at receiving or condemned in store; never routed to any table','EST-FOOD-RECEIVING-001','HH-1700-PROVISIONER','EST-SANITATION','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (route_code) do nothing;

-- ===========================================================================
-- SUPPLIERS - structural slots, all identities OPEN
-- ===========================================================================
insert into public.thylora_kitchen_suppliers
  (supplier_code, supply_class, is_estate_grown, source_land_unit_code, contact_role_code, source_query_id)
values
 ('SUP-CLASS-GRAIN','GRAIN',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-MEAT','MEAT',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-FISH','FISH',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-DAIRY','DAIRY',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-SALT-SPICE','SALT_SPICE',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-WINE-ALE','WINE_ALE',false,null,'HH-1700-STEWARD','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-FUEL','FUEL',false,null,'HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-CLASS-VESSELS','VESSELS',false,null,'HH-1700-STEWARD','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-ESTATE-HERB','SALT_SPICE',true,'LAND-HERB-KITCHEN-001','HH-1700-COOK','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('SUP-ESTATE-VEG','GRAIN',true,'LAND-CLASS-VEGETABLE','HH-1700-PROVISIONER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (supplier_code) do nothing;

-- ===========================================================================
-- COOKWARE ISSUE / REPAIR - class slots, makers OPEN
-- ===========================================================================
insert into public.thylora_kitchen_equipment
  (equipment_code, equipment_class, item_description, issued_to_role_code, provenance_link, source_query_id)
values
 ('KIT-EQ-CLASS-CAULDRON','CAULDRON','Hearth cauldron. Maker OPEN.','HH-1700-SCULLERY',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-POT','POT','Cooking pots. Maker OPEN.','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-PAN','PAN','Pans. Maker OPEN.','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-SPIT','SPIT','Roasting spit and dogs. Maker OPEN.','HH-1700-SCULLERY',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-KNIFE','KNIFE','Kitchen knives. Maker OPEN.','HH-1700-COOK',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-MOULD','MOULD','Baking and pastry moulds. Maker OPEN.','HH-1700-BAKER',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-VESSEL','VESSEL','Storage and serving vessels. Maker OPEN.','HH-1700-PROVISIONER',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-SCALE','SCALE','Weights and scales used at receiving and in stores. Maker OPEN.','HH-1700-PROVISIONER',null,'THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532'),
 ('KIT-EQ-CLASS-CUTLERY','CUTLERY','Table cutlery. Maker OPEN. Silver cutlery is custodied under the royal collection, not the kitchen.','HH-1700-STEWARD','ROYCOL-CLASS-SILVER','THY-Q-20260919-CASTLE-ESTATE-PROVENANCE-532')
on conflict (equipment_code) do nothing;
