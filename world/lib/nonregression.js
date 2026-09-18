// THYLORA WORLD · non-regression floor
// Workroom: WR-WORLD-CASTLE-001
//
//   F_(n+1) >= F_n
//
// No later version may lose previously established geometry, identity, topology,
// dimensions, room assignments, routes or provenance unless the Chairman
// explicitly supersedes it.
//
// This is enforced by comparison, not by promise. `checkNonRegression` takes the
// previous world state and the proposed next one and returns every loss it can
// find. A loss is only permitted when a matching supersession record, carrying
// Chairman authority, names that exact object.
//
// Deliberately, an UNKNOWN value being filled in is never a regression, and a
// KNOWN value becoming UNKNOWN always is.

import { isUnknown } from './frame.js';

export const PROTECTED_FACETS = Object.freeze([
  'GEOMETRY', 'IDENTITY', 'TOPOLOGY', 'DIMENSIONS', 'ROOM_ASSIGNMENT', 'ROUTES', 'PROVENANCE'
]);

export function supersession({ object_id, facet, authority, directive_ref, reason, recorded_at }) {
  if (authority !== 'CHAIRMAN') {
    throw new Error(`supersession of ${object_id} claims authority ${authority}; only CHAIRMAN may supersede`);
  }
  if (!directive_ref) throw new Error(`supersession of ${object_id} names no directive`);
  if (!PROTECTED_FACETS.includes(facet)) throw new Error(`unknown protected facet: ${facet}`);
  return Object.freeze({ object_id, facet, authority, directive_ref, reason, recorded_at });
}

const indexById = (rows, key) => new Map(rows.map(r => [r[key], r]));

function dimensionLosses(prevDims, nextDims) {
  const lost = [];
  for (const axis of ['length_mm', 'width_mm', 'height_mm']) {
    const before = prevDims ? prevDims[axis] : undefined;
    const after = nextDims ? nextDims[axis] : undefined;
    if (!isUnknown(before) && isUnknown(after)) lost.push(axis);
    else if (!isUnknown(before) && !isUnknown(after) && before !== after) lost.push(`${axis}(changed ${before}->${after})`);
  }
  return lost;
}

/**
 * @param prev {{elements:[],rooms:[],openings:[],routes:[]}}
 * @param next same shape
 * @param supersessions array of supersession records
 * @returns {{pass:boolean, losses:[], permitted:[], gains:{}}}
 */
export function checkNonRegression(prev, next, supersessions = []) {
  const allowed = new Set(supersessions.map(s => `${s.object_id}::${s.facet}`));
  const losses = [];
  const permitted = [];

  const record = (object_id, facet, statement) => {
    const entry = { object_id, facet, statement };
    if (allowed.has(`${object_id}::${facet}`)) permitted.push(entry);
    else losses.push(entry);
  };

  const pairs = [
    ['elements', 'element_id', ['element_class', 'parent_id', 'frame_id', 'material_id']],
    ['rooms', 'room_id', ['storey_id', 'purpose', 'period_state']],
    ['openings', 'opening_id', ['opening_kind', 'host_element_id', 'inner_space_id', 'outer_space_id']],
    ['routes', 'route_id', ['class_code', 'from_node', 'to_node']]
  ];

  for (const [collection, key, identityFields] of pairs) {
    const before = indexById(prev[collection] || [], key);
    const after = indexById(next[collection] || [], key);

    for (const [id, prevRow] of before) {
      const nextRow = after.get(id);
      if (!nextRow) {
        record(id, collection === 'routes' ? 'ROUTES' : 'IDENTITY',
          `${collection.slice(0, -1)} ${id} existed at version n and is absent at version n+1.`);
        continue;
      }
      for (const f of identityFields) {
        const b = prevRow[f], a = nextRow[f];
        if (!isUnknown(b) && isUnknown(a)) {
          record(id, collection === 'rooms' && f === 'purpose' ? 'ROOM_ASSIGNMENT' : 'TOPOLOGY',
            `${id}.${f} was established (${String(b)}) and is UNKNOWN at version n+1.`);
        } else if (!isUnknown(b) && !isUnknown(a) && b !== a) {
          record(id, collection === 'rooms' && f === 'purpose' ? 'ROOM_ASSIGNMENT' : 'TOPOLOGY',
            `${id}.${f} changed from ${String(b)} to ${String(a)} without supersession.`);
        }
      }
      const dimLost = dimensionLosses(prevRow.dimensions, nextRow.dimensions);
      if (dimLost.length) record(id, 'DIMENSIONS', `${id} lost or altered established dimensions: ${dimLost.join(', ')}.`);

      if (prevRow.local_transform && !isUnknown(prevRow.local_transform) && isUnknown(nextRow.local_transform)) {
        record(id, 'GEOMETRY', `${id} had an established placement and is unplaced at version n+1.`);
      }
      if (prevRow.provenance && !nextRow.provenance) {
        record(id, 'PROVENANCE', `${id} lost its provenance record.`);
      }
      if (prevRow.evidence_state === 'VERIFIED' && nextRow.evidence_state !== 'VERIFIED') {
        record(id, 'PROVENANCE', `${id} was VERIFIED at version n and is ${nextRow.evidence_state} at version n+1.`);
      }
    }
  }

  const gains = {};
  for (const [collection, key] of pairs.map(p => [p[0], p[1]])) {
    const before = new Set((prev[collection] || []).map(r => r[key]));
    gains[collection] = (next[collection] || []).filter(r => !before.has(r[key])).map(r => r[key]);
  }

  return { pass: losses.length === 0, losses, permitted, gains };
}
