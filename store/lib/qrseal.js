// FAMILY SEAL QR — a crest/frame AROUND a standards-compliant QR code, never through it.
//
// This module does not draw QR modules. It validates a seal layout so that whatever encoder
// draws the code, the result stays scannable, and it issues the identifiers that travel with it.
//
// Geometry facts used (ISO/IEC 18004):
//   modules per side   n = 17 + 4v, v = version 1..40
//   quiet zone         ≥ 4 modules on every side (the seal frame starts outside it)
// Capacity table below is byte-mode characters for versions 1–10 (ISO/IEC 18004 Table 7).

export const BYTE_CAPACITY = Object.freeze({
  1: { L: 17, M: 14, Q: 11, H: 7 },
  2: { L: 32, M: 26, Q: 20, H: 14 },
  3: { L: 53, M: 42, Q: 32, H: 24 },
  4: { L: 78, M: 62, Q: 46, H: 34 },
  5: { L: 106, M: 84, Q: 60, H: 44 },
  6: { L: 134, M: 106, Q: 74, H: 58 },
  7: { L: 154, M: 122, Q: 86, H: 64 },
  8: { L: 192, M: 152, Q: 108, H: 84 },
  9: { L: 230, M: 180, Q: 130, H: 98 },
  10: { L: 271, M: 213, Q: 151, H: 119 },
});

export const RULES = Object.freeze({
  quiet_zone_modules_min: 4,
  contrast_ratio_min: 7, // HEURISTIC internal floor (luminance ratio); ISO specifies reflectance, not this ratio
  module_mm_min: 0.5, // HEURISTIC print floor for phone cameras at arm's length
  distance_to_width_max: 10, // HEURISTIC: scan distance ÷ printed code width ≤ 10
  ec_default: 'M', // artwork never covers modules, so M (≈15% recovery) is enough; Q for rough surfaces
});

export const modulesPerSide = (v) => {
  if (!Number.isInteger(v) || v < 1 || v > 40) throw new Error('VERSION_OUT_OF_RANGE');
  return 17 + 4 * v;
};

export function smallestVersion(byteLength, ec) {
  for (let v = 1; v <= 10; v += 1) if (BYTE_CAPACITY[v][ec] >= byteLength) return v;
  return null; // payload too long for v1–10 at this level: shorten the URL, do not raise the version blindly
}

