-- THYLORA merchandise lane · 0007 · seed from retrieved backend state
-- ADDITIVE ONLY. Not applied by this repository.
--
-- Every row below was read from thylora-dash on 2026-09-17. Sources:
--   thylora_brand_asset_slots                (9 rows, brand marks)
--   thylora_news_program_registry ER-NEWS-001 (status_snapshot.locked_recurring_visual_elements)
--   thylora_person_serial_registry ER-NEWS-PRESENTER-001 (locked_employee_props)
--   thylora_news_episode_registry THY-RAVENS-PAPER-20260917-001 (asset_manifest.visual_locks)
--   thylora_jewelry_watch_registry           (ORAH-BRACELET-001, JEWEL-WATCH-HOUSE-001)
--   merchandise_program                      (MERCH-MUG-001, MERCH-CUP-001, MERCH-SHIRT-001, MERCH-HAT-001)
--   serialized_collectible_policy            (THY-SERIAL-COLLECTIBLE-001)
--   sports_merchandise_program               (GGL-MERCH-001)
--
-- Values are copied, not restyled. Where the backend says UNKNOWN this says
-- UNKNOWN.

begin;

-- ===========================================================================
-- 1 · Artwork locks
-- ===========================================================================
insert into merch_artwork_lock (
  lock_code, lock_group, label, truth_class, value_text, treatment_rule,
  approval_state, merch_use_state, source_record, source_master_file,
  source_master_sha256, master_state, open_question, notes, sort_order
) values

('LOCK-ER-MASTHEAD','MASTHEAD','ErsatzReality News masthead','DOCUMENTED',
 'ErsatzReality News',
 'Exact approved spelling. Do not restyle or re-space. Do not hyphenate, split across lines, letter-space, arch, or convert to a monogram without Chairman instruction.',
 'CHAIRMAN_APPROVED','CLEARED_LOGO_ONLY',
 'thylora_brand_asset_slots.BRAND-ERNEWS-MASTHEAD',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 null,
 'Wordmark. Reproducible as drawn on flat and wrapped surfaces.',10),

('LOCK-ER-MARK-GLASS-HAT','MARK','Magnifying-glass + hat brand mark','DOCUMENTED',
 'Approved ErsatzReality magnifying-glass-and-hat mark, used as a recurring discoverable brand element when composition permits.',
 'Reproduce as drawn. No re-proportioning of glass to hat, no outline-only variant, no mirroring. Any method that requires simplification (embroidery, knit) is a mark change and needs separate approval.',
 'CHAIRMAN_APPROVED','CLEARED_LOGO_ONLY',
 'thylora_brand_asset_slots.BRAND-ER-MARK-GLASS-HAT',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 null,
 'QR may sit inside the magnifying-glass area ONLY after exact destination verification and a scannability test.',20),

('LOCK-ER-CUP-MARK','PROP','ErsatzReality News cup/mug treatment','DOCUMENTED',
 'Approved ErsatzReality News cup/mug as shown in approved Sports Edition 001 master.',
 'The cup treatment as it appears in the Sports Edition 001 master is the reference for the physical cup artwork. Read the mark placement and scale from the master; do not redesign the vessel graphic.',
 'CHAIRMAN_APPROVED_IN_MASTER','CLEARED_LOGO_ONLY',
 'thylora_person_serial_registry.ER-NEWS-PRESENTER-001.continuity_lock.locked_employee_props[2]',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'The prop was approved inside a master whose publication was rejected and which requires replacement. Confirm the prop lock carries forward to the replacement master unchanged.',
 'This is the on-screen prop. The saleable cup SKU is a derivative of it and carries its own gates.',30),

('LOCK-ER-REAR-TABLET-MARK','PROP','Rear computer/tablet ErsatzReality mark','DOCUMENTED',
 'Approved ErsatzReality logo treatment on rear of presenter computer/tablet as shown in approved Sports Edition 001 master.',
 'Single-surface mark applied to a hard rear shell. Reproduce as drawn at the master''s proportions. No added tagline, no frame, no drop shadow.',
 'CHAIRMAN_APPROVED_IN_MASTER','CLEARED_LOGO_ONLY',
 'thylora_person_serial_registry.ER-NEWS-PRESENTER-001.continuity_lock.locked_employee_props[3]',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'Same master-replacement question as LOCK-ER-CUP-MARK.',
 'Closest existing approved artwork to a shippable decal: already a flat mark on a hard shell.',40),

