// THY-SHIRT-FIRST-001 art generator. Deterministic: same input -> same bytes.
// Writes print SVGs + mockup SVGs into OUT. No network, no backend.
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2] || '/home/user/Thylora/spine-594/first-shirt';
const SCR = __dirname;

const INK = '#ECE4D2';        // single print colour ("bone" ink) for a black blank
const MONO = "'DejaVu Sans Mono','Liberation Mono',monospace";
const SERIF = "'Liberation Serif','DejaVu Serif',serif";
const f = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

// ---------- geometry of the mark (300 dpi, 3600 x 4800 = 12 x 16 in) ----------
const C = [1800, 1450];   // compass centre of the hook (the vault's setting-out point)
const R = 1000;           // centreline radius
const SW = 440;           // stone depth (stroke width)
const A0 = 165, A1 = 390; // hook sweeps 165deg -> 30deg (through the crown at 270)
const D = [1800, 3900];   // aperture (dot) centre
const STEM_TOP = 2750, STEM_BOT = 3140;

function hookPath() {
  const [sx, sy] = pt(C[0], C[1], R, A0);
  const [ex, ey] = pt(C[0], C[1], R, A1);
  const t = [-Math.sin(rad(A1)), Math.cos(rad(A1))];
  const c1 = [ex + t[0] * 420, ey + t[1] * 420];
  const c2 = [1800, 2380];
  return `M${f(sx)} ${f(sy)} A${R} ${R} 0 1 1 ${f(ex)} ${f(ey)} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} 1800 ${STEM_TOP} L1800 ${STEM_BOT}`;
}
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0];
  const y = u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1];
  const dx = 3*u*u*(p1[0]-p0[0]) + 6*u*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0]);
  const dy = 3*u*u*(p1[1]-p0[1]) + 6*u*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1]);
  const l = Math.hypot(dx, dy);
  return { x, y, nx: -dy / l, ny: dx / l };
}
// masonry joints knocked out of the hook: voussoirs on the arc, coursed ashlar on the stem
function joints() {
  const L = [];
  const half = SW / 2 + 14;
  for (let a = A0 + 13; a < A1 - 4; a += 12.5) {
    const [x1, y1] = pt(C[0], C[1], R - half, a);
    const [x2, y2] = pt(C[0], C[1], R + half, a);
    L.push(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  }
  const [ex, ey] = pt(C[0], C[1], R, A1);
  const t = [-Math.sin(rad(A1)), Math.cos(rad(A1))];
  const p0 = [ex, ey], p1 = [ex + t[0] * 420, ey + t[1] * 420], p2 = [1800, 2380], p3 = [1800, STEM_TOP];
  for (const tt of [0.22, 0.46, 0.7, 0.92]) {
    const b = bez(p0, p1, p2, p3, tt);
    L.push(`M${f(b.x - b.nx * half)} ${f(b.y - b.ny * half)}L${f(b.x + b.nx * half)} ${f(b.y + b.ny * half)}`);
  }
  // ashlar courses on the stem, half-bond vertical joints
  let k = 0;
  for (let y = STEM_TOP + 130; y < STEM_BOT; y += 130, k++) {
    L.push(`M${1800 - half} ${y}L${1800 + half} ${y}`);
  }
  const vx = [1800 - 70, 1800 + 90];
  let yy = STEM_TOP, i = 0;
  while (yy < STEM_BOT) {
    const y2 = Math.min(yy + 130, STEM_BOT);
    L.push(`M${vx[i % 2]} ${yy}L${vx[i % 2]} ${y2}`);
    yy += 130; i++;
  }
  return L.join('');
}

// ---------- the world fragment: Royal Kitchen hearth wall, seen through the aperture ----------
// Source: WR-WORLD-WINDOW-583 §4, §10, §11 (SCENE-WW-001-ROYAL-KITCHEN-20260922, PROPOSED).
// Drawn in local coords centred on (0,0), interior radius 405.
function kitchen(id) {
  const s = [];
  const L = (d, w = 12, extra = '') => s.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`);
  // barrel vault line above the window band (EA-RK-STRUCT-VAULT)
  L('M-420 -250 Q0 -470 420 -250', 12);
  L('M-420 -215 Q0 -430 420 -215', 7, 'stroke-dasharray="26 22"');
  // high window band, five panes, pane 4 older than its neighbours (EA-RK-WIN-001)
  const wx0 = -300, pw = 120, wy0 = -330, wy1 = -205;
  L(`M${wx0} ${wy1}V${wy0}H${wx0 + 5 * pw}V${wy1}Z`, 16);
  for (let i = 1; i < 5; i++) L(`M${wx0 + i * pw} ${wy0}V${wy1}`, 12);
  L(`M${wx0} ${(wy0 + wy1) / 2}H${wx0 + 5 * pw}`, 7);
  // the one mismatched pane: hatched
  const hx = wx0 + 3 * pw;
  s.push(`<clipPath id="${id}-pane"><rect x="${hx + 8}" y="${wy0 + 8}" width="${pw - 16}" height="${wy1 - wy0 - 16}"/></clipPath>`);
  const hatch = [];
  for (let k = -200; k < 200; k += 22) hatch.push(`M${hx + k} ${wy1}L${hx + k + 125} ${wy0}`);
  s.push(`<path d="${hatch.join('')}" stroke="${INK}" stroke-width="7" clip-path="url(#${id}-pane)"/>`);
  // ashlar courses of the hearth wall (EA-RK-STRUCT-WALL)
  for (const y of [-150, -75]) L(`M-420 ${y}H420`, 7);
  for (const [x, y] of [[-330, -150], [-120, -150], [90, -150], [300, -150], [-230, -75], [200, -75]]) L(`M${x} ${y}V${y + 75}`, 7);
  // live hearth: segmental arch mouth (EA-RK-HC-001)
  L('M-250 300V40 Q-50 -70 150 40V300', 18);
  L('M-280 300V30 Q-50 -105 180 30V300', 9);
  for (let a = 0; a <= 8; a++) {
    const t = a / 8;
    const x = (1 - t) * (1 - t) * -265 + 2 * (1 - t) * t * -50 + t * t * 165;
    const y = (1 - t) * (1 - t) * 35 + 2 * (1 - t) * t * -88 + t * t * 35;
    L(`M${f(x)} ${f(y)}l0 -22`, 8);
  }
  // coal bed, even, no flame above the bed
  let coals = 'M-235 285';
  for (let x = -235; x < 135; x += 37) coals += ` q18 -30 37 0`;
  L(coals, 10);
  // iron crane swung half out, one pot hung, lid off
  L('M-225 290V70', 14);
  L('M-225 85L35 125', 14);
  L('M-225 170L-40 118', 8);
  L('M30 125V165', 8);
  L('M-30 170H90 Q95 250 30 262 Q-35 250 -30 170Z', 14);
  L('M-38 170H98', 10);
  // thin steam above the pot
  L('M20 150 q-18 -30 0 -60 q18 -30 0 -60', 7, 'stroke-dasharray="18 16"');
  // smoke column rising then bending toward the room because the east door is open
  L('M-120 250 C-140 120 -60 60 -80 -20 C-95 -95 60 -120 260 -130', 9);
  L('M-80 250 C-100 140 -20 80 -35 5 C-45 -60 90 -85 300 -95', 9, 'stroke-dasharray="30 18"');
  // banked second hearth: cold, raked (EA-RK-HC-002) + ash bucket (EA-RK-IR-0031)
  L('M205 300V150 Q290 95 375 150V300', 14);
  for (const y of [255, 275]) L(`M222 ${y}H358`, 7);
  L('M235 300l12 -60h60l12 60', 10);
  L('M245 240h72', 8);
  // floor: worn slabs, dished along the hearth-to-table walking line (EA-RK-STRUCT-FLOOR)
  L('M-420 300H420', 14);
  for (const [x1, x2] of [[-300, -420], [-100, -170], [100, 90], [300, 370]]) L(`M${x1} 300L${x2} 420`, 7);
  L('M-420 360H420', 7);
  L('M-60 300 Q10 345 40 420', 8, 'stroke-dasharray="20 16"');
  return s.join('');
}

// ---------- aperture: the dot as a world window ----------
function aperture(id, withText = true) {
  const [dx, dy] = D;
  const s = [];
  s.push(`<clipPath id="${id}-clip"><circle cx="0" cy="0" r="405"/></clipPath>`);
  s.push(`<g transform="translate(${dx} ${dy})">`);
  s.push(`<g clip-path="url(#${id}-clip)">${kitchen(id)}</g>`);
  s.push(`<circle r="440" fill="none" stroke="${INK}" stroke-width="64"/>`);
  s.push(`<circle r="505" fill="none" stroke="${INK}" stroke-width="9"/>`);
  const ticks = [];
  for (let a = 0; a < 360; a += 5) {
    const long = a % 30 === 0;
    const [x1, y1] = pt(0, 0, 505, a);
    const [x2, y2] = pt(0, 0, long ? 470 : 486, a);
    ticks.push(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  }
  s.push(`<path d="${ticks.join('')}" stroke="${INK}" stroke-width="8"/>`);
  if (withText) {
    s.push(`<path id="${id}-ring" d="M -560 0 A 560 560 0 1 1 560 0 A 560 560 0 1 1 -560 0" fill="none"/>`);
    s.push(`<text font-family="${MONO}" font-size="44" letter-spacing="6" fill="${INK}"><textPath href="#${id}-ring" startOffset="2%">WINDOW EA-RK-WIN-001 · ROYAL KITCHEN · UPPER COURT · EDEREAIRAH · ONE PANE OLDER THAN ITS NEIGHBOURS ·</textPath></text>`);
  }
  s.push('</g>');
  return s.join('');
}

// ---------- construction layer: question thinking, etched ----------
function construction() {
  const s = [];
  const L = (d, w = 9, extra = '') => s.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`);
  // setting-out circle beyond the extrados
  const RO = R + SW / 2 + 95;
  const [ax, ay] = pt(C[0], C[1], RO, 120);
  const [bx, by] = pt(C[0], C[1], RO, 60);
  L(`M${f(ax)} ${f(ay)}A${RO} ${RO} 0 1 1 ${f(bx)} ${f(by)}`, 9, 'stroke-dasharray="44 30"');
  // compass point at the centre + crosshair
  s.push(`<circle cx="${C[0]}" cy="${C[1]}" r="28" fill="none" stroke="${INK}" stroke-width="9"/>`);
  L(`M${C[0] - 110} ${C[1]}H${C[0] + 110}M${C[0]} ${C[1] - 110}V${C[1] + 110}`, 9);
  // radius arm to the extrados, upper right, with its dimension
  const [rx, ry] = pt(C[0], C[1], R + SW / 2, 312);
  L(`M${C[0]} ${C[1]}L${f(rx)} ${f(ry)}`, 8, 'stroke-dasharray="16 14"');
  s.push(`<text x="${C[0] + 150}" y="${C[1] - 60}" font-family="${MONO}" font-size="46" letter-spacing="4" fill="${INK}" transform="rotate(-48 ${C[0] + 150} ${C[1] - 60})">R = 4.07 IN</text>`);
  s.push(`<text x="${C[0]}" y="${C[1] + 200}" text-anchor="middle" font-family="${MONO}" font-size="46" letter-spacing="6" fill="${INK}">SET OUT FROM THE VAULT</text>`);
  s.push(`<text x="${C[0]}" y="${C[1] + 262}" text-anchor="middle" font-family="${MONO}" font-size="38" letter-spacing="6" fill="${INK}">EA-RK-STRUCT-VAULT · CASTLE MASONS' LODGE</text>`);
  // the question's axis: centre line through hook crown, stem and aperture
  L(`M1800 120V${C[1] - 140}`, 8, 'stroke-dasharray="60 20 10 20"');
  L(`M1800 ${C[1] + 300}V${STEM_TOP - 40}`, 8, 'stroke-dasharray="60 20 10 20"');
  L(`M1800 ${STEM_BOT + 40}V${D[1] - 560}`, 8, 'stroke-dasharray="60 20 10 20"');
  // terminal springer mark at the hook's open end + question tally
  const [tx, ty] = pt(C[0], C[1], R, A0);
  L(`M${f(tx - 250)} ${f(ty + 70)}H${f(tx + 250)}`, 9);
  s.push(`<text x="${f(tx)}" y="${f(ty + 150)}" text-anchor="middle" font-family="${MONO}" font-size="40" letter-spacing="5" fill="${INK}">SPRINGER · Q.001</text>`);
  // measuring rule down the left margin, 1/4 in ticks, inches numbered
  const X = 250;
  L(`M${X} 300V4500`, 9);
  const t = [];
  for (let i = 0, y = 300; y <= 4500; y += 75, i++) {
    const len = i % 4 === 0 ? 70 : i % 2 === 0 ? 45 : 28;
    t.push(`M${X} ${y}h${len}`);
    if (i % 4 === 0) s.push(`<text x="${X + 90}" y="${y + 14}" font-family="${MONO}" font-size="38" fill="${INK}">${i / 4}</text>`);
  }
  L(t.join(''), 8);
  return s.join('');
}

