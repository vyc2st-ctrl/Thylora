-- Road and bridge engineering findings.
-- These sit inside the vehicle programme on purpose: hydroplaning, crosswind
-- and stopping distance are all partly owned by the road surface.

begin;

insert into er_civ_road_finding
(finding_code, topic, question, physics_basis, plain_language, finding, numeric_targets, evidence_required, connected_program) values

('ERCIV-ROAD-BARRIER-001','bridge porous wind barriers',
 'Should bridge wind barriers be solid or porous, and how should they end?',
 'F = 0.5 * rho * Cd * A * v^2. Because force goes with the square of wind speed, any reduction in local wind speed pays back squared.',
 'A solid wall stops the wind, but it does it so abruptly that the air tumbles over the top and comes down on the far side in gusts, and at the end of the wall there is a sudden step from sheltered to fully exposed. A porous barrier lets some wind bleed through, so instead of a sharp edge you get a gentle gradient. The vehicle feels a push that builds and fades instead of a slap.',
 'Porous barriers, not solid ones, and the last stretch of barrier must be tapered rather than simply stopped. The arithmetic is the argument: because side force goes with the square of wind speed, a barrier that takes 30 percent off the local wind takes 51 percent off the push on the vehicle, since 0.7 squared is 0.49. A solid barrier can achieve a similar average reduction and still be more dangerous, because it creates a sharp shear layer, sheds vortices over the top, and ends in a step where a driver goes from sheltered to fully exposed in one vehicle length. That step is where crosswind incidents happen. Two secondary requirements are easy to forget and belong in the same record: a barrier must not block the deck drainage, and it must not cast a shade line that holds ice on the carriageway after the rest of the deck has thawed.',
 '{
   "porosity_pct":"30 to 40",
   "minimum_height_m_light_vehicles":2.5,
   "minimum_height_m_high_sided_vehicles":"4.0, subject to site anemometry",
   "end_treatment":"taper the final 40 to 60 m rather than terminating abruptly",
   "worked_example":"a 30 percent local wind speed reduction gives a 51 percent side force reduction",
   "drainage_rule":"barrier must not obstruct deck drainage",
   "ice_rule":"barrier shade must not create a persistent ice line on the carriageway"
 }',
 '["site anemometry before and after installation","wind tunnel study of the barrier section and of the taper","full-scale high-sided vehicle passes in measured crosswind","structural loading of the barrier itself under design gust","winter observation of the shade line"]',
 'CNW-ROADSAFE-001'),

('ERCIV-ROAD-DRAINAGE-001','roadway drainage and surface texture',
 'What must the road surface do so that the hydroplaning study does not become an incident?',
 'Hydroplaning onset depends on water film depth, which is set by cross slope, drainage path length, macrotexture and rut depth. None of these belong to the vehicle.',
 'Water has to get off the road, and it has to get off fast. It leaves in two ways: it runs sideways across the camber, and it hides in the tiny roughness of the surface so the tire can squeeze it out of the way. A smooth road with a flat camber and worn ruts holds a film of water across the whole lane, and that is the road that takes a vehicle from a 56 metre stop to a 393 metre one.',
 'The road owns the third hydroplaning control, and the targets are specific. Cross slope of at least 2.0 percent on tangent and 2.5 percent on high-rainfall corridors. Sheet flow path length capped at 20 to 25 metres on high-speed corridors before interception, because past that the film simply keeps deepening. Macrotexture mean profile depth of at least 0.9 mm on high-speed corridors and never below 0.7 mm. Longitudinal grooving on downgrades steeper than 3 percent and through curves, where a vehicle is already spending part of its grip budget on turning. Rut depth capped at 10 mm before intervention, because a rut is a channel that holds water exactly where the tire runs, and it converts a well-drained road into a local hydroplaning site while every other measurement still looks acceptable. Porous friction course is available and drains within the surface layer, cutting splash and spray, but it clogs, and adopting it is adopting a permanent maintenance obligation rather than a one-time improvement. The circular encapsulated recycled road layer under THY-ROAD-CIRCULAR-001 is eligible only if it meets these same texture and permeability targets; a recycled layer that cannot hold texture is not a road surface.',
 '{
   "cross_slope_min_pct":2.0,
   "cross_slope_high_rainfall_pct":2.5,
   "max_sheet_flow_path_m":"20 to 25",
   "macrotexture_mpd_mm_high_speed":0.9,
   "macrotexture_mpd_mm_absolute_min":0.7,
   "grooving_required_above_grade_pct":3.0,
   "rut_depth_intervention_mm":10,
   "porous_friction_course":"optional, carries a permanent maintenance obligation"
 }',
 '["texture depth survey on the intended corridors","drainage modelling at design storm intensity","rut depth monitoring programme with a defined intervention trigger","wet friction testing at the stated texture targets","proof that the recycled encapsulated layer holds texture and permeability over freeze-thaw cycles"]',
 'THY-ROAD-CIRCULAR-001'),

