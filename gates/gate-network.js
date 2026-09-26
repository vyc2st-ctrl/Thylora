// THYLORA · Gate Network — first connected adjacency map
// Workroom: WR-GATE-NETWORK-620
// Math: MATH-GATE-NETWORK-620   G_i = E_i × C_i × A_i × R_i × X_i
//       MATH-ROUTE-VALUE-620    Ω_k = (V×E×C×Rev×Cap×Fit) ÷ (1 + Risk + Cost + Dep)
// Idea: THY-IDEA-SELF-MONITORING-GATE-NETWORK-001
//
// ACCESS != AUTHORITY. UNKNOWN remains UNKNOWN: a factor that was not measured
// is never coerced to a number, so a gate with an unknown factor cannot PASS.
//
// WORKING INTERPRETATION of the G_i factors (confirm against the
// MATH-GATE-NETWORK-620 source text; the letters are authoritative, these
// readings are this workroom's):
//   E  evidence      — how much of the gate's evidence floor is witnessed    [0,1]
//   C  self-check    — the gate's own consistency check result              [0,1]
//   A  authority     — computed here, never supplied: held level ≥ floor    {0,1}
//   R  redundancy    — independent second check agrees                      [0,1]
//   X  cross-gate    — clearance from connected gates (1 = no open warning) [0,1]

export const DECISIONS = Object.freeze(['PASS', 'PARTIAL', 'HOLD', 'ESCALATE']);
export const GAP_ACTIONS = Object.freeze([
  'REMOVE', 'REPAIR', 'REPURPOSE', 'ROUTE_AROUND', 'ESCALATE', 'PRESERVE_UNKNOWN'
]);

// Authority ladder. A gate's authority floor is the lowest level that may PASS it.
export const AUTHORITY = Object.freeze({
  NONE: 0,
  AUTONOMY_SAFE_INTERNAL: 1, // the autonomy worker, internal drafts only
  OPERATOR: 2,               // a named human operator acting inside a lane
  CHAIRMAN: 3                // Chairman instruction on record
});

// Maps the existing thylora_autonomy_tasks.autonomy_class values to a level.
// Anything unrecognised is NONE — it cannot pass any gate.
export const AUTONOMY_CLASS_AUTHORITY = Object.freeze({
  SAFE_INTERNAL: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
  EXTERNAL_READ: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
  CHAIRMAN_RESERVED: AUTHORITY.NONE
});

export const PASS_THRESHOLD = 0.8;

const g = (def) => Object.freeze(def);

