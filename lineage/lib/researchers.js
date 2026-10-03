// THE ROOT HOUSE · research desks and the people at them
// Workroom: WR-ROOTHOUSE-001
//
// These researchers are THYLORA world staff (simulated people, labelled as such,
// the same rule RAE Link applies to world channels). Real people — archivists,
// volunteer indexers, family members, DNA cousins — are credited separately on
// every finding, by name, through creditFinding().
//
// Each researcher has a silhouette built from different parts, so the building
// never shows the same person copied across nine desks.

export const RESEARCHERS = [
  { id: 'R01', name: 'Odessa Vance', desk: 'DESK_FF', floor: 2, focus: "Father's father line · surname trail and Y-DNA",
    look: { height: 0.96, build: 'broad', hair: 'gray_afro', head: null, posture: 'standing', prop: 'magnifier' } },
  { id: 'R02', name: 'Thaddeus Okafor', desk: 'DESK_FM', floor: 3, focus: "Father's mother line · maiden names, marriage records, church rolls",
    look: { height: 1.0, build: 'tall_lean', hair: 'locs_long', head: null, posture: 'standing', prop: 'scroll' } },
  { id: 'R03', name: 'Marisol Baptiste', desk: 'DESK_MF', floor: 4, focus: "Mother's father line · military, draft and pension files",
    look: { height: 0.82, build: 'petite', hair: 'braids_bun', head: null, posture: 'standing', prop: 'files' } },
  { id: 'R04', name: 'Harriet "Hattie" Lyle', desk: 'DESK_MM', floor: 5, focus: "Mother's mother line · mtDNA, female-line naming, funeral programs",
    look: { height: 0.86, build: 'round', hair: null, head: 'headwrap', posture: 'seated', prop: 'teacup' } },
  { id: 'R05', name: 'Desmond Aubin', desk: 'DESK_CANADA', floor: 6, focus: 'Canada desk · Ontario, Nova Scotia and Québec records, border crossings 1895–1956',
    look: { height: 0.98, build: 'medium', hair: 'short_fade', head: 'flat_cap', posture: 'standing', prop: 'map' } },
  { id: 'R06', name: 'Beulah Greer', desk: 'DESK_MEMPHIS', floor: 1, focus: 'Memphis & Shelby County desk · Register of Deeds, directories, Black press, cemeteries',
    look: { height: 0.9, build: 'medium', hair: 'pressed_bob', head: 'church_hat', posture: 'standing', prop: 'newspaper' } },
  { id: 'R07', name: 'Kofi Ashworth-Mensah', desk: 'DESK_BRIDGE', floor: 7, focus: 'Pre-1870 bridge · slave schedules, probate, deeds, Freedmen\'s Bureau and Bank',
    look: { height: 1.0, build: 'medium', hair: 'bald', head: null, posture: 'leaning', prop: 'cane' } },
  { id: 'R08', name: 'Dr. Imani Castellanos', desk: 'DESK_DNA', floor: 8, focus: 'DNA lab · Y-DNA, mtDNA, autosomal match clustering',
    look: { height: 0.92, build: 'tall_lean', hair: 'high_puff', head: null, posture: 'standing', prop: 'microscope' } },
  { id: 'R09', name: 'Rev. Amos Pettigrew', desk: 'DESK_ORAL', floor: 1, focus: 'Elder interview desk · oral history, family Bibles, tea-night answers',
    look: { height: 0.94, build: 'broad', hair: 'gray_short', head: 'brim_hat', posture: 'seated', prop: 'recorder' } }
];

export const DESKS = {
  DESK_FF: "Father's father", DESK_FM: "Father's mother", DESK_MF: "Mother's father", DESK_MM: "Mother's mother",
  DESK_CANADA: 'Canada', DESK_MEMPHIS: 'Memphis & Shelby', DESK_BRIDGE: 'Pre-1870 bridge',
  DESK_DNA: 'DNA lab', DESK_ORAL: 'Elder interviews'
};

// Who works a person: their line desk, plus specialist desks the facts call for.
export function deskTeamFor(plan) {
  const desks = new Set();
  if (plan.line) desks.add(`DESK_${plan.line}`);
  if (plan.places.includes('CANADA')) desks.add('DESK_CANADA');
  if (plan.places.includes('MEMPHIS') || plan.places.includes('TN')) desks.add('DESK_MEMPHIS');
  if (plan.flags.includes('PRE_1870_WALL')) desks.add('DESK_BRIDGE');
  if (plan.flags.includes('NAME_UNKNOWN')) desks.add('DESK_ORAL');
  desks.add('DESK_DNA');
  return RESEARCHERS.filter(r => desks.has(r.desk));
}

// No two researchers may share the same silhouette signature.
export function silhouetteSignature(r) {
  const l = r.look;
  return [l.build, l.hair ?? '-', l.head ?? '-', l.posture, l.prop].join('|');
}
