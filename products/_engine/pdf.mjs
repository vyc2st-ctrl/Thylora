/* THYLORA ARTIFACT ENGINE · v1 · dependency-free PDF writer
   Built for customer-facing THYLORA artifacts: designed vector pages, real
   AcroForm fields, real document metadata, real outlines. No runtime
   dependency, no embedded font, no external asset. Deterministic output for
   a given content + serial + edition date, so a re-access rebuild is
   byte-identical to the copy the customer first received. */

import { deflateSync } from 'node:zlib';
import { glyphWidth } from './metrics.mjs';

const WINANSI = new Map(Object.entries({
  '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94,
  '–': 0x96, '—': 0x97, ' ': 0xa0, '©': 0xa9,
  '°': 0xb0, '·': 0xb7, '×': 0xd7
}));

export function encodeWinAnsi(str) {
  const out = [];
  for (const ch of String(str)) {
    const mapped = WINANSI.get(ch);
    if (mapped !== undefined) { out.push(mapped); continue; }
    const code = ch.codePointAt(0);
    out.push(code <= 0xff ? code : 0x3f); // '?' rather than a silent drop
  }
  return out;
}

export function textWidth(str, font, size, tracking = 0) {
  const codes = encodeWinAnsi(str);
  let w = 0;
  for (const c of codes) w += glyphWidth(font, c);
  return (w * size) / 1000 + tracking * codes.length;
}

export function wrapText(str, font, size, maxWidth, tracking = 0) {
  const lines = [];
  for (const block of String(str).split('\n')) {
    const words = block.split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = line + ' ' + words[i];
      if (textWidth(candidate, font, size, tracking) <= maxWidth) line = candidate;
      else { lines.push(line); line = words[i]; }
    }
    lines.push(line);
  }
  return lines;
}

const pdfString = (str) => {
  const bytes = encodeWinAnsi(str);
  let out = '';
  for (const b of bytes) {
    const ch = String.fromCharCode(b);
    if (ch === '(' || ch === ')' || ch === '\\') out += '\\' + ch;
    else if (b < 32 || b > 126) out += '\\' + b.toString(8).padStart(3, '0');
    else out += ch;
  }
  return '(' + out + ')';
};

/* PDF *text strings* (metadata, field names, outline titles) are written as
   UTF-16BE with a byte-order mark: unambiguous in every reader, unlike the
   PDFDocEncoding guesswork a literal string invites. */
const pdfText = (str) => {
  let hex = 'FEFF';
  for (const ch of String(str)) {
    const cp = ch.codePointAt(0);
    if (cp > 0xffff) {
      const v = cp - 0x10000;
      hex += (0xd800 + (v >> 10)).toString(16).padStart(4, '0').toUpperCase();
      hex += (0xdc00 + (v & 0x3ff)).toString(16).padStart(4, '0').toUpperCase();
    } else {
      hex += cp.toString(16).padStart(4, '0').toUpperCase();
    }
  }
  return '<' + hex + '>';
};

const num = (n) => {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

const rgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => Math.round((parseInt(h.slice(i, i + 2), 16) / 255) * 1000) / 1000);
};

class Page {
  constructor(doc, width, height) {
    this.doc = doc; this.width = width; this.height = height;
    this.ops = []; this.annots = [];
  }
  // y is measured from the TOP of the page throughout this API.
  _y(y) { return this.height - y; }

  fill(hex) { const [r, g, b] = rgb(hex); this.ops.push(`${num(r)} ${num(g)} ${num(b)} rg`); return this; }
  stroke(hex) { const [r, g, b] = rgb(hex); this.ops.push(`${num(r)} ${num(g)} ${num(b)} RG`); return this; }

  rect(x, y, w, h, o = {}) {
    if (o.fill) { this.fill(o.fill); }
    if (o.stroke) { this.stroke(o.stroke); this.ops.push(`${num(o.lineWidth ?? 0.8)} w`); }
    this.ops.push(`${num(x)} ${num(this._y(y + h))} ${num(w)} ${num(h)} re`);
    this.ops.push(o.fill && o.stroke ? 'B' : o.fill ? 'f' : 'S');
    return this;
  }

