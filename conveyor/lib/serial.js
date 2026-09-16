// CONVEYOR · serialization, provenance chain and QR binding
// Workroom: WR-CONVEYOR-001
//
// Every generated or manufactured asset gets a unique serial and a provenance
// chain entry. Serials are anchored to the EXISTING passport standard
// THY-DPP-003 (app/index.html, public-site/index.html) -- this module issues and
// verifies serials, it does not start a second passport registry.
//
// Two deliberate limits, stated rather than implied:
//   1. The check character and the chain digest are INTEGRITY checks (FNV-1a),
//      not cryptographic signatures. They catch transcription and reordering
//      errors. They do not prove authorship and are never described as doing so.
//   2. Uniqueness is guaranteed by the (lane, item, version, sequence) tuple,
//      which the registry owns. A serial issued twice for the same tuple is the
//      same serial; that is a collision by construction and is rejected.

export const PASSPORT_STANDARD = 'THY-DPP-003';
export const SERIAL_PREFIX = 'THY';

export const LANE_CODES = Object.freeze({
  SHOWS_VIDEO: 'SHW', BOOKS_COMICS: 'BOK', EDUCATIONAL_SHEETS: 'EDU',
  GAMES: 'GAM', CLOTHING: 'CLO', SERIALIZED_COLLECTIBLES: 'COL',
  HISTORY_HERBAL: 'HRB', ASK_ERSATZ: 'ASK', NEWSPAPERS_REPORTS: 'NWS',
  MEDIA_NETWORK: 'RAE', MEMBERSHIPS: 'MEM', WORLD_OBJECTS: 'OBJ'
});

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// FNV-1a, 64-bit, in BigInt. Deterministic across Node and the browser with no
// dependency and no async, which matters because this must run in a surface
// that may have no backend to ask.
export function digest(input) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  const text = String(input);
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash ^ BigInt(text.charCodeAt(i) & 0xff)) * prime & mask;
  }
  return hash.toString(16).padStart(16, '0');
}

function checkChars(body) {
  const h = BigInt('0x' + digest(body));
  const a = ALPHABET[Number(h % 36n)];
  const b = ALPHABET[Number((h / 36n) % 36n)];
  return `${a}${b}`;
}

function normalise(part, field) {
  const value = String(part ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '');
  if (!value) throw new RangeError(`${field} cannot be empty in a serial`);
  return value;
}

/**
 * Issue a serial. Deterministic: the same tuple always yields the same serial,
 * so a reissue after a lost record restores the original rather than minting a
 * competing one.
 */
export function issueSerial({ lane, item_code, version_no = 1, sequence = 1 }) {
  const laneCode = LANE_CODES[lane];
  if (!laneCode) throw new RangeError(`Unknown conveyor lane for serialization: ${lane}`);
  const item = normalise(item_code, 'item_code').slice(0, 12);
  if (!Number.isInteger(version_no) || version_no < 1) throw new RangeError('version_no must be an integer >= 1');
  if (!Number.isInteger(sequence) || sequence < 1) throw new RangeError('sequence must be an integer >= 1');
  if (sequence > 999999) throw new RangeError('sequence exceeds the six-digit serial field');
  const body = `${SERIAL_PREFIX}-${laneCode}-${item}-V${version_no}-${String(sequence).padStart(6, '0')}`;
  return `${body}-${checkChars(body)}`;
}

/** Verify a serial offline. Used before anything is trusted enough to act on. */
export function verifySerial(serial) {
  const text = String(serial ?? '').trim().toUpperCase();
  const match = text.match(/^(THY-([A-Z]{3})-([A-Z0-9]{1,12})-V(\d+)-(\d{6}))-([0-9A-Z]{2})$/);
  if (!match) return { valid: false, reason: 'MALFORMED' };
  const [, body, laneCode, itemCode, version, sequence, check] = match;
  if (checkChars(body) !== check) return { valid: false, reason: 'CHECK_FAILED' };
  const lane = Object.keys(LANE_CODES).find(k => LANE_CODES[k] === laneCode);
  if (!lane) return { valid: false, reason: 'UNKNOWN_LANE' };
  return {
    valid: true, lane, item_code: itemCode,
    version_no: Number(version), sequence: Number(sequence),
    passport_standard: PASSPORT_STANDARD
  };
}

