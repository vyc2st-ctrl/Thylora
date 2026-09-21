-- CASTLE SERVICE ZONE · 0008 · Seed: the 576 service-zone slice
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- EVERY DIMENSION IN THIS FILE IS 'PROPOSED'. Not one is measured, documented or
-- canon. They are authored to be argued with. The backend could not be read from
-- the build session, so nothing here may be quoted as established fact.

begin;

create or replace function thy_csz_issue(p_kind text, p_id text, p_n integer)
returns text language plpgsql as $$
declare s text := 'THY-CSZ-576-' || lpad(p_n::text, 3, '0');
begin
  insert into thy_csz_serial (serial, subject_kind, subject_id)
  values (s, p_kind, p_id)
  on conflict (serial) do update set subject_kind = excluded.subject_kind,
                                     subject_id   = excluded.subject_id;
  return s;
end $$;

-- ============================================================== ROLE SLOTS
insert into thy_csz_role_slot (role_code, role_title, occupant_name, occupant_state, occupant_source, authority_note) values
 ('CSZ-ROLE-HEAD_COOK','Head Cook','Inés','DOCUMENTED',
  'Existing THYLORA person record (thylora_person_world_sheet) carried in from the work order; not re-derived here.',
  'Holds kitchen authority when present. Holds the day list and the issue decision.'),
 ('CSZ-ROLE-DEPUTY_COOK','Deputy Cook',null,'UNKNOWN',
  'Existing relief fact carried in from the work order. No name is recorded anywhere in this slice.',
  'When the Head Cook is off, the Deputy Cook holds kitchen authority. This is an existing fact, used, not invented.'),
 ('CSZ-ROLE-STOREKEEPER','Storekeeper',null,'UNKNOWN','Role slot only.',
  'Holds the store keys and the scale. Issues against the day list; does not set it.'),
 ('CSZ-ROLE-SCULLION','Scullion',null,'UNKNOWN','Role slot only.',
  'Holds the wash line. Does not issue from store and does not touch the day list.'),
 ('CSZ-ROLE-BAKER','Baker',null,'UNKNOWN','Role slot only.','Holds the ovens, the flour bins and the ash.'),
 ('CSZ-ROLE-PORTER','Porter',null,'UNKNOWN','Role slot only.','Moves load between yard, receiving and corridor.'),
 ('CSZ-ROLE-HERB_KEEPER','Herb Keeper',null,'UNKNOWN','Role slot only.',
  'Holds cutting, cleaning, drying and the dry-herb crocks. Reports herb state to the Head Cook.'),
 ('CSZ-ROLE-LAUNDRESS','Laundry',null,'UNKNOWN','Role slot only; the laundry itself is outside this slice.',
  'Receives and returns work garments. Location UNKNOWN pending the wider castle plan.')
on conflict (role_code) do nothing;

-- ============================================================== SPACES
insert into thy_csz_space_intake (
  stable_id, serial, native_name, native_name_state, erc_mirror, erc_mirror_note,
  working_label, function_text,
  width_m, depth_m, height_m, wall_thickness_m, dimension_state, dimension_basis,
  floor_text, floor_state, ceiling_text, ceiling_state,
  door_count, window_count, openings_text, openings_state,
  hearth_oven_water, services_state, access_class, public_safe, source_text, notes) values

