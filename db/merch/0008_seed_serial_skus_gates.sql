-- THYLORA merchandise lane · 0008 · serial rule, phrase/scene candidates,
--                                   runs, candidate SKUs, gates, make order
-- ADDITIVE ONLY. Not applied by this repository.

begin;

-- ===========================================================================
-- 1 · Serial rule
-- ===========================================================================
insert into merch_serial_rule (
  rule_code, parent_policy, authority, grammar, grammar_regex, segment_spec,
  original_rule, edition_rule, copy_number_rule, personalization_rule,
  visible_marking_rule, machine_payload_rule, transfer_rule, state
) values (
  'MERCH-SERIAL-001',
  'THY-SERIAL-COLLECTIBLE-001',
  'Chairman Vyctor Peete (parent policy); merchandise grammar added by THYLORA HEAD — SPINE FORWARD 2026-09-17',
  'ERM-<CLASS>-<FAMILY>-<ARTWORK>-R<run>-<COPY>[-P<digest>]',
  '^ERM-(MUG|CUP|STK|PCH|SHIRT|SWEAT|SOCK|TABDEC|LOCDEC|NECK|ORAH)-(L|LP|LS)-[A-Z0-9]{3,16}-R[0-9]{3}(-([0-9]{5}|ORIG))?(-P[0-9a-f]{8})?$',
  '{
     "ERM": "fixed prefix, ErsatzReality Merchandise",
     "CLASS": "merch_product_class.class_code",
     "FAMILY": "merch_product_family.family_short — L, LP or LS",
     "ARTWORK": "3-16 uppercase alphanumerics, the primary artwork lock short code",
     "run": "R001-R999, one run per approved release",
     "COPY": "00001-99999 for a reproduction, ORIG for the source master, omitted at SKU level",
     "digest": "optional 8 lowercase hex, digest of the personalisation payload only"
   }',
  'Exactly one ORIG may exist per run and it is the source master. No reproduction may be labelled or implied to be the original. A run with no ORIG is an open reproduction run and says so.',
  'A run declares an edition_class. edition_size stays null until separately approved; no edition count is invented. NUMBERED_LIMITED copies may not be issued while edition_size is null.',
  'Copy numbers are issued in sequence from 00001, never reused, never re-issued after a destroyed copy. A gap is recorded, not closed.',
  'Personalisation is carried as an 8-hex digest of the payload. The name, date, dedication or message itself is never encoded in the serial and never recoverable from it.',
  'Visible marking on the class serial_carrier: full serial, run edition_class, and creator credit. Visible marks are discovery clues; the backend row and hash are the authority because visible marks can be copied.',
  'Non-visible payload is a signed manifest carrying serial_code, sku_code, artefact SHA-256, run edition_class and issue timestamp. It carries no personal data in publicly recoverable form.',
  'Ownership or authorised custody transfer is recorded through THYLORA/Vlegh before the system treats the transfer as final inside EdereAriah. Earth legal title remains separate and must be satisfied where applicable.',
  'DESIGN_ACTIVE'
) on conflict (rule_code) do nothing;

-- ===========================================================================
-- 2 · Phrase candidates — every one traceable to an existing backend string.
--     None is approved. None was composed here.
-- ===========================================================================
insert into merch_phrase_registry (phrase_code, phrase_text, phrase_origin, truth_class, tone_gate_state, approval_state, notes) values
('PHR-001','DON''T LOSE THE QUESTION',
 'thylora_news_episode_registry.THY-LOGIC-POST-20260916-C.asset_manifest.caption','DOCUMENTED','PENDING',
 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'Existing approved-pipeline caption. Short enough for a cup side B and a left-chest lockup.'),
('PHR-002','ONE STORE PATH. WHAT DOES IT PROVE?',
 'thylora_news_episode_registry.THY-LOGIC-POST-20260916-A.asset_manifest.caption','DOCUMENTED','PENDING',
 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'Question-driven, matches the editorial tone lock. Long: cup side B or shirt back only.'),
('PHR-003','THE MISSING PAGES ARE PART OF THE STORY',
 'thylora_news_episode_registry.THY-LOGIC-POST-20260916-B.asset_manifest.caption','DOCUMENTED','PENDING',
 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'Long. Not viable on a sticker or a sock cuff.'),
