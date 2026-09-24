"""THYLORA System Promotion Audit classifier.

Reads raw signal snapshots pulled read-only from thylora-dash
(jvsdxhrfhtlgaknhjxlz) and scores every public table with
M = D x P x E x W x T. Nothing here writes to the backend.
"""
import json, os, re, sys

SNAP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'snapshot')
OUT = os.path.dirname(os.path.abspath(__file__))

def load(name, default=None):
    p = os.path.join(SNAP, name)
    return json.load(open(p)) if os.path.exists(p) else default

sig = {r['t']: r for r in load('signals.json')}
exe = {r['t']: r for r in load('exec.json')}
wri = {r['t']: r for r in load('writers.json')}
repo = load('reporefs.json', {})
edge = load('edge_map.json', {}) or {}
inline = load('inline_witness.json', {}) or {}

# audit_events.entity_type / master_ledger.target_component use logical names,
# not table names. Map the ones that resolve unambiguously.
WITNESS_ALIAS = {
    'execution_work': ['thylora_execution_work_registry'],
    'order': ['orders'],
    'IDEA': ['idea_registry'],
    'SOCIAL_CONTENT': ['social_content_queue'],
    'thylora_continuity_payload': ['thylora_continuity_payloads'],
    'thylora_thread_import_batch': ['thylora_thread_import_batches'],
    'THYLORA_CHAIRMAN_COMMAND': ['thylora_chairman_commands'],
    'THYLORA_AI_ROUTER': ['thylora_router_jobs'],
    'thylora_chairman_commands': ['thylora_chairman_commands'],
    'thylora_router_jobs': ['thylora_router_jobs'],
    'orders/payments/entitlements': ['orders', 'payments', 'entitlements'],
    'orders/entitlements': ['orders', 'entitlements'],
}
# Tables under a custody trigger: append-only / immutable guards, or the
# destructive-change capture into thylora_continuity_audit_shadow.
CUSTODY = {
    'audit_events': 'append_only', 'tasteprint_versions': 'immutable', 'thy_loochy_accounts': 'ledger_write_guard',
    'thy_loochy_transactions': 'append_only', 'thy_omniview_statements': 'supersede_only',
    'thy_sequence_ledger': 'append_only+chain_guard', 'thylora_edf_text_blocks': 'frozen_after_publish',
    'thylora_submit_uploads': 'append_only',
}
for t in ['thylora_one_way_gate_registry', 'thylora_succession_continuity_registry', 'thylora_succession_directives',
          'idea_registry', 'thylora_story_seed_registry', 'thylora_query_carryforward', 'continuity_log',
          'thylora_response_continuity_policy']:
    CUSTODY[t] = 'shadow_capture_before_destructive_change'
for t in ['thylora_ip_provenance_attestations', 'thylora_ip_license_grants', 'thylora_ip_manifest_declarations',
          'thylora_ip_jurisdiction_reviews', 'thylora_ip_consent_state_events', 'thylora_ip_gate_evaluations',
          'thylora_ip_chain_of_title_events', 'thylora_ip_consent_tokens', 'thylora_agent_memory_votes',
          'thylora_agent_memory_snapshots', 'thylora_agent_memory_retrieval_telemetry', 'thylora_agent_memory_nodes',
          'chairman_source_messages', 'chairman_source_amendments', 'thylora_thread_continuity_evidence',
          'thylora_thread_clock_events', 'thylora_chairman_review_decisions', 'thylora_continuity_anchor_authority',
          'chairman_source_segments', 'thylora_continuity_row_disposition']:
    CUSTODY[t] = 'append_only'
alias_w = {}
for k, ts in WITNESS_ALIAS.items():
    for t in ts:
        alias_w.setdefault(t, []).append(k)

edge_r, edge_w = {}, {}
edge_audited = set()
for slug, m in edge.items():
    if 'audit_events' in (m.get('writes') or []):
        edge_audited.update(m.get('writes') or [])
    for t in (m.get('reads') or []):
        edge_r.setdefault(t, []).append(slug)
    for t in (m.get('writes') or []):
        edge_w.setdefault(t, []).append(slug)

SURFACE_FN = re.compile(r'dashboard|chairman|control_surface|omniview|current_head|today|_page|graph_lookup|completion|readback|library|preview|surface|feed|view')
EVENT_NAME = re.compile(r'(refund|takedown|purge|security_event|integrity|exception|incident|complaint|correction|dispute|responsible_play|recall|violation|appeal|grievance|breach|revocation|chargeback|audit_events|_scan)')
POLICY_NAME = re.compile(r'(_policy|_registry|_taxonomy|_matrix|_standard|_gate|_protocol|_map|_catalog|_templates?|_rules?|_configuration|_plans|_categories|_thresholds|_types|_canon|_constitution)$')

HIGH = [
    (re.compile(r'order|payment|checkout|cart|stripe|lemon|entitlement|subscription|payout|refund|invoice|revenue|price|store|shopify|commerce|financial_ledger|credit_ledger|estate_ledger|tax_ledger|capture|download|membership'), 5, 'COMMERCE'),
    (re.compile(r'child|safeguard|consent|guardian|identity|privacy|patient|adult|game_bet|legal|rights|purge|takedown|security|trust|protection|responsible'), 5, 'SAFETY/LEGAL'),
    (re.compile(r'approval|production|product|passport|continuity|connection_evidence|dashboard|chairman|witness|evidence|handoff|execution|work_registry|qyris'), 4, 'DASHBOARD-FLOOR'),
    (re.compile(r'family|worker|business|freshpath|payroll|job_'), 3, 'OPERATIONS'),
]

