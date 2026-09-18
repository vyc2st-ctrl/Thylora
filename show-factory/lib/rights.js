// HISTORY → SHOW FACTORY · rights, provenance and the people still living
// Workroom: WR-SHOWFACTORY-001
//
// Historical material is not automatically free material. Three separate
// questions have to be answered separately, because a yes to one is not a yes
// to the others:
//
//   1. COPYRIGHT   may we reproduce this?
//   2. PROVENANCE  how did the holding institution come to hold it?
//   3. PEOPLE      is someone alive who is owed consent, credit or a share?
//
// A 19th-century photograph can be out of copyright, held by an institution that
// took it in a punitive raid, and depict a person whose descendants are named and
// findable. All three at once. The factory refuses to collapse them.

export const COPYRIGHT_STATES = Object.freeze([
  'PUBLIC_DOMAIN',
  'LICENSED',
  'FAIR_USE_ASSERTED',
  'RIGHTS_HOLDER_PERMISSION',
  'ORIGINAL_TO_THYLORA',
  'UNRESOLVED'
]);

export const PROVENANCE_STATES = Object.freeze([
  'CLEAR',                 // documented chain of custody, no dispute
  'INSTITUTIONAL_HELD',    // an archive holds it; chain documented but access conditional
  'RESTITUTION_CONTESTED', // a claim for return exists
  'LOOTED_DOCUMENTED',     // acquisition by force or theft is documented
  'UNDOCUMENTED'           // nobody can say how it got there
]);

export const PEOPLE_FLAGS = Object.freeze([
  'LIVING_DESCENDANTS_IDENTIFIED', // named family exists and is findable
  'CONSENT_HISTORY_VIOLATED',      // the subject's consent was absent or overridden in the record
  'HUMAN_REMAINS',                 // remains, burial sites, forensic excavation
  'NAMED_PRIVATE_INDIVIDUAL',      // a non-public person named in the record
  'COMMUNITY_CUSTODIAN'            // a community, not an individual, holds the authority
]);

// Flags that stop production use outright until a named authority answers.
const HARD_PEOPLE_FLAGS = ['HUMAN_REMAINS', 'CONSENT_HISTORY_VIOLATED'];

/**
 * Evaluate one piece of visual or documentary evidence. Reports every problem at
 * once, each with the route that clears it.
 */
export function evaluateProvenance(item) {
  const problems = [];
  const copyright = item?.copyright_state;
  const provenance = item?.provenance_state;
  const flags = item?.people_flags || [];

  if (!COPYRIGHT_STATES.includes(copyright)) {
    problems.push({ code: 'COPYRIGHT_UNCLASSIFIED', detail: 'Classify the copyright state of this item.' });
  } else if (copyright === 'UNRESOLVED') {
    problems.push({ code: 'COPYRIGHT_UNRESOLVED', detail: 'Resolve copyright before this item is cut into anything.' });
  }
  if (copyright === 'LICENSED' && !item?.licence_ref) {
    problems.push({ code: 'LICENCE_REF_MISSING', detail: 'Record the licence reference and its term.' });
  }
  if (copyright === 'FAIR_USE_ASSERTED' && !item?.fair_use_basis) {
    problems.push({ code: 'FAIR_USE_BASIS_MISSING', detail: 'State the basis for the fair-use assertion. "It is old" is not a basis.' });
  }

  if (!PROVENANCE_STATES.includes(provenance)) {
    problems.push({ code: 'PROVENANCE_UNCLASSIFIED', detail: 'Classify how the holder came to hold this.' });
  }
  if ((provenance === 'RESTITUTION_CONTESTED' || provenance === 'LOOTED_DOCUMENTED') && !item?.contest_note) {
    problems.push({
      code: 'RESTITUTION_NOT_DISCLOSED',
      detail: 'Contested provenance must be disclosed on screen, not quietly used. Write the note.'
    });
  }

  for (const f of flags) {
    if (!PEOPLE_FLAGS.includes(f)) {
      problems.push({ code: 'PEOPLE_FLAG_INVALID', detail: `Unknown people flag: ${f}.` });
    }
  }
  if (flags.includes('LIVING_DESCENDANTS_IDENTIFIED') && !item?.descendant_contact_state) {
    problems.push({
      code: 'DESCENDANT_CONTACT_UNRESOLVED',
      detail: 'Named living descendants exist. Record whether they were contacted, declined, or could not be reached.'
    });
  }
  if (flags.includes('COMMUNITY_CUSTODIAN') && !item?.custodian_name) {
    problems.push({ code: 'CUSTODIAN_UNNAMED', detail: 'Name the community custodian whose authority governs this material.' });
  }

  const hard = flags.filter(f => HARD_PEOPLE_FLAGS.includes(f));
  const blocked = hard.length > 0 && !item?.authority_clearance;
  if (blocked) {
    problems.push({
      code: 'AUTHORITY_CLEARANCE_REQUIRED',
      detail: `${hard.join(', ')} requires a named clearance before production use. Research use may continue.`
    });
  }

  return {
    ok: problems.length === 0,
    research_use: !problems.some(p => p.code === 'COPYRIGHT_UNCLASSIFIED'),
    production_use: problems.length === 0,
    problems
  };
}

/**
 * Roll up a seed's whole evidence list. One bad item does not blank the seed; it
 * blocks that item and says so.
 */
export function evaluateEvidenceList(items = []) {
  const results = items.map(item => ({ ref: item?.ref || item?.description || '(unnamed)', ...evaluateProvenance(item) }));
  return {
    total: results.length,
    production_ready: results.filter(r => r.production_use).length,
    blocked: results.filter(r => !r.production_use).map(r => ({ ref: r.ref, problems: r.problems })),
    ok: results.length > 0 && results.every(r => r.production_use)
  };
}
