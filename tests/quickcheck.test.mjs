/* THY-QYRIS-QUICKCHECK-001 · artifact, delivery and re-access tests.
   These are the "does it actually open, download, re-access and read on a
   phone" checks. They run against the bytes a customer receives. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { probePdf } from '../products/_engine/probe.mjs';
import { buildRelease, MASTER_SERIAL } from '../products/qyris-quickcheck/build.mjs';
import { PRODUCT, INSPECTIONS } from '../products/qyris-quickcheck/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'products/qyris-quickcheck/dist/master');
const release = buildRelease(MASTER_SERIAL);
const sha = (b) => createHash('sha256').update(b).digest('hex');

test('print edition opens: structure, xref and every stream', () => {
  const p = probePdf(release.printPdf);
  assert.deepEqual(p.errors, []);
  assert.equal(p.version, '1.7');
  assert.equal(p.pageCount, 12, 'cover + 8 plates + worked example + sheet + colophon');
  assert.equal(p.streams, 12);
});

test('print edition carries the customer-facing title and the serial', () => {
  const p = probePdf(release.printPdf);
  assert.equal(p.title, PRODUCT.customerTitle);
  assert.equal(p.author, 'THYLORA');
  assert.ok(p.keywords.includes(PRODUCT.sku));
  assert.ok(p.keywords.includes(MASTER_SERIAL));
  assert.ok(p.displayDocTitle, 'readers must show the title, not the filename');
});

test('the serial is printed on the artifact, not only in its metadata', () => {
  const p = probePdf(release.printPdf);
  const cover = p.text[0];
  const colophon = p.text[p.text.length - 1];
  assert.ok(cover.includes(MASTER_SERIAL), 'serial on the cover');
  assert.ok(colophon.includes(MASTER_SERIAL), 'serial in the colophon');
  assert.ok(p.text.filter((t) => t.includes(MASTER_SERIAL)).length >= 11,
    'serial in the running foot of every interior page');
});

test('all nine inspections, the sheet and the worked example are present', () => {
  const all = probePdf(release.printPdf).text.join(' · ');
  for (const ins of INSPECTIONS) assert.ok(all.includes(ins.name), 'missing: ' + ins.name);
  assert.ok(all.includes('ROUTED') && all.includes('HELD') && all.includes('OPEN'));
  assert.ok(all.includes('9 inspected'), 'readiness line present');
});

test('rights, provenance and credits are inside the artifact', () => {
  const colophon = probePdf(release.printPdf).text.slice(-1)[0];
  assert.ok(colophon.includes('2026 THYLORA'), 'rights line');
  assert.ok(colophon.includes('WR-RAELINK-001'), 'provenance');
  assert.ok(colophon.includes('THYLORA Standards'), 'credits');
  assert.ok(colophon.includes('RE-ACCESS'), 're-access route');
});

test('the sheet is genuinely fillable and reusable', () => {
  const p = probePdf(release.printPdf);
  assert.ok(p.hasAcroForm);
  assert.ok(p.needAppearances, 'readers must render the fields');
  assert.equal(p.fieldCount, 4 + 9 * 3 + 2, 'header, nine rows of three, two footer fields');
});

test('print edition is US Letter on every page', () => {
  for (const [w, h] of probePdf(release.printPdf).mediaBoxes) {
    assert.equal(w, 612); assert.equal(h, 792);
  }
});

test('mobile edition is typeset for a phone, not shrunk to fit', () => {
  const p = probePdf(release.mobilePdf);
  assert.deepEqual(p.errors, []);
  for (const [w, h] of p.mediaBoxes) {
    assert.equal(w, 360);
    assert.equal(h, 640);
    assert.ok(h / w > 1.6, 'portrait, phone aspect');
  }
  assert.ok(p.pageCount > 12, 'content reflowed across more, shorter screens');
  assert.ok(p.hasOutlines, 'a phone reader needs the outline to navigate');
  assert.ok(p.fieldCount >= 4 + 9 * 3 + 2, 'the sheet stays fillable on a phone');
});

test('both editions open with no embedded font and no external asset', () => {
  for (const pdf of [release.printPdf, release.mobilePdf]) {
    const s = pdf.toString('latin1');
    assert.ok(!/\/FontFile/.test(s), 'no embedded font');
    assert.ok(!/\/URI|https?:\/\//.test(s), 'no external reference');
    assert.ok(/\/BaseFont \/(Helvetica|Times)/.test(s));
  }
});

test('the delivery package carries everything a buyer needs', () => {
  const names = release.manifest.files.map((f) => f.name);
  assert.ok(names.some((n) => n.includes('PRINT')));
  assert.ok(names.some((n) => n.includes('MOBILE')));
  assert.ok(names.includes('READ-ME-FIRST.txt'));
  assert.ok(names.includes('LICENCE-AND-RIGHTS.txt'));
  assert.ok(names.includes('RE-ACCESS.txt'));
  assert.equal(release.manifest.entitlement.perpetual, true);
  assert.equal(release.manifest.entitlement.revocable_by_cancellation, false);
});

test('the zip is a readable archive with the manifest inside', () => {
  const z = release.zip;
  assert.equal(z.readUInt32LE(0), 0x04034b50, 'local file header');
  const eocdAt = z.length - 22;
  assert.equal(z.readUInt32LE(eocdAt), 0x06054b50, 'end of central directory');
  assert.equal(z.readUInt16LE(eocdAt + 10), release.manifest.files.length + 1);
  assert.ok(z.includes(Buffer.from('manifest.json')));
});

test('filenames are customer-safe and name the product, edition and serial', () => {
  for (const n of [release.printName, release.mobileName, release.zipName]) {
    assert.match(n, /^THYLORA-QYRIS-QuickCheck-v1\.0/);
    assert.ok(n.includes(MASTER_SERIAL));
    assert.ok(!/[ \\/:*?"<>|]/.test(n), 'no character that breaks a download on any OS');
    assert.ok(n.length < 80, 'short enough not to be truncated in a download list');
  }
});

test('re-access rebuilds the identical copy from the serial alone', () => {
  const again = buildRelease(MASTER_SERIAL);
  assert.equal(sha(again.printPdf), sha(release.printPdf));
  assert.equal(sha(again.mobilePdf), sha(release.mobilePdf));
  assert.equal(sha(again.zip), sha(release.zip));
});

test('a different serial produces a different, correctly stamped copy', () => {
  const other = buildRelease('THY-QC1-260922-000042');
  assert.notEqual(sha(other.printPdf), sha(release.printPdf));
  assert.ok(probePdf(other.printPdf).text[0].includes('THY-QC1-260922-000042'));
  assert.equal(probePdf(other.printPdf).pageCount, 12);
});

test('the manifest checksums match the bytes actually shipped', () => {
  const byName = new Map(release.files.map((f) => [f.name, f.data]));
  for (const f of release.manifest.files) {
    const data = byName.get(f.name);
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    assert.equal(sha(buf), f.sha256, f.name);
    assert.equal(buf.length, f.bytes, f.name);
  }
});

test('the committed dist matches a fresh build', { skip: !existsSync(DIST) }, () => {
  assert.equal(sha(readFileSync(join(DIST, release.printName))), sha(release.printPdf));
  assert.equal(sha(readFileSync(join(DIST, release.mobileName))), sha(release.mobilePdf));
  assert.equal(readFileSync(join(DIST, 'manifest.json'), 'utf8'), release.manifestJson);
});

/* --- the other two Standards Series items: copy is complete and buildable --- */

