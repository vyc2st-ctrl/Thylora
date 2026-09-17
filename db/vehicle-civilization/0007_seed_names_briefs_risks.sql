-- Name proposals, render briefs, reconciliation findings and safety risks.
-- Nothing in er_civ_name_proposal can be locked: the approval_state check
-- constraint allows exactly one value, PROPOSED_PENDING_CHAIRMAN.

begin;

-- ---- name proposals ------------------------------------------------------
insert into er_civ_name_proposal
(proposal_code, proposed_name, pronunciation, proposed_meaning, name_class, for_object, option_group, notes) values

('ERCIV-NAME-ORIN','Orin','OR-in','The first one held. The marque a person owns first.','COMPANY','THYLORA everyday ground marque','company-everyday',
 'Proposed because Peete Crown is the locked top brand and an affordable hatch under a top marque dilutes it, while DGM and MAH scope remain UNRESOLVED.'),
('ERCIV-NAME-ALDERVANE','Aldervane','AL-der-vayn','The elder road. The long haul that carries the weight.','COMPANY','THYLORA heavy haul and logistics','company-freight',null),
('ERCIV-NAME-WENDO','Wendo','WEN-doh','Carried together. A vehicle that belongs to everyone riding in it.','COMPANY','THYLORA transit and bus','company-transit',null),
('ERCIV-NAME-SEVRIN','Sevrin','SEV-rin','The one who stays.','COMPANY','THYLORA emergency and rescue','company-rescue',null),
('ERCIV-NAME-FURLO','Furlo','FUR-loh','The turned row.','COMPANY','THYLORA agricultural machinery','company-agri',null),
('ERCIV-NAME-ONDERN','Ondern','ON-dern','The under-work.','COMPANY','THYLORA construction and earthmoving','company-construction',null),
('ERCIV-NAME-HALERIN','Halerin','HAL-uh-rin','Held in air.','COMPANY','THYLORA civil aviation','company-aviation',null),
('ERCIV-NAME-KEELRA','Keelra','KEEL-rah','The keel that returns.','COMPANY','THYLORA marine','company-marine',null),
('ERCIV-NAME-AMBRENT','Ambrent','AM-brent','Walks around and guards.','COMPANY','THYLORA armored protection','company-armored',null),
('ERCIV-NAME-CORVETH','Corveth','KOR-veth','The carried column.','COMPANY','THYLORA military transport, mobility only','company-miltransport',null),
('ERCIV-NAME-TAMBER','Tamber','TAM-ber','Small and sure.','COMPANY','THYLORA light mobility','company-light',null),
('ERCIV-NAME-STONELANE','Stonelane Roadworks','STONE-layn','The made way.','COMPANY','THYLORA road and bridge infrastructure','company-roads',null),

('ERCIV-NAME-HALLOWMOOR','Hallowmoor Motorworks','HAL-oh-moor','The open moor. Plain vehicles for plain money.','COMPANY','independent everyday rival','company-everyday',null),
('ERCIV-NAME-OTSEN','Otsen Vehicle Company','OT-sen','The steady house.','COMPANY','independent mid-market rival','company-mid',null),
('ERCIV-NAME-SORREL-VANCE','Sorrel & Vance','SOR-el and VANS','Two coachbuilders'' names. Bodies made one at a time.','COMPANY','independent ultra-luxury rival to Peete Crown','company-ultra',null),
('ERCIV-NAME-BRACKENHALL','Brackenhall Freight Machines','BRAK-en-hall','The hall at the rough ground.','COMPANY','independent freight rival','company-freight',null),
('ERCIV-NAME-BELLHAVEN','Bellhaven Coach','BEL-hay-ven','The safe harbour bell.','COMPANY','independent coach builder','company-transit',null),
('ERCIV-NAME-TWO-RIVERS','Two Rivers Transit Company',null,'A municipal operator that also builds small series for its own routes.','COMPANY','independent transit operator and builder','company-transit',null),
('ERCIV-NAME-RYKE','Ryke Emergency Apparatus','RIKE','The reach.','COMPANY','independent rescue rival','company-rescue',null),
('ERCIV-NAME-QUILLON','Quillon Agricultural','KWIL-on','The guard on the blade.','COMPANY','independent agricultural rival','company-agri',null),
('ERCIV-NAME-FERROWRIGHT','Ferrowright Machines','FER-oh-rite','The iron maker.','COMPANY','independent construction rival','company-construction',null),
('ERCIV-NAME-KESTRIN','Kestrin Aviation','KES-trin','The small hunting bird.','COMPANY','independent aviation rival','company-aviation',null),
('ERCIV-NAME-DEEPMARROW','Deepmarrow Marine','DEEP-mar-oh','The deep bone.','COMPANY','independent marine rival','company-marine',null),
('ERCIV-NAME-MARN','Marn & Daughters Bodyworks','MARN','A family panel shop that outlived its founder.','COMPANY','independent restoration rival to C&W','company-restoration',null),

