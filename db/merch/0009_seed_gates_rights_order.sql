-- THYLORA merchandise lane · 0009 · gates, rights records, make order
-- ADDITIVE ONLY. Not applied by this repository.

begin;

-- ===========================================================================
-- 1 · Gates, in order. No SKU skips one.
-- ===========================================================================
insert into merch_approval_gate (gate_code, gate_order, gate_name, applies_to, requirement, parent_gate_refs, authority, verification_steps, fail_stop) values

('G1',1,'Artwork lock verified','["*"]',
 'Every artwork lock the SKU references exists in merch_artwork_lock, is CHAIRMAN_APPROVED or CHAIRMAN_APPROVED_IN_MASTER, has merch_use_state cleared for this family, and has no unresolved open_question.',
 '["THY-VISUAL-OUTPUT-IDENTITY-001"]','SYSTEM',
 '["Resolve each lock_code","Reject any lock at NOT_APPROVED or PENDING_CORRECTION","Reject any lock whose merch_use_state is NOT_CLEARED","Reject any lock with a non-null open_question","Confirm no_silent_change has not been bypassed"]',
 'A SKU referencing an unapproved or contested mark is not designed further.'),

('G2',2,'Cup side map verified','["MUG","CUP"]',
 'side_a_lock is one mark or masthead lock and nothing else. side_b_kind is exactly one of MASTHEAD, PHRASE, SCENE. Sides are not transposed. Handle, base and interior rules hold.',
 '["MERCH-CUP-SYSTEM-001"]','SYSTEM',
 '["Confirm side A carries one lock","Confirm side B carries exactly one of the three kinds","Confirm side A mark does not repeat on side B","Confirm handle clearance band","Confirm base carries the serial only","Confirm interior is unmarked"]',
 'A vessel with an ambiguous or swapped side map does not go to proof.'),

('G3',3,'Family composition verified','["*"]',
 'The SKU''s family inputs exist and are approved: LOGO_ONLY carries no phrase and no scene; LOGO_PHRASE carries one CHAIRMAN_APPROVED phrase that passed the editorial tone lock; LOGO_SCENE carries one approved crop of a master in a non-rejected state.',
 '["BRAND-EDITORIAL-TONE"]','SYSTEM',
 '["Confirm family_code matches the inputs present","Confirm phrase approval_state and tone_gate_state","Confirm scene crop_approved and master_state","Reject a scene whose master is rejected or superseded"]',
 'No SKU is built on a candidate phrase or a rejected master.'),

('G4',4,'Visual identity and exactness gate','["*"]',
 'Exact identifiers and marks are applied deterministically from approved artwork. Generative text or a regenerated mark cannot pass. Stock-template appearance is prohibited.',
 '["THY-VISUAL-OUTPUT-IDENTITY-001","THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001","THY-VISUAL-PREFLIGHT-GATE"]','SYSTEM',
 '["Confirm the mark on the production file is the approved artwork, not a redraw or a regeneration","Confirm masthead spelling character by character","Confirm no decorative element obscures the mark or the serial","Confirm print-floor legibility: ink load, contrast, smudge risk","Inspect at product-page scale and at arm''s length"]',
 'A regenerated or re-typed mark fails, however close it looks.'),

('G5',5,'Rights, likeness and materials pass','["*"]',
 'merch_rights_record.rights_pass is true: mark, masthead, font, phrase, scene, likeness, QR, trademark, material claim and supplier rights each resolved to a cleared state, creator credit recorded, Vlegh reference assigned.',
 '["THY-SERIAL-COLLECTIBLE-001","WR-IP-RIGHTS-001"]','CHAIRMAN',
 '["Resolve every UNKNOWN in the rights record","Record a likeness decision for any SKU depicting a person","Confirm no unverified Earth material claim appears on tag or listing","Confirm trademark clearance for the mark as applied to these goods classes","Assign the Vlegh reference"]',
 'No goods are made against an UNKNOWN rights column.'),

