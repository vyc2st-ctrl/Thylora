-- Engineering decision studies. Every number here is engineering reasoning,
-- not test evidence. confidence_state says so on every row.
-- Formulas are stated once and then explained in plain language.

begin;

insert into er_civ_engineering_study
(study_code, topic, question, method, formula, formula_plain_language,
 options, decision_matrix, worked_numbers, finding, confidence_state, evidence_required, applies_to) values

('ERCIV-STUDY-WHEELCOUNT-001','four versus six wheels',
 'Should the low-wide flagship van use four wheels or six?',
 'Compare the two architectures against the physics that actually governs grip, rollover and load, then against packaging, cost, repair and failure behaviour.',
 'F_available = mu * N   and   SSF = t / (2h)',
 'Grip: the most grip you can get is stickiness (mu) multiplied by how hard the vehicle presses down (N). N is the weight of the vehicle. The weight does not change when you add wheels, so adding wheels does not add grip. Rollover: the tipping number is the track width (t, the distance between left and right wheels) divided by twice the height of the centre of gravity (h). Wheel count is not in that equation either. What stops a vehicle rolling is being wide and low, not having more wheels.',
 '["four wheels, wide track","six wheels, tandem rear axle","six wheels with rear-most axle steering or lifting"]',
 '[
  {"criterion":"braking grip on uniform surface","four":"No penalty. Total normal force is the vehicle weight regardless of wheel count.","six":"No gain. Same weight, same total grip.","winner":"TIE","note":"This is the most misread point in the whole study."},
  {"criterion":"rollover resistance","four":"SSF 1.44 from 1780 mm track and 620 mm CG height.","six":"No improvement from wheel count. Tandem hardware adds about 180 kg high in the rear, pushing CG up and SSF slightly down.","winner":"FOUR"},
  {"criterion":"tire and axle load capacity","four":"Adequate while rear axle load stays at or below 2400 kg with 15 percent tire reserve.","six":"Clear win above that threshold. This is the one place six wheels genuinely earn their place.","winner":"SIX_ABOVE_THRESHOLD"},
  {"criterion":"brake thermal capacity","four":"Four corners of thermal mass. Adequate for 3900 kg GVM on graded descents with correct sizing.","six":"Six corners. Real benefit for sustained heavy descent duty.","winner":"SIX_FOR_HEAVY_DUTY"},
  {"criterion":"low floor and interior packaging","four":"Flat floor at 380 mm preserved end to end.","six":"Tandem axle intrudes into the rear floor and kills the flat low floor. Directly contradicts the brief.","winner":"FOUR"},
  {"criterion":"hydroplaning","four":"Two tracks through standing water.","six":"Rear tires follow the front through partly cleared water, a marginal gain, but 50 percent more tires that can hydroplane on worn tread.","winner":"FOUR_MARGINAL"},
  {"criterion":"tire failure exposure","four":"Fewer tires, so fewer failure events per distance travelled.","six":"50 percent more tire failure events, but far better tolerance of a single rear failure because the load transfers to the surviving axle.","winner":"SPLIT","note":"Six wheels avoid fewer failures and survive them better. Both are true."},
  {"criterion":"turning circle and manoeuvring","four":"Clean. No axle scrub.","six":"Tandem axles scrub in tight turns unless the rear axle steers or lifts, which adds cost and a new failure mode.","winner":"FOUR"},
  {"criterion":"cost, mass and repair","four":"Baseline.","six":"Two more tires, hubs, bearings and brake corners. Higher service cost for the life of the vehicle.","winner":"FOUR"},
  {"criterion":"crash structure","four":"Rear crush zone and rear underrun structure are unobstructed.","six":"Tandem hardware occupies rear structural space and complicates the rear load path.","winner":"FOUR"}
 ]',
 '{
  "manifest_b_kerb_mass_kg":3050,
  "manifest_b_gvm_kg":3900,
  "track_mm":1780,
  "cg_height_m":0.62,
  "static_stability_factor":1.44,
  "typical_suv_ssf_for_comparison":"1.10 to 1.20",
  "rear_axle_load_at_gvm_kg":2150,
  "per_tire_rear_load_kg":1075,
  "tandem_threshold_rear_axle_load_kg":2400,
  "estimated_tandem_hardware_mass_penalty_kg":180
 }',
 'FOUR WHEELS for the flagship van. Six wheels do not add grip and do not improve rollover, because neither grip nor rollover depends on wheel count. What makes this vehicle safe is that it is wide and low: 1780 mm of track and a 620 mm centre of gravity give a static stability factor of 1.44, against roughly 1.10 to 1.20 for a typical SUV. A tandem rear axle would destroy the flat low floor that the brief requires, add about 180 kg of high rear mass that slightly worsens rollover, add two more tires that can fail, and cost more to service for the life of the vehicle. Six wheels are retained only for a separate heavy or armored derivative, and only once rear axle load exceeds 2400 kg, which is where a single axle genuinely runs out of tire and brake capacity. The armored derivative crosses that line; the passenger flagship does not.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["measured CG height on a completed prototype","tilt-table or equivalent rollover threshold test","brake fade test at GVM on a sustained graded descent","tire load and speed rating confirmation from the tire supplier","rear axle load distribution measured loaded and unloaded"]',
 '["ERCIV-MANIFEST-B","CNW-CONCEPT-009","ERCIV-MANIFEST-C","CIV-GROUND-ARMORED"]'),