export const GATES = Object.freeze({
  PERSON: g({
    purpose: 'Establish who a real person in the work is, and whether they may be depicted, named or quoted at all.',
    inputs: ['subject identity claim', 'relationship to THYLORA', 'age band (adult / minor / unknown)', 'living / deceased'],
    outputs: ['person record ref', 'depiction permission state', 'minor flag'],
    evidence_floor: 'Named person has a consent or authority record on file; a minor has a guardian consent record. Likeness of a real person without either never passes.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.OPERATOR,
    self_check: 'Does every face, name and voice in the output map to exactly one person record?',
    redundancy_check: 'A second pass matches the output against the person list; any unmatched face or name is a failure.',
    connected: ['PRIVACY', 'SCENE', 'VISUAL', 'RIGHTS', 'LEGAL'],
    rules: {
      PASS: 'Every person matched, consent on file, no minor without guardian consent.',
      PARTIAL: 'Some persons cleared; uncleared persons removed or anonymised and the rest may continue.',
      HOLD: 'A person is present with no consent record, or age is UNKNOWN where it matters.',
      ESCALATE: 'Real, identifiable, non-consenting person; any minor in a public output; a deceased person whose estate is unknown.'
    },
    gap_actions: {
      REMOVE: 'Remove the unconsented person from the output.',
      REPAIR: 'Obtain the missing consent record (through an operator — never by autonomous outreach).',
      REPURPOSE: 'Replace with a fictional, clearly labelled character.',
      ROUTE_AROUND: 'Ship the version that contains no people.',
      ESCALATE: 'Send to Chairman with the person, the use, and the missing record.',
      PRESERVE_UNKNOWN: 'Record identity or age as UNKNOWN; never guess it.'
    }
  }),

  PRIVACY: g({
    purpose: 'Keep personal data to the minimum necessary and out of any output where it is not required.',
    inputs: ['data fields present', 'audience of the output', 'retention intent', 'recording context (who was in earshot / frame)'],
    outputs: ['redaction list', 'retention class', 'audience class'],
    evidence_floor: 'A field-level inventory of personal data exists for the artifact, and every field has a stated purpose.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.OPERATOR,
    self_check: 'Is any field present that the stated purpose does not need? (health, address, phone, school schedule of a minor, faces of bystanders, account numbers)',
    redundancy_check: 'Pattern scan (emails, phones, addresses, ID numbers) independent of the author\'s inventory; any hit not in the inventory fails.',
    connected: ['PERSON', 'SCENE', 'VISUAL', 'PUBLICATION', 'LEGAL', 'AUTONOMY'],
    rules: {
      PASS: 'Inventory complete, every field justified, redactions applied, retention set.',
      PARTIAL: 'Private-audience version passes; public version still carries unjustified fields.',
      HOLD: 'No inventory, or scan finds fields the inventory missed.',
      ESCALATE: 'Minor\'s data, health data, or covert recording of another person.'
    },
    gap_actions: {
      REMOVE: 'Strip the unjustified field.',
      REPAIR: 'Complete the inventory; apply redaction.',
      REPURPOSE: 'Aggregate or anonymise so the record serves the purpose without the identity.',
      ROUTE_AROUND: 'Keep the record private; publish only the redacted derivative.',
      ESCALATE: 'Chairman decision on any minor, health or covert-capture data.',
      PRESERVE_UNKNOWN: 'Mark the field as UNKNOWN-SENSITIVITY and treat as sensitive until classified.'
    }
  }),

  SCENE: g({
    purpose: 'Confirm that a depicted or recorded scene matches its measured scene contract (place, time, people, objects, lighting, framing).',
    inputs: ['scene contract', 'reference measurements', 'candidate render or capture'],
    outputs: ['scene contract result per clause', 'measured deltas'],
    evidence_floor: 'A written, measured scene contract exists before any render. No contract, no render.',
    evidence_floor_value: 1.0,
    authority_floor: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
    self_check: 'Does every clause of the scene contract have a measured value in the candidate?',
    redundancy_check: 'Independent re-measurement of the three highest-risk clauses.',
    connected: ['PERSON', 'PRIVACY', 'OBJECT', 'VISUAL'],
    rules: {
      PASS: 'Every contract clause measured and within tolerance.',
      PARTIAL: 'Non-critical clauses out of tolerance; critical ones pass.',
      HOLD: 'No measured contract, or a critical clause fails. Do not render again until the contract passes.',
      ESCALATE: 'The contract itself depicts a real person, place or institution without clearance.'
    },
    gap_actions: {
      REMOVE: 'Drop the failing element from the scene.',
      REPAIR: 'Fix the contract or the measurement, then re-check — do not re-render blind.',
      REPURPOSE: 'Use the scene for an internal study rather than a public output.',
      ROUTE_AROUND: 'Publish a text or diagram form of the idea while the scene is held.',
      ESCALATE: 'Send clause failures on real subjects to Chairman.',
      PRESERVE_UNKNOWN: 'Unmeasured clauses stay UNMEASURED; they are not assumed to pass.'
    }
  }),

  OBJECT: g({
    purpose: 'Confirm every object, material and specification in the work is real, correctly described, and safe to show or use.',
    inputs: ['object list', 'specifications', 'safety data', 'source for each factual claim'],
    outputs: ['verified object list', 'safety notes', 'factual-claim citations'],
    evidence_floor: 'Each factual claim about an object or process has a cited source; each hands-on activity has a safety note.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
    self_check: 'Is every claim either cited or labelled as illustrative?',
    redundancy_check: 'Second reviewer or second source confirms each science or safety claim.',
    connected: ['SCENE', 'VISUAL', 'RIGHTS', 'PRODUCT'],
    rules: {
      PASS: 'All claims cited, all activities have safety notes.',
      PARTIAL: 'Core content verified; an extension activity still lacks a safety note and is withheld.',
      HOLD: 'An uncited factual claim, or an activity without a safety note.',
      ESCALATE: 'An activity that could cause injury, or a product claim with regulatory weight (toys, food, medical).'
    },
    gap_actions: {
      REMOVE: 'Delete the uncited claim or unsafe activity.',
      REPAIR: 'Cite it or add the safety note.',
      REPURPOSE: 'Turn an unverifiable claim into an open question for the reader.',
      ROUTE_AROUND: 'Ship without the extension activity.',
      ESCALATE: 'Chairman / qualified reviewer for injury or regulated claims.',
      PRESERVE_UNKNOWN: 'Label as "not yet verified" in the draft; never publish that label as fact.'
    }
  }),

  VISUAL: g({
    purpose: 'Decide whether a visual asset may be generated, used or published.',
    inputs: ['asset', 'scene gate result', 'person gate result', 'rights basis', 'generation provenance'],
    outputs: ['visual release state', 'provenance record', 'alt text'],
    evidence_floor: 'Provenance recorded (made how, by what, from which inputs); SCENE and PERSON results attached.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.OPERATOR,
    self_check: 'Does the image show only what the scene contract allows? Is there alt text?',
    redundancy_check: 'Independent visual review against the contract, not against the prompt. For product visuals, THY-VISUAL-QUALITY-GATE-001 is the quality check of record.',
    binds: 'THY-VISUAL-QUALITY-GATE-001 (WR-VISUAL-STANDARD-545, branch claude/visual-standard-recovery-gate-2oc3jc, not yet merged). This gate decides whether a visual may exist or be used at all; that gate decides whether a product visual meets the quality standard. Neither replaces the other.',
    connected: ['PERSON', 'PRIVACY', 'SCENE', 'OBJECT', 'RIGHTS', 'PUBLICATION'],
    rules: {
      PASS: 'Provenance on file, SCENE and PERSON pass, rights basis set.',
      PARTIAL: 'Approved for internal or draft use only.',
      HOLD: 'SCENE not passed, or provenance missing. One held visual holds only its own route.',
      ESCALATE: 'Real-person likeness, a real institution\'s marks, or a medical depiction.'
    },
    gap_actions: {
      REMOVE: 'Drop the image; the product ships text-first.',
      REPAIR: 'Pass SCENE first, then regenerate once against the passed contract.',
      REPURPOSE: 'Use as internal reference only.',
      ROUTE_AROUND: 'Use a line diagram or icon set that needs no scene contract.',
      ESCALATE: 'Chairman on likeness, marks or medical depiction.',
      PRESERVE_UNKNOWN: 'Unknown provenance = not usable; keep the file, record why.'
    }
  }),

  RIGHTS: g({
    purpose: 'Confirm THYLORA holds the right to use, adapt, sell and license every component.',
    inputs: ['ownership basis per component', 'licence references', 'third-party marks and names'],
    outputs: ['rights ledger entry', 'licensable / not-licensable flag'],
    evidence_floor: 'Every component has an ownership basis (owned original, licensed with reference, public domain with source, or written authorization).',
    evidence_floor_value: 1.0,
    authority_floor: AUTHORITY.OPERATOR,
    self_check: 'Is any component\'s basis UNRESOLVED?',
    redundancy_check: 'Search for third-party marks (school names, mascots, team names, brand names) the ledger does not list.',
    connected: ['PERSON', 'OBJECT', 'VISUAL', 'PRODUCT', 'PUBLICATION', 'LEGAL'],
    rules: {
      PASS: 'No UNRESOLVED component; no unlisted third-party mark.',
      PARTIAL: 'Owned-original core passes; a component with an unresolved basis is removed from the release.',
      HOLD: 'Any UNRESOLVED basis in a sellable output.',
      ESCALATE: 'A third party\'s trademark or a school / district name used commercially.'
    },
    gap_actions: {
      REMOVE: 'Take out the unresolved component.',
      REPAIR: 'Record the basis or obtain the licence (operator, not autonomy).',
      REPURPOSE: 'Replace with an owned original.',
      ROUTE_AROUND: 'Release the owned-original core.',
      ESCALATE: 'Chairman on third-party marks and school names.',
      PRESERVE_UNKNOWN: 'Basis stays UNRESOLVED on the ledger until evidence arrives.'
    }
  }),

  PRODUCT: g({
    purpose: 'Confirm the thing being sold exists as a complete, checked artifact matching its specification.',
    inputs: ['specification', 'artifact files', 'OBJECT and RIGHTS results', 'age band'],
    outputs: ['product record', 'completeness report', 'SKU draft'],
    evidence_floor: 'The artifact exists as files; every spec section is present; a reviewer has read it end to end.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
    self_check: 'Spec-to-artifact checklist: every section present, no placeholder text.',
    redundancy_check: 'A second reviewer reads it as the buyer would.',
    connected: ['OBJECT', 'RIGHTS', 'STORE', 'MONEY', 'LEGAL'],
    rules: {
      PASS: 'Complete artifact, OBJECT and RIGHTS pass.',
      PARTIAL: 'A pilot subset is complete (for example 10 of 30 cards) and may go forward as a pilot.',
      HOLD: 'Placeholder content, a missing section, or OBJECT/RIGHTS not passed.',
      ESCALATE: 'A product aimed at children with a physical component (toy safety), or a claim of educational outcome.'
    },
    gap_actions: {
      REMOVE: 'Cut the incomplete section.',
      REPAIR: 'Finish the missing section.',
      REPURPOSE: 'Ship the complete subset as a pilot or free sample.',
      ROUTE_AROUND: 'Release the digital version while the physical version is held.',
      ESCALATE: 'Chairman on physical children\'s goods and outcome claims.',
      PRESERVE_UNKNOWN: 'Unknown page count, format or age band stays UNKNOWN on the record.'
    }
  }),

  STORE: g({
    purpose: 'Decide whether a passed product may be listed in a store (draft or live).',
    inputs: ['PRODUCT result', 'price (PROPOSED or approved)', 'listing copy', 'delivery path', 'refund policy'],
    outputs: ['listing draft', 'listing state (DRAFT / LIVE)'],
    evidence_floor: 'Delivery path tested end-to-end with a test purchase; listing copy makes no unverified claim.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.CHAIRMAN,
    self_check: 'Does the listing promise anything the artifact does not contain?',
    redundancy_check: 'Test purchase receipt + protected download witnessed.',
    connected: ['PRODUCT', 'PUBLICATION', 'MONEY', 'LEGAL'],
    rules: {
      PASS: 'Chairman approved price and listing; test purchase witnessed.',
      PARTIAL: 'Listing prepared as DRAFT (unpublished); nothing is purchasable.',
      HOLD: 'No test purchase, or price is still PROPOSED.',
      ESCALATE: 'Always, for the move from DRAFT to LIVE.'
    },
    gap_actions: {
      REMOVE: 'Withdraw the listing.',
      REPAIR: 'Fix copy or delivery; re-run the test purchase.',
      REPURPOSE: 'List as a free sample to test delivery with no money path.',
      ROUTE_AROUND: 'Keep the product in the library while the store listing is held.',
      ESCALATE: 'Chairman approves price and go-live.',
      PRESERVE_UNKNOWN: 'Unset price stays UNSET — never defaulted.'
    }
  }),

  PUBLICATION: g({
    purpose: 'Decide whether anything leaves THYLORA to a public or third-party audience (post, page, email, listing, outreach).',
    inputs: ['artifact', 'audience', 'channel', 'PRIVACY, VISUAL and RIGHTS results'],
    outputs: ['publication decision', 'publication record'],
    evidence_floor: 'PRIVACY, VISUAL (if images) and RIGHTS all passed for this artifact and audience.',
    evidence_floor_value: 1.0,
    authority_floor: AUTHORITY.CHAIRMAN,
    self_check: 'Is the audience exactly the intended one? Is anything in it private?',
    redundancy_check: 'Final read of the exact bytes to be published, not the draft.',
    connected: ['PRIVACY', 'VISUAL', 'RIGHTS', 'STORE', 'LEGAL', 'AUTONOMY'],
    rules: {
      PASS: 'Upstream gates passed and Chairman instruction on record for this publication.',
      PARTIAL: 'Approved for an internal audience only.',
      HOLD: 'Any upstream gate not passed.',
      ESCALATE: 'All external outreach and all first posts. External outreach requires Chairman instruction.'
    },
    gap_actions: {
      REMOVE: 'Do not publish.',
      REPAIR: 'Pass the upstream gate, then re-submit.',
      REPURPOSE: 'Keep as an internal brief.',
      ROUTE_AROUND: 'Publish the part that passed; hold the rest.',
      ESCALATE: 'Chairman instruction required.',
      PRESERVE_UNKNOWN: 'Unknown audience = do not publish.'
    }
  }),

  MONEY: g({
    purpose: 'Decide whether any money can move: price, charge, credit, payout, subscription.',
    inputs: ['price record and status', 'processor', 'fee model', 'refund path', 'payer age class'],
    outputs: ['money path record', 'net-per-unit estimate'],
    evidence_floor: 'Price approved (not PROPOSED); processor connected and witnessed; refund path exists.',
    evidence_floor_value: 1.0,
    authority_floor: AUTHORITY.CHAIRMAN,
    self_check: 'Does net per unit stay positive after processor fees?',
    redundancy_check: 'Reconcile against the processor\'s own record, not THYLORA\'s.',
    connected: ['PRODUCT', 'STORE', 'LEGAL', 'AUTONOMY'],
    rules: {
      PASS: 'Chairman-approved price, witnessed processor, positive net, refund path.',
      PARTIAL: 'Money path designed and modelled; nothing charges.',
      HOLD: 'Price PROPOSED, processor unwitnessed, or net negative.',
      ESCALATE: 'Any stored value, prepaid credit, subscription, or payment from or for a minor.'
    },
    gap_actions: {
      REMOVE: 'Remove the charge; ship free.',
      REPAIR: 'Fix the fee model or bundle to make net positive.',
      REPURPOSE: 'Move a micro-price item into a bundle.',
      ROUTE_AROUND: 'Sell through the existing witnessed store path only.',
      ESCALATE: 'Chairman on credits, subscriptions and minors.',
      PRESERVE_UNKNOWN: 'Unknown price stays UNKNOWN (e.g. enterprise pricing).'
    }
  }),

  LEGAL: g({
    purpose: 'Flag anything with legal weight before it acts: consent to record, children\'s data, education claims, stored value, trademarks, contracts.',
    inputs: ['jurisdictions', 'audience age', 'recording / data practices', 'commitments made'],
    outputs: ['legal flag list', 'required-review list'],
    evidence_floor: 'Each flag either cleared by a qualified reviewer or held; THYLORA does not self-certify legal clearance.',
    evidence_floor_value: 1.0,
    authority_floor: AUTHORITY.CHAIRMAN,
    self_check: 'Does this create a commitment, collect a child\'s data, record a person, or hold money?',
    redundancy_check: 'Checklist per jurisdiction in scope; unknown jurisdiction = held.',
    connected: ['PERSON', 'PRIVACY', 'RIGHTS', 'PRODUCT', 'STORE', 'PUBLICATION', 'MONEY', 'AUTONOMY'],
    rules: {
      PASS: 'No flags, or every flag cleared by a qualified reviewer on record.',
      PARTIAL: 'Flagged features removed; the unflagged remainder proceeds.',
      HOLD: 'An open flag with no review.',
      ESCALATE: 'Children, recording consent, stored value, trademarks, contracts.'
    },
    gap_actions: {
      REMOVE: 'Remove the flagged feature.',
      REPAIR: 'Obtain qualified review.',
      REPURPOSE: 'Redesign the feature so it carries no flag (e.g. no child accounts; guardian holds the account).',
      ROUTE_AROUND: 'Launch in one jurisdiction with known rules.',
      ESCALATE: 'Chairman decides whether to seek review.',
      PRESERVE_UNKNOWN: 'Unknown legal status stays UNKNOWN — never "probably fine".'
    }
  }),

  AUTONOMY: g({
    purpose: 'Decide what the autonomy worker may do without a human: which lanes it may advance and which actions it must never take.',
    inputs: ['task autonomy_class', 'gate path of the route', 'upstream gate receipts'],
    outputs: ['autonomy decision', 'gate receipts', 'cross-gate warnings'],
    evidence_floor: 'The task names its gate path; every action the worker proposes maps to a gate whose authority floor it meets.',
    evidence_floor_value: 0.9,
    authority_floor: AUTHORITY.AUTONOMY_SAFE_INTERNAL,
    self_check: 'Did the worker claim an external action, deployment, payment or completion without evidence?',
    redundancy_check: 'Deterministic code re-computes A for each gate from autonomy_class; the model\'s own self-assessment never grants authority.',
    connected: ['PRIVACY', 'PUBLICATION', 'MONEY', 'LEGAL'],
    rules: {
      PASS: 'Internal drafting on a route whose gates it may pass.',
      PARTIAL: 'Worker completes the internal part and parks the rest as WAITING_CHAIRMAN.',
      HOLD: 'The route has no gate path, or a receipt is missing.',
      ESCALATE: 'Any STORE, PUBLICATION, MONEY or LEGAL action; all external outreach.'
    },
    gap_actions: {
      REMOVE: 'Drop the proposed action.',
      REPAIR: 'Attach the missing gate path or receipt.',
      REPURPOSE: 'Convert an external action into an internal draft for review.',
      ROUTE_AROUND: 'Continue independent lanes; one held lane never stops another.',
      ESCALATE: 'Park as WAITING_CHAIRMAN.',
      PRESERVE_UNKNOWN: 'Unknown autonomy_class = CHAIRMAN_RESERVED.'
    }
  })
});