('G6',6,'Serial assigned','["*"]',
 'The run exists, edition_class is declared, edition_size is set where the class requires it, and the serial conforms to MERCH-SERIAL-001 grammar with a visible marking plan and a machine payload plan.',
 '["THY-SERIAL-COLLECTIBLE-001","MERCH-SERIAL-001"]','SYSTEM',
 '["Validate serial against the grammar regex","Confirm at most one ORIG per run","Confirm edition_size is set for NUMBERED_LIMITED","Confirm the personalisation digest carries no personal data","Confirm the serial carrier survives the decoration method"]',
 'No copy is issued without a conforming serial.'),

('G7',7,'Physical proof approved','["*"]',
 'A physical proof of the actual object has been produced and judged on the object. Renders do not satisfy this gate.',
 '["THY-VISUAL-OUTPUT-IDENTITY-001 print_floor"]','CHAIRMAN',
 '["Inspect the physical object","Confirm mark fidelity on the real substrate","Confirm serial legibility after glaze, coating or wash","Confirm colour under ordinary light","For apparel, confirm after one wash cycle"]',
 'A render-only approval does not pass. This gate is where a wrong supplier is caught cheaply.'),

('G8',8,'Supplier selected and contracted','["*"]',
 'A named supplier with a recorded contract, fulfilment mode, unit cost and lead time. Every merchandise_program row currently reads earth_supplier_state UNSELECTED.',
 '["merchandise_program.earth_supplier_state"]','CHAIRMAN',
 '["Record supplier identity and contract","Record fulfilment mode","Record verified unit cost, not a published rate card","Record lead time","Record defect and reprint terms"]',
 'Hard stop for every class today. No SKU can pass.'),

('G9',9,'Chairman price set','["*"]',
 'A price and currency set by Chairman authority. Every merchandise_program row currently reads chairman_price_state AUTHORITY_REQUIRED.',
 '["merchandise_program.chairman_price_state","THY-COMMERCE-PROVIDER-AUTHORITY-001"]','CHAIRMAN',
 '["Set price and currency","Record verified processor rate from the account, not a published rate","Record unit cost and margin"]',
 'Hard stop for every class today.'),

('G10',10,'Store release and witness','["*"]',
 'Shelf assigned, listing created by provider readback, checkout path verified, fulfilment witnessed, re-access or delivery witnessed. Only then may commerce_state or manufacturing_state leave their NOT_ values.',
 '["thylora_store_shelf_release_gate","thylora_first_customer_witness_policy","THY-COMMERCE-PROVIDER-AUTHORITY-001"]','CHAIRMAN',
 '["Assign a shelf","Create the listing and read it back from the provider","Verify the checkout path","Witness one fulfilled physical order end to end","Record the witness evidence before any claim of live commerce"]',
 'Until this passes, nothing in this lane is manufactured or on sale, and nothing may be described as either.')

on conflict (gate_code) do nothing;

