-- 0014 · Era profiles, vehicle classes, communication channels, and the
--        authoritative run THY-TIME-RUN-001 (1700s road lane).
-- Exact event years stay OPEN until sealed for a run.

begin;

insert into thytr_era_profile
  (era_code, era_label, era_span_note, years_sealed, law_regime, law_summary,
   law_enforcement_note, money_unit, money_minor_per_unit, money_note,
   travel_modes, road_condition_note, tech_ceiling_code, tech_ceiling_note)
values
  ('1700S','The 1700s road era','Exact years open until sealed for a run', false,
   'LOCAL_AND_PARISH',
   'Law is local, personal and unevenly applied. A magistrate, a parish, a landowner or a town corporation may each be the operative authority within a day''s travel of each other.',
   'Enforcement is by local officers who are often also neighbours, creditors or interested parties. Corruption exists and is recorded rather than pretended away.',
   'ERA_COIN', 240, 'Integer minor units. Local rates vary between market towns and must be converted at a recorded rate, never assumed.',
   array['BUGGY','CART','WAGON','RIDDEN_HORSE','ON_FOOT','RIVER_BOAT','FERRY'],
   'Unmetalled for most of the route. Rain governs the road more than distance does. Fords are seasonal and local advice outranks the map.',
   'PREINDUSTRIAL',
   'Animal, human, wind and water power. Hand tools, forge, timber, leather, rope. Nothing later-era functions.'),

  ('HISTORIC_EGYPT','Historic Egypt', 'Exact years open until sealed for a run', false,
   'ROYAL_AND_TEMPLE',
   'Authority runs through royal administration and temple establishment. Access is granted, not assumed.',
   'Local officials hold real discretion. The Run enters as a guest of the era, never as an inspector of it.',
   'ERA_MEASURE', 100, 'Weight-and-measure reckoning rather than coin in the later sense. Conversion is recorded in full.',
   array['RIDDEN_HORSE','CHARIOT','RIVER_BOAT','ON_FOOT','PACK_ANIMAL'],
   'River and desert route conditions govern. Water is the route.',
   'ANCIENT',
   'Animal, human, wind and water power. Nothing later-era functions.'),

  ('MOTOR','The motor era','Exact years open until sealed for a run', false,
   'CODIFIED_STATE',
   'Codified national and municipal law, licensing, registration and insurance.',
   'Enforcement is institutional. Corruption still exists and is still recorded.',
   'ERA_CURRENCY', 100, 'Integer minor units.',
   array['MOTOR_CAR','LORRY','MOTORCYCLE','RAIL','RIDDEN_HORSE','ON_FOOT'],
   'Mixed surfaced and unsurfaced roads, changing road systems, service stations at intervals.',
   'MOTOR',
   'Internal combustion, early electrics, wired and broadcast communication as the sealed years allow. Nothing beyond the sealed year functions.'),

  ('DISASTER_LANE','Disaster response lane','Runs inside whichever era is sealed', false,
   'EMERGENCY_LOCAL',
   'Whatever authority is actually functioning at the time of the emergency, which may be the community itself.',
   'The Run takes direction from local response, never command of it.',
   'ERA_COIN', 240, 'Inherits the sealed era''s unit.',
   array['ANY_ERA_AVAILABLE'],
   'Assume the route is damaged. Assume the bridge is gone.',
   'ERA_INHERITED',
   'Inherits the ceiling of the era it runs inside. Emergency does not raise the ceiling.')
on conflict (era_code) do nothing;

insert into thytr_vehicle_class
  (class_code, class_label, era_code, motive_power, crew_required, animals_required, load_note, award_eligible)
