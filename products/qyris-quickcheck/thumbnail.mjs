#!/usr/bin/env node
/* Store thumbnail for THY-QYRIS-QUICKCHECK-001.
   Drawn with the same engine as the artifact, so the card a customer sees in
   the store and the cover they open afterwards are the same object. */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDoc } from '../_engine/pdf.mjs';
import { pageToSvg } from '../_engine/preview.mjs';
import { INK } from './layout.mjs';
import { PRODUCT, STORE } from './content.mjs';

const W = 480, H = 600; // 4:5, the store card ratio

export function thumbnailSvg() {
  const doc = new PDFDoc({ title: PRODUCT.customerTitle });
  const p = doc.addPage(W, H);
  const t = INK;
  p.rect(0, 0, W, H, { fill: t.bg });
  p.rect(0, 0, W, H * 0.62, { fill: '#0c121b' });
  p.rect(0, 0, W, 6, { fill: t.gold });

  // nine-square mark, large, one square lit
  const size = 132, x = 44, y = 54, cell = size / 3, pad = cell * 0.17, s = cell - pad;
  for (let i = 0; i < 9; i++) {
    const cx = x + (i % 3) * cell, cy = y + Math.floor(i / 3) * cell;
    if (i === 4) p.rect(cx, cy, s, s, { fill: t.gold });
    else p.rect(cx + 0.6, cy + 0.6, s - 1.2, s - 1.2, { stroke: t.goldDeep, lineWidth: 1.2 });
  }

  p.text('THYLORA', W - 44, 74, { font: 'Helvetica-Bold', size: 13, tracking: 3.4, color: t.text, align: 'right' });
  p.text('STANDARDS ' + PRODUCT.seriesNo, W - 44, 96, {
    font: 'Helvetica-Bold', size: 9.4, tracking: 2.6, color: t.muted, align: 'right'
  });

  p.text('QYRIS', 44, 288, { font: 'Times-Bold', size: 70, color: t.text });
  p.text('QuickCheck', 44, 352, { font: 'Times-Bold', size: 70, color: t.gold });
  p.line(44, 386, 136, 386, { stroke: t.gold, lineWidth: 3 });
  p.text('THE NINE-INSPECTION PASS', 44, 420, {
    font: 'Helvetica-Bold', size: 11.5, tracking: 3, color: t.dim
  });
  p.paragraph(STORE.cardBlurb, 44, 460, W - 88, {
    font: 'Helvetica', size: 11.6, leading: 17.5, color: t.muted
  });
  p.rect(0, H - 54, W, 54, { fill: '#080c12' });
  p.line(0, H - 54, W, H - 54, { stroke: t.line, lineWidth: 1 });
  p.text('12 PAGES · PRINT + PHONE', 44, H - 22, {
    font: 'Helvetica-Bold', size: 9.8, tracking: 1.8, color: t.gold
  });
  p.text(PRODUCT.sku, W - 44, H - 22, {
    font: 'Helvetica', size: 9.6, tracking: 1.2, color: t.muted, align: 'right'
  });
  return pageToSvg(p, doc);
}

if (process.argv[1] && process.argv[1].endsWith('thumbnail.mjs')) {
  const out = join(dirname(fileURLToPath(import.meta.url)), 'dist', 'store');
  mkdirSync(out, { recursive: true });
  const svg = thumbnailSvg();
  writeFileSync(join(out, 'qyris-quickcheck-thumb-480x600.svg'), svg);
  writeFileSync(join(out, 'thumb.html'),
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}svg{display:block}</style>${svg}`);
  console.log('thumbnail written to ' + out);
}