('ERCIV-ROAD-SENSING-001','roadway sensing and vehicle communication',
 'What may the road tell the vehicle, how fast, and what happens when the link fails?',
 'A safety function with a single dependency has a single point of failure. Infrastructure messaging is a dependency.',
 'Roadside sensors can see things a driver cannot: water across the carriageway over a crest, a stopped vehicle around a bend, ice forming. Telling the driver early is worth a great deal. The trap is building a vehicle that only works when the road is talking to it, because then every stretch of road without sensors becomes more dangerous than it was before anyone started.',
 'The cardinal rule is that a vehicle which loses the link must never be worse off than a vehicle that never had one. No safety function may depend solely on infrastructure messaging; corridor messages advise and warn, and they never take over. Latency budgets follow from what is being reported: one second from detection to in-vehicle display for a static hazard such as standing water, and 300 milliseconds for a sudden-onset hazard such as a vehicle stopped in a live lane over a crest, because at 100 km/h the vehicle covers 28 metres every second it waits. Confidence must be shown rather than hidden, because a bare warning icon teaches drivers to ignore it, whereas a message that says water reported on this bend two minutes ago by three vehicles is something a driver can actually weigh. And the existing prohibition from CNW-ROADSAFE-001 is carried unchanged: the corridor reports hazards, never identities, and the sensing must not be quietly repurposed into tracking people.',
 '{
   "latency_static_hazard_s":1.0,
   "latency_sudden_onset_hazard_ms":300,
   "distance_covered_per_second_at_100_kmh_m":27.8,
   "degradation_rule":"loss of link degrades to an unassisted vehicle, never to a worse one",
   "confidence_display":"what was reported, when, and by how many sources",
   "identity_rule":"hazards only, never identities"
 }',
 '["false positive and false negative rates for each hazard type","measured end to end latency under load","driver response study on whether confidence display reduces alert fatigue","privacy and due process review before any deployment","behaviour of the vehicle across the boundary between instrumented and uninstrumented corridors"]',
 'CNW-ROADSAFE-001'),

('ERCIV-ROAD-WIDTH-001','roadway width and the wide vehicle dependency',
 'The flagship van is 2080 mm wide. Do the roads it is meant to drive on actually exist?',
 'Lane width, mirror-to-mirror width and opposing traffic clearance are a system, and the vehicle is only one part of it.',
 'A vehicle designed to be wide is safer in a rollover and roomier inside, but only if the lanes are wide enough for it. Two wide vehicles passing on a narrow lane with no shoulder is a situation where the extra width has become the hazard instead of the protection.',
 'This is a cross-domain dependency and it is recorded as one rather than being left inside the vehicle programme where it would be invisible. The flagship body is 2080 mm wide and roughly 2380 mm mirror to mirror, which is comfortable in a 3.50 m lane, acceptable in 3.30 m and genuinely tight in anything under 3.15 m with opposing traffic. The Chairman direction to design roads around human comfort rather than forcing the vehicle into old road assumptions is the correct instruction, and this record is what makes it checkable: the vehicle is authorised on the assumption that the corridor standard specifies 3.50 m lanes with a usable shoulder on the routes this class is intended for. If that corridor standard is not adopted, the wide vehicle is not automatically unsafe, but its operating envelope has to be restated rather than assumed, and that restatement is a Chairman decision rather than an engineering one.',
 '{
   "body_width_mm":2080,
   "mirror_to_mirror_mm":2380,
   "comfortable_lane_width_m":3.50,
   "acceptable_lane_width_m":3.30,
   "tight_lane_width_m":3.15,
   "assumed_corridor_standard":"3.50 m lanes with usable shoulder on intended routes",
   "dependency_owner":"ERCIV-CO-STONELANE"
 }',
 '["corridor width survey on the intended routes","opposing traffic clearance study with two wide vehicles","mirror design that minimises overall width without losing field of view","a published corridor standard that this vehicle can be checked against"]',
 'CNW-ROADSAFE-001'),

('ERCIV-ROAD-CIRCULAR-001','circular encapsulated road layer, eligibility criteria',
 'What must the recycled encapsulated road layer prove before it may carry traffic?',
 'A road layer is a structural and a friction element at the same time. Recycled content may not weaken either.',
 'Using recovered material in the road is worth doing, and the reason to be careful is that the road surface is doing two jobs at once. It holds the weight, and it provides the grip. A recycled layer that holds weight but polishes smooth has failed at the job that keeps people alive.',
 'The existing programme THY-ROAD-CIRCULAR-001 is carried unchanged and given a set of eligibility criteria it did not have. The recycled encapsulated layer may carry traffic only when it meets the same macrotexture and drainage targets as ERCIV-ROAD-DRAINAGE-001, holds those targets through the corridor freeze-thaw cycle count, contains its recycled content against leaching under the specified exposure, is repairable with ordinary road plant rather than a proprietary process, and has a measured skid resistance that does not fall below the corridor threshold as it polishes. The programme currently records two blockers, no validated material stack and no field pilot evidence, and those remain open. The material recovery supplier feeding this layer is Rebatch Materials, and contaminated recyclate weakening a road layer is recorded as one of that supplier''s critical failure modes.',
 '{
   "must_meet":"ERCIV-ROAD-DRAINAGE-001 texture and drainage targets",
   "freeze_thaw":"targets must hold through the corridor freeze-thaw cycle count",
   "leaching":"recycled content contained under specified exposure",
   "repairability":"repairable with ordinary road plant, no proprietary-only process",
   "polishing":"measured skid resistance must not fall below corridor threshold over life",
   "open_blockers":["no validated THYLORA material stack","no field pilot evidence"]
 }',
 '["material stack definition and coupon testing","field pilot section with instrumented monitoring","leaching tests under the specified exposure","skid resistance measured over a polishing cycle","freeze-thaw durability testing"]',
 'THY-ROAD-CIRCULAR-001')

on conflict (finding_code) do nothing;

commit;
