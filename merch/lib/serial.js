// THYLORA merchandise lane · serial grammar
// Workroom: WR-MERCH-001
//
// Client-side twin of MERCH-SERIAL-001 in db/merch/0008_seed_serial_skus_gates.sql.
// Both accept exactly the same strings, so a serial printed on an object equals
// the serial the backend will store.
//
// Parent policy: THY-SERIAL-COLLECTIBLE-001 (Chairman Vyctor Peete). This module
// adds a grammar. It does not relax that policy:
//   - the original is permanently distinguished from reproductions
//   - no edition count is invented
//   - the personalisation payload is never recoverable from the serial

import { CLASSES, FAMILIES, lockByShort } from './locks.js';

export const SERIAL_PREFIX = 'ERM';

export const EDITION_CLASSES = Object.freeze([
  'OPEN_RUN',
  'NUMBERED_LIMITED',
  'FAMILY_FIRST_EDITION',
  'SPECIAL_VARIANT'
]);

// Classes whose copies may not be issued while edition_size is null.
const SIZED_EDITION_CLASSES = Object.freeze([
  'NUMBERED_LIMITED',
  'FAMILY_FIRST_EDITION',
  'SPECIAL_VARIANT'
]);

const CLASS_ALT = Object.keys(CLASSES).join('|');
const FAMILY_ALT = Object.values(FAMILIES).map((f) => f.short).join('|');

export const SERIAL_REGEX = new RegExp(
  `^${SERIAL_PREFIX}-(${CLASS_ALT})-(${FAMILY_ALT})-([A-Z0-9]{3,16})-R(\\d{3})` +
  `(?:-(\\d{5}|ORIG)(?:-P([0-9a-f]{8}))?)?$`
);

/** Build a SKU-level code: no copy segment. */
export function buildSkuCode({ classCode, familyCode, artworkShort, runNumber }) {
  assertClass(classCode);
  assertFamily(familyCode);
  assertArtworkShort(artworkShort);
  assertRunNumber(runNumber);
  const family = FAMILIES[familyCode].short;
  return `${SERIAL_PREFIX}-${classCode}-${family}-${artworkShort}-R${pad(runNumber, 3)}`;
}

/** Build a copy-level serial. copyNumber null means the ORIGINAL. */
export function buildSerial({
  classCode, familyCode, artworkShort, runNumber, copyNumber = null,
  personalizationDigest = null
}) {
  const sku = buildSkuCode({ classCode, familyCode, artworkShort, runNumber });
  const copy = copyNumber === null ? 'ORIG' : pad(assertCopyNumber(copyNumber), 5);
  const tail = personalizationDigest === null
    ? ''
    : `-P${assertDigest(personalizationDigest)}`;
  return `${sku}-${copy}${tail}`;
}

/** Parse any serial or SKU code. Returns null when the string does not conform. */
export function parseSerial(code) {
  if (typeof code !== 'string') return null;
  const m = SERIAL_REGEX.exec(code);
  if (!m) return null;

  const [, classCode, familyShort, artworkShort, run, copy, digest] = m;
  const familyCode = Object.keys(FAMILIES).find((k) => FAMILIES[k].short === familyShort);
  const isOriginal = copy === 'ORIG';

  return {
    code,
    class_code: classCode,
    family_code: familyCode,
    family_short: familyShort,
    artwork_short: artworkShort,
    artwork_lock: lockByShort(artworkShort)?.lock_code ?? null,
    run_number: Number(run),
    run_code: `${SERIAL_PREFIX}-${classCode}-${familyShort}-${artworkShort}-R${run}`,
    level: copy === undefined ? 'SKU' : 'COPY',
    copy_kind: copy === undefined ? null : (isOriginal ? 'ORIGINAL' : 'REPRODUCTION'),
    copy_number: copy === undefined || isOriginal ? null : Number(copy),
    personalization_digest: digest ?? null,
    personalized: digest !== undefined && digest !== null
  };
}

/**
 * Validate a serial against its run. Catches the three mistakes the parent
 * policy names: a reproduction dressed as an original, a copy issued past an
 * edition size, and a copy issued against an unset edition size.
 */