('ERCIV-STUDY-HYDROPLANE-001','hydroplaning prevention',
 'What actually sets the speed at which a tire stops touching the road, and what can the vehicle and the road each do about it?',
 'Separate the three controllables (tire pressure, tread and groove volume, water film depth) and assign each to its owner. Use the standard empirical onset relation as a starting point only.',
 'F_available = mu * N   with hydroplaning onset approximately V = 6.36 * sqrt(p)',
 'Grip is stickiness times downward force. Hydroplaning is what happens when the stickiness collapses because a film of water gets between the tire and the road: mu falls from about 0.7 in the wet to roughly 0.1, and the vehicle keeps almost all of its speed and loses almost all of its control. The onset speed in km/h is roughly 6.36 times the square root of the tire pressure in kPa. Because it is a square root, doubling the pressure does not double the safe speed, it raises it by about 40 percent. Notice what is not in that equation: the weight of the vehicle, and the width of the tire. A heavier vehicle at the same pressure simply makes a bigger footprint at the same contact pressure, so it hydroplanes at about the same speed. Wider tires are not safer in rain.',
 '["raise tire pressure","deeper tread and more groove volume","reduce water film depth on the road","narrow the tire","add vehicle mass"]',
 '[
  {"control":"tire inflation pressure","owner":"vehicle and owner","effect":"Onset speed rises with the square root of pressure. 200 kPa gives about 90 km/h, 240 kPa about 99 km/h, 300 kPa about 110 km/h.","verdict":"ADOPT, with a pressure monitor that warns before onset speed drops below the posted limit."},
  {"control":"tread depth and groove volume","owner":"tire supplier and service network","effect":"Worn tread has nowhere to put the water. This is the single largest real-world factor and it degrades silently over years.","verdict":"ADOPT. Set a service intervention depth well above the legal minimum."},
  {"control":"road water film depth","owner":"road authority","effect":"Cross slope, drainage path length, macrotexture and rut depth decide how deep the water is. The vehicle cannot fix this.","verdict":"ADOPT as a road requirement, recorded separately in er_civ_road_finding."},
  {"control":"narrower tires","owner":"vehicle","effect":"Small benefit in the deep-water case, at a direct cost in dry and wet grip, braking and load capacity.","verdict":"REJECT as a primary control. Trading away everyday grip for one rare case is a bad exchange."},
  {"control":"more vehicle mass","owner":"vehicle","effect":"Roughly neutral on onset speed, and actively worse for stopping distance and for everyone the vehicle might hit.","verdict":"REJECT."}
 ]',
 '{
  "onset_speed_kmh_at_200_kPa":90,
  "onset_speed_kmh_at_240_kPa":99,
  "onset_speed_kmh_at_300_kPa":110,
  "mu_dry":0.9,
  "mu_wet":0.7,
  "mu_hydroplaning":0.1,
  "stopping_distance_100_to_0_kmh_dry_m":43.7,
  "stopping_distance_100_to_0_kmh_wet_m":56.2,
  "stopping_distance_100_to_0_kmh_hydroplaning_m":393.3,
  "note":"All three distances are for the 3050 kg flagship van. The third number is why this study exists."
 }',
 'The number that matters is 393 metres. At 100 km/h a hydroplaning flagship van needs roughly 393 metres to stop, against 44 metres dry and 56 metres wet. It is not nine times worse than dry, it is nine times worse, and the driver has no steering either. Hydroplaning is not a grip problem the vehicle can engineer around after the fact, because once the water film forms there is nothing left to engineer with. The three controls that work are tire pressure, tread depth and water film depth, and only the first two belong to the vehicle. The third belongs to the road, which is why the road findings are part of this vehicle programme and not a separate department. Two things commonly believed are false and are rejected here: wider tires do not help, and a heavier vehicle does not resist hydroplaning.',
 'PARTIALLY_BENCHMARKED',
 '["wet braking and hydroplaning onset testing at graded water depths","tread depth degradation study across the intended service interval","tire pressure monitoring threshold tuned to onset speed rather than to a fixed low-pressure alarm","road surface texture and drainage survey on the intended corridors"]',
 '["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","CIV-INFRA-ROAD","ERCIV-SUP-TORRAND"]'),

