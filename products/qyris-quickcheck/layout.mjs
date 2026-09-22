/* THY-QYRIS-QUICKCHECK-001 · layout
   The THYLORA visual system in vector form: deep ink field, gold command
   accents, Georgia-weight serif heads over a sans working face, and the
   nine-square mark. Two editions off one content source — a print/tablet
   edition and a phone edition that is typeset for a phone, not shrunk. */

import { PDFDoc, textWidth, wrapText } from '../_engine/pdf.mjs';
import {
  PRODUCT, COVER, PLATE_00, INSPECTIONS, DISPOSITION, PLATE_06, PLATE_07,
  WORKED, SHEET, PAIRS
} from './content.mjs';

export const INK = {
  bg: '#0a0e14', panel: '#111823', panel2: '#0d131c', line: '#24303f',
  ghost: '#18222f', text: '#f4efe6', dim: '#c8ceda', muted: '#8e9bad',
  gold: '#e0b35b', goldDeep: '#8a6415', amber: '#b98223'
};
export const IVORY = {
  bg: '#f4efe6', panel: '#eae1d0', panel2: '#efe8da', line: '#cabb9f',
  ghost: '#e6dcc8', text: '#0f1620', dim: '#2c3644', muted: '#5f6a78',
  gold: '#8a6415', goldDeep: '#6f4b23', amber: '#8a6415'
};

const SERIF = 'Times-Bold';
const SERIF_R = 'Times-Roman';
const SANS = 'Helvetica';
const SANS_B = 'Helvetica-Bold';
const SANS_I = 'Helvetica-Oblique';

/* The nine-square mark: nine inspections, one pass. */
function mark(page, x, y, size, t, filled = 4) {
  const cell = size / 3, pad = cell * 0.17, s = cell - pad;
  for (let i = 0; i < 9; i++) {
    const cx = x + (i % 3) * cell, cy = y + Math.floor(i / 3) * cell;
    if (i === filled) page.rect(cx, cy, s, s, { fill: t.gold });
    else page.rect(cx + 0.35, cy + 0.35, s - 0.7, s - 0.7, { stroke: t.goldDeep, lineWidth: 0.7 });
  }
}

function caps(page, str, x, y, t, o = {}) {
  return page.text(str.toUpperCase(), x, y, {
    font: o.font || SANS_B, size: o.size || 7.2, tracking: o.tracking ?? 1.5,
    color: o.color || t.muted, align: o.align
  });
}

/* ---------------------------------------------------------------- frames */

function coverPage(doc, G, serial) {
  const p = doc.addPage(G.W, G.H);
  const t = INK;
  p.rect(0, 0, G.W, G.H, { fill: t.bg });
  p.rect(0, 0, G.W, G.H * 0.46, { fill: '#0c121b' });
  p.rect(0, 0, G.W, 5, { fill: t.gold });

  const m = G.M;
  caps(p, 'THYLORA', m, 40, t, { size: G.cover.brand, tracking: 3.2, color: t.text });
  caps(p, PRODUCT.sku, G.W - m, 40, t, { size: 7, tracking: 1.4, align: 'right' });
  p.line(m, 52, G.W - m, 52, { stroke: t.line, lineWidth: 0.7 });

  mark(p, m, G.cover.markY, G.cover.mark, t);

  let y = G.cover.titleY;
  caps(p, COVER.eyebrow, m, y, t, { size: G.cover.eyebrow, tracking: 2.2, color: t.gold });
  y += G.cover.gap1;
  p.text(COVER.title, m, y, { font: SERIF, size: G.cover.title, color: t.text });
  y += G.cover.title * 0.92;
  p.text(COVER.title2, m, y, { font: SERIF, size: G.cover.title, color: t.gold });
  y += G.cover.gap2;
  p.line(m, y, m + G.cover.ruleW, y, { stroke: t.gold, lineWidth: 2 });
  y += G.cover.gap3;
  caps(p, COVER.rule, m, y, t, { size: G.cover.rule, tracking: 3, color: t.dim });
  y += G.cover.gap4;
  y = p.paragraph(COVER.deck, m, y, G.CW, {
    font: SERIF_R, size: G.cover.deck, leading: G.cover.deck * 1.34, color: t.text, trailing: G.cover.deck * 1.9
  });
  y = p.paragraph(COVER.standfirst, m, y, Math.min(G.CW, G.cover.standW), {
    font: SANS, size: G.cover.stand, leading: G.cover.stand * 1.52, color: t.muted, trailing: G.cover.stand * 2.4
  });

  // Contents
  const boxY = y;
  p.roundRect(m, boxY, G.CW, G.cover.tocH, 10, { fill: t.panel, stroke: t.line, lineWidth: 0.7 });
  caps(p, 'INSIDE', m + G.cover.pad, boxY + 18, t, { size: 6.8, tracking: 2.2, color: t.gold });
  let ty = boxY + 34;
  const cols = G.cover.tocCols;
  const colW = (G.CW - G.cover.pad * 2 - 14) / cols;
  COVER.contents.forEach((row, i) => {
    const col = cols === 1 ? 0 : Math.floor(i / Math.ceil(COVER.contents.length / cols));
    const idx = cols === 1 ? i : i % Math.ceil(COVER.contents.length / cols);
    const x = m + G.cover.pad + col * (colW + 14);
    const yy = ty + idx * G.cover.tocRow;
    p.text(row[0], x, yy, { font: SANS_B, size: G.cover.tocNo, color: t.gold });
    p.text(row[1], x + G.cover.tocInd, yy, { font: SANS, size: G.cover.toc, color: t.dim });
  });

  // Foot band
  const fy = G.H - G.cover.footH;
  p.rect(0, fy, G.W, G.cover.footH, { fill: '#080c12' });
  p.line(0, fy, G.W, fy, { stroke: t.line, lineWidth: 0.7 });
  caps(p, 'SERIAL', m, fy + 22, t, { size: 6.4, tracking: 2 });
  p.text(serial, m, fy + 38, { font: SANS_B, size: G.cover.serial, color: t.gold, tracking: 0.6 });
  caps(p, PRODUCT.edition + ' · v' + PRODUCT.version, G.W - m, fy + 22, t, { size: 6.4, tracking: 2, align: 'right' });
  p.text(PRODUCT.editionDate, G.W - m, fy + 38, { font: SANS, size: G.cover.serial - 1, color: t.dim, align: 'right' });
  return p;
}