('ERCIV-NAME-FEN','Orin Fen','OR-in FEN','Fen: a small useful piece of low ground. The compact hatch.','MODEL','Manifest A','model-a',
 'Model name only. Brand placement under Orin is itself a proposal, not a decision.'),
('ERCIV-NAME-HALDEN','Halden','HAWL-den','The wide hall that travels.','MODEL','Manifest B','model-b',
 'Brand placement PENDING. This is the natural Peete Crown flagship but MAH and DGM scope are UNRESOLVED and the Chairman has not assigned it.'),
('ERCIV-NAME-HALDEN-COMMON','Halden Common','HAWL-den COM-un','The shared wide floor.','PLATFORM','Manifest C','platform-c',
 'Named from Manifest B because they genuinely share the floor and crash structure.'),

('ERCIV-NAME-FEN-BLUE','Fen Blue',null,'A deep blue carrying a trace of green, the colour of still low water. The blue of Manifest A.','COLOR','Manifest A exterior','color-a',null),

('ERCIV-NAME-TOWN-OAKFIELD','Oakfield',null,'Current Earth-mirror name, carried as the Earth-name option required by THY-NAME-PROVENANCE-001.','TOWN','Oakfield Earth-mirror town','town-a',
 'Earth-name option. Retained so the mirror stays legible until the in-world name is chosen.'),
('ERCIV-NAME-TOWN-LOWETH','Loweth','LOH-eth','The low meadow.','TOWN','Oakfield Earth-mirror town','town-a','EdereAriah-name option.'),
('ERCIV-NAME-TOWN-BRENDMERE','Brendmere','BREND-meer','The boundary water.','TOWN','Oakfield Earth-mirror town','town-a','EdereAriah-name option.'),
('ERCIV-NAME-TOWN-ASHENFORD','Ashen Ford','ASH-en FORD','The crossing by the pale trees.','TOWN','Oakfield Earth-mirror town','town-a','Hybrid option, readable in both registers.'),

('ERCIV-NAME-TERM-LONGREACH','Longreach','LONG-reech','A road car built to cross the world in one sitting.','TERM','in-world replacement for the Earth term GT / Grand Touring','term-gt',
 'Fills the open canon gap ER-TERM-GT-REPLACE-001, which has stood at ACTIVE_BUILD with our_term UNKNOWN since 2026-08-30.'),
('ERCIV-NAME-TERM-HARDRUN','Hardrun','HARD-run','A road car built around the violence of its own engine.','TERM','in-world replacement for the Earth term muscle car','term-muscle',
 'Fills the open canon gap ER-TERM-MUSCLE-REPLACE-001, which has stood at ACTIVE_BUILD with our_term UNKNOWN since 2026-08-30.')

on conflict (proposal_code) do nothing;

-- ---- render briefs -------------------------------------------------------
insert into er_civ_render_brief
(brief_code, subject_manifest, written_gate_state, geometry_state, permitted_content, prohibited_content, required_callouts) values