export const GATE_CODES = Object.freeze(Object.keys(GATES));

/** Undirected adjacency list derived from each gate's `connected`. */
export function adjacency() {
  return Object.fromEntries(GATE_CODES.map(code => [code, [...GATES[code].connected]]));
}

/** Every structural problem in the graph. Empty array = consistent. */
export function validateGraph() {
  const problems = [];
  for (const code of GATE_CODES) {
    const gate = GATES[code];
    for (const other of gate.connected) {
      if (!GATES[other]) problems.push(`${code} → ${other}: unknown gate`);
      else if (!GATES[other].connected.includes(code)) problems.push(`${code} → ${other}: edge not reciprocated`);
      if (other === code) problems.push(`${code}: self-edge`);
    }
    for (const d of DECISIONS) if (!gate.rules[d]) problems.push(`${code}: missing ${d} rule`);
    for (const a of GAP_ACTIONS) if (!gate.gap_actions[a]) problems.push(`${code}: missing ${a} gap action`);
    for (const f of ['purpose', 'evidence_floor', 'self_check', 'redundancy_check']) {
      if (!gate[f]) problems.push(`${code}: missing ${f}`);
    }
  }
  return problems;
}

const isUnit = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;

/**
 * Evaluate one gate for one route instance.
 *
 * @param {string} code  gate code
 * @param {{E?:number|null,C?:number|null,R?:number|null,X?:number|null}} factors
 *        measured factors in [0,1]; null/undefined means UNKNOWN
 * @param {{authority_level:number}} ctx  held authority (see AUTHORITY)
 * @returns {{gate, G, factors, decision, gap_action, reasons, warnings}}
 */