function relations(y) {
  return `<text x="1800" y="${y}" text-anchor="middle" font-family="${MONO}" font-size="50" letter-spacing="7" fill="${INK}">PUBLISHED BY ErsatzReality   ·   COMMISSIONED BY VYC2ST</text>`;
}

// THYLORA mark slot: guide only, hidden in print files, visible in previews/mockups
function thyloraSlot(x, y, w, h, visible) {
  return `<g id="GUIDE-NONPRINT-THYLORA-MARK-SLOT" ${visible ? '' : 'display="none"'}>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#E0403A" stroke-width="10" stroke-dasharray="36 22"/>
  <text x="${x + w / 2}" y="${y + h / 2 - 12}" text-anchor="middle" font-family="${MONO}" font-size="40" fill="#E0403A">THYLORA MARK — SLOT EMPTY</text>
  <text x="${x + w / 2}" y="${y + h / 2 + 46}" text-anchor="middle" font-family="${MONO}" font-size="32" fill="#E0403A">BLOCKED · NOT_APPROVED · NO FILE</text>
</g>`;
}

function frontArt(id, guides) {
  return `<defs><mask id="${id}-joints" maskUnits="userSpaceOnUse" x="0" y="0" width="3600" height="4800">
  <rect width="3600" height="4800" fill="#fff"/>
  <path d="${joints()}" stroke="#000" stroke-width="18" stroke-linecap="butt"/>
</mask></defs>
<g id="LAYER-CONSTRUCTION">${construction()}</g>
<g id="LAYER-QUESTION-MARK" mask="url(#${id}-joints)"><path d="${hookPath()}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="butt" stroke-linejoin="round"/></g>
<g id="LAYER-WORLD-WINDOW">${aperture(id)}</g>
<g id="LAYER-RELATIONS">${relations(4620)}</g>
${thyloraSlot(2560, 4300, 820, 150, guides)}`;
}