('ERCIV-BRIEF-A','ERCIV-MANIFEST-A','WRITTEN_BRIEF_COMPLETE','HARD_PACKAGE_DEFINED_CAD_GEOMETRY_NOT_BUILT',
 '["orthographic package drawing at the stated dimensions","occupant package and sight line diagram","structural load path diagram","repair zone and bolt-on panel diagram","dimensional and mass callout sheet"]',
 '["any finished exterior styling render","any wheel design, because wheel geometry is an open gap under ER-AUTO-GAP-006 and ER-DESIGN-WHEEL-001","any badge, crest, crown or wing device, because Peete Crown symbol language is undesigned under ER-DESIGN-CROWN-001","any Earth logo, name, grille, silhouette or trade dress","any photographic or lifestyle image implying the vehicle exists","any colour treatment presented as approved, including Fen Blue"]',
 '["states that no exterior styling is approved","states that the name Orin Fen is proposed and not locked","states that the town name is unresolved and ownership is recorded against the Oakfield Earth-mirror protagonist","carries the EdereAriah simulation boundary"]'),

('ERCIV-BRIEF-B','ERCIV-MANIFEST-B','WRITTEN_BRIEF_COMPLETE','HARD_PACKAGE_DEFINED_CAD_GEOMETRY_NOT_BUILT',
 '["orthographic package drawing at the stated dimensions","centre of gravity and track diagram showing the 1.44 stability factor","four versus six wheel comparison diagram","short nose package diagram showing the driver feet behind front axle rule","crosswind centre of pressure diagram","dimensional and mass callout sheet"]',
 '["any finished exterior styling render","any wheel design","any badge, crest, crown or wing device","any Earth logo, name, grille, silhouette or trade dress, and specifically nothing referencing the Escalade, Flying Spur or any 1970s van beyond written proportion notes","any image implying six wheels, which were rejected","any imagery implying the vehicle is built or in service"]',
 '["states that this extends CNW-CONCEPT-009 rather than replacing it","states that the model name Halden is proposed and brand placement is pending","states that rear steer approval is conditional on unproven fail-to-centre behaviour","states that the 3.50 m lane corridor standard is assumed and not published","carries the EdereAriah simulation boundary"]'),

('ERCIV-BRIEF-C','ERCIV-MANIFEST-C','WRITTEN_BRIEF_COMPLETE','HARD_PACKAGE_DEFINED_CAD_GEOMETRY_NOT_BUILT',
 '["platform skateboard diagram at both wheelbases and both roof heights","module rail grid and anchor point diagram","mass and centre of gravity envelope chart showing the 1.31 stability factor floor","module family comparison diagram"]',
 '["any finished exterior styling render","any wheel design","any badge, crest, crown or wing device","any medical module imagery, because that safety case is unsolved","any image implying a module may command vehicle motion"]',
 '["states that every module is certified against the published envelope","states that the medical module safety case is unsolved","states that a module may never command steering, braking, propulsion or restraint","carries the EdereAriah simulation boundary"]')

on conflict (brief_code) do nothing;

-- ---- reconciliation findings against existing canon ----------------------
insert into er_civ_reconciliation_log
(finding_code, finding_type, object_a, object_b, description, recommended_resolution) values

('ERCIV-REC-001','CONTRADICTION','er_automotive_naming_corrections AUTO-NAME-001','transport_program_registry CNW-* program codes',
 'AUTO-NAME-001 is LOCKED and states that the canonical automotive form is C&W and that the system must not silently revert to CNW. Meanwhile every program code in transport_program_registry still carries the CNW prefix: CNW-RACING-001, CNW-ONEOFF-001, CNW-HERITAGE-001, CNW-ROADSAFE-001, CNW-SUBMERGE-001, CNW-HERITAGE-FLEET-001, and every vehicle in transport_vehicle_registry is CNW-CONCEPT-0NN. The transcription error is frozen into the identifier scheme.',
 'Chairman decision. Either the CNW prefix is declared an inert legacy identifier that is not the shop name, or the codes are migrated to CW- with a mapping table. This build did not rename anything, because renaming live identifiers is not an engineering decision and would break every cross-reference in the canon.'),