export function evaluateGate(code, factors = {}, ctx = {}) {
  const gate = GATES[code];
  if (!gate) throw new Error(`Unknown gate ${code}`);
  const held = Number.isInteger(ctx.authority_level) ? ctx.authority_level : AUTHORITY.NONE;
  const A = held >= gate.authority_floor ? 1 : 0;
  const f = { E: factors.E, C: factors.C, A, R: factors.R, X: factors.X };
  const reasons = [];

  const unknown = ['E', 'C', 'R', 'X'].filter(k => f[k] === null || f[k] === undefined);
  const invalid = ['E', 'C', 'R', 'X'].filter(k => !unknown.includes(k) && !isUnit(f[k]));
  if (invalid.length) throw new Error(`${code}: factors out of [0,1]: ${invalid.join(', ')}`);

  let decision, gap_action;
  if (A === 0) {
    decision = 'ESCALATE'; gap_action = 'ESCALATE';
    reasons.push(`authority ${held} below floor ${gate.authority_floor}`);
  } else if (unknown.length) {
    decision = 'HOLD'; gap_action = 'PRESERVE_UNKNOWN';
    reasons.push(`UNKNOWN factors: ${unknown.join(', ')}`);
  } else if (f.E < gate.evidence_floor_value) {
    decision = 'HOLD'; gap_action = 'REPAIR';
    reasons.push(`evidence ${f.E} below floor ${gate.evidence_floor_value}`);
  } else {
    const G = f.E * f.C * f.A * f.R * f.X;
    if (G >= PASS_THRESHOLD) { decision = 'PASS'; gap_action = null; }
    else { decision = 'PARTIAL'; gap_action = f.X < 1 ? 'ROUTE_AROUND' : 'REPAIR'; reasons.push(`G ${round(G)} below ${PASS_THRESHOLD}`); }
  }

  const G = unknown.length ? null : round(f.E * f.C * f.A * f.R * f.X);
  const warnings = decision === 'PASS' ? [] : gate.connected.map(to => ({
    from: code, to, decision, message: `${code} is ${decision}: ${reasons.join('; ')}`
  }));
  return { gate: code, G, factors: f, decision, gap_action, reasons, warnings };
}

