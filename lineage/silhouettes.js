// THE ROOT HOUSE · silhouette builder
// Each researcher is assembled from separate parts (build, posture, hair or
// headwear, prop), so nine people read as nine people even in pure black.

const BUILD = { petite: 13, medium: 16, tall_lean: 13, broad: 21, round: 22 };

function hair(kind, cx, cy, r) {
  switch (kind) {
    case 'gray_afro':   return `<circle cx="${cx}" cy="${cy - 2}" r="${r + 6}"/>`;
    case 'high_puff':   return `<circle cx="${cx}" cy="${cy - r - 6}" r="${r * 0.9}"/><rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${r}" rx="${r / 2}"/>`;
    case 'locs_long':   return [-r, -r / 2, r / 2, r].map((dx, i) => `<rect x="${cx + dx - 1.6}" y="${cy - r + 2}" width="3.2" height="${22 + i * 2}" rx="1.6"/>`).join('') + `<circle cx="${cx}" cy="${cy - 2}" r="${r + 2}"/>`;
    case 'braids_bun':  return `<circle cx="${cx}" cy="${cy - r - 4}" r="${r * 0.6}"/><circle cx="${cx}" cy="${cy - 1}" r="${r + 1.5}"/>`;
    case 'pressed_bob': return `<path d="M${cx - r - 3} ${cy + r} Q${cx - r - 4} ${cy - r - 4} ${cx} ${cy - r - 3} Q${cx + r + 4} ${cy - r - 4} ${cx + r + 3} ${cy + r} Z"/>`;
    case 'short_fade':  return `<rect x="${cx - r}" y="${cy - r - 2}" width="${2 * r}" height="${r}" rx="3"/>`;
    case 'gray_short':  return `<rect x="${cx - r}" y="${cy - r - 1}" width="${2 * r}" height="${r * 0.8}" rx="4"/>`;
    default: return '';
  }
}

function headwear(kind, cx, cy, r) {
  switch (kind) {
    case 'headwrap':   return `<path d="M${cx - r - 2} ${cy} Q${cx - r} ${cy - r * 2.4} ${cx + 2} ${cy - r * 2.2} Q${cx + r + 6} ${cy - r * 1.6} ${cx + r + 2} ${cy} Z"/>`;
    case 'flat_cap':   return `<path d="M${cx - r - 1} ${cy - r / 3} Q${cx} ${cy - r * 1.8} ${cx + r + 1} ${cy - r / 3} L${cx + r + 8} ${cy - r / 4} L${cx + r} ${cy} Z"/>`;
    case 'church_hat': return `<ellipse cx="${cx}" cy="${cy - r * 0.6}" rx="${r * 2.1}" ry="3"/><path d="M${cx - r} ${cy - r * 0.6} Q${cx} ${cy - r * 2.3} ${cx + r} ${cy - r * 0.6} Z"/><circle cx="${cx + r * 1.2}" cy="${cy - r * 1.2}" r="2.5"/>`;
    case 'brim_hat':   return `<ellipse cx="${cx}" cy="${cy - r * 0.7}" rx="${r * 1.7}" ry="2.5"/><rect x="${cx - r * 0.85}" y="${cy - r * 1.9}" width="${r * 1.7}" height="${r * 1.3}" rx="2"/>`;
    default: return '';
  }
}

