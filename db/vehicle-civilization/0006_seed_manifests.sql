-- The first three build manifests.
-- Manifest B extends the existing CNW-CONCEPT-009 / ER-AUTO-BS-009 record.
-- It does not create a second flagship van.

begin;

insert into er_civ_manifest
(manifest_code, manifest_letter, working_title, name_state, extends_canonical_id, brand_placement_state,
 mission, hard_package, structure, energy, safety, repairability, modules, open_gaps, blockers,
 design_gate_state, state, provenance) values

('ERCIV-MANIFEST-A','A','Orin Fen — blue compact hatch','PROPOSED_PENDING_CHAIRMAN',null,'PENDING_CHAIRMAN',
 'An affordable, repairable, upright compact hatch for a first-time or older driver. Functionally comparable to an early-1980s people''s hatchback in role and honesty, and completely original in form, structure and identity. This vehicle belongs to the Oakfield Earth-mirror protagonist until the EdereAriah town receives its final original name.',
 '{
   "length_mm":3820,"width_mm":1660,"height_mm":1455,"wheelbase_mm":2430,
   "track_front_mm":1455,"track_rear_mm":1440,
   "front_overhang_mm":760,"rear_overhang_mm":630,
   "kerb_mass_battery_kg":1190,"kerb_mass_hybrid_kg":1060,
   "cg_height_battery_m":0.485,"cg_height_hybrid_m":0.545,
   "static_stability_factor_battery":1.49,"static_stability_factor_hybrid":1.33,
   "seats":"4 full, occasional 5th",
   "h_point_height_mm":620,
   "beltline_above_floor_mm":780,
   "a_pillar_base_angle_deg":62,
   "turning_circle_kerb_to_kerb_m":10.2,
   "luggage_seats_up_l":320,"luggage_seats_folded_l":1050
 }',
 '{
   "body":"Steel monocoque with bolt-on front clip and bolt-on front fenders, chosen for repair cost rather than for mass.",
   "front_suspension":"Strut type, chosen because it is cheap, compact and universally serviceable.",
   "rear_suspension":"Torsion beam, chosen for cost, packaging and the flat load floor. Not the best handling answer, and the honest reason it is here is cost and repairability.",
   "crash_structure":"Replaceable crash cans at both ends with keyed interfaces and post-repair dimensional verification.",
   "visibility":"Upright A-pillars at 62 degrees and a high glasshouse. Forward sight line clear to a 1.0 m tall object at 1.0 m from the bumper, which is the child-behind-the-bumper case and is the reason the nose is not styled lower.",
   "shared_body_in_white":"One body-in-white serves the battery and the hybrid variants, so the crash structure is validated once and the cheaper variant does not get a cheaper cell."
 }',
 '{
   "baseline":"battery electric, 42 kWh usable, pack at 300 mm",
   "derivative":"hybrid-ready, 38 litre tank plus small engine plus 1.6 kWh buffer, same body-in-white",
   "disclosure":"the hybrid variant has a lower rollover threshold, SSF 1.33 against 1.49, and this must be stated to the buyer",
   "study":"ERCIV-STUDY-ENERGY-001"
 }',
 '{
   "braking_dry_g":0.92,"stopping_100_to_0_dry_m":42.8,
   "braking_wet_g":0.72,"stopping_100_to_0_wet_m":54.6,
   "class_rule":"Low price may never mean stripped safety or deliberately unrepairable design. Carried from AUTO-CLASS-EVERYDAY.",
   "egress":"Mechanical door release that works with no power, reachable by either hand. Carried from ER-AUTO-GAP-007.",
   "cabin_filter":"Classified as a safety item. See ERCIV-STUDY-FILTER-001."
 }',
 '{
   "front_clip_fasteners":18,
   "bolt_on_panels":["front bumper cover","both front fenders","both door skins as service items","tailgate"],
   "headlamp":"replaceable without removing the bumper",
   "cabin_filter_access":"behind the glovebox, 2 minutes, no tools",
   "adhesive_rule":"no structural adhesive inside the designated repair zone",
   "documentation":"service manual and torque figures available to the owner, not only to an authorised network",
   "gap_link":"ER-AUTO-GAP-005"
 }',
 '[]',
 '["final exterior surfacing, which has not started and must not start before the design gate is cleared","wheel design, which must originate from Peete Crown or Orin engineering language and may not default to Earth-generic motifs","numeric anthropometric corridors, still open across the whole vehicle canon","cost target in R currency, unresolved","the blue itself, proposed as Fen Blue and not approved"]',
 '["brand placement unresolved: Peete Crown is the locked top marque and an affordable hatch does not belong under it, while DGM and MAH scope remain UNRESOLVED in the backend, so a new everyday marque is proposed rather than assumed","town name unresolved, so ownership is recorded against the Oakfield Earth-mirror protagonist","no CAD geometry, no CAE correlation, no physical prototype","no supplier or manufacturer commitment"]',
 'WRITTEN_BRIEF_COMPLETE_GEOMETRY_OPEN','ACTIVE_BUILD',
 '{"source":"Chairman build manifest A, this session","reference_note":"Early-1980s hatchback named in the brief is a functional reference only. No Earth logo, name, grille, silhouette or trade dress is carried."}'),

