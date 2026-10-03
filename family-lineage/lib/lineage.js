// FAMILY LINEAGE · kinship derivation, teller corrections, account checks, seed SQL
// Workroom: WR-LINEAGE-001
//
// The teller's words are never rewritten. A correction is its own record and is
// applied when text is rendered. Kinship is derived from parentage with a role
// per parent, so "half" relations come from the data, not from a label.

export const CONFIDENCE = Object.freeze([
  'MEMORY_REPORTED', 'FAMILY_CONSENSUS', 'RECORD_SUPPORTED', 'RECORD_CONFIRMED', 'DISPUTED'
]);
export const AGE_COMPARISONS = Object.freeze([
  'ABOUT_SAME', 'OLDER', 'YOUNGER', 'A_LITTLE_OLDER', 'A_LITTLE_YOUNGER'
]);
export const CORRECTION_TYPES = Object.freeze([
  'REMOVE_PHRASE', 'REPLACE_PHRASE', 'ATTRIBUTION', 'CONTEXT_NOTE'
]);

const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Mirrors fl_apply_corrections() in db/family-lineage/0001_lineage.sql.
export function applyCorrections(text, corrections = [], target = 'TESTIMONY') {
  if (text == null) return null;
  let t = String(text);
  for (const c of corrections) {
    if (!['REMOVE_PHRASE', 'REPLACE_PHRASE'].includes(c.type)) continue;
    const appliesTo = c.applies_to ?? ['TESTIMONY', 'PDF', 'PAGE', 'AUDIO'];
    if (!appliesTo.includes(target)) continue;
    t = t.replace(new RegExp(escapeRegExp(c.target), 'gi'), c.replacement ?? '');
  }
  return t.replace(/[ \t]{2,}/g, ' ').replace(/,\s*([.!?])/g, '$1').replace(/\s+([,.!?])/g, '$1').trim();
}

function parentsOf(account, key) {
  return account.parentage.filter(p => p.child === key);
}

// Mirrors fl_sibling_kind().
export function siblingKind(account, a, b) {
  if (a === b) return 'SELF';
  const pa = parentsOf(account, a), pb = parentsOf(account, b);
  const shared = pa.filter(x => pb.some(y => y.parent === x.parent)).length;
  if (shared === 0) return 'NONE_RECORDED';
  if (shared >= 2) return 'FULL_SIBLING';
  if (pa.length >= 2 && pb.length >= 2) return 'HALF_SIBLING';
  return 'SIBLING_OTHER_PARENT_UNRECORDED';
}

// How `relative` is kin to `ego`, for the cases a family tells most: parent,
// sibling, uncle/aunt (full or half, and through which parent), first cousin.
export function kinship(account, ego, relative) {
  if (ego === relative) return { relation: 'SELF' };
  const egoParents = parentsOf(account, ego);
  if (egoParents.some(p => p.parent === relative)) return { relation: 'PARENT' };

  const sib = siblingKind(account, ego, relative);
  if (sib === 'FULL_SIBLING' || sib === 'HALF_SIBLING') return { relation: sib };

  for (const p of egoParents) {
    const kind = siblingKind(account, p.parent, relative);
    if (kind === 'FULL_SIBLING' || kind === 'HALF_SIBLING') {
      return {
        relation: kind === 'HALF_SIBLING' ? 'HALF_UNCLE_OR_AUNT' : 'UNCLE_OR_AUNT',
        through: p.parent,
        side: p.role === 'FATHER' ? 'PATERNAL' : p.role === 'MOTHER' ? 'MATERNAL' : 'UNKNOWN',
        blood: true
      };
    }
  }

  for (const rp of parentsOf(account, relative)) {
    const k = kinship(account, ego, rp.parent);
    if (k.relation === 'UNCLE_OR_AUNT') return { relation: 'FIRST_COUSIN', through: rp.parent, side: k.side, blood: true };
    if (k.relation === 'HALF_UNCLE_OR_AUNT') return { relation: 'HALF_FIRST_COUSIN', through: rp.parent, side: k.side, blood: true };
  }
  return { relation: 'NOT_DERIVABLE_YET' };
}

// Structural checks. Returns a list of problems; empty means the account is sound.
export function validateAccount(account) {
  const problems = [];
  const keys = new Set();
  for (const p of account.persons ?? []) {
    if (keys.has(p.key)) problems.push({ code: 'DUPLICATE_PERSON', key: p.key });
    keys.add(p.key);
  }
  const roleSeen = new Set();
  for (const pr of account.parentage ?? []) {
    if (!keys.has(pr.child)) problems.push({ code: 'UNKNOWN_CHILD', key: pr.child });
    if (!keys.has(pr.parent)) problems.push({ code: 'UNKNOWN_PARENT', key: pr.parent });
    if (pr.child === pr.parent) problems.push({ code: 'SELF_PARENT', key: pr.child });
    if (pr.role === 'FATHER' || pr.role === 'MOTHER') {
      const slot = `${pr.child}:${pr.role}`;
      if (roleSeen.has(slot)) problems.push({ code: 'TWO_PARENTS_SAME_ROLE', key: slot });
      roleSeen.add(slot);
    }
  }
  for (const a of account.age_anchors ?? []) {
    if (!keys.has(a.person) || !keys.has(a.anchor)) problems.push({ code: 'UNKNOWN_AGE_ANCHOR', key: `${a.person}~${a.anchor}` });
    if (!AGE_COMPARISONS.includes(a.comparison)) problems.push({ code: 'BAD_AGE_COMPARISON', key: a.comparison });
  }
  for (const t of account.testimonies ?? []) {
    if (!t.verbatim?.trim()) problems.push({ code: 'EMPTY_TESTIMONY', key: t.code });
    for (const c of t.corrections ?? []) {
      if (!CORRECTION_TYPES.includes(c.type)) problems.push({ code: 'BAD_CORRECTION_TYPE', key: t.code });
      if (c.type !== 'CONTEXT_NOTE' && !c.target?.trim()) problems.push({ code: 'CORRECTION_TARGET_MISSING', key: t.code });
      if (!c.reason?.trim()) problems.push({ code: 'CORRECTION_REASON_MISSING', key: t.code });
    }
  }
  for (const q of account.open_questions ?? []) {
    for (const k of q.about ?? []) if (!keys.has(k)) problems.push({ code: 'UNKNOWN_QUESTION_SUBJECT', key: k });
  }
  for (const r of account.record_tasks ?? []) {
    if (r.person && !keys.has(r.person)) problems.push({ code: 'UNKNOWN_RECORD_SUBJECT', key: r.person });
  }
  return problems;
}