('ERCIV-STUDY-GRIP-001','road grip and stopping distance',
 'How much grip is actually available, and what does that mean for how far the vehicle takes to stop?',
 'Apply the friction limit directly, then convert to stopping distance, for every surface the vehicle will really meet.',
 'F_available = mu * N   then   d = v^2 / (2 * a)   where a = mu * g',
 'The most grip the road can give you is stickiness (mu) times how hard the vehicle presses down (N, which is mass times gravity). That grip is a total budget: braking, turning and accelerating all spend from the same account. Brake at the limit and turn at the same time and you overspend, and the tire slides. The stopping distance then follows from speed squared divided by twice the deceleration. Speed is squared, so stopping distance from 100 km/h is four times the distance from 50 km/h, not twice.',
 '["design to dry grip","design to wet grip","design to worst credible surface"]',
 '[
  {"surface":"dry asphalt","mu":0.9,"deceleration_g":0.90,"stopping_100_kmh_m":43.7,"design_use":"Best case. Never the design case."},
  {"surface":"wet asphalt","mu":0.7,"deceleration_g":0.70,"stopping_100_kmh_m":56.2,"design_use":"The normal design case for braking system sizing."},
  {"surface":"standing water, hydroplaning","mu":0.1,"deceleration_g":0.10,"stopping_100_kmh_m":393.3,"design_use":"Prevention case. You do not brake your way out of this one."},
  {"surface":"packed snow","mu":0.25,"deceleration_g":0.25,"stopping_100_kmh_m":157.3,"design_use":"Winter corridor case for following distance advice."},
  {"surface":"ice","mu":0.12,"deceleration_g":0.12,"stopping_100_kmh_m":327.7,"design_use":"Corridor closure and hazard messaging case, not a driving case."}
 ]',
 '{
  "gravity_m_s2":9.81,
  "test_speed_kmh":100,
  "test_speed_m_s":27.78,
  "flagship_mass_kg":3050,
  "flagship_weight_N":29920,
  "dry_grip_force_N":26928,
  "compact_hatch_dry_stopping_m":42.8,
  "compact_hatch_wet_stopping_m":54.6
 }',
 'Brake sizing is set by the wet case, not the dry case, and the compact hatch and the 3050 kg flagship stop in almost the same distance because stopping distance depends on grip coefficient and speed, not on mass. Mass does not appear in the stopping distance equation at all: heavier vehicles need bigger brakes to shed more heat, but a correctly braked heavy vehicle stops in the same distance as a correctly braked light one. Where mass genuinely matters is what happens to whatever the vehicle hits, and how much heat the brakes must absorb on a long descent. The practical consequence for both manifests is that brake thermal capacity, not brake grip, is the sizing constraint.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["measured friction coefficients on the intended corridor surfaces","full vehicle braking tests at kerb mass and at GVM","brake fade testing on sustained descent","cold and hot stopping distance comparison"]',
 '["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-SUP-HALTEN"]'),

