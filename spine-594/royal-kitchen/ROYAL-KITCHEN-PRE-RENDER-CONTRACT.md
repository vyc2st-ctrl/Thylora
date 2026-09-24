# ROYAL KITCHEN — PRE-RENDER CONTRACT

**DO NOT RENDER — awaiting Chairman approval** · Contract `PRC-SCENE-WW-001-ROYAL-KITCHEN-594` · Scene `SCENE-WW-001-ROYAL-KITCHEN-20260922` · Reserved serial `ER-VIS-20260922-0001` · Status **BLOCKED** · No image was generated.

Work items: `THY-WORK-FIRST-POST-TODAY-588`, `THY-WORK-KITCHEN-CAUSAL-REVIEW-591`, `THY-WORK-VISUAL-IDENTITY-REGRESSION-592`, `THY-WORK-VISUAL-IMMUTABILITY-GATE-593`. Floor plan: [`floorplan.svg`](floorplan.svg). Machine-readable twin: [`pre-render-contract.json`](pre-render-contract.json).

Tags: **RECOVERED** = read from a named backend row or git branch file · **DERIVED** = computed from recovered values by stated arithmetic · **PROPOSED** = authored here or in an earlier unapplied packet; needs Chairman acceptance · **UNKNOWN** = no source exists; must not be invented

## 0 · Blockers (why this is BLOCKED)

| ID | Blocker | Detail | Clears when |
|---|---|---|---|
| B1 | SOURCE_ANCHOR_MISSING | source_asset_hash for the original approved Royal Kitchen still is NULL in SCENE-WW-001; no visual_assets/serial/delivery row; /mnt/data absent. HERB-ROYAL-KITCHEN-001 hash 0e5d5579…b2e8 is a different pre-workflow base image and is not assumed. | Chairman supplies the anchor file; its SHA-256 is computed and registered; camera/aspect re-solved against it |
| B2 | STYLE_REFERENCE_UNBOUND | painterly/etched render bytes/hash not in backend | file registered as STYLE_REFERENCE_ONLY with hash |
| B3 | NO_EXPLICIT_GENERATION_DIRECTION | THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001 | Chairman explicitly directs generation in the current turn after approving this contract |
| B4 | BRAND_RULE_CONFLICTS | in-world VYC2ST/ERSATZREALITY marks vs 589 "no maker mark while makers are OPEN"; THYLORA globe-O required by 570 but NOT_APPROVED; VYC2ST glyph file IMG_7689.png unbound | Chairman rules marks are architectural works marks (or chooses fallbacks) and waives/supplies THYLORA mark |
| B5 | GEOMETRY_AND_OBJECTS_UNREGISTERED | room dims, door/window positions and object positions are PROPOSED (576 branch + this contract); backend geometry NULL, object_state_registry/object_events/space_connections empty | Chairman accepts PROPOSED values and they are written to thylora_castle_space_geometry / object_state_registry |
| B6 | WW_RESCORE_FAIL | WW 3840 < 4096 with B=3 | B4 resolved (B→4) and rendered-frame re-score |
| B7 | MEMBRANE_INTENSITY_CONFLICT | 0.18–0.28 "unmistakable" vs "visible only on close inspection" | Chairman confirms 0.18-floor fine-frequency setting |
| B8 | NINE_CLASS_RULE_VS_INVENTORY | day-list board/ledger box (serial carrier), residue cloth, fuel and Veronica's bundle are outside the nine permitted equipment classes | Chairman admits RECORD + personal effects, or serial falls back to the day crock and bundle is removed |
| B9 | ANCHOR_GEOMETRY_NOT_MEASURED | camera numbers are DERIVED from recovered text inside a PROPOSED room, not measured from the anchor still | re-solve station/yaw from anchor image vanishing lines and figure heights once B1 clears |

## 1 · Source asset binding

- **anchor_role**: Earlier (pre-painterly) Royal Kitchen still = geometry + face identity anchor **[RECOVERED]** _source: thylora_query_carryforward:592 + thylora_execution_work_registry:THY-WORK-VISUAL-IDENTITY-REGRESSION-592_
- **style_reference_role**: Newer painterly/etched render = STYLE REFERENCE ONLY **[RECOVERED]** _source: thylora_query_carryforward:592 + thylora_execution_work_registry:THY-WORK-VISUAL-IDENTITY-REGRESSION-592_
- **source_asset_hash**: — **[UNKNOWN]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.source_asset_hash is NULL; no thylora_visual_assets / thylora_visual_serial_registry / thylora_delivery_assets row for either Royal Kitchen render; /mnt/data not present in this container_ — NOTE: BLOCKER B1. The only kitchen image hash in the backend is 0e5d557908f63a25f0f117c1f1a9edcbdd6df97151d6b74f159437017d58b2e8 (HERB-ROYAL-KITCHEN-001, /mnt/data/old_world_kitchen_drama.png, ER-VIS-20260918-0003, BASE_IMAGE_ONLY_NOT_PUBLICATION_READY). It is a different, pre-workflow scene and packet ROYAL-COOK-ONE-HERB-571 says it must not be reused; it is NOT assumed to be the anchor.
- **style_reference_hash**: — **[UNKNOWN]** _source: no backend row_ — NOTE: BLOCKER B2
- **binding_state**: BLOCKED_ON_SOURCE_ASSET_BINDING

## 2 · CAMERA