('ERCIV-REC-002','DUPLICATE_TAXONOMY','er_automotive_vehicle_class_matrix AUTO-CLASS-*','er_automotive_vehicle_class_matrix VEH-*-00N',
 'One table holds two competing class taxonomies written eight hours apart on 2026-08-30. AUTO-CLASS-EVERYDAY through AUTO-CLASS-HERITAGE cover six families; VEH-PASS-001 through VEH-HERITAGE-006 cover six overlapping families with different column shapes, including price_position stored as an object in one set and as an array in the other. Neither supersedes the other and both are state DESIGN.',
 'Chairman decision on which set is canonical. er_civ_mobility_class_registry maps onto both rather than picking a winner, so nothing is lost either way.'),

('ERCIV-REC-003','CONTRADICTION','businesses CW-AUTO-CUSTOMS-001 business_type','er_automotive_facility_registry CW-AUTO-CUSTOMS-FACILITY-001',
 'The business record types C&W as AUTOMOTIVE_PROVENANCE_RESTORATION_CUSTOM_MEDIA. The facility record, created later under the Chairman correction of 2026-09-16, establishes C&W as a vehicle factory, restoration garage and managed fleet house. The word factory never reached the business record, so a query against businesses would not find that THYLORA has a vehicle factory.',
 'Update businesses.business_type for CW-AUTO-CUSTOMS-001 to include the factory and managed fleet scope. Not done in this build because businesses is an existing operational table outside the additive er_civ_ boundary.'),

('ERCIV-REC-004','DANGLING_REFERENCE','er_automotive_build_sheets ER-AUTO-BS-009','THY-VEH-SAFE-SERVICEABLE-001 and THY-NO-STAGNANT-BUILD-001',
 'The flagship build sheet and vehicle registry entry cite the safety standard THY-VEH-SAFE-SERVICEABLE-001 and the execution gate THY-NO-STAGNANT-BUILD-001. Neither code has a defining record in thylora_chairman_review_gates. A safety standard that is cited but never defined cannot be complied with or audited.',
 'Chairman to confirm whether these codes exist elsewhere in the canon or were forward references. If they were forward references, they need defining records before any vehicle claims compliance with them.'),

('ERCIV-REC-005','CONTRADICTION','er_automotive_gap_registry applicable_programs','transport_program_registry and transport_vehicle_registry',
 'The gap registry lists CNW-CONCEPT-001 through CNW-CONCEPT-007 under applicable_programs, but those codes are vehicle canonical_ids in transport_vehicle_registry, not program codes in transport_program_registry. The field mixes two different identifier namespaces, so a join on program code silently returns nothing.',
 'Split into applicable_programs and applicable_vehicles, or document that the field holds both. Low urgency, real data quality issue.'),

('ERCIV-REC-006','EMPTY_REQUIRED_REGISTRY','er_vehicle_managed_fleet_registry and er_vehicle_build_ledger','CNW-HERITAGE-FLEET-001',
 'The heritage fleet programme is ACTIVE_SIMULATION_PRODUCTION and its requirements explicitly name a worker, part and build ledger and a managed fleet. Both tables hold zero rows, as does transport_provenance_registry and transport_maintenance_reports. Ten projects sit in er_vehicle_project_pipeline at SIMULATION_REBUILD_ACTIVE with no ledger entries behind them.',
 'Either the ten CW-LEAD projects get ledger and fleet rows, or the programme state is honest about being defined rather than running. Recorded here rather than fixed, because writing fleet and ledger rows would assert production activity this build did not perform.'),

('ERCIV-REC-007','GAP','er_vehicle_brand_language_registry ER-BRAND-DGM-001 and ER-BRAND-MAH-001','this build',
 'The Chairman asked for DGM and MAH scope to be resolved from the backend. The backend was queried and holds no scope for either. DGM records that the expansion of the initials is UNKNOWN. MAH records that product scope and meaning remain in development, with one model assignment to Mateo. There is nothing to recover.',
 'Chairman decision required. No product, class or manifest has been assigned to either sub-brand by this build, and Manifest A and B brand placement is held PENDING for exactly this reason.'),