('ERCIV-STUDY-CG-001','low centre of gravity',
 'How low can the centre of gravity be driven, and what is the safety return on doing it?',
 'Build the CG from the mass model, then convert directly into rollover threshold.',
 'h = sum(m_i * h_i) / sum(m_i)   then   SSF = t / (2h)',
 'The centre of gravity height is just a weighted average: every part of the vehicle contributes its mass multiplied by its height, added up and divided by the total mass. Heavy things low down pull the average down hard. The tipping number is the track width divided by twice that height. Bigger is better. A number near 1.4 is a low car; a number near 1.1 is a tall vehicle that will roll before it slides.',
 '["floor-mounted battery pack","conventional engine and tank","raised pack for ground clearance"]',
 '[
  {"architecture":"battery pack in the floor at 300 mm","cg_height_m":0.620,"ssf":1.44,"verdict":"ADOPT for the flagship. The pack is the cheapest centre-of-gravity reduction available, because the mass has to be somewhere anyway."},
  {"architecture":"hybrid, engine and tank higher","cg_height_m":0.700,"ssf":1.27,"verdict":"PERMITTED as a range-extended derivative, with the lower rollover threshold disclosed to the buyer rather than hidden."},
  {"architecture":"raised pack for ground clearance","cg_height_m":0.700,"ssf":1.27,"verdict":"REJECT for this vehicle. Trading the rollover margin for clearance the mission does not need is a bad exchange."}
 ]',
 '{
  "body_and_occupants_mass_kg":2570,
  "body_and_occupants_cg_height_m":0.68,
  "battery_pack_mass_kg":480,
  "battery_pack_cg_height_m":0.30,
  "combined_mass_kg":3050,
  "combined_cg_height_m":0.620,
  "track_mm":1780,
  "ssf_battery":1.44,
  "ssf_hybrid":1.27,
  "improvement_over_typical_suv_pct":"about 27 percent better than an SUV at SSF 1.13"
 }',
 'The energy architecture is a rollover safety decision, not just a range decision, and that has not been written down anywhere in the existing canon. Putting 480 kg of battery at 300 mm above the ground pulls the whole vehicle centre of gravity down to 620 mm and produces a static stability factor of 1.44 on a 1780 mm track. The hybrid version of the same body, with its mass higher up, lands at 1.27. That is a real and permanent safety difference between two versions of the same vehicle, and the honest response is to permit the hybrid but disclose the difference, not to quietly market them as the same vehicle. This finding is also the direct answer to the brief: lower and wider than an SUV is not a styling preference, it is worth roughly 27 percent more rollover margin.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["measured CG height on a completed prototype, loaded and unloaded","tilt table test","dynamic rollover manoeuvre testing","mass model correlation against the built vehicle"]',
 '["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-STUDY-CROSSWIND-001','crosswind stability',
 'What does a crosswind actually do to a tall slab-sided van, and what is the right fix?',
 'Compute the side force, then compare it against both the rollover moment and the yaw behaviour, and see which one is the real problem.',
 'F = 0.5 * rho * Cd * A * v^2',
 'The wind pushes with a force that depends on four things: how thick the air is (rho, about 1.225 kg per cubic metre at sea level), how much the shape resists the flow (Cd), how big the face the wind hits is (A), and how fast the wind is going (v). The speed is squared, so it dominates everything: double the wind speed and the push goes up four times. A 90 km/h gust does four times the work of a 45 km/h gust on the same vehicle.',
 '["accept it and rely on the driver","reduce side area","add mass","move the aerodynamic centre of pressure rearward","rear steering","yaw damping through individual wheel braking"]',
 '[
  {"fix":"reduce side area","effect":"Directly reduces F, since A is in the equation.","verdict":"REJECT. The side area is the interior volume the brief asks for. This fix deletes the vehicle."},
  {"fix":"add mass","effect":"Same force acting on more mass means less acceleration sideways.","verdict":"REJECT. Buys a little gust rejection and pays for it in brake heat, tire load and harm to whatever it hits."},
  {"fix":"move centre of pressure rearward","effect":"On a blunt short nose the centre of pressure sits ahead of the centre of gravity, so a gust yaws the nose away from the wind and the driver has to catch it. Adding rear side surface and a rear vertical fence moves the pressure centre back toward the CG and the vehicle becomes directionally docile.","verdict":"ADOPT as the primary fix."},
  {"fix":"rear steering, same phase at speed","effect":"Up to 1.5 degrees of same-direction rear steer cuts yaw rate overshoot and lane deviation during a gust.","verdict":"ADOPT as the secondary fix. See ERCIV-STUDY-REARSTEER-001."},
  {"fix":"yaw damping via individual wheel braking","effect":"Stability control tuned for gust rejection rather than only for cornering.","verdict":"ADOPT as the third layer. It is software on hardware that already exists."},
  {"fix":"active aerodynamic yaw device","effect":"Could work, but introduces a device whose failure state changes the yaw moment.","verdict":"DEFER. See ERCIV-STUDY-ACTIVEAERO-001."}
 ]',
 '{
  "air_density_kg_m3":1.225,
  "side_drag_coefficient":1.1,
  "side_reference_area_m2":8.5,
  "gust_speed_kmh":90,
  "gust_speed_m_s":25,
  "side_force_N":3579,
  "side_force_kN":3.58,
  "vehicle_weight_N":29920,
  "side_force_as_pct_of_weight":12.0,
  "overturning_moment_Nm":2219,
  "restoring_moment_Nm":26629,
  "margin_ratio":12.0
 }',
 'A 90 km/h crosswind gust puts about 3.58 kN on the side of the flagship van, which is roughly 12 percent of its weight. That sounds alarming and it is not: the overturning moment is 2219 N-m against a restoring moment of 26629 N-m, a margin of twelve to one. This van does not blow over. What it does is yaw, because the aerodynamic centre of pressure on a short blunt nose sits ahead of the centre of gravity, so the gust turns the nose and the driver has to correct. The crosswind problem on this vehicle is a steering problem, not a tipping problem, and the fixes must therefore be directional: rear side surface and a rear fence to move the pressure centre back, same-phase rear steer, and stability control tuned for gusts. Making the vehicle narrower or heavier are both wrong answers, and both would have been the intuitive ones.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["wind tunnel yaw sweep to locate the real centre of pressure","full-scale crosswind track testing through a gust generator","driver response study, since the human correction is part of the system","bridge and exposed corridor anemometry"]',
 '["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-ROAD-BARRIER-001"]'),