function plate(doc, G, t, { no, kicker, title, lede }, ctx) {
  const p = doc.addPage(G.W, G.H);
  const m = G.M;
  p.rect(0, 0, G.W, G.H, { fill: t.bg });
  p.rect(0, 0, G.W, 3, { fill: t.gold });

  caps(p, 'QYRIS QUICKCHECK', m, 30, t, { size: 6.6, tracking: 2 });
  caps(p, no === '—' ? ctx.runner || '' : 'PLATE ' + no, G.W - m, 30, t,
    { size: 6.6, tracking: 2, align: 'right', color: t.gold });
  p.line(m, 38, G.W - m, 38, { stroke: t.line, lineWidth: 0.7 });

  // ghost plate numeral, set low and right so it anchors the foot of the plate
  if (no !== '—') {
    p.text(no, G.W - m + G.head.ghostBleed, G.H - G.head.ghostUp, {
      font: SERIF, size: G.head.ghost, color: t.ghost, align: 'right'
    });
  }
  mark(p, m, G.head.markY, G.head.mark, t);

  let y = G.head.kickerY;
  caps(p, kicker, m + G.head.mark + 12, y, t, { size: 7, tracking: 2.2, color: t.gold });
  y = G.head.titleY;
  p.text(title, m, y, { font: SERIF, size: G.head.title, color: t.text });
  y += G.head.afterTitle;
  if (lede) {
    y = p.paragraph(lede, m, y, G.head.ledeW, {
      font: SANS, size: G.head.lede, leading: G.head.lede * 1.55, color: t.dim, trailing: G.head.lede * 2.1
    });
  }
  p.line(m, y - G.head.lede * 0.9, m + 46, y - G.head.lede * 0.9, { stroke: t.gold, lineWidth: 1.6 });
  return { p, y: y + G.head.afterLede };
}

function foot(p, G, t, serial, n, total) {
  const m = G.M, fy = G.H - G.footY;
  p.line(m, fy, G.W - m, fy, { stroke: t.line, lineWidth: 0.7 });
  caps(p, PRODUCT.sku + '  ·  ' + serial, m, fy + 13, t, { size: 5.9, tracking: 1.1 });
  caps(p, n + ' / ' + total, G.W - m, fy + 13, t, { size: 5.9, tracking: 1.1, align: 'right', color: t.gold });
}

/* ------------------------------------------------------------- content blocks */

function inspectionBlock(p, G, t, ins, x, y, w) {
  const badge = G.ins.badge;
  let cy = y;
  if (ins.name) {
    p.roundRect(x, y - badge * 0.78, badge, badge, 3, { fill: t.gold });
    p.text(ins.n, x + badge / 2, y - badge * 0.78 + badge * 0.72, {
      font: SANS_B, size: badge * 0.62, color: t.bg, align: 'center'
    });
    p.text(ins.name, x + badge + 10, y, { font: SERIF, size: G.ins.name, color: t.text });
    cy = y + G.ins.afterName;
  }
  cy = p.paragraph(ins.question, x, cy, w, {
    font: SANS_I, size: G.ins.q, leading: G.ins.q * 1.5, color: t.gold, trailing: G.ins.q * 1.9
  });

  caps(p, 'SOUNDS LIKE', x, cy, t, { size: 6.2, tracking: 1.8 });
  cy += G.ins.afterLabel;
  for (const s of ins.signals) {
    const lines = wrapText(s, SANS, G.ins.sig, w - 12);
    lines.forEach((ln, i) => {
      if (i === 0) p.text('·', x, cy, { font: SANS_B, size: G.ins.sig, color: t.goldDeep });
      p.text(ln, x + 10, cy, { font: SANS, size: G.ins.sig, color: t.muted });
      cy += G.ins.sig * 1.42;
    });
  }
  cy += G.ins.sig * 0.55;

  caps(p, 'THE ROUTE', x, cy, t, { size: 6.2, tracking: 1.8, color: t.gold });
  cy += G.ins.afterLabel;
  cy = p.paragraph(ins.route, x, cy, w, {
    font: SANS, size: G.ins.body, leading: G.ins.body * 1.52, color: t.dim, trailing: G.ins.body * 1.85
  });

  const testLines = wrapText(ins.test, SANS_B, G.ins.test, w - 24);
  const boxH = testLines.length * G.ins.test * 1.45 + 18;
  p.roundRect(x, cy - 10, w, boxH, 5, { fill: t.panel });
  p.rect(x, cy - 10, 2.6, boxH, { fill: t.gold });
  let ty = cy + 4;
  testLines.forEach((ln) => {
    p.text(ln, x + 14, ty, { font: SANS_B, size: G.ins.test, color: t.text });
    ty += G.ins.test * 1.45;
  });
  return cy - 10 + boxH;
}

function ruleBlock(p, G, t, items, x, y, w, o = {}) {
  let cy = y;
  items.forEach(([head, body], i) => {
    p.text(String(i + 1).padStart(2, '0'), x, cy, { font: SANS_B, size: G.rule.no, color: t.goldDeep });
    p.text(head, x + G.rule.ind, cy, { font: SANS_B, size: G.rule.head, color: t.text });
    cy += G.rule.afterHead;
    cy = p.paragraph(body, x + G.rule.ind, cy, w - G.rule.ind, {
      font: SANS, size: G.rule.body, leading: G.rule.body * 1.5, color: t.muted,
      trailing: G.rule.body * (o.tight ? 1.9 : 2.3)
    });
  });
  return cy;
}