('ERCIV-REC-008','GAP','transport_program_registry THY-SITE-MOBILITY-001','er_automotive_facility_registry',
 'The site mobility programme names the Peete Crown Refinery as part of its scope. No facility record exists for a Peete Crown Refinery anywhere in the facility registry, which holds exactly one row, C&W. An industrial facility is referenced in a requirement but has never been created.',
 'Chairman to confirm whether the Peete Crown Refinery is canon. If it is, it needs a facility record like C&W has.'),

('ERCIV-REC-009','GAP','er_vehicle_brand_language_registry ER-TERM-GT-REPLACE-001 and ER-TERM-MUSCLE-REPLACE-001','this build',
 'Both language replacement records have stood at ACTIVE_BUILD with our_term set to UNKNOWN - IN-WORLD TERM REQUIRED since 2026-08-30. Every performance vehicle record since has had to fall back on the Earth terms the canon says are reference only.',
 'Proposals offered: Longreach for GT and Hardrun for muscle car, both in er_civ_name_proposal. Neither is locked. Chairman approval would close two gaps that have been open since the registry was created.'),

('ERCIV-REC-010','CONTRADICTION','transport_vehicle_registry ersatz_name','all ten vehicle records',
 'Every vehicle in transport_vehicle_registry has ersatz_name UNKNOWN, including CNW-CONCEPT-009 which has a complete Gate 1 architecture and a full build sheet. The canon can engineer a vehicle further than it can name one, which is the direct consequence of the naming gate working as intended.',
 'No action needed on the gate, which is correct. Recorded so it is understood as a deliberate state rather than an oversight.')

on conflict (finding_code) do nothing;

-- ---- safety risks --------------------------------------------------------
insert into er_civ_safety_risk
(risk_code, domain, risk, why_it_matters, current_control, residual_state, gating_evidence, applies_to) values

('ERCIV-RISK-001','GROUND',
 'Assuming six wheels are safer than four.',
 'Neither grip nor rollover resistance depends on wheel count. Grip is mu times weight, and weight does not change when wheels are added. Rollover depends on track width and centre of gravity height. A six-wheel flagship would have cost the flat low floor, added about 180 kg high in the rear, slightly worsened the rollover number and added two more tires that can fail, all while feeling safer.',
 'ERCIV-STUDY-WHEELCOUNT-001 rejects six wheels for the flagship with the arithmetic shown, and sets a 2400 kg rear axle load threshold above which tandem genuinely earns its place.',
 'CONTROLLED_BY_DECISION','["measured CG height on a prototype","tilt table test"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-RISK-002','GROUND',
 'Hydroplaning: 393 metres to stop from 100 km/h, with no steering.',
 'Nine times the dry stopping distance, and the driver has no control input that helps. This is the single largest number in the whole programme and it is produced jointly by the tire and the road, not by the vehicle alone.',
 'Tire pressure monitoring tied to hydroplaning onset speed rather than to a fixed low-pressure alarm, a service intervention tread depth well above legal minimum, and the road targets in ERCIV-ROAD-DRAINAGE-001.',
 'OPEN','["wet braking and hydroplaning onset testing","corridor texture and drainage survey","tread depth degradation study"]','["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","CIV-INFRA-ROAD"]'),

