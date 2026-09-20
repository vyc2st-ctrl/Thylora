// THY-WORK-MATH-FAMOUS-THOUGHT-559 · Chairman math equation display
//
// The registry of record is thylora_math_equation_registry in the Postgres
// graph-backed backend. This module does two things and no more:
//
//   1. splits an equation string into its display parts (structure, not meaning)
//   2. shapes a registry row into the display contract the work order names:
//      WHOLE EQUATION / LEFT SIDE / EQUAL SIGN / RIGHT SIDE / VARIABLE BREAKDOWN /
//      PLAIN / EVERYDAY / TECHNICAL / REAL-LIFE EXAMPLE
//
// Reading levels are PLAIN, EVERYDAY, TECHNICAL. Child / Adult / Scholar are
// not used anywhere in this system.

import { UNKNOWN_DEFINITION } from './gates.js';

export const READING_LEVELS = Object.freeze(['PLAIN', 'EVERYDAY', 'TECHNICAL']);

/**
 * Split an equation into display parts. This is string structure only: it never
 * assigns a meaning to a letter, so it cannot invent a definition.
 */
export function splitEquation(whole) {
  if (typeof whole !== 'string' || !whole.includes('=')) {
    return { whole: whole ?? UNKNOWN_DEFINITION, left: UNKNOWN_DEFINITION, equals: '=', right: UNKNOWN_DEFINITION };
  }
  const at = whole.indexOf('=');
  return {
    whole: whole.trim(),
    left: whole.slice(0, at).trim(),
    equals: '=',
    right: whole.slice(at + 1).trim()
  };
}

/**
 * Pull the distinct variable letters out of the right side, in order of first
 * appearance. A letter is a slot to be defined by the registry, never by us.
 */
export function variableSlots(rightSide) {
  if (typeof rightSide !== 'string') return [];
  const found = [];
  for (const letter of rightSide.replace(/^f\s*\(/i, '(').match(/[A-Za-z](?:_[A-Za-z0-9]+)?/g) || []) {
    if (!found.includes(letter)) found.push(letter);
  }
  return found;
}

const unknownText = () => UNKNOWN_DEFINITION;

/**
 * Shape one registry row for display. Any field the registry has not supplied
 * is rendered as UNKNOWN_DEFINITION — never filled in from memory.
 *
 * row: { equation_code, whole_equation, status, variables: [{key, name, definition}],
 *        plain, everyday, technical, real_life_example, authority, version }
 */
export function shapeEquationForDisplay(row = {}) {
  const parts = splitEquation(row.whole_equation);
  const slots = variableSlots(parts.right);
  const supplied = new Map((row.variables || []).map(v => [v.key, v]));

  const variables = slots.map(key => {
    const v = supplied.get(key);
    return {
      key,
      name: v?.name || UNKNOWN_DEFINITION,
      definition: v?.definition || UNKNOWN_DEFINITION,
      authority: v?.authority || UNKNOWN_DEFINITION
    };
  });

  return {
    equation_code: row.equation_code || UNKNOWN_DEFINITION,
    status: row.status || UNKNOWN_DEFINITION,
    whole_equation: parts.whole,
    left_side: parts.left,
    equal_sign: parts.equals,
    right_side: parts.right,
    variable_breakdown: variables,
    plain: row.plain || unknownText(),
    everyday: row.everyday || unknownText(),
    technical: row.technical || unknownText(),
    real_life_example: row.real_life_example || unknownText(),
    authority: row.authority || UNKNOWN_DEFINITION,
    version: row.version ?? UNKNOWN_DEFINITION,
    unresolved: [
      ...variables.filter(v => v.definition === UNKNOWN_DEFINITION).map(v => `variable ${v.key}`),
      ...READING_LEVELS.filter(l => (row[l.toLowerCase()] || UNKNOWN_DEFINITION) === UNKNOWN_DEFINITION)
        .map(l => `${l} reading`),
      ...((row.real_life_example || UNKNOWN_DEFINITION) === UNKNOWN_DEFINITION ? ['real-life example'] : [])
    ]
  };
}

/**
 * TODAY'S EQUATION. Deterministic rotation across the active equations so the
 * same day shows the same equation on every surface. No randomness, no state.
 */
export function equationOfTheDay(activeRows = [], isoDate = new Date().toISOString().slice(0, 10)) {
  if (!Array.isArray(activeRows) || activeRows.length === 0) return null;
  const ordered = [...activeRows].sort((a, b) =>
    String(a.equation_code).localeCompare(String(b.equation_code)));
  const days = Math.floor(Date.UTC(
    Number(isoDate.slice(0, 4)), Number(isoDate.slice(5, 7)) - 1, Number(isoDate.slice(8, 10))
  ) / 86400000);
  return ordered[((days % ordered.length) + ordered.length) % ordered.length];
}
