-- Seeded ONLY from records already present in thylora-dash. Nothing invented.
-- Where the backend says the exact value is unknown, truth_class stays UNKNOWN and
-- value_text stays null so the surface prints UNKNOWN rather than a guess.
insert into public.thylora_brand_asset_slots
  (slot_code, slot_group, label, truth_class, value_text, reference_ref, approval_state, source_record, notes, sort_order)
values
  ('BRAND-ERNEWS-MASTHEAD','MASTHEAD','ErsatzReality News masthead','DOCUMENTED',
   'ErsatzReality News','ER-NEWS-001','CHAIRMAN_APPROVED',
   'thylora_news_program_registry.status_snapshot.masthead_spelling',
   'Exact approved spelling. Do not restyle or re-space without Chairman instruction.',10),
  ('BRAND-ER-MARK-GLASS-HAT','MARK','Magnifying-glass + hat brand mark','DOCUMENTED',
   'Approved ErsatzReality magnifying-glass-and-hat mark, used as a recurring discoverable brand element when composition permits.',
   'ER-NEWS-001','CHAIRMAN_APPROVED','thylora_news_program_registry.status_snapshot.brand_mark_rule',
   'QR may sit inside the magnifying-glass area ONLY after exact destination verification and a scannability test.',20),
  ('BRAND-THYLORA-MARK','MARK','THYLORA mark','UNKNOWN',
   null,null,'NOT_APPROVED','thylora_visual_slots / WR-VISUAL-BIBLE-001',
   'WR-VISUAL-BIBLE-001 records the ENURFRYM logo as not yet designed or approved. No approved THYLORA mark file is registered in this backend.',30),
  ('BRAND-QR-DESTINATIONS','QR','Approved QR destinations','UNKNOWN',
   null,null,'NOT_APPROVED','thylora_news_program_registry.status_snapshot.brand_mark_rule',
   'The brand-mark rule requires exact destination verification and a scannability test before any QR is placed. No verified destination is registered yet.',40),
  ('BRAND-PRESENTER-NEYRA-SOL','PRESENTER','Recurring presenter — Neyra Sol','DOCUMENTED',
   'Neyra Sol','ER-NEWS-PRESENTER-001','CHAIRMAN_APPROVED_NAME',
   'thylora_news_program_registry.status_snapshot.presenter_name',
   'Use the Chairman-selected Neyra Sol reference image; preserve identity and model proportions. Do not substitute the previously generated presenter.',50),
  ('BRAND-PRESENTER-WARDROBE','PRESENTER','Presenter wardrobe direction','DOCUMENTED',
   'Purple-led professional styling with a restrained blue accent.','ER-NEWS-PRESENTER-001','CHAIRMAN_APPROVED',
   'thylora_news_program_registry.status_snapshot.presenter_wardrobe_direction',
   'Direction is recorded. Exact garment references are not registered.',60),
  ('BRAND-JEWELRY-ACCESSORIES','JEWELRY','Approved jewelry / accessories','ANALYSIS',
   'THYLORA / ERSATZ REALITY necklace and bracelet, to be shown when visible on the presenter.',
   null,'DIRECTION_APPROVED_ASSET_NOT_REGISTERED',
   'thylora_news_program_registry.status_snapshot.presenter_wardrobe_direction',
   'Direction is Chairman-approved, but no specific approved jewelry asset file is registered in thylora_jewelry_watch_registry for this presenter.',70),
  ('BRAND-FONT-FAMILY','FONT','Masthead font / style family','UNKNOWN',
   null,null,'CHAIRMAN_VISUAL_REFERENCE_LOCKED',
   'thylora_news_program_registry.status_snapshot.font_reference_state',
   'Backend state is CHAIRMAN_VISUAL_REFERENCE_LOCKED_EXACT_FONT_NAME_UNKNOWN. A Chairman-provided visual reference is the style substrate. The exact font family name is NOT known and must not be guessed or silently renamed.',80),
  ('BRAND-EDITORIAL-TONE','TONE','Editorial tone lock','DOCUMENTED',
   'Technical, evidence-led, question-driven. Generic inspirational or cliche copy is prohibited.',
   'ER-NEWS-001','CHAIRMAN_APPROVED','thylora_news_program_registry.status_snapshot.editorial_tone_lock',
   null,90)
on conflict (slot_code) do nothing;
