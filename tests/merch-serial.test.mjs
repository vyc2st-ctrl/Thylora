// THYLORA merchandise lane · serial grammar tests
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSkuCode, buildSerial, parseSerial, validateSerialAgainstRun,
  visibleMarking, machinePayload, SERIAL_REGEX
} from '../merch/lib/serial.js';

const stickerSku = { classCode: 'STK', familyCode: 'LOGO_ONLY', artworkShort: 'ERGLASSHAT', runNumber: 1 };

test('a SKU code carries no copy segment', () => {
  assert.equal(buildSkuCode(stickerSku), 'ERM-STK-L-ERGLASSHAT-R001');
  assert.equal(parseSerial('ERM-STK-L-ERGLASSHAT-R001').level, 'SKU');
});

test('a copy serial names the class, family, artwork, run and copy', () => {
  const code = buildSerial({ ...stickerSku, copyNumber: 42 });
  assert.equal(code, 'ERM-STK-L-ERGLASSHAT-R001-00042');
  const parsed = parseSerial(code);
  assert.equal(parsed.class_code, 'STK');
  assert.equal(parsed.family_code, 'LOGO_ONLY');
  assert.equal(parsed.artwork_short, 'ERGLASSHAT');
  assert.equal(parsed.artwork_lock, 'LOCK-ER-MARK-GLASS-HAT');
  assert.equal(parsed.run_number, 1);
  assert.equal(parsed.copy_kind, 'REPRODUCTION');
  assert.equal(parsed.copy_number, 42);
});

test('the original is a distinct copy kind, not copy number zero', () => {
  const code = buildSerial({ ...stickerSku, copyNumber: null });
  assert.equal(code, 'ERM-STK-L-ERGLASSHAT-R001-ORIG');
  const parsed = parseSerial(code);
  assert.equal(parsed.copy_kind, 'ORIGINAL');
  assert.equal(parsed.copy_number, null);
});

test('a cup scene serial and a mug phrase serial carry their family short code', () => {
  assert.equal(
    buildSerial({ classCode: 'CUP', familyCode: 'LOGO_SCENE', artworkShort: 'SPORTS001', runNumber: 1, copyNumber: 7 }),
    'ERM-CUP-LS-SPORTS001-R001-00007');
  assert.equal(
    buildSerial({ classCode: 'MUG', familyCode: 'LOGO_PHRASE', artworkShort: 'ERGLASSHAT', runNumber: 2, copyNumber: 1 }),
    'ERM-MUG-LP-ERGLASSHAT-R002-00001');
});

test('unknown classes, families, runs and copies are refused', () => {
  assert.throws(() => buildSkuCode({ ...stickerSku, classCode: 'HOODIE' }), RangeError);
  assert.throws(() => buildSkuCode({ ...stickerSku, familyCode: 'LOGO_AND_VIBES' }), RangeError);
  assert.throws(() => buildSkuCode({ ...stickerSku, runNumber: 0 }), RangeError);
  assert.throws(() => buildSkuCode({ ...stickerSku, runNumber: 1000 }), RangeError);
  assert.throws(() => buildSerial({ ...stickerSku, copyNumber: 0 }), RangeError);
  assert.throws(() => buildSerial({ ...stickerSku, copyNumber: 100000 }), RangeError);
  assert.throws(() => buildSkuCode({ ...stickerSku, artworkShort: 'er' }), RangeError);
  assert.throws(() => buildSkuCode({ ...stickerSku, artworkShort: 'lower-case' }), RangeError);
});

test('personalisation appears as a digest and only alongside a copy', () => {
  const code = buildSerial({ ...stickerSku, copyNumber: 5, personalizationDigest: 'a1b2c3d4' });
  assert.equal(code, 'ERM-STK-L-ERGLASSHAT-R001-00005-Pa1b2c3d4');
  assert.equal(parseSerial(code).personalization_digest, 'a1b2c3d4');
  assert.equal(parseSerial(code).personalized, true);
  // A digest without a copy is not a serial.
  assert.equal(parseSerial('ERM-STK-L-ERGLASSHAT-R001-Pa1b2c3d4'), null);
  assert.throws(() => buildSerial({ ...stickerSku, copyNumber: 1, personalizationDigest: 'Kennedy' }), RangeError);
  assert.throws(() => buildSerial({ ...stickerSku, copyNumber: 1, personalizationDigest: 'A1B2C3D4' }), RangeError);
});