-- ===========================================================================
-- 2 · Rights records, one per candidate SKU
-- ===========================================================================
insert into merch_rights_record (
  sku_code, artwork_lock_refs, mark_rights_state, masthead_rights_state, font_rights_state,
  phrase_rights_state, scene_rights_state, likeness_rights_state, likeness_subject,
  qr_destination_state, trademark_clearance, material_claim_state, supplier_rights_state,
  creator_credit_names, rights_pass, blocking_reasons
)
select
  s.sku_code,
  s.artwork_lock_codes,
  'APPROVED_MARK_MERCH_USE_UNVERIFIED',
  case when s.artwork_lock_codes ? 'LOCK-ER-MASTHEAD' then 'APPROVED_SPELLING_MERCH_USE_UNVERIFIED' else 'NOT_APPLICABLE' end,
  case when s.class_code in ('SHIRT','SWEAT') or s.family_code = 'LOGO_PHRASE' then 'UNKNOWN_FONT_FAMILY_NOT_IDENTIFIED' else 'NOT_APPLICABLE' end,
  case when s.family_code = 'LOGO_PHRASE' then 'CANDIDATE_NOT_APPROVED' else 'NOT_APPLICABLE' end,
  case when s.family_code = 'LOGO_SCENE' then 'UNKNOWN' else 'NOT_APPLICABLE' end,
  case when s.artwork_lock_codes ? 'LOCK-PRESENTER-NEYRA' then 'NOT_CLEARED_FOR_MERCHANDISE' else 'NOT_APPLICABLE' end,
  case when s.artwork_lock_codes ? 'LOCK-PRESENTER-NEYRA' then 'Neyra Sol (ER-NEWS-PRESENTER-001)' else null end,
  'NOT_APPLICABLE_NO_QR_ON_THIS_SKU',
  'UNKNOWN',
  case when s.class_code in ('NECK','ORAH') then 'UNVERIFIED_WORLD_MATERIAL_CLAIMS_PROHIBITED' else 'NOT_APPLICABLE' end,
  'UNKNOWN_NO_SUPPLIER_SELECTED',
  '{"state":"UNKNOWN","note":"creator_credit_required is true on every merchandise_program row; the credited parties are not yet recorded"}',
  false,
  '["G5 not run: rights columns carry UNKNOWN","G8 supplier UNSELECTED","G9 price AUTHORITY_REQUIRED"]'
from merch_sku s
where not exists (select 1 from merch_rights_record r where r.sku_code = s.sku_code);

-- ===========================================================================
-- 3 · Make order — fastest first, on recorded evidence
-- ===========================================================================
insert into merch_make_order (
  rank, sku_code, speed_class, artwork_already_approved, new_artwork_approvals_needed,
  tooling_required, likeness_involved, surfaces_count,
  remaining_chairman_decisions, remaining_system_work, rationale
) values

(1,'ERM-TABDEC-L-ERREARTABLET-R001','FIRST_WAVE',true,0,false,false,1,
 '["master-replacement confirmation for the prop lock","supplier","price"]',
 '["vector extraction from the approved master","die-cut proof","serial marking plan"]',
 'The artwork already exists as an approved flat mark on a hard rear shell. A decal is the same job on a different shell. One surface, no tooling, no likeness, no phrase, no scene, no QR. Nothing has to be designed.'),

(2,'ERM-STK-L-ERGLASSHAT-R001','FIRST_WAVE',true,0,false,false,1,
 '["supplier","price"]',
 '["scale fidelity check","die-cut proof","backing serial plan"]',
 'The magnifying-glass and hat mark is approved as a standalone mark, not only inside a master, so it carries no master-replacement question. Single surface, single colour route, no tooling.'),

(3,'ERM-LOCDEC-L-ERREARTABLET-R001','FIRST_WAVE',true,0,false,false,1,
 '["master-replacement confirmation for the prop lock","supplier","price"]',
 '["scale legibility re-proof at locker size"]',
 'Identical artwork to rank 1 at a larger scale. The only new work is a scale re-proof, which rides on the rank 1 proof run.'),

(4,'ERM-MUG-L-ERGLASSHAT-R001','FIRST_WAVE',true,0,false,false,3,
 '["master-replacement confirmation for the cup prop lock","supplier","price"]',
 '["side map layout against MERCH-CUP-SYSTEM-001","physical proof for handle clearance and base serial","curved-surface legibility check"]',
 'Both treatments the mug needs are already approved: the mark for side A, the masthead for side B. The cup prop in the master supplies placement. Slower than a decal only because a curved surface and a handle have to be judged on a physical object.'),

(5,'ERM-CUP-L-ERGLASSHAT-R001','FIRST_WAVE',true,0,false,false,3,
 '["master-replacement confirmation for the cup prop lock","vessel body specification","supplier","price"]',
 '["same side map as rank 4","wrap or laser proof"]',
 'Shares the mug side map exactly, so the artwork work is already done by rank 4. It sits behind the mug because the vessel body, lid and wall construction are an unmade product decision, not an artwork one.'),