('ERCIV-RISK-003','GROUND',
 'Rear steering jamming off centre.',
 'A 3 tonne van permanently crabbing at speed is a loss-of-control condition, not an inconvenience. The entire rear steer approval rests on this one failure mode.',
 'Mechanical spring centring, redundant position sensing and an independent lock. Approval is explicitly conditional and the proof does not yet exist.',
 'OPEN','["fail-to-centre demonstration under power loss, controller loss and sensor disagreement","durability of the centring mechanism over vehicle life"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-RISK-004','GROUND',
 'Active aerodynamic device failing in the deployed position.',
 'A device stuck deployed to one side is a permanent uncommanded steering input at highway speed. This is why the active rear yaw device is deferred and the active front dam is rejected.',
 'Binding rule: no active aerodynamic device may have a failure state that increases yaw sensitivity. Only grille shutters and ride height are approved, and both fail to benign states.',
 'CONTROLLED_BY_DECISION','["failure mode testing of each device in its worst stuck position at speed","icing and debris jamming tests"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-RISK-005','GROUND',
 'Occupants ahead of the front axle, inherited from 1970s van packaging.',
 'This is the specific thing that killed people in the vehicles the brief names as a packaging reference. A short nose is a legitimate packaging goal; putting the driver in front of the front wheels to get it is not.',
 'Absolute rule in Manifest B: the driver''s feet sit behind the front axle centreline without exception, and the short nose is achieved by moving the axle forward, not by shortening the 780 mm crush length.',
 'CONTROLLED_BY_DECISION','["frontal impact testing confirming the crush length is real","occupant package verification on a physical buck"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-RISK-006','GROUND',
 'Battery pack underbody strike, created by the decision to put the pack in the floor.',
 'The floor pack is what buys the 1.44 rollover number, and it also puts the largest single energy store in the vehicle at the lowest and most exposed point. The safety gain and the new hazard come from the same decision.',
 'Strike plate with a defined intrusion limit, plus the thermal runaway propagation requirement on the cell supplier.',
 'OPEN','["underbody strike testing against the defined intrusion limit","thermal runaway propagation testing","post-strike pack integrity inspection procedure"]','["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-SUP-CINDREL"]'),

('ERCIV-RISK-007','GROUND',
 'A 2080 mm wide vehicle on roads that were never widened.',
 'The rollover margin and the interior space both come from the width. If the corridor standard assumed in ERCIV-ROAD-WIDTH-001 is never published and built, the width becomes the hazard instead of the protection, and the failure is in the system rather than in the vehicle.',
 'Recorded as an explicit cross-domain dependency with a named owner, Stonelane Roadworks, rather than left inside the vehicle programme where nobody would look for it.',
 'OPEN','["corridor width survey on intended routes","a published corridor standard the vehicle can be checked against","opposing traffic clearance study"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","CIV-INFRA-ROAD"]'),

('ERCIV-RISK-008','GROUND',
 'Crosswind gusts at bridge ends and barrier terminations.',
 'The vehicle will not blow over, with a twelve to one margin, but it will yaw, and the worst place for that is the step from sheltered to exposed at the end of a solid barrier, which happens in about one vehicle length.',
 'Porous barriers at 30 to 40 percent porosity with the final 40 to 60 m tapered, plus rearward centre of pressure, same-phase rear steer and gust-tuned stability control on the vehicle.',
 'OPEN','["wind tunnel yaw sweep","full scale crosswind testing through a gust generator","bridge anemometry"]','["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-ROAD-BARRIER-001"]'),

('ERCIV-RISK-009','GROUND',
 'The cabin air filter is filed as comfort and gets deferred.',
 'A clogged cabin filter cuts demist and defrost airflow. A driver who cannot clear the windscreen cannot see. Filed under comfort it gets deferred in a busy service bay, and the consequence is a visibility failure.',
 'Reclassified as a safety item across the canon, with a measured pressure drop limit and a two minute no-tools access target.',
 'CONTROLLED_BY_DECISION','["demist and defrost performance test with the filter loaded to the replacement limit","service access time trial"]','["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-SUP-SIEVEWORKS"]'),

('ERCIV-RISK-010','GROUND',
 'The hybrid variant has a materially lower rollover threshold than the electric one.',
 'Same body, same badge, SSF 1.27 against 1.44. A buyer choosing the hybrid for range is also choosing less rollover margin, and will not know unless told.',
 'Disclosure requirement written into both manifests: the difference is stated to the buyer rather than buried.',
 'CONTROLLED_BY_DECISION','["measured CG height for both variants","tilt table test for both variants"]','["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B"]'),

