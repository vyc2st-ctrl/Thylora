-- Full mobility class taxonomy across every required genre.
-- This does not replace er_automotive_vehicle_class_matrix or
-- er_automotive_vehicle_deep_taxonomy. It maps onto them, and it adds the
-- classes those two tables never covered (emergency, agricultural,
-- construction, aviation, marine, logistics, armored, military transport).

begin;

insert into er_civ_mobility_class_registry (class_code, domain, class_family, description, maps_to_existing) values

('CIV-GROUND-CIVILIAN','GROUND','civilian personal mobility',
 'Everyday vehicles a household owns and repairs: compact, sedan, hatch, wagon, small crossover, coupe, convertible. Low price may never mean stripped safety or deliberately unrepairable design.',
 '["AUTO-CLASS-EVERYDAY","VEH-PASS-001","VEH-SMALL-DEEP-006"]'),

('CIV-GROUND-FAMILY-LARGE','GROUND','large family and executive transport',
 'Low-wide vans, grand utilities and grand sedans carrying 6 to 8 people with full comfort, accessibility and crash structure. Lower and wider than an SUV by design, because rollover resistance comes from track and centre of gravity, not from size.',
 '["AUTO-CLASS-ULTRA","VEH-SPECIAL-005","VEH-VAN-DEEP-005","CNW-CONCEPT-009"]'),

('CIV-GROUND-PERFORMANCE','GROUND','performance and grand touring',
 'Road sports, long-distance high-speed touring, halo and track-capable road cars. Earth terms GT and muscle remain reference only until in-world terms are approved.',
 '["AUTO-CLASS-PERFORMANCE","VEH-SPORT-002","VEH-SPORT-DEEP-001","ER-TERM-GT-REPLACE-001","ER-TERM-MUSCLE-REPLACE-001"]'),

('CIV-GROUND-COMMERCIAL','GROUND','commercial and trade vehicles',
 'Panel vans, crew vans, light trucks, chassis cabs and service bodies working a daily duty cycle for a business.',
 '["AUTO-CLASS-UTILITY","VEH-TRUCK-003","VEH-PICKUP-DEEP-002","VEH-VAN-DEEP-005"]'),

('CIV-GROUND-LOGISTICS','GROUND','logistics and heavy freight',
 'Rigid delivery, box, tractor units, tankers, refrigerated, car carriers, yard and port tractors. Judged on underride geometry, cab visibility, swept path, driver rest and route infrastructure.',
 '["VEH-HEAVY-DEEP-003"]'),

('CIV-GROUND-TRANSIT','GROUND','public and shared transit',
 'City buses, coaches, school and community transport, accessible transit and shuttle. Every seat is a passenger who did not choose the vehicle, so the safety floor is set by the operator, not the buyer.',
 '["ER-MOBILITY-TWO-LEVEL-001","THY-SITE-MOBILITY-001"]'),

('CIV-GROUND-EMERGENCY','GROUND','emergency and rescue apparatus',
 'Fire and rescue apparatus, ambulance and patient transport, technical rescue, corridor response units. Readiness is a maintained state, not a claim: an apparatus that cannot roll is not an apparatus.',
 '["VEH-SPECIAL-005","CNW-ROADSAFE-001","ER-AUTO-GAP-008"]'),

('CIV-GROUND-AGRICULTURAL','GROUND','agricultural machinery',
 'Tractors, harvesters, implement carriers, orchard and row-crop machines, farm transport. Dominant hazards are rollover, power take-off entanglement, implement crush and road transit of slow wide machines.',
 '[]'),

('CIV-GROUND-CONSTRUCTION','GROUND','construction and earthmoving plant',
 'Excavators, loaders, graders, dumpers, compaction, paving plant, lifting and access machines. Dominant hazards are stored hydraulic energy, blind zones around the machine and struck-by events on foot.',
 '["THY-ROAD-CIRCULAR-001"]'),

('CIV-GROUND-ARMORED','GROUND','armored and protected transport',
 'Armored passenger transport, valuables transit, protected medical evacuation, protected utility. Protection adds mass, which raises the centre of gravity and lengthens stopping distance; both must be re-engineered, never simply accepted.',
 '["IMP-PROJECTILE-001"]'),