(6,'ERM-SHIRT-L-ERGLASSHAT-R001','SECOND_WAVE',true,0,false,false,2,
 '["garment body and size range","inner-neck label: identify the font family or supply approved outlines","supplier","price"]',
 '["left-chest placement spec","print proof","wash test"]',
 'The chest mark needs no new approval. What holds it is the inner-neck label, which is the one element on the garment that needs typeset text — and the exact masthead font family is recorded as UNKNOWN.'),

(7,'ERM-SWEAT-L-ERGLASSHAT-R001','SECOND_WAVE',true,0,false,false,2,
 '["same as the shirt","whether the supplier route is print or embroidery"]',
 '["follows the shirt spec"]',
 'Follows the shirt. If the supplier route turns out to be embroidery, the mark must be simplified and it stops being a second-wave item.'),

(8,'ERM-PCH-L-ERGLASSHAT-R001','HELD',true,1,true,false,1,
 '["whether the mark may be simplified for a thread-based method — this is a mark change","edition size","supplier","price"]',
 '["woven sample before any embroidery digitising"]',
 'Embroidery cannot reproduce the mark as drawn. Simplifying it is a mark change, and no_silent_change applies. Try woven first: it holds finer detail and may avoid the question entirely.'),

(9,'ERM-SOCK-L-ERGLASSHAT-R001','HELD',true,1,true,false,3,
 '["same mark-simplification question as the patch","supplier","price"]',
 '["knit programme once the artwork question is answered"]',
 'Knit-in artwork is a redraw at knit gauge. It asks the same question as the patch and should wait for the same answer rather than asking it twice.'),

(10,'ERM-MUG-LP-ERGLASSHAT-R001','HELD',true,0,false,false,3,
 '["approve at least one phrase","identify the font family or supply the phrase as approved outlines","supplier","price"]',
 '["nothing until a phrase is approved"]',
 'The mug is ready. The phrase is not: every phrase in the registry is a candidate traced to an existing backend caption, and the editorial tone lock prohibits inventing one here.'),

(11,'ERM-CUP-LS-SPORTS001-R001','HELD',false,2,false,true,3,
 '["confirm the replacement master","record a merchandise likeness decision for the presenter","approve a scene crop","edition size","supplier","price"]',
 '["nothing until the master and likeness questions are answered"]',
 'Two independent blocks. The source master is in POSTPUBLICATION_REJECTED_REPLACEMENT_REQUIRED, and the scene contains the presenter with no merchandise likeness decision on record.'),

(12,'ERM-NECK-L-NEYRANECK-R001','HELD',false,1,true,false,3,
 '["whether the necklace line derives from the presenter prop or is designed as its own piece","Earth-manufacturable material specification","edition size","supplier","price"]',
 '["jewellery realization brief under JEWEL-WATCH-HOUSE-001: geometry, gauge, clasp, setting"]',
 'The necklace is approved as a rendered prop, which is not a manufacturable design. There is no geometry, no gauge, no clasp and no Earth material. Vycara and Edereaireum have unverified Earth composition, so no material claim may be printed.'),

(13,'ERM-ORAH-L-ORAHBAND-R001','HELD',false,1,true,false,3,
 '["resolve the ORAH visual lock — one record says PENDING_CORRECTION, another says CHAIRMAN_VISUAL_REVIEW_PENDING","whether a saleable ORAH exists at all or whether it is issued only to recognised personnel","Earth-manufacturable material","edition size","supplier","price"]',
 '["nothing until the visual lock closes"]',
 'ORAH is a recognition instrument before it is a product. Selling it and awarding it are different systems, and the visual is not yet locked in either.')

on conflict (rank) do nothing;

commit;