def domain(t):
    for rx, w, name in HIGH:
        if rx.search(t):
            return w, name
    return 2, 'GENERAL'

def split(s):
    return [x for x in (s or '').split('|') if x]

rows = []
for t, s in sorted(sig.items()):
    e, w = exe.get(t, {}), wri.get(t, {})
    n = s['n']
    procs = split(e.get('pr'))
    writers = split(w.get('w')) + split(w.get('tw'))
    views = split(e.get('vw'))
    trig = split(s.get('tg'))
    children = [c.replace('public.', '') for c in split(s.get('fis'))]
    parents = [c.replace('public.', '') for c in split(s.get('fos'))]
    live_children = [c for c in children if c != t and sig.get(c, {}).get('n', 0) > 0]
    live_parents = [c for c in parents if c != t and sig.get(c, {}).get('n', 0) > 0]
    surface_procs = [p for p in procs if SURFACE_FN.search(p)]
    # db/ migrations here are NOT applied to thylora-dash (rael_ lane), so they are not a live path.
    repo_hits = [f for f in repo.get(t, []) if not f.startswith('db/')]
    er, ew = edge_r.get(t, []), edge_w.get(t, [])

    strong_w = {k: e.get(k) for k in ('ae', 'sh', 'ml', 'ef') if e.get(k)}
    if t in alias_w: strong_w['audit_alias'] = alias_w[t]
    if inline.get(t): strong_w['row_evidence_fields'] = inline[t]
    if t in edge_audited and t != 'audit_events': strong_w['edge_writer_emits_audit_event'] = True
    if t in CUSTODY: strong_w['custody_trigger'] = CUSTODY[t]
    if t in ('audit_events', 'thylora_continuity_audit_shadow', 'thylora_master_ledger'): strong_w['is_witness_ledger'] = True
    narrative_w = e.get('cl') or 0

    D = 1
    P = 1 if n > 0 else 0
    # Execution: something downstream acts on / consumes the rows.
    exec_evidence = []
    if writers: exec_evidence.append('writer_fn:' + ','.join(writers[:3]))
    if trig: exec_evidence.append('trigger:' + ','.join(trig[:3]))
    if procs: exec_evidence.append('reader_fn:' + ','.join(procs[:3]))
    if views: exec_evidence.append('view:' + ','.join(views[:3]))
    if live_children: exec_evidence.append('fk_child_rows:' + ','.join(live_children[:3]))
    if ew or er: exec_evidence.append('edge:' + ','.join(sorted(set(ew + er))[:3]))
    E = 1 if exec_evidence else 0
    W = 1 if strong_w else 0
    transfer = []
    if surface_procs: transfer.append('surface_fn:' + ','.join(surface_procs[:3]))
    if views: transfer.append('view')
    if repo_hits: transfer.append('repo:' + ','.join(repo_hits[:2]))
    if er or ew: transfer.append('edge')
    if live_children: transfer.append('fk_child')
    T = 1 if transfer else 0
    M = D * P * E * W * T

    kind = 'EVENT' if EVENT_NAME.search(t) else ('POLICY/REGISTRY' if POLICY_NAME.search(t) else 'OPERATIONAL')
    has_path = bool(writers or trig or procs or views or repo_hits or er or ew)

    if n == 0:
        if kind == 'EVENT' and has_path:
            cls = 'INTENTIONALLY EMPTY'
        elif has_path or live_parents:
            cls = 'POPULATION MISSING'
        else:
            cls = 'SCAFFOLD ONLY'
    else:
        if not E:
            cls = 'EXECUTION MISSING'
        elif not W:
            cls = 'WITNESS MISSING'
        elif not T:
            cls = 'TRANSFER MISSING'
        else:
            cls = 'PROMOTED (M=1)'

    weight, dom = domain(t)
    missing = [k for k, v in zip('DPEWT', (D, P, E, W, T)) if not v]
    # Repair priority: impact x closeness to promotion x dependency pull.
    closeness = {0: 0, 1: 5, 2: 3, 3: 2, 4: 1, 5: 0}[len(missing)]
    dep = 1 + min(len(children), 4) * 0.25 + min(len(live_parents), 4) * 0.25
    if cls in ('INTENTIONALLY EMPTY', 'PROMOTED (M=1)'):
        priority = 0.0
    elif cls == 'SCAFFOLD ONLY':
        priority = round(weight * 0.5 * dep, 2)
    else:
        priority = round(weight * max(closeness, 1) * dep, 2)

    rows.append(dict(table=t, rows=n, kind=kind, domain=dom, cls=cls,
                     D=D, P=P, E=E, W=W, T=T, M=M, missing=''.join(missing),
                     exec_evidence=exec_evidence, witness={**strong_w, 'continuity_log_mentions': narrative_w},
                     transfer=transfer, live_parents=live_parents, fk_children=children,
                     description=s.get('d'), priority=priority))

# Private schema was listed but not counted: record honestly.
rows.append(dict(table='private.adult_identity_vault', rows=None, kind='OPERATIONAL', domain='SAFETY/LEGAL',
                 cls='UNKNOWN', D=1, P=None, E=None, W=None, T=None, M=None, missing='?',
                 exec_evidence=[], witness={}, transfer=[], live_parents=[], fk_children=[],
                 description='private schema; row count not read by this audit (planner estimate -1 = never analysed)',
                 priority=0.0))

json.dump(rows, open(os.path.join(OUT, 'classification.json'), 'w'), indent=1, default=str)
from collections import Counter
c = Counter(r['cls'] for r in rows)
print(json.dumps(c, indent=1))
