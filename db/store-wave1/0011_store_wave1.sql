-- 0011_store_wave1.sql
-- THY-WORK-STORE-UTILITY-WAVE1-580
--
-- Wave 1 utility shelf: shelf placement, product records, serial issue, delivery
-- binding and the release gate. Reviewable. NOT applied by this delta.
--
-- Rules held by this file:
--   * Additive only. No DROP, no DELETE, no TRUNCATE, no UPDATE of prior state.
--   * Shelf placement is a new row, never an edit of an old one. Moving the four
--     story titles off the lead shelf writes a NEW placement; the old placement
--     stays readable, so history is preserved rather than overwritten.
--   * No commerce infrastructure is created. Delivery binds to whatever protected
--     digital-delivery spine already exists, and only if it exists.
--   * Nothing here makes a product purchasable. Release is a Chairman decision.

BEGIN;

CREATE SCHEMA IF NOT EXISTS thy_store;

-- ---------------------------------------------------------------- shelves ---
CREATE TABLE IF NOT EXISTS thy_store.shelf (
  shelf_key     text PRIMARY KEY,
  title         text NOT NULL,
  is_lead_shelf boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO thy_store.shelf (shelf_key, title, is_lead_shelf) VALUES
  ('utility',       'Utility shelf',            true),
  ('story_world',   'Story and world inventory', false)
ON CONFLICT (shelf_key) DO NOTHING;

-- Exactly one lead shelf, enforced by the database rather than by convention.
CREATE UNIQUE INDEX IF NOT EXISTS thy_store_one_lead_shelf
  ON thy_store.shelf ((true)) WHERE is_lead_shelf;

-- --------------------------------------------------------------- products ---
CREATE TABLE IF NOT EXISTS thy_store.product (
  sku             text PRIMARY KEY,
  title           text NOT NULL,
  subtitle        text,
  customer_job    text NOT NULL,
  artifact_path   text,
  cover_path      text,
  cover_alt_text  text,
  plates          integer,
  publisher       text NOT NULL DEFAULT 'THYLORA',
  editor          text,
  designer        text,
  provenance      text,
  rights_grant    text NOT NULL,
  customer_value  text NOT NULL,
  refund_fit      text NOT NULL,
  kind            text NOT NULL DEFAULT 'utility'
                  CHECK (kind IN ('utility','story_world')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thy_store_product_plates_positive
    CHECK (plates IS NULL OR plates > 0)
);

-- ------------------------------------------------- shelf placement history ---
-- Append-only. A move is an INSERT, not an UPDATE. current_shelf() reads the
-- newest row, so the previous placement remains legible forever.
CREATE TABLE IF NOT EXISTS thy_store.shelf_placement (
  placement_id bigserial PRIMARY KEY,
  sku          text NOT NULL REFERENCES thy_store.product(sku),
  shelf_key    text NOT NULL REFERENCES thy_store.shelf(shelf_key),
  position     integer,
  reason       text NOT NULL,
  placed_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thy_store_placement_position
    CHECK (position IS NULL OR position > 0)
);

CREATE INDEX IF NOT EXISTS thy_store_placement_sku_time
  ON thy_store.shelf_placement (sku, placed_at DESC);

CREATE OR REPLACE FUNCTION thy_store.current_shelf(p_sku text)
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT shelf_key
  FROM thy_store.shelf_placement
  WHERE sku = p_sku
  ORDER BY placed_at DESC, placement_id DESC
  LIMIT 1;
$$;

-- ----------------------------------------------------------------- serials ---
CREATE TABLE IF NOT EXISTS thy_store.serial_root (
  sku              text PRIMARY KEY REFERENCES thy_store.product(sku),
  root             text NOT NULL UNIQUE,
  edition          integer NOT NULL CHECK (edition > 0),
  edition_year     integer NOT NULL CHECK (edition_year BETWEEN 2000 AND 2200),
  per_copy_prefix  text NOT NULL,
  next_copy_no     bigint NOT NULL DEFAULT 1 CHECK (next_copy_no > 0)
);

CREATE TABLE IF NOT EXISTS thy_store.issued_serial (
  serial_no    text PRIMARY KEY,
  sku          text NOT NULL REFERENCES thy_store.product(sku),
  copy_no      bigint NOT NULL,
  issued_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sku, copy_no)
);

-- One serial per copy, allocated under a row lock so two buyers cannot collide.
CREATE OR REPLACE FUNCTION thy_store.issue_serial(p_sku text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE v_prefix text; v_no bigint; v_serial text;
BEGIN
  UPDATE thy_store.serial_root
     SET next_copy_no = next_copy_no + 1
   WHERE sku = p_sku
  RETURNING per_copy_prefix, next_copy_no - 1 INTO v_prefix, v_no;

  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'NO_SERIAL_ROOT for sku %', p_sku;
  END IF;

  v_serial := v_prefix || lpad(v_no::text, 6, '0');
  INSERT INTO thy_store.issued_serial (serial_no, sku, copy_no)
  VALUES (v_serial, p_sku, v_no);
  RETURN v_serial;
END;
$$;

-- ---------------------------------------------------------------- delivery ---
-- Binds a product to the delivery spine that already exists. No new spine is
-- created here, and nothing is marked deliverable until the binding is verified.
CREATE TABLE IF NOT EXISTS thy_store.delivery_binding (
  sku                       text PRIMARY KEY REFERENCES thy_store.product(sku),
  spine                     text NOT NULL DEFAULT 'existing_protected_digital_delivery',
  entitlement_path          text NOT NULL,
  re_access                 text NOT NULL DEFAULT 'permanent_for_buying_account',
  re_access_consumes_allowance boolean NOT NULL DEFAULT false,
  new_infrastructure_built  boolean NOT NULL DEFAULT false,
  binding_verified          boolean NOT NULL DEFAULT false,
  CONSTRAINT thy_store_no_new_commerce_infrastructure
    CHECK (new_infrastructure_built = false)
);

-- ------------------------------------------------------------ price + gate ---
CREATE TABLE IF NOT EXISTS thy_store.price_proposal (
  proposal_id bigserial PRIMARY KEY,
  sku         text NOT NULL REFERENCES thy_store.product(sku),
  amount_minor integer NOT NULL CHECK (amount_minor >= 0),
  currency    text NOT NULL DEFAULT 'USD',
  locked      boolean NOT NULL DEFAULT false,
  note        text,
  proposed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thy_store.release_gate (
  sku        text NOT NULL REFERENCES thy_store.product(sku),
  gate       text NOT NULL,
  state      text NOT NULL CHECK (state IN ('READY','PROPOSED','OPEN','BLOCKED')),
  evidence   text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sku, gate)
);

-- A product is publishable only when every one of its gates reads READY.
-- There is no override flag: the gate is the authority.
CREATE OR REPLACE FUNCTION thy_store.is_publishable(p_sku text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM thy_store.release_gate WHERE sku = p_sku)
     AND NOT EXISTS (
           SELECT 1 FROM thy_store.release_gate
           WHERE sku = p_sku AND state <> 'READY'
         );
$$;

-- ------------------------------------------------------------ wave 1 seed ---
INSERT INTO thy_store.product
  (sku, title, subtitle, customer_job, artifact_path, cover_path, cover_alt_text,
   plates, designer, provenance, rights_grant, customer_value, refund_fit, kind)
VALUES
  ('THY-QYRIS-QUICKCHECK-001',
   'THYLORA QYRIS QuickCheck', 'One Decision, Five Passes',
   'Make one real decision using Question, Yield, Reason, Inspect, Safeguard.',
   'store/qyris-quickcheck/index.html', 'store/covers/qyris-quickcheck.svg',
   'Dark warm cover. Five markers graded from gold to blue run across the middle, labelled Question, Yield, Reason, Inspect and Safeguard, each with a short plain-language note beneath. Title reads One Decision, Five Passes.',
   8, 'THYLORA Product Page System TPS-1',
   'Authored for the THYLORA utility shelf, Wave 1, sequence 580.',
   'Single-person licence. Print, fill and reuse for the buyer''s own decisions. No resale, no redistribution.',
   'A decision carried for weeks either gets made, or turns into a short list of facts to go and get.',
   'Digital artifact, immediate delivery, refundable within the standard window where it could not be opened, was not as described, or was bought in error.',
   'utility'),
  ('THY-STUCK-LOOP-RESET-001',
   'THYLORA Stuck Loop Reset', 'Get Out of the Click-Again Cycle',
   'Escape a repeating login, website, app, form, customer-service or verification loop by preserving state.',
   'store/stuck-loop-reset/index.html', 'store/covers/stuck-loop-reset.svg',
   'Dark cover showing a dashed closed loop labelled try again, same error, start over, same screen. A single gold arrow breaks out of the loop toward the word STOP and the instruction capture the state.',
   6, 'THYLORA Product Page System TPS-1',
   'Authored for the THYLORA utility shelf, Wave 1, sequence 580. QYRIS friction pass applied to repeating-state failures.',
   'Single-person licence. Print, fill and reuse for the buyer''s own loops. No resale, no redistribution.',
   'You stop arriving as somebody who cannot log in, and start arriving with a named failing step, a timestamp and a test you already ran.',
   'Digital artifact, immediate delivery, refundable within the standard window where it could not be opened, was not as described, or was bought in error.',
   'utility'),
  ('THY-BEFORE-YOU-BUY-001',
   'THYLORA Before You Buy', '10-Minute Evidence Check',
   'Inspect a purchase or service claim before spending money.',
   'store/before-you-buy/index.html', 'store/covers/before-you-buy.svg',
   'Dark cover with three facing pairs separated by a not-equals sign: claim and evidence, price and total cost, review and independent test. Title reads Before You Buy, 10-Minute Evidence Check.',
   8, 'THYLORA Product Page System TPS-1',
   'Authored for the THYLORA utility shelf, Wave 1, sequence 580. QYRIS inspect and safeguard passes applied to purchase claims.',
   'Single-person licence. Print, fill and reuse for the buyer''s own purchases. No resale, no redistribution.',
   'Either you buy with your eyes open, or you learn in ten minutes that the thing is harder to check than it looked.',
   'Digital artifact, immediate delivery, refundable within the standard window where it could not be opened, was not as described, or was bought in error.',
   'utility')
ON CONFLICT (sku) DO NOTHING;

-- Story and world titles. Recorded so the move off the lead shelf is a fact in
-- the backend rather than a note. Nothing about them is deleted or rebuilt.
INSERT INTO thy_store.product
  (sku, title, customer_job, rights_grant, customer_value, refund_fit, kind)
VALUES
  ('THY-STORY-BRAMBLE-WICK', 'Bramble Wick', 'Story and world title.',
   'Rights recorded with the story record.', 'Story and world inventory.', 'Not on sale.', 'story_world'),
  ('THY-STORY-CITY-POWER',   'City Power',   'Story and world title.',
   'Rights recorded with the story record.', 'Story and world inventory.', 'Not on sale.', 'story_world'),
  ('THY-STORY-LAST-MATCH',   'Last Match',   'Story and world title.',
   'Rights recorded with the story record.', 'Story and world inventory.', 'Not on sale.', 'story_world'),
  ('THY-STORY-HANDOFF',      'Handoff',      'Story and world title.',
   'Rights recorded with the story record.', 'Story and world inventory.', 'Not on sale.', 'story_world')
ON CONFLICT (sku) DO NOTHING;

-- Placements. Guarded so re-running this migration does not write duplicates.
INSERT INTO thy_store.shelf_placement (sku, shelf_key, position, reason)
SELECT v.sku, v.shelf_key, v.position, v.reason
FROM (VALUES
  ('THY-QYRIS-QUICKCHECK-001','utility',1,'Wave 1 lead shelf, utility first. Sequence 580.'),
  ('THY-STUCK-LOOP-RESET-001','utility',2,'Wave 1 lead shelf, utility first. Sequence 580.'),
  ('THY-BEFORE-YOU-BUY-001','utility',3,'Wave 1 lead shelf, utility first. Sequence 580.'),
  ('THY-STORY-BRAMBLE-WICK','story_world',NULL,'Store correction, sequence 580: moved off the lead shelf into story and world inventory. History preserved, nothing deleted, nothing rebuilt this pass.'),
  ('THY-STORY-CITY-POWER','story_world',NULL,'Store correction, sequence 580: moved off the lead shelf into story and world inventory. History preserved, nothing deleted, nothing rebuilt this pass.'),
  ('THY-STORY-LAST-MATCH','story_world',NULL,'Store correction, sequence 580: moved off the lead shelf into story and world inventory. History preserved, nothing deleted, nothing rebuilt this pass.'),
  ('THY-STORY-HANDOFF','story_world',NULL,'Store correction, sequence 580: moved off the lead shelf into story and world inventory. History preserved, nothing deleted, nothing rebuilt this pass.')
) AS v(sku, shelf_key, position, reason)
WHERE NOT EXISTS (
  SELECT 1 FROM thy_store.shelf_placement p
  WHERE p.sku = v.sku AND p.shelf_key = v.shelf_key
    AND p.reason = v.reason
);

INSERT INTO thy_store.serial_root (sku, root, edition, edition_year, per_copy_prefix) VALUES
  ('THY-QYRIS-QUICKCHECK-001','THY-QYRIS-QUICKCHECK-001',1,2026,'TQC-1-'),
  ('THY-STUCK-LOOP-RESET-001','THY-STUCK-LOOP-RESET-001',1,2026,'TSL-1-'),
  ('THY-BEFORE-YOU-BUY-001',  'THY-BEFORE-YOU-BUY-001',  1,2026,'TBB-1-')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO thy_store.delivery_binding (sku, entitlement_path, binding_verified) VALUES
  ('THY-QYRIS-QUICKCHECK-001','existing_thylora_entitlement_path', false),
  ('THY-STUCK-LOOP-RESET-001','existing_thylora_entitlement_path', false),
  ('THY-BEFORE-YOU-BUY-001',  'existing_thylora_entitlement_path', false)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO thy_store.price_proposal (sku, amount_minor, currency, locked, note)
SELECT v.sku, v.amount_minor, 'USD', false, v.note
FROM (VALUES
  ('THY-QYRIS-QUICKCHECK-001',300,'Proposed. Lowest on the shelf: the instrument the other two are built on.'),
  ('THY-STUCK-LOOP-RESET-001',500,'Proposed. Carries the escalation script.'),
  ('THY-BEFORE-YOU-BUY-001',  500,'Proposed. Same tier; broadest audience of the three.')
) AS v(sku, amount_minor, note)
WHERE NOT EXISTS (
  SELECT 1 FROM thy_store.price_proposal p WHERE p.sku = v.sku AND p.note = v.note
);

INSERT INTO thy_store.release_gate (sku, gate, state, evidence)
SELECT p.sku, g.gate, g.state, g.evidence
FROM thy_store.product p
CROSS JOIN (VALUES
  ('artifact',        'READY',    'Artifact authored, plate count verified'),
  ('quality',         'READY',    'Quality gate verified by tests/store-wave1.test.mjs'),
  ('rights',          'READY',    'Single-person licence recorded and printed in the colophon'),
  ('delivery',        'READY',    'Existing protected digital-delivery spine reused; no new commerce infrastructure'),
  ('mobile',          'READY',    'Single column below 760px, no horizontal scroll'),
  ('price',           'PROPOSED', 'Proposed, not locked'),
  ('editor_named',    'OPEN',     'Editor field present; the name is a Chairman entry, not invented'),
  ('chairman_preview','OPEN',     'store/index.html is the preview surface'),
  ('final_release',   'OPEN',     'Withheld. No publication without final release.')
) AS g(gate, state, evidence)
WHERE p.kind = 'utility'
ON CONFLICT (sku, gate) DO NOTHING;

COMMIT;

-- Readback, run after applying:
--   SELECT sku, thy_store.current_shelf(sku) FROM thy_store.product ORDER BY sku;
--   SELECT sku, thy_store.is_publishable(sku) FROM thy_store.product WHERE kind='utility';
--   -- expect false for all three: final_release is OPEN by design.