('LOCK-NEYRA-NECKLACE','JEWELRY','Neyra necklace','DOCUMENTED',
 'Approved necklace as shown in approved Sports Edition 001 master.',
 'Locked as a presenter prop. Direction is purple-led with restrained blue accent and gold detail, consistent across imagery, never a floating logo, never a copy of an Earth jewellery design.',
 'LOCKED_APPROVED','NOT_CLEARED',
 'thylora_news_episode_registry.THY-RAVENS-PAPER-20260917-001.asset_manifest.visual_locks.necklace',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'Approved as a rendered prop. Not the same as an approved manufacturable necklace design: no geometry, no gauge, no clasp, no Earth-manufacturable material, no supplier. Confirm whether the necklace line derives from this prop or is designed as its own piece.',
 'thylora_jewelry_watch_registry holds no row for this necklace. The jewellery house record JEWEL-WATCH-HOUSE-001 is realization_state DESIGN, commerce_state NOT_LIVE.',50),

('LOCK-ORAH-BAND','JEWELRY','ORAH band / bracelet','DOCUMENTED',
 'Approved ORAH band/bracelet visual as shown in approved Sports Edition 001 master.',
 'Must look like real jewellery, be consistent across imagery, carry a registered serial treatment, never be a floating logo, never copy an Earth jewellery design.',
 'PENDING_CORRECTION','NOT_CLEARED',
 'thylora_news_episode_registry.THY-RAVENS-PAPER-20260917-001.asset_manifest.visual_locks.bracelet; thylora_jewelry_watch_registry.ORAH-BRACELET-001',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'Two records disagree in degree: the episode marks the bracelet PENDING_CORRECTION while the jewellery registry marks ORAH-BRACELET-001 CHAIRMAN_VISUAL_REVIEW_PENDING. Either way the visual is not yet locked, so no ORAH SKU can pass G1.',
 'The presenter continuity lock already states: when a bracelet is visible on Neyra Sol, use only the approved ORAH system bracelet after its visual lock; random bracelets prohibited.',60),

('LOCK-PRESENTER-NEYRA','PRESENTER','Recurring presenter — Neyra Sol','DOCUMENTED',
 'Neyra Sol',
 'Editorial continuity lock. Preserve the Chairman-approved face, mature model proportions and purple-led wardrobe with restrained blue accent. Do not substitute another presenter.',
 'CHAIRMAN_APPROVED_NAME','NOT_CLEARED',
 'thylora_brand_asset_slots.BRAND-PRESENTER-NEYRA-SOL; thylora_person_serial_registry.ER-NEWS-PRESENTER-001',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'Identity is locked for the newspaper. Selling goods that depict her is a separate likeness question with no recorded decision. Until one exists, no SKU may show the presenter.',
 'Blocks the whole LOGO_SCENE family for any scene containing the presenter.',70),

('LOCK-MASTHEAD-FONT','FONT','Masthead font / style family','UNKNOWN',
 null,
 'A Chairman-provided visual reference is the style substrate. The exact font family name is NOT known and must not be guessed or silently renamed. Typeset merchandise text must be applied deterministically from approved artwork, not re-typed in a substitute face.',
 'CHAIRMAN_VISUAL_REFERENCE_LOCKED','NOT_CLEARED',
 'thylora_brand_asset_slots.BRAND-FONT-FAMILY; thylora_news_program_registry.ER-NEWS-001.status_snapshot.font_reference_state',
 null,null,null,
 'Backend state is CHAIRMAN_VISUAL_REFERENCE_LOCKED_EXACT_FONT_NAME_UNKNOWN. Any SKU needing new typesetting (a phrase, a size chart, a care label in brand face) cannot be specified until the family is identified or the text is supplied as approved outlines.',
 'Does not block SKUs that carry only the existing masthead artwork as a locked image.',80),

