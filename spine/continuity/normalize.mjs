// THYLORA CONTINUITY WATCHDOG · value normalization and continuity digest
// Workstream: THY-CONTINUITY-WATCHDOG-001
//
// Comparison has to be stable or the watchdog invents drift. Everything here is
// deterministic, dependency-free and mirrored by thy_continuity_normalize in
// db/continuity/0002_watchdog_functions.sql.

const ABSENT = new Set(['', 'null', 'undefined', 'n/a', 'na', 'none', '-', '—', 'tbd', 'unknown']);

/** True when a produced value carries no assertion at all. */
export function isAbsent(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return ABSENT.has(String(value).trim().toLowerCase());
}

/**
 * Case, quote style and surrounding or repeated whitespace are not continuity.
 * Meaning is. "Vyc2st  Mark" and "vyc2st mark" are the same fact; "Vyc2st Marc"
 * is not. Spacing that sits inside a value ("48.8566, 2.3522") is left alone,
 * because collapsing it would quietly merge values that may not be the same.
 */
export function normalizeScalar(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/\s+/g, ' ');
}

/** Numbers may arrive as "12", " 12.0 " or 12. All three are 12. */
export function normalizeNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value ?? '').replace(/[,\s]/g, '').replace(/[^0-9.+-eE]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Sets are unordered: order is not drift, membership is. */
export function normalizeSet(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value ?? '').split(/[;,\n]/);
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const key = normalizeScalar(typeof item === 'object' && item !== null
      ? (item.key ?? item.id ?? item.code ?? item.name ?? JSON.stringify(item))
      : item);
    if (key === '' || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  out.sort();
  return out;
}

export function normalizeByKind(kind, value) {
  if (kind === 'NUMERIC') return normalizeNumber(value);
  if (kind === 'SET') return normalizeSet(value);
  return normalizeScalar(value);
}

/** Membership difference between a controlling set and a produced set. */
export function setDelta(controlling, current) {
  const have = new Set(current);
  const had = new Set(controlling);
  return {
    missing: controlling.filter(item => !have.has(item)),
    added: current.filter(item => !had.has(item))
  };
}

/**
 * Continuity fingerprint. FNV-1a, run twice with different offsets for a 64-bit
 * hex string. This detects accidental change of a compiled controlling brief.
 * It is NOT a security hash and is never used as one.
 */
export function digest(value) {
  const text = stableStringify(value);
  return `${fnv1a(text, 0x811c9dc5)}${fnv1a(text, 0x01000193)}`;
}

function fnv1a(text, offset) {
  let hash = offset >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Key-sorted JSON so two equal objects always produce one string. */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}