function panelList(p, G, t, title, items, x, y, w) {
  const lineH = G.list.body * 1.48;
  let h = 26;
  const wrapped = items.map((s) => wrapText(s, SANS, G.list.body, w - 30));
  wrapped.forEach((ls) => { h += ls.length * lineH + 3; });
  h += 8;
  p.roundRect(x, y, w, h, 8, { fill: t.panel2, stroke: t.line, lineWidth: 0.7 });
  let titleSize = 6.4, titleTrack = 2;
  while (textWidth(title.toUpperCase(), SANS_B, titleSize, titleTrack) > w - 28 && titleSize > 4.8) {
    titleSize -= 0.2; titleTrack = Math.max(0.9, titleTrack - 0.1);
  }
  caps(p, title, x + 14, y + 17, t, { size: titleSize, tracking: titleTrack, color: t.gold });
  let cy = y + 33;
  wrapped.forEach((ls) => {
    ls.forEach((ln, i) => {
      if (i === 0) p.text('·', x + 14, cy, { font: SANS_B, size: G.list.body, color: t.goldDeep });
      p.text(ln, x + 24, cy, { font: SANS, size: G.list.body, color: t.dim });
      cy += lineH;
    });
    cy += 3;
  });
  return y + h;
}

function chip(p, label, x, y, t, tone) {
  const w = textWidth(label, SANS_B, 6.8, 1.2) + 16;
  const colour = tone === 'ROUTED' ? '#2f6b46' : tone === 'HELD' ? '#6b5a2f' : '#6b3232';
  const ink = tone === 'ROUTED' ? '#6fbf90' : tone === 'HELD' ? '#d0a94f' : '#e08a8a';
  p.roundRect(x, y - 8, w, 12.5, 6, { stroke: colour, lineWidth: 0.9 });
  p.text(label, x + 8, y, { font: SANS_B, size: 6.8, tracking: 1.2, color: ink });
  return w;
}

/* ------------------------------------------------------------------ editions */

const PRINT_G = {
  W: 612, H: 792, M: 54, CW: 504, footY: 42,
  cover: {
    brand: 10, mark: 42, markY: 108, titleY: 214, eyebrow: 8.4, gap1: 62, title: 62, gap2: 30,
    ruleW: 92, gap3: 26, rule: 8.6, gap4: 34, deck: 17, stand: 10.4, standW: 380,
    tocH: 150, pad: 18, tocCols: 2, tocRow: 22, tocNo: 8, toc: 8.6, tocInd: 22,
    footH: 76, serial: 12
  },
  head: {
    ghost: 190, ghostUp: 58, ghostBleed: 8, mark: 22, markY: 58, kickerY: 74, titleY: 122, title: 30,
    afterTitle: 26, lede: 10.2, ledeW: 430, afterLede: 12
  },
  ins: { badge: 19, name: 18.5, afterName: 26, q: 11.2, afterLabel: 16, sig: 9.2, body: 10.2, test: 9.4 },
  rule: { no: 9.4, ind: 27, head: 11, afterHead: 16, body: 9.6 },
  list: { body: 9.1 }
};

const MOBILE_G = {
  W: 360, H: 640, M: 26, CW: 308, footY: 30,
  cover: {
    brand: 9, mark: 30, markY: 78, titleY: 168, eyebrow: 7.4, gap1: 44, title: 40, gap2: 22,
    ruleW: 64, gap3: 19, rule: 7.4, gap4: 24, deck: 13, stand: 9, standW: 308,
    tocH: 196, pad: 14, tocCols: 1, tocRow: 16, tocNo: 7.4, toc: 8, tocInd: 20,
    footH: 60, serial: 10.5
  },
  head: {
    ghost: 120, ghostUp: 42, ghostBleed: 6, mark: 16, markY: 48, kickerY: 60, titleY: 96, title: 21,
    afterTitle: 20, lede: 9.2, ledeW: 308, afterLede: 8
  },
  ins: { badge: 15, name: 15, afterName: 19, q: 10.4, afterLabel: 14, sig: 8.8, body: 9.8, test: 9.2 },
  rule: { no: 8.6, ind: 23, head: 10.2, afterHead: 14, body: 9.2 },
  list: { body: 9 }
};

/* --------------------------------------------------------------- print build */