('LOCK-QR-DESTINATION','QR','Approved QR destinations','UNKNOWN',
 null,
 'The brand-mark rule requires exact destination verification and a scannability test before any QR is placed.',
 'NOT_APPROVED','NOT_CLEARED',
 'thylora_brand_asset_slots.BRAND-QR-DESTINATIONS; thylora_news_program_registry.ER-NEWS-001.status_snapshot.qr_target',
 null,null,null,
 'Two records disagree. The brand slot says no verified destination is registered. ER-NEWS-001 records qr_target as the Twelve Miles product URL with qr_machine_decode PASS_FINAL_MASTER_2026-09-17. Decide which governs merchandise before any QR is printed on goods.',
 'No first-wave SKU carries a QR. A printed QR is permanent in a way a page is not.',90),

('LOCK-THYLORA-MARK','MARK','THYLORA mark','UNKNOWN',
 null,
 'No approved THYLORA mark file is registered in this backend.',
 'NOT_APPROVED','NOT_CLEARED',
 'thylora_brand_asset_slots.BRAND-THYLORA-MARK; WR-VISUAL-BIBLE-001',
 null,null,null,
 'WR-VISUAL-BIBLE-001 records the ENURFRYM logo as not yet designed or approved. Every THYLORA-marked SKU is blocked at G1 until a mark exists.',
 'All first-wave SKUs are ErsatzReality-marked for this reason.',100),

('LOCK-EDITORIAL-TONE','MARK','Editorial tone lock','DOCUMENTED',
 'Technical, evidence-led, question-driven. Generic inspirational or cliche copy is prohibited.',
 'Applies to every phrase considered for merchandise. A slogan that would fail on the page fails on a cup.',
 'CHAIRMAN_APPROVED','CLEARED_ALL_FAMILIES',
 'thylora_brand_asset_slots.BRAND-EDITORIAL-TONE',
 null,null,null,null,
 'Gate input for the LOGO_PHRASE family rather than an artwork asset.',110)

on conflict (lock_code) do nothing;

-- ===========================================================================
-- 2 · Families
-- ===========================================================================
insert into merch_product_family (family_code, family_short, family_name, composition_rule, requires_phrase, requires_scene, opens_when, state) values
('LOGO_ONLY','L','Logo only',
 'Exactly one approved mark or masthead, alone. No phrase, no scene, no secondary lockup, no added tagline. A second approved treatment may appear only on a different surface, never combined into one lockup.',
 false,false,
 'Open now. Every required input is an already-approved mark treatment.',
 'OPEN'),
('LOGO_PHRASE','LP','Logo plus phrase',
 'One approved mark plus exactly one approved phrase from merch_phrase_registry. The phrase never overlaps the mark and never becomes part of it.',
 true,false,
 'Opens when at least one phrase reaches approval_state CHAIRMAN_APPROVED and passes the editorial tone lock. Currently no phrase is approved.',
 'HELD_NO_APPROVED_PHRASE'),
('LOGO_SCENE','LS','Logo plus scene',
 'One approved mark plus exactly one approved scene crop from merch_scene_registry, taken from a registered master with a recorded SHA-256. The mark is never placed over a face or over story action.',
 false,true,
 'Opens when a scene crop is approved AND the master it comes from is in a non-rejected state AND, if a person appears, a likeness decision exists. None of the three holds today.',
 'HELD_NO_APPROVED_SCENE')
on conflict (family_code) do nothing;