('ERCIV-MANIFEST-B','B','Halden — low-wide flagship luxury van','PROPOSED_PENDING_CHAIRMAN','CNW-CONCEPT-009','PENDING_CHAIRMAN',
 'The main family and executive vehicle. Lower and wider than an SUV, with a short nose derived from 1970s van packaging logic without copying it, a low flat floor, generous road width, premium comfort and a crash structure and rollover margin that beat the class it sits in. This manifest extends the existing CNW-CONCEPT-009 record and closes its open dimensional package.',
 '{
   "length_mm":5300,"width_mm":2080,"height_mm":1745,"wheelbase_mm":3450,
   "track_front_mm":1780,"track_rear_mm":1790,
   "mirror_to_mirror_mm":2380,
   "front_overhang_mm":830,
   "kerb_mass_kg":3050,"gvm_kg":3900,
   "cg_height_m":0.620,"static_stability_factor":1.44,
   "typical_suv_ssf_for_comparison":"1.10 to 1.20",
   "floor_height_above_ground_mm":380,
   "interior_floor_to_ceiling_mm":1320,
   "step_in_height_mm":380,
   "deployable_step_drop_mm":120,
   "effective_first_step_mm":260,
   "seating":"2+2+3 executive or 2+3+3 family",
   "turning_circle_with_rear_steer_m":11.3,
   "turning_circle_without_rear_steer_m":12.9,
   "wheels":4
 }',
 '{
   "wheel_count_decision":"Four. Six wheels rejected. See ERCIV-STUDY-WHEELCOUNT-001.",
   "short_nose_correction":"The 1970s van reference is packaging logic only, and its central flaw is corrected explicitly. In those vehicles the driver sat ahead of the front axle, which is what killed people in frontal impacts. In this vehicle the driver''s feet sit BEHIND the front axle centreline, without exception. The short nose is achieved by moving the front axle forward and using a deep cross-car beam with load-spreading sill entry, not by shortening the crush zone.",
   "frontal_crush_length_mm":780,
   "occupant_cell":"Continuous multi-ring cell with front and rear crush rails, side sill and roof cross-load paths. Carried unchanged from ER-AUTO-BS-009.",
   "rollover":"Closed load ring preserved independently of the cosmetic roof. Door openings may not sever the primary ring. Carried from ER-AUTO-BS-009. Roof crush target at or above 3.5 times kerb mass.",
   "side_impact":"Deep sill, seat crossmember, B-pillar and roof rail load sharing. External deployable protection remains research only.",
   "crash_modules":"Bolt-on replaceable front and rear crash boxes with keyed interfaces and post-repair dimensional verification.",
   "rear_steer":"Adopted conditionally. Up to 5 degrees opposite phase below 25 km/h, up to 1.5 degrees same phase above 70 km/h. Must fail to centre and lock. See ERCIV-STUDY-REARSTEER-001.",
   "active_aero":"Grille shutters and speed-dependent ride height approved. Active rear yaw device deferred, active front dam rejected. See ERCIV-STUDY-ACTIVEAERO-001.",
   "crosswind":"Rear side surface and rear vertical fence to move the centre of pressure rearward. See ERCIV-STUDY-CROSSWIND-001."
 }',
 '{
   "baseline":"battery electric, 118 kWh usable, pack at 300 mm, which is what produces the 1.44 stability factor",
   "derivative":"range-extended hybrid permitted, SSF falls to 1.27, and that difference must be disclosed rather than buried",
   "hydrogen":"research only for this vehicle, and the reason is packaging rather than the fuel: cylindrical high-pressure tanks are hostile to the low flat floor that defines it",
   "study":"ERCIV-STUDY-ENERGY-001"
 }',
 '{
   "braking_dry_g":0.90,"stopping_100_to_0_dry_m":43.7,
   "braking_wet_g":0.70,"stopping_100_to_0_wet_m":56.2,
   "stopping_100_to_0_hydroplaning_m":393.3,
   "crosswind_side_force_at_90_kmh_gust_N":3579,
   "crosswind_rollover_margin_ratio":12.0,
   "post_crash":"Automatic energy isolation, hazard lighting, location beacon, rescue sheet plus offline physical markings, manual door and window escape, fire and immersion response. Carried from ER-AUTO-BS-009.",
   "underbody":"Battery pack strike plate with a defined intrusion limit, which is a new requirement created by putting the pack in the floor.",
   "corridor_rescue_link":"Retained from CNW-CONCEPT-009 safety_requirements."
 }',
 '{
   "crash_modules":"replaceable without cutting structure",
   "cabin_filter_access":"2 minutes, no tools",
   "pack_service":"pack modules individually replaceable without removing the body",
   "documentation":"owner-accessible service documentation",
   "gap_link":"ER-AUTO-GAP-005"
 }',
 '[]',
 '["exterior surfacing not started and must not start before the design gate is cleared","wheel design, which must originate from Peete Crown engineering language per ER-DESIGN-WHEEL-001","numeric anthropometric corridors, carried open from ER-AUTO-BS-009","materials, joint stack and corrosion validation, carried open","CAE correlation and physical crash evidence, carried open","homologation market and regulatory matrix, carried open"]',
 '["brand placement unresolved: this is the natural Peete Crown flagship but MAH and DGM scope are UNRESOLVED in the backend and the Chairman has not assigned it","model name Halden is proposed and not approved","rear steer fail-to-centre proof does not exist yet, and the rear steer approval is conditional on it","the 3.50 m lane corridor assumption in ERCIV-ROAD-WIDTH-001 is not yet a published standard","no prototype or test evidence, carried from ER-AUTO-BS-009"]',
 'WRITTEN_BRIEF_COMPLETE_GEOMETRY_OPEN','ACTIVE_BUILD',
 '{"source":"Chairman build manifest B, this session","extends":"CNW-CONCEPT-009 and ER-AUTO-BS-009, which held GATE_1_ARCHITECTURE_COMPLETE with hard dimensions and mass target unresolved","closes":"the dimensional package, mass model, centre of gravity, rollover threshold, wheel count decision and crosswind case","reference_note":"Escalade, Flying Spur and 1970s van remain class and proportion references only, unchanged from the existing record."}'),