test('malformed serials do not parse', () => {
  for (const bad of [
    'ERM-STK-L-ERGLASSHAT-R1-00001',      // run not zero padded
    'ERM-STK-L-ERGLASSHAT-R001-1',        // copy not zero padded
    'ERM-STK-ERGLASSHAT-R001-00001',      // family missing
    'THY-STK-L-ERGLASSHAT-R001-00001',    // wrong prefix
    'ERM-STK-L-ERGLASSHAT-R001-ORIGINAL', // original spelt out
    '', null, undefined, 42
  ]) {
    assert.equal(parseSerial(bad), null, `${bad} should not parse`);
  }
  assert.equal(SERIAL_REGEX.test('ERM-TABDEC-L-ERREARTABLET-R001-00001'), true);
});

test('only one original may exist in a run', () => {
  const run = { run_code: 'ERM-STK-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: true };
  const result = validateSerialAgainstRun('ERM-STK-L-ERGLASSHAT-R001-ORIG', run);
  assert.equal(result.valid, false);
  assert.match(result.reasons.join(' '), /already has an ORIGINAL/);
});

test('a numbered limited copy cannot be issued while the edition size is unset', () => {
  const run = { run_code: 'ERM-PCH-L-ERGLASSHAT-R001', edition_class: 'NUMBERED_LIMITED', edition_size: null, copies_issued: 0, original_exists: false };
  const result = validateSerialAgainstRun('ERM-PCH-L-ERGLASSHAT-R001-00001', run);
  assert.equal(result.valid, false);
  assert.match(result.reasons.join(' '), /edition_size is unset/);
});

test('an open run issues copies without an edition size', () => {
  const run = { run_code: 'ERM-STK-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 900, original_exists: false };
  assert.equal(validateSerialAgainstRun('ERM-STK-L-ERGLASSHAT-R001-00901', run).valid, true);
});

test('a copy cannot exceed or overfill a declared edition size', () => {
  const run = { run_code: 'ERM-PCH-L-ERGLASSHAT-R001', edition_class: 'NUMBERED_LIMITED', edition_size: 50, copies_issued: 10, original_exists: false };
  assert.equal(validateSerialAgainstRun('ERM-PCH-L-ERGLASSHAT-R001-00050', run).valid, true);
  assert.equal(validateSerialAgainstRun('ERM-PCH-L-ERGLASSHAT-R001-00051', run).valid, false);
  const full = { ...run, copies_issued: 50 };
  assert.equal(validateSerialAgainstRun('ERM-PCH-L-ERGLASSHAT-R001-00050', full).valid, false);
});

test('a serial from another run is refused', () => {
  const run = { run_code: 'ERM-STK-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: false };
  assert.equal(validateSerialAgainstRun('ERM-STK-L-ERGLASSHAT-R002-00001', run).valid, false);
});

test('a SKU-level code cannot be issued as a copy serial', () => {
  const run = { run_code: 'ERM-STK-L-ERGLASSHAT-R001', edition_class: 'OPEN_RUN', edition_size: null, copies_issued: 0, original_exists: false };
  const result = validateSerialAgainstRun('ERM-STK-L-ERGLASSHAT-R001', run);
  assert.equal(result.valid, false);
  assert.match(result.reasons.join(' '), /SKU-level code/);
});

test('visible marking distinguishes the original and never omits the credit line', () => {
  const orig = visibleMarking('ERM-STK-L-ERGLASSHAT-R001-ORIG', { editionClass: 'OPEN_RUN', creatorCredit: 'ErsatzReality' });
  assert.ok(orig.includes('ORIGINAL — NOT A REPRODUCTION'));
  const copy = visibleMarking('ERM-STK-L-ERGLASSHAT-R001-00001', { editionClass: 'OPEN_RUN' });
  assert.equal(copy.some((l) => l.includes('ORIGINAL')), false);
  assert.ok(copy.includes('CREATOR CREDIT UNKNOWN'));
  assert.throws(() => visibleMarking('ERM-STK-L-ERGLASSHAT-R001', {}), RangeError);
});

test('the machine payload carries the digest but never personal data', () => {
  const payload = machinePayload('ERM-MUG-L-ERGLASSHAT-R001-00003-Pdeadbeef', {
    skuCode: 'ERM-MUG-L-ERGLASSHAT-R001',
    artefactSha256: '4b473c86aa5ea4671ac302958d36cd94f818efc4e51b0a20283fe67aa4ce6162',
    issuedAt: '2026-09-17T00:00:00Z',
    editionClass: 'OPEN_RUN'
  });
  assert.equal(payload.personalization_digest, 'deadbeef');
  assert.equal(payload.personal_data_included, false);
  assert.equal(JSON.stringify(payload).includes('Kennedy'), false);
  assert.equal(payload.copy_kind, 'REPRODUCTION');
});