function prop(kind, x, y) {
  switch (kind) {
    case 'magnifier':  return `<circle cx="${x + 6}" cy="${y - 6}" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="${x}" y="${y - 2}" width="2.5" height="9" transform="rotate(-40 ${x} ${y})"/>`;
    case 'scroll':     return `<rect x="${x - 2}" y="${y - 4}" width="14" height="18" rx="2"/><rect x="${x - 4}" y="${y - 6}" width="18" height="3" rx="1.5"/>`;
    case 'files':      return `<rect x="${x - 4}" y="${y - 2}" width="16" height="14" rx="1"/><rect x="${x - 2}" y="${y - 5}" width="16" height="3"/>`;
    case 'teacup':     return `<path d="M${x} ${y} h10 v4 a5 5 0 0 1 -10 0 Z"/><circle cx="${x + 12}" cy="${y + 3}" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    case 'map':        return `<path d="M${x - 6} ${y - 4} l7 3 l7 -3 l7 3 v16 l-7 -3 l-7 3 l-7 -3 Z"/>`;
    case 'newspaper':  return `<rect x="${x - 3}" y="${y - 8}" width="15" height="19" transform="rotate(8 ${x} ${y})"/>`;
    case 'cane':       return `<rect x="${x + 4}" y="${y - 4}" width="2.4" height="44"/><path d="M${x + 5} ${y - 4} q6 -6 10 0" fill="none" stroke="currentColor" stroke-width="2.4"/>`;
    case 'microscope': return `<rect x="${x}" y="${y + 14}" width="16" height="3"/><rect x="${x + 6}" y="${y - 6}" width="4" height="20" transform="rotate(-18 ${x + 8} ${y + 4})"/><rect x="${x + 2}" y="${y + 6}" width="12" height="2.5"/>`;
    case 'recorder':   return `<rect x="${x - 2}" y="${y}" width="14" height="9" rx="2"/><circle cx="${x + 2}" cy="${y + 4.5}" r="2" fill="#000" stroke="currentColor"/><circle cx="${x + 8}" cy="${y + 4.5}" r="2" fill="#000" stroke="currentColor"/>`;
    default: return '';
  }
}

// Returns an <svg> string, 70 × 120, filled with currentColor.
export function silhouetteSVG(researcher, { title = true } = {}) {
  const { height, build, hair: hairKind, head, posture, prop: propKind } = researcher.look;
  const W = 70, H = 120;
  const scale = height;
  const half = BUILD[build] ?? 16;
  const seated = posture === 'seated';
  const lean = posture === 'leaning' ? 4 : 0;
  const footY = H - 4;
  const bodyTop = footY - (seated ? 62 : 86) * scale;
  const r = 8.5 * (build === 'petite' ? 0.9 : 1);
  const cx = W / 2 + lean;
  const cy = bodyTop - r + 1;

  const torsoBottom = seated ? footY - 22 : footY - 40 * scale;
  const narrowWaist = build === 'tall_lean' ? half - 3 : build === 'round' ? half + 3 : half - 1;
  const torso = `<path d="M${cx - half} ${bodyTop + 10} Q${cx} ${bodyTop - 2} ${cx + half} ${bodyTop + 10} L${cx + narrowWaist} ${torsoBottom} L${cx - narrowWaist} ${torsoBottom} Z"/>`;
  const legs = seated
    ? `<rect x="${cx - narrowWaist}" y="${torsoBottom - 4}" width="${narrowWaist * 2 + 14}" height="9" rx="4"/><rect x="${cx + narrowWaist + 6}" y="${torsoBottom}" width="8" height="${footY - torsoBottom}" rx="3"/><rect x="${cx - narrowWaist - 6}" y="${torsoBottom + 4}" width="${narrowWaist * 2 + 6}" height="3"/><rect x="${cx - narrowWaist - 4}" y="${torsoBottom + 6}" width="3" height="${footY - torsoBottom - 6}"/>`
    : `<rect x="${cx - narrowWaist + 1}" y="${torsoBottom - 2}" width="${narrowWaist - 2}" height="${footY - torsoBottom + 2}" rx="3"/><rect x="${cx + 1}" y="${torsoBottom - 2}" width="${narrowWaist - 2}" height="${footY - torsoBottom + 2}" rx="3"/>`;
  const arm = `<rect x="${cx + half - 5}" y="${bodyTop + 10}" width="6" height="${28 * scale}" rx="3" transform="rotate(-28 ${cx + half - 2} ${bodyTop + 10})"/>`;
  const handX = cx + half + 6, handY = bodyTop + 30 * scale;

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${researcher.name} silhouette" fill="currentColor">${title ? `<title>${researcher.name}</title>` : ''}`
    + hair(hairKind, cx, cy, r)
    + `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
    + headwear(head, cx, cy, r)
    + `<rect x="${cx - 3}" y="${cy + r - 2}" width="6" height="6"/>`
    + torso + legs + arm + prop(propKind, handX, handY)
    + '</svg>';
}
