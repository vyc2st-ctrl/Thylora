// ROOT HOUSE · the research team
// Workroom: WR-LINEAGE-001
//
// These are THYLORA world staff (EdereAriah characters). They are labelled as
// world characters everywhere they appear and are never presented as Earth
// people. Credit for a find goes to the desk that made it AND to the real-world
// archive that kept the record.
//
// Every researcher has a different body, hair, height, age and tool so that a
// silhouette alone tells you who is working.

export const WORLD_DISCLOSURE = 'Root House researchers are THYLORA world characters, not Earth people. The records they cite are real.';

export const RESEARCHERS = Object.freeze([
  { id: 'odessa', name: 'Mother Odessa Vance', desk: 'ORAL_HISTORY', floor: 'Parlor',
    role: 'Keeper of the Parlor · oral history, family Bibles, letters, photographs',
    look: { height: 0.86, build: 1.15, hair: 'headwrap', age: 'elder', tool: 'cane', skin: '#5a3a26' } },
  { id: 'dez', name: 'Desmond “Dez” Okafor', desk: 'CENSUS', floor: 'All four floors',
    role: 'Census tracker · 1870–1950 US, 1851–1931 Canada, household reconstruction',
    look: { height: 1.08, build: 0.9, hair: 'locs', age: 'adult', tool: 'ledger', skin: '#3b2418' } },
  { id: 'ines', name: 'Inès Baptiste', desk: 'CANADA', floor: 'Roof · Canada Desk',
    role: 'Canada desk · Ontario, Nova Scotia, Québec, border crossings, French records',
    look: { height: 0.9, build: 0.88, hair: 'bob', age: 'adult', tool: 'glasses', skin: '#8a5a3c' } },
  { id: 'marcus', name: 'Marcus Hale', desk: 'MILITARY', floor: "Father's father floor",
    role: 'Military desk · USCT, pensions, WWI/WWII drafts, No. 2 Construction Battalion',
    look: { height: 1.02, build: 1.3, hair: 'bald', age: 'adult', tool: 'cap', skin: '#2e1c14' } },
  { id: 'amara', name: 'Amara Lewis', desk: 'LAND', floor: "Father's mother floor",
    role: 'Land and law desk · deeds, probate, wills, court and tax rolls',
    look: { height: 0.78, build: 1.0, hair: 'afro', age: 'adult', tool: 'wheelchair', skin: '#6b4430' } },
  { id: 'theo', name: 'Theo Whitfield', desk: 'NEWSPAPERS', floor: "Mother's father floor",
    role: 'Newspaper desk · Black press, obituaries, “Information Wanted” ads',
    look: { height: 1.0, build: 0.78, hair: 'fedora', age: 'adult', tool: 'notebook', skin: '#4a2e20' } },
  { id: 'june', name: 'June Holloway', desk: 'CHURCH_CEMETERY', floor: "Mother's mother floor",
    role: 'Church and cemetery desk · church rolls, lodges, funeral homes, burial ground surveys',
    look: { height: 0.95, build: 1.05, hair: 'braids', age: 'adult', tool: 'skirt', skin: '#5c3a28' } },
  { id: 'kofi', name: 'Kofi Mensah', desk: 'DNA', floor: 'Basement · Lab',
    role: 'DNA and migration desk · Y-DNA, mtDNA, match clustering, origin evidence',
    look: { height: 0.97, build: 1.2, hair: 'beard', age: 'adult', tool: 'tablet', skin: '#33201a' } },
  { id: 'rosa', name: 'Rosa Delgado-Pryor', desk: 'ENSLAVEMENT_ERA', floor: 'Vault',
    role: 'Before-1870 desk · slave schedules, enslaver probate, Freedmen’s Bureau, Freedman’s Bank',
    look: { height: 1.1, build: 0.92, hair: 'ponytail', age: 'adult', tool: 'box', skin: '#7a4b33' } },
  { id: 'pip', name: 'Pip', desk: 'RUNNER', floor: 'Everywhere',
    role: 'Junior runner · carries finds between floors, keeps the kids’ question board',
    look: { height: 0.6, build: 0.85, hair: 'puffs', age: 'child', tool: 'satchel', skin: '#6a4230' } }
]);

export function creditLine(researcherId, archiveName) {
  const r = RESEARCHERS.find(x => x.id === researcherId);
  if (!r) throw new Error(`unknown researcher ${researcherId}`);
  if (!archiveName) throw new Error('the record holder must be credited too');
  return `Found by ${r.name} (${r.desk.replace(/_/g, ' ').toLowerCase()} desk, world character) · Record kept by ${archiveName}`;
}