('ERCIV-STUDY-REARSTEER-001','rear steering',
 'Should the flagship van and the modular platform steer the rear wheels?',
 'Assess the two separate jobs rear steer does, then assess what happens when it fails, because that is the decision.',
 'Low speed: opposite phase shortens the turning circle. High speed: same phase reduces yaw rate overshoot.',
 'Steering the rear wheels the opposite way to the front makes the vehicle pivot tighter, which matters because this van is 5.3 metres long. Steering them the same way as the front at speed makes the vehicle change lanes more calmly instead of swinging its tail. The catch is simple: if the rear steering ever jams off-centre, the vehicle is permanently crabbing and the driver is fighting it. So the whole decision comes down to whether it can be made to always fail back to straight.',
 '["no rear steer","rear steer, electronic centring only","rear steer, mechanical centring plus redundant sensing and independent lock"]',
 '[
  {"option":"no rear steer","turning_circle_m":12.9,"crosswind_benefit":"none","failure_risk":"none","verdict":"Baseline. Acceptable but leaves a 5.3 m vehicle awkward in towns."},
  {"option":"electronic centring only","turning_circle_m":11.3,"crosswind_benefit":"good","failure_risk":"A power or controller loss can leave the rear wheels wherever they were.","verdict":"REJECT. The failure state is a loss-of-control event."},
  {"option":"mechanical centring, redundant position sensing, independent lock","turning_circle_m":11.3,"crosswind_benefit":"good","failure_risk":"Fails to centre and locks there. Vehicle degrades to a conventional van.","verdict":"ADOPT, gated on proof of fail-to-centre."}
 ]',
 '{
  "low_speed_rear_angle_deg":"up to 5",
  "high_speed_rear_angle_deg":"up to 1.5 same phase",
  "high_speed_engagement_threshold_kmh":70,
  "turning_circle_without_rear_steer_m":12.9,
  "turning_circle_with_rear_steer_m":11.3,
  "improvement_m":1.6
 }',
 'ADOPT rear steering on the flagship and the modular platform, conditional on one thing: it must fail to centre and lock there, by mechanical spring centring backed by redundant position sensing and an independent lock, not by software alone. Rear steer earns its place twice over, cutting the turning circle from 12.9 m to 11.3 m in town and damping the crosswind yaw identified in ERCIV-STUDY-CROSSWIND-001 at speed. But a rear steer system that can jam off-centre is worse than no rear steer at all, because a permanently crabbing 3 tonne van is a loss-of-control condition rather than an inconvenience. The whole approval rests on that one proof, and until it exists this stays a conditional adoption.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["fail-to-centre demonstration under power loss, controller loss and sensor disagreement","turning circle measurement on the built vehicle","crosswind yaw testing with rear steer active and disabled","durability of the centring mechanism over vehicle life"]',
 '["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-STUDY-ACTIVEAERO-001','active aerodynamics',
 'Which active aerodynamic devices, if any, should the flagship van carry?',
 'Sort candidate devices by what happens when each one fails in the worst position, not by what each one gains when it works.',
 'F = 0.5 * rho * Cd * A * v^2',
 'Active aerodynamics means moving parts that change the shape of the vehicle as it goes faster, to cut drag or add stability. The gain is real because the force goes up with the square of speed, so small changes matter a lot at highway pace. The danger is that every moving part has a position it can get stuck in, and the question that decides everything is what the vehicle does when it gets stuck there at speed.',
 '["active grille shutters","ride height lowering at speed","active rear yaw device","active front dam"]',
 '[
  {"device":"active grille shutters","gain":"Lower drag when cooling is not needed, faster cabin and battery warm-up in cold weather.","worst_failure":"Stuck closed causes overheating, which is detectable and manageable by derating.","verdict":"APPROVE."},
  {"device":"ride height lowering above 100 km/h","gain":"Lower centre of gravity and lower frontal area at the speed where both matter most.","worst_failure":"Stuck low reduces ground clearance, which is a comfort and kerb-strike problem, not a control problem. Stuck high is simply the baseline vehicle.","verdict":"APPROVE. Both failure states are benign."},
  {"device":"active rear yaw device","gain":"Could counter crosswind yaw directly.","worst_failure":"Stuck deployed to one side adds a permanent yaw moment, which is exactly the failure this vehicle must never have.","verdict":"DEFER. Rear steering solves the same problem with a failure state that can be made safe."},
  {"device":"active front dam","gain":"Small drag and front lift benefit.","worst_failure":"Stuck deployed becomes a low obstruction that catches kerbs and ramps and can shift the front aerodynamic balance.","verdict":"REJECT for this vehicle. The gain does not pay for the failure mode on a family vehicle."}
 ]',
 '{"principle":"No active aerodynamic device may have a failure state that increases yaw sensitivity. Every approved device must fail to neutral or to the baseline vehicle."}',
 'APPROVE grille shutters and speed-dependent ride height. DEFER the active rear yaw device and REJECT the active front dam. The governing rule, which should apply to every THYLORA vehicle and not only this one, is that no active aerodynamic device may have a failure state that increases yaw sensitivity. Grille shutters and ride height both fail into either the baseline vehicle or a clearly detectable degraded state. An active yaw device stuck deployed to one side is a permanent uncommanded steering input at speed, and rear steering already solves that problem with a failure mode that can be engineered to be safe. This is the general pattern worth carrying forward: prefer the solution whose broken state is boring.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["CFD and wind tunnel confirmation of the drag and stability gains","failure-mode testing of each device in its worst stuck position at speed","icing and debris jamming tests","durability over the service life"]',
 '["ERCIV-MANIFEST-B","ERCIV-MANIFEST-C"]'),