function backArt(id, guides) {
  const s = [];
  s.push(`<text x="1800" y="640" text-anchor="middle" font-family="${SERIF}" font-weight="bold" font-size="190" letter-spacing="6" fill="${INK}">WHOSE KNIFE IS THAT,</text>`);
  s.push(`<text x="1800" y="870" text-anchor="middle" font-family="${SERIF}" font-weight="bold" font-size="190" letter-spacing="6" fill="${INK}">AND WHERE DOES IT SLEEP?</text>`);
  // small aperture seal: same window band, same mismatched pane
  s.push(`<g transform="translate(1800 1230) scale(0.42)"><clipPath id="${id}-sclip"><circle r="405"/></clipPath><g clip-path="url(#${id}-sclip)">${kitchen(id + 's')}</g><circle r="440" fill="none" stroke="${INK}" stroke-width="64"/></g>`);
  s.push(`<path d="M600 1500H1480M2120 1500H3000" stroke="${INK}" stroke-width="9"/>`);
  const lines = [
    'ERM-SHIRT-LS-QMARKWINDOW-R001 · SAMPLE',
    'WINDOW EA-RK-WIN-001 · ROYAL KITCHEN · UPPER COURT · EDEREAIRAH',
    'THE KNIFE: EA-RK-KN-0114 · LOCKED_TO ITS USER · RETURNS TO BOX EA-RK-BX-0114',
  ];
  lines.forEach((t, i) => s.push(`<text x="1800" y="${1640 + i * 90}" text-anchor="middle" font-family="${MONO}" font-size="52" letter-spacing="5" fill="${INK}">${t}</text>`));
  s.push(relations(1980));
  s.push(thyloraSlot(1390, 2060, 820, 150, guides));
  return s.join('');
}