('ERCIV-RISK-011','GROUND',
 'A module commanding vehicle motion.',
 'Modules are built by many hands over many years. A module that can command steering, braking or propulsion means the vehicle safety case depends on every module builder forever.',
 'Cardinal module rule with no exceptions: read-only vehicle state, and a certified mass and centre of gravity envelope with a 1.31 stability factor floor.',
 'CONTROLLED_BY_DECISION','["module certification process document","interface specification proving the read-only boundary is enforced in hardware, not only in software"]','["ERCIV-MANIFEST-C"]'),

('ERCIV-RISK-012','GROUND',
 'The medical module clinician working unrestrained in a moving vehicle.',
 'This is a genuinely unsolved problem across the whole industry and it is not solved here. A clinician standing over a patient in a moving vehicle is unrestrained mass in a crash, and so is every piece of equipment in their hands.',
 'The module must provide a seated restrained working position, and any task that cannot be done from it is a task done stationary. That is a mitigation and an operational constraint, not a solution.',
 'OPEN','["seated working position reach and capability study with clinicians","equipment strike hazard assessment","oxygen storage and venting safety case"]','["ERCIV-MANIFEST-C","ERCIV-CO-SEVRIN"]'),

('ERCIV-RISK-013','AIR',
 'Guardian Flight described as a capability while it holds no certification path.',
 'The programme is recorded ACTIVE_DESIGN while simultaneously holding blockers stating there is no aerodynamic validation, no certification path and no prototype. That combination is exactly how an escort capability gets talked about as though it exists.',
 'Binding aviation gate ERCIV-STUDY-AVIATION-GATE-001: no flight performance or escort claim without an airworthiness basis, no imagery of an aircraft in operation, and no evidence shared with ground programmes in either direction.',
 'CONTROLLED_BY_DECISION','["an airworthiness basis and named certification path","aerodynamic and structural validation","prototype and operator commitment"]','["THY-GUARDIAN-FLIGHT-001","CIV-AIR-CIVIL","CIV-AIR-SUPPORT"]'),

('ERCIV-RISK-014','GOVERNANCE',
 'A safety standard cited by vehicles but never defined.',
 'ER-AUTO-BS-009 and CNW-CONCEPT-009 both claim conformance to THY-VEH-SAFE-SERVICEABLE-001. No defining record exists in the gate registry. A standard that cannot be read cannot be complied with, and a claim of compliance with it is unverifiable.',
 'Recorded as ERCIV-REC-004 for Chairman resolution. No vehicle in this build claims conformance to an undefined standard.',
 'OPEN','["a defining record for THY-VEH-SAFE-SERVICEABLE-001 and THY-NO-STAGNANT-BUILD-001, or confirmation that they were forward references"]','["ERCIV-MANIFEST-B","CNW-CONCEPT-009"]'),

('ERCIV-RISK-015','GOVERNANCE',
 'A simulated company being read as an Earth company.',
 'Every company and supplier created in this build is an EdereAriah simulated entity. The C&W facility record sets the precedent by explicitly disclaiming Earth building, Earth employment, Earth licensure and physical manufacture. A new company record without that boundary becomes a false Earth claim the moment anyone quotes it.',
 'earth_claim_boundary is a NOT NULL column on er_civ_company_registry with that disclaimer as its default, so a row cannot be created without carrying it.',
 'CONTROLLED_BY_DESIGN','[]','["ERCIV-CO-ALL"]'),

('ERCIV-RISK-016','GROUND',
 'Protection mass quietly undoing the safety it was added for.',
 'Armor adds several hundred kilograms, usually high. That raises the centre of gravity, lowers the rollover threshold, lengthens stopping distance and can exceed the tire and axle ratings the base vehicle was designed around.',
 'The armored derivative is the one case where the 2400 kg rear axle threshold is crossed and six wheels are genuinely indicated. It is treated as a separate engineering case, not as a base vehicle with panels added.',
 'OPEN','["CG and rollover measurement on the armored configuration","tire and axle rating confirmation at armored GVM","braking test at armored GVM"]','["CIV-GROUND-ARMORED","ERCIV-CO-AMBRENT"]')

on conflict (risk_code) do nothing;

commit;