  roundRect(x, y, w, h, r, o = {}) {
    const k = 0.5523 * r, y0 = this._y(y + h), y1 = this._y(y);
    if (o.fill) this.fill(o.fill);
    if (o.stroke) { this.stroke(o.stroke); this.ops.push(`${num(o.lineWidth ?? 0.8)} w`); }
    this.ops.push(`${num(x + r)} ${num(y0)} m`);
    this.ops.push(`${num(x + w - r)} ${num(y0)} l`);
    this.ops.push(`${num(x + w - r + k)} ${num(y0)} ${num(x + w)} ${num(y0 + r - k)} ${num(x + w)} ${num(y0 + r)} c`);
    this.ops.push(`${num(x + w)} ${num(y1 - r)} l`);
    this.ops.push(`${num(x + w)} ${num(y1 - r + k)} ${num(x + w - r + k)} ${num(y1)} ${num(x + w - r)} ${num(y1)} c`);
    this.ops.push(`${num(x + r)} ${num(y1)} l`);
    this.ops.push(`${num(x + r - k)} ${num(y1)} ${num(x)} ${num(y1 - r + k)} ${num(x)} ${num(y1 - r)} c`);
    this.ops.push(`${num(x)} ${num(y0 + r)} l`);
    this.ops.push(`${num(x)} ${num(y0 + r - k)} ${num(x + r - k)} ${num(y0)} ${num(x + r)} ${num(y0)} c`);
    this.ops.push('h');
    this.ops.push(o.fill && o.stroke ? 'B' : o.fill ? 'f' : 'S');
    return this;
  }

  line(x1, y1, x2, y2, o = {}) {
    this.stroke(o.stroke || '#000000');
    this.ops.push(`${num(o.lineWidth ?? 0.8)} w`);
    if (o.dash) this.ops.push(`[${o.dash.join(' ')}] 0 d`);
    this.ops.push(`${num(x1)} ${num(this._y(y1))} m ${num(x2)} ${num(this._y(y2))} l S`);
    if (o.dash) this.ops.push('[] 0 d');
    return this;
  }

  /* Draws one line of text. y is the BASELINE, from the top of the page. */
  text(str, x, y, o = {}) {
    const font = o.font || 'Helvetica';
    const size = o.size || 10;
    const tracking = o.tracking || 0;
    const width = textWidth(str, font, size, tracking);
    let tx = x;
    if (o.align === 'center') tx = x - width / 2;
    else if (o.align === 'right') tx = x - width;
    const alias = this.doc.useFont(font);
    this.fill(o.color || '#000000');
    this.ops.push('BT');
    this.ops.push(`/${alias} ${num(size)} Tf`);
    if (tracking) this.ops.push(`${num(tracking)} Tc`);
    this.ops.push(`1 0 0 1 ${num(tx)} ${num(this._y(y))} Tm`);
    this.ops.push(`${pdfString(str)} Tj`);
    if (tracking) this.ops.push('0 Tc');
    this.ops.push('ET');
    return width;
  }

  /* Flows wrapped copy. Returns the y just past the last baseline. */
  paragraph(str, x, y, w, o = {}) {
    const font = o.font || 'Helvetica';
    const size = o.size || 10;
    const leading = o.leading || size * 1.42;
    const tracking = o.tracking || 0;
    const lines = wrapText(str, font, size, w, tracking);
    let cy = y;
    for (const line of lines) {
      if (line) this.text(line, o.align === 'center' ? x + w / 2 : x, cy, { ...o, font, size, tracking });
      cy += leading;
    }
    return cy - leading + (o.trailing ?? leading);
  }

  field(name, x, y, w, h, o = {}) {
    this.annots.push({ kind: 'field', name, x, y: this._y(y + h), w, h, ...o });
    return this;
  }
}

export class PDFDoc {
  constructor(meta = {}) {
    this.meta = meta;
    this.pages = [];
    this.fontAliases = new Map();
    this.outlines = [];
  }
  addPage(width, height) { const p = new Page(this, width, height); this.pages.push(p); return p; }
  useFont(name) {
    if (!this.fontAliases.has(name)) this.fontAliases.set(name, 'F' + (this.fontAliases.size + 1));
    return this.fontAliases.get(name);
  }
  bookmark(title, pageIndex) { this.outlines.push({ title, pageIndex }); }