('ERCIV-STUDY-ENERGY-001','energy architectures',
 'Which energy architectures are approved, for which manifests, and what does each one cost in safety and serviceability?',
 'Compare on the axes that actually differ: centre of gravity, refuelling time, cold performance, packaging against a low flat floor, failure behaviour, and maintenance burden.',
 'Reuses SSF = t / (2h) from ERCIV-STUDY-CG-001, because the energy choice moves h.',
 'Where you put the energy decides how low the vehicle sits, how long it takes to refill, what happens in a cold winter, and how many separate systems a mechanic has to maintain. Batteries are heavy and go in the floor, which is good for stability. Fuel and engines sit higher and need more servicing. Hydrogen refills fast but its tanks are big round pressure vessels that fight a flat floor.',
 '["battery electric","hybrid","hydrogen fuel cell","other in-world energy architectures"]',
 '[
  {"architecture":"battery electric","cg_effect":"Best. Pack in the floor, SSF 1.44.","refuel":"Slow. Corridor charging availability becomes a safety issue during evacuation.","cold":"Range loss in cold, and it must be stated as range loss and not hidden.","packaging":"Excellent with a flat floor.","failure":"Thermal runaway propagation and underbody strike are the governing hazards.","maintenance":"Fewest fluids and filters.","verdict":"APPROVE as the baseline for all three manifests."},
  {"architecture":"hybrid","cg_effect":"Worse. SSF 1.27 on the same body.","refuel":"Fast and universally available.","cold":"Good.","packaging":"Compromised. Tank, engine and exhaust all fight the low floor.","failure":"Two energy systems, two sets of hazards, and a fuel system alongside a battery.","maintenance":"Highest. Two systems, more filters, more fluids.","verdict":"PERMIT as a range-extended derivative with the lower rollover threshold disclosed."},
  {"architecture":"hydrogen fuel cell","cg_effect":"Poor. High-pressure cylindrical tanks sit high and are hard to place low.","refuel":"Fast.","cold":"Good.","packaging":"Hostile to a low flat floor. This is the deciding factor, not the fuel itself.","failure":"Tank crash integrity and thermal relief venting direction must be designed around occupants and rescuers.","maintenance":"Moderate.","verdict":"RESEARCH ONLY for these manifests. Revisit for the heavy haul and logistics classes where the packaging conflict does not apply."},
  {"architecture":"other in-world energy architectures","cg_effect":"UNKNOWN","refuel":"UNKNOWN","cold":"UNKNOWN","packaging":"UNKNOWN","failure":"UNKNOWN","maintenance":"UNKNOWN","verdict":"Held at taxonomy level. No performance claim, no range claim, no safety claim. UNKNOWN stays UNKNOWN."}
 ]',
 '{
  "manifest_a_battery_pack_kwh_usable":42,
  "manifest_a_hybrid_tank_litres":38,
  "manifest_b_battery_pack_kwh_usable":118,
  "shared_body_in_white_rule":"Manifest A uses one body-in-white for both the battery and hybrid variants, so crash structure is validated once and the affordable variant does not get a cheaper cell."
 }',
 'Battery electric is the baseline for all three manifests, principally because the pack in the floor buys the rollover margin documented in ERCIV-STUDY-CG-001. Hybrid is permitted as a range-extended derivative provided the lower rollover threshold is disclosed rather than buried. Hydrogen is held at research only for these three vehicles, and the reason is packaging rather than the fuel: high-pressure cylindrical tanks are fundamentally hostile to the low flat floor that defines both the flagship and the modular platform. Hydrogen should be revisited for heavy haul and logistics, where the low floor is not a requirement and the fast refuel is worth more. Other in-world energy architectures stay at taxonomy level with no claim attached to them.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["pack thermal runaway propagation testing","underbody strike testing against a defined intrusion limit","cold weather range measurement, stated as measured not modelled","hydrogen tank crash and vent direction study before any hydrogen programme proceeds","corridor charging availability modelling for evacuation scenarios"]',
 '["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-SUP-CINDREL","ERCIV-SUP-CURRENTMARK"]'),

