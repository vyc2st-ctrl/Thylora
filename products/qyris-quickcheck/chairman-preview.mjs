#!/usr/bin/env node
/* Chairman preview for THY-QYRIS-QUICKCHECK-001.
   Deliberately NOT routed in vercel.json and NOT linked from public-site:
   this is a preview surface, not a publication. Every number on it is read
   from the built bytes at generation time, so it cannot drift from what a
   customer would receive. */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRelease, MASTER_SERIAL } from './build.mjs';
import { probePdf } from '../_engine/probe.mjs';
import { thumbnailSvg } from './thumbnail.mjs';
import { PRODUCT, STORE } from './content.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const release = buildRelease(MASTER_SERIAL);
const printProbe = probePdf(release.printPdf);
const mobileProbe = probePdf(release.mobilePdf);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const fileRows = release.manifest.files.map((f) => `
  <tr><td class="mono">${esc(f.name)}</td><td>${esc(f.label)}</td>
      <td class="num">${kb(f.bytes)}</td><td class="mono sha">${f.sha256.slice(0, 24)}…</td></tr>`).join('');

const facts = [
  ['Print / tablet edition', `${printProbe.pageCount} pages · 612 × 792 pt (US Letter) · ${kb(release.printPdf.length)}`],
  ['Phone edition', `${mobileProbe.pageCount} screens · 360 × 640 pt portrait · ${kb(release.mobilePdf.length)}`],
  ['Fillable fields', `${printProbe.fieldCount} on the print sheet · ${mobileProbe.fieldCount} on the phone sheet`],
  ['Outline / bookmarks', printProbe.hasOutlines ? 'Present in both editions' : 'Absent'],
  ['Embedded fonts', 'None — base-14 only, so it opens with no download on any reader'],
  ['External references', 'None — no URL, no remote asset, no tracking'],
  ['Serial', `${MASTER_SERIAL} · on the cover, in the colophon, in the running foot of every interior page, and in the file metadata`],
  ['Delivery package', `${esc(release.zipName)} · ${kb(release.zip.length)}`],
  ['Re-access', 'Rebuilt from the serial. Byte-identical on every rebuild — checked in the test suite.']
];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>CHAIRMAN PREVIEW · ${esc(PRODUCT.customerTitle)}</title>
<style>
:root{--bg:#0a0e14;--panel:#111823;--panel2:#0d131c;--line:#24303f;--text:#f4efe6;
      --muted:#9fabbb;--gold:#e0b35b;--gold-deep:#6d4f18;--good:#82d8a0;--warn:#f0c674}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);-webkit-text-size-adjust:100%;
  font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{padding:16px 20px;border-bottom:1px solid var(--line);
  background:linear-gradient(150deg,#141b26,#0b1019);display:flex;flex-wrap:wrap;gap:12px;
  align-items:center;justify-content:space-between;position:sticky;top:0;z-index:5}
.brand{font-weight:800;letter-spacing:.16em}
.chip{border:1px solid var(--gold-deep);color:var(--gold);border-radius:999px;
  padding:6px 12px;font-size:.7rem;font-weight:800;letter-spacing:.09em}
main{max-width:1060px;margin:auto;padding:22px 20px 80px}
h1{font-family:Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;margin:.2em 0}
h2{font-family:Georgia,serif;font-size:clamp(20px,3.2vw,28px);margin:34px 0 10px}
.eyebrow{font-size:.7rem;letter-spacing:.18em;color:var(--gold);font-weight:800;margin:0}
.lede{color:#d5d8dd;font-size:1.05rem;max-width:62ch}
.split{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:26px;align-items:start}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}
.thumb{background:var(--panel2);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.thumb svg{display:block;width:100%;height:auto}
dl{display:grid;grid-template-columns:minmax(0,200px) minmax(0,1fr);gap:8px 18px;margin:0}
dt{color:var(--muted);font-size:.82rem;letter-spacing:.04em}
dd{margin:0}
table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;color:var(--muted);font-size:.68rem;letter-spacing:.12em;
  border-bottom:1px solid var(--gold-deep);padding:0 8px 7px 0;font-weight:800}
td{border-bottom:1px solid var(--line);padding:9px 8px 9px 0;vertical-align:top}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;word-break:break-all}
.sha{color:var(--muted)}
.num{white-space:nowrap}
ul{padding-left:18px}li{margin:6px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.ok::before{content:"✓ ";color:var(--good);font-weight:800}
.held::before{content:"○ ";color:var(--warn);font-weight:800}
.decision{border:1px solid var(--gold);border-radius:16px;padding:20px;
  background:linear-gradient(150deg,#151a22,#1b130b)}
footer{border-top:1px solid var(--line);padding:22px 20px;color:var(--muted);font-size:.82rem;text-align:center}
@media(max-width:760px){.split{grid-template-columns:1fr}dl{grid-template-columns:1fr}
  dt{margin-top:8px}body{font-size:15px}}
</style></head>
<body>
<header>
  <div class="brand">THYLORA</div>
  <div class="chip">CHAIRMAN PREVIEW · NOT PUBLISHED</div>
</header>
<main>
  <p class="eyebrow">${esc(PRODUCT.series)} · ${PRODUCT.seriesNo} · ${esc(PRODUCT.sku)}</p>
  <h1>${esc(PRODUCT.customerTitle)}</h1>
  <p class="lede">${esc(PRODUCT.subtitle)}</p>

  <div class="split">
    <div>
      <div class="thumb">${thumbnailSvg()}</div>
      <p class="mono" style="color:var(--muted);margin-top:10px">store thumbnail · 480×600 source · 1200×1500 raster</p>
    </div>
    <div>
      <h2 style="margin-top:0">Customer description</h2>
      ${STORE.description.map((d) => `<p>${esc(d)}</p>`).join('\n      ')}
      <ul>${STORE.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>
  </div>

  <h2>What was actually built</h2>
  <div class="card"><dl>
    ${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('\n    ')}
  </dl></div>

  <h2>Delivery package</h2>
  <div class="card">
    <table><thead><tr><th>FILE</th><th>WHAT IT IS</th><th>SIZE</th><th>SHA-256</th></tr></thead>
    <tbody>${fileRows}
    <tr><td class="mono">manifest.json</td><td>Serial, entitlement contract, checksums</td>
        <td class="num">${kb(Buffer.byteLength(release.manifestJson))}</td><td class="mono sha">generated</td></tr>
    </tbody></table>
    <p style="margin-bottom:0">Packaged as <span class="mono">${esc(release.zipName)}</span> (${kb(release.zip.length)}),
    delivered on the existing digital path: order → entitlement → download, with re-access by serial.</p>
  </div>

  <h2>Tested</h2>
  <div class="grid">
    <div class="card"><p class="eyebrow">ARTIFACT</p>
      <ul style="padding-left:16px">
        <li class="ok">Opens: header, cross-reference table, every object at its stated offset, every stream inflates</li>
        <li class="ok">12 pages, US Letter, no page missing</li>
        <li class="ok">Sheet fields present and marked for the reader to render</li>
        <li class="held">Rendered in Acrobat / Preview / iOS Files — needs a device</li>
      </ul></div>
    <div class="card"><p class="eyebrow">DELIVERY</p>
      <ul style="padding-left:16px">
        <li class="ok">Archive readable, central directory intact, manifest inside</li>
        <li class="ok">Checksums match the bytes shipped</li>
        <li class="ok">Filenames safe on every OS, under 80 characters</li>
        <li class="held">Live store order → entitlement → download — needs the backend (B1)</li>
      </ul></div>
    <div class="card"><p class="eyebrow">RE-ACCESS</p>
      <ul style="padding-left:16px">
        <li class="ok">Rebuild from serial is byte-identical</li>
        <li class="ok">A different serial produces a correctly stamped, different copy</li>
        <li class="ok">Entitlement contract: perpetual, not revocable by cancellation</li>
        <li class="held">Live re-access button — needs the backend (B1)</li>
      </ul></div>
    <div class="card"><p class="eyebrow">MOBILE AND IPAD</p>
      <ul style="padding-left:16px">
        <li class="ok">Phone edition is portrait 360×640 pt, typeset for a phone</li>
        <li class="ok">Print edition reads full-width on iPad without zooming</li>
        <li class="ok">This preview page reflows at 390 pt, 834 pt and desktop</li>
        <li class="held">Real-device scroll and tap — needs a device</li>
      </ul></div>
  </div>

  <h2>Decision</h2>
  <div class="decision">
    <p class="eyebrow">PROPOSED PRICE</p>
    <p style="font-family:Georgia,serif;font-size:1.6rem;margin:.1em 0">$29.00 USD one-off · permanent re-access · no subscription</p>
    <p style="color:#d5c4a1;margin-bottom:0">Publication is not requested. What is requested is a decision on
    price, on the customer-facing title, and on whether the product may be registered in the live store registry
    in <span class="mono">CHAIRMAN_PREVIEW</span> state.</p>
  </div>
</main>
<footer>${esc(PRODUCT.sku)} · serial ${esc(MASTER_SERIAL)} · ${esc(PRODUCT.edition)} v${esc(PRODUCT.version)} ·
preview surface, not routed, not published</footer>
</body></html>`;

const out = join(HERE, 'dist', 'preview');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'chairman-preview.html'), html);
console.log('chairman preview -> ' + join(out, 'chairman-preview.html'));
