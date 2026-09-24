// THYLORA SPINE · QYRIS-2ST advancement engine
// Question → Yield → Reason → Inspect → Safeguard → Act → Transfer
//
// Pure functions. Input: a read-only snapshot of open backend records
// (spine/snapshots/*.json). Output: one advancement record per item, the shared
// dependency clusters that let one action move many items, and data-quality
// findings. Nothing here writes to the backend, a store, a payment provider or
// any external party. Every "act" it proposes that crosses a gate is routed to
// the Chairman rather than performed.

export const LANES = [
  'commerce', 'store', 'publishing', 'film_show', 'education',
  'software_app', 'world_continuity', 'rights_provenance', 'security', 'revenue',
];

// Registry → primary lane when no keyword is decisive.
const REGISTRY_LANE = {
  idea: 'world_continuity', revenue: 'revenue', program: 'world_continuity',
  work: 'software_app', workroom: 'software_app', wtask: 'software_app',
  realization: 'commerce', store: 'store', product: 'store', commercial: 'commerce',
  production: 'film_show', autonomy_open: 'software_app',
};

const LANE_WORDS = {
  store: /\bshopify|storefront|\bstore\b|shelf|listing|checkout|sku\b/i,
  commerce: /\bprice|pricing|merch|apparel|\bkit\b|product|catalog|subscription|membership/i,
  publishing: /\bbook\b|\bpdf\b|\bedf\b|publish|reading pack|notebook|comic|magazine|\bprint/i,
  film_show: /\bshow\b|episode|film|season|studio|render|scene|teaser|broadcast|news program|pilot episode/i,
  education: /educat|lesson|curriculum|learn|teacher|understanding|school|question quest|student/i,
  software_app: /\bapp\b|dashboard|runtime|backend|schema|migration|api\b|engine|software|agent|deploy|pwa/i,
  world_continuity: /edereairah|ersatzreality|\bworld\b|canon|continuity|lineage|castle|estate|character/i,
  rights_provenance: /rights|provenance|consent|licen[cs]|copyright|trademark|chain of title|passport/i,
  security: /securit|\brls\b|credential|identity|privacy|safeguard|fraud|protect|guardian/i,
  revenue: /revenue|monetiz|payout|sale|sold|buyer|income|margin|ledger/i,
};

// Hard gates. Any match means the Act step is routed to the Chairman, never done.
export const GATES = {
  PUBLIC_RELEASE: /\bpublish|public launch|go live|activate|release\b|active_allowed|make public/i,
  PAYMENT: /payment|stripe|checkout|payout|charge|refund|\bbuy\b|purchase/i,
  PRICE: /price approval|confirm the price|approve.*price|price not authori|chairman-approved price/i,
  LEGAL: /legal|contract|agreement|terms of service|jurisdiction|regulat|licensed|compliance|\bphi\b|hipaa/i,
  IDENTITY: /identity verif|\bkyc\b|verify identity|recipient verification|guardian authority/i,
  OUTREACH: /outreach|external customer|contact .*(buyer|partner)|email to|send to|pitch/i,
  SPEND_ACCOUNT: /vendor|account open|provider decision|credential|subscription cost|quote|spend/i,
  PRODUCTION_DDL: /apply (the )?migration|production ddl|\bddl\b/i,
  CHAIRMAN_DECISION: /chairman (decides|reviews|decision|approval|witness|must)|awaiting chairman|chairman-only|needs chairman/i,
};

// Shared dependency clusters. One resolving action advances every member.
export const CLUSTERS = [
  ['CHAIRMAN_RELEASE_REVIEW', /release \/ revise \/ hold|chairman reviews rendered|awaiting chairman|chairman_decision|chairman decides|chairman-only/i],
  ['PRICE_APPROVAL', /price approval|approve.*price|confirm the price|price not authori|price bands|chairman-approved price/i],
  ['RIGHTS_EVIDENCE', /rights (not verified|evidence|cleared|terms)|rights\/privacy|provenance evidence/i],
  ['CHECKOUT_REACCESS_WITNESS', /checkout|re-?access|entitlement.*witness|download audit|mobile (shelf )?preview/i],
  ['ARTIFACT_QUALITY_REBUILD', /quality rebuild|rebuild the customer-facing|actual pdf|deliverable file|missing source pdf|no cover asset/i],
  ['VISUAL_APPROVAL', /visual approval|cover brief|visual gate|imagery|image generation author/i],
  ['PROVIDER_ACCOUNT', /provider|vendor|account|credential|deployment credentials/i],
  ['LEGAL_REVIEW', /legal|jurisdiction|regulat|licensed-trade|compliance|terms of service|creator agreement/i],
  ['TRUTH_EVIDENCE_GATE', /truth\/evidence gate|evidence gate|not verified|verify/i],
  ['RUNTIME_WITNESS', /runtime|witness|not_witnessed|deployed/i],
  ['SOURCE_ACCESS', /no (live|direct) (access|source)|file tree access|codebase repository/i],
  ['MARKET_CHANNEL', /market\/channel|channel fit|first genuine|traffic/i],
];

