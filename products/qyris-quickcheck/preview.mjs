#!/usr/bin/env node
/* Renders the built artifact to SVG/HTML previews for proof-reading and
   device tests. Reads the same content streams that go into the PDF. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrint, buildMobile } from './layout.mjs';
import { pageToSvg, docToHtml } from '../_engine/preview.mjs';
import { MASTER_SERIAL } from './build.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const serial = process.argv.includes('--serial')
  ? process.argv[process.argv.indexOf('--serial') + 1] : MASTER_SERIAL;
const out = join(HERE, 'dist', 'preview');
mkdirSync(out, { recursive: true });

const print = buildPrint(serial, { doc: true });
const mobile = buildMobile(serial, { doc: true });
print.pages.forEach((p, i) => writeFileSync(join(out, `print-${String(i + 1).padStart(2, '0')}.svg`), pageToSvg(p, print)));
mobile.pages.forEach((p, i) => writeFileSync(join(out, `mobile-${String(i + 1).padStart(2, '0')}.svg`), pageToSvg(p, mobile)));
writeFileSync(join(out, 'print.html'), docToHtml(print, { scale: 1 }));
writeFileSync(join(out, 'mobile.html'), docToHtml(mobile, { scale: 1 }));
console.log(`preview: ${print.pages.length} print pages, ${mobile.pages.length} mobile pages -> ${out}`);