- **datum**: RK-D0 = inner face of the south-west corner of the Royal Kitchen at finished floor level. +X east along the south wall, +Y north toward the hearth wall, +Z up. Units cm. Axis convention follows THYW-FRAME-CASTLE-001 (RIGHT_Z_UP, +Y grid north); the kitchen's own placement in that frame is UNKNOWN. **[PROPOSED]** _source: axis rule: git origin/claude/castle-world-coordinates-dertlm:world/data/master-coordinate-system.json_
- **room_box_cm**: {"x": 1400, "y": 1000, "z": 850, "wall_thickness": 110} **[RECOVERED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_ — NOTE: PROPOSED dimensions (14.00 × 10.00 × 8.50 m, walls 1.10 m); backend thylora_castle_space_geometry THY-CASTLE-ROYAL-KITCHEN-001 has width/depth/height NULL, measurement_state UNKNOWN
- **station_description**: fixed single frame, just inside the passage door, left of centre; three-quarter across the long work table toward the hearth; level horizon, no tilt, no hero angle, no overhead; no movement **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.camera_
- **station_xyz_cm**: [650, 110, 155] **[DERIVED]** _source: x/y placed to satisfy the recovered station text inside the PROPOSED room; z = recovered height 1.55 m_ — NOTE: x=650 is 50 cm west of the south-wall centre (left of centre); y=110 is 1.10 m inside the wall face of passage door P1 (x 580–720). Not measured from the anchor still (bytes missing).
- **height_cm**: 155 **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.camera.height_m=1.55_
- **yaw_deg**: 48.0 **[DERIVED]** _source: solved so all three figures are in frame, faces ≤ ~74° from camera, and apparent heights are honest; bearing east of +Y_
- **pitch_deg**: 0.0 **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 horizon "level — no tilt"_
- **roll_deg**: 0.0 **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922_
- **lens_focal_length_mm_equiv**: 35 **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.camera.lens_equivalent_mm_
- **sensor_format**: 36 × 24 mm full-frame equivalent, 3:2 landscape, reference raster 6000 × 4000 px **[PROPOSED]** — NOTE: aspect of the anchor still is UNKNOWN; if the anchor is 4:5 or 16:9 the horizontal FOV and x-positions change and must be recomputed
- **fov_deg**: {"horizontal": 54.43, "vertical": 37.85, "diagonal": 63.44} **[DERIVED]** _source: FOV = 2·atan(sensor_dim / (2·35))_
- **horizon_line**: Exactly at the vertical centre of frame (y = 2000 px of 4000) because pitch = 0; it is the eye-height plane z = 155 cm. It crosses Inés 2.4 cm above her eyes (brow), Veronica 0.4 cm below her eyes (at the lids), Clara 2.2 cm below her eyes (upper cheek). **[DERIVED]** _source: eye height = 0.936 × stature (PROPOSED anthropometric ratio)_
- **vanishing_points**: Table long axis and hearth-wall courses (+X, east) vanish to the RIGHT: VP_x at x_s = 35·cos48°/sin48° = +31.5 mm → x ≈ 8250 px (outside frame right). East-wall courses, door and window reveals (+Y, north) vanish to the LEFT: VP_y at x_s = −35·sin48°/cos48° = −38.9 mm → x ≈ −3480 px (outside frame left). Both VPs lie on the horizon; verticals stay vertical (no keystone) because pitch = 0. **[DERIVED]**
- **focus**: work table sharp; hearth soft at the back **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922_
- **focus_plane_proposed**: Z ≈ 700–750 cm (all three figures, knife, table east end) sharp; H1 hearth (Z ≈ 967) and W1 (Z ≈ 992) slightly soft **[PROPOSED]**
- **person-to-camera distances**:
  - Ines Morales: {"depth_along_axis_Z": 746.3, "horizontal_distance": 777.0} **[DERIVED]**
  - Veronica Hall: {"depth_along_axis_Z": 710.5, "horizontal_distance": 733.6} **[DERIVED]**
  - Clara Bennett: {"depth_along_axis_Z": 707.5, "horizontal_distance": 779.7} **[DERIVED]**

### 2.1 APPARENT-HEIGHT CHECK

Equation: `y_head = f · (H − h_c) / Z   and   h_app = f · H / Z   (pinhole, level camera)` · inputs: f = 35 mm, h_c = 155 cm, frame 36 × 24 mm = 6000 × 4000 px.

| Person | True H (cm) | Depth Z (cm) | Head above horizon (mm / px) | Head-top y (px) | Feet y (px) | Apparent height (px) | H/Z | Share of own figure above horizon |
|---|---|---|---|---|---|---|---|---|
| Ines Morales | 163 | 746.3 | 0.375 / 63.0 | 1937 | 3212 | 1275 | 0.21841 | 4.9 % |
| Veronica Hall | 166 | 710.5 | 0.542 / 90.0 | 1910 | 3272 | 1362 | 0.23364 | 6.6 % |
| Clara Bennett | 168 | 707.5 | 0.643 / 107.0 | 1893 | 3278 | 1385 | 0.23746 | 7.7 % |

**Result:** HONEST. Apparent order Clara (1385 px) > Veronica (1362 px) > Inés (1275 px) matches true order 168 > 166 > 163. Head-tops above the horizon: Clara 107 px > Veronica 90 px > Inés 63 px. Tag: DERIVED.

**Why it holds:** Clara and Veronica stand at nearly the same depth (707.5 vs 710.5 cm, ratio 0.996) so their 2 cm true difference survives (ratio of apparent heights 1.017 ≥ true ratio 1.012). Inés is 36 cm deeper (746.3 cm) so she projects 6.4 % smaller than Veronica, of which 1.8 % is her true height and 4.8 % is depth (0.982 × 0.952 = 0.936).

**How perspective can invert it:** Apparent height is H/Z, not H. Any person 1 % nearer than another appears 1 % larger. Because the true differences here are only 1.2 %–3.1 %, small depth changes invert the on-image order: from this station Clara standing 12 cm deeper (Z > 719.1) makes her look shorter than Veronica, and Inés standing 49 cm nearer (Z < 697.7) makes her look taller than Veronica. A trial layout that read 589 literally (camera near the south-west, Clara on a far east doorway, Inés near the camera) inverted the order: Inés Z 765 vs Clara Z 1032 gave Inés 1242 px and Clara 949 px although Clara is 5 cm taller. That layout was rejected for this contract.

**The check that keeps it honest:** With a LEVEL camera whose height (155 cm) is below all three statures and between their eye heights, the horizon line cuts every figure at z = 155 cm. The fraction of each figure that rises above the horizon, (H − 155)/H, is independent of distance: Inés 4.9 %, Veronica 6.6 %, Clara 7.7 %. That ordering can never be inverted by depth. A camera above 168 cm, any down-tilt, or a step/plinth under any figure destroys this check and is prohibited.

**Station constraints:**
- camera z = 155 cm ± 0; pitch 0; roll 0
- Z_Clara ≤ Z_Veronica × 168/166 (currently 707.5 ≤ 719.1 ✓)
- Z_Veronica ≤ Z_Inés × 166/163 (currently 710.5 ≤ 760.0 ✓)
- all three stand on the same level flag course (floor fall only at x < 200)
- no threshold step at D1 (Clara stands on the threshold stone flush with the kitchen flags) — PROPOSED

**Equal-depth alternative:** A station that puts all three at identical depth would sit ~0.8 m south of the south wall face (inside the wall/passage); it is not physically available in this room, so the constraint set above is the honest station.

## 3 · APPARENT-HEIGHT EQUATION — MATH DISPLAY LAW

### y_head = f · (H − h_c) / Z

**1 · WHOLE EQUATION:** `y_head = f · (H − h_c) / Z      (with h_app = f · H / Z)`

**2 · LEFT SIDE:** y_head — how far above the horizon line a person's head-top lands on the image (mm on the sensor; × 166.67 = pixels on a 6000 × 4000 frame).

**3 · EQUAL SIGN:** The image position is fixed completely by the numbers on the right; nothing about art style can change it.

**4 · RIGHT SIDE:** f · (H − h_c) / Z — the lens focal length multiplied by how much taller the person is than the camera, divided by how far away they are along the lens axis.

**5 · EVERY SYMBOL**
- `y_head` — head-top height above horizon on the image
- `f` — focal length (here a plain number, 35 mm — in this equation f is NOT "function of")
- `H` — person's true standing height
- `h_c` — camera (lens centre) height above the floor
- `Z` — depth: distance from camera to the person measured along the lens axis
- `h_app` — apparent (projected) full height of the figure

**6 · EVERY UNIT**
- `y_head` — mm on sensor (or px)
- `f` — mm
- `H` — cm
- `h_c` — cm
- `Z` — cm
- `h_app` — mm (or px)
- `note` — cm/cm cancels, leaving mm

**7 · PLAIN SPEECH:** Things further away look smaller; a person only looks taller than someone else if they really are taller OR they are standing closer. Where the head sits against the horizon line tells you the truth.

**8 · REAL EXAMPLE:** Clara: 35 × (168 − 155) / 707.5 = 0.643 mm = 107.0 px above horizon; full figure 35 × 168 / 707.5 = 8.31 mm = 1385 px. Veronica 90.0 px / 1362 px. Inés 63.0 px / 1275 px.

**9 · WHERE SOMEONE WOULD USE IT:** Pre-render blocking of the three figures; post-render drift check (measure head-top pixels on the delivered image and compare); any photographer placing people of known height.

**10 · WHAT THE ANSWER MEANS:** Clara 107 px > Veronica 90 px > Inés 63 px above horizon and 1385 > 1362 > 1275 px tall: the image tells the truth about 168 > 166 > 163 cm. A delivered render with a different order has changed a height, a depth or the camera — reject it.

**11 · NEXT QUESTION:** What exact aspect ratio and crop did the anchor still use? The x-positions and the headroom above the heads depend on it; the height order does not.

## 4 · ROOM

- **walls**: coursed stone masonry, limewashed, soot-graded: darkest over the hearth bay, scrubbed pale to ~1.2 m behind the table; 110 cm thick with deep splayed window reveals **[PROPOSED]** _source: WR-WORLD-WINDOW-583 §10 (limewashed ashlar) + 576 wall thickness_ — NOTE: Backend finish_system.exact_wall_finish = UNKNOWN; manifest 589 says "render as unresolved period masonry and timber, name nothing" — nothing in the image may name the stone
- **floor**: stone flags, traffic-polished along the hearth-to-table line, dull at the edges; level over the working area; shallow fall toward the scullery drain confined to the west 2 m strip; swept and dry at this hour **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) + ROYAL-COOK-ONE-HERB-571 surfaces_ — NOTE: exact stone, flag size and coursing UNKNOWN
- **ceiling**: smoke-darkened timber beams boarded over the prep-table line (beams carry the herb hook); open to the roof over the hearth bay with a louvred lantern; top at 850 cm **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_ — NOTE: CONFLICT: 583 proposed a barrel vault; 571 dark timber; backend exact_ceiling UNKNOWN. Timber chosen because a beam must carry the herb hook and 589 says "masonry and timber".
- **hearth**: two open hearths on the north wall (PROPOSED): H1 (x 980–1320) live at working heat — "lit and working, not roaring" — iron crane swung in with one cauldron; oak bressummer beam 30 cm deep over the opening at z 240–270; spit racked idle at the east jamb. H2 (x 560–860) banked and raked, cold. Boiling range x 150–450 out of frame. **[PROPOSED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 room_state (hearth lit/working, spit idle) + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) (two open hearths, spit range, boiling range)_
- **oven_baking**: No oven in the kitchen. Bread and pastry are baked in two masonry beehive ovens in the bakehouse through the west-wall arch (out of frame): wood-fired, raked, ash into an iron-lidded ash box; bread is drawn at first light (KIT-S-FIRSTLIGHT) by HH-1700-BAKER. **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-BAKEHOUSE-01 + thylora_kitchen_posts KIT-P-OVEN + thylora_kitchen_shift_segments_
- **cooling_storage**: Cold store off the service corridor, three steps down, north louvred windows; cooling method UNKNOWN (open field in backend). Day larder issues cut goods through a hatch (counter z 95) in the west wall. Nothing cold is kept in the kitchen. **[RECOVERED]** _source: thylora_kitchen_stores KIT-ST-COLD (open_fields cooling_method) + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_
- **cheese_milk**: Dairy is held in the cold store in shallow trays; supplier SUP-CLASS-DAIRY identity OPEN. A dedicated cheese/milk room is UNKNOWN. None in frame. **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) + thylora_kitchen_suppliers_
- **broom_storage**: UNKNOWN in every source. PROPOSED: a birch besom hung head-up on two iron pegs inside the scullery door reveal (out of frame). No broom in frame. **[UNKNOWN]**
- **washing**: stone sink with piped standpipe at the west (scullery) end of the kitchen; scullery beyond has two lead-lined wash troughs, a rinse trough and a copper for hot water; Inés's knife is washed at the kitchen sink only. Out of frame. **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_
- **herbs**: Stored dried in lidded crocks in the herb store off the corridor (no water, no fire). In the kitchen: one day measure in a lidded glazed day crock at the herb end of the table, and one fresh-cut green bunch hung from a beam hook over the table's east half, 3.5 m from the live fire (fresh for today, not drying). No in-world plant name anywhere. **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-HERB-08 + thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 selective_color carrier "one bunch of hanging herbs, green"_ — NOTE: CONFLICT resolved: 589 hangs herbs in the kitchen; 576 forbids drying herbs near fire — resolved as a fresh day bunch
- **grinder**: UNKNOWN. No grinder/mortar/quern is registered and none is in the nine permitted classes. Knives are ground at the estate forge grinding wheel (outside the kitchen). None in frame. **[UNKNOWN]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-001 repair_external_
- **cutting_tools**: KNIFE class only; one knife in frame — Inés's brown-handled knife (existing fact). No other blades visible. **[RECOVERED]** _source: thylora_kitchen_equipment KIT-EQ-CLASS-KNIFE + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-001_
- **baskets**: flat herb baskets live in the herb store/receiving; none in frame (baskets are not a permitted kitchen class) **[PROPOSED]** _source: git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-009_
- **jars**: VESSEL class: one lidded glazed day crock on the table; store crocks remain in the dry store **[PROPOSED]** _source: thylora_kitchen_equipment KIT-EQ-CLASS-VESSEL + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_
- **labels_stamps**: No maker marks, stamps, initials or workshop names on any kitchen object (every maker OPEN). The only text surfaces in the frame are the three brand/serial placements in BRANDING, applied deterministically; the day-list board shows writing as texture, not legible words. **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 objects.maker_rule + ROYAL-COOK-ONE-HERB-571 (day list legible as writing, not words)_
- **work_residue**: on the table near Inés: a small heap of stripped herb stems pushed to the back edge and a few loose leaves beside the day crock; a damp cloth folded at the table's east end; a faint scatter of dried road dust on the flags where Veronica stepped in past the threshold **[PROPOSED]**
- **cleanup_state**: table scrubbed pale at first light and now mid-use; floor swept after first light; hearth apron swept, ash raked at first light (KIT-W-ASH route); nothing dirty on the issue-door path **[PROPOSED]** _source: thylora_kitchen_waste_routes + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend)_
- **light**: warm key from H1 (left, behind Inés, low); cold high fill from W1 (east wall, above head height, centre-top of frame) falling on faces and table; weak cold fill from high south windows W3/W4 behind camera; no rim-light halo on any head; no light that singles out Veronica **[PROPOSED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 room_state.light ("one dominant hearth-side source plus weak window fill")_
- **time**: mid-morning working state = KIT-S-MORNING (stores checked against the day list, fire RAISED); numeric clock prohibited **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 + thylora_kitchen_shift_segments_
- **weather_outside**: — **[UNKNOWN]** — NOTE: not recorded; W1 shows only flat pale sky tone

## 5 · EVERY OBJECT

| Object | Position (cm from RK-D0) | WHY IS IT THERE? | WHO PUT IT THERE? | WHEN? | WHAT HAPPENED BEFORE? | WHAT HAPPENS NEXT? | Frame | Tag | Source |
|---|---|---|---|---|---|---|---|---|---|
| Royal Kitchen fabric: walls, flags, beams | room box 0–1400 × 0–1000 × 0–850 | it is the working service room inside the castle | castle builders (masons/carpenters UNKNOWN) | original build (date UNKNOWN) | 750-year functional mirror of a continuously used kitchen | continues in use | IN_FRAME | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend); Windsor mirror ROYAL-KITCHEN.md |
| H1 live hearth + oak bressummer | x 980–1320, y 1000, opening z 0–240, beam z 240–270 | the day's cooking fire; the kitchen is never unattended while it is alight | HH-1700-SCULLERY raised it (KIT-P-FIRE) | first light (KIT-S-FIRSTLIGHT) | banked overnight with one hand watching (KIT-S-NIGHT) | service heat at KIT-S-DAY, banked at KIT-S-CLOSE | IN_FRAME (soft, left) | RECOVERED (fire rules) / PROPOSED (geometry) | thylora_kitchen_posts KIT-P-FIRE; thylora_kitchen_shift_segments |
| Iron crane + cauldron (CAULDRON) | cauldron at (1150, 960, 70) | slow stock on the working fire | HH-1700-SCULLERY hung it (class issued to scullery) | first light | bones from yesterday's service routed to stock (KIT-W-BONE) | stock drawn for service, then bones to disposal | IN_FRAME | PROPOSED | thylora_kitchen_equipment KIT-EQ-CLASS-CAULDRON; thylora_kitchen_waste_routes KIT-W-BONE |
| Spit and irons (SPIT) | racked at east jamb of H1, (1357, 962) | kept where it is scoured and used; idle this morning | HH-1700-SCULLERY | racked after last roast (date UNKNOWN) | scoured hot at the hearth | idle until a roast is on the day list | IN_FRAME (partly, left) | PROPOSED | thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 room_state.spit=idle; git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-005 |
| Pot at hearth edge, off heat (POT) | (1040, 950, 0) on the hearth apron | kept warm but not cooking — water drawn at first light for the day | HH-1700-SCULLERY | first light | filled at the standpipe | carried to the table/range when Inés calls for it | IN_FRAME (small) | PROPOSED | ROYAL-COOK-ONE-HERB-571 objects_in_frame (pot off heat) |
| H2 second hearth, banked | x 560–860, north wall | only one hearth is needed at this hour; banking saves fuel | HH-1700-SCULLERY | close of previous day | used for last night's service | raised again if the day list needs two fires | OUT_OF_FRAME | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) |
| T1 long work table | x 560–1100, y 640–740, top z 86 | the Head Cook's working surface between stores door path and fire | estate carpenter (maker OPEN) | fixed furniture (date UNKNOWN) | scrubbed pale at first light | used through service; scrubbed again at close | IN_FRAME (runs in from frame left to ndc −0.43) | PROPOSED | OBJCAT-TABLES maker OPEN; ROYAL-COOK-ONE-HERB-571 worktable |
| Inés's brown-handled knife (KNIFE) | (1040, 720, 87), edge away, handle to her right | she was stripping the day herb measure | Inés Morales (custodian HH-1700-COOK) | the instant Clara spoke (KIT-S-MORNING) | taken from her roll at first light; used; wiped | back into her hand or into the roll depending on her answer | IN_FRAME (ndc −0.54) | RECOVERED (object exists) / PROPOSED (placement) | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-001 |
| Day herb crock, lidded glazed (VESSEL) | (940, 700, 100) at the herb end of the table | holds one day's dried measure so a spoiled day costs only a day | Inés (herb post KIT-P-HERB) filled it from the herb store | early morning | store crock stays in the herb store | emptied into the day's dishes; returned for washing at close | IN_FRAME (ndc −0.78) | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-HERB-08 |
| Fresh-cut green herb bunch on beam hook | (960, 700, 265) | cut this morning for today; one of the three colour carriers | Inés (Royal Cook controls daily cutting) | after the morning walk to the herb ground | cut from LAND-HERB-KITCHEN-001 | stripped for use today; stems to compost (KIT-W-COMPOST) | IN_FRAME (upper left, ndc −0.72, v +0.51) | PROPOSED | thylora_kitchen_posts KIT-P-HERB; thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 selective_color |
| Herb-stem residue + damp cloth | back edge of T1 near x 1000; cloth at (1080, 700) | work evidence — stripping was under way | Inés | minutes before | — | stems to the compost pail at the next clear-down | IN_FRAME | PROPOSED | this contract |
| Day-list board + ledger box (RECORD) — carries the serial label | east wall, board x 1400 y 560–640 z 120–180; box on shelf beneath at z 95–110 | the Provisioner hands the day list to the Head Cook each morning; the ledger records issues | HH-1700-PROVISIONER (list) / HH-1700-COOK (keeps it) | KIT-S-MORNING handoff | stores checked against the list | consulted all day; list withheld from public reading (text as texture only) | IN_FRAME (ndc 0.30) — PENDING_RULE_EXTENSION | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-010; thylora_kitchen_shift_segments KIT-S-MORNING — NOTE: RECORD is not one of the nine permitted equipment classes — Chairman must admit it or the serial falls back to the day crock |
| Apron pegs with spare apron | east wall south of D1, (1398, 250–350, 140) | one peg per working person; spare hangs with worn | household | standing fixture | — | a spare apron may be handed to Veronica once she is taken on (next event, not in this frame) | EDGE_OF_FRAME / likely cropped | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-011 |
| D1 corridor issue door (double, one leaf open) | east wall y 250–430 | the clean issue door from the service corridor — the way people from the house arrive | household | — | — | — | IN_FRAME (right edge) | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-LINK-008 |
| W1 high window (east wall) — carries VYC2ST on lower reveal | y 700–820, sill z 230, head z 410 | high-set so light does not fall in a cook's eyes | masons (UNKNOWN) | original fabric | — | — | IN_FRAME (centre top) | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) (four high-set windows) |
| Veronica's tied cloth bundle (personal effects) | in her hands at (1300, 450, 85) | everything she owns, brought with her | Veronica | on arrival | carried from where she had been living | set down wherever Inés tells her | IN_FRAME — ALLOWED_DELTA (may be removed) | PROPOSED | Chairman correction relayed in this task (authoritative) — NOTE: not kitchen equipment; personal effects |
| Dried road dust on the flags inside D1 | around (1330, 430, 0) | she stepped in on outdoor shoes | Veronica (unintended) | seconds ago | — | swept by the scullery hand | IN_FRAME (barely visible) | PROPOSED | this contract |
| Scale and weights (SCALE) | receiving room, fixed bracket | a scale that travels is a scale nobody trusts | HH-1700-PROVISIONER | fixed | — | — | OUT_OF_FRAME | PROPOSED | git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-007 — NOTE: CONFLICT: 571 placed a small stores scale at the table end |
| Moulds (MOULD), pans (PAN) | bakehouse / hanging rail on hearth wall out of frame | baking and frying ware kept where used | HH-1700-BAKER / HH-1700-COOK | — | — | — | OUT_OF_FRAME | PROPOSED | thylora_kitchen_equipment |
| Cutlery (CUTLERY) | not in kitchen | silver custodied under ROYCOL-CLASS-SILVER | HH-1700-STEWARD | — | — | — | EXCLUDED | RECOVERED | thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 objects.excluded |

