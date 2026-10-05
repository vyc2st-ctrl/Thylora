// ROOT HOUSE · GEDCOM import
// Workroom: WR-LINEAGE-001
//
// GEDCOM is the file every family-tree site exports (Ancestry: Trees → Tree
// settings → Export tree; FamilySearch, MyHeritage, WikiTree, RootsMagic too).
// Importing it lets the Root House work on a tree the family already built
// elsewhere, then seat each person by Ahnentafel number from a chosen root.

export function parseGedcom(text) {
  const people = new Map(), families = new Map();
  let cur = null, sub = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const m = raw.match(/^\s*(\d+)\s+(@[^@]+@)?\s*(\w+)\s?(.*)$/);
    if (!m) continue;
    const [, lvlS, xref, tag, value] = m;
    const lvl = Number(lvlS);
    if (lvl === 0) {
      sub = null;
      if (tag === 'INDI') { cur = { id: xref, name: null, sex: null, birth: {}, death: {}, famc: [], fams: [], race: [] }; people.set(xref, cur); }
      else if (tag === 'FAM') { cur = { id: xref, husb: null, wife: null, chil: [] }; families.set(xref, cur); }
      else cur = null;
      continue;
    }
    if (!cur) continue;
    if (lvl === 1) {
      sub = tag;
      if (tag === 'NAME' && !cur.name) cur.name = value.replace(/\//g, '').replace(/\s+/g, ' ').trim();
      else if (tag === 'SEX') cur.sex = value.trim();
      else if (tag === 'FAMC') cur.famc.push(value.trim());
      else if (tag === 'FAMS') cur.fams.push(value.trim());
      else if (tag === 'HUSB') cur.husb = value.trim();
      else if (tag === 'WIFE') cur.wife = value.trim();
      else if (tag === 'CHIL') cur.chil.push(value.trim());
      else if (tag === 'RACE' || (tag === 'EVEN' && /race|color|colour|origin/i.test(value))) cur.race?.push({ value: value.trim() });
    } else if (lvl === 2 && (sub === 'BIRT' || sub === 'DEAT')) {
      const slot = sub === 'BIRT' ? cur.birth : cur.death;
      if (tag === 'DATE') slot.date = value.trim();
      if (tag === 'PLAC') slot.place = value.trim();
    }
  }
  return { people, families };
}

export function parentsOf(tree, personId) {
  const p = tree.people.get(personId);
  const fam = p?.famc?.map(f => tree.families.get(f)).find(Boolean);
  return { father: fam?.husb ?? null, mother: fam?.wife ?? null };
}

// Seat every ancestor of rootId: 1 = root, father 2n, mother 2n+1.
export function seatFrom(tree, rootId, maxGen = 8) {
  const seats = new Map();
  const walk = (id, n, gen) => {
    if (!id || gen > maxGen || seats.has(n)) return;
    seats.set(n, tree.people.get(id));
    const { father, mother } = parentsOf(tree, id);
    walk(father, 2 * n, gen + 1);
    walk(mother, 2 * n + 1, gen + 1);
  };
  walk(rootId, 1, 0);
  return seats;
}