// Seed SQL for one account. Run with psql: -v owner=<auth.users id>. Idempotent:
// persons upsert on (owner, person_key); testimonies skip if the code exists.
export function toSeedSql(account) {
  const q = v => v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
  const arr = a => `array[${(a ?? []).map(q).join(',')}]::text[]`;
  const pid = k => `(select id from fl_persons where owner_user_id = :'owner' and person_key = ${q(k)})`;
  const out = [`-- Seed: ${account.account_code} (generated from family-lineage/accounts). Private.`, 'begin;'];

  for (const p of account.persons) {
    out.push(`insert into fl_persons (owner_user_id, person_key, display_name, alt_names, is_teller, residence_note, living_state)
values (:'owner', ${q(p.key)}, ${q(p.display)}, ${arr(p.alt_names)}, ${p.is_teller ? 'true' : 'false'}, ${q(p.residence)}, ${q(p.living ?? 'UNKNOWN')})
on conflict (owner_user_id, person_key) do update set display_name = excluded.display_name, alt_names = excluded.alt_names, residence_note = excluded.residence_note;`);
  }
  for (const pr of account.parentage) {
    out.push(`insert into fl_parentage (child_id, parent_id, parent_role, source_note)
values (${pid(pr.child)}, ${pid(pr.parent)}, ${q(pr.role)}, ${q(pr.source)}) on conflict do nothing;`);
  }
  for (const b of account.beliefs ?? []) {
    out.push(`insert into fl_relation_beliefs (owner_user_id, subject_id, believed, learned, learned_when)
select :'owner', ${pid(b.subject)}, ${q(b.believed)}, ${q(b.learned)}, ${q(b.learned_when)}
where not exists (select 1 from fl_relation_beliefs where owner_user_id = :'owner' and subject_id = ${pid(b.subject)} and believed = ${q(b.believed)});`);
  }
  for (const a of account.age_anchors ?? []) {
    out.push(`insert into fl_age_anchors (person_id, anchor_id, comparison)
select ${pid(a.person)}, ${pid(a.anchor)}, ${q(a.comparison)}
where not exists (select 1 from fl_age_anchors where person_id = ${pid(a.person)} and anchor_id = ${pid(a.anchor)});`);
  }
  for (const t of account.testimonies) {
    out.push(`insert into fl_testimonies (owner_user_id, testimony_code, teller_id, told_on, scene_label, verbatim_text, capture_mode)
values (:'owner', ${q(t.code)}, ${pid(t.teller)}, ${q(account.told_on)}, ${q(t.scene)}, ${q(t.verbatim)}, ${q(account.capture_mode)})
on conflict (testimony_code) do nothing;`);
    for (const c of t.corrections ?? []) {
      out.push(`insert into fl_corrections (testimony_id, correction_type, target_phrase, replacement, reason, corrected_by, applies_to)
select t.id, ${q(c.type)}, ${q(c.target)}, ${q(c.replacement)}, ${q(c.reason)}, :'owner', ${arr(c.applies_to)}
from fl_testimonies t where t.testimony_code = ${q(t.code)}
and not exists (select 1 from fl_corrections c where c.testimony_id = t.id and c.target_phrase is not distinct from ${q(c.target)});`);
    }
  }
  for (const oq of account.open_questions ?? []) {
    const about = `array[${(oq.about ?? []).map(pid).join(',')}]::uuid[]`;
    out.push(`insert into fl_open_questions (owner_user_id, question, why_it_matters, about_ids)
select :'owner', ${q(oq.q)}, ${q(oq.why)}, ${about}
where not exists (select 1 from fl_open_questions where owner_user_id = :'owner' and question = ${q(oq.q)});`);
  }
  for (const r of account.record_tasks ?? []) {
    out.push(`insert into fl_record_tasks (owner_user_id, person_id, record_source, search_hint, proves)
select :'owner', ${r.person ? pid(r.person) : 'null'}, ${q(r.source)}, ${q(r.hint)}, ${q(r.proves)}
where not exists (select 1 from fl_record_tasks where owner_user_id = :'owner' and record_source = ${q(r.source)} and search_hint = ${q(r.hint)});`);
  }
  out.push('commit;');
  return out.join('\n') + '\n';
}