## 6 · OBJECT-STATE EQUATION — MATH DISPLAY LAW

**Registry state:** No object-state equation O_t=f(I,L,S,C,E,H) is registered in thylora_math_equation_registry (10 rows read). The only backend O_t is the RENDER equation in THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001: O_t = R(S_t,M,P | I_lock,G_lock,T_lock,L_causal,C_continuity,R_rights,U_unknowns,A_agency,P_provenance) — a different meaning (rendered output at time t). MATH-SCENE-WHOLE-593 (S_w) requires object provenance/causal placement O but does not define O_t. **[RECOVERED]** _source: thylora_math_equation_registry; thylora_output_visual_identity_gate_

**Variable meanings:** **PROPOSED** (I = intent/use, L = location rules, S = schedule/time, C = custodian, E = environment, H = history).

> **f means FUNCTION OF — the rule describing how these pieces work together.**

### O_t = f(I, L, S, C, E, H)

**1 · WHOLE EQUATION:** `O_t = f(I, L, S, C, E, H)`

**2 · LEFT SIDE:** O_t — the state of one object at moment t: where it is (x,y,z cm from RK-D0), which way it faces, what condition it is in (clean/in use/dirty/damaged), and who holds it.

**3 · EQUAL SIGN:** "=" means the object's state at t is completely determined by the six inputs on the right; if two scenes have the same six inputs, the object must be in the same state in both. Nothing else (render style, camera, mood) is allowed to move it.