const TERMINAL = /^(COMPLETE|COMPLETED|DONE|RETIRED)$|^SUPERSEDED|^CLOSED/i;

function text(...parts) {
  return parts.map(p => (p == null ? '' : typeof p === 'string' ? p : JSON.stringify(p))).join(' · ');
}

export function flatten(snapshot) {
  const out = [];
  for (const [registry, rows] of Object.entries(snapshot)) {
    if (!Array.isArray(rows)) continue;
    for (const r of rows) {
      const state = String(r.state ?? '');
      if (TERMINAL.test(state)) continue;
      if (registry === 'product' && /published/i.test(state) && /verified/i.test(r.rel ?? '')) continue;
      if (registry === 'store' && r.active) continue; // live and selling: not open work
      out.push({ registry, ...r });
    }
  }
  return out;
}

export function classifyLanes(item) {
  const hay = text(item.title, item.cat, item.kind, item.type, item.family, item.state, item.blocker, item.blockers, item.next, item.dept);
  const hits = LANES.filter(l => LANE_WORDS[l].test(hay));
  const primary = REGISTRY_LANE[item.registry] ?? 'software_app';
  return { primary, touches: [...new Set([primary, ...hits])] };
}

export function detectGates(item) {
  const hay = text(item.blocker, item.blockers, item.next, item.state, item.deps, item.dep);
  return Object.entries(GATES).filter(([, re]) => re.test(hay)).map(([g]) => g);
}

export function detectClusters(item) {
  const hay = text(item.blocker, item.blockers, item.next, item.deps, item.dep, item.state, item.unresolved);
  const hits = CLUSTERS.filter(([, re]) => re.test(hay)).map(([c]) => c);
  if (item.registry === 'store') {
    for (const [flag, c] of [['checkout', 'CHECKOUT_REACCESS_WITNESS'], ['reaccess', 'CHECKOUT_REACCESS_WITNESS'],
      ['mobile', 'CHECKOUT_REACCESS_WITNESS'], ['rights', 'RIGHTS_EVIDENCE'], ['vis', 'VISUAL_APPROVAL'],
      ['art', 'ARTIFACT_QUALITY_REBUILD']]) {
      if (item[flag] === false && !hits.includes(c)) hits.push(c);
    }
  }
  return hits;
}

export function truthClass(item) {
  const t = String(item.truth ?? item.layer ?? '');
  const hay = text(item.title, t, item.dept);
  if (/EDEREAIRAH|ERSATZ|WORLD/i.test(t) || /edereairah|ersatzreality/i.test(hay)) {
    return /DUAL|CROSS/i.test(t) ? 'DUAL_LAYER' : 'SIMULATED_WORLD';
  }
  if (/DUAL|CROSS/i.test(t)) return 'DUAL_LAYER';
  if (/EARTH_ACTUAL/i.test(t)) return 'EARTH_ACTUAL';
  if (/EARTH/i.test(t)) return 'EARTH_PROPOSED';
  return 'UNDECLARED';
}

// Personnel that exist only inside the world must never read as Earth-licensed.
export function personnelNote(item) {
  const hay = text(item.title, item.next, item.blocker, item.blockers);
  if (!/staff|personnel|employee|physician|doctor|lawyer|counsel|attorney|nurse|engineer|jurist|worker|roster/i.test(hay)) return null;
  const tc = truthClass(item);
  if (tc === 'SIMULATED_WORLD') return 'Personnel are simulated EdereAirah staff. They are not Earth-licensed professionals and must not be presented as such.';
  if (tc === 'DUAL_LAYER') return 'Mixed layer. Simulated EdereAirah staff and any Earth-licensed professional must be listed separately and labelled.';
  return 'Earth personnel. Any licensed role needs a verified real licence before it is represented. None is claimed here.';
}