export function buildPrint(serial, opts = {}) {
  const G = PRINT_G, t = INK, m = G.M;
  const doc = new PDFDoc({
    title: PRODUCT.customerTitle,
    author: 'THYLORA',
    subject: PRODUCT.subtitle,
    keywords: [PRODUCT.sku, PRODUCT.id, serial, 'QYRIS', 'THYLORA', 'print and tablet edition'].join(', '),
    date: PRODUCT.pdfDate,
    id: serialHash(serial + '|print')
  });
  const TOTAL = 12;
  const pages = [];

  coverPage(doc, G, serial);
  doc.bookmark('Cover', 0);

  // Plate 00
  {
    const { p, y } = plate(doc, G, t, { no: PLATE_00.no, kicker: PLATE_00.kicker, title: PLATE_00.title, lede: PLATE_00.lede }, {});
    let cy = ruleBlock(p, G, t, PLATE_00.rules, m, y + 10, G.CW);
    const leftW = G.CW * 0.56, rx = m + leftW + 16, rw = G.CW - leftW - 16;
    const topY = cy + 6;
    panelList(p, G, t, PLATE_00.whenTitle, PLATE_00.when, m, topY, leftW);
    const shortLines = wrapText(PLATE_00.short, SANS, 8.8, rw - 28);
    const h = shortLines.length * 8.8 * 1.5 + 44;
    p.roundRect(rx, topY, rw, h, 8, { fill: t.panel, stroke: t.goldDeep, lineWidth: 0.8 });
    caps(p, PLATE_00.shortTitle, rx + 14, topY + 18, t, { size: 6.4, tracking: 2, color: t.gold });
    let sy = topY + 36;
    shortLines.forEach((ln) => { p.text(ln, rx + 14, sy, { font: SANS, size: 8.8, color: t.dim }); sy += 8.8 * 1.5; });
    foot(p, G, t, serial, 2, TOTAL);
    doc.bookmark('00 · How to run the pass', doc.pages.length - 1);
    pages.push(p);
  }

  // Plates 01-04: two inspections each
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7]];
  pairs.forEach(([a, b], idx) => {
    const no = '0' + (idx + 1);
    const kicker = 'INSPECTION ' + INSPECTIONS[a].n + ' AND ' + INSPECTIONS[b].n;
    const title = INSPECTIONS[a].name + ' · ' + INSPECTIONS[b].name;
    const { p, y } = plate(doc, G, t, { no, kicker, title: titleFit(title, G.head.title, G.CW), lede: null }, {});
    const colW = (G.CW - 30) / 2;
    const bottomA = inspectionBlock(p, G, t, INSPECTIONS[a], m, y + 18, colW);
    const bottomB = inspectionBlock(p, G, t, INSPECTIONS[b], m + colW + 30, y + 18, colW);
    const colBottom = Math.max(bottomA, bottomB);
    pairBand(p, G, t, no, G.CW * 0.68, colBottom + 34);
    p.line(m + colW + 15, y + 8, m + colW + 15, colBottom + 6, { stroke: t.line, lineWidth: 0.6 });
    foot(p, G, t, serial, 3 + idx, TOTAL);
    doc.bookmark(no + ' · ' + title, doc.pages.length - 1);
    pages.push(p);
  });

  // Plate 05 — inspection 9 + disposition
  {
    const { p, y } = plate(doc, G, t,
      { no: '05', kicker: 'INSPECTION 9 AND DISPOSITION', title: 'Failure and recovery', lede: null }, {});
    const colW = (G.CW - 30) / 2;
    const bottom9 = inspectionBlock(p, G, t, INSPECTIONS[8], m, y + 18, colW);
    const rx = m + colW + 30;
    p.line(m + colW + 15, y + 8, m + colW + 15, bottom9 + 6, { stroke: t.line, lineWidth: 0.6 });
    caps(p, DISPOSITION.kicker, rx, y + 16, t, { size: 6.6, tracking: 2, color: t.gold });
    p.text(DISPOSITION.title, rx, y + 40, { font: SERIF, size: 17, color: t.text });
    let cy = y + 62;
    DISPOSITION.items.forEach(([word, body]) => {
      chip(p, word, rx, cy, t, word);
      cy += 16;
      cy = p.paragraph(body, rx, cy, colW, {
        font: SANS, size: 8.8, leading: 8.8 * 1.5, color: t.dim, trailing: 8.8 * 2.2
      });
    });
    const nLines = wrapText(DISPOSITION.note, SANS_B, 8.6, colW - 26);
    const h = nLines.length * 8.6 * 1.5 + 20;
    p.roundRect(rx, cy - 4, colW, h, 6, { fill: t.panel });
    p.rect(rx, cy - 4, 2.6, h, { fill: t.gold });
    let ny = cy + 11;
    nLines.forEach((ln) => { p.text(ln, rx + 14, ny, { font: SANS_B, size: 8.6, color: t.text }); ny += 8.6 * 1.5; });
    pairBand(p, G, t, '05', G.CW * 0.68, Math.max(bottom9, cy + 40) + 30);
    foot(p, G, t, serial, 7, TOTAL);
    doc.bookmark('05 · Failure and recovery · Disposition', doc.pages.length - 1);
    pages.push(p);
  }

  // Plate 06 — scoring
  {
    const { p, y } = plate(doc, G, t,
      { no: PLATE_06.no, kicker: PLATE_06.kicker, title: PLATE_06.title, lede: PLATE_06.lede }, {});
    p.roundRect(m, y + 4, G.CW, 46, 8, { fill: t.panel, stroke: t.goldDeep, lineWidth: 0.9 });
    caps(p, 'READINESS LINE', m + 16, y + 21, t, { size: 6.2, tracking: 2 });
    p.text(PLATE_06.example, m + 16, y + 39, { font: SERIF, size: 15, color: t.gold });
    let cy = ruleBlock(p, G, t, PLATE_06.rules, m, y + 78, G.CW * 0.58);
    const rx = m + G.CW * 0.58 + 18, rw = G.CW - G.CW * 0.58 - 18;
    panelList(p, G, t, PLATE_06.cardTitle, PLATE_06.card, rx, y + 70, rw);
    foot(p, G, t, serial, 8, TOTAL);
    doc.bookmark('06 · Scoring and the readiness line', doc.pages.length - 1);
    pages.push(p);
  }

  // Plate 07 — weak passes
  {
    const { p, y } = plate(doc, G, t,
      { no: PLATE_07.no, kicker: PLATE_07.kicker, title: PLATE_07.title, lede: PLATE_07.lede }, {});
    let cy = y + 8;
    PLATE_07.items.forEach(([name, looks, fix], i) => {
      p.text(String(i + 1).padStart(2, '0'), m, cy + 12, { font: SANS_B, size: 9, color: t.goldDeep });
      p.text(name, m + 26, cy + 12, { font: SANS_B, size: 10.6, color: t.text });
      p.text(looks, m + 26 + textWidth(name, SANS_B, 10.6) + 10, cy + 12, { font: SANS_I, size: 8.8, color: t.muted });
      const fixY = p.paragraph(fix, m + 26, cy + 27, G.CW * 0.62 - 26, {
        font: SANS, size: 9, leading: 9 * 1.5, color: t.dim, trailing: 9 * 1.1
      });
      cy = fixY + 8;
      p.line(m, cy - 3, m + G.CW * 0.62, cy - 3, { stroke: t.line, lineWidth: 0.5 });
      cy += 6;
    });
    const rx = m + G.CW * 0.62 + 18, rw = G.CW - G.CW * 0.62 - 18;
    panelList(p, G, t, PLATE_07.roomTitle, PLATE_07.room, rx, y + 8, rw);
    foot(p, G, t, serial, 9, TOTAL);
    doc.bookmark('07 · Five ways a pass goes weak', doc.pages.length - 1);
    pages.push(p);
  }

  // Worked example (ivory)
  {
    const ti = IVORY;
    const { p, y } = plate(doc, G, ti,
      { no: '—', kicker: WORKED.kicker, title: WORKED.title, lede: WORKED.context }, { runner: 'WORKED EXAMPLE' });
    const cols = [16, 100, 168, 62, 158];
    const xs = []; let acc = m;
    cols.forEach((c) => { xs.push(acc); acc += c; });
    let cy = y + 2;
    caps(p, 'INSPECTION', xs[1], cy, ti, { size: 5.8, tracking: 1.4 });
    caps(p, 'WHAT THE PASS FOUND', xs[2], cy, ti, { size: 5.8, tracking: 1.4 });
    caps(p, 'DISPOSITION', xs[3], cy, ti, { size: 5.8, tracking: 1.4 });
    caps(p, 'ROUTE, OWNER, DATE', xs[4], cy, ti, { size: 5.8, tracking: 1.4 });
    cy += 6;
    p.line(m, cy, G.W - m, cy, { stroke: ti.gold, lineWidth: 1.1 });
    cy += 13;
    WORKED.rows.forEach(([n, name, found, disp, route], i) => {
      const f = wrapText(found, SANS, 7.4, cols[2] - 10);
      const r = wrapText(route, SANS, 7.4, cols[4] - 4);
      const nm = wrapText(name, SANS_B, 7.6, cols[1] - 10);
      const rows = Math.max(f.length, r.length, nm.length);
      const h = rows * 10.2 + 12;
      if (i % 2 === 0) p.rect(m - 6, cy - 9, G.CW + 12, h, { fill: ti.panel2 });
      p.text(n, xs[0], cy, { font: SANS_B, size: 7.6, color: ti.gold });
      nm.forEach((ln, k) => p.text(ln, xs[1], cy + k * 10.2, { font: SANS_B, size: 7.6, color: ti.text }));
      f.forEach((ln, k) => p.text(ln, xs[2], cy + k * 10.2, { font: SANS, size: 7.4, color: ti.dim }));
      chipLight(p, disp, xs[3], cy, ti);
      r.forEach((ln, k) => p.text(ln, xs[4], cy + k * 10.2, { font: SANS, size: 7.4, color: ti.dim }));
      cy += h;
      p.line(m, cy - 9, G.W - m, cy - 9, { stroke: ti.line, lineWidth: 0.4 });
    });
    cy += 4;
    p.roundRect(m, cy - 6, G.CW, 40, 7, { fill: ti.panel, stroke: ti.gold, lineWidth: 0.9 });
    caps(p, 'READINESS LINE', m + 14, cy + 8, ti, { size: 6, tracking: 1.8 });
    p.text(WORKED.readiness, m + 14, cy + 25, { font: SERIF, size: 12.5, color: ti.text });
    cy += 48;
    const halfW = (G.CW - 20) / 2;
    caps(p, WORKED.costTitle, m, cy, ti, { size: 6.4, tracking: 2, color: ti.gold });
    p.paragraph(WORKED.cost, m, cy + 15, halfW, { font: SANS, size: 8.6, leading: 8.6 * 1.5, color: ti.dim });
    caps(p, WORKED.carriedTitle, m + halfW + 20, cy, ti, { size: 6.4, tracking: 2, color: ti.gold });
    const carriedEnd = p.paragraph(WORKED.carried, m + halfW + 20, cy + 15, halfW,
      { font: SANS, size: 8.6, leading: 8.6 * 1.5, color: ti.dim });
    p.line(m, carriedEnd + 6, G.W - m, carriedEnd + 6, { stroke: ti.line, lineWidth: 0.6 });
    p.text(WORKED.pointer, m, carriedEnd + 22, { font: SANS_I, size: 8.4, color: ti.muted });
    foot(p, G, ti, serial, 10, TOTAL);
    doc.bookmark('Worked example', doc.pages.length - 1);
    pages.push(p);
  }

  // The sheet (ivory, fillable)
  {
    const ti = IVORY;
    const p = doc.addPage(G.W, G.H);
    p.rect(0, 0, G.W, G.H, { fill: ti.bg });
    p.rect(0, 0, G.W, 3, { fill: ti.gold });
    caps(p, 'QYRIS QUICKCHECK', m, 30, ti, { size: 6.6, tracking: 2 });
    caps(p, 'THE SHEET · REUSABLE', G.W - m, 30, ti, { size: 6.6, tracking: 2, align: 'right', color: ti.gold });
    p.line(m, 38, G.W - m, 38, { stroke: ti.line, lineWidth: 0.7 });
    mark(p, m, 52, 20, ti);
    p.text(SHEET.title, m + 30, 68, { font: SERIF, size: 21, color: ti.text });
    caps(p, SHEET.strap, m + 30, 82, ti, { size: 6.6, tracking: 1.8 });

    // header fields
    let cy = 100;
    const hw = [212, 76, 106, 62], gap = 8;
    let hx = m;
    SHEET.header.forEach(([id, label], i) => {
      caps(p, label, hx, cy, ti, { size: 5.8, tracking: 1.3 });
      p.roundRect(hx, cy + 4, hw[i], 20, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.7 });
      p.field('sheet.' + id, hx + 2, cy + 5, hw[i] - 4, 18, { tooltip: label, fontSize: 9 });
      hx += hw[i] + gap;
    });
    cy += 36;
    p.line(m, cy, G.W - m, cy, { stroke: ti.gold, lineWidth: 1.1 });
    cy += 10;

    const c1 = 118, c2 = 214, c3 = 58, c4 = 102, g = 6;
    caps(p, 'INSPECTION', m, cy, ti, { size: 5.6, tracking: 1.3 });
    caps(p, 'WHAT THE PASS FOUND', m + c1 + g, cy, ti, { size: 5.6, tracking: 1.3 });
    caps(p, 'DISPOSITION', m + c1 + c2 + g * 2, cy, ti, { size: 5.6, tracking: 1.3 });
    caps(p, 'OWNER AND DATE', m + c1 + c2 + c3 + g * 3, cy, ti, { size: 5.6, tracking: 1.3 });
    cy += 6;

    const rowH = 51;
    SHEET.rows.forEach(([n, name, question], i) => {
      const ry = cy + i * rowH;
      if (i % 2 === 0) p.rect(m - 6, ry, G.CW + 12, rowH, { fill: ti.panel2 });
      p.text(n, m, ry + 14, { font: SANS_B, size: 8.4, color: ti.gold });
      p.text(name, m + 11, ry + 14, { font: SANS_B, size: 8.4, color: ti.text });
      const q = wrapText(question, SANS, 6.5, c1 - 11);
      q.slice(0, 4).forEach((ln, k) => p.text(ln, m + 11, ry + 25 + k * 8, { font: SANS, size: 6.5, color: ti.muted }));
      const fy = ry + 5, fh = rowH - 11;
      const cells = [[m + c1 + g, c2], [m + c1 + c2 + g * 2, c3], [m + c1 + c2 + c3 + g * 3, c4]];
      const ids = ['finding', 'disposition', 'owner'];
      cells.forEach(([cx, cw], k) => {
        p.roundRect(cx, fy, cw, fh, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
        p.field(`sheet.i${n}.${ids[k]}`, cx + 2, fy + 2, cw - 4, fh - 4,
          { tooltip: `Inspection ${n} · ${name} · ${ids[k]}`, multiline: true, fontSize: 8 });
      });
    });
    cy += SHEET.rows.length * rowH + 8;

    SHEET.footer.forEach(([id, label], i) => {
      caps(p, label, m, cy, ti, { size: 5.8, tracking: 1.3, color: ti.gold });
      p.roundRect(m, cy + 4, G.CW, 24, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.7 });
      p.field('sheet.' + id, m + 2, cy + 6, G.CW - 4, 20, { tooltip: label, multiline: true, fontSize: 8.5 });
      cy += 38;
    });
    p.paragraph(SHEET.note, m, cy + 2, G.CW, { font: SANS_I, size: 7.6, leading: 11, color: ti.muted });
    foot(p, G, ti, serial, 11, TOTAL);
    doc.bookmark('The QuickCheck Sheet', doc.pages.length - 1);
    pages.push(p);
  }

  colophon(doc, G, serial, 12, TOTAL);
  doc.bookmark('Serial, rights and re-access', doc.pages.length - 1);
  return opts.doc ? doc : doc.build();
}