**4 · RIGHT SIDE:** f(I, L, S, C, E, H) — f means FUNCTION OF — the rule describing how these pieces work together. It is not a number multiplied in; it is the household rule-book (e.g. "the knife is washed by its owner at the sink, never in the troughs") that turns the six facts into one position and condition.

**5 · EVERY SYMBOL**
- `O_t` — object state at time t
- `t` — the moment (here: KIT-S-MORNING, the instant Clara speaks)
- `f` — FUNCTION OF — the rule that combines the inputs
- `I` — Intent / use — what the object is for and what task it is serving now
- `L` — Location rules — its registered home, in-use place, wash place, and any rule forbidding places
- `S` — Schedule — the kitchen segment/time state (KIT-S-NIGHT … KIT-S-CLOSE)
- `C` — Custodian — the person/role who holds it and may move it
- `E` — Environment — heat, water, light, draught, cleanliness around it
- `H` — History — every recorded event that happened to it before t

**6 · EVERY UNIT**
- `O_t` — record: position in cm (x,y,z from RK-D0), orientation in degrees, condition as a named state, custodian as a role/person code
- `t` — named schedule segment (numeric EdereAirah clock is OPEN_BLOCKED_ON_NATIVE_CALENDAR — no hours may be written)
- `I` — named task code (e.g. KIT-P-HEAD, KIT-P-HERB)
- `L` — space/fixture codes plus cm coordinates
- `S` — segment code
- `C` — role code (HH-1700-*) or person code (ER-*)
- `E` — °C and relative humidity where measured; otherwise named conditions (dry / wet / near live fire) — no measured values exist (UNKNOWN)
- `H` — ordered event list (thylora_castle_object_events has 0 rows → UNKNOWN beyond the authored packet)

**7 · PLAIN SPEECH:** Where a thing is, and what shape it is in, is never an accident: it is there because of what it is for, the house rules about where it lives, what time of day it is, who is in charge of it, what the room is like, and what already happened to it.

**8 · REAL EXAMPLE:** Inés Morales's brown-handled knife (CSZ-OBJ-001; the knife itself is an existing fact, row DOCUMENTED; maker OPEN). I = prep cutting for the day list (KIT-P-HEAD / KIT-P-HERB) — she was stripping the day herb measure. L = home = her own knife roll on the numbered peg above the head of the prep bench; in use = the table; washed and dried by her at the kitchen sink, never in the scullery troughs (CSZ-OBJ-001). S = KIT-S-MORNING (stores checked against the day list; fire RAISED). C = HH-1700-COOK = ER-ROYAL-COOK-001 Inés Morales (KIT-EQ-CLASS-KNIFE issued_to HH-1700-COOK). E = dry scrubbed table top, 3.0 m from the live hearth H1, cold light from W1. H = ground at the estate forge grinding wheel (maker OPEN); used since first light; wiped once. **Therefore O_t = lying on the table top at (1040, 720, 87) cm, blade flat, edge turned away from the table edge, handle toward her right hand, clean-wiped — set down the moment Clara spoke, because a cook does not hold an open blade while talking to someone at the door.** Tags: I,L,C RECOVERED (576 branch + backend kitchen_equipment); S RECOVERED (thylora_kitchen_shift_segments); E,H,O_t PROPOSED.

**9 · WHERE SOMEONE WOULD USE IT:** Before any render or edit (MATH-SCENE-WHOLE-593 O factor), when a continuity checker compares two frames, when a set-dresser places props, or in a real kitchen audit ("why is this knife in the trough?").

**10 · WHAT THE ANSWER MEANS:** If the six inputs are unchanged, the knife must appear in the same place and condition in every render. If it moves, one of the six must have changed by a recorded event — otherwise the render has drifted and fails MATH-VISUAL-LOCK-593 factor O.

**11 · NEXT QUESTION:** When Inés answers Clara, does the knife go back into her hand (she keeps working and Veronica is sent to the scullery to wash first) or into its roll (she leaves the table to show Veronica where to clean up)? That choice is the next H event.

## 7 · PEOPLE

### Ines Morales

- **lock**: LOCK-ER-ROYAL-COOK-001 (LOCKED, CHAIRMAN_CHOSEN), age 55, 163 cm, 72–77 kg, medium-olive complexion, oval-square face, deep-set dark brown eyes, broad cheek structure, strong nose, full lower lip, age lines at outer eye and between brows; dark hair threaded with grey strands, pinned up; sturdy dense working build, strong forearms **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-ROYAL-COOK-001_
- **position_cm**: [1060, 770, 0] **[DERIVED]** _source: north side of T1 at its east end, 30 cm from the table edge, H1 hearth centre 2.5 m behind her_
- **screen**: {"ndc_x": -0.563, "px_x": 1311, "head_top_px_y": 1937, "feet_px_y": 3212} **[DERIVED]** — NOTE: recovered frame role is "centre-left"; derived position is the left third (ndc −0.56) — the nearest placement that keeps her face visible and the heights honest; allowed delta ±0.15 ndc
- **pose**: square-shouldered to the table, weight even on both feet, upper body turned ~35° toward the door from the hips (not the neck) **[PROPOSED]** _source: posture text RECOVERED from lock_
- **hands**: both resting flat on the table edge, fingers spread, just released the knife — lock: "hands usually occupied, or resting flat on the table edge when they are not" **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-ROYAL-COOK-001_
- **gaze**: on Veronica (heading 143.1°); face 68.7° from camera = three-quarter, right cheek toward camera **[DERIVED]**
- **expression**: steady, dry, watchful; mouth closed; brows level; the only readable change is that she has stopped working. No recognition, no dawning, no softening beat; the protective affinity is felt, not shown, and not explained **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-ROYAL-COOK-001 emotional_tone + relationship_map (UNEXPLAINED_IMMEDIATE_PROTECTIVE_AFFINITY)_
- **clothing**: practical period work dress in hard-wearing dark/muted cloth; washable full apron, worked-in and marked; sleeves secured above the wrist; sturdy flat shoes; cloth at the neck; the CLOSED locket is the only jewellery, at the throat, under/at the collar edge (material UNKNOWN — render as dull warm metal, no engraving, no opening seam emphasised) **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-ROYAL-COOK-001 + thylora_person_world_sheet THY-PER-SHEET-INES-001 jewelry_spec_
- **saying_doing**: silent at this instant; she has set the knife down to listen. No line. **[PROPOSED]**
- **identity locks**: face; 163 cm; medium-olive complexion value; hair pinned up in food area; closed locket only; no other jewellery