export function findingsFor(item, ctx) {
  const f = [];
  const next = typeof item.next === 'string' ? item.next.trim() : '';
  if (!next && !['store', 'product', 'production', 'autonomy_open'].includes(item.registry)) f.push('MISSING_NEXT_ACTION');
  if (next && (ctx.nextFreq.get(next.slice(0, 120)) ?? 0) >= 10) f.push('TEMPLATE_NEXT_ACTION');
  const blocker = item.blocker ?? item.blockers;
  const hasBlockerField = 'blocker' in item || 'blockers' in item;
  if (hasBlockerField && (!blocker || blocker === '[]' || blocker === 'null')) f.push('BLOCKER_UNDECLARED');
  if (item.updated && ctx.capturedAt && (ctx.capturedAt - Date.parse(item.updated)) > 14 * 864e5) f.push('STALE_OVER_14_DAYS');
  // revenue_paths.product_id is a uuid FK to products.id (verified live 2026-09-24). A uuid
  // ref can only be judged orphaned when the snapshot carries product uuids.
  const uuidRef = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(item.product ?? ''));
  if (item.registry === 'revenue' && item.product && !ctx.knownProducts.has(String(item.product))
      && (!uuidRef || ctx.hasProductUuids)) f.push('ORPHAN_PRODUCT_REF');
  if (item.registry === 'revenue' && !item.product) f.push('REVENUE_PATH_NO_PRODUCT');
  if (item.registry === 'revenue' && item.idea && !ctx.knownIdeas.has(String(item.idea))) f.push('ORPHAN_IDEA_REF');
  if (truthClass(item) === 'UNDECLARED' && ['idea', 'program', 'realization'].includes(item.registry)) f.push('TRUTH_CLASS_UNDECLARED');
  return f;
}

const CONSEQUENCE = {
  revenue: (it, g) => it.registry === 'store' || it.registry === 'commercial'
    ? (g.includes('PAYMENT') || g.includes('PUBLIC_RELEASE') ? 'Direct. Sellable once the gate clears. No sale is claimed.' : 'Direct but not yet gated for sale.')
    : it.registry === 'revenue' ? 'Path is recorded, but revenue is 0 until a real product and checkout exist.' : 'Indirect. Feeds a future revenue path.',
  store: (it) => ['store', 'product', 'commercial', 'realization'].includes(it.registry) ? 'Affects a store listing or shelf.' : 'None directly.',
  production: (it, g, lanes) => lanes.touches.includes('film_show') || lanes.touches.includes('publishing') ? 'Feeds media or publishing production.' : 'None directly.',
  security: (it, g, lanes) => lanes.touches.includes('security') || g.includes('IDENTITY') ? 'Touches identity, privacy or access. The gate stays on.' : 'No new exposure. Read-only classification.',
};