function pairBand(p, G, t, key, width, topWanted) {
  const entry = PAIRS[key];
  if (!entry) return;
  const [label, body] = entry;
  const m = G.M;
  const size = G.W > 500 ? 9.2 : 8.4;
  const lines = wrapText(body, SANS, size, width - 28);
  const h = lines.length * size * 1.52 + 40;
  const floor = G.H - G.footY - 22 - h;
  const top = topWanted === undefined ? floor : Math.min(topWanted, floor);
  p.roundRect(m, top, width, h, 8, { fill: t.panel2, stroke: t.line, lineWidth: 0.7 });
  p.rect(m, top, 2.6, h, { fill: t.gold });
  caps(p, label, m + 16, top + 19, t, { size: 6.2, tracking: 2, color: t.gold });
  let cy = top + 37;
  lines.forEach((ln) => { p.text(ln, m + 16, cy, { font: SANS, size, color: t.dim }); cy += size * 1.52; });
}

function chipLight(p, label, x, y, ti) {
  const colour = label === 'ROUTED' ? '#2c6b47' : label === 'HELD' ? '#8a6415' : '#8c3333';
  p.roundRect(x, y - 7.5, 46, 12, 6, { stroke: colour, lineWidth: 0.8 });
  p.text(label, x + 23, y, { font: SANS_B, size: 6.4, tracking: 0.9, color: colour, align: 'center' });
}