/**
 * Append a provenance event to an item's chain. Each entry carries the digest of
 * the previous one, so a removed or reordered entry is detectable. Event types
 * match the existing rael_provenance_events vocabulary rather than inventing a
 * second one.
 */
export const PROVENANCE_EVENTS = Object.freeze([
  'CAPTURED', 'CREATED', 'DERIVED', 'AI_ASSISTED', 'RESTORED', 'IMPORTED', 'TRANSFERRED'
]);

export function appendProvenance(chain, event) {
  const entries = Array.isArray(chain) ? chain : [];
  if (!PROVENANCE_EVENTS.includes(event.event_type)) {
    throw new RangeError(`Unknown provenance event type: ${event.event_type}`);
  }
  if (!event.source_description) throw new RangeError('A provenance event must say where the work came from');
  const previous = entries.length ? entries[entries.length - 1].entry_digest : null;
  const payload = {
    seq: entries.length + 1,
    event_type: event.event_type,
    source_description: event.source_description,
    occurred_at: event.occurred_at ?? null,
    tool_disclosure: event.tool_disclosure ?? null,
    derived_from_ref: event.derived_from_ref ?? null,
    recorded_by: event.recorded_by ?? null,
    previous_digest: previous
  };
  return [...entries, { ...payload, entry_digest: digest(JSON.stringify(payload)) }];
}

/** Recompute the whole chain and report the first entry that does not hold. */
export function verifyProvenance(chain) {
  const entries = Array.isArray(chain) ? chain : [];
  let previous = null;
  for (const entry of entries) {
    const { entry_digest, ...payload } = entry;
    if (payload.previous_digest !== previous) {
      return { valid: false, reason: 'CHAIN_BROKEN', at: payload.seq };
    }
    if (digest(JSON.stringify(payload)) !== entry_digest) {
      return { valid: false, reason: 'ENTRY_ALTERED', at: payload.seq };
    }
    previous = entry_digest;
  }
  return { valid: true, length: entries.length };
}

/**
 * Bind a QR to a serial. The payload resolves against the passport standard.
 *
 * Visibility is a first-class field because the directive is explicit: every
 * persistent EdereAriah object is ELIGIBLE for a registry record, but public
 * imagery must not be cluttered with internal identifiers. REGISTRY_ONLY objects
 * get a full record and no visible mark at all.
 */
export const QR_VISIBILITY = Object.freeze(['PUBLIC_MARK', 'DISCREET_MARK', 'REGISTRY_ONLY']);

export function bindQr({ serial, visibility = 'REGISTRY_ONLY', resolver = '/passport' }) {
  const check = verifySerial(serial);
  if (!check.valid) throw new RangeError(`Cannot bind a QR to an invalid serial: ${check.reason}`);
  if (!QR_VISIBILITY.includes(visibility)) throw new RangeError(`Unknown QR visibility: ${visibility}`);
  return {
    serial,
    passport_standard: PASSPORT_STANDARD,
    payload: `${resolver}/${serial}`,
    visibility,
    renders_on_object: visibility !== 'REGISTRY_ONLY',
    qr_state: 'BOUND'
  };
}

/**
 * Object-registry eligibility for a visible world object. Eligible is not the
 * same as marked: a 1930s milk bottle is registered and carries no printed code.
 */
export function objectRegistryRecord({ object_name, lane, item_code, persists_in_world, visible_in_imagery, version_no = 1, sequence = 1 }) {
  if (!object_name) throw new RangeError('An object registry record needs an object name');
  const eligible = Boolean(persists_in_world);
  if (!eligible) return { object_name, eligible: false, reason: 'DOES_NOT_PERSIST_IN_WORLD' };
  const serial = issueSerial({ lane, item_code, version_no, sequence });
  return {
    object_name,
    eligible: true,
    serial,
    passport_standard: PASSPORT_STANDARD,
    qr: bindQr({ serial, visibility: visible_in_imagery ? 'DISCREET_MARK' : 'REGISTRY_ONLY' })
  };
}