### Veronica Hall

- **lock**: LOCK-ER-VERONICA-HALL-001 (LOCKED), age 23, 166 cm, deep-brown complexion, oval face, large dark eyes, soft but defined cheekbones, full lips, unlined; dark naturally textured hair partially pinned back with loose curls and waves around the face; slender working build, narrow shoulders, long limbs **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-VERONICA-HALL-001_
- **body_amendment**: slightly fuller hips, thighs and buttocks within a slender build; NO change to face, hair, complexion or height **[RECOVERED]** _source: Chairman correction relayed in this task (authoritative); thylora_query_carryforward:592 + thylora_execution_work_registry:THY-WORK-VISUAL-IDENTITY-REGRESSION-592 ("subtle added hips/curves")_ — NOTE: Lock row updated_at 2026-09-21 does not yet contain this amendment; weight range 55–60 kg may need Chairman review
- **position_cm**: [1300, 450, 0] **[DERIVED]** _source: one pace inside D1 on the kitchen flags, 1.45 m from Clara (0.95 m room-ward, 1.10 m north), at the same camera depth as Clara (Z 710.5 vs 707.5); 1.49 m from the door centre vs 5.7 m from the live hearth — nearer the door than the fire_
- **screen**: {"ndc_x": 0.499, "px_x": 4496, "head_top_px_y": 1910, "feet_px_y": 3272} **[DERIVED]**
- **pose**: upright, still, weight slightly back on her rear (door-side) foot — present but not presuming; shoulders not hunched **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-VERONICA-HALL-001 posture_
- **hands**: empty of any food, vessel or prep tool. Both hands hold a small tied cloth bundle of her own belongings in front of her at hip height (carries with both hands per lock). ALLOWED DELTA: bundle may be removed, in which case hands rest lightly together in front. **[PROPOSED]** _source: Chairman correction relayed in this task (authoritative) (no prep vessel/food task)_
- **gaze**: on the table and Inés's set-down knife — reading how the room works (heading 316.1°); face 73.7° from camera = near-profile three-quarter, left cheek toward camera; never at camera **[DERIVED]** _source: thylora_character_lock_sheets:LOCK-ER-VERONICA-HALL-001 ("she sees systems")_
- **expression**: attentive, quick, careful not to presume; composed, not frightened, not pitiable, not smiling for effect **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-VERONICA-HALL-001_
- **clothing**: Her own clothes from before the household, NOT the household work dress (not yet issued): a long-sleeved ankle-length day dress in a coarse plain-woven cloth faded from a mid-brown to an uneven dun, clean enough to show she has kept it but visibly worn — hem frayed, darkened by dried road dirt to ~12 cm above the hem; a hand-mended split at the left side seam in a slightly different thread; the right elbow patched in a darker cloth; a thin worn wool shawl crossed over the chest and tucked at the waist, one fringe end ragged; no apron; shoes scuffed pale at the toes and dusty, laced tight. Dirt sits on the cloth and shoes, not smeared on her face; hands and face are her own clean deep-brown skin. Nothing torn open, nothing revealing, nothing staged as squalor. Exact fibre, weave and dye UNKNOWN — do not name them in-world. **[PROPOSED]** _source: Chairman correction relayed in this task (authoritative); fibre specifics UNKNOWN per ROYAL-COOK-ONE-HERB-571 clothing rule_
- **saying_doing**: silent; being introduced. She has just stepped in because Clara moved her forward to be seen. **[PROPOSED]** _source: Chairman correction relayed in this task (authoritative)_
- **identity locks**: same original face (no drift); 166 cm; deep-brown complexion — no lightening; same original hair texture and styling; no locket, no jewellery; slender with slightly fuller hips/thighs/buttocks

### Clara Bennett

- **lock**: LOCK-ER-CLARA-BENNETT-001 (LOCKED), age 61, 168 cm, 83–89 kg, light complexion, broad full face, pale blue-grey eyes, strong brows, firm mouth; blonde going to grey in a practical period updo or braided crown; full mature build carried high and square, never frail **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001_
- **position_cm**: [1395, 340, 0] **[DERIVED]** _source: standing on the D1 threshold at the inner wall face, centred in the 1.80 m opening, one door leaf open behind her_
- **screen**: {"ndc_x": 0.9, "px_x": 5701, "head_top_px_y": 1893, "feet_px_y": 3278} **[DERIVED]** _source: recovered: "right edge, in the doorway"_
- **pose**: upright, shoulders back, chin level; occupies the doorway, does not lean on the frame, does not enter **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 positions.clara_bennett + thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001_
- **hands**: folded at the waist **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001_
- **gaze**: on Inés (heading 322.1°); face 69.2° from camera = three-quarter, left cheek toward camera **[DERIVED]**
- **expression**: exacting, fair, undemonstrative; the request is made plainly; a protectiveness toward Veronica she would deny **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001_
- **clothing**: restrained dark/muted period day dress, high neckline, simple collar and cuffs, practical shoes still in outdoor state; NO pearls, NO gloves, no brooch, no aristocratic styling **[RECOVERED]** _source: thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001 + HERB-ROYAL-KITCHEN-001 wardrobe rule_
- **why_she_stays_on_the_threshold**: The kitchen floor is Inés's territory (PROFESSIONAL_PARITY) and Clara is in outdoor shoes; the 576 service rule makes the staff-link lobby the outdoor/kitchen shoe change point. So she asks from the threshold instead of walking in. **[PROPOSED]** _source: thylora_character_lock_sheets:LOCK-ER-CLARA-BENNETT-001 + git origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql (CSZ-KITCHEN-01, authored PROPOSED at 576, not applied to backend) CSZ-OBJ-012_
- **saying_doing**: mid-question, lips just parted on a word, not an open-mouth pose. Proposed line (caption/voice only, never on the image): "Inés — this is Veronica Hall. Can the kitchen use her?" **[PROPOSED]** _source: Chairman correction relayed in this task (authoritative) (Clara is asking Inés whether the kitchen can use her)_
- **identity locks**: same original face; 168 cm; light complexion; no pearls/gloves in kitchen; governess not lady-of-the-house

## 8 · BRANDING

### VYC2ST
- **placement**: incised into the inner face of the stone apron directly below W1's sloping sill, on the lower window reveal, centred under the sill, centred at (1400, 760, 218) cm — screen ndc (0.04, +0.19), px (3111, 1630) **[PROPOSED]**
- **size_cm**: 12.0 × 2.2 (letter cap height 2.2 cm, 6 letters) **[PROPOSED]**
- **size_px_on_6000x4000**: 70.5 × 12.9 **[DERIVED]** _source: legible at 100 %, invisible at thumbnail_
- **method**: V-cut incised with a mason's letter-cutting chisel, 2–3 mm deep, unpainted; old limewash partly filling the cuts so it reads only in raking light **[PROPOSED]**
- **in_world_relation**: works/survey mark cut when the window apron was re-set — a record of who answered for the work, not a maker brand on a kitchen object **[PROPOSED]** _source: THY-GATE-VISUAL-IMAGERY-LOCK-570 embedded_brand_semantics requires a graph relation_ — NOTE: CONFLICT: 589 prohibits "any maker mark while makers are OPEN" and listed VYC2ST as optional_unused; Chairman now requires it. Needs explicit Chairman ruling that an architectural works mark is not a kitchen maker mark.
- **glyph_reference**: IMG_7689.png **[RECOVERED]** _source: thylora_output_visual_identity_gate THY-VYC2ST-MARK-GLOBAL-001.reference_file_ — NOTE: file bytes are not registered in thylora_visual_assets — exact letterform UNKNOWN; must be applied deterministically from the reference file