values
  ('VC-BUGGY-LIGHT','Light buggy','1700S','ANIMAL',1,1,'Two persons and light baggage. Fast on good road, first to fail on bad.',true),
  ('VC-BUGGY-PAIR','Pair-horse buggy','1700S','ANIMAL',1,2,'Four persons or two and a load. The working vehicle of the lane.',true),
  ('VC-WAGON-FREIGHT','Freight wagon','1700S','ANIMAL',2,4,'Bulk supply, fodder, timber, materials for help orders.',true),
  ('VC-CARAVAN-REPAIR','Repair caravan','1700S','ANIMAL',2,2,'Forge, wheel stock, axles, timber, leather. Serves host communities as well as the team.',true),
  ('VC-CART-WATER','Water and feed cart','1700S','ANIMAL',1,1,'Water barrels and fodder. Sets the real pace of the run.',true),
  ('VC-CART-KITCHEN','Kitchen cart','1700S','ANIMAL',1,1,'Feeds crew, and shares at the host table where welcome.',true),
  ('VC-CART-MEDICAL','Medical cart','1700S','ANIMAL',1,1,'Era-available care, a covered space, a stretcher bed. Also serves as the recovery transit vehicle.',false),
  ('VC-RIDDEN','Ridden horse','1700S','ANIMAL',1,1,'Runners, scouts, couriers.',true),
  ('VC-CHARIOT','Chariot','HISTORIC_EGYPT','ANIMAL',1,2,'Show and short-route work.',true),
  ('VC-RIVER-BOAT','River boat','HISTORIC_EGYPT','WIND',2,0,'The route is the river.',true),
  ('VC-MOTOR-TOURER','Motor tourer','MOTOR','MOTOR',1,0,'Crew and light load.',true),
  ('VC-MOTOR-LORRY','Motor lorry','MOTOR','MOTOR',2,0,'Freight, materials, recovery.',true)
on conflict (class_code) do nothing;

insert into thytr_comm_channel (channel_code, era_code, channel_label, channel_kind, typical_delay_note, available) values
  ('CH-RIDER-1700','1700S','Mounted runner','RIDER','Hours to a day, weather permitting. The fastest thing the team owns.',true),
  ('CH-NOTE-1700','1700S','Written note by hand','WRITTEN_NOTE','Carried by whoever is going that way. Unreliable and normal.',true),
  ('CH-POST-1700','1700S','Town post','TOWN_POST','Days. Only where a post exists.',true),
  ('CH-BELL-1700','1700S','Church bell','CHURCH_BELL','Immediate, local, and only says that something has happened.',true),
  ('CH-VOICE-1700','1700S','Spoken word','VOICE','Immediate. The main channel, and the one the record most often misses.',true),
  ('CH-TEL-MOTOR','MOTOR','Telegraph or telephone','TELEPHONE','Minutes to hours where a line reaches.',true)
on conflict (channel_code) do nothing;

-- ---------------------------------------------------------------------------
-- THY-TIME-RUN-001 · the authoritative run
-- ---------------------------------------------------------------------------
insert into thytr_run (run_code, run_title, era_code, registry_ref, run_state)
values ('THY-TIME-RUN-001','Time Run 001 · the 1700s road lane','1700S','THY-TIME-RUN-001','PREPARING')
on conflict (run_code) do nothing;

insert into thytr_team (team_code, run_code, team_label, team_size_planned, team_state) values
  ('THY-TIME-RUN-001-TEAM-A','THY-TIME-RUN-001','Team A',18,'FORMING'),
  ('THY-TIME-RUN-001-TEAM-B','THY-TIME-RUN-001','Team B',18,'FORMING'),
  ('THY-TIME-RUN-001-TEAM-C','THY-TIME-RUN-001','Team C',14,'FORMING')
on conflict (team_code) do nothing;

-- Seven vehicles per full team. Slots only; no personal names anywhere.
insert into thytr_vehicle (vehicle_code, run_code, team_code, class_code, vehicle_role) values
  ('THY-TIME-RUN-001-A-V1','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-BUGGY-PAIR','LEAD'),
  ('THY-TIME-RUN-001-A-V2','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-BUGGY-LIGHT','PASSENGER'),
  ('THY-TIME-RUN-001-A-V3','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-WAGON-FREIGHT','FREIGHT'),
  ('THY-TIME-RUN-001-A-V4','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-CARAVAN-REPAIR','REPAIR_CARAVAN'),
  ('THY-TIME-RUN-001-A-V5','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-CART-WATER','FEED_AND_WATER'),
  ('THY-TIME-RUN-001-A-V6','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-CART-KITCHEN','KITCHEN'),
  ('THY-TIME-RUN-001-A-V7','THY-TIME-RUN-001','THY-TIME-RUN-001-TEAM-A','VC-CART-MEDICAL','MEDICAL')
on conflict (vehicle_code) do nothing;

insert into thytr_repair_caravan
  (vehicle_code, carries_spare_wheels, carries_spare_axles, carries_forge, carries_timber, carries_leather)
values ('THY-TIME-RUN-001-A-V4', 4, 2, true, true, true)
on conflict do nothing;

commit;
