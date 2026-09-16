// CONVEYOR · serialization, provenance chain, QR binding, object registry
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  issueSerial, verifySerial, appendProvenance, verifyProvenance, bindQr,
  objectRegistryRecord, digest, PASSPORT_STANDARD, LANE_CODES, QR_VISIBILITY
} from '../conveyor/lib/serial.js';

test('serials are anchored to the existing passport standard, not a new one', () => {
  assert.equal(PASSPORT_STANDARD, 'THY-DPP-003');
  assert.equal(verifySerial(issueSerial({ lane: 'GAMES', item_code: 'TIMERUN' })).passport_standard, 'THY-DPP-003');
});

test('every lane can serialize', () => {
  for (const lane of Object.keys(LANE_CODES)) {
    assert.equal(verifySerial(issueSerial({ lane, item_code: 'X1' })).valid, true, lane);
  }
});

test('the same tuple always yields the same serial, so a reissue restores rather than duplicates', () => {
  const a = issueSerial({ lane: 'SHOWS_VIDEO', item_code: 'BRAMBLE-E1', version_no: 4, sequence: 7 });
  const b = issueSerial({ lane: 'SHOWS_VIDEO', item_code: 'BRAMBLE-E1', version_no: 4, sequence: 7 });
  assert.equal(a, b);
});

test('different units of the same item get different serials', () => {
  const one = issueSerial({ lane: 'SERIALIZED_COLLECTIBLES', item_code: 'DPP', sequence: 1 });
  const two = issueSerial({ lane: 'SERIALIZED_COLLECTIBLES', item_code: 'DPP', sequence: 2 });
  assert.notEqual(one, two);
});

test('a new version does not reuse the previous version serial', () => {
  assert.notEqual(
    issueSerial({ lane: 'SHOWS_VIDEO', item_code: 'BRAMBLE', version_no: 4 }),
    issueSerial({ lane: 'SHOWS_VIDEO', item_code: 'BRAMBLE', version_no: 5 })
  );
});

test('100000 serials across lanes and sequences are all unique', () => {
  const lanes = Object.keys(LANE_CODES);
  const seen = new Set();
  for (let i = 1; i <= 100000; i += 1) {
    seen.add(issueSerial({ lane: lanes[i % lanes.length], item_code: 'UNIT', sequence: i }));
  }
  assert.equal(seen.size, 100000);
});

test('a transcription error in any position is caught', () => {
  const serial = issueSerial({ lane: 'CLOTHING', item_code: 'ERA1930', sequence: 42 });
  for (let i = 0; i < serial.length; i += 1) {
    if (serial[i] === '-') continue;
    const swapped = serial[i] === '0' ? '1' : '0';
    const broken = serial.slice(0, i) + swapped + serial.slice(i + 1);
    if (broken === serial) continue;
    assert.equal(verifySerial(broken).valid, false, `position ${i} altered but accepted`);
  }
});

test('a malformed serial is refused rather than partly read', () => {
  assert.equal(verifySerial('not-a-serial').valid, false);
  assert.equal(verifySerial('').reason, 'MALFORMED');
  assert.equal(verifySerial(null).reason, 'MALFORMED');
});

test('an unknown lane cannot be serialized', () => {
  assert.throws(() => issueSerial({ lane: 'CRYPTO', item_code: 'X' }), /Unknown conveyor lane/);
});

test('a sequence beyond the serial field is refused rather than silently wrapped', () => {
  assert.throws(() => issueSerial({ lane: 'GAMES', item_code: 'X', sequence: 1000000 }), /exceeds/);
});

test('the digest is deterministic across calls', () => {
  assert.equal(digest('bramble'), digest('bramble'));
  assert.notEqual(digest('bramble'), digest('brambl3'));
});

test('a provenance chain records where the work came from', () => {
  let chain = appendProvenance([], { event_type: 'CAPTURED', source_description: 'Told by the family' });
  chain = appendProvenance(chain, { event_type: 'DERIVED', source_description: 'Ersatz interpretation', derived_from_ref: 'CONV-HRB-0001' });
  assert.equal(chain.length, 2);
  assert.equal(verifyProvenance(chain).valid, true);
  assert.equal(chain[1].previous_digest, chain[0].entry_digest);
});

test('an altered provenance entry is detected and located', () => {
  let chain = appendProvenance([], { event_type: 'CREATED', source_description: 'Written in the studio' });
  chain = appendProvenance(chain, { event_type: 'AI_ASSISTED', source_description: 'Draft assistance', tool_disclosure: 'disclosed' });
  const tampered = [...chain];
  tampered[1] = { ...tampered[1], source_description: 'Entirely original' };
  const result = verifyProvenance(tampered);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'ENTRY_ALTERED');
  assert.equal(result.at, 2);
});

test('a removed provenance entry breaks the chain', () => {
  let chain = appendProvenance([], { event_type: 'CAPTURED', source_description: 'One' });
  chain = appendProvenance(chain, { event_type: 'DERIVED', source_description: 'Two' });
  chain = appendProvenance(chain, { event_type: 'RESTORED', source_description: 'Three' });
  const result = verifyProvenance([chain[0], chain[2]]);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'CHAIN_BROKEN');
});

test('a provenance event must say where the work came from', () => {
  assert.throws(() => appendProvenance([], { event_type: 'CREATED' }), /where the work came from/);
});

test('provenance event types match the existing vocabulary, not a second one', () => {
  assert.throws(() => appendProvenance([], { event_type: 'INVENTED', source_description: 'x' }), /Unknown provenance event type/);
});

test('a QR cannot be bound to an invalid serial', () => {
  assert.throws(() => bindQr({ serial: 'THY-SHW-X-V1-000001-ZZ' }), /invalid serial/);
});

test('registry-only objects are recorded and carry no visible mark', () => {
  const qr = bindQr({ serial: issueSerial({ lane: 'WORLD_OBJECTS', item_code: 'MILKBOTTLE' }), visibility: 'REGISTRY_ONLY' });
  assert.equal(qr.renders_on_object, false, 'public imagery is not cluttered with internal identifiers');
  assert.equal(qr.qr_state, 'BOUND', 'it is still registered');
});

test('every visibility mode is a declared one', () => {
  assert.deepEqual(QR_VISIBILITY, ['PUBLIC_MARK', 'DISCREET_MARK', 'REGISTRY_ONLY']);
  assert.throws(() => bindQr({ serial: issueSerial({ lane: 'GAMES', item_code: 'X' }), visibility: 'HIDDEN' }), /Unknown QR visibility/);
});

test('a persistent world object is eligible for a registry record', () => {
  const record = objectRegistryRecord({ object_name: 'Wick lantern', lane: 'WORLD_OBJECTS', item_code: 'LANTERN', persists_in_world: true, visible_in_imagery: true });
  assert.equal(record.eligible, true);
  assert.equal(verifySerial(record.serial).valid, true);
  assert.equal(record.qr.visibility, 'DISCREET_MARK');
});

test('an object that does not persist is not forced into the registry', () => {
  const record = objectRegistryRecord({ object_name: 'Passing cloud', lane: 'WORLD_OBJECTS', item_code: 'CLOUD', persists_in_world: false });
  assert.equal(record.eligible, false);
  assert.equal(record.reason, 'DOES_NOT_PERSIST_IN_WORLD');
  assert.equal(record.serial, undefined);
});