/**
 * X for a gate given open warnings addressed to it on the SAME route instance.
 * Each open warning halves clearance. Warnings from other routes never apply:
 * that is what keeps lanes independent.
 */
export function crossGateClearance(code, warnings, routeId) {
  const open = warnings.filter(w => w.to === code && w.route === routeId);
  return open.length ? round(0.5 ** open.length) : 1;
}

/**
 * Evaluate an ordered gate path for one route instance. Cross-gate warnings
 * raised by earlier gates reduce X on later connected gates in this route only.
 * Returns the route decision (worst gate wins) and receipts for each gate.
 */
export function evaluateRoute(routeId, path, measured = {}, ctx = {}) {
  const receipts = [];
  const warnings = [];
  for (const code of path) {
    const m = measured[code] || {};
    const X = m.X ?? crossGateClearance(code, warnings, routeId);
    const r = evaluateGate(code, { ...m, X }, ctx);
    receipts.push({ route: routeId, ...r });
    for (const w of r.warnings) warnings.push({ ...w, route: routeId });
  }
  const order = ['PASS', 'PARTIAL', 'HOLD', 'ESCALATE'];
  const decision = receipts.reduce((worst, r) =>
    order.indexOf(r.decision) > order.indexOf(worst) ? r.decision : worst, 'PASS');
  return { route: routeId, decision, receipts, warnings };
}

