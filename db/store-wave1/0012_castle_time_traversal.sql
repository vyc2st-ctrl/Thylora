-- 0012_castle_time_traversal.sql
-- THY-WORK-CASTLE-NATIVE-NAME-580 · THY-WORK-CASTLE-DIMENSIONAL-TWIN-572
--
-- Two things, both reviewable and NOT applied by this delta:
--   A. Time traversal — one stable castle ID, era states layered, never overwritten.
--   B. The naming gate — a structure that makes a fabricated Indigenous name
--      impossible to insert, rather than merely discouraged.
--
-- This file creates no name. It creates the gate a name must pass.

BEGIN;

CREATE SCHEMA IF NOT EXISTS thy_castle;

-- =========================================================== A · TRAVERSAL ===

-- One stable identity for the castle. The ID never changes, whatever era is
-- being viewed and whatever the castle is eventually named.
CREATE TABLE IF NOT EXISTS thy_castle.castle (
  castle_id   text PRIMARY KEY,
  stable_ref  uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Every aspect a selected date must be able to load.
CREATE TABLE IF NOT EXISTS thy_castle.aspect (
  aspect_key text PRIMARY KEY,
  title      text NOT NULL
);

INSERT INTO thy_castle.aspect (aspect_key, title) VALUES
  ('geometry',               'Geometry'),
  ('room_use',               'Room use'),
  ('occupants',              'Occupants'),
  ('family_connection',      'Family connection'),
  ('objects',                'Objects'),
  ('repairs',                'Repairs'),
  ('supplier_relationships', 'Business and supplier relationships'),
  ('paintings',              'Paintings'),
  ('furniture',              'Furniture'),
  ('staff',                  'Staff')
ON CONFLICT (aspect_key) DO NOTHING;

-- Era layers. APPEND ONLY.
--
-- valid_from / valid_to say which historical era the layer describes.
-- recorded_at says when we learned it. A correction is a NEW layer with a later
-- recorded_at; the superseded layer stays readable, so no old state is lost.
CREATE TABLE IF NOT EXISTS thy_castle.era_layer (
  layer_id     bigserial PRIMARY KEY,
  castle_id    text NOT NULL REFERENCES thy_castle.castle(castle_id),
  aspect_key   text NOT NULL REFERENCES thy_castle.aspect(aspect_key),
  valid_from   date NOT NULL,
  valid_to     date,                       -- NULL = still standing at this aspect
  payload      jsonb NOT NULL,
  source       text NOT NULL,              -- where this came from; never blank
  confidence   text NOT NULL DEFAULT 'recorded'
               CHECK (confidence IN ('recorded','inferred','unverified')),
  supersedes   bigint REFERENCES thy_castle.era_layer(layer_id),
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thy_castle_era_order   CHECK (valid_to IS NULL OR valid_to >= valid_from),
  CONSTRAINT thy_castle_source_real CHECK (length(btrim(source)) > 0)
);

CREATE INDEX IF NOT EXISTS thy_castle_layer_lookup
  ON thy_castle.era_layer (castle_id, aspect_key, valid_from, recorded_at DESC);

-- Overwriting is refused by the database, not by policy.
CREATE OR REPLACE FUNCTION thy_castle.refuse_layer_overwrite()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION
    'ERA_LAYER_IS_APPEND_ONLY: record a new layer with supersedes=% instead',
    OLD.layer_id;
END;
$$;

DROP TRIGGER IF EXISTS thy_castle_no_layer_overwrite ON thy_castle.era_layer;
CREATE TRIGGER thy_castle_no_layer_overwrite
  BEFORE UPDATE OR DELETE ON thy_castle.era_layer
  FOR EACH ROW EXECUTE FUNCTION thy_castle.refuse_layer_overwrite();

-- Load the castle as it stood on a chosen date: one row per aspect, the most
-- recently recorded layer whose era covers that date.
CREATE OR REPLACE FUNCTION thy_castle.load_at(p_castle_id text, p_when date)
RETURNS TABLE (
  aspect_key text, title text, payload jsonb,
  source text, confidence text, valid_from date, valid_to date, layer_id bigint
)
LANGUAGE sql STABLE AS $$
  SELECT DISTINCT ON (l.aspect_key)
         l.aspect_key, a.title, l.payload,
         l.source, l.confidence, l.valid_from, l.valid_to, l.layer_id
  FROM thy_castle.era_layer l
  JOIN thy_castle.aspect a USING (aspect_key)
  WHERE l.castle_id = p_castle_id
    AND l.valid_from <= p_when
    AND (l.valid_to IS NULL OR l.valid_to >= p_when)
  ORDER BY l.aspect_key, l.recorded_at DESC, l.layer_id DESC;
$$;

-- Which aspects have nothing recorded for a date. An empty castle answers
-- "I do not have this yet", not a plausible-looking blank.
CREATE OR REPLACE FUNCTION thy_castle.missing_at(p_castle_id text, p_when date)
RETURNS TABLE (aspect_key text, title text)
LANGUAGE sql STABLE AS $$
  SELECT a.aspect_key, a.title
  FROM thy_castle.aspect a
  WHERE NOT EXISTS (
    SELECT 1 FROM thy_castle.load_at(p_castle_id, p_when) g
    WHERE g.aspect_key = a.aspect_key
  )
  ORDER BY a.aspect_key;
$$;

-- ============================================================ B · NAMING ====

-- A language source must exist as a record before any name derived from it can
-- be entered. This table is the dependency the naming work is currently missing.
CREATE TABLE IF NOT EXISTS thy_castle.language_source (
  source_id      bigserial PRIMARY KEY,
  language_name  text NOT NULL,
  people_or_nation text NOT NULL,
  land_basis     text NOT NULL,   -- the land record tying language to this place
  citation       text NOT NULL,   -- where the record is held
  held_by        text,            -- custodian, archive, or community authority
  permission_state text NOT NULL DEFAULT 'not_sought'
                 CHECK (permission_state IN ('not_sought','requested','granted','refused')),
  recorded_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thy_castle_lang_fields_real CHECK (
    length(btrim(language_name)) > 0 AND
    length(btrim(people_or_nation)) > 0 AND
    length(btrim(land_basis)) > 0 AND
    length(btrim(citation)) > 0
  )
);

-- A name candidate cannot exist without a language source row, and cannot be
-- entered with an empty root, meaning, pronunciation, historical use or
-- provenance. That is what makes fabrication structurally refused rather than
-- merely forbidden in a document.
CREATE TABLE IF NOT EXISTS thy_castle.name_candidate (
  candidate_id    bigserial PRIMARY KEY,
  castle_id       text NOT NULL REFERENCES thy_castle.castle(castle_id),
  source_id       bigint NOT NULL REFERENCES thy_castle.language_source(source_id),
  root_word       text NOT NULL,
  meaning         text NOT NULL,
  pronunciation   text NOT NULL,
  historical_use  text NOT NULL,
  provenance      text NOT NULL,
  compound_construction text NOT NULL,
  final_candidate text NOT NULL,
  state           text NOT NULL DEFAULT 'proposed'
                  CHECK (state IN ('proposed','community_review','accepted','withdrawn')),
  recorded_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thy_castle_name_fields_real CHECK (
    length(btrim(root_word)) > 0 AND length(btrim(meaning)) > 0 AND
    length(btrim(pronunciation)) > 0 AND length(btrim(historical_use)) > 0 AND
    length(btrim(provenance)) > 0 AND length(btrim(compound_construction)) > 0 AND
    length(btrim(final_candidate)) > 0
  ),
  -- The forbidden name, refused by the database.
  CONSTRAINT thy_castle_forbidden_name CHECK (
    upper(btrim(final_candidate)) <> 'PEETE CASTLE'
    AND upper(btrim(final_candidate)) NOT LIKE 'PEETE CASTLE%'
  )
);

-- A candidate may only reach 'accepted' from a source whose permission is granted.
CREATE OR REPLACE FUNCTION thy_castle.guard_name_acceptance()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_permission text;
BEGIN
  IF NEW.state = 'accepted' THEN
    SELECT permission_state INTO v_permission
    FROM thy_castle.language_source WHERE source_id = NEW.source_id;
    IF v_permission IS DISTINCT FROM 'granted' THEN
      RAISE EXCEPTION 'NAME_PERMISSION_NOT_GRANTED: language source % is %',
        NEW.source_id, coalesce(v_permission,'missing');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS thy_castle_name_acceptance ON thy_castle.name_candidate;
CREATE TRIGGER thy_castle_name_acceptance
  BEFORE INSERT OR UPDATE ON thy_castle.name_candidate
  FOR EACH ROW EXECUTE FUNCTION thy_castle.guard_name_acceptance();

-- External reference corpus. Windsor and anything like it live here and here
-- only: reference material, never a source of a name for this place.
CREATE TABLE IF NOT EXISTS thy_castle.external_reference (
  reference_id  bigserial PRIMARY KEY,
  label         text NOT NULL,
  classification text NOT NULL DEFAULT 'ERC' CHECK (classification = 'ERC'),
  usable_for_naming boolean NOT NULL DEFAULT false,
  note          text,
  CONSTRAINT thy_castle_erc_never_names CHECK (usable_for_naming = false)
);

INSERT INTO thy_castle.external_reference (label, note) VALUES
  ('Windsor', 'External reference corpus only. Not a naming source for this place, in any construction.')
ON CONFLICT DO NOTHING;

-- What the naming work is waiting on, stated as data rather than prose.
CREATE TABLE IF NOT EXISTS thy_castle.name_dependency (
  dependency_key text PRIMARY KEY,
  requirement    text NOT NULL,
  state          text NOT NULL DEFAULT 'MISSING'
                 CHECK (state IN ('MISSING','PARTIAL','PRESENT')),
  note           text
);

INSERT INTO thy_castle.name_dependency (dependency_key, requirement, state, note) VALUES
  ('land_record',      'Land record identifying the specific place', 'MISSING',
   'No land record for the castle exists in this repository.'),
  ('regional_history', 'Regional history for that land',             'MISSING',
   'No regional history record exists in this repository.'),
  ('language_record',  'Language record tied to that land',          'MISSING',
   'No language record exists in this repository. This is the blocking dependency: without it no root word may be entered.'),
  ('people_record',    'People, tribe or nation record',             'MISSING',
   'No people, tribe or nation record exists in this repository.'),
  ('old_place_forms',  'Older recorded forms of the place name',     'MISSING',
   'No older place-name forms exist in this repository.'),
  ('castle_chronology','Castle chronology',                          'MISSING',
   'No castle chronology exists in this repository.'),
  ('mirror_registry',  'Mirror registry entry for the castle',       'MISSING',
   'No mirror registry entry exists in this repository.'),
  ('community_permission','Permission from the language custodians', 'MISSING',
   'Not sought. A name cannot be accepted without it.')
ON CONFLICT (dependency_key) DO NOTHING;

-- True only when every dependency is satisfied. Currently false by construction.
CREATE OR REPLACE FUNCTION thy_castle.naming_unblocked()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM thy_castle.name_dependency WHERE state <> 'PRESENT'
  );
$$;

COMMIT;

-- Readback, run after applying:
--   SELECT thy_castle.naming_unblocked();            -- expect false
--   SELECT dependency_key, state FROM thy_castle.name_dependency ORDER BY 1;
--   SELECT * FROM thy_castle.missing_at('<castle_id>', DATE '1890-01-01');
--   -- and prove the gate: inserting a name_candidate without a language_source
--   --   row raises a foreign key violation, not a warning.