('ERCIV-MANIFEST-C','C','Halden Common — modular custom van platform','PROPOSED_PENDING_CHAIRMAN',null,'PENDING_CHAIRMAN',
 'One floor, many vehicles. A modular platform sharing the flagship''s skateboard, floor height and crash structure across two wheelbases and two roof heights, carrying certified modules for family, trades, medical, mobile studio, exploration, accessible transport, hospitality and executive use.',
 '{
   "shared_with":"ERCIV-MANIFEST-B",
   "wheelbase_short_mm":3200,"wheelbase_long_mm":3450,
   "roof_standard_mm":1745,"roof_high_mm":2050,
   "floor_height_above_ground_mm":380,
   "width_mm":2080,
   "track_front_mm":1780,"track_rear_mm":1790,
   "gvm_kg":3900,
   "base_cg_height_m":0.620,
   "max_permitted_cg_height_with_module_m":0.680,
   "minimum_permitted_ssf_with_module":1.31
 }',
 '{
   "module_interface":"A 50 mm pitch rail grid on the floor and both side walls, with defined hard anchor points.",
   "anchor_rating":"Restrained loads anchored to 20 g longitudinal.",
   "power_take_off":"Defined kW auxiliary supply with its own protection, isolated from the traction system.",
   "data_interface":"Read-only vehicle state. A module may read speed, state of charge, door state and hazard state. A module may NEVER command steering, braking, propulsion or restraint deployment. This is the cardinal module rule and it has no exceptions.",
   "mass_and_cg_envelope":"Every module is certified against a published mass and centre-of-gravity envelope. A module that would push vehicle CG above 680 mm, taking the stability factor below 1.31, is not certifiable at any price.",
   "rear_steer":"Shared with Manifest B, same conditional approval and same fail-to-centre requirement."
 }',
 '{"baseline":"battery electric shared with Manifest B","derivative":"hybrid module option for trades and remote operation, with the same rollover disclosure","study":"ERCIV-STUDY-ENERGY-001"}',
 '{
   "inherits":"All Manifest B structure, braking, crosswind and post-crash provisions.",
   "module_rule":"Modularity is made safe by publishing the envelope and certifying each module against it, not by trusting the module builder.",
   "medical_module_note":"The medical module carries its own safety case. A clinician working unrestrained in a moving vehicle is an unsolved problem and is not solved here; the module must provide a seated restrained working position, and any task that cannot be done from it is a task done stationary."
 }',
 '{"module_removal":"a module is removable and refittable by the fleet network without structural work","documentation":"module certification record travels with the module, not with the vehicle","gap_link":"ER-AUTO-GAP-005"}',
 '[
   {"module":"family","contents":"7 or 8 seats, child restraint anchors throughout, load restraint for luggage","safety_case":"child restraint installation study required"},
   {"module":"trades","contents":"racking, secured tool storage, power take-off, workbench","safety_case":"load restraint at 20 g, rack anchorage, centre of gravity with a fully loaded rack"},
   {"module":"medical and patient transport","contents":"stretcher mount, clinician seated restrained working position, oxygen storage, equipment mounts","safety_case":"separate and mandatory: oxygen storage and venting, patient restraint, equipment strike hazards, clinician restraint"},
   {"module":"mobile studio","contents":"camera and sound capture, edit position, power, acoustic treatment","safety_case":"equipment restraint, thermal load, power isolation"},
   {"module":"exploration","contents":"extended energy, water, sleeping, recovery points","safety_case":"centre of gravity with roof load, recovery point structural rating"},
   {"module":"accessible transport","contents":"wheelchair securement, powered ramp on the 380 mm floor, occupant restraint independent of the chair","safety_case":"wheelchair securement dynamic testing, ramp gradient at the 380 mm floor height, independent occupant restraint"},
   {"module":"hospitality","contents":"service galley, seating, secured stowage","safety_case":"hot surface and liquid restraint, galley stowage under braking"},
   {"module":"executive","contents":"4 seats, privacy, work surfaces, communications","safety_case":"work surface strike geometry, privacy partition in an impact"}
 ]',
 '["module certification process not written","published mass and centre-of-gravity envelope document not issued","power take-off rating not fixed","read-only data interface specification not written"]',
 '["depends entirely on Manifest B, so every Manifest B blocker applies here too","medical module is the hardest safety case in the set and is not solved","module certification authority not named"]',
 'WRITTEN_BRIEF_COMPLETE_GEOMETRY_OPEN','ACTIVE_BUILD',
 '{"source":"Chairman build manifest C, this session"}')

on conflict (manifest_code) do nothing;

commit;