/**
 * Ω_k = (V×E×C×Rev×Cap×Fit) ÷ (1 + Risk + Cost + Dep)
 * Numerator terms in [0,1]; denominator terms ≥ 0. Any UNKNOWN term → null
 * (the route is not ranked rather than ranked on a guess).
 */
export function routeValue(t) {
  const num = ['V', 'E', 'C', 'Rev', 'Cap', 'Fit'];
  const den = ['Risk', 'Cost', 'Dep'];
  if ([...num, ...den].some(k => t[k] === null || t[k] === undefined)) return null;
  for (const k of num) if (!isUnit(t[k])) throw new Error(`Ω: ${k} out of [0,1]`);
  for (const k of den) if (!(typeof t[k] === 'number' && t[k] >= 0)) throw new Error(`Ω: ${k} must be ≥ 0`);
  const top = num.reduce((p, k) => p * t[k], 1);
  return round(top / (1 + t.Risk + t.Cost + t.Dep));
}

/**
 * Which lanes may continue. A lane is blocked only by HOLD/ESCALATE on its
 * own route; other lanes' results never block it.
 */
export function laneContinuation(routeResults) {
  return Object.fromEntries(routeResults.map(r => [r.route, {
    continue: r.decision === 'PASS' || r.decision === 'PARTIAL',
    decision: r.decision,
    parked: r.receipts.filter(x => x.decision === 'HOLD' || x.decision === 'ESCALATE').map(x => x.gate)
  }]));
}

function round(n) { return Math.round(n * 1000) / 1000; }
