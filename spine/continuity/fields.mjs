// THYLORA CONTINUITY WATCHDOG · watched-field registry
// Workstream: THY-CONTINUITY-WATCHDOG-001
//
// This file is the single declaration of what the spine watches and what a
// legal change to each field looks like. db/continuity/0001_continuity_watchdog.sql
// seeds thy_continuity_fields from the same list; tests/continuity.fields.test.mjs
// asserts the two never diverge.
//
// A field is HARD-WATCH when an unauthorized deviation must stop work rather
// than be reported. Every field named in the watchdog order is hard-watch.

/** How a field's value is compared. */
export const KINDS = Object.freeze(['SCALAR', 'NUMERIC', 'SET', 'LADDER']);

/**
 * How a field is allowed to move without being drift.
 *
 * IMMUTABLE       — cannot change at all; only an explicit supersession moves it.
 * AUTHORITY_ONLY  — may change, but only with a recorded authority reference.
 * MONOTONIC_TIME  — may only increase, and only as far as elapsed time allows.
 * LADDER          — may only move forward along a declared ordered list.
 * SET_GROWTH      — members may be added; a member that disappears is MISSING.
 */
export const RULES = Object.freeze([
  'IMMUTABLE', 'AUTHORITY_ONLY', 'MONOTONIC_TIME', 'LADDER', 'SET_GROWTH'
]);

export const CLASSIFICATIONS = Object.freeze([
  'UNCHANGED', 'ADVANCED', 'EXPLICITLY_SUPERSEDED', 'DRIFTED', 'MISSING', 'CONFLICTING'
]);

/** The three classifications that mean continuity was lost. */
export const BREACH = Object.freeze(['DRIFTED', 'MISSING', 'CONFLICTING']);

const f = (key, label, kind, rule, extra = {}) => Object.freeze({
  key,
  label,
  kind,
  rule,
  hard_watch: true,
  requires_authority: false,
  ladder: null,
  tolerance: 0,
  ...extra
});

/**
 * The watchdog order, in the order it was given. Nothing is dropped silently:
 * a field removed from this list must be removed from the SQL seed and from
 * the workroom record in the same change, or the registry test fails.
 */
export const FIELDS = Object.freeze([
  f('names', 'Names', 'SCALAR', 'IMMUTABLE'),
  f('ages', 'Ages', 'NUMERIC', 'MONOTONIC_TIME'),
  f('family_relationships', 'Family relationships', 'SET', 'IMMUTABLE'),
  f('identity', 'Identity', 'SCALAR', 'IMMUTABLE'),
  f('geometry', 'Geometry', 'NUMERIC', 'IMMUTABLE'),
  f('dimensions', 'Dimensions', 'NUMERIC', 'IMMUTABLE'),
  // A coordinate is a tuple, not a magnitude: it is compared for identity, so
  // "48.8566,2.3522" is a scalar fact rather than a number to subtract.
  f('world_coordinates', 'World coordinates', 'SCALAR', 'IMMUTABLE'),
  f('period_technology', 'Period technology', 'SET', 'IMMUTABLE'),
  f('visual_rules', 'Visual rules', 'SET', 'IMMUTABLE'),
  f('barrier', 'Barrier', 'SCALAR', 'IMMUTABLE'),
  f('vyc2st_mark', 'Vyc2st mark', 'SCALAR', 'IMMUTABLE'),
  f('rights', 'Rights', 'SCALAR', 'AUTHORITY_ONLY', { requires_authority: true }),
  f('approval', 'Approval', 'LADDER', 'LADDER', {
    requires_authority: true,
    ladder: Object.freeze(['NONE', 'REQUESTED', 'PENDING', 'APPROVED'])
  }),
  f('publication_state', 'Publication state', 'LADDER', 'LADDER', {
    requires_authority: true,
    ladder: Object.freeze(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'])
  }),
  f('store_state', 'Store state', 'LADDER', 'LADDER', {
    requires_authority: true,
    ladder: Object.freeze(['DRAFT', 'LISTED', 'RELEASED', 'DELISTED'])
  }),
  f('price', 'Price', 'NUMERIC', 'AUTHORITY_ONLY', { requires_authority: true }),
  f('delivery', 'Delivery', 'LADDER', 'LADDER', {
    ladder: Object.freeze(['NOT_STARTED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED'])
  }),
  f('person_state', 'Person state', 'SCALAR', 'AUTHORITY_ONLY', { requires_authority: true }),
  f('active_workstreams', 'Active workstreams', 'SET', 'SET_GROWTH')
]);

const BY_KEY = Object.freeze(Object.fromEntries(FIELDS.map(field => [field.key, field])));

export function fieldSpec(key) {
  return BY_KEY[key] ?? null;
}

export function hardWatchKeys() {
  return FIELDS.filter(field => field.hard_watch).map(field => field.key);
}

/**
 * Register a field the watchdog did not ship with. Soft-watch by default: a
 * caller has to say hard_watch explicitly, because a hard watch stops work.
 * Returns a spec; it does not mutate FIELDS, so the shipped order stays fixed.
 */
export function extendField(spec) {
  if (!spec?.key) throw new Error('CONTINUITY_FIELD_KEY_REQUIRED');
  if (!KINDS.includes(spec.kind)) throw new Error(`CONTINUITY_FIELD_KIND_UNKNOWN:${spec.kind}`);
  if (!RULES.includes(spec.rule)) throw new Error(`CONTINUITY_FIELD_RULE_UNKNOWN:${spec.rule}`);
  if (spec.rule === 'LADDER' && !(Array.isArray(spec.ladder) && spec.ladder.length > 1)) {
    throw new Error('CONTINUITY_FIELD_LADDER_REQUIRED');
  }
  return Object.freeze({
    label: spec.key, hard_watch: false, requires_authority: false,
    ladder: null, tolerance: 0, ...spec
  });
}