('CIV-GROUND-MILITARY-TRANSPORT','GROUND','military transport and engineering',
 'Personnel transport, field logistics, engineering and recovery vehicles, field medical transport, bridging and mobility support. Taxonomy and capability level only.',
 '[]'),

('CIV-GROUND-LIGHT','GROUND','light and assisted mobility',
 'Motorcycles, cycles, light electric mobility, powered wheelchairs and mobility devices, last-mile delivery. These are the vulnerable road users every other class in this registry is required to design around.',
 '["IMP-PEDESTRIAN-001","ER-AUTO-GAP-004"]'),

('CIV-GROUND-HERITAGE','GROUND','heritage and inherited vehicles',
 'Preservation, daily-use classics, re-engineered survivors, museum and family heirloom vehicles. Era-correct architecture first; safety changes are assessed for use, reversibility and significance.',
 '["AUTO-CLASS-HERITAGE","VEH-HERITAGE-006","CNW-HERITAGE-001"]'),

('CIV-GROUND-MOTORSPORT','GROUND','competition and exhibition',
 'Circuit, drag, rally, drift, endurance and exhibition vehicles, including monster trucks, which are never treated as road trucks.',
 '["AUTO-CLASS-MOTORSPORT","VEH-MONSTER-004","VEH-EXTREME-DEEP-004","CNW-RACING-001"]'),

('CIV-GROUND-PROTOTYPE','GROUND','development and experimental',
 'Design studies, package bucks, mules, rolling chassis, validation fleets and technology demonstrators. A prototype hazard is a prototype hazard and never becomes a production claim.',
 '["VEH-PROTOTYPE-DEEP-007"]'),

('CIV-AIR-CIVIL','AIR','civil aviation',
 'Fixed-wing, rotorcraft and VTOL research airframes carrying people or cargo. Separate aviation safety gate. No ground-vehicle evidence transfers into this class.',
 '["ER-VEH-AIR-001","THY-GUARDIAN-FLIGHT-001","SURV-AIR-OCEAN-001"]'),

('CIV-AIR-SUPPORT','AIR','aviation support and escort research',
 'Guardian Flight escort, weather reconnaissance, communications relay, external inspection and search-and-rescue coordination. In-flight structural support, load transfer and fuel transfer remain research only.',
 '["THY-GUARDIAN-FLIGHT-001"]'),

('CIV-MARINE-WORK','MARINE','working and passenger water craft',
 'Workboats, ferries, coastal freight, rescue craft and tenders. Compartmentalisation and independent steering are architecture, not options.',
 '["ER-VEH-MARINE-001"]'),

('CIV-MARINE-SUBMERSIBLE','MARINE','submersible and enclosed craft',
 'Enclosed and submerged hulls with independent life support. No safety claim without pressure-vessel, life-support, control, rescue and recovery evidence.',
 '["ER-VEH-MARINE-001","SURV-SUB-LOSSCOMMS-001"]'),

('CIV-MULTIMODE','MULTIMODE','multimode and amphibious',
 'Vehicles that change operating medium. Every mode and every transition carries its own safety case; a transition may never hide a single-point failure.',
 '["ER-VEH-MULTIMODE-001"]'),

('CIV-INFRA-ROAD','INFRASTRUCTURE','road, bridge and corridor',
 'Carriageway, drainage, texture, wind barriers, roadside sensing, corridor rescue staging and charging. Counted as mobility because a vehicle is only as safe as the surface under it.',
 '["THY-ROAD-CIRCULAR-001","CNW-ROADSAFE-001","ER-MOBILITY-TWO-LEVEL-001"]'),

('CIV-INFRA-SITE','INFRASTRUCTURE','internal site mobility',
 'Protected low-speed automated rail and pod networks inside THYLORA buildings and campuses, including the Peete Crown Refinery.',
 '["THY-SITE-MOBILITY-001"]')

on conflict (class_code) do nothing;

commit;
