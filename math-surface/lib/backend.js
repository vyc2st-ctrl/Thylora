// THYLORA · mathematics surface backend client
// Workroom: WR-MATH-SURFACE-001
//
// One backend, one session. This surface speaks to the same thylora-dash
// project and reuses the same browser session key as the member app and RAE
// Link. It creates no second identity system and no second source of truth.
//
// The db/math-surface tables are held for Chairman application. Until they
// exist the client must degrade honestly — a missing table is reported as "not
// provisioned yet", never as an empty result that looks like a learner with no
// record. Meanwhile every card is written to local append-only storage, so a
// sitting is never lost waiting on a migration.

import { createRepository, browserStorageAdapter, memoryAdapter } from './persistence.js';

export const SUPABASE_URL = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ';
export const SESSION_KEY = 'thylora_app_auth_session';
export const LOCAL_PREFIX = 'thy_math_';

export class BackendError extends Error {
  constructor(message, { status = 0, code = null, provisionRequired = false } = {}) {
    super(message);
    this.name = 'BackendError';
    this.status = status;
    this.code = code;
    this.provisionRequired = provisionRequired;
  }
}

// PostgREST reports an absent table or function with these codes. They mean
// "the migration has not been applied", not "the request was wrong".
const PROVISION_CODES = new Set(['PGRST202', 'PGRST205', '42P01', '42883']);

export function getSession() {
  try { return JSON.parse(globalThis.sessionStorage?.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export function currentUser() { return getSession()?.user ?? null; }
function authToken() { return getSession()?.access_token || SUPABASE_KEY; }

export async function api(path, { method = 'GET', body = null, auth = true, headers = {} } = {}) {
  const requestHeaders = { apikey: SUPABASE_KEY, ...headers };
  if (auth) requestHeaders.Authorization = `Bearer ${authToken()}`;
  if (body !== null) requestHeaders['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}${path}`, {
      method, headers: requestHeaders, body: body === null ? undefined : JSON.stringify(body)
    });
  } catch (networkError) {
    throw new BackendError(`Backend unreachable: ${networkError.message}`, { status: 0 });
  }

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const code = data && typeof data === 'object' ? data.code : null;
    const provisionRequired = PROVISION_CODES.has(code) || response.status === 404;
    const message = (data && typeof data === 'object' && (data.message || data.hint)) || `Backend responded ${response.status}`;
    throw new BackendError(message, { status: response.status, code, provisionRequired });
  }
  return data;
}

/**
 * Local-first repository. The surface always writes here first, so a card
 * exists on the device the moment it is recorded. The backend is a second
 * destination, not a precondition.
 */
export function localRepository() {
  const storage = globalThis.localStorage;
  return createRepository(storage ? browserStorageAdapter(storage, LOCAL_PREFIX) : memoryAdapter());
}

/** Is the mathematics schema present in the backend? Answered, not assumed. */
export async function provisioningState() {
  try {
    await api('/rest/v1/thy_math_understanding_cards?select=id&limit=1');
    return Object.freeze({ provisioned: true, statement: 'BACKEND · READY' });
  } catch (error) {
    if (error instanceof BackendError && error.provisionRequired) {
      return Object.freeze({
        provisioned: false,
        statement: 'BACKEND · NOT PROVISIONED',
        detail: 'db/math-surface migrations are held for Chairman application. Cards are being kept on this device, append-only, and nothing is lost.'
      });
    }
    return Object.freeze({
      provisioned: false,
      statement: 'BACKEND · UNREACHABLE',
      detail: error.message
    });
  }
}

/**
 * Write a card. Local first, always. Backend second, when it exists.
 * The result says exactly where the card now lives — never "saved" without
 * saying where.
 */
export async function saveUnderstandingCard(card, repository = localRepository()) {
  const local = await repository.put('understanding_cards', card);
  let backend = { attempted: false, written: false, reason: null };

  if (currentUser()) {
    backend.attempted = true;
    try {
      await api('/rest/v1/thy_math_understanding_cards', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: toRow(card)
      });
      backend.written = true;
    } catch (error) {
      backend.reason = error.provisionRequired
        ? 'the mathematics tables are not provisioned yet'
        : error.message;
    }
  } else {
    backend.reason = 'no signed-in member; a card is not attached to an account it has no permission to touch';
  }

  return Object.freeze({
    card: local,
    local_written: true,
    backend,
    statement: backend.written
      ? 'Card written on this device and in the backend.'
      : `Card written on this device. Backend copy not made: ${backend.reason}.`
  });
}

export async function listUnderstandingCards(learnerRef, repository = localRepository()) {
  return repository.list('understanding_cards', c => !learnerRef || c.learner_ref === learnerRef);
}

/** The row shape the migrations expect. Kept beside the client on purpose. */
export function toRow(card) {
  return {
    id: card.id,
    version: card.version,
    supersedes: card.supersedes,
    learner_ref: card.learner_ref,
    example_id: card.example_id,
    recorded_by: card.recorded_by,
    observed_at: card.at,
    p_solve_value: card.p_solve.value,
    p_solve_determined: card.p_solve.determined,
    p_solve_reason: card.p_solve.reason,
    layer_l: factorValue(card, 'L'),
    layer_m: factorValue(card, 'M'),
    layer_s: factorValue(card, 'S'),
    layer_l_isolated: factorIsolated(card, 'L'),
    layer_m_isolated: factorIsolated(card, 'M'),
    layer_s_isolated: factorIsolated(card, 'S'),
    not_measured: [...card.not_measured],
    not_measured_statement: card.not_measured_statement,
    refused_claims: card.refused_claims.map(c => c.claim),
    explain_back_child_words: card.explain_back.child_words,
    language_load: card.language_load.load
  };
}

function factorValue(card, layer) {
  return card.layers.find(l => l.layer === layer)?.value ?? null;
}
function factorIsolated(card, layer) {
  return Boolean(card.layers.find(l => l.layer === layer)?.isolated);
}