('CSZ-KITCHEN-01', thy_csz_issue('SPACE','CSZ-KITCHEN-01',1), null,'UNKNOWN',
 'Royal / great kitchen','ERC mirror used to test function and plausibility only.',
 'Royal Kitchen','Primary cooking floor. Receives issued goods, preps, cooks, and passes finished dishes to the household service route. Holds no store of its own beyond the working day.',
 14.00,10.00,8.50,1.10,'PROPOSED',
 'Derived from what the suite must carry: two hearth bays plus a spit range plus a boiling range, a 10 m prep bench line, and two people passing behind a working cook without contact. Height is set by heat and smoke, not by grandeur. Checked for plausibility only against ERC great-kitchen mirrors; not measured.',
 'Stone flags, laid to a shallow fall toward the scullery drain line so wash-down runs away from the hearths.','PROPOSED',
 'Open to the roof over the hearth bay, with a louvred lantern for heat and smoke; boarded over the prep bench line.','PROPOSED',
 4,4,'Four doors: corridor (double), scullery (double), bakehouse (arch), larder issue hatch. Four high-set windows above working head height so the light does not fall in a cook''s eyes.','PROPOSED',
 'Two open hearths; one spit range with fixed crane and dripping tray; one boiling range. Piped standpipe over a stone sink at the scullery end.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'The kitchen is no longer isolated: every one of its four openings lands in a room in this slice.'),

('CSZ-SCULLERY-01', thy_csz_issue('SPACE','CSZ-SCULLERY-01',2), null,'UNKNOWN',
 'Scullery','ERC mirror.','Scullery',
 'Dirty return, wash, rinse, dry and hold. No cooking. The room exists so that dirty ware never crosses the prep bench.',
 8.00,6.00,4.20,0.80,'PROPOSED',
 'Derived from three trough positions plus a rack run plus a return-table landing area, with a clear lane between them. Checked against ERC mirrors for plausibility only.',
 'Stone flags to a fall of roughly 1:60 into a covered channel drain.','PROPOSED',
 'Plastered on joists, with a steam vent to the yard.','PROPOSED',
 3,2,'Three doors: kitchen (double, the dirty-return door), corridor, wash yard. Two windows over the troughs.','PROPOSED',
 'Two lead-lined wash troughs, one rinse trough, a copper for hot water over a small fire, channel drain to the yard. No cooking hearth, deliberately.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',null),

('CSZ-DRYSTORE-01', thy_csz_issue('SPACE','CSZ-DRYSTORE-01',3), null,'UNKNOWN',
 'Dry store','ERC mirror.','Dry Store',
 'Grain, flour, pulses, salt, sugar, dry goods in bins and crocks. Issued against the day list, never taken freely.',
 6.00,5.00,3.40,0.90,'PROPOSED',
 'Derived from bin runs on two walls with a shelf run above and a clear measuring floor in the middle. Checked against ERC mirrors for plausibility only.',
 'Boarded on sleeper walls, raised about 0.15 m so air passes beneath and damp does not reach the bins.','PROPOSED',
 'Boarded. No opening into a damp or steaming room.','PROPOSED',
 1,1,'One lockable door to the corridor. One high shuttered and grilled window for air, not for light.','PROPOSED',
 'None. No water, no hearth, no drain — the absence is the specification.','PROPOSED',
 'RESTRICTED_SERVICE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'Keyed access. Withheld from the public sheet because the keying and the single-door arrangement are security topology.'),

('CSZ-COLDSTORE-01', thy_csz_issue('SPACE','CSZ-COLDSTORE-01',4), null,'UNKNOWN',
 'Cold / wet store','ERC mirror.','Cold / Wet Store',
 'Fish, dairy, cut meat, anything that must be kept cold and wet-cleanable. Short dwell, high turnover.',
 6.00,5.00,3.20,1.20,'PROPOSED',
 'Derived from slate shelf runs on three walls plus a trough, with wall thickness and a sunken floor doing the cooling work in place of any machine. Checked against ERC mirrors for plausibility only.',
 'Stone slab, set about 0.90 m below the corridor floor and falling to a trapped drain. Three steps down at the door.','PROPOSED',
 'Vaulted stone, for thermal mass.','PROPOSED',
 1,2,'One door off the corridor, with steps. Two north-facing louvred unglazed windows, meshed.','PROPOSED',
 'Slate shelves; a stone water trough fed off the standpipe line; trapped drain. No fire of any kind.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'The sunken floor depends on site levels that belong to THY-WORK-CASTLE-DIMENSIONAL-TWIN-572. Recorded as an open unknown, not assumed.'),

('CSZ-LARDER-01', thy_csz_issue('SPACE','CSZ-LARDER-01',5), null,'UNKNOWN',
 'Larder','ERC mirror.','Larder',
 'Day larder. Holds what the day''s cooking has already drawn: hanging meat, butter, standing dishes. Issues to the kitchen through a hatch so the cook is not walking the corridor all morning.',
 5.00,4.00,3.40,0.90,'PROPOSED',
 'Derived from a hanging-beam run plus a cold shelf plus a hatch counter, sized to a day''s draw rather than a season''s store. Checked against ERC mirrors for plausibility only.',
 'Stone flags.','PROPOSED','Boarded, with hanging beams and hooks below.','PROPOSED',
 2,2,'Two doors: corridor, and an issue hatch to the kitchen with a counter at about 0.95 m. Two north louvred windows.','PROPOSED',
 'Hanging beams; a cold slate shelf. No hearth and no standing water.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'The hatch cannot pass a whole carcase. That is recorded as a routing rule, not left to be discovered.'),

('CSZ-BAKEHOUSE-01', thy_csz_issue('SPACE','CSZ-BAKEHOUSE-01',6), null,'UNKNOWN',
 'Bakehouse / oven room','ERC mirror.','Bake / Oven Room',
 'Bread, pastry and anything oven-fired. Separated from the kitchen by an arch so its heat and flour dust are contained but its output is one move away.',
 7.00,6.00,5.00,1.30,'PROPOSED',
 'Wall thickness is set by the oven mass carried within it, not by defence. Floor area is derived from two oven mouths plus a proving bench plus a peel swing of about 3 m. Checked against ERC mirrors for plausibility only.',
 'Stone flags with a brick apron in front of the oven mouths.','PROPOSED',
 'Open timber with a flue hood over the oven mouths.','PROPOSED',
 2,1,'Two doors: corridor, and the kitchen arch. One window, away from the flour bins.','PROPOSED',
 'Two masonry beehive ovens, fired and raked; one ash pit with an iron-lidded ash box; flour bins; proving bench. No piped water — water is carried from the kitchen standpipe.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',null),

('CSZ-HERBSTORE-01', thy_csz_issue('SPACE','CSZ-HERBSTORE-01',7), null,'UNKNOWN',
 'Herb store and drying loft','ERC mirror.','Herb Store',
 'Dry-herb store below; drying loft above. Cleaning does not happen here — there is no water in this room, on purpose.',
 4.00,3.50,3.20,0.70,'PROPOSED',
 'Derived from crock shelving plus a basket stack below, and a hanging-bunch run with through-draught above. Loft clear height about 2.20 m. Checked against ERC mirrors for plausibility only.',
 'Boarded and raised, both floors.','PROPOSED',
 'Open to the drying loft through a hatch; the loft is boarded with a ridge vent.','PROPOSED',
 1,2,'One door to the corridor, plus a loft hatch and ladder. Two louvred shuttered meshed windows below; a through-draught pair above.','PROPOSED',
 'No water and no fire. Fire near hanging dry herb is exactly the hazard this room is shaped to avoid.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'The herb of this slice is recorded as NATIVE_HERB_UNRESOLVED. Rosemary is carried only as an ERC functional mirror: woody evergreen, dries well, hangs in bunches, strips to leaf.'),

('CSZ-RECEIVING-01', thy_csz_issue('SPACE','CSZ-RECEIVING-01',8), null,'UNKNOWN',
 'Receiving / weigh room','ERC mirror.','Receiving',
 'Everything entering the suite lands here first and is weighed and checked before it is anywhere else. Also the cleaning point for roots, crates and cut herb, and the outward gate for sorted waste.',
 8.00,7.00,4.50,1.00,'PROPOSED',
 'Derived from a cart standing inside the door, a weigh bench beside it, and a wash-down bay clear of both. Checked against ERC mirrors for plausibility only.',
 'Stone setts, falling to an outside gully.','PROPOSED','Boarded on joists.','PROPOSED',
 3,2,'Three doors: cart door to the outer yard, corridor door, waste-yard door. Two windows.','PROPOSED',
 'Beam scale on a fixed bracket with a weights box; wash-down standpipe and gully. No hearth.','PROPOSED',
 'SERVICE',true,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'Weigh-before-store is what makes the ledger mean anything. If goods can reach a store unweighed, the day list is fiction.'),

('CSZ-SERVCORR-01', thy_csz_issue('SPACE','CSZ-SERVCORR-01',9), null,'UNKNOWN',
 'Service corridor','ERC mirror.','Service Corridor',
 'The spine. Every store opens off it, so no store opens off another store, and no one crosses the kitchen to reach a store.',
 24.00,2.60,3.20,0.90,'PROPOSED',
 'Width derived from two people passing with loaded baskets, about 2.6 m. Length derived from the room frontages it must serve. Checked against ERC mirrors for plausibility only.',
 'Stone flags.','PROPOSED','Barrel-vaulted, or boarded where it runs under occupied floors.','PROPOSED',
 10,3,'Ten openings off it. Three high-set borrowed lights.','PROPOSED',
 'None. Two wall niches for lamps.','PROPOSED',
 'RESTRICTED_SERVICE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'Withheld from the public sheet: the corridor IS the topology of the service zone, and its length, door count and position describe how the castle is entered from the service side.'),

('CSZ-STAFFLINK-01', thy_csz_issue('SPACE','CSZ-STAFFLINK-01',10), null,'UNKNOWN',
 'Staff stair and lobby','ERC mirror.','Staff / Quarters Connection',
 'The vertical link between the service zone and staff quarters. Also the change point: outdoor shoes off, kitchen shoes on.',
 3.00,2.40,3.00,0.90,'PROPOSED',
 'Lobby footprint only; the flight itself is governed by the storey height, which belongs to THY-WORK-CASTLE-DIMENSIONAL-TWIN-572 and is NOT proposed here.',
 'Stone treads; flagged lobby.','PROPOSED','Boarded soffit.','PROPOSED',
 2,1,'Two doors, one at each end; the upper is lockable from the quarters side. One slit window.','PROPOSED',
 'None.','PROPOSED',
 'SECURE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED)',
 'Never published. Where the staff stair lands is who can reach the castle interior at night.')
on conflict (stable_id) do nothing;

commit;

-- ============================================================== ADJACENCY
begin;

insert into thy_csz_adjacency_intake
 (connection_id, serial, space_a, space_b, external_edge, kind, clear_width_m, clear_height_m,
  dimension_state, direction_rule, access_class, public_safe, source_text, notes) values
('CSZ-LINK-001', thy_csz_issue('LINK','CSZ-LINK-001',11),'CSZ-RECEIVING-01',null,'OUTER DELIVERY YARD (outside this slice)','CART_DOOR',2.60,3.20,'PROPOSED',
 'Inward only for goods. Nothing leaves the suite through this door except empty crates.','SERVICE',true,'576 PROPOSED',null),
('CSZ-LINK-002', thy_csz_issue('LINK','CSZ-LINK-002',12),'CSZ-RECEIVING-01','CSZ-SERVCORR-01',null,'DOUBLE_DOOR',1.80,2.40,'PROPOSED',
 'Inward only after weighing. Unweighed goods may not pass.','RESTRICTED_SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-003', thy_csz_issue('LINK','CSZ-LINK-003',13),'CSZ-SERVCORR-01','CSZ-DRYSTORE-01',null,'DOOR',1.00,2.10,'PROPOSED',
 'Keyed. Opened by the Storekeeper against the day list.','RESTRICTED_SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-004', thy_csz_issue('LINK','CSZ-LINK-004',14),'CSZ-SERVCORR-01','CSZ-COLDSTORE-01',null,'DOOR',1.10,2.10,'PROPOSED',
 'Three steps down. Loads come down by hand, not by barrow.','RESTRICTED_SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-005', thy_csz_issue('LINK','CSZ-LINK-005',15),'CSZ-SERVCORR-01','CSZ-LARDER-01',null,'DOOR',1.00,2.10,'PROPOSED',
 'The larder''s load door. Whole carcases come this way, not through the hatch.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-006', thy_csz_issue('LINK','CSZ-LINK-006',16),'CSZ-SERVCORR-01','CSZ-HERBSTORE-01',null,'DOOR',0.95,2.10,'PROPOSED',
 'Herb only. Nothing wet passes this door.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-007', thy_csz_issue('LINK','CSZ-LINK-007',17),'CSZ-SERVCORR-01','CSZ-BAKEHOUSE-01',null,'DOOR',1.20,2.20,'PROPOSED',
 'Flour in, ash out, both this way rather than through the kitchen.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-008', thy_csz_issue('LINK','CSZ-LINK-008',18),'CSZ-SERVCORR-01','CSZ-KITCHEN-01',null,'DOUBLE_DOOR',1.80,2.40,'PROPOSED',
 'The issue door. Clean goods in; nothing dirty returns through it.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-009', thy_csz_issue('LINK','CSZ-LINK-009',19),'CSZ-SERVCORR-01','CSZ-SCULLERY-01',null,'DOOR',1.10,2.10,'PROPOSED',
 'Clean ware out to store. Dirty ware never enters the corridor.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-010', thy_csz_issue('LINK','CSZ-LINK-010',20),'CSZ-SERVCORR-01','CSZ-STAFFLINK-01',null,'DOOR',0.95,2.10,'PROPOSED',
 'People only. No goods, no waste, no ware.','SECURE',false,'576 PROPOSED',null),
('CSZ-LINK-011', thy_csz_issue('LINK','CSZ-LINK-011',21),'CSZ-KITCHEN-01','CSZ-SCULLERY-01',null,'DOUBLE_DOOR',1.60,2.30,'PROPOSED',
 'The dirty-return door. One-way in practice: dirty in, and clean ware goes back by the corridor, not back across this threshold mid-service.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-012', thy_csz_issue('LINK','CSZ-LINK-012',22),'CSZ-KITCHEN-01','CSZ-BAKEHOUSE-01',null,'ARCH',1.40,2.40,'PROPOSED',
 'Open arch. Bread comes through; flour dust does not, because the bins sit at the far wall.','SERVICE',true,'576 PROPOSED',null),
('CSZ-LINK-013', thy_csz_issue('LINK','CSZ-LINK-013',23),'CSZ-KITCHEN-01','CSZ-LARDER-01',null,'HATCH',0.90,1.10,'PROPOSED',
 'Issue hatch, counter at about 0.95 m. Cut and portioned goods only. A whole carcase does NOT fit and must go by CSZ-LINK-005 and CSZ-LINK-008.','SERVICE',true,'576 PROPOSED',
 'This is the one deliberate physical limit in the slice, recorded rather than wished away.'),
('CSZ-LINK-014', thy_csz_issue('LINK','CSZ-LINK-014',24),'CSZ-KITCHEN-01',null,'SERVICE STAIR TO HOUSEHOLD DINING (outside this slice)','STAIR',null,null,'UNKNOWN',
 'Outward only, finished dishes. The far end is not resolved by this work.','RESTRICTED_SERVICE',false,'576 PROPOSED',
 'Deliberately left UNKNOWN. The dining end belongs to a room this slice does not resolve.'),
('CSZ-LINK-015', thy_csz_issue('LINK','CSZ-LINK-015',25),'CSZ-SCULLERY-01',null,'WASH YARD AND DRAIN (outside this slice)','DOOR',1.00,2.10,'PROPOSED',
 'Water and slops out. Nothing edible passes.','SERVICE',false,'576 PROPOSED',null),
('CSZ-LINK-016', thy_csz_issue('LINK','CSZ-LINK-016',26),'CSZ-HERBSTORE-01',null,'DRYING LOFT (within this room''s envelope, over)','STAIR',0.80,1.00,'PROPOSED',
 'Hatch and ladder. Bunches up, stripped leaf down.','SERVICE',true,'576 PROPOSED',
 'Recorded as a vertical link inside one envelope, not as a separate room, so the loft cannot drift into being a second space.'),
('CSZ-LINK-017', thy_csz_issue('LINK','CSZ-LINK-017',27),'CSZ-RECEIVING-01',null,'WASTE YARD SORT BAYS (outside this slice)','DOOR',1.40,2.20,'PROPOSED',
 'Outward only, sorted waste. Waste does not re-enter.','SERVICE',true,'576 PROPOSED',null),
('CSZ-LINK-018', thy_csz_issue('LINK','CSZ-LINK-018',28),'CSZ-BAKEHOUSE-01',null,'ASH YARD (outside this slice)','DOOR',0.90,2.00,'PROPOSED',
 'Ash out, cold, in a lidded box. Never through the kitchen.','SERVICE',true,'576 PROPOSED',null),
('CSZ-LINK-019', thy_csz_issue('LINK','CSZ-LINK-019',29),'CSZ-STAFFLINK-01',null,'STAFF QUARTERS ABOVE (outside this slice)','STAIR',null,null,'UNKNOWN',
 'People only. Lockable from the quarters side.','SECURE',false,'576 PROPOSED',
 'Geometry withheld and unknown: storey height belongs to THY-WORK-CASTLE-DIMENSIONAL-TWIN-572.')
on conflict (connection_id) do nothing;

commit;

-- ============================================================== FLOWS
begin;

insert into thy_csz_flow (flow_id, serial, flow_class, title, purpose, access_class, public_safe, source_text) values
('CSZ-FLOW-FOOD-IN',  thy_csz_issue('FLOW','CSZ-FLOW-FOOD-IN',31), 'FOOD_IN','Delivery to service',
 'Delivery → receiving → weigh/check → store → issue → prep → cook → service.','SERVICE',true,'576 PROPOSED'),
('CSZ-FLOW-HERB',     thy_csz_issue('FLOW','CSZ-FLOW-HERB',32),    'HERB','Herb ground to use',
 'Ground → cut → receiving/cleaning → fresh issue → drying → dry store → kitchen → use → waste.','SERVICE',true,'576 PROPOSED'),
('CSZ-FLOW-WASH',     thy_csz_issue('FLOW','CSZ-FLOW-WASH',33),    'WASH_RETURN','Dirty return to storage',
 'Dining/service → dirty return → scullery → wash → dry → storage.','SERVICE',true,'576 PROPOSED'),
('CSZ-FLOW-WASTE',    thy_csz_issue('FLOW','CSZ-FLOW-WASTE',34),   'WASTE','Kitchen waste to its five ends',
 'Kitchen → sort → compost / animal / ash / spoiled / other.','SERVICE',true,'576 PROPOSED')
on conflict (flow_id) do nothing;

insert into thy_csz_flow_step
 (flow_id, step_no, action, from_space, to_space, external_from, external_to, via_link,
  load_text, fit_verdict, fit_reason, custodian_role, notes) values

-- ---- food in
('CSZ-FLOW-FOOD-IN',1,'DELIVERY arrives at the cart door',null,'CSZ-RECEIVING-01','OUTER DELIVERY YARD',null,'CSZ-LINK-001',
 'Loaded cart or hand barrow','FITS','Cart door proposed at 2.60 m wide × 3.20 m high; a loaded cart and its handler pass without unloading in the yard.','CSZ-ROLE-PORTER',null),
('CSZ-FLOW-FOOD-IN',2,'WEIGH and CHECK against the day list','CSZ-RECEIVING-01','CSZ-RECEIVING-01',null,null,null,
 'Individual lots at the beam scale','FITS','Weigh bench sits inside the same room as the cart standing position; no lot leaves the room before it is weighed.','CSZ-ROLE-STOREKEEPER',
 'This step is the control. Remove it and the ledger, the day list and every shortage response downstream become guesswork.'),
('CSZ-FLOW-FOOD-IN',3,'STORE — dry goods','CSZ-RECEIVING-01','CSZ-DRYSTORE-01',null,null,'CSZ-LINK-002',
 'Sacks and crocks, carried or barrowed','FITS','Corridor proposed at 2.60 m wide with a 1.80 m double door at CSZ-LINK-002 and a 1.00 m door at CSZ-LINK-003; a sack on the shoulder clears both.','CSZ-ROLE-STOREKEEPER',
 'Two links, via the corridor: receiving → corridor → dry store.'),
('CSZ-FLOW-FOOD-IN',4,'STORE — cold and wet goods','CSZ-RECEIVING-01','CSZ-COLDSTORE-01',null,null,'CSZ-LINK-004',
 'Fish, dairy, cut meat in shallow trays','FITS_WITH_CONDITION','Three steps down at CSZ-LINK-004. Condition: loads come down by hand, not by barrow, so no lot may exceed one person''s carry.','CSZ-ROLE-STOREKEEPER',null),
('CSZ-FLOW-FOOD-IN',5,'ISSUE against the day list','CSZ-DRYSTORE-01','CSZ-KITCHEN-01',null,null,'CSZ-LINK-008',
 'Measured day quantities','FITS','Issue passes corridor → kitchen through the 1.80 m double door CSZ-LINK-008; the store door is never the kitchen door.','CSZ-ROLE-STOREKEEPER',
 'Issue is a decision, not a door. The Head Cook sets the day list; the Storekeeper issues against it.'),
('CSZ-FLOW-FOOD-IN',6,'PREP at the bench line','CSZ-KITCHEN-01','CSZ-KITCHEN-01',null,null,null,
 'Working quantities on the 10 m bench','FITS','Bench line and hearth line are on opposite sides of a clear lane, so prep does not cross the fire.','CSZ-ROLE-HEAD_COOK',null),
('CSZ-FLOW-FOOD-IN',7,'COOK at hearth, range, spit or oven','CSZ-KITCHEN-01','CSZ-KITCHEN-01',null,null,null,
 'Pots, pans, cauldrons, spit loads','FITS','Bread and oven work steps aside through the 1.40 m arch CSZ-LINK-012 rather than competing for hearth frontage.','CSZ-ROLE-HEAD_COOK',null),
('CSZ-FLOW-FOOD-IN',8,'SERVICE — finished dishes leave the suite','CSZ-KITCHEN-01',null,null,'HOUSEHOLD DINING (outside this slice)','CSZ-LINK-014',
 'Dressed dishes on trays','UNVERIFIED','The stair''s clear dimensions and its far end are NOT resolved by this work. Recording this as FITS would be an invention.','CSZ-ROLE-HEAD_COOK',
 'The one honestly unverified step in the food path.'),

-- ---- herb
('CSZ-FLOW-HERB',1,'CUT at the herb ground',null,null,'HERB GROUND (outside this slice)','HERB GROUND (outside this slice)',null,
 'Cut stems into a flat basket','FITS','Outside the built slice; no opening is involved.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',2,'CARRY IN to receiving',null,'CSZ-RECEIVING-01','HERB GROUND (outside this slice)',null,'CSZ-LINK-001',
 'Flat baskets','FITS','Enters by the same weighed door as every other incoming good. Herb is not exempt from the weigh step.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',3,'CLEAN and SORT into two lots','CSZ-RECEIVING-01','CSZ-RECEIVING-01',null,null,null,
 'Cut herb, wet','FITS','Cleaning needs water; receiving has the only wash-down point on the incoming side. The herb store has no water, deliberately.','CSZ-ROLE-HERB_KEEPER',
 'Two lots leave this step: a fresh-issue lot and a drying lot. They never travel together again.'),
('CSZ-FLOW-HERB',4,'FRESH ISSUE to the kitchen','CSZ-RECEIVING-01','CSZ-KITCHEN-01',null,null,'CSZ-LINK-008',
 'One day''s fresh herb','FITS','Receiving → corridor → kitchen. No direct receiving-to-herb-store door exists and none is proposed.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',5,'DRYING lot to the loft','CSZ-RECEIVING-01','CSZ-HERBSTORE-01',null,null,'CSZ-LINK-006',
 'Bunched stems','FITS','Receiving → corridor → herb store (0.95 m door), then up the hatch CSZ-LINK-016 at 0.80 m × 1.00 m; a bunch passes, a crate does not.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',6,'DRY on the loft rails','CSZ-HERBSTORE-01','CSZ-HERBSTORE-01',null,null,null,
 'Hanging bunches','FITS','Through-draught above, no fire in the room. Drying is the whole reason this room has no hearth.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',7,'STRIP into crocks in the dry store below','CSZ-HERBSTORE-01','CSZ-HERBSTORE-01',null,null,null,
 'Stripped leaf into lidded crocks','FITS','Loft to floor below through the same hatch; stalk waste stays in a sack for the waste path.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',8,'ISSUE dry herb to the kitchen day crock','CSZ-HERBSTORE-01','CSZ-KITCHEN-01',null,null,'CSZ-LINK-008',
 'A day''s measure into the day crock','FITS','Herb store → corridor → kitchen. Nothing wet crosses CSZ-LINK-006 in either direction.','CSZ-ROLE-HERB_KEEPER',null),
('CSZ-FLOW-HERB',9,'SPENT herb and stalk to the waste path','CSZ-KITCHEN-01','CSZ-RECEIVING-01',null,null,'CSZ-LINK-008',
 'Stalk and spent leaf','FITS','Joins CSZ-FLOW-WASTE at the sort step; herb waste is compost, never animal feed by default.','CSZ-ROLE-HERB_KEEPER',null),

-- ---- wash return
('CSZ-FLOW-WASH',1,'DIRTY RETURN from the household side',null,'CSZ-KITCHEN-01','HOUSEHOLD DINING (outside this slice)',null,'CSZ-LINK-014',
 'Used ware on trays','UNVERIFIED','Same unresolved stair as the service step. The return lands on the kitchen return table, not on the prep bench.','CSZ-ROLE-SCULLION',
 'The return table position matters: dirty ware must not touch the bench line even for a moment.'),
('CSZ-FLOW-WASH',2,'Through the dirty-return door','CSZ-KITCHEN-01','CSZ-SCULLERY-01',null,null,'CSZ-LINK-011',
 'Stacked ware, cauldrons excepted','FITS','1.60 m double door proposed, so two people pass with loaded trays in opposite directions.','CSZ-ROLE-SCULLION',null),
('CSZ-FLOW-WASH',3,'WASH at the troughs','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,null,null,
 'Ware, pots, pans','FITS_WITH_CONDITION','The largest cauldron does not fit the proposed troughs. Condition: it is scoured in place at the kitchen hearth and never enters the scullery. Recorded, not wished away.','CSZ-ROLE-SCULLION',null),
('CSZ-FLOW-WASH',4,'RINSE and DRY on the racks','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,null,null,
 'Washed ware','FITS','Rack run sits between the troughs and the corridor door, so clean ware moves away from dirty, never back past it.','CSZ-ROLE-SCULLION',null),
('CSZ-FLOW-WASH',5,'STORAGE — clean ware back to its home','CSZ-SCULLERY-01','CSZ-KITCHEN-01',null,null,'CSZ-LINK-009',
 'Dry, clean ware','FITS','Returns by the corridor (CSZ-LINK-009 then CSZ-LINK-008), NOT back through the dirty-return door. One-way wash line.','CSZ-ROLE-SCULLION',
 'This is why the scullery needs two doors. With one, clean and dirty share a threshold.'),

-- ---- waste
('CSZ-FLOW-WASTE',1,'Waste leaves the kitchen in separated pails','CSZ-KITCHEN-01','CSZ-RECEIVING-01',null,null,'CSZ-LINK-008',
 'Five pails, separated at source','FITS','Separated at the bench, not at the yard. Sorting a mixed pail later is the step that never actually happens.','CSZ-ROLE-SCULLION',null),
('CSZ-FLOW-WASTE',2,'SORT and check at receiving','CSZ-RECEIVING-01','CSZ-RECEIVING-01',null,null,null,
 'Five streams confirmed','FITS','Sorted beside the same gully used for wash-down, clear of the weigh bench.','CSZ-ROLE-PORTER',null),
('CSZ-FLOW-WASTE',3,'COMPOST — vegetable trim, herb stalk','CSZ-RECEIVING-01',null,null,'WASTE YARD COMPOST BAY',
 'CSZ-LINK-017','Wet vegetable waste','FITS','1.40 m waste-yard door; outward only.','CSZ-ROLE-PORTER',null),
('CSZ-FLOW-WASTE',4,'ANIMAL — permitted scraps','CSZ-RECEIVING-01',null,null,'WASTE YARD ANIMAL BAY','CSZ-LINK-017',
 'Scraps fit for stock feed','FITS','Same door, separate bay. Herb waste is excluded by default.','CSZ-ROLE-PORTER',null),
('CSZ-FLOW-WASTE',5,'ASH — from bakehouse and hearths','CSZ-BAKEHOUSE-01',null,null,'ASH YARD','CSZ-LINK-018',
 'Cold ash in a lidded iron box','FITS','Leaves by the bakehouse''s own door. Ash never crosses the kitchen or the corridor.','CSZ-ROLE-BAKER',
 'Hearth ash from the kitchen is carried to the bakehouse ash box through the arch, then out.'),
('CSZ-FLOW-WASTE',6,'SPOILED — condemned goods','CSZ-RECEIVING-01',null,null,'WASTE YARD SPOILED BAY','CSZ-LINK-017',
 'Condemned lots, recorded against the day list','FITS','Spoiled goods are weighed out as they were weighed in, so loss is a number and not a rumour.','CSZ-ROLE-STOREKEEPER',null),
('CSZ-FLOW-WASTE',7,'OTHER — breakage, sweepings, unusable','CSZ-RECEIVING-01',null,null,'WASTE YARD OTHER BAY','CSZ-LINK-017',
 'Sherds, sweepings','FITS','Kept separate so that broken ceramic never reaches compost or feed.','CSZ-ROLE-PORTER',null)
on conflict (flow_id, step_no) do nothing;

-- ============================================================== HERB RESIDENCE
insert into thy_csz_herb_state
 (herb_state_id, serial, state_name, state_order, resides_space, resides_external, resides_detail,
  herb_form, custodian_role, location_state, notes) values
('CSZ-HERB-01', thy_csz_issue('HERB','CSZ-HERB-01',41),'HERB GROUND',1,null,'HERB GROUND (outside this slice)',
 'In the bed, standing','growing','CSZ-ROLE-HERB_KEEPER','PROPOSED',
 'NATIVE_HERB_UNRESOLVED. Rosemary is the ERC functional mirror only: woody evergreen, dries well, hangs in bunches, strips to leaf.'),
('CSZ-HERB-02', thy_csz_issue('HERB','CSZ-HERB-02',42),'CUT',2,null,'HERB GROUND (outside this slice)',
 'In a flat basket set at the bed edge','cut fresh','CSZ-ROLE-HERB_KEEPER','PROPOSED',null),
('CSZ-HERB-03', thy_csz_issue('HERB','CSZ-HERB-03',43),'RECEIVING',3,'CSZ-RECEIVING-01',null,
 'On the weigh bench, in its basket, weighed like any other lot','cut fresh','CSZ-ROLE-HERB_KEEPER','PROPOSED',null),
('CSZ-HERB-04', thy_csz_issue('HERB','CSZ-HERB-04',44),'CLEANING',4,'CSZ-RECEIVING-01',null,
 'At the wash-down point; trimmed and split into a fresh-issue lot and a drying lot','cleaned','CSZ-ROLE-HERB_KEEPER','PROPOSED',
 'The only place in the herb path with water. The herb store has none, on purpose.'),
('CSZ-HERB-05', thy_csz_issue('HERB','CSZ-HERB-05',45),'FRESH ISSUE',5,'CSZ-KITCHEN-01',null,
 'In a shallow crock of water at the herb end of the prep bench','cut fresh','CSZ-ROLE-HEAD_COOK','PROPOSED',null),
('CSZ-HERB-06', thy_csz_issue('HERB','CSZ-HERB-06',46),'DRYING',6,'CSZ-HERBSTORE-01',null,
 'Bunched and hung from the loft rails, in the through-draught','drying','CSZ-ROLE-HERB_KEEPER','PROPOSED',null),
('CSZ-HERB-07', thy_csz_issue('HERB','CSZ-HERB-07',47),'DRY STORE',7,'CSZ-HERBSTORE-01',null,
 'Stripped to leaf, in lidded ceramic crocks on the raised shelf below the loft','dried','CSZ-ROLE-HERB_KEEPER','PROPOSED',null),
('CSZ-HERB-08', thy_csz_issue('HERB','CSZ-HERB-08',48),'KITCHEN / IN USE',8,'CSZ-KITCHEN-01',null,
 'In the day crock at the herb end of the prep bench — a day''s measure only, never the whole crock','dried','CSZ-ROLE-HEAD_COOK','PROPOSED',
 'The store crock stays in the herb store. Only a day measure travels, so a spilled or spoiled day costs a day.'),
('CSZ-HERB-09', thy_csz_issue('HERB','CSZ-HERB-09',49),'WASTE / COMPOST',9,null,'WASTE YARD COMPOST BAY',
 'In the compost bay, by way of the kitchen waste pail and the receiving sort','spent','CSZ-ROLE-HERB_KEEPER','PROPOSED',null)
on conflict (herb_state_id) do nothing;

commit;

-- ============================================================== OBJECT HOME MAP
begin;

insert into thy_csz_object_home
 (object_id, serial, object_name, object_class, count_text, count_state,
  home_space, home_fixture, in_use_space, wash_space, dry_space, repair_space, repair_external,
  custodian_role, location_state, access_class, public_safe, mark_present, source_text, notes) values

('CSZ-OBJ-001', thy_csz_issue('OBJECT','CSZ-OBJ-001',51),'Inés'' brown-handled knife','CUTTING_TOOL','one','DOCUMENTED',
 'CSZ-KITCHEN-01','Her own knife roll, on the numbered peg above the head of the prep bench. The roll travels with her; the peg does not.',
 'CSZ-KITCHEN-01','CSZ-KITCHEN-01','CSZ-KITCHEN-01',null,'ESTATE FORGE / GRINDING WHEEL (outside this slice)',
 'CSZ-ROLE-HEAD_COOK','PROPOSED','SERVICE',true,false,'576 PROPOSED (the knife itself is an existing fact)',
 'Washed and dried by hand at the kitchen sink, by her, and never sent to the scullery troughs. A wooden handle left in a soaking trough is how a handle is lost. This is the one object in the slice whose wash location is deliberately NOT the scullery.'),

('CSZ-OBJ-002', thy_csz_issue('OBJECT','CSZ-OBJ-002',52),'Pots','VESSEL','a working set','PROPOSED',
 'CSZ-KITCHEN-01','Pot shelf over the boiling range','CSZ-KITCHEN-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,'BRAZIER / TINSMITH (outside this slice)',
 'CSZ-ROLE-SCULLION','PROPOSED','SERVICE',true,false,'576 PROPOSED',null),

('CSZ-OBJ-003', thy_csz_issue('OBJECT','CSZ-OBJ-003',53),'Pans','VESSEL','a working set','PROPOSED',
 'CSZ-KITCHEN-01','Hanging rail along the hearth wall, within reach of the range','CSZ-KITCHEN-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,'BRAZIER / TINSMITH (outside this slice)',
 'CSZ-ROLE-SCULLION','PROPOSED','SERVICE',true,false,'576 PROPOSED',null),

('CSZ-OBJ-004', thy_csz_issue('OBJECT','CSZ-OBJ-004',54),'Cauldrons','COOKING_IRON','several, one of them the large one','PROPOSED',
 'CSZ-KITCHEN-01','On the hearth crane and on the floor beside the hearth. Too heavy to shelve; their home is where they stand.',
 'CSZ-KITCHEN-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,'ESTATE FORGE (outside this slice)',
 'CSZ-ROLE-SCULLION','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'EXCEPTION, recorded: the largest cauldron does not fit the proposed scullery troughs. It is scoured in place at the hearth and never leaves the kitchen. See CSZ-CONF-002.'),

('CSZ-OBJ-005', thy_csz_issue('OBJECT','CSZ-OBJ-005',55),'Spit and crane irons','COOKING_IRON','one spit, with its irons','PROPOSED',
 'CSZ-KITCHEN-01','Spit rack beside the range','CSZ-KITCHEN-01','CSZ-KITCHEN-01','CSZ-KITCHEN-01',null,'ESTATE FORGE (outside this slice)',
 'CSZ-ROLE-HEAD_COOK','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'Scoured hot at the hearth. A spit long enough to cross the hearth will not turn in the scullery; the room cannot take it.'),

('CSZ-OBJ-006', thy_csz_issue('OBJECT','CSZ-OBJ-006',56),'Cutlery (service-zone holding)','TABLEWARE','a holding, not the household set','PROPOSED',
 'CSZ-SCULLERY-01','Cutlery chest on the dry shelf by the corridor door','CSZ-KITCHEN-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,null,
 'CSZ-ROLE-SCULLION','PROPOSED','SERVICE',false,false,'576 PROPOSED',
 'OPEN: the household''s own cutlery store (ewery / pantry) is outside this slice and may already hold custody. Two homes for one set would be a conflict, so this row is explicitly scoped to the service-zone holding only. See CSZ-CONF-003.'),

('CSZ-OBJ-007', thy_csz_issue('OBJECT','CSZ-OBJ-007',57),'Beam scale and weights','MEASURE','one scale, one set of weights','PROPOSED',
 'CSZ-RECEIVING-01','Fixed bracket over the weigh bench; the weights in their own box','CSZ-RECEIVING-01',null,null,null,'ESTATE FORGE (outside this slice)',
 'CSZ-ROLE-STOREKEEPER','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'Never leaves receiving. A scale that travels is a scale nobody trusts. The unit of measure itself is an open Chairman decision — see CSZ-DEC-004.'),

('CSZ-OBJ-008', thy_csz_issue('OBJECT','CSZ-OBJ-008',58),'Ceramic vessels (store crocks)','CONTAINER','a shelf run','PROPOSED',
 'CSZ-DRYSTORE-01','Shelf run above the bins','CSZ-KITCHEN-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,null,
 'CSZ-ROLE-STOREKEEPER','PROPOSED','RESTRICTED_SERVICE',false,false,'576 PROPOSED',
 'The lidded herb crocks are a distinct lot with their own home in the herb store, recorded at CSZ-OBJ-009, so that neither lot has two homes.'),

('CSZ-OBJ-009', thy_csz_issue('OBJECT','CSZ-OBJ-009',59),'Herb crocks and herb baskets','CONTAINER','crocks on the shelf, baskets stacked below','PROPOSED',
 'CSZ-HERBSTORE-01','Raised shelf for the lidded crocks; the flat baskets stacked beneath it by the door',
 'CSZ-RECEIVING-01','CSZ-RECEIVING-01','CSZ-RECEIVING-01',null,'BASKETMAKER / POTTER (outside this slice)',
 'CSZ-ROLE-HERB_KEEPER','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'Baskets are washed where the herb is cleaned — receiving — because the herb store has no water. A wet basket never goes back up to the loft.'),

('CSZ-OBJ-010', thy_csz_issue('OBJECT','CSZ-OBJ-010',60),'Ledger and day list','RECORD','one board, one ledger box','PROPOSED',
 'CSZ-KITCHEN-01','Day-list board by the corridor door; the ledger box on the shelf beneath it','CSZ-KITCHEN-01',null,null,null,null,
 'CSZ-ROLE-HEAD_COOK','PROPOSED','SERVICE',false,false,'576 PROPOSED',
 'Withheld from the public sheet: a day list states what the household is eating and when, which is household intelligence. Authority note: the Head Cook sets it; in her absence the Deputy Cook holds it.'),

('CSZ-OBJ-011', thy_csz_issue('OBJECT','CSZ-OBJ-011',61),'Aprons','GARMENT','one worn, one spare, per working person','PROPOSED',
 'CSZ-KITCHEN-01','Apron pegs inside the corridor door, one peg per person; the spare apron hangs on the same peg',
 'CSZ-KITCHEN-01',null,null,null,'LAUNDRY (outside this slice, location UNKNOWN)',
 'CSZ-ROLE-HEAD_COOK','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'Wash location is outside this slice and genuinely unknown. Recorded as UNKNOWN rather than invented — see CSZ-UNK-005.'),

('CSZ-OBJ-012', thy_csz_issue('OBJECT','CSZ-OBJ-012',62),'Shoes','FOOTWEAR','outdoor pair and kitchen pair','PROPOSED',
 'CSZ-STAFFLINK-01','Shoe shelf in the staff-link lobby. Outdoor shoes are left here and kitchen shoes taken up.',
 'CSZ-KITCHEN-01',null,null,null,'CORDWAINER (outside this slice)',
 'CSZ-ROLE-HEAD_COOK','PROPOSED','SERVICE',false,false,'576 PROPOSED',
 'The change point exists so that yard mud does not reach the kitchen floor. Under residence models B and C the outdoor pair arrives already worn from a road, which changes the shelf from a convenience into a requirement.'),

('CSZ-OBJ-013', thy_csz_issue('OBJECT','CSZ-OBJ-013',63),'Drying racks','FURNITURE','two in the scullery','PROPOSED',
 'CSZ-SCULLERY-01','Between the rinse trough and the corridor door','CSZ-SCULLERY-01','CSZ-SCULLERY-01','CSZ-SCULLERY-01',null,'ESTATE CARPENTER (outside this slice)',
 'CSZ-ROLE-SCULLION','PROPOSED','SERVICE',true,false,'576 PROPOSED',
 'The herb loft rails are fixed fabric of CSZ-HERBSTORE-01, not movable racks, and are not counted here.')
on conflict (object_id) do nothing;

-- ============================================================== WARDROBE / LAUNDRY
insert into thy_csz_wardrobe
 (wardrobe_id, serial, person_role, garment_kind, work_storage_space, work_storage_fixture,
  personal_storage_note, residence_dependent, laundry_path, mending_location, shoe_repair_location,
  location_state, access_class, public_safe, source_text) values
('CSZ-WARD-01', thy_csz_issue('WARDROBE','CSZ-WARD-01',81),'CSZ-ROLE-HEAD_COOK','WORK_DRESS','CSZ-STAFFLINK-01',
 'Numbered hook and shelf in the staff-link lobby, changed into at the start of the day',
 'Under model A, in her own room. Under B and C, at her residence — which means the work dress either travels daily or lives at the castle. That choice belongs to the residence decision, not to this row.',
 true,'Soiled work dress → staff-link basket → laundry (outside this slice) → returned to the same numbered hook.',
 'Laundry / mending (outside this slice)','CORDWAINER (outside this slice)','PROPOSED','SERVICE',false,'576 PROPOSED; connects THY-WORK-INES-LIFE-ECONOMY-575'),
('CSZ-WARD-02', thy_csz_issue('WARDROBE','CSZ-WARD-02',82),'CSZ-ROLE-HEAD_COOK','APRON','CSZ-KITCHEN-01',
 'Her peg inside the kitchen corridor door','Not personal property in the ordinary sense; the apron stays in the kitchen.',
 false,'Daily or on soiling → staff-link basket → laundry → back to her peg.','Laundry / mending (outside this slice)','n/a','PROPOSED','SERVICE',true,'576 PROPOSED; connects 575'),
('CSZ-WARD-03', thy_csz_issue('WARDROBE','CSZ-WARD-03',83),'CSZ-ROLE-HEAD_COOK','SPARE_APRON','CSZ-KITCHEN-01',
 'Same peg, behind the worn one. A spare that is stored elsewhere is a spare that is not there when it is needed.',
 'n/a',false,'As the apron.','Laundry / mending (outside this slice)','n/a','PROPOSED','SERVICE',true,'576 PROPOSED; connects 575'),
('CSZ-WARD-04', thy_csz_issue('WARDROBE','CSZ-WARD-04',84),'CSZ-ROLE-HEAD_COOK','SHOES','CSZ-STAFFLINK-01',
 'Shoe shelf in the staff-link lobby','Outdoor shoes live wherever she sleeps; the kitchen pair lives on the shelf.',
 true,'Not laundered. Cleaned at the staff-link lobby.','n/a','CORDWAINER (outside this slice)','PROPOSED','SERVICE',false,'576 PROPOSED; connects 575'),
('CSZ-WARD-05', thy_csz_issue('WARDROBE','CSZ-WARD-05',85),'CSZ-ROLE-HEAD_COOK','SPARE_CLOTHING','CSZ-STAFFLINK-01',
 'Her own locked chest or shelf in the staff-link lobby — one change, kept at the castle',
 'Under model A this is redundant with her room. Under B and C it is what makes a night recall or a soaking survivable.',
 true,'Soiled → staff-link basket → laundry → chest.','Laundry / mending (outside this slice)','n/a','PROPOSED','RESTRICTED_SERVICE',false,'576 PROPOSED; connects 575'),
('CSZ-WARD-06', thy_csz_issue('WARDROBE','CSZ-WARD-06',86),'CSZ-ROLE-HEAD_COOK','PERSONAL_CLOTHING',null,null,
 'Personal clothing has NO storage inside the service zone under any model. It lives where she lives. That is the point of the distinction.',
 true,'Her own, or the household laundry if her terms include it — a 575 question, not a 576 one.',
 'Her own or the laundry (outside this slice)','CORDWAINER (outside this slice)','PROPOSED','RESTRICTED_SERVICE',false,'576 PROPOSED; connects 575')
on conflict (wardrobe_id) do nothing;

commit;

-- ============================================================== RESIDENCE MODELS
-- THREE TESTED. NONE CANONIZED. chairman_selected is false on every row, and the
-- trigger in 0004 will not let it be set except by a CHAIRMAN_AUTHORED row.
begin;

insert into thy_csz_residence_option
 (model, serial, person_role, distance_to_kitchen_m, travel_time_min, route_text, meal_arrangement,
  lodging_rent_treatment, privacy_text, personal_storage, day_off_experience, emergency_recall_min,
  security_access_effect, measurement_state, basis_text, access_class, public_safe, source_text) values

('A_CASTLE_SERVICE_APARTMENT', thy_csz_issue('RESIDENCE','A',91),'CSZ-ROLE-HEAD_COOK',
 40,1,'Her room → staff stair (CSZ-LINK-019) → staff-link lobby → CSZ-LINK-010 → service corridor → CSZ-LINK-008 → kitchen. Entirely inside the castle envelope; no outside door is crossed.',
 'Eats from the kitchen, at the service table, on the establishment. No separate food cost and no separate cooking.',
 'Lodging is part of the position. No rent moves. The room ends when the position ends — which is the cost, and it is not a small one.',
 'Lowest. She is inside the building that can call her at any hour, and the walls that hear her are the household''s walls.',
 'One room, one chest. Anything more has nowhere to go.',
 'A day off spent thirty seconds from the kitchen is not fully a day off. She will be seen, and being seen is being asked.',
 3,'Highest access, highest exposure. She holds interior night access and is inside the secure envelope permanently. That is a trust position, and it is also a standing security fact about her.',
 'PROPOSED','Distances and times are derived from the proposed corridor length (24 m) plus one stair flight. They are PROPOSED, not measured, and they move if THY-WORK-CASTLE-DIMENSIONAL-TWIN-572 sets different levels.',
 'RESTRICTED_SERVICE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED, NOT canon)'),

('B_ESTATE_COTTAGE', thy_csz_issue('RESIDENCE','B',92),'CSZ-ROLE-HEAD_COOK',
 900,12,'Cottage → estate path → outer yard → receiving cart door or a staff gate → service corridor → kitchen. One outside walk in all weather, twice a day.',
 'Eats at the kitchen while on duty; cooks for herself on days off. A real double household, with a real second fire and a real second food cost.',
 'A cottage held with the position, or held at a rent set against wage. Either way it is a tenancy, and a tenancy can be a lever. That should be decided deliberately.',
 'Real. Her door closes and the household is not behind it.',
 'A cottage''s worth. She can own things that do not fit a chest.',
 'A day off is genuinely off. She is far enough that a small problem gets solved without her — which is what a Deputy Cook is actually for.',
 20,'Moderate. She holds a gate or yard access rather than interior night access. Her entry can be logged at one point. The castle''s interior stays closed at night with her outside it.',
 'PROPOSED','Distance is an illustrative estate-scale figure, PROPOSED only. Recall assumes someone must go, wake her, and return with her.',
 'SERVICE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED, NOT canon)'),

('C_NEARBY_TOWN_RESIDENCE', thy_csz_issue('RESIDENCE','C',93),'CSZ-ROLE-HEAD_COOK',
 3200,40,'Town house → road → castle approach → outer yard → staff gate → service corridor → kitchen. Forty minutes on foot, or about fifteen by cart when a cart is going.',
 'Eats at the kitchen on duty. Entirely her own household otherwise. The establishment feeds her for the hours it owns and no more.',
 'She rents or owns in the town. The castle pays wage, not lodging. This is the only model where she is a townswoman who works at the castle rather than a castle servant who sleeps somewhere.',
 'Complete. She has a life the household cannot see.',
 'A household''s worth, with no ceiling set by the castle.',
 'A true day off. She can be genuinely unreachable, and the establishment must be able to survive that.',
 75,'Lowest access, lowest exposure — and the highest operational risk. Night recall may be blocked entirely if the gates close. She cannot hold interior night access at all, which means someone else must be able to open the stores at night.',
 'PROPOSED','Distance is an illustrative small-town figure, PROPOSED only. Recall includes sending a messenger both ways and is conditional on the gate state.',
 'SERVICE',false,'THY-WORK-KITCHEN-SUITE-RESIDENCE-576 (authored, PROPOSED, NOT canon)')
on conflict (model) do nothing;

-- ============================================================== DAY-OFF / RELIEF
insert into thy_csz_relief_matrix
 (model, serial, authority_holder, handoff_text, recall_text, recall_min, herb_control_text,
  menu_change_text, shortage_text, personal_time_text, measurement_state, access_class, public_safe, source_text) values

('A_CASTLE_SERVICE_APARTMENT', thy_csz_issue('RELIEF','A',94),'CSZ-ROLE-DEPUTY_COOK',
 'Verbal, at the day-list board, minutes before she goes. Easy — and that is the weakness: nothing is written down because nothing has to be.',
 'Three minutes. In practice she is fetched for anything, and the handoff quietly stops meaning anything.',
 3,'She keeps it in fact, whatever the handoff says. The Deputy Cook issues a day measure but will send for her over anything unusual.',
 'Changes route to her anyway. The Deputy Cook''s authority is nominal on her day off.',
 'Solved by fetching her. Fast, and it teaches the establishment nothing.',
 'Poorest of the three. Proximity erases the day off.',
 'PROPOSED','RESTRICTED_SERVICE',false,'576 PROPOSED'),

('B_ESTATE_COTTAGE', thy_csz_issue('RELIEF','B',95),'CSZ-ROLE-DEPUTY_COOK',
 'Written on the day-list board the evening before, because verbal will not survive a 12-minute gap. The distance forces the discipline.',
 'About twenty minutes: someone must walk out, wake her, and walk back with her. Used for real problems only, which is the correct threshold.',
 20,'Genuinely handed over for the day. The Deputy Cook holds the herb crock measure and records what was drawn.',
 'The Deputy Cook decides within a written standing limit; anything beyond it waits or is substituted.',
 'The Deputy Cook substitutes from store against the written day list and records the substitution. She reviews it on return.',
 'Real. Far enough not to be seen, near enough to be reached when it truly matters.',
 'PROPOSED','SERVICE',false,'576 PROPOSED'),

('C_NEARBY_TOWN_RESIDENCE', thy_csz_issue('RELIEF','C',96),'CSZ-ROLE-DEPUTY_COOK',
 'Fully written, and it must cover the whole day including the unexpected, because there is no asking. This is the most robust handoff and the most work to produce.',
 'About seventy-five minutes, and conditional: if the gates are shut, effectively not at all. The establishment must be built to not need her.',
 75,'Fully devolved for the day, including store access. That means the Deputy Cook must hold a store key on her days off — a real security consequence of a residence choice.',
 'The Deputy Cook decides, within a standing written limit, and owns the outcome.',
 'Must be solved without her: substitute, reduce, or tell the household. The establishment either has that capacity or it does not, and this model reveals which.',
 'Complete. She is genuinely off duty, which is the strongest argument for this model and the strongest argument against it.',
 'PROPOSED','SERVICE',false,'576 PROPOSED')
on conflict (model) do nothing;

commit;

-- ============================================================== BRANDING
begin;

insert into thy_csz_brand_mark (mark_id, serial, subject_kind, subject_id, brand_name, relationship, relationship_note, in_world, source_text) values
('CSZ-MARK-01', thy_csz_issue('MARK','CSZ-MARK-01',101),'SHEET','thy_csz_public_world_sheet','THYLORA','PUBLISHED_BY',
 'THYLORA publishes the public-safe world sheet. This is a real publishing relationship over a record, not a mark on anything inside EdereAirah.',false,'576'),
('CSZ-MARK-02', thy_csz_issue('MARK','CSZ-MARK-02',102),'RECORD','WR-CASTLE-SERVICE-ZONE-576','THYLORA','PUBLISHED_BY',
 'THYLORA publishes the workroom record and this schema delta.',false,'576'),
('CSZ-MARK-03', thy_csz_issue('MARK','CSZ-MARK-03',103),'OBJECT','ALL_OBJECTS_IN_THIS_SLICE','THYLORA','NONE_PRESENT',
 'No object in the royal kitchen suite carries a THYLORA, ERSATZREALITY or VYC2ST mark. Not one. A mark on a castle pot would be a decorative mark with no real relationship behind it, which is exactly what is not permitted.',false,'576')
on conflict (mark_id) do nothing;

-- ============================================================== QYRIS
insert into thy_csz_qyris (entry_id, field, subject, body) values
('CSZ-QYRIS-001','QUESTION','Backend read',
 'The order was to read backend through sequence 576 first. Could the backend actually be read from this session?'),
('CSZ-QYRIS-002','YIELD','Backend read',
 'No. The egress policy denied CONNECT to jvsdxhrfhtlgaknhjxlz.supabase.co with 403, three attempts, all six canon tables. Sequence 576 was NOT read. Nothing in this delta may be quoted as confirming or contradicting what canon already holds.'),
('CSZ-QYRIS-003','REASON','Dimension states',
 'Because canon could not be read, no dimension in this slice can honestly carry DOCUMENTED. Every one is PROPOSED, and the schema refuses to let a PROPOSED row claim DOCUMENTED while citing this work as its source.'),
('CSZ-QYRIS-004','INSPECT','Physical fit',
 'Every flow step carries a fit verdict against a named link. Three are not clean: the larder hatch cannot pass a whole carcase, the largest cauldron cannot enter the scullery trough, and the service stair to dining is UNVERIFIED because its far end is outside this slice. All three are recorded rather than smoothed over.'),
('CSZ-QYRIS-005','SAFEGUARD','Second geometry system',
 'thy_csz_* is an intake ledger, not geometry truth. thy_csz_project_spaces() writes into thylora_castle_space_geometry only when that table exists and matches; when it is absent the function REFUSES and says so rather than creating a rival table.'),
('CSZ-QYRIS-006','SAFEGUARD','Canonization',
 'No residence model is selected. A unique partial index plus a trigger make selection possible only through a CHAIRMAN_AUTHORED row. Three models are tested; none is canon.'),
('CSZ-QYRIS-007','SAFEGUARD','Invented people and makers',
 'Two occupants only, both given: Inés as Head Cook, and the existing Deputy Cook relief. Every other custodian is an unoccupied role slot. No maker, supplier or craftsman is named anywhere; repair destinations are recorded as functional places outside this slice.'),
('CSZ-QYRIS-008','SAFEGUARD','Native names',
 'Ten native-name slots are held open as UNKNOWN, not filled. Inventing EdereAirah room names to satisfy a template would be canon forgery. ERC mirrors are recorded separately and labelled as mirrors.'),
('CSZ-QYRIS-009','SAFEGUARD','Public sheet',
 'The public view exposes no dimension column and no adjacency row at all. The corridor, the dry store and the staff link are withheld entirely; a constraint makes a RESTRICTED_SERVICE or SECURE row publishable-flagged impossible rather than merely discouraged.'),
('CSZ-QYRIS-010','INSPECT','No teleporting',
 'thy_csz_teleport_report() returns every declared object move that no recorded link can carry. An empty result is the passing state, and the validation suite asserts it.')
on conflict (entry_id) do nothing;

-- ============================================================== CONFLICTS
insert into thy_csz_conflict (conflict_id, subject_kind, subject_id, statement_a, statement_b, resolution, blocks_canon) values
('CSZ-CONF-001','WORK','THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
 'The order requires reading backend through sequence 576 before building.',
 'The backend host was unreachable from this session (egress 403), so sequence 576 was not read.',
 'OPEN — proceeded in intake-only mode. Nothing was projected into canon. Resolve by running thy_csz_canon_probe() from a session with backend egress.',true),
('CSZ-CONF-002','OBJECT','CSZ-OBJ-004',
 'All cooking vessels are washed in the scullery.',
 'The largest cauldron does not fit the proposed scullery troughs.',
 'RESOLVED — the large cauldron is scoured in place at the kitchen hearth and never enters the scullery. Recorded on the object row and in the wash flow as FITS_WITH_CONDITION.',false),
('CSZ-CONF-003','OBJECT','CSZ-OBJ-006',
 'Cutlery is homed in the scullery cutlery chest.',
 'The household ewery or pantry, outside this slice, may already hold custody of the household cutlery.',
 'OPEN — the row is scoped to a service-zone holding only. One set may not have two homes.',true),
('CSZ-CONF-004','SPACE','CSZ-HERBSTORE-01',
 'The herb path requires cleaning with water.',
 'The herb store has no water, deliberately, because fire and damp near hanging dry herb are the two hazards it is shaped against.',
 'RESOLVED — cleaning happens at the receiving wash-down point. The herb store receives only clean, already-trimmed stems.',false),
('CSZ-CONF-005','SPACE','CSZ-COLDSTORE-01',
 'The cold store floor sits about 0.90 m below corridor level.',
 'Site levels belong to THY-WORK-CASTLE-DIMENSIONAL-TWIN-572 and were not read.',
 'OPEN — the sunken floor is PROPOSED and conditional on 572. If 572 fixes a level that forbids it, the cooling strategy changes, not the room''s function.',true)
on conflict (conflict_id) do nothing;

-- ============================================================== UNKNOWNS
insert into thy_csz_unknown (unknown_id, subject_kind, subject_id, question, why_it_matters, who_can_close) values
('CSZ-UNK-001','NAME','ALL TEN SPACES','What are the EdereAirah native names of these ten rooms?',
 'EdereAirah is first authority. Until these are resolved, every room in this slice is carrying an ERC mirror label as a handle, which is a temporary state and must not become the world name.','thylora_mirror_name_registry, or Chairman'),
('CSZ-UNK-002','HERB','NATIVE_HERB_UNRESOLVED','Which native herb is the one this suite actually dries and stores?',
 'Rosemary is carried only as a functional mirror. The real plant determines drying time, loft dwell, crock life and the waste stream.','Chairman, or an existing world record'),
('CSZ-UNK-003','SPACE','HOUSEHOLD DINING','Where does the service stair from the kitchen actually land?',
 'The last step of the food path and the first step of the wash-return path are both UNVERIFIED without it. The suite is connected on the service side and open-ended on the household side.','THY-WORK-CASTLE-DIMENSIONAL-TWIN-572'),
('CSZ-UNK-004','SPACE','STAFF QUARTERS','What is the storey height and plan above the staff link?',
 'Residence model A is unpriceable in space terms without it, and the stair geometry cannot be proposed responsibly.','THY-WORK-CASTLE-DIMENSIONAL-TWIN-572'),
('CSZ-UNK-005','SPACE','LAUNDRY','Where is the laundry, and does it serve staff work garments?',
 'Six wardrobe rows terminate in an unlocated laundry. The garment path is complete inside this slice and open outside it.','THY-WORK-INES-LIFE-ECONOMY-575'),
('CSZ-UNK-006','PERSON','CSZ-ROLE-DEPUTY_COOK','Who is the Deputy Cook?',
 'The relief fact is used throughout the day-off comparison. The role is real; the person is not named, and will not be invented here.','thylora_person_world_sheet, or Chairman'),
('CSZ-UNK-007','MEASURE','UNIT SYSTEM','Does EdereAirah measure in metres, or in a native unit?',
 'Every dimension in this slice is stated in metres, which is an ERC unit. If a native unit exists, all of it is a translation and should be re-expressed before anything is canonized.','Chairman'),
('CSZ-UNK-008','SERVICE','WATER','Where does the standpipe water come from, and does it run in winter?',
 'The kitchen sink, the cold store trough and the receiving wash-down all assume piped water. If it is carried instead, the receiving room and the herb-cleaning step change shape.','Chairman, or an existing world record')
on conflict (unknown_id) do nothing;

-- ============================================================== CHAIRMAN DECISIONS
insert into thy_csz_chairman_decision (decision_id, subject_kind, subject_id, exact_question, options_text, default_if_silent) values
('CSZ-DEC-001','RESIDENCE','CSZ-RESIDENCE','Which residence model is Inés''s, if any?',
 'A castle service apartment (3-minute recall, no privacy, no rent, day off erased) / B estate cottage (20-minute recall, real privacy, tenancy question, written handoff) / C town residence (75-minute conditional recall, complete privacy, Deputy Cook must hold a store key).',
 'No model is selected. All three stay live and the slice stays honest about it.'),
('CSZ-DEC-002','NAME','ALL SPACES','Are the EdereAirah native names to be drawn from the mirror registry, or authored by the Chairman?',
 'Resolve from thylora_mirror_name_registry / Chairman authors them / leave open.',
 'Left open as UNKNOWN. No name is invented.'),
('CSZ-DEC-003','HERB','NATIVE_HERB','Which native herb replaces the rosemary mirror?',
 'Name it / keep the mirror as a functional stand-in and mark it clearly / defer.',
 'Kept as NATIVE_HERB_UNRESOLVED with rosemary labelled an ERC mirror.'),
('CSZ-DEC-004','MEASURE','UNIT SYSTEM','Metres, or a native unit of measure?',
 'Metres as canon / a native unit, with all proposed figures re-expressed / decide later, before anything is canonized.',
 'Metres, explicitly flagged as an ERC unit, with every figure PROPOSED.'),
('CSZ-DEC-005','BRAND','VYC2ST / ERSATZREALITY','What is the exact real relationship of VYC2ST and ERSATZREALITY to these records?',
 'MADE_BY / OWNED_BY / SUPPLIED_BY / PUBLISHED_BY / COMMISSIONED_BY / EMPLOYED_BY, or none.',
 'Not asserted. Only THYLORA PUBLISHED_BY is recorded, because that one is known. Guessing the others would be exactly the decorative mark the rule forbids.'),
('CSZ-DEC-006','SECURITY','CSZ-ROLE-DEPUTY_COOK','Under models B and C, may the Deputy Cook hold a store key on the Head Cook''s days off?',
 'Yes, standing / yes, issued per day / no, and the establishment accepts the shortage risk instead.',
 'Recorded as a consequence of the residence choice, not decided here.')
on conflict (decision_id) do nothing;

-- ============================================================== RESTART POINT
insert into thy_csz_restart_point (restart_id, work_code, state_text, next_action, blocked_by) values
('CSZ-RESTART-001','THY-WORK-KITCHEN-SUITE-RESIDENCE-576',
 'Ten service-zone spaces, nineteen links, four flows with thirty-one steps, nine herb residence states, thirteen object home rows, six wardrobe rows, three residence models and three relief rows are authored as INTAKE. All dimensions are PROPOSED. Nothing is projected into canon. Nothing is published.',
 'From a session with backend egress: run thy_csz_canon_probe(), then thy_csz_resolve_native_name() for all ten spaces, then reconcile PROPOSED dimensions against whatever thylora_castle_space_geometry already holds, then bring CSZ-DEC-001 to the Chairman.',
 'Backend egress (403 to jvsdxhrfhtlgaknhjxlz.supabase.co) and the eight open unknowns.')
on conflict (restart_id) do nothing;

commit;
