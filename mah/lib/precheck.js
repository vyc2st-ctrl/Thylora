// MAH' · Permanent prechecks — every repeated failure becomes a rule that runs FIRST.
// Workroom: WR-MAH-001
//
// Why this exists: the QR code was found missing at the "ninth hour"; titles were
// missing on page 12; judges appeared without credentials. Each was a deduction that
// was never executed ("every artifact needs X" was known, nobody checked X).
// The bridge between "this rule is true" and "this rule was applied" is a check that
// runs before work starts and again before release. Prechecks report EVERY problem
// at once, each with a route, so nobody learns them one at a time.

export const STATUS_LADDER = Object.freeze(['DECLARED', 'BUILT', 'WITNESSED', 'LIVE']);

export const PRECHECKS = Object.freeze([
  { code: 'SERIAL_MISSING', test: a => !a.serial, route: 'Issue a serial before drafting (issueSerial)' },
  { code: 'SERIAL_MALFORMED', test: a => a.serial && !/^THY-[A-Z0-9]+-\d{8}-\d{4}$/.test(a.serial), route: 'Serial format THY-<LANE>-<YYYYMMDD>-<NNNN>' },
  { code: 'PREPARER_MISSING', test: a => !a.preparer?.name, route: 'Name who prepared it' },
  { code: 'PREPARER_CREDENTIALS_MISSING', test: a => a.preparer?.name && !(a.preparer.title && a.preparer.qualification), route: 'Add preparer title and what qualifies them' },
  { code: 'PREPARER_WORLD_STATUS_MISSING', test: a => a.preparer?.name && !['EARTH', 'SIMULATED'].includes(a.preparer.world_status), route: 'State EARTH or SIMULATED (EdereAriah)' },
  { code: 'OFFICIAL_UNIDENTIFIED', test: a => (a.officials || []).some(o => !(o.title && o.kind && o.qualification && o.world_status)), route: 'Every judge/official needs title, court type, qualification, EARTH/SIMULATED' },
  { code: 'SECTION_UNTITLED', test: a => (a.sections || []).some(s => !s.title), route: 'Every section and page carries a title' },
  { code: 'EQUATION_WITHOUT_QUESTION', test: a => (a.equations || []).some(e => !e.question), route: 'Print the question each equation asks directly under it' },
  { code: 'NO_INVOKED_QUESTION', test: a => a.kind === 'REPORT' && !(a.invoked_questions || []).length, route: 'Add at least one question the reader has not asked' },
  { code: 'QR_MISSING', test: a => a.requires_qr !== false && !a.qr_target, route: 'Generate and test the QR target before layout, not after' },
  { code: 'SECTIONS_NOT_PREVIEWED', test: a => a.format === 'PDF' && (a.sections || []).some(s => s.preview_approved !== true), route: 'Preview and approve each section/box before the PDF is rendered' },
  { code: 'LAYOUT_NOT_CENTERED', test: a => a.format === 'PDF' && a.layout?.centered !== true, route: 'Center the layout and re-witness' },
  { code: 'STATUS_UNWITNESSED', test: a => ['WITNESSED', 'LIVE'].includes(a.status) && !a.witness_evidence, route: 'Attach the witness evidence or lower the status to BUILT' },
  { code: 'STATUS_UNKNOWN', test: a => a.status && !STATUS_LADDER.includes(a.status), route: `Use one of ${STATUS_LADDER.join(' → ')}` },
  { code: 'SIMULATED_RESULT_UNLABELLED', test: a => a.contains_simulated_results && !a.simulation_disclosure, route: 'Label simulated (world) results as simulated before sending to any Earth company' }
]);

export function precheck(artifact) {
  const blockers = PRECHECKS.filter(p => { try { return p.test(artifact); } catch { return true; } })
    .map(({ code, route }) => ({ code, route }));
  return { ready: blockers.length === 0, blockers };
}

let counter = 0;
export function issueSerial(lane, date = new Date(), seq = ++counter) {
  if (!/^[A-Z0-9]{2,12}$/.test(lane)) throw new Error('SERIAL_LANE_INVALID');
  const d = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `THY-${lane}-${d}-${String(seq).padStart(4, '0')}`;
}

/** Can this thing honestly be called "active"? Only at LIVE with evidence. */
export function canCallActive(item) {
  return item?.status === 'LIVE' && Boolean(item.witness_evidence);
}