function titleFit(title, size, width) {
  if (textWidth(title, SERIF, size) <= width) return title;
  return title;
}

function colophon(doc, G, serial, n, total) {
  const t = INK, m = G.M;
  const p = doc.addPage(G.W, G.H);
  p.rect(0, 0, G.W, G.H, { fill: t.bg });
  p.rect(0, 0, G.W, 3, { fill: t.gold });
  caps(p, 'QYRIS QUICKCHECK', m, 30, t, { size: 6.6, tracking: 2 });
  caps(p, 'COLOPHON', G.W - m, 30, t, { size: 6.6, tracking: 2, align: 'right', color: t.gold });
  p.line(m, 38, G.W - m, 38, { stroke: t.line, lineWidth: 0.7 });
  mark(p, m, G.head.markY, G.head.mark, t);

  let y = G.head.titleY;
  p.text('This copy', m, y, { font: SERIF, size: G.head.title, color: t.text });
  y += 22;
  p.line(m, y, m + 46, y, { stroke: t.gold, lineWidth: 1.6 });
  y += 26;

  const rowW = G.CW / (G.W > 500 ? 2 : 1);
  const facts = [
    ['SERIAL', serial], ['SKU', PRODUCT.sku], ['ARTIFACT ID', PRODUCT.id],
    ['EDITION', PRODUCT.edition + ' · v' + PRODUCT.version], ['EDITION DATE', PRODUCT.editionDate],
    ['CUSTOMER TITLE', PRODUCT.customerTitle]
  ];
  p.roundRect(m, y, G.CW, 112, 9, { fill: t.panel, stroke: t.line, lineWidth: 0.7 });
  facts.forEach(([k, v], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = m + 18 + col * (G.CW / 2 - 8), fy = y + 22 + row * 32;
    caps(p, k, fx, fy, t, { size: 5.8, tracking: 1.6 });
    p.text(v, fx, fy + 13, { font: k === 'SERIAL' ? SANS_B : SANS, size: k === 'SERIAL' ? 11 : 9.2, color: k === 'SERIAL' ? t.gold : t.dim });
  });
  y += 128;

  const sections = [
    ['CREDITS', PRODUCT.creditsLines.join('\n')],
    ['PROVENANCE', PRODUCT.provenanceLine],
    ['RIGHTS', PRODUCT.rightsLine],
    ['RE-ACCESS', 'Your purchase entitlement is permanent. Re-access is by serial or order reference through the THYLORA store account that bought it — no email required, no expiry, and ending a membership never removes it. A corrected or extended edition is delivered to the same entitlement at no further cost, carrying the same serial with a new edition line.'],
    ['WHAT THIS IS NOT', PRODUCT.limitsLines.join('\n')]
  ];
  sections.forEach(([k, v]) => {
    caps(p, k, m, y, t, { size: 6.4, tracking: 2, color: t.gold });
    y = p.paragraph(v, m, y + 14, G.CW, { font: SANS, size: 8.6, leading: 8.6 * 1.52, color: t.dim, trailing: 8.6 * 2.6 });
  });
  foot(p, G, t, serial, n, total);
  return p;
}

/* -------------------------------------------------------------- mobile build */