-- ===========================================================================
-- 3 · Classes
-- ===========================================================================
insert into merch_product_class (
  class_code, class_name, goods_kind, merchandise_program_ref, jewelry_registry_ref,
  artwork_surfaces, decoration_method, tooling_required, artwork_redraw_required,
  likeness_involved, serial_carrier, personalization_allowed, supplier_state, price_state, state
) values
('MUG','Mug','VESSEL','MERCH-MUG-001',null,
 '["side_a","side_b","base"]','CERAMIC_TRANSFER_OR_SUBLIMATION',false,false,false,
 'BASE_PRINT',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('CUP','Carry cup','VESSEL','MERCH-CUP-001',null,
 '["side_a","side_b","base"]','WRAP_PRINT_OR_LASER',false,false,false,
 'BASE_ETCH_OR_PRINT',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('STK','Sticker','ADHESIVE',null,null,
 '["face"]','DIE_CUT_VINYL',false,false,false,
 'BACKING_PRINT',false,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('PCH','Patch','APPLIQUE',null,null,
 '["face"]','EMBROIDERY_OR_WOVEN',true,true,false,
 'BACK_TWILL_TAG',false,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('SHIRT','Shirt','APPAREL','MERCH-SHIRT-001',null,
 '["left_chest","full_front","back","sleeve","inner_neck"]','SCREEN_PRINT_OR_DTG',false,false,false,
 'INNER_NECK_PRINT',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('SWEAT','Sweatshirt','APPAREL',null,null,
 '["left_chest","full_front","back","sleeve","inner_neck"]','SCREEN_PRINT_OR_EMBROIDERY',false,false,false,
 'INNER_NECK_PRINT',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('SOCK','Socks','KNIT',null,null,
 '["cuff","ankle","foot"]','KNIT_IN_JACQUARD',true,true,false,
 'CUFF_KNIT_OR_PACK_TAG',false,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('TABDEC','Tablet decal','ADHESIVE',null,null,
 '["face"]','DIE_CUT_VINYL',false,false,false,
 'BACKING_PRINT',false,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('LOCDEC','Locker decal','ADHESIVE',null,null,
 '["face"]','DIE_CUT_VINYL',false,false,false,
 'BACKING_PRINT',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_ACTIVE'),
('NECK','Necklace','JEWELRY',null,'JEWEL-WATCH-HOUSE-001',
 '["pendant_face","pendant_reverse","clasp"]','CAST_OR_FABRICATED',true,true,false,
 'CLASP_OR_REVERSE_STAMP',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_HELD'),
('ORAH','ORAH bracelet','JEWELRY',null,'ORAH-BRACELET-001',
 '["band_face","band_reverse","clasp"]','CAST_OR_FABRICATED',true,true,false,
 'BAND_REVERSE_STAMP',true,'UNSELECTED','AUTHORITY_REQUIRED','DESIGN_HELD')
on conflict (class_code) do nothing;

-- ===========================================================================
-- 4 · The cup system lock
-- ===========================================================================
insert into merch_cup_side_map (
  map_code, applies_to_classes, side_a_rule, side_a_allowed, side_b_rule, side_b_allowed,
  handle_zone_rule, base_zone_rule, interior_rule, swap_prohibited, verification_steps, state, authority
) values (
  'MERCH-CUP-SYSTEM-001',
  '["MUG","CUP"]',
  'Side A carries the logo mark and nothing else. Exactly one mark lock, centred on the primary display face. No phrase, no scene, no URL, no QR, no date, no edition text on side A.',
  '["MARK","MASTHEAD"]',
  'Side B carries exactly one of: an approved phrase, or an approved scene crop, or — for the LOGO_ONLY family — the masthead wordmark alone. Never two of the three. Never a second copy of the side A mark.',
  '["MASTHEAD","PHRASE","SCENE"]',
  'The handle and the 12 mm band either side of it stay clear. Artwork does not run under or behind a handle.',
  'The base carries the visible serial marking only.',
  'Interior surfaces carry no artwork. No inside-rim text.',
  true,
  '["Confirm side A carries one mark lock and nothing else",
    "Confirm side B carries exactly one of phrase, scene or masthead",
    "Confirm side A and side B are not transposed on the production file",
    "Confirm handle clearance on a physical proof, not on a flat render",
    "Confirm the base serial is legible after glaze or coating",
    "Confirm the mark reads correctly on a curved surface at arm''s length",
    "Confirm mark colour survives the vessel''s decoration method"]',
  'LOCKED',
  'Chairman directive, THYLORA HEAD — SPINE FORWARD, 2026-09-17'
) on conflict (map_code) do nothing;

commit;