('PHR-004','WOULD YOU WALK TWELVE MILES FOR FLOUR?',
 'thylora_news_episode_registry.THY-LOGIC-POST-20260916-A.title','DOCUMENTED','PENDING',
 'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'Ties merchandise to the one ACTIVE store product. Product-linked phrasing needs a separate check that the product stays available.')
on conflict (phrase_code) do nothing;

-- ===========================================================================
-- 3 · Scene candidates — crops of registered masters only.
-- ===========================================================================
insert into merch_scene_registry (
  scene_code, scene_name, master_file, master_sha256, master_state, master_record,
  crop_rule, crop_approved, rights_state, likeness_present, approval_state, open_question
) values
('SCN-SPORTS001','Sports Edition 001 newsroom scene',
 'ER_NEWS_MORNING_001_RAVENS_PUBLISH_MASTER.png',
 '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
 'POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED',
 'thylora_news_episode_registry.THY-RAVENS-PAPER-20260917-001',
 'Any crop must keep the cup, rear-tablet mark and masthead relationships intact and must not place the ErsatzReality mark over a face.',
 false,'UNKNOWN',true,'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'The master is in POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED and the scene contains the presenter. Two independent blocks: master state and likeness.'),
('SCN-TWELVEMILES-V3','Twelve Miles western illustration V3',
 'THY-VIS-TWELVE-MILES-WESTERN-ILLUSTRATION-V3',null,
 'APPROVED_RESERVED',
 'thylora_news_episode_registry.THY-LOGIC-POST-20260916-A.asset_manifest.selected_image_id',
 'Crop must satisfy THY-INTERWORLD-OLDFILM-BARRIER-001 and THY-VYC-VISUAL-GRAMMAR-002: selective colour only, membrane faint and non-object-like, subject identifiable.',
 false,'CLEARED_FOR_THIS_PRODUCT_ASSET',false,'CANDIDATE_CHAIRMAN_APPROVAL_REQUIRED',
 'The asset is recorded image_reserved_for the Twelve Miles product and storefront shelf. Extending it to merchandise is a scope change on a reserved asset and needs Chairman release.')
on conflict (scene_code) do nothing;

-- ===========================================================================
-- 4 · Runs
-- ===========================================================================
insert into merch_run (run_code, class_code, family_code, artwork_short, run_number, edition_class, edition_size, edition_size_state, state) values
('ERM-TABDEC-L-ERREARTABLET-R001','TABDEC','LOGO_ONLY','ERREARTABLET',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-STK-L-ERGLASSHAT-R001','STK','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-LOCDEC-L-ERREARTABLET-R001','LOCDEC','LOGO_ONLY','ERREARTABLET',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-MUG-L-ERGLASSHAT-R001','MUG','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-CUP-L-ERGLASSHAT-R001','CUP','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-SHIRT-L-ERGLASSHAT-R001','SHIRT','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-SWEAT-L-ERGLASSHAT-R001','SWEAT','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_ACTIVE'),
('ERM-PCH-L-ERGLASSHAT-R001','PCH','LOGO_ONLY','ERGLASSHAT',1,'NUMBERED_LIMITED',null,'UNSET_AWAITING_APPROVAL','DESIGN_HELD'),
('ERM-SOCK-L-ERGLASSHAT-R001','SOCK','LOGO_ONLY','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_HELD'),
('ERM-MUG-LP-ERGLASSHAT-R001','MUG','LOGO_PHRASE','ERGLASSHAT',1,'OPEN_RUN',null,'NOT_REQUIRED_FOR_OPEN_RUN','DESIGN_HELD'),
('ERM-CUP-LS-SPORTS001-R001','CUP','LOGO_SCENE','SPORTS001',1,'NUMBERED_LIMITED',null,'UNSET_AWAITING_APPROVAL','DESIGN_HELD'),
('ERM-NECK-L-NEYRANECK-R001','NECK','LOGO_ONLY','NEYRANECK',1,'NUMBERED_LIMITED',null,'UNSET_AWAITING_APPROVAL','DESIGN_HELD'),
('ERM-ORAH-L-ORAHBAND-R001','ORAH','LOGO_ONLY','ORAHBAND',1,'NUMBERED_LIMITED',null,'UNSET_AWAITING_APPROVAL','DESIGN_HELD')
on conflict (run_code) do nothing;

-- ===========================================================================
-- 5 · Candidate SKUs. Design records. No SKU is for sale.
-- ===========================================================================
insert into merch_sku (
  sku_code, sku_title, class_code, family_code, run_code, artwork_lock_codes,
  side_a_lock, side_b_kind, side_b_ref, phrase_code, scene_code,
  colourway, decoration_spec, make_state, blockers, next_executable_work
) values

('ERM-TABDEC-L-ERREARTABLET-R001','ErsatzReality rear-mark tablet decal','TABDEC','LOGO_ONLY',
 'ERM-TABDEC-L-ERREARTABLET-R001','["LOCK-ER-REAR-TABLET-MARK"]',
 null,null,null,null,null,
 'AS_APPROVED_IN_MASTER','{"surface":"face","method":"DIE_CUT_VINYL","sizes_mm":"pending proof","bleed":"pending proof"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","source master in POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED"]',
 'Extract the rear-shell mark from the approved master as vector artwork at the master proportions, then request a single die-cut proof. No new artwork is designed.'),

('ERM-STK-L-ERGLASSHAT-R001','ErsatzReality magnifying-glass and hat sticker','STK','LOGO_ONLY',
 'ERM-STK-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT"]',
 null,null,null,null,null,
 'AS_APPROVED','{"surface":"face","method":"DIE_CUT_VINYL","no_qr":true}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'Confirm the mark reproduces as drawn at sticker scale without simplification. Carries no QR: LOCK-QR-DESTINATION is unresolved.'),

('ERM-LOCDEC-L-ERREARTABLET-R001','ErsatzReality locker decal','LOCDEC','LOGO_ONLY',
 'ERM-LOCDEC-L-ERREARTABLET-R001','["LOCK-ER-REAR-TABLET-MARK"]',
 null,null,null,null,null,
 'AS_APPROVED_IN_MASTER','{"surface":"face","method":"DIE_CUT_VINYL","scale":"larger than TABDEC, re-proof required"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","scale re-proof not run"]',
 'Same artwork as the tablet decal at locker scale. Only a scale legibility re-proof is new work.'),

('ERM-MUG-L-ERGLASSHAT-R001','ErsatzReality News mug — logo only','MUG','LOGO_ONLY',
 'ERM-MUG-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT","LOCK-ER-MASTHEAD","LOCK-ER-CUP-MARK"]',
 'LOCK-ER-MARK-GLASS-HAT','MASTHEAD','LOCK-ER-MASTHEAD',null,null,
 'AS_APPROVED','{"side_map":"MERCH-CUP-SYSTEM-001","side_a":"glass-and-hat mark","side_b":"ErsatzReality News masthead","base":"serial"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","handle clearance unproven on a physical proof"]',
 'Lay out against MERCH-CUP-SYSTEM-001 and read placement from LOCK-ER-CUP-MARK in the master. Request one physical proof; judge handle clearance and base serial legibility on the object, not the render.'),

('ERM-CUP-L-ERGLASSHAT-R001','ErsatzReality News carry cup — logo only','CUP','LOGO_ONLY',
 'ERM-CUP-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT","LOCK-ER-MASTHEAD","LOCK-ER-CUP-MARK"]',
 'LOCK-ER-MARK-GLASS-HAT','MASTHEAD','LOCK-ER-MASTHEAD',null,null,
 'AS_APPROVED','{"side_map":"MERCH-CUP-SYSTEM-001","side_a":"glass-and-hat mark","side_b":"ErsatzReality News masthead","base":"serial"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","vessel body not specified"]',
 'Shares the mug side map exactly. The vessel body, lid and wall construction are unspecified and are a separate product decision from the artwork.'),

('ERM-SHIRT-L-ERGLASSHAT-R001','ErsatzReality mark shirt — left chest','SHIRT','LOGO_ONLY',
 'ERM-SHIRT-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT"]',
 null,null,null,null,null,
 'AS_APPROVED','{"placement":"left_chest","method":"SCREEN_PRINT_OR_DTG","inner_neck":"serial + creator credit"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","garment body and size range unselected","inner-neck label needs LOCK-MASTHEAD-FONT or supplied outlines"]',
 'Single-colour left-chest mark. The inner-neck label is the one place this SKU needs typeset text, so it needs either the font family identified or the label supplied as approved outlines.'),

('ERM-SWEAT-L-ERGLASSHAT-R001','ErsatzReality mark sweatshirt — left chest','SWEAT','LOGO_ONLY',
 'ERM-SWEAT-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT"]',
 null,null,null,null,null,
 'AS_APPROVED','{"placement":"left_chest","method":"SCREEN_PRINT_OR_EMBROIDERY","inner_neck":"serial + creator credit"}',
 'DESIGN','["supplier UNSELECTED","price AUTHORITY_REQUIRED","embroidery route would require a mark redraw"]',
 'Follows the shirt. If the supplier route is embroidery rather than print, the mark must be simplified — that is a mark change and needs its own approval.'),

('ERM-PCH-L-ERGLASSHAT-R001','ErsatzReality mark patch','PCH','LOGO_ONLY',
 'ERM-PCH-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT"]',
 null,null,null,null,null,
 'AS_APPROVED_PENDING_REDRAW','{"method":"EMBROIDERY_OR_WOVEN","digitising":"required","back":"twill tag with serial"}',
 'DESIGN','["embroidery digitising simplifies the mark — mark change requires Chairman approval","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'Produce a woven rather than embroidered sample first: woven holds finer detail and may reproduce the mark without a redraw. If it cannot, the redraw goes to the Chairman as a mark change.'),

('ERM-SOCK-L-ERGLASSHAT-R001','ErsatzReality mark socks','SOCK','LOGO_ONLY',
 'ERM-SOCK-L-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT"]',
 null,null,null,null,null,
 'AS_APPROVED_PENDING_REDRAW','{"method":"KNIT_IN_JACQUARD","cuff":"mark","tooling":"knit programme required"}',
 'DESIGN','["knit-in artwork requires a redraw at knit gauge — mark change requires Chairman approval","knit programme tooling","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'Held behind the patch decision: both ask the same question of whether the mark may be simplified for a thread-based method.'),

('ERM-MUG-LP-ERGLASSHAT-R001','ErsatzReality News mug — mark and phrase','MUG','LOGO_PHRASE',
 'ERM-MUG-LP-ERGLASSHAT-R001','["LOCK-ER-MARK-GLASS-HAT","LOCK-EDITORIAL-TONE"]',
 'LOCK-ER-MARK-GLASS-HAT','PHRASE','PHR-001','PHR-001',null,
 'AS_APPROVED','{"side_map":"MERCH-CUP-SYSTEM-001","side_a":"glass-and-hat mark","side_b":"phrase","base":"serial"}',
 'DESIGN','["no phrase is approved — every merch_phrase_registry row is CANDIDATE","phrase typesetting needs LOCK-MASTHEAD-FONT or supplied outlines","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'Blocked at the family, not the class. The mug itself is ready; the phrase is not. Nothing to build until a phrase is approved.'),

('ERM-CUP-LS-SPORTS001-R001','ErsatzReality News cup — Sports Edition 001 scene','CUP','LOGO_SCENE',
 'ERM-CUP-LS-SPORTS001-R001','["LOCK-ER-MARK-GLASS-HAT","LOCK-PRESENTER-NEYRA"]',
 'LOCK-ER-MARK-GLASS-HAT','SCENE','SCN-SPORTS001',null,'SCN-SPORTS001',
 'AS_APPROVED','{"side_map":"MERCH-CUP-SYSTEM-001","side_a":"glass-and-hat mark","side_b":"approved scene crop","base":"serial"}',
 'DESIGN','["source master is POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED","scene contains the presenter and no merchandise likeness decision exists","edition_size unset","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'Two independent blocks. Do not crop the rejected master. Re-raise once a replacement master exists and a likeness decision is recorded.'),

('ERM-NECK-L-NEYRANECK-R001','THYLORA / ErsatzReality necklace — line 001','NECK','LOGO_ONLY',
 'ERM-NECK-L-NEYRANECK-R001','["LOCK-NEYRA-NECKLACE"]',
 null,null,null,null,null,
 'DIRECTION_ONLY','{"method":"CAST_OR_FABRICATED","geometry":"UNKNOWN","material":"UNKNOWN","clasp":"UNKNOWN"}',
 'DESIGN','["approved as a rendered prop, not as a manufacturable design","no geometry, gauge, clasp or Earth-manufacturable material","Vycara and Edereaireum Earth composition unverified — no material claim may be printed","no row in thylora_jewelry_watch_registry for this necklace","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'First real work is a jewellery realization brief under JEWEL-WATCH-HOUSE-001: geometry, gauge, clasp, stone setting and an Earth-manufacturable material. Not a printing job.'),

('ERM-ORAH-L-ORAHBAND-R001','ORAH bracelet — line 001','ORAH','LOGO_ONLY',
 'ERM-ORAH-L-ORAHBAND-R001','["LOCK-ORAH-BAND"]',
 null,null,null,null,null,
 'DIRECTION_ONLY','{"method":"CAST_OR_FABRICATED","geometry":"UNKNOWN","material":"UNKNOWN","serial_treatment":"required, registered"}',
 'DESIGN','["visual not locked: episode says PENDING_CORRECTION, jewellery registry says CHAIRMAN_VISUAL_REVIEW_PENDING","no Earth-manufacturable material specified","recognition-linkage rules not defined for a saleable unit","supplier UNSELECTED","price AUTHORITY_REQUIRED"]',
 'ORAH is a recognition instrument before it is a product. Resolve the visual lock, then decide whether a saleable ORAH exists at all or whether it is issued only to recognised personnel.')

on conflict (sku_code) do nothing;

commit;
