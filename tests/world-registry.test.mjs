// THYLORA WORLD · registry, window/room rule and provenance tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRegistry, addElement, addRoom, addOpening, element, room, opening,
  provenance, dims, tolerance, audit, unknownCensus, verifiedCount,
  ELEMENT_CLASSES, EVIDENCE_STATES, RegistryError
} from '../world/lib/registry.js';
import { isUnknown } from '../world/lib/frame.js';

const good = provenance({ source: 'S1', source_kind: 'REPOSITORY_FILE', accessed_at: '2026-09-18', confidence: 'HIGH' });
const absent = provenance({ source: 'none', source_kind: 'ABSENT', accessed_at: '2026-09-18', confidence: 'NONE' });

test('the eleven element facets are all carried', () => {
  const e = element({ element_id: 'E1', element_class: 'WALL', frame_id: 'F', provenance: good });
  for (const facet of ['element_id', 'parent_id', 'frame_id', 'local_transform', 'dimensions',
    'orientation_mdeg', 'material_id', 'tolerance_band', 'build_phase', 'version', 'provenance']) {
    assert.ok(facet in e, `missing facet ${facet}`);
  }
});

test('an element without provenance is refused', () => {
  assert.throws(() => element({ element_id: 'E', element_class: 'WALL', frame_id: 'F' }), /no provenance/);
});

test('an element cannot be VERIFIED from an ABSENT source', () => {
  assert.throws(() => element({
    element_id: 'E', element_class: 'WALL', frame_id: 'F',
    evidence_state: 'VERIFIED', provenance: absent
  }), /cannot be VERIFIED/);
});

test('unknown classes and evidence states are refused', () => {
  assert.throws(() => element({ element_id: 'E', element_class: 'DRAWBRIDGE_UNREGISTERED', frame_id: 'F', provenance: good }), /unknown element_class/);
  assert.throws(() => element({ element_id: 'E', element_class: 'WALL', frame_id: 'F', evidence_state: 'PROBABLY', provenance: good }), /unknown evidence_state/);
  assert.ok(EVIDENCE_STATES.includes('PROPOSED') && EVIDENCE_STATES.includes('UNKNOWN'));
  assert.ok(ELEMENT_CLASSES.includes('MASONRY_UNIT'));
});

test('dimensions are integer millimetres or UNKNOWN, never a float', () => {
  assert.throws(() => dims({ length_mm: 1200.5 }), RegistryError);
  assert.throws(() => dims({ length_mm: -1 }), RegistryError);
  const d = dims({ length_mm: 1200 });
  assert.equal(d.length_mm, 1200);
  assert.ok(isUnknown(d.width_mm));
});

test('a window with nothing behind it fails the audit', () => {
  const reg = createRegistry();
  addOpening(reg, opening({ opening_id: 'W1', opening_kind: 'WINDOW', host_element_id: 'E', frame_id: 'F', provenance: good }));
  const f = audit(reg);
  assert.equal(f.length, 1);
  assert.equal(f[0].rule, 'VISIBLE_OPENING_REAL_SPACE');
  assert.equal(f[0].severity, 'HIGH');
});

test('a window with a registered room behind it passes the audit', () => {
  const reg = createRegistry();
  addRoom(reg, room({ room_id: 'R1', storey_id: 'S', frame_id: 'F', provenance: good }));
  addOpening(reg, opening({ opening_id: 'W1', opening_kind: 'WINDOW', host_element_id: 'E', frame_id: 'F', inner_space_id: 'R1', provenance: good }));
  assert.deepEqual(audit(reg), []);
});

test('a window pointing at an unregistered space fails the audit', () => {
  const reg = createRegistry();
  addOpening(reg, opening({ opening_id: 'W1', opening_kind: 'WINDOW', host_element_id: 'E', frame_id: 'F', inner_space_id: 'GHOST', provenance: good }));
  assert.match(audit(reg)[0].statement, /not registered/);
});

test('a door must connect two real spaces', () => {
  const reg = createRegistry();
  addRoom(reg, room({ room_id: 'R1', storey_id: 'S', frame_id: 'F', provenance: good }));
  addOpening(reg, opening({ opening_id: 'D1', opening_kind: 'DOOR', host_element_id: 'E', frame_id: 'F', inner_space_id: 'R1', provenance: good }));
  const f = audit(reg);
  assert.equal(f.length, 1);
  assert.match(f[0].statement, /connects to nothing on its outer side/);
});

test('an element naming a parent that is not registered fails the audit', () => {
  const reg = createRegistry();
  addElement(reg, element({ element_id: 'E1', element_class: 'WALL', parent_id: 'NOPE', frame_id: 'F', provenance: good }));
  assert.equal(audit(reg)[0].rule, 'PARENT_RESOLVES');
});

test('duplicate ids are refused', () => {
  const reg = createRegistry();
  addElement(reg, element({ element_id: 'E1', element_class: 'WALL', frame_id: 'F', provenance: good }));
  assert.throws(() => addElement(reg, element({ element_id: 'E1', element_class: 'WALL', frame_id: 'F', provenance: good })), /duplicate/);
});

test('the unknown census names what is not known, per object', () => {
  const reg = createRegistry();
  addRoom(reg, room({ room_id: 'R1', storey_id: 'S', frame_id: 'F', provenance: good }));
  const c = unknownCensus(reg);
  assert.equal(c.length, 1);
  assert.ok(c[0].unknown_fields.includes('purpose'));
  assert.ok(c[0].unknown_fields.includes('ceiling_height_mm'));
});

test('verifiedCount reports only VERIFIED rows', () => {
  const reg = createRegistry();
  addElement(reg, element({ element_id: 'E1', element_class: 'WALL', frame_id: 'F', evidence_state: 'VERIFIED', provenance: good }));
  addElement(reg, element({ element_id: 'E2', element_class: 'WALL', frame_id: 'F', evidence_state: 'PROPOSED', provenance: good }));
  assert.equal(verifiedCount(reg).elements, 1);
});

test('provenance requires a known kind and a stated confidence', () => {
  assert.throws(() => provenance({ source: 'x', source_kind: 'RUMOUR', accessed_at: 'now', confidence: 'HIGH' }), /source_kind/);
  assert.throws(() => provenance({ source: 'x', source_kind: 'DERIVED', accessed_at: 'now', confidence: 'PRETTY_SURE' }), /confidence/);
  assert.throws(() => provenance({ source_kind: 'DERIVED', accessed_at: 'now', confidence: 'HIGH' }), /source is required/);
});

test('a tolerance band without a measurement is still UNKNOWN', () => {
  const t = tolerance({ basis: 'no measured value exists' });
  assert.ok(isUnknown(t.linear_mm));
  assert.ok(isUnknown(t.angular_mdeg));
});