function neckArt(id) {
  // 3 x 3 in inner-neck carrier (MERCH-SHIRT class serial carrier = inner neck print)
  return `<g transform="translate(450 330) scale(0.5)"><clipPath id="${id}-nclip"><circle r="405"/></clipPath><g clip-path="url(#${id}-nclip)">${kitchen(id + 'n')}</g><circle r="440" fill="none" stroke="${INK}" stroke-width="64"/></g>
<text x="450" y="660" text-anchor="middle" font-family="${MONO}" font-size="40" fill="${INK}">ERM-SHIRT-LS-QMARKWINDOW-R001</text>
<text x="450" y="730" text-anchor="middle" font-family="${MONO}" font-size="40" letter-spacing="4" fill="${INK}">VYC2ST · ErsatzReality</text>
<text x="450" y="800" text-anchor="middle" font-family="${MONO}" font-size="30" fill="${INK}">BELLA+CANVAS 3001 · DTG</text>`;
}

const head = (w, h, title, extra = '') => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${extra}>
<title>${title}</title>`;

const PROV = `<metadata>THY-SHIRT-FIRST-001 · THY-WORK-QUESTIONMARK-SHIRT-594 · generated 2026-09-24 by Claude Code (THYLORA session) from constructed vector geometry only · single ink ${INK} · approval_state AWAITING_CHAIRMAN_APPROVAL · order_placed false</metadata>`;

function printFile(name, title, body, w = 3600, h = 4800, win = '12in', hin = '16in') {
  const svg = `${head(w, h, title)}\n${PROV}\n${body}\n</svg>\n`;
  return svg.replace(`width="${w}" height="${h}"`, `width="${win}" height="${hin}"`);
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'front.svg'), printFile('front', 'THY-SHIRT-FIRST-001 front print — 12x16 in @300dpi', frontArt('f', false)));
fs.writeFileSync(path.join(OUT, 'back.svg'), printFile('back', 'THY-SHIRT-FIRST-001 back print — 12x16 in @300dpi', backArt('b', false)));
fs.writeFileSync(path.join(OUT, 'sleeve-or-hem.svg'), printFile('neck', 'THY-SHIRT-FIRST-001 inner-neck detail — 3x3 in @300dpi (optional)', neckArt('n'), 900, 900, '3in', '3in'));

// preview (guide layer visible) on a dark field
fs.writeFileSync(path.join(SCR, 'front-preview.svg'), `${head(3600, 4800, 'front preview')}<rect width="3600" height="4800" fill="#141312"/><rect x="0" y="0" width="3600" height="4800" fill="none" stroke="#555" stroke-width="6" stroke-dasharray="30 20"/>${frontArt('p', true)}</svg>`);
fs.writeFileSync(path.join(SCR, 'front-print.svg'), `${head(3600, 4800, 'front print raster source')}${frontArt('q', false)}</svg>`);
fs.writeFileSync(path.join(SCR, 'back-print.svg'), `${head(3600, 4800, 'back print raster source')}${backArt('r', false)}</svg>`);

// ---------- mockups: flat garments to the Bella+Canvas 3001 spec sheet ----------
const SIZES = {
  '2XL': { chest: 26, length: 32 },
  '3XL': { chest: 28, length: 33 },
};
const PA = { w: 12, h: 16 }; // print area in inches (UNVERIFIED for Printful 3001 — see provenance sheet)
function garment(S, W, Lg, back) {
  // inches -> px; origin = HPS centre. Silhouette APPROXIMATE except chest width and body length.
  const hw = W / 2, nw = 3.9, sw = hw + 0.9, ah = 10.2;
  const drop = back ? 0.9 : 3.3;
  const P = (x, y) => `${f(x * S)} ${f(y * S)}`;
  const body = `M${P(-nw, 0)} L${P(-sw, 1.7)} L${P(-sw - 7.4, 7.2)} L${P(-sw - 4.9, 11.2)} L${P(-hw, ah)} L${P(-hw, Lg)} Q${P(0, Lg + 0.35)} ${P(hw, Lg)} L${P(hw, ah)} L${P(sw + 4.9, 11.2)} L${P(sw + 7.4, 7.2)} L${P(sw, 1.7)} L${P(nw, 0)} Q${P(0, drop * 2 - 0.2)} ${P(-nw, 0)} Z`;
  const rib = `M${P(-nw, 0)} Q${P(0, drop * 2 - 0.2)} ${P(nw, 0)} M${P(-nw - 0.3, 0.55)} Q${P(0, drop * 2 + 0.9)} ${P(nw + 0.3, 0.55)}`;
  return { body, rib, drop };
}
function mockup(size) {
  const { chest, length } = SIZES[size];
  const S = 36; // px per inch
  const gw = (chest / 2 + 0.9 + 7.4) * 2 * S;
  const W = Math.round(gw * 2 + 3 * 200), H = Math.round((length + 9) * S + 260);
  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="#E8E4DC"/>`);
  parts.push(`<text x="60" y="80" font-family="${MONO}" font-size="34" fill="#1d1b19">THY-SHIRT-FIRST-001 · MOCKUP ${size} · FRONT + BACK · FLAT · 1 in = ${S} px</text>`);
  parts.push(`<text x="60" y="126" font-family="${MONO}" font-size="24" fill="#1d1b19">Bella+Canvas 3001 spec sheet: ${size} chest (flat width) ${chest} in, body length from HPS ${length} in · print at Printful max front area ${PA.w}x${PA.h} in (area UNVERIFIED) · silhouette other than chest/length approximate</text>`);
  parts.push(`<text x="60" y="160" font-family="${MONO}" font-size="24" fill="#B3261E">AWAITING_CHAIRMAN_APPROVAL · order_placed=false · red dashed = non-printing guides (print area, THYLORA slot BLOCKED)</text>`);
  const top = 230;
  ['FRONT', 'BACK'].forEach((side, i) => {
    const cx = 200 + gw / 2 + i * (gw + 200);
    const g = garment(S, chest, length, side === 'BACK');
    const art = side === 'FRONT' ? frontArt(`m${size}f`, true) : backArt(`m${size}b`, true);
    const artTop = side === 'FRONT' ? 3.5 : 1.8; // inches below HPS
    parts.push(`<g transform="translate(${f(cx)} ${top})">`);
    parts.push(`<path d="${g.body}" fill="#151515" stroke="#000" stroke-width="3"/>`);
    parts.push(`<path d="${g.rib}" fill="none" stroke="#2b2b2b" stroke-width="5"/>`);
    parts.push(`<svg x="${f(-PA.w / 2 * S)}" y="${f(artTop * S)}" width="${PA.w * S}" height="${PA.h * S}" viewBox="0 0 3600 4800" overflow="visible">${art}</svg>`);
    parts.push(`<rect x="${f(-PA.w / 2 * S)}" y="${f(artTop * S)}" width="${PA.w * S}" height="${PA.h * S}" fill="none" stroke="#E0403A" stroke-width="2" stroke-dasharray="8 6"/>`);
    // dimensions
    const yb = (length + 1.6) * S;
    parts.push(`<path d="M${f(-chest / 2 * S)} ${f(yb)}H${f(chest / 2 * S)}M${f(-chest / 2 * S)} ${f(yb - 12)}v24M${f(chest / 2 * S)} ${f(yb - 12)}v24" stroke="#1d1b19" stroke-width="3"/>`);
    parts.push(`<text x="0" y="${f(yb + 40)}" text-anchor="middle" font-family="${MONO}" font-size="26" fill="#1d1b19">${side} · chest ${chest} in · print area ${PA.w} in = ${Math.round(PA.w / chest * 100)}% of chest</text>`);
    const xl = (chest / 2 + 1.2) * S;
    parts.push(`<path d="M${f(xl)} 0V${f(length * S)}M${f(xl - 12)} 0h24M${f(xl - 12)} ${f(length * S)}h24" stroke="#1d1b19" stroke-width="3"/>`);
    parts.push(`<text x="${f(xl + 16)}" y="${f(length * S / 2)}" font-family="${MONO}" font-size="24" fill="#1d1b19" transform="rotate(90 ${f(xl + 16)} ${f(length * S / 2)})">length ${length} in (HPS)</text>`);
    if (side === 'FRONT') {
      const q0 = artTop + 230 / 300, q1 = artTop + 4370 / 300;
      const xq = -(PA.w / 2 + 0.6) * S;
      parts.push(`<path d="M${f(xq)} ${f(q0 * S)}V${f(q1 * S)}M${f(xq - 10)} ${f(q0 * S)}h20M${f(xq - 10)} ${f(q1 * S)}h20" stroke="#E0403A" stroke-width="3"/>`);
      parts.push(`<text x="${f(xq - 14)}" y="${f((q0 + q1) / 2 * S)}" text-anchor="middle" font-family="${MONO}" font-size="24" fill="#E0403A" transform="rotate(-90 ${f(xq - 14)} ${f((q0 + q1) / 2 * S)})">? ${((4370 - 230) / 300).toFixed(1)} in tall (${Math.round((4140 / 300) / length * 100)}% of length)</text>`);
    }
    parts.push('</g>');
  });
  return `${head(W, H, `THY-SHIRT-FIRST-001 mockup ${size}`)}\n${PROV}\n${parts.join('\n')}\n</svg>\n`;
}
for (const s of Object.keys(SIZES)) fs.writeFileSync(path.join(OUT, `mockup-${s}.svg`), mockup(s));
console.log('ok');