export function buildMobile(serial, opts = {}) {
  const G = MOBILE_G, t = INK, m = G.M;
  const doc = new PDFDoc({
    title: PRODUCT.customerTitle + ' — phone edition',
    author: 'THYLORA',
    subject: PRODUCT.subtitle,
    keywords: [PRODUCT.sku, PRODUCT.id, serial, 'QYRIS', 'THYLORA', 'phone edition'].join(', '),
    date: PRODUCT.pdfDate,
    id: serialHash(serial + '|mobile')
  });
  const seq = [];
  const push = (fn, bm) => { seq.push({ fn, bm }); };

  coverPage(doc, G, serial);
  doc.bookmark('Cover', 0);

  const counted = [];
  const addPlate = (spec, body, bm) => {
    const { p, y } = plate(doc, G, t, spec, spec.ctx || {});
    body(p, y);
    counted.push(p);
    if (bm) doc.bookmark(bm, doc.pages.length - 1);
  };

  addPlate({ no: '00', kicker: PLATE_00.kicker, title: PLATE_00.title, lede: PLATE_00.lede },
    (p, y) => { ruleBlock(p, G, t, PLATE_00.rules, m, y + 6, G.CW, { tight: true }); },
    '00 · How to run the pass');

  addPlate({ no: '00', kicker: 'BEFORE YOU START', title: 'When to run it', lede: null },
    (p, y) => {
      let cy = panelList(p, G, t, PLATE_00.whenTitle, PLATE_00.when, m, y + 4, G.CW);
      const lines = wrapText(PLATE_00.short, SANS, 8.6, G.CW - 28);
      const h = lines.length * 8.6 * 1.5 + 42;
      p.roundRect(m, cy + 14, G.CW, h, 8, { fill: t.panel, stroke: t.goldDeep, lineWidth: 0.8 });
      caps(p, PLATE_00.shortTitle, m + 14, cy + 32, t, { size: 6.4, tracking: 2, color: t.gold });
      let sy = cy + 50;
      lines.forEach((ln) => { p.text(ln, m + 14, sy, { font: SANS, size: 8.6, color: t.dim }); sy += 8.6 * 1.5; });
    }, 'When to run it');

  INSPECTIONS.forEach((ins, i) => {
    addPlate({ no: '0' + Math.min(i + 1, 9), kicker: 'INSPECTION ' + ins.n + ' OF 9', title: ins.name, lede: null },
      (p, y) => { inspectionBlock(p, G, t, { ...ins, name: '' }, m, y + 4, G.CW); },
      ins.n + ' · ' + ins.name);
  });

  addPlate({ no: '—', kicker: DISPOSITION.kicker, title: DISPOSITION.title, lede: null, ctx: { runner: 'DISPOSITION' } },
    (p, y) => {
      let cy = y + 4;
      DISPOSITION.items.forEach(([word, body]) => {
        chip(p, word, m, cy, t, word);
        cy += 16;
        cy = p.paragraph(body, m, cy, G.CW, { font: SANS, size: 8.6, leading: 8.6 * 1.5, color: t.dim, trailing: 8.6 * 2.1 });
      });
      const nl = wrapText(DISPOSITION.note, SANS_B, 8.4, G.CW - 26);
      const h = nl.length * 8.4 * 1.5 + 20;
      p.roundRect(m, cy - 4, G.CW, h, 6, { fill: t.panel });
      p.rect(m, cy - 4, 2.6, h, { fill: t.gold });
      let ny = cy + 11;
      nl.forEach((ln) => { p.text(ln, m + 14, ny, { font: SANS_B, size: 8.4, color: t.text }); ny += 8.4 * 1.5; });
    }, 'Disposition');

  addPlate({ no: '06', kicker: PLATE_06.kicker, title: PLATE_06.title, lede: PLATE_06.lede },
    (p, y) => {
      p.roundRect(m, y, G.CW, 42, 8, { fill: t.panel, stroke: t.goldDeep, lineWidth: 0.9 });
      caps(p, 'READINESS LINE', m + 13, y + 16, t, { size: 6, tracking: 1.8 });
      p.text(PLATE_06.example, m + 13, y + 33, { font: SERIF, size: 10.6, color: t.gold });
      ruleBlock(p, G, t, PLATE_06.rules, m, y + 62, G.CW, { tight: true });
    }, '06 · Scoring and the readiness line');

  addPlate({ no: '06', kicker: 'CLOSING THE PASS', title: 'Blocker card', lede: null },
    (p, y) => { panelList(p, G, t, PLATE_06.cardTitle, PLATE_06.card, m, y + 4, G.CW); }, 'Blocker card');

  addPlate({ no: '07', kicker: PLATE_07.kicker, title: PLATE_07.title, lede: PLATE_07.lede },
    (p, y) => {
      let cy = y + 2;
      PLATE_07.items.forEach(([name, looks, fix], i) => {
        p.text(String(i + 1).padStart(2, '0'), m, cy + 10, { font: SANS_B, size: 8.4, color: t.goldDeep });
        p.text(name, m + 22, cy + 10, { font: SANS_B, size: 9.8, color: t.text });
        p.text(looks, m + 22, cy + 21, { font: SANS_I, size: 8.2, color: t.muted });
        cy = p.paragraph(fix, m + 22, cy + 33, G.CW - 22, { font: SANS, size: 8.4, leading: 8.4 * 1.48, color: t.dim, trailing: 8.4 * 1.2 });
        p.line(m, cy - 2, G.W - m, cy - 2, { stroke: t.line, lineWidth: 0.5 });
        cy += 5;
      });
    }, '07 · Five ways a pass goes weak');

  addPlate({ no: '07', kicker: 'QUALITY CONTROL', title: 'In a room', lede: null },
    (p, y) => { panelList(p, G, t, PLATE_07.roomTitle, PLATE_07.room, m, y + 4, G.CW); }, 'Running it with other people');

  // Worked example across two screens
  const half = [WORKED.rows.slice(0, 5), WORKED.rows.slice(5)];
  half.forEach((rows, part) => {
    const ti = IVORY;
    const { p, y } = plate(doc, G, ti, {
      no: '—', kicker: WORKED.kicker + ' · ' + (part + 1) + ' OF 2',
      title: part === 0 ? WORKED.title : 'Findings 6 to 9',
      lede: part === 0 ? WORKED.context : null, ctx: { runner: 'WORKED EXAMPLE' }
    }, {});
    let cy = y + 4;
    rows.forEach(([n, name, found, disp, route]) => {
      p.text(n + ' · ' + name, m, cy, { font: SANS_B, size: 8.6, color: ti.text });
      chipLight(p, disp, G.W - m - 46, cy, ti);
      cy = p.paragraph(found, m, cy + 13, G.CW, { font: SANS, size: 7.8, leading: 11, color: ti.dim, trailing: 2 });
      cy = p.paragraph(route, m, cy + 10, G.CW, { font: SANS, size: 7.8, leading: 11, color: ti.muted, trailing: 8 });
      p.line(m, cy - 2, G.W - m, cy - 2, { stroke: ti.line, lineWidth: 0.4 });
      cy += 8;
    });
    if (part === 1) {
      p.roundRect(m, cy, G.CW, 36, 7, { fill: ti.panel, stroke: ti.gold, lineWidth: 0.9 });
      caps(p, 'READINESS LINE', m + 12, cy + 13, ti, { size: 5.8, tracking: 1.8 });
      p.text(WORKED.readiness, m + 12, cy + 28, { font: SERIF, size: 9.4, color: ti.text });
    }
    counted.push(p);
    doc.bookmark(part === 0 ? 'Worked example' : 'Worked example · findings 6 to 9', doc.pages.length - 1);
  });

  // Sheet across three screens
  const groups = [[0, 3], [3, 6], [6, 9]];
  groups.forEach(([a, b], gi) => {
    const ti = IVORY;
    const p = doc.addPage(G.W, G.H);
    p.rect(0, 0, G.W, G.H, { fill: ti.bg });
    p.rect(0, 0, G.W, 3, { fill: ti.gold });
    caps(p, 'THE SHEET', m, 26, ti, { size: 6.2, tracking: 2 });
    caps(p, (gi + 1) + ' OF 3 · REUSABLE', G.W - m, 26, ti, { size: 6.2, tracking: 2, align: 'right', color: ti.gold });
    p.line(m, 33, G.W - m, 33, { stroke: ti.line, lineWidth: 0.7 });
    let cy = 52;
    if (gi === 0) {
      p.text(SHEET.title, m, cy, { font: SERIF, size: 17, color: ti.text });
      cy += 12;
      caps(p, SHEET.strap, m, cy, ti, { size: 6.2, tracking: 1.6 });
      cy += 18;
      SHEET.header.forEach(([id, label], i) => {
        const w = i < 1 ? G.CW : (G.CW - 12) / 3;
        const x = i < 1 ? m : m + (i - 1) * ((G.CW - 12) / 3 + 6);
        caps(p, label, x, cy, ti, { size: 5.6, tracking: 1.2 });
        p.roundRect(x, cy + 4, w, 18, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
        p.field('m.sheet.' + id, x + 2, cy + 5, w - 4, 16, { tooltip: label, fontSize: 8.5 });
        if (i === 0 || i === 3) cy += 30;
      });
      cy += 6;
      p.line(m, cy, G.W - m, cy, { stroke: ti.gold, lineWidth: 1 });
      cy += 12;
    }
    SHEET.rows.slice(a, b).forEach(([n, name, question]) => {
      p.text(n + ' · ' + name, m, cy, { font: SANS_B, size: 9, color: ti.text });
      const q = wrapText(question, SANS, 6.8, G.CW);
      q.forEach((ln, k) => p.text(ln, m, cy + 11 + k * 8.4, { font: SANS, size: 6.8, color: ti.muted }));
      const fy = cy + 13 + q.length * 8.4;
      p.roundRect(m, fy, G.CW, 40, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
      p.field(`m.sheet.i${n}.finding`, m + 2, fy + 2, G.CW - 4, 36,
        { tooltip: `Inspection ${n} · finding`, multiline: true, fontSize: 8 });
      const dy = fy + 52;
      caps(p, 'DISPOSITION', m, dy - 4, ti, { size: 5.4, tracking: 1.1 });
      caps(p, 'OWNER AND DATE', m + 102, dy - 4, ti, { size: 5.4, tracking: 1.1 });
      p.roundRect(m, dy, 96, 17, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
      p.field(`m.sheet.i${n}.disposition`, m + 2, dy + 2, 92, 13, { tooltip: 'Routed / Held / Open', fontSize: 8 });
      p.roundRect(m + 102, dy, G.CW - 102, 17, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
      p.field(`m.sheet.i${n}.owner`, m + 104, dy + 2, G.CW - 106, 13, { tooltip: 'Owner and date', fontSize: 8 });
      cy = dy + 34;
    });
    if (gi === 2) {
      SHEET.footer.forEach(([id, label]) => {
        caps(p, label, m, cy, ti, { size: 5.6, tracking: 1.2, color: ti.gold });
        p.roundRect(m, cy + 4, G.CW, 22, 3, { fill: '#ffffff', stroke: ti.line, lineWidth: 0.6 });
        p.field('m.sheet.' + id, m + 2, cy + 6, G.CW - 4, 18, { tooltip: label, multiline: true, fontSize: 8 });
        cy += 34;
      });
    }
    counted.push(p);
    doc.bookmark('The QuickCheck Sheet · ' + (gi + 1) + ' of 3', doc.pages.length - 1);
  });

  const total = doc.pages.length + 1;
  colophon(doc, G, serial, total, total);
  doc.bookmark('Serial, rights and re-access', doc.pages.length - 1);

  // number the interior feet now that the total is known
  counted.forEach((p, i) => foot(p, G, isIvory(p) ? IVORY : INK, serial, i + 2, total));
  return opts.doc ? doc : doc.build();
}

function isIvory(page) {
  return page.ops.length > 0 && page.ops[0].startsWith('0.957');
}

function serialHash(str) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    h1 = (h1 ^ str.charCodeAt(i)) >>> 0; h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (h2 + str.charCodeAt(i) * (i + 7)) >>> 0;
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).repeat(2).slice(0, 32);
}