### ERSATZREALITY
- **placement**: incised in a shallow sunk panel on the front face of H1's oak bressummer, 60 cm in from its east end, centred at (1260, 1000, 252) cm — screen ndc (−0.47, +0.27), px (1592, 1461); ~550 px above-right of Inés's head (head-top at px 1311, 1937), never over a face or the locket **[PROPOSED]**
- **size_cm**: 30.0 × 3.0 (13 letters, cap height 3.0 cm) **[PROPOSED]**
- **size_px_on_6000x4000**: 166.9 × 16.7 **[DERIVED]**
- **method**: cut with a carpenter's V-gouge into the oak, edges softened and darkened by decades of hearth smoke so it reads as old, not applied **[PROPOSED]**
- **why_a_maker_marks_it**: A bressummer over a live hearth is the one timber whose failure burns the kitchen; the works house that framed and fitted it marks the beam it answers for, for assembly and for responsibility when it is inspected or replaced. **[PROPOSED]**
- **in_world_relation**: ErsatzReality as the works/provenance house answerable for the hearth-beam fitting **[PROPOSED]** _source: thylora_query_carryforward 593 (ErsatzReality Enterprise / physical provenance direction preserved)_ — NOTE: Same maker-rule CONFLICT as VYC2ST. Fallback recovered from 589: ErsatzReality in controlled screen-space packaging at the lower edge.

### SERIAL
- **value**: ER-VIS-20260922-0001 **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.reserved_serial_
- **placement**: ink-stamped on a pasted paper slip on the end of the ledger box on the shelf beneath the day-list board, east wall, centred at (1400, 600, 102) cm — screen ndc (0.30, −0.18), px (3907, 2349); a record/volume number is where a long production number belongs **[PROPOSED]**
- **size_cm**: slip 26 × 4; characters 2.0 cm high **[PROPOSED]**
- **size_px_on_6000x4000**: 171.3 × 13.2 **[DERIVED]**
- **method**: applied deterministically as a plane-mapped texture after render (exact_text_rule: generative text alone cannot pass) **[RECOVERED]** _source: THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001 readability_rules.exact_text_rule_
- **fallback**: iron-oxide brushed stores number on the shoulder of the day herb crock (VESSEL class, inside the nine-class rule), as in ROYAL-COOK-ONE-HERB-571 **[PROPOSED]**
- **registry_state**: reserved; no thylora_visual_serial_registry row until approved bytes + SHA-256 exist **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.serial_rule_

- **THYLORA_mark**: WITHHELD — BRAND-THYLORA-MARK truth_class UNKNOWN / NOT_APPROVED **[RECOVERED]** _source: thylora_brand_asset_slots BRAND-THYLORA-MARK_ — NOTE: CONFLICT with THY-GATE-VISUAL-IMAGERY-LOCK-570 three_embedded_marks_rule (requires THYLORA globe-O). Chairman must waive for this still or supply the mark.
- **QR**: NONE — BRAND-QR-DESTINATIONS UNKNOWN **[RECOVERED]** _source: thylora_brand_asset_slots_
- **no_floating_text**: True **[RECOVERED]** _source: Chairman correction relayed in this task (authoritative)_

## 9 · ART MEDIUM

- **description**: illustrated, etched and painterly hybrid: a visible etched/engraved line structure (cross-hatching carrying the tonal form of walls, beams and shadows) with painterly passages in faces, hands, cloth and firelight; sculptural depth through tonal separation and atmospheric recession, not photographic falloff; realistic individual anatomy (real age lines, skin texture, cloth weight, dirt) inside an authored art form; selective visible sketchwork — construction lines left faintly in the upper wall and beam areas and at the far edges, never on faces; NOT photoreal, NOT Disney/cartoon, NOT generic AI gloss **[RECOVERED]** _source: THY-VYC-VISUAL-GRAMMAR-002; THY-GATE-VISUAL-IMAGERY-LOCK-570; Chairman correction relayed in this task (authoritative)_
- **style_reference_rule**: The newer painterly/etched render supplies ONLY surface treatment (line, hatching, paint handling, grain). It may not supply faces, heights, skin tone, camera, room layout or event. **[RECOVERED]** _source: thylora_query_carryforward:592 + thylora_execution_work_registry:THY-WORK-VISUAL-IDENTITY-REGRESSION-592; MATH-VISUAL-LOCK-593 factor T_
- **colour_rule**: three colour carriers only — warm core of the hearth, metal of the closed locket, one green herb bunch; everything else desaturated period neutrals (ash, iron, oat, smoke); no filter-like grade **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.selective_color_
- **complexion_rule**: Desaturation must preserve each person's skin VALUE. Veronica's deep-brown value must not rise (no lightening); Inés's medium-olive and Clara's light values must not converge toward a shared mid-tone. **[PROPOSED]** _source: Chairman correction relayed in this task (authoritative)_

**Palette** [PROPOSED] — locket metal material UNKNOWN — hex describes a dull warm metal tone, not a claim of gold/brass

| Role | Hex |
|---|---|
| bone_ground | `#E9E1D0` |
| oat | `#CDBF9F` |
| ash | `#9A958C` |
| smoke | `#6E6A64` |
| iron_line | `#2E2C2A` |
| soot | `#1A1917` |
| limewash_light | `#DDD6C6` |
| carrier_hearth_core | `#C8612A` |
| carrier_hearth_coal | `#8E2F1C` |
| carrier_locket_metal | `#A88A55` |
| carrier_herb_green | `#5E7A4A` |
| carrier_herb_grey_green | `#7F8E6E` |
| skin_value_anchor_Ines | `#9C7658` |
| skin_value_anchor_Veronica | `#583826` |
| skin_value_anchor_Clara | `#D8B9A2` |
| window_sky | `#C9CDCB` |

### Viewer membrane