export function qyris(item, ctx) {
  const lanes = classifyLanes(item);
  const gates = detectGates(item);
  const clusters = detectClusters(item);
  const findings = findingsFor(item, ctx);
  const tc = truthClass(item);
  const gated = gates.length > 0;
  const existingNext = typeof item.next === 'string' && item.next.trim() && !findings.includes('TEMPLATE_NEXT_ACTION') ? item.next.trim() : null;
  const nextAction = gated
    ? `CHAIRMAN GATE (${gates.join(', ')}): ${existingNext ?? 'decide or authorize before the next step'}`
    : existingNext ?? `Replace the template or missing next action with one executable step for the ${lanes.primary} lane${clusters[0] ? `, starting with cluster ${clusters[0]}` : ''}.`;
  return {
    id: String(item.id), registry: item.registry, title: item.title ?? null, truth_class: tc,
    qyris: {
      question: `What is the smallest step that moves "${item.title ?? item.id}" from ${item.state || 'its current state'} with evidence?`,
      yield: lanes.touches.includes('revenue') || ['store', 'commercial'].includes(item.registry) ? 'money-adjacent' : 'capability',
      reason: clusters.length ? `Shares ${clusters.length} blocker cluster(s): ${clusters.join(', ')}` : 'No shared cluster detected. Needs work specific to this item.',
      inspect: findings,
      safeguard: gated ? gates : ['NONE_DETECTED'],
      act: 'Classified, clustered and gate-checked in this run. No backend, store, payment or outreach action was taken.',
      transfer: clusters.length ? `Resolving ${clusters[0]} moves every member of that cluster.` : 'None.',
    },
    record: {
      baseline: { state: item.state ?? null, updated: item.updated ?? null },
      delta: `QYRIS-2ST record created. Lanes: ${lanes.touches.join('/')}. Clusters: ${clusters.join('/') || '-'}. Findings: ${findings.join('/') || '-'}`,
      affected_dependents: clusters,
      evidence: `spine/snapshots/backend-open-items-20260924.json · ${item.registry}:${item.id}`,
      blocker: item.blocker ?? item.blockers ?? null,
      next_executable_action: nextAction,
      revenue_consequence: CONSEQUENCE.revenue(item, gates, lanes),
      store_consequence: CONSEQUENCE.store(item, gates, lanes),
      production_consequence: CONSEQUENCE.production(item, gates, lanes),
      security_consequence: CONSEQUENCE.security(item, gates, lanes),
    },
    lanes, gates, clusters, findings, personnel: personnelNote(item),
  };
}

export function buildContext(snapshot) {
  const nextFreq = new Map();
  for (const rows of Object.values(snapshot)) {
    if (!Array.isArray(rows)) continue;
    for (const r of rows) {
      if (typeof r.next === 'string' && r.next.trim()) {
        const k = r.next.trim().slice(0, 120);
        nextFreq.set(k, (nextFreq.get(k) ?? 0) + 1);
      }
    }
  }
  const knownProducts = new Set();
  for (const k of ['product', 'commercial', 'realization', 'store']) for (const r of snapshot[k] ?? []) {
    knownProducts.add(String(r.id)); if (r.ext) knownProducts.add(String(r.ext)); if (r.uuid) knownProducts.add(String(r.uuid));
  }
  const hasProductUuids = (snapshot.product ?? []).some(r => r.uuid);
  const knownIdeas = new Set((snapshot.idea ?? []).map(r => String(r.id)));
  return { nextFreq, knownProducts, knownIdeas, hasProductUuids, capturedAt: snapshot.captured_at ? Date.parse(snapshot.captured_at) : null };
}

// Store rows: how many release gates are already passed. Higher = nearer money.
export const STORE_GATES = ['src', 'art', 'vis', 'rights', 'delivery', 'reaccess', 'checkout', 'mobile'];
export function storeProximity(row) {
  const passed = STORE_GATES.filter(g => row[g] === true).length;
  return { passed, of: STORE_GATES.length, missing: STORE_GATES.filter(g => row[g] !== true) };
}

export function run(snapshot) {
  const ctx = buildContext(snapshot);
  const items = flatten(snapshot);
  const records = items.map(it => qyris(it, ctx));
  const clusters = {};
  for (const r of records) for (const c of r.clusters) (clusters[c] ??= []).push(r.id);
  const lanes = Object.fromEntries(LANES.map(l => [l, records.filter(r => r.lanes.touches.includes(l)).length]));
  const findings = {};
  for (const r of records) for (const f of r.findings) findings[f] = (findings[f] ?? 0) + 1;
  const gates = {};
  for (const r of records) for (const g of r.gates) gates[g] = (gates[g] ?? 0) + 1;
  const byRegistry = {};
  for (const r of records) byRegistry[r.registry] = (byRegistry[r.registry] ?? 0) + 1;
  const stateVocab = {};
  for (const it of items) (stateVocab[it.registry] ??= new Set()).add(String(it.state));
  const moneyNearest = (snapshot.store ?? []).filter(r => !r.active)
    .map(r => ({ id: r.ext ?? r.id, title: r.title, state: r.state, ...storeProximity(r) }))
    .sort((a, b) => b.passed - a.passed);
  return {
    records, clusters, lanes, findings, gates, byRegistry, moneyNearest,
    stateVocab: Object.fromEntries(Object.entries(stateVocab).map(([k, v]) => [k, v.size])),
    total: records.length,
  };
}
