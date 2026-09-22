#!/usr/bin/env node
/* THY-QYRIS-QUICKCHECK-001 · build
   Produces the finished customer artifact bytes, the delivery package and the
   delivery manifest. Deterministic: the same serial always rebuilds the same
   bytes, which is what makes re-access a rebuild rather than a stored blob.

   Usage:
     node products/qyris-quickcheck/build.mjs                      (master copy)
     node products/qyris-quickcheck/build.mjs --serial THY-QC1-260922-000001
     node products/qyris-quickcheck/build.mjs --serial X --out /tmp/reaccess
*/

import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrint, buildMobile } from './layout.mjs';
import { PRODUCT, READ_ME } from './content.mjs';
import { makeZip } from '../_engine/zip.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const MASTER_SERIAL = 'THY-QC1-0000-MASTER';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, '-');

export function buildRelease(serial = MASTER_SERIAL) {
  const printPdf = buildPrint(serial);
  const mobilePdf = buildMobile(serial);
  const base = `THYLORA-QYRIS-QuickCheck-v${PRODUCT.version}`;
  const printName = `${base}-PRINT-${slug(serial)}.pdf`;
  const mobileName = `${base}-MOBILE-${slug(serial)}.pdf`;

  const readme = READ_ME.concat(['', 'Serial: ' + serial, 'SKU: ' + PRODUCT.sku,
    'Edition: ' + PRODUCT.edition + ' v' + PRODUCT.version + ' · ' + PRODUCT.editionDate]).join('\n') + '\n';
  const licence = [
    'LICENCE AND RIGHTS — ' + PRODUCT.customerTitle,
    '', 'Serial: ' + serial, '', PRODUCT.rightsLine, '',
    'PROVENANCE', PRODUCT.provenanceLine, '',
    'CREDITS', ...PRODUCT.creditsLines, '',
    'WHAT THIS IS NOT', ...PRODUCT.limitsLines
  ].join('\n') + '\n';
  const reaccess = [
    'RE-ACCESS — ' + PRODUCT.customerTitle,
    '', 'Serial: ' + serial, 'SKU: ' + PRODUCT.sku,
    '',
    'Your purchase entitlement is permanent. It does not expire, and ending a',
    'membership does not remove it.',
    '',
    'To get these files again:',
    '  1. Sign in to the THYLORA store account that made the purchase.',
    '  2. Open Orders, find this SKU, and choose Re-access.',
    '  3. Quote the serial above if you are asked to identify the copy.',
    '',
    'You do not need to email anyone, and there is no download limit.',
    '',
    'A corrected or extended edition is delivered to the same entitlement at no',
    'further cost. It carries this same serial with a new edition line, so your',
    'copy stays yours and stays identifiable.',
    '',
    'Every re-access is rebuilt from the same source at the same serial, so the',
    'files you receive are byte-for-byte the files you first received. The',
    'checksums in manifest.json are how you can prove that yourself.'
  ].join('\n') + '\n';

  const files = [
    { name: printName, data: printPdf, role: 'artifact.print', label: 'Print and tablet edition' },
    { name: mobileName, data: mobilePdf, role: 'artifact.mobile', label: 'Phone edition' },
    { name: 'READ-ME-FIRST.txt', data: readme, role: 'readme', label: 'Read me first' },
    { name: 'LICENCE-AND-RIGHTS.txt', data: licence, role: 'rights', label: 'Licence, rights and provenance' },
    { name: 'RE-ACCESS.txt', data: reaccess, role: 'reaccess', label: 'How to get these files again' }
  ];

  const manifest = {
    artifact_id: PRODUCT.id,
    sku: PRODUCT.sku,
    customer_title: PRODUCT.customerTitle,
    edition: PRODUCT.edition,
    version: PRODUCT.version,
    edition_date: PRODUCT.editionDate,
    serial,
    entitlement: { kind: 'PURCHASE', perpetual: true, revocable_by_cancellation: false },
    delivery: { package: `${base}-${slug(serial)}.zip`, rebuildable: true, deterministic: true },
    files: files.map((f) => ({
      name: f.name, role: f.role, label: f.label,
      bytes: Buffer.isBuffer(f.data) ? f.data.length : Buffer.byteLength(f.data),
      sha256: sha256(Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data))
    })),
    rights_line: PRODUCT.rightsLine,
    provenance: PRODUCT.provenanceLine,
    built_by: 'THYLORA Artifact Engine v1'
  };
  const manifestJson = JSON.stringify(manifest, null, 2) + '\n';

  const zip = makeZip([...files.map((f) => ({ name: f.name, data: f.data })),
    { name: 'manifest.json', data: manifestJson }]);

  return { serial, printName, mobileName, printPdf, mobilePdf, files, manifest, manifestJson, zip,
    zipName: manifest.delivery.package };
}

export function writeRelease(outDir, release) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, release.printName), release.printPdf);
  writeFileSync(join(outDir, release.mobileName), release.mobilePdf);
  for (const f of release.files.slice(2)) writeFileSync(join(outDir, f.name), f.data);
  writeFileSync(join(outDir, 'manifest.json'), release.manifestJson);
  writeFileSync(join(outDir, release.zipName), release.zip);
  return outDir;
}

if (process.argv[1] && process.argv[1].endsWith('build.mjs')) {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const serial = get('--serial', MASTER_SERIAL);
  const out = get('--out', join(HERE, 'dist', serial === MASTER_SERIAL ? 'master' : 'copies/' + slug(serial)));
  const release = buildRelease(serial);
  writeRelease(out, release);
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  console.log('THY-QYRIS-QUICKCHECK-001 built');
  console.log('  serial   ' + serial);
  console.log('  out      ' + out);
  for (const f of release.manifest.files) console.log('  ' + f.name.padEnd(52) + kb(f.bytes) + '  ' + f.sha256.slice(0, 16));
  console.log('  ' + release.zipName.padEnd(52) + kb(release.zip.length));
}