import * as slr from '../products/stuck-loop-reset/content.mjs';
import * as byb from '../products/before-you-buy/content.mjs';

for (const [name, mod, rowsKey, rowCount] of [
  ['Stuck Loop Reset', slr, 'MOVES', 6],
  ['Before You Buy', byb, 'QUESTIONS', 7]
]) {
  test(`${name}: production copy is complete and matches the shared schema`, () => {
    for (const key of ['PRODUCT', 'STORE', 'COVER', 'PLATE_00', 'WORKED', 'SHEET', 'READ_ME']) {
      assert.ok(mod[key], `${name} is missing ${key}`);
    }
    for (const key of ['id', 'sku', 'customerTitle', 'subtitle', 'edition', 'version',
      'editionDate', 'priceMinor', 'currency', 'rightsLine', 'provenanceLine',
      'creditsLines', 'limitsLines']) {
      assert.ok(mod.PRODUCT[key], `${name}.PRODUCT is missing ${key}`);
    }
    assert.equal(mod[rowsKey].length, rowCount);
    for (const item of mod[rowsKey]) {
      for (const f of ['n', 'name', 'question', 'signals', 'route', 'test']) {
        assert.ok(item[f], `${name} ${item.n}: missing ${f}`);
      }
      assert.ok(item.signals.length >= 2, `${name} ${item.n}: needs signal phrases`);
      assert.ok(item.route.length > 80, `${name} ${item.n}: route must name a route, not a slogan`);
    }
    assert.equal(mod.SHEET.rows.length, rowCount, 'the card covers every step');
    assert.equal(mod.WORKED.rows.length, rowCount, 'the worked example runs the whole pass');
    assert.ok(mod.COVER.contents.length >= 10);
    assert.ok(mod.STORE.description.join(' ').length > 600, 'store description is production length');
  });

  test(`${name}: every string encodes cleanly for the artifact engine`, async () => {
    const { encodeWinAnsi } = await import('../products/_engine/pdf.mjs');
    const walk = (v) => {
      if (typeof v === 'string') {
        const bad = [...v].filter((ch) => encodeWinAnsi(ch)[0] === 0x3f && ch !== '?');
        assert.deepEqual(bad, [], `unencodable character(s) in: ${v.slice(0, 60)}`);
      } else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(mod);
  });
}

test('the three Standards Series items carry distinct SKUs and series numbers', () => {
  const skus = [PRODUCT.sku, slr.PRODUCT.sku, byb.PRODUCT.sku];
  assert.equal(new Set(skus).size, 3);
  assert.deepEqual([PRODUCT.seriesNo, slr.PRODUCT.seriesNo, byb.PRODUCT.seriesNo], ['01', '02', '03']);
});