- **definition**: A fixed, viewer-side separation plane between the Earth viewer and the EdereAirah room — aged projection glass that belongs to the viewer's side, not to the kitchen. I_seen = W(S(x,y,t)) + F(x,y); dF/dt ≈ 0 (barrier stationary in screen space); B = g1F + g2S + g3E + g4D with swirl and smoke terms = 0. **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922.scene_state.viewer_membrane (THY-VIEWER-PLANE-UNIVERSAL-001) + THY-INTERWORLD-BARRIER-GLOBAL-001_
- **implementation**: (1) glass micro-texture across the whole frame, luminance amplitude ≤ 2 %, spatial period 2–4 px (invisible at fit-to-screen, visible at 100 %); (2) ONE persistent fine scratch in the upper-left quadrant, ~1 px wide × ~480 px long, running at ~20° off vertical from (620, 180) px, never crossing a face, the herb bunch or the bressummer mark; (3) density falloff at the four corners ≤ 4 % luminance; (4) no colour; fixed in screen space **[PROPOSED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 implementation text (faint aged projection glass, one scratch upper-left, corner falloff)_
- **how_it_shows**: Only on close inspection: at 100 % zoom the glass texture and scratch are resolvable; at feed size the frame reads as a clear window. **[RECOVERED]** _source: Chairman correction relayed in this task (authoritative)_
- **prohibited**: ["portal", "bubble", "force field", "glowing edge", "bright dimensional line", "touch ripple", "film that tracks a subject", "film that moves with the camera", "smoke/haze inside the room", "swirls", "rainbow rings", "sparkle"] **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922 + THY-INTERWORLD-BARRIER-GLOBAL-001_
- **character_rule**: no one in the kitchen sees, touches or reacts to the film **[RECOVERED]** _source: thylora_visual_scene_manifest:SCENE-WW-001-ROYAL-KITCHEN-20260922_
- **conflict**: THY-INTERWORLD-BARRIER-GLOBAL-001 targets "subtle but unmistakable; ~0.18–0.28 relative visual weight"; Chairman now wants it visible only on close inspection. Proposed setting sits at the gate's 0.18 floor, carried by fine spatial frequency rather than contrast. Needs Chairman confirmation. **[PROPOSED]**

## 10 · NEGATIVE CONSTRAINTS / DRIFT CHECKS

| # | Check | Pass test |
|---|---|---|
| 1 | No face drift (any of three) | post-render close-crop of each face vs anchor still face crops; identity reviewer + embedding similarity ≥ agreed threshold (threshold UNKNOWN — Chairman to set); any doubt = FAIL |
| 2 | No skin lightening / complexion drift | sample mean L* of each face mid-cheek; Veronica L* within ±3 of anchor, Inés/Clara within ±3; ordering Clara > Inés > Veronica preserved |
| 3 | Heights honest | measure head-top and heel pixels; apparent order Clara > Veronica > Inés AND head-top-above-horizon order 107/90/63 px (±8 px) |
| 4 | Camera unchanged | horizon at y = 2000 ± 20 px; verticals vertical within 0.5°; table and hearth-wall lines converge left, east-wall lines right; station re-solve within ±15 cm of (650,110,155) |
| 5 | Chronology correct | Veronica holds no vessel, food, knife or prep tool; wears her own worn clothes, no apron; Clara on threshold not inside; Inés has stopped working |
| 6 | Veronica body amendment only | hips/thighs/buttocks slightly fuller; shoulders narrow, face/hair/height unchanged; no sexualised posing or clothing change |
| 7 | Locket closed and only on Inés | no second locket, no open seam, no locket on Veronica or Clara |
| 8 | Clara not over-dressed | no pearls, gloves, brooch, lace, aristocratic styling |
| 9 | Hair rule | Inés hair pinned up; no loose hair on Inés in food area |
| 10 | Object discipline | every visible object is in the EVERY OBJECT table; no cutlery; no maker marks; no invented text; day-list writing illegible as words |
| 11 | Brand marks | VYC2ST, ERSATZREALITY and serial present exactly at contract positions and sizes, applied deterministically; no floating logo text; no THYLORA mark; no QR |
| 12 | Membrane | fixed in screen space; not visible at thumbnail; visible at 100 %; no glow/portal/ripple/haze |
| 13 | Medium | not photoreal (visible etched line structure present); not cartoon (real anatomy and proportion); sketchwork never on faces |
| 14 | Colour | only three chromatic carriers above saturation 20 %; everything else ≤ 10 % saturation |
| 15 | No anonymous people | exactly three visible persons |
| 16 | No style-reference leakage | nothing from the painterly render other than surface treatment: compare faces, camera and layout to the anchor, not to the style reference |

## 11 · GATES

| Gate | Source | Backend state | Current status | Effect |
|---|---|---|---|---|
| THY-IMAGE-GENERATION-CHAIRMAN-EXPLICIT-001 | thylora_output_visual_identity_gate | LOCKED | NOT MET — no explicit current-turn Chairman generation direction | **BLOCKS** |
| THY-VISUAL-PREFLIGHT-LOCK-001 | thylora_visual_preflight_gate | LOCKED | steps 1–7 addressed by this contract; step 8 (Chairman approval) outstanding; step 5 (prior approved reference) FAILS — anchor bytes missing | **BLOCKS** |
| THY-GATE-PRODUCTION-APPROVAL-001 (visual_immutability + whole_scene_integrity config) | thylora_gate_definitions | DESIGN_ONLY (config updated 2026-09-23) | source_anchor_required=true → FAIL (no anchor hash); pre_render_compare cannot run; dimensions_required satisfied only with PROPOSED dims | **BLOCKS** |
| MATH-VISUAL-LOCK-593  R_v = I×G×P×C×T×O | thylora_math_equation_registry | ACTIVE | pre-render proposal: I=2 (text locks, no face reference bytes) · G=0 (camera cannot be verified against anchor) · P=4 · C=5 · T=3 · O=2 → R_v = 0 | **BLOCKS (zero factor G)** |
| MATH-SCENE-WHOLE-593  S_w = A×G×D×O×L×H×M | thylora_math_equation_registry | ACTIVE | pre-render proposal: A=3 · G=4 · D=2 · O=2 · L=4 · H=3 · M=4 → 2304; no zero factor; no registered pass threshold | **ADVISORY (weak D, O)** |
| MATH-WW-001  WW = L×I×H×B×M×T | thylora_math_equation_registry | ACTIVE | 589 packet score 8000 PASS is stale (vessel chronology). Re-score proposal: L=4 · I=4 · H=5 · B=3 · M=4 · T=4 → 3840 < 4096 and B < 4 | **BLOCKS (B=3 until brand conflicts resolved)** |
| THY-GATE-VISUAL-IMAGERY-LOCK-570 | thylora_output_visual_identity_gate | ACTIVE | requires ERSATZREALITY + THYLORA globe-O + VYC2ST in-world + serial; THYLORA mark NOT_APPROVED | **BLOCKS unless Chairman waives THYLORA for this still** |
| THY-VYC2ST-MARK-GLOBAL-001 | thylora_output_visual_identity_gate | LOCKED | placement defined; reference file IMG_7689.png bytes not bound | **BLOCKS exact application** |
| THY-INTERWORLD-BARRIER-GLOBAL-001 / THY-INTERWORLD-OLDFILM-BARRIER-001 | thylora_output_visual_identity_gate | LOCKED | membrane specified; intensity conflict with close-inspection-only direction | **NEEDS RULING** |
| THY-WORLD-CONTINUITY-FLOOR-001  Wq = G×A×O×P×T×C×H×I×B×R×V | thylora_output_visual_identity_gate | LOCKED | kitchen geometry NULL in thylora_castle_space_geometry; object_state_registry 0 rows; space_connections 0 rows → A and O not backend-registered (contract values PROPOSED only) | **BLOCKS until PROPOSED dims/objects are accepted and written** |
| THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001 | thylora_output_visual_identity_gate | LOCKED | substrate (anchor image) required; missing | **BLOCKS** |
| THY-APPROVAL-MUST-BE-VIEWABLE-001 | thylora_output_visual_identity_gate | LOCKED | this contract + floorplan.svg are viewable; the anchor still is not — approval of a render cannot be requested | **BLOCKS render approval (not contract approval)** |
| THY-QYRIS-ALL-WORK-001 | thylora_gate_definitions | ACTIVE | QYRIS plain-speech rows exist for 588/591/592/593 questions (thylora_qyris_work_item_checks); per-work PASS state for 592/593 not verified here | **CHECK** |
| Character lock sheets ×3 | thylora_character_lock_sheets | LOCKED | heights 163/166/168 match Chairman; Veronica body amendment not yet written into the lock | **NEEDS LOCK UPDATE (write, not render)** |

## 12 · CONFLICTS — older packets vs Chairman corrections

| Source | Older value | Chairman / newer | Resolution |
|---|---|---|---|
| 589 manifest (positions, caption, alt text, editable_fields) | Veronica "carrying a vessel with both hands"; "which permitted vessel Veronica carries" editable | Chairman: no prep vessel/food task in her hands; she has not started kitchen work | SUPERSEDED by Chairman |
| 589 alt text / positions | Inés "works with both hands", "hands occupied at the table" | Clara is asking Inés — Inés pauses, hands flat on table edge | SUPERSEDED (same person, next beat) |
| 589 caption | "Veronica Hall carries in a vessel and stands nearer the door than the fire" | keep "nearer the door than the fire"; drop the vessel; add Clara asking whether the kitchen can use her | CAPTION MUST BE REWRITTEN |
| HERB-ROYAL-KITCHEN-001 wardrobe / LOCK-ER-VERONICA-HALL-001 usual clothing | "modest period working dress", "recently issued or carefully kept" | worn/dirty own clothes; not yet cleaned up | STATE BEFORE HIRE — lock wardrobe applies after a recorded hiring event; not a drift |
| WR-WORLD-WINDOW-583 §4/§8 | Veronica with a herb basket at the door; Clara at the hearth tipping a bowl | Clara brings Veronica and asks for work; Clara does not do kitchen work | SUPERSEDED |
| WR-WORLD-WINDOW-583 §5 camera | 40 mm, 1.58 m, 12° down | 589: 35 mm, 1.55 m, level | 583 SUPERSEDED by 589 (retained) |
| 589 embedded_brands | ErsatzReality in screen-space packaging at the lower edge; VYC2ST optional_unused | VYC2ST etched in-world; ErsatzReality in stone/timber; serial in-world | SUPERSEDED by Chairman (maker-rule conflict flagged B4) |
| LOCK-ER-VERONICA-HALL-001 body_type | slender, narrow shoulders, 55–60 kg | slender with slightly fuller hips/thighs/buttocks | LOCK AMENDMENT PENDING (write to lock) |
| Painterly/etched render (592) | altered faces, height appearance, skin tone, camera | STYLE REFERENCE ONLY | Chairman override; recorded in 592 work evidence |
| ROYAL-COOK-ONE-HERB-571 vs 576 | small stores scale at the table end | scale never leaves receiving | 576 followed; scale out of frame |
| 571 / 576 / 583 / 589 ceiling | timber / open roof + boarded / barrel vault / UNKNOWN | — | PROPOSED timber; needs Chairman pick |
| 571 vs 583 table timber | oak vs elm | — | species UNKNOWN; not named |
| 589 herbs hanging vs 576 herb-store fire rule | hanging herbs in a live kitchen | — | resolved as a fresh day bunch 3.5 m from fire |
| LOCK-ER-VERONICA-HALL-001 relationship_map | "Royal Cook (NAME PENDING)" | cook name FINALIZED_INES_MORALES | stale text in lock row |

## 13 · RENDER PACKET

> **DO NOT RENDER — awaiting Chairman approval**

### Prompt (provider-neutral)

```text
DO NOT RENDER — awaiting Chairman approval. SOURCE-ANCHORED EDIT ONLY: use the approved earlier Royal Kitchen still (hash REQUIRED, currently UNKNOWN) as the locked substrate for camera, room geometry and all three faces; use the painterly/etched render only as a surface-treatment reference.

A single fixed frame inside a working period castle kitchen at mid-morning. Level camera at standing eye height 155 cm, 35 mm full-frame equivalent, 3:2, no tilt, looking three-quarter across a long scrubbed hardwood work table toward a live open hearth. Left third: Inés Morales, 55, 163 cm, medium-olive complexion, oval-square face, deep-set dark brown eyes, strong nose, age lines at the eyes and brow, dark hair threaded with grey pinned up; sturdy dense build; practical dark work dress, worked-in full apron, sleeves secured above the wrist, a small closed locket at the throat as her only jewellery. She stands on the far side of the table at its end, square-shouldered, both hands resting flat on the table edge, her knife just set down edge-away beside a small lidded glazed crock and a few stripped herb stems; she has stopped working and looks toward the young woman at the door, steady and watchful, mouth closed. Behind her, softer: the live hearth with an iron crane and one cauldron, fire working not roaring, an idle spit at the jamb, a smoke-darkened oak beam above the opening. One fresh green herb bunch hangs from a ceiling beam above the table. Right: a doorway in a thick limewashed stone wall. Clara Bennett, 61, 168 cm, light complexion, broad full face, pale blue-grey eyes, blonde-to-grey hair in a practical braided updo, full mature upright build, restrained dark high-necked day dress with simple collar and cuffs, no jewellery, no gloves, stands squarely on the threshold without entering, hands folded at the waist, chin level, speaking to Inés. One pace inside the door, beside Clara on the room side and at the same distance from the camera: Veronica Hall, 23, 166 cm, deep-brown complexion, oval face, large dark eyes, soft defined cheekbones, full lips, dark naturally textured hair partly pinned back with loose curls framing her face; slender with narrow shoulders and slightly fuller hips and thighs. She has just arrived and has not been cleaned up or given kitchen clothes: a long faded dun working-class dress, hem frayed and darkened with dried road dirt, a mended side seam, a darker patch at one elbow, a thin worn shawl crossed at the chest, scuffed dusty shoes. She holds a small tied cloth bundle of her own belongings in both hands; nothing from the kitchen. Upright, attentive, composed, looking at the table and the set-down knife, not at the viewer. Height truth: Clara is the tallest, then Veronica, then Inés; Clara and Veronica stand at the same distance from the camera, Inés slightly farther. Light: warm low hearth light from behind Inés; cold high daylight from a deep-set window high in the right wall falling on the faces and table; no halo, no spotlight on anyone. Medium: illustrated etched-and-painterly hybrid with sculptural tonal depth, visible cross-hatched line structure in walls, beams and shadow, painterly handling in faces, hands, cloth and fire, faint construction sketch lines left only in the upper walls and far edges; realistic individual anatomy and age; restrained palette of bone, oat, ash, smoke, iron and soot, with colour only in the hearth core, the locket metal and the green herb bunch; each person's natural skin value preserved exactly. Across the whole frame, fixed to the viewer's side: faint aged projection glass — fine texture, one hairline scratch in the upper-left quadrant, slight corner density — noticeable only on close inspection. In-world marks applied deterministically after render, not generated: VYC2ST incised small (12 × 2.2 cm) in the stone below the high window sill; ERSATZREALITY cut small (30 × 3 cm) into the right end of the oak hearth beam; ER-VIS-20260922-0001 ink-stamped on a paper slip on the end of a ledger box beneath the day-list board by the door.
```

### Negative prompt

```text
photoreal, photograph, stock photo, 3D render gloss, Disney, Pixar, cartoon, anime, caricature, chibi, glamour, beauty retouch, changed faces, face swap, new faces, generic faces, lighter skin on Veronica, skin lightening, whitewashed, desaturated skin value shift, same face on two women, Veronica taller than Clara, Inés taller than Veronica, camera tilt, dutch angle, high angle, low hero angle, overhead, wide-angle distortion, fisheye, vessel in Veronica's hands, food in Veronica's hands, apron on Veronica, clean new dress on Veronica, torn revealing clothing, squalor staging, dirt on faces, pearls, gloves, brooch, lace, aristocratic dress, second locket, open locket, locket on Veronica, loose hair on Inés, silver cutlery, maker's marks, readable words on the day list, floating logo, watermark, THYLORA logo, QR code, extra people, background figures, portal, glowing edge, bubble, force field, ripple, haze inside the room, smoke veil, swirls, lens flare, bloom, sparkle, rainbow, halo, rim-light halo, spotlight on Veronica, eye contact with viewer, posed smiles, melodrama, tears
```

### Locked fields
- camera station (650,110,155) cm from RK-D0, yaw 48°, pitch 0, roll 0, 35 mm eq. — pending re-solve against anchor (B9)
- three identities: faces, complexions (values), hair, statures 163/166/168 cm per LOCK-ER-* sheets
- apparent-height order Clara > Veronica > Inés and head-above-horizon order 107/90/63 px (±8)
- chronology: Clara introduces newly arrived, not-yet-cleaned Veronica to Inés for kitchen work; no food task for Veronica
- Veronica worn/dirty own clothing as specified; no apron
- Inés closed locket only; hair pinned up; hands flat on table edge; knife set down
- Clara on the threshold, hands folded, no pearls/gloves
- room layout: hearth wall north, D1 on east wall, W1 high on east wall, table T1 position
- object list and positions in EVERY OBJECT table; nine-class rule; no maker marks on kitchen objects; cutlery excluded
- three colour carriers + palette hex; skin value preservation
- viewer membrane behaviour (fixed, screen-space, close-inspection only, no prohibited effects)
- brand/serial positions, sizes and deterministic application; THYLORA mark and QR withheld
- reserved serial ER-VIS-20260922-0001

### Allowed deltas
- surface treatment only (line density, hatching direction, paint handling, grain) drawn from the painterly style reference
- hearth flame size within "working, not roaring"
- depth of hearth softness
- Inés screen x within ndc −0.56 ± 0.15 (toward the recovered "centre-left") provided the height and face-angle constraints still hold
- Veronica's bundle may be removed (hands then rest together in front)
- exact scratch path of the membrane within the upper-left quadrant (not crossing faces/marks)
- lower-edge packaging layout (outside the image)
- caption wording (must drop the vessel)
- fallback serial carrier (day crock shoulder) if RECORD class is not admitted
- fallback ErsatzReality screen-space packaging if in-world maker-type marks are refused

### After an approved render
- compute SHA-256; register thylora_visual_serial_registry row for ER-VIS-20260922-0001 only after Chairman approval
- run every drift check above against the anchor
- re-score MATH-VISUAL-LOCK-593 and MATH-WW-001 on the rendered frame
- apply marks deterministically and verify exact strings

## 14 · Sources actually read

**Backend (Supabase jvsdxhrfhtlgaknhjxlz, SELECT only):**
- thylora_visual_scene_manifest (3 rows)
- thylora_scene_execution_contract (0 rows)
- thylora_character_lock_sheets (3)
- thylora_person_world_sheet (1: Inés only)
- thylora_kitchen_equipment (9)
- thylora_kitchen_stores (6)
- thylora_kitchen_posts (8)
- thylora_kitchen_shift_segments (5)
- thylora_kitchen_suppliers (10)
- thylora_kitchen_waste_routes (7)
- thylora_kitchen_meal_plans (5)
- thylora_castle_space_geometry (2, dims NULL)
- thylora_castle_space_connections (0)
- thylora_castle_object_state_registry (0)
- thylora_castle_object_events (0)
- household_object_provenance (0; thylora_household_object_provenance does not exist)
- thylora_object_maker_provenance (19, all OPEN)
- thylora_visual_serial_registry (3)
- thylora_brand_asset_slots (9)
- thylora_output_visual_identity_gate (12)
- thylora_visual_preflight_gate (1)
- thylora_gate_definitions (8)
- thylora_math_equation_registry (10)
- thylora_execution_work_registry (4 named rows)
- thylora_query_carryforward (589–594 + O_t search)
- thylora_visual_assets / thylora_visual_provenance / thylora_visual_approvals / thylora_delivery_assets / thylora_visual_slots / studio_character_reference_assets (searched: no Royal Kitchen render)
- thylora_qyris_work_item_checks (searched)

**Git:**
- `origin/claude/royal-kitchen-service-zone-pwd4v2:db/castle-service-zone/0008_seed_576.sql`
- `origin/claude/windsor-castle-structure-rdjaum:world/castle/ROYAL-KITCHEN.md`
- `origin/claude/thylora-world-window-vefjrp:workrooms/WR-WORLD-WINDOW-583.md`
- `origin/claude/thylora-three-post-lock-vfmr8g:workrooms/WR-POSTLOCK-001.md (grep)`
- `origin/claude/castle-world-coordinates-dertlm:world/data/master-coordinate-system.json`
- `origin/claude/thylora-head-spine-forward-woo0qv:workrooms/WR-SPINE-589.md (grep)`
- `origin/claude/thylora-omniview-live-apply-s3jueg:db/omniview/live/0008_live_apply_591.sql (grep)`

**Listed but not opened:**
- origin/claude/thylora-royal-cook-post-7z96kj (content duplicated in manifest ROYAL-COOK-ONE-HERB-571)
- origin/claude/visual-standard-recovery-gate-2oc3jc
- origin/claude/ines-morales-complete-person-e1ujr4
- origin/claude/thylora-preview-packets-7kg34b (store packets, not kitchen)