  build() {
    const objects = [];            // 1-indexed body
    const ref = (n) => `${n} 0 R`;
    const put = (body) => { objects.push(body); return objects.length; };
    const reserve = () => { objects.push(null); return objects.length; };
    const set = (id, body) => { objects[id - 1] = body; };

    const catalogId = reserve();
    const pagesId = reserve();
    const pageIds = this.pages.map(() => reserve());

    // Fonts
    const fontIds = new Map();
    for (const [name, alias] of this.fontAliases) {
      fontIds.set(alias, put(`<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`));
    }
    const helvAlias = this.useFont('Helvetica');
    if (!fontIds.has(helvAlias)) {
      fontIds.set(helvAlias, put(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`));
    }
    const fontDict = '<< ' + [...fontIds].map(([alias, id]) => `/${alias} ${ref(id)}`).join(' ') + ' >>';

    // Pages + annotations
    const fieldIds = [];
    this.pages.forEach((page, i) => {
      const raw = Buffer.from(page.ops.join('\n'), 'latin1');
      const packed = deflateSync(raw, { level: 9 });
      const streamId = put({ dict: `<< /Length ${packed.length} /Filter /FlateDecode >>`, stream: packed });
      const annotIds = page.annots.map((a) => {
        const flags = a.multiline ? 4096 : 0;
        const id = put(
          `<< /Type /Annot /Subtype /Widget /FT /Tx /T ${pdfText(a.name)} ` +
          `/TU ${pdfText(a.tooltip || a.name)} /Ff ${flags} /F 4 ` +
          `/Rect [${num(a.x)} ${num(a.y)} ${num(a.x + a.w)} ${num(a.y + a.h)}] ` +
          `/DA ${pdfString(`/${helvAlias} ${a.fontSize || 9} Tf ${a.textColor || '0.10 0.13 0.18'} rg`)} ` +
          `/MK << /BC [] /BG [] >> /P ${ref(pageIds[i])} >>`
        );
        fieldIds.push(id);
        return id;
      });
      set(pageIds[i],
        `<< /Type /Page /Parent ${ref(pagesId)} /MediaBox [0 0 ${num(page.width)} ${num(page.height)}] ` +
        `/Resources << /Font ${fontDict} >> /Contents ${ref(streamId)}` +
        (annotIds.length ? ` /Annots [${annotIds.map(ref).join(' ')}]` : '') + ` >>`);
    });

    set(pagesId, `<< /Type /Pages /Count ${this.pages.length} /Kids [${pageIds.map(ref).join(' ')}] >>`);

    // Outlines
    let outlinesId = null;
    if (this.outlines.length) {
      outlinesId = reserve();
      const itemIds = this.outlines.map(() => reserve());
      this.outlines.forEach((o, i) => {
        const parts = [`/Title ${pdfText(o.title)}`, `/Parent ${ref(outlinesId)}`,
          `/Dest [${ref(pageIds[o.pageIndex])} /Fit]`];
        if (i > 0) parts.push(`/Prev ${ref(itemIds[i - 1])}`);
        if (i < itemIds.length - 1) parts.push(`/Next ${ref(itemIds[i + 1])}`);
        set(itemIds[i], `<< ${parts.join(' ')} >>`);
      });
      set(outlinesId, `<< /Type /Outlines /Count ${itemIds.length} /First ${ref(itemIds[0])} /Last ${ref(itemIds[itemIds.length - 1])} >>`);
    }

    // AcroForm
    let acroId = null;
    if (fieldIds.length) {
      acroId = put(
        `<< /Fields [${fieldIds.map(ref).join(' ')}] /NeedAppearances true ` +
        `/DA ${pdfString(`/${helvAlias} 9 Tf 0.10 0.13 0.18 rg`)} /DR << /Font ${fontDict} >> >>`);
    }

    set(catalogId,
      `<< /Type /Catalog /Pages ${ref(pagesId)} /PageMode ${outlinesId ? '/UseOutlines' : '/UseNone'}` +
      (outlinesId ? ` /Outlines ${ref(outlinesId)}` : '') +
      (acroId ? ` /AcroForm ${ref(acroId)}` : '') +
      ` /ViewerPreferences << /DisplayDocTitle true >> /Lang (en-GB) >>`);

    const m = this.meta;
    const infoId = put(
      `<< /Title ${pdfText(m.title || '')} /Author ${pdfText(m.author || 'THYLORA')} ` +
      `/Subject ${pdfText(m.subject || '')} /Keywords ${pdfText(m.keywords || '')} ` +
      `/Creator ${pdfText(m.creator || 'THYLORA Artifact Engine v1')} ` +
      `/Producer ${pdfText(m.producer || 'THYLORA Artifact Engine v1')} ` +
      `/CreationDate ${pdfString(m.date || 'D:20260922000000Z')} /ModDate ${pdfString(m.date || 'D:20260922000000Z')} >>`);

    // Serialise
    const chunks = [];
    let offset = 0;
    const write = (buf) => { const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'latin1'); chunks.push(b); offset += b.length; };
    write('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n');
    const offsets = [];
    objects.forEach((body, i) => {
      offsets[i] = offset;
      if (body === null) throw new Error('unresolved object ' + (i + 1));
      if (typeof body === 'object' && body.stream) {
        write(`${i + 1} 0 obj\n${body.dict}\nstream\n`);
        write(body.stream);
        write('\nendstream\nendobj\n');
      } else {
        write(`${i + 1} 0 obj\n${body}\nendobj\n`);
      }
    });
    const xrefAt = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const o of offsets) xref += String(o).padStart(10, '0') + ' 00000 n \n';
    write(xref);
    write(`trailer\n<< /Size ${objects.length + 1} /Root ${ref(catalogId)} /Info ${ref(infoId)} ` +
      `/ID [<${(m.id || '').padEnd(32, '0').slice(0, 32)}> <${(m.id || '').padEnd(32, '0').slice(0, 32)}>] >>\n` +
      `startxref\n${xrefAt}\n%%EOF\n`);
    return Buffer.concat(chunks);
  }
}