// Silhouette: one SVG per researcher. Shapes are built from the look profile so
// no two match.
export function silhouette(look, size = 140) {
  const H = 160 * look.height, W = 60 * look.build;
  const ground = 196, top = ground - H;
  const headR = (look.age === 'child' ? 17 : 14) * (0.9 + look.build * 0.1);
  const hx = 70, hy = top + headR + 4;
  const shoulderY = hy + headR + 6;
  const hipY = shoulderY + (ground - shoulderY) * 0.48;
  const lean = look.age === 'elder' ? 6 : 0;
  const parts = [];
  // body
  const sw = W / 2, hw = W / 2 * (look.tool === 'skirt' ? 1.25 : 0.85);
  if (look.tool === 'wheelchair') {
    const seatY = ground - 58;
    parts.push(`<circle cx="70" cy="${ground - 26}" r="26" fill="none" stroke="currentColor" stroke-width="5"/>`);
    parts.push(`<path d="M${hx - sw} ${shoulderY} Q${hx} ${shoulderY - 8} ${hx + sw} ${shoulderY} L${hx + sw - 4} ${seatY} L${hx + 34} ${seatY} L${hx + 34} ${seatY + 10} L${hx - sw} ${seatY + 10} Z"/>`);
    parts.push(`<rect x="${hx + 26}" y="${seatY + 8}" width="8" height="34" rx="3"/>`);
  } else {
    parts.push(`<path d="M${hx - sw + lean} ${shoulderY} Q${hx + lean} ${shoulderY - 8} ${hx + sw + lean} ${shoulderY} L${hx + hw} ${hipY} L${hx - hw} ${hipY} Z"/>`);
    if (look.tool === 'skirt') {
      parts.push(`<path d="M${hx - hw} ${hipY} L${hx + hw} ${hipY} L${hx + hw + 10} ${ground - 8} L${hx - hw - 10} ${ground - 8} Z"/>`);
      parts.push(`<rect x="${hx - 12}" y="${ground - 10}" width="9" height="10"/><rect x="${hx + 3}" y="${ground - 10}" width="9" height="10"/>`);
    } else {
      const leg = Math.max(8, W * 0.2);
      parts.push(`<rect x="${hx - hw + 1}" y="${hipY - 2}" width="${leg}" height="${ground - hipY + 2}" rx="4"/>`);
      parts.push(`<rect x="${hx + hw - leg - 1}" y="${hipY - 2}" width="${leg}" height="${ground - hipY + 2}" rx="4"/>`);
    }
  }
  // head + neck
  parts.push(`<rect x="${hx - 5 + lean}" y="${hy + headR - 4}" width="10" height="12"/>`);
  parts.push(`<circle cx="${hx + lean}" cy="${hy}" r="${headR}"/>`);
  // hair / headwear
  const r = headR, x = hx + lean, y = hy;
  const hair = {
    headwrap: `<path d="M${x - r - 3} ${y} Q${x - r} ${y - r * 2.4} ${x + 4} ${y - r * 2.1} Q${x + r + 8} ${y - r * 1.6} ${x + r + 2} ${y - 2} Z"/>`,
    locs: [0, 1, 2, 3, 4, 5].map(i => `<rect x="${x - r + i * (r * 2 / 5) - 2}" y="${y - 4}" width="4" height="${r * 2.6 + (i % 2) * 6}" rx="2"/>`).join('') + `<circle cx="${x}" cy="${y - 3}" r="${r + 3}"/>`,
    bob: `<path d="M${x - r - 4} ${y + r * 0.7} L${x - r - 4} ${y - 2} Q${x} ${y - r * 1.9} ${x + r + 4} ${y - 2} L${x + r + 4} ${y + r * 0.7} Z"/>`,
    bald: '',
    afro: `<circle cx="${x}" cy="${y - 4}" r="${r * 1.75}"/>`,
    fedora: `<rect x="${x - r - 9}" y="${y - r + 1}" width="${2 * r + 18}" height="4" rx="2"/><rect x="${x - r + 1}" y="${y - r * 1.9}" width="${2 * r - 2}" height="${r}" rx="4"/>`,
    braids: `<circle cx="${x}" cy="${y - 2}" r="${r + 2}"/>` + [-1, 1].map(s => `<rect x="${x + s * (r - 1) - 2}" y="${y}" width="5" height="${r * 4}" rx="2.5"/>`).join(''),
    beard: `<path d="M${x - r + 1} ${y + 2} Q${x} ${y + r * 1.9} ${x + r - 1} ${y + 2} Z"/><rect x="${x - r}" y="${y - r - 1}" width="${2 * r}" height="6" rx="3"/>`,
    ponytail: `<circle cx="${x}" cy="${y - 2}" r="${r + 1}"/><path d="M${x + r - 2} ${y - r * 0.6} Q${x + r * 2.4} ${y} ${x + r + 4} ${y + r * 2.2} L${x + r - 1} ${y + r * 1.8} Q${x + r * 1.6} ${y} ${x + r - 4} ${y - r * 0.2} Z"/>`,
    puffs: `<circle cx="${x - r}" cy="${y - r * 0.9}" r="${r * 0.7}"/><circle cx="${x + r}" cy="${y - r * 0.9}" r="${r * 0.7}"/>`
  }[look.hair] ?? '';
  parts.push(hair);
  // tools
  const tool = {
    cane: `<rect x="${hx + sw + 4}" y="${shoulderY + 20}" width="4" height="${ground - shoulderY - 20}" rx="2"/><rect x="${hx + sw - 2}" y="${shoulderY + 18}" width="12" height="4" rx="2"/>`,
    ledger: `<rect x="${hx - sw - 16}" y="${hipY - 30}" width="18" height="24" rx="2"/>`,
    glasses: `<rect x="${x - r * 0.75}" y="${y - 2}" width="${r * 1.5}" height="3" fill="var(--bg,#0a0e14)"/>`,
    cap: `<path d="M${x - r} ${y - r * 0.4} Q${x} ${y - r * 1.5} ${x + r} ${y - r * 0.4} L${x + r + 9} ${y - r * 0.3} L${x + r} ${y - r * 0.15} Z"/>`,
    notebook: `<rect x="${hx + sw - 2}" y="${shoulderY + 10}" width="14" height="18" rx="2"/>`,
    tablet: `<rect x="${hx - sw - 18}" y="${shoulderY + 8}" width="20" height="28" rx="3"/>`,
    box: `<rect x="${hx - 22}" y="${hipY - 26}" width="44" height="24" rx="2"/>`,
    satchel: `<rect x="${hx + sw - 6}" y="${hipY - 14}" width="16" height="14" rx="3"/>`
  }[look.tool] ?? '';
  parts.push(tool);
  return `<svg viewBox="0 0 140 200" width="${size * 0.7}" height="${size}" fill="currentColor" role="img" aria-hidden="true">${parts.join('')}</svg>`;
}
