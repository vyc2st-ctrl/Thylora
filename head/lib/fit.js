// HEAD · made-to-measure fit. No one-size-fits-all.
// All lengths are millimetres internally (integers) so measurements never drift.

export const MM_PER_IN = 25.4;
export const HEAD_RANGE_MM = Object.freeze({ min: 300, max: 660 }); // newborn to large adult
export const REPEAT_TOLERANCE_MM = 5;                                 // two readings must agree within 5 mm

/**
 * String method: wrap a string around the head across the forehead and above the ears,
 * mark where it meets, lay it on a ruler, send the reading (and a photo).
 * At least two readings are required; they must agree within tolerance.
 */
export function verifyHeadMeasurement({ readings_mm, photo_ref, unit = 'mm' }) {
  const problems = [];
  const factor = unit === 'in' ? MM_PER_IN : unit === 'cm' ? 10 : 1;
  const mm = (readings_mm ?? []).map(r => Math.round(Number(r) * factor));
  if (mm.length < 2) problems.push('TWO_READINGS_REQUIRED');
  if (mm.some(v => !Number.isFinite(v) || v < HEAD_RANGE_MM.min || v > HEAD_RANGE_MM.max)) problems.push('OUT_OF_HUMAN_RANGE');
  if (mm.length >= 2 && Math.max(...mm) - Math.min(...mm) > REPEAT_TOLERANCE_MM) problems.push('READINGS_DISAGREE');
  if (!photo_ref) problems.push('PHOTO_OF_RULER_REQUIRED');
  const head_mm = mm.length ? Math.round(mm.reduce((a, b) => a + b, 0) / mm.length) : null;
  return { verified: problems.length === 0, head_mm, problems };
}

/** US fitted hat size = head circumference (in) ÷ π, to the nearest 1/8. */
export function usHatSize(head_mm) {
  const eighths = Math.round((head_mm / MM_PER_IN / Math.PI) * 8);
  const whole = Math.floor(eighths / 8), rem = eighths % 8;
  const frac = ['', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'][rem];
  return { decimal: eighths / 8, label: frac ? `${whole} ${frac}` : `${whole}` };
}

export const WEARERS = Object.freeze(['WOMAN', 'MAN', 'CHILD', 'BABY']);

/**
 * Nightcap pattern. Inside is always silk (hair). Outside is cotton (pillow).
 * Band is cut slightly under head size so it holds without squeezing; men's caps
 * hold a little firmer; children's are looser. A front fold-up brim carries the logo.
 */
export function nightcapSpec({ head_mm, wearer }) {
  if (!WEARERS.includes(wearer)) throw new Error(`unknown wearer ${wearer}`);
  const gripBp = { WOMAN: 9300, MAN: 9200, CHILD: 9500, BABY: 9700 }[wearer];
  const band_mm = Math.round((head_mm * gripBp) / 10000);
  const crown_depth_mm = Math.round(head_mm * 0.36);
  const brim_fold_mm = wearer === 'BABY' ? 25 : wearer === 'CHILD' ? 35 : 45;
  return {
    wearer, head_mm, band_mm, crown_depth_mm, brim_fold_mm,
    inner: 'SILK (charmeuse, 19 momme minimum)',
    outer: 'COTTON (breathable, colour-fast)',
    brim: { logo: 'little logo + name on the front fold', accent: 'one blue line, partial — not all the way around' },
    // Infant safe-sleep guidance advises nothing loose on a sleeping baby's head.
    sleep_use_allowed: wearer !== 'BABY',
    safety_note: wearer === 'BABY' ? 'BABY size is awake / supervised wear only. Not for unsupervised sleep.' : null
  };
}

// Ease added to the body measurement, by how the person wants it to fit.
export const EASE_MM = Object.freeze({ TIGHT: 20, SNUG: 50, REGULAR: 100, RELAXED: 150, BAGGY: 250 });

/** Shirt spec from the body, not from a letter size. "2X" is never sent to a maker. */
export function shirtSpec({ chest_mm, waist_mm, body_length_mm, sleeve_mm, fit }) {
  const ease = EASE_MM[fit];
  if (ease === undefined) throw new Error(`unknown fit ${fit}`);
  const toIn = v => Math.round((v / MM_PER_IN) * 4) / 4;
  const finished = {
    chest_mm: chest_mm + ease,
    waist_mm: waist_mm + ease,
    length_mm: body_length_mm,
    sleeve_mm
  };
  return {
    fit, ease_mm: ease, finished_mm: finished,
    finished_in: Object.fromEntries(Object.entries(finished).map(([k, v]) => [k.replace('_mm', '_in'), toIn(v)])),
    maker_instruction: `Cut to finished measurements. Tolerance ±6 mm. Do not substitute a letter size.`
  };
}