('ERCIV-STUDY-FILTER-001','filter maintenance and pressure-loss limits',
 'What are the filter change limits, who owns them, and is any filter a safety item?',
 'Set every filter limit by measured pressure loss rather than by distance alone, then ask what each filter protects.',
 'Replace at 2x clean pressure drop, or at the stated limit, whichever comes first.',
 'A filter works by making air or fluid squeeze through a fine mesh. As it fills with dirt, the squeeze gets harder, and that resistance is measured as a pressure drop across the filter. When the pressure drop has roughly doubled from new, the filter is doing more harm than good, because the flow it was supposed to deliver is no longer getting through. Time and distance are poor guides, because a filter in a dusty place fills up far faster than the same filter somewhere clean.',
 '["distance-based intervals","time-based intervals","measured pressure-drop limits with an indicator"]',
 '[
  {"filter":"cabin air filter","clean_dp_Pa":"60 to 90","replace_dp_Pa":"150 to 180","interval_fallback":"12 months or 20000 km","protects":"Windscreen demist and defrost airflow, and the air the occupants breathe.","classification":"SAFETY RELEVANT."},
  {"filter":"battery pack coolant filter","clean_dp_kPa":"8 to 12","replace_dp_kPa":"20 to 24","interval_fallback":"by condition monitoring","protects":"Pack thermal management.","classification":"SAFETY RELEVANT."},
  {"filter":"engine intake filter, hybrid variant only","clean_dp_kPa":"1.0 to 1.5","replace_dp_kPa":"2.5","interval_fallback":"restriction indicator","protects":"Engine wear and efficiency.","classification":"Reliability."},
  {"filter":"HVAC recirculation filter","clean_dp_Pa":"40 to 60","replace_dp_Pa":"110","interval_fallback":"24 months","protects":"Cabin air quality.","classification":"Comfort and health."}
 ]',
 '{
  "rule":"Replace at twice the clean pressure drop or at the stated limit, whichever is lower.",
  "access_target_cabin_filter":"2 minutes, no tools, no structural or safety component removed",
  "repairability_link":"ER-AUTO-GAP-005"
 }',
 'The cabin air filter is a safety item and should be reclassified as one across the whole vehicle canon. A clogged cabin filter cuts demist and defrost airflow, and a driver who cannot clear the windscreen cannot see, which makes it a visibility failure rather than a comfort inconvenience. Filing it under comfort is why it gets deferred in a busy service bay, and that deferral has a safety consequence. Two rules follow. Every filter limit is set by measured pressure drop, at twice the clean value or the stated limit, whichever is lower, because distance intervals are wrong in both directions depending on where the vehicle lives. And every filter must be reachable without removing a structural or safety component and without special tools, with the cabin filter specifically reachable in two minutes with no tools, which connects this study directly to the open repairability gap ER-AUTO-GAP-005.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["measured clean and loaded pressure drop for each filter at rated flow","demist and defrost performance test with a filter loaded to the replacement limit","dust loading rates across the intended operating environments","service access time trial on the built vehicle"]',
 '["ERCIV-MANIFEST-A","ERCIV-MANIFEST-B","ERCIV-MANIFEST-C","ERCIV-SUP-SIEVEWORKS","ERCIV-SUP-ROUNDHOUSE"]'),

