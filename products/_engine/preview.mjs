/* THYLORA ARTIFACT ENGINE · preview renderer.
   Replays a page's own content-stream operators into SVG so the artifact can
   be proof-read, screenshotted and device-tested without a PDF rasteriser.
   It reads the same bytes the reader will: a preview can only be wrong in the
   same direction the PDF is. */

const FONT_MAP = {
  F: { 'Helvetica': ['Liberation Sans, Arial, sans-serif', 400, 'normal'] }
};

function fontCss(base) {
  switch (base) {
    case 'Times-Bold': return ['"Liberation Serif", "Times New Roman", serif', 700, 'normal'];
    case 'Times-Roman': return ['"Liberation Serif", "Times New Roman", serif', 400, 'normal'];
    case 'Times-Italic': return ['"Liberation Serif", "Times New Roman", serif', 400, 'italic'];
    case 'Helvetica-Bold': return ['"Liberation Sans", Arial, sans-serif', 700, 'normal'];
    case 'Helvetica-Oblique': return ['"Liberation Sans", Arial, sans-serif', 400, 'italic'];
    default: return ['"Liberation Sans", Arial, sans-serif', 400, 'normal'];
  }
}

const WIN_HIGH = {
  0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201c', 0x94: '\u201d',
  0x96: '\u2013', 0x97: '\u2014', 0xa0: '\u00a0', 0xa9: '\u00a9',
  0xb0: '\u00b0', 0xb7: '\u00b7', 0xd7: '\u00d7'
};
const winAnsiChar = (code) => WIN_HIGH[code] || String.fromCharCode(code);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function pageToSvg(page, doc) {
  const aliasToBase = new Map();
  for (const [name, alias] of doc.fontAliases) aliasToBase.set(alias, name);

  const out = [];
  let fill = '#000', stroke = '#000', lw = 1, dash = null;
  let path = [], pendingText = null;
  const col = (r, g, b) => `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;

  for (const raw of page.ops) {
    const op = raw.trim();
    let mm;
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) ([\d.-]+) rg$/))) { fill = col(+mm[1], +mm[2], +mm[3]); continue; }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) ([\d.-]+) RG$/))) { stroke = col(+mm[1], +mm[2], +mm[3]); continue; }
    if ((mm = op.match(/^([\d.-]+) w$/))) { lw = +mm[1]; continue; }
    if ((mm = op.match(/^\[([\d. ]*)\] 0 d$/))) { dash = mm[1].trim() || null; continue; }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) re$/))) {
      path.push({ kind: 're', x: +mm[1], y: +mm[2], w: +mm[3], h: +mm[4] }); continue;
    }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) m ([\d.-]+) ([\d.-]+) l S$/))) {
      out.push(emitPath([{ kind: 'm', x: +mm[1], y: +mm[2] }, { kind: 'l', x: +mm[3], y: +mm[4] }],
        null, stroke, lw, dash, page.height));
      continue;
    }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) m$/))) { path.push({ kind: 'm', x: +mm[1], y: +mm[2] }); continue; }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) l S$/))) {
      path.push({ kind: 'l', x: +mm[1], y: +mm[2] });
      out.push(emitPath(path, null, stroke, lw, dash, page.height)); path = []; continue;
    }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) l$/))) { path.push({ kind: 'l', x: +mm[1], y: +mm[2] }); continue; }
    if ((mm = op.match(/^([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) c$/))) {
      path.push({ kind: 'c', v: mm.slice(1).map(Number) }); continue;
    }
    if (op === 'h') { path.push({ kind: 'h' }); continue; }
    if (op === 'f' || op === 'S' || op === 'B') {
      out.push(emitPath(path, op === 'S' ? null : fill, op === 'f' ? null : stroke, lw, dash, page.height));
      path = []; continue;
    }
    if (op === 'BT') { pendingText = { size: 10, font: 'Helvetica', tc: 0 }; continue; }
    if ((mm = op.match(/^\/(F\d+) ([\d.-]+) Tf$/))) {
      pendingText.font = aliasToBase.get(mm[1]) || 'Helvetica'; pendingText.size = +mm[2]; continue;
    }
    if ((mm = op.match(/^([\d.-]+) Tc$/))) { pendingText.tc = +mm[1]; continue; }
    if ((mm = op.match(/^1 0 0 1 ([\d.-]+) ([\d.-]+) Tm$/))) { pendingText.x = +mm[1]; pendingText.y = +mm[2]; continue; }
    if (op.endsWith(' Tj')) {
      const body = op.slice(1, -4).replace(/\\([()\\])/g, '$1')
        .replace(/\\(\d{3})/g, (_, o) => winAnsiChar(parseInt(o, 8)));
      const [family, weight, style] = fontCss(pendingText.font);
      out.push(`<text x="${pendingText.x}" y="${page.height - pendingText.y}" fill="${fill}" ` +
        `font-family='${family}' font-size="${pendingText.size}" font-weight="${weight}" ` +
        `font-style="${style}"${pendingText.tc ? ` letter-spacing="${pendingText.tc}"` : ''} ` +
        `xml:space="preserve">${esc(body)}</text>`);
      continue;
    }
    if (op === 'ET') { pendingText = null; continue; }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" ` +
    `viewBox="0 0 ${page.width} ${page.height}">${out.join('')}</svg>`;
}

function emitPath(segs, fill, stroke, lw, dash, H) {
  const d = [];
  for (const s of segs) {
    if (s.kind === 're') d.push(`M${s.x} ${H - s.y - s.h}h${s.w}v${s.h}h${-s.w}Z`);
    else if (s.kind === 'm') d.push(`M${s.x} ${H - s.y}`);
    else if (s.kind === 'l') d.push(`L${s.x} ${H - s.y}`);
    else if (s.kind === 'c') d.push(`C${s.v[0]} ${H - s.v[1]} ${s.v[2]} ${H - s.v[3]} ${s.v[4]} ${H - s.v[5]}`);
    else if (s.kind === 'h') d.push('Z');
  }
  return `<path d="${d.join(' ')}" fill="${fill || 'none'}" stroke="${stroke || 'none'}" ` +
    `stroke-width="${lw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

export function docToHtml(doc, { scale = 1, gap = 24, bg = '#3a3f46' } = {}) {
  const pages = doc.pages.map((p, i) =>
    `<div class="pg" data-page="${i + 1}" style="width:${p.width * scale}px;height:${p.height * scale}px">` +
    `<div style="transform:scale(${scale});transform-origin:0 0;width:${p.width}px;height:${p.height}px">` +
    pageToSvg(p, doc) + '</div></div>').join('');
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:${bg};display:flex;flex-direction:column;align-items:center;gap:${gap}px;padding:${gap}px}
    .pg{background:#fff;box-shadow:0 6px 24px rgba(0,0,0,.45);overflow:hidden}
  </style>${pages}`;
}
