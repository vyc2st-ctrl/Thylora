/* THYLORA ARTIFACT ENGINE · structural probe.
   Opens a built PDF the way a reader does: header, cross-reference table,
   every object at its stated offset, trailer, page tree, form fields,
   metadata. Used by the test suite so "the artifact opens" is a check,
   not a claim. */

import { inflateSync } from 'node:zlib';

function decodeUtf16Hex(hex) {
  if (!hex.toUpperCase().startsWith('FEFF')) return '';
  let out = '';
  for (let i = 4; i + 3 < hex.length; i += 4) out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
  return out;
}

export function probePdf(buf) {
  const text = buf.toString('latin1');
  const out = { bytes: buf.length, errors: [] };

  if (!text.startsWith('%PDF-1.')) out.errors.push('missing PDF header');
  if (!text.trimEnd().endsWith('%%EOF')) out.errors.push('missing EOF marker');
  out.version = text.slice(5, 8);

  const sx = text.lastIndexOf('startxref');
  if (sx < 0) { out.errors.push('no startxref'); return out; }
  const xrefAt = parseInt(text.slice(sx + 9).trim(), 10);
  if (!(xrefAt > 0 && xrefAt < buf.length)) { out.errors.push('bad startxref offset'); return out; }
  if (!text.startsWith('xref', xrefAt)) out.errors.push('startxref does not point at an xref table');

  const header = text.slice(xrefAt, xrefAt + 64).split(/\r?\n/);
  const count = parseInt(header[1].split(/\s+/)[1], 10);
  out.objects = count - 1;

  // every offset must land on "<n> 0 obj"
  const entries = text.slice(xrefAt).split(/\r?\n/).slice(2, 2 + count);
  entries.forEach((line, i) => {
    if (i === 0) return; // free head
    const off = parseInt(line.slice(0, 10), 10);
    if (!text.startsWith(`${i} 0 obj`, off)) out.errors.push(`object ${i} not at its xref offset`);
  });

  const trailer = text.slice(text.lastIndexOf('trailer'));
  const root = trailer.match(/\/Root (\d+) 0 R/);
  const info = trailer.match(/\/Info (\d+) 0 R/);
  if (!root) out.errors.push('trailer has no /Root');
  if (!info) out.errors.push('trailer has no /Info');
  const size = trailer.match(/\/Size (\d+)/);
  if (size && Number(size[1]) !== count) out.errors.push('trailer /Size disagrees with xref count');

  const obj = (n) => {
    const at = text.indexOf(`\n${n} 0 obj`);
    if (at < 0) return '';
    return text.slice(at, text.indexOf('endobj', at));
  };

  const catalog = root ? obj(Number(root[1])) : '';
  const pagesRef = catalog.match(/\/Pages (\d+) 0 R/);
  const pagesObj = pagesRef ? obj(Number(pagesRef[1])) : '';
  out.pageCount = Number((pagesObj.match(/\/Count (\d+)/) || [0, 0])[1]);
  out.hasOutlines = /\/Outlines \d+ 0 R/.test(catalog);
  out.hasAcroForm = /\/AcroForm \d+ 0 R/.test(catalog);
  out.displayDocTitle = /\/DisplayDocTitle true/.test(catalog);

  const acroRef = catalog.match(/\/AcroForm (\d+) 0 R/);
  out.fieldCount = 0;
  if (acroRef) {
    const acro = obj(Number(acroRef[1]));
    const fields = acro.match(/\/Fields \[([^\]]*)\]/);
    out.fieldCount = fields ? (fields[1].match(/\d+ 0 R/g) || []).length : 0;
    out.needAppearances = /\/NeedAppearances true/.test(acro);
  }

  // media boxes
  out.mediaBoxes = [...text.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)]
    .map((m) => [Number(m[1]), Number(m[2])]);

  // every content stream must inflate
  out.streams = 0;
  const re = /<< \/Length (\d+) \/Filter \/FlateDecode >>\nstream\n/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length;
    const slice = buf.subarray(start, start + Number(m[1]));
    try { inflateSync(slice); out.streams++; }
    catch { out.errors.push('content stream at ' + start + ' does not inflate'); }
  }

  const infoObj = info ? obj(Number(info[1])) : '';
  const grab = (key) => {
    const hex = infoObj.match(new RegExp('/' + key + ' <([0-9A-Fa-f]*)>'));
    if (hex) return decodeUtf16Hex(hex[1]);
    const lit = infoObj.match(new RegExp('/' + key + ' \\(((?:[^()\\\\]|\\\\.)*)\\)'));
    return lit ? lit[1].replace(/\\([()\\])/g, '$1') : '';
  };
  out.title = grab('Title');
  out.author = grab('Author');
  out.keywords = grab('Keywords');
  out.subject = grab('Subject');

  // text actually present, per page, decoded from the streams
  out.text = decodeAllText(buf, text);
  return out;
}

function decodeAllText(buf, text) {
  const chunks = [];
  const re = /<< \/Length (\d+) \/Filter \/FlateDecode >>\nstream\n/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length;
    try {
      const body = inflateSync(buf.subarray(start, start + Number(m[1]))).toString('latin1');
      const shown = [...body.matchAll(/\(((?:[^()\\]|\\.)*)\) Tj/g)]
        .map((x) => x[1].replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
          .replace(/\\([()\\])/g, '$1'));
      chunks.push(shown.join(' '));
    } catch { /* reported by the caller's stream check */ }
  }
  return chunks;
}