('ERCIV-STUDY-MAGROAD-001','magnetic and inductive road concepts',
 'Should any vehicle programme depend on power delivered by the road surface?',
 'Assess the physics honestly and then assess what happens to a vehicle programme that assumed it.',
 'Coupling efficiency falls sharply with lateral misalignment and with air gap.',
 'The idea is to put coils in the road that push energy up into a coil under the vehicle, so it charges as it drives. It works in a laboratory. On a real road the vehicle is never perfectly lined up with the coil, and the gap to the road changes with load and suspension movement, and efficiency falls away fast as either of those grows. Then there is the road itself, which freezes, cracks, ruts and has to be dug up for repair.',
 '["static inductive charging","dynamic in-road charging","conductive rail","no road-delivered power"]',
 '[
  {"concept":"static inductive pad charging","maturity":"Demonstrated.","blocker":"Efficiency and cost against a plug that already works.","verdict":"RESEARCH ONLY. No programme may depend on it."},
  {"concept":"dynamic in-road charging","maturity":"Demonstrated in trials only.","blocker":"Alignment and air gap losses, cost per lane-km unresolved, freeze-thaw and rutting, repair access, and foreign-object heating where a steel object lying on an energised coil heats up.","verdict":"RESEARCH ONLY. Explicitly barred from any vehicle range or duty-cycle assumption."},
  {"concept":"conductive rail or overhead","maturity":"Mature in fixed transit.","blocker":"Only viable on dedicated fixed routes.","verdict":"Consider for CIV-INFRA-SITE and fixed transit corridors only."},
  {"concept":"no road-delivered power","maturity":"Current.","blocker":"None.","verdict":"BASELINE for all three manifests."}
 ]',
 '{"hazard_note":"Foreign-object heating is a genuine public safety hazard, not a technical footnote: a steel object lying on the road above an energised coil can heat to burn temperature where a person may pick it up."}',
 'RESEARCH ONLY, and specifically barred from the range, duty cycle or charging assumptions of any of the three manifests. The concept is real and worth watching, but a vehicle programme that quietly assumes road-delivered power is a programme that fails completely if the road never gets built, and the cost per lane-km is unresolved, which means nobody can yet say whether it will be. The foreign-object heating hazard also deserves to be recorded plainly rather than left as a technical footnote, because it is a risk to people on foot rather than to the vehicle. Conductive rail remains worth considering for the internal site mobility network, where the route is fixed and the environment is controlled.',
 'RESEARCH_ONLY',
 '["independent efficiency measurement across realistic misalignment and air gap ranges","cost per lane-km including maintenance and repair access","freeze-thaw and rutting durability of embedded coils","foreign-object heating hazard assessment and mitigation","a decision on whether any corridor will actually be built before any programme may reference it"]',
 '["CIV-INFRA-ROAD","CIV-INFRA-SITE","THY-ROAD-CIRCULAR-001"]'),

('ERCIV-STUDY-AVIATION-GATE-001','flying vehicles and aircraft safety gating',
 'Under what conditions may an aviation programme make any claim, produce any imagery, or share evidence with a ground programme?',
 'Define the gate before any aviation work proceeds, because the existing Guardian Flight programme is already active with no certification path.',
 null,
 'An aircraft cannot borrow a car crash test. The evidence that makes a road vehicle safe says nothing whatsoever about whether an aircraft will stay in the air, and treating one as support for the other is how a programme talks itself into a claim it cannot back. So aviation gets its own gate, and nothing crosses it in either direction.',
 '["shared evidence with ground programmes","fully separate aviation gate"]',
 '[
  {"rule":"Aviation programmes may not inherit ground-vehicle evidence.","state":"BINDING","note":"Consistent with the existing ER-VEH-MULTIMODE-001 rule that each mode and transition carries its own safety case."},
  {"rule":"No flight performance number, range, endurance or escort capability may be stated without an airworthiness basis.","state":"BINDING"},
  {"rule":"No imagery may depict a THYLORA aircraft in operation, in escort, or carrying people, while the programme has no certification path.","state":"BINDING","note":"Guardian Flight is currently ACTIVE_DESIGN with no aerodynamic or structural validation, no certification path and no prototype."},
  {"rule":"In-flight structural support, replacement-wing load transfer and fuel transfer or docking remain research only.","state":"BINDING","note":"Carried unchanged from THY-GUARDIAN-FLIGHT-001."},
  {"rule":"Human priority is passengers and crew, ahead of airframe recovery and ahead of mission completion.","state":"BINDING","note":"Carried from THY-GUARDIAN-FLIGHT-001 and ER-VEH-SPACE-001."}
 ]',
 '{"existing_blockers_carried_forward":["No aerodynamic or structural validation","No certification path","No prototype, operator or manufacturer commitment"]}',
 'A separate binding aviation gate is established, and it is needed now rather than later: Guardian Flight is already recorded as ACTIVE_DESIGN while simultaneously holding blockers that say there is no aerodynamic validation, no certification path and no prototype. That combination is exactly the state in which an escort capability gets described as though it exists. The gate states that aviation evidence never crosses with ground evidence in either direction, that no flight performance or escort claim may be made without an airworthiness basis, and that no imagery may show a THYLORA aircraft in operation while the programme stands where it does. The in-flight structural support and fuel transfer concepts remain research only, unchanged from the existing record.',
 'ENGINEERING_REASONING_EVIDENCE_OPEN',
 '["an airworthiness basis and a named certification path before any performance claim","aerodynamic and structural validation","prototype, operator and manufacturer commitment","separate aviation safety case per airframe and per mission"]',
 '["CIV-AIR-CIVIL","CIV-AIR-SUPPORT","THY-GUARDIAN-FLIGHT-001","ERCIV-CO-HALERIN","ERCIV-CO-KESTRIN"]')

on conflict (study_code) do nothing;

commit;