// WCAG relative luminance; used only as a proxy for print/screen contrast.
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`BAD_COLOR:${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(darkHex, lightHex) {
  const a = luminance(darkHex); const b = luminance(lightHex);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Crockford base32 short code with a mod-37 check symbol — readable aloud, no I/L/O/U.
const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CHECK = `${ALPHA}*~$=U`;
export function shortCode(n, length = 6) {
  if (!Number.isInteger(n) || n < 0) throw new Error('BAD_SERIAL');
  let s = ''; let x = n;
  for (let i = 0; i < length; i += 1) { s = ALPHA[x % 32] + s; x = Math.floor(x / 32); }
  if (x > 0) throw new Error('SERIAL_TOO_LARGE');
  return `${s}${CHECK[n % 37]}`;
}
export function verifyShortCode(code) {
  const c = String(code).toUpperCase().replace(/[-\s]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
  const body = c.slice(0, -1); const chk = c.slice(-1);
  let n = 0;
  for (const ch of body) { const d = ALPHA.indexOf(ch); if (d < 0) return { ok: false, reason: 'BAD_SYMBOL' }; n = n * 32 + d; }
  return CHECK[n % 37] === chk ? { ok: true, serial: n } : { ok: false, reason: 'CHECK_MISMATCH' };
}

// Builds the identifiers for one seal. The URL carries only opaque codes — no family name.
export function issueSeal({ family_code, campaign_code, serial, base_url }) {
  if (!/^[A-Z0-9]{3,8}$/.test(family_code)) throw new Error('FAMILY_CODE_FORMAT');
  if (!/^[A-Z0-9]{2,8}$/.test(campaign_code)) throw new Error('CAMPAIGN_CODE_FORMAT');
  const sc = shortCode(serial);
  const url = `${base_url.replace(/\/$/, '')}/s/${sc}`;
  return { family_code, campaign_code, short_code: sc, url, printed_fallback: `${base_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}/s/${sc}` };
}

// Validates a proposed seal layout. Returns every failure at once.
export function validateSeal(layout) {
  const issues = [];
  const add = (code, detail) => issues.push({ code, detail });
  const ec = layout.ec ?? RULES.ec_default;
  const bytes = new TextEncoder().encode(layout.payload_url ?? '').length;
  const v = layout.version ?? smallestVersion(bytes, ec);
  if (!layout.payload_url) add('NO_PAYLOAD', 'Seal needs a destination URL.');
  if (v === null) add('PAYLOAD_TOO_LONG', `${bytes} bytes does not fit v1–10 at ${ec}; use the short-code URL.`);
  else if (BYTE_CAPACITY[v] && BYTE_CAPACITY[v][ec] < bytes) add('VERSION_TOO_SMALL', `v${v}-${ec} holds ${BYTE_CAPACITY[v][ec]} bytes; payload is ${bytes}.`);
  const n = v ? modulesPerSide(v) : null;
  if (!(layout.quiet_zone_modules >= RULES.quiet_zone_modules_min)) add('QUIET_ZONE_TOO_SMALL', `Quiet zone must be ≥ ${RULES.quiet_zone_modules_min} modules; got ${layout.quiet_zone_modules}.`);
  if (layout.art_overlaps_modules) add('ART_THROUGH_MODULES', 'Crest artwork may not cross finder, timing, alignment or data modules.');
  if (layout.frame_inside_quiet_zone) add('FRAME_IN_QUIET_ZONE', 'The seal frame must start outside the quiet zone.');
  if (layout.inverted) add('INVERTED_CODE', 'Dark modules on a light ground only; inverted codes fail on many phone readers.');
  const cr = contrastRatio(layout.dark ?? '#000000', layout.light ?? '#FFFFFF');
  if (cr < RULES.contrast_ratio_min) add('LOW_CONTRAST', `Contrast ${cr.toFixed(2)}:1 is below ${RULES.contrast_ratio_min}:1.`);
  let module_mm = null; let code_mm = null;
  if (n && layout.printed_code_width_mm) {
    module_mm = layout.printed_code_width_mm / n;
    code_mm = layout.printed_code_width_mm;
    if (module_mm < RULES.module_mm_min) add('MODULES_TOO_SMALL', `Module ${module_mm.toFixed(3)} mm < ${RULES.module_mm_min} mm.`);
    if (layout.scan_distance_mm && layout.scan_distance_mm / code_mm > RULES.distance_to_width_max) {
      add('TOO_SMALL_FOR_DISTANCE', `At ${layout.scan_distance_mm} mm the code must be ≥ ${(layout.scan_distance_mm / RULES.distance_to_width_max).toFixed(0)} mm wide.`);
    }
  }
  if (!layout.printed_fallback) add('NO_PRINTED_FALLBACK', 'Print the short URL under the seal for people who cannot scan.');
  if (!layout.destination_identity) add('NO_DESTINATION_IDENTITY', 'The landing page must show who the seal belongs to and the campaign it supports.');
  if (layout.names_family_publicly && !layout.family_consent_ref) add('FAMILY_CONSENT_MISSING', 'Seal names a family publicly without a consent reference.');
  return { ok: issues.length === 0, version: v, ec, modules_per_side: n, payload_bytes: bytes, contrast: Math.round(cr * 100) / 100, module_mm, issues };
}

// A scan witness: proof that a real phone opened the right destination from a printed seal.
export function scanWitness({ short_code, device, os, app, printed_width_mm, distance_mm, lighting, resolved_url, expected_url, at }) {
  const code = verifyShortCode(short_code);
  const pass = code.ok && resolved_url === expected_url;
  return { short_code, device, os, app, printed_width_mm, distance_mm, lighting, resolved_url, expected_url, at, result: pass ? 'PASS' : 'FAIL', reason: pass ? null : (code.ok ? 'WRONG_DESTINATION' : code.reason) };
}