export function validateSerialAgainstRun(code, run) {
  const parsed = parseSerial(code);
  const reasons = [];

  if (!parsed) return { valid: false, reasons: [`${code} does not conform to MERCH-SERIAL-001`], parsed: null };
  if (parsed.level !== 'COPY') reasons.push('a SKU-level code cannot be issued as a copy serial');

  if (run) {
    if (parsed.run_code !== run.run_code) {
      reasons.push(`serial run ${parsed.run_code} does not match run ${run.run_code}`);
    }
    if (parsed.copy_kind === 'ORIGINAL' && run.original_exists) {
      reasons.push('the run already has an ORIGINAL; only one may exist');
    }
    if (parsed.copy_kind === 'REPRODUCTION') {
      if (SIZED_EDITION_CLASSES.includes(run.edition_class) && run.edition_size == null) {
        reasons.push(`${run.edition_class} copies cannot be issued while edition_size is unset`);
      }
      if (run.edition_size != null && parsed.copy_number > run.edition_size) {
        reasons.push(`copy ${parsed.copy_number} exceeds edition_size ${run.edition_size}`);
      }
      if (run.edition_size != null && run.copies_issued >= run.edition_size) {
        reasons.push('the run is fully issued');
      }
    }
  }

  return { valid: reasons.length === 0, reasons, parsed };
}

/**
 * Visible marking for the class serial carrier. Visible marks are discovery
 * clues; the backend row and hash are the authority, because a visible mark can
 * be copied.
 */
export function visibleMarking(code, { editionClass, creatorCredit = null } = {}) {
  const parsed = parseSerial(code);
  if (!parsed || parsed.level !== 'COPY') {
    throw new RangeError(`${code} is not a copy-level serial`);
  }
  const lines = [parsed.code];
  if (parsed.copy_kind === 'ORIGINAL') lines.push('ORIGINAL — NOT A REPRODUCTION');
  if (editionClass) lines.push(editionClass);
  lines.push(creatorCredit ? `CREATED BY ${creatorCredit}` : 'CREATOR CREDIT UNKNOWN');
  return lines;
}

/**
 * Machine payload. Carries no personal data: the personalisation appears only
 * as the digest already present in the serial, never as the payload itself.
 */
export function machinePayload(code, { skuCode, artefactSha256 = null, issuedAt, editionClass }) {
  const parsed = parseSerial(code);
  if (!parsed || parsed.level !== 'COPY') {
    throw new RangeError(`${code} is not a copy-level serial`);
  }
  return {
    serial_code: parsed.code,
    sku_code: skuCode,
    run_code: parsed.run_code,
    copy_kind: parsed.copy_kind,
    copy_number: parsed.copy_number,
    edition_class: editionClass ?? null,
    artefact_sha256: artefactSha256,
    issued_at: issuedAt,
    personalization_digest: parsed.personalization_digest,
    personal_data_included: false
  };
}

function pad(n, width) { return String(n).padStart(width, '0'); }

function assertClass(classCode) {
  if (!Object.hasOwn(CLASSES, classCode)) {
    throw new RangeError(`unknown product class ${classCode}`);
  }
}
function assertFamily(familyCode) {
  if (!Object.hasOwn(FAMILIES, familyCode)) {
    throw new RangeError(`unknown product family ${familyCode}`);
  }
}
function assertArtworkShort(short) {
  if (!/^[A-Z0-9]{3,16}$/.test(String(short ?? ''))) {
    throw new RangeError(`artwork short code must be 3-16 uppercase alphanumerics, received ${short}`);
  }
}
function assertRunNumber(n) {
  if (!Number.isInteger(n) || n < 1 || n > 999) {
    throw new RangeError(`run number must be an integer 1-999, received ${n}`);
  }
  return n;
}
function assertCopyNumber(n) {
  if (!Number.isInteger(n) || n < 1 || n > 99999) {
    throw new RangeError(`copy number must be an integer 1-99999, received ${n}`);
  }
  return n;
}
function assertDigest(d) {
  if (!/^[0-9a-f]{8}$/.test(String(d ?? ''))) {
    throw new RangeError(`personalisation digest must be 8 lowercase hex characters, received ${d}`);
  }
  return d;
}
