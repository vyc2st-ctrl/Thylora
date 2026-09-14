// THYLORA Dashboard R6 · custody of notes, ink and ledgers
// Canonical backend records: THY-DASH-VOICE-SPINE-001,
// THY-IDEA-READBACK-MARGIN-NOTES-001, THY-IDEA-PROMPT-COVERAGE-LEDGER-001
//
// Two storage tiers, and the difference between them is never hidden.
//
//   Device tier   — written first, synchronously, before anything is attempted
//                   over the network. A note the Chairman just spoke survives a
//                   closed lid, a dropped connection and a reload whether or not
//                   the backend ever answers.
//   Backend tier  — thylora-dash, through the same REST surface and the same
//                   publishable key the current head already uses. Best effort.
//
// An atom is only reported IN_CUSTODY when the backend returned success for that
// specific atom. Anything else reads PENDING_CUSTODY, and the count is shown to
// the Chairman rather than rounded away. This lane will not tell him his work is
// held somewhere it is not.

import { NOTE_CUSTODY } from './lib/margin-notes.js';

const DEVICE_KEY = 'thy_r6_workspace_v1';

export class Custody {
  constructor({
    url = 'https://jvsdxhrfhtlgaknhjxlz.supabase.co',
    key = 'sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ',
    onStatus = () => {}
  } = {}) {
    this.url = url;
    this.key = key;
    this.onStatus = onStatus;
    this.backendReachable = null;   // null = never attempted
  }

  token() {
    try {
      const dash = localStorage.getItem('thy_access_token') || '';
      if (dash) return dash;
      const app = JSON.parse(sessionStorage.getItem('thylora_app_auth_session') || 'null');
      return app?.access_token || '';
    } catch { return ''; }
  }

  // ---- device tier ---------------------------------------------------------

  loadDevice() {
    try {
      const raw = localStorage.getItem(DEVICE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  saveDevice(state) {
    try {
      localStorage.setItem(DEVICE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      // Quota or private browsing. The Chairman must know his notes are only in
      // memory from this point, because a reload will now lose them.
      this.onStatus('Device storage refused the write. Notes are in memory only until this is cleared.', 'bad');
      return false;
    }
  }

  // ---- backend tier --------------------------------------------------------

  async post(table, rows) {
    const token = this.token();
    if (!token) {
      this.backendReachable = false;
      return { ok: false, reason: 'NOT_SIGNED_IN' };
    }
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.key,
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(rows)
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.backendReachable = response.status < 500;
        // A missing table is the expected state until the R6 migration is
        // applied to thylora-dash. It is reported plainly, not as a crash.
        const missing = response.status === 404 || /does not exist|schema cache/i.test(text);
        return { ok: false, reason: missing ? 'TABLE_NOT_PRESENT' : `HTTP_${response.status}`, detail: text.slice(0, 300) };
      }
      this.backendReachable = true;
      return { ok: true, rows: await response.json().catch(() => []) };
    } catch (err) {
      this.backendReachable = false;
      return { ok: false, reason: 'NETWORK', detail: String(err?.message || err) };
    }
  }

  /**
   * Offer notes to the backend.
   *
   * Returns the ids it offered and the custody they earned — deliberately NOT a
   * replacement notes array. A network round trip takes long enough for the
   * Chairman to speak another note into the response, and handing back a list
   * captured before the request would silently drop anything spoken during it.
   * The caller applies this result to whatever the note lane holds now.
   */
  async lodgeNotes(notes) {
    const pending = (notes || []).filter(n => n.custody !== NOTE_CUSTODY.IN_CUSTODY);
    if (!pending.length) return { ids: [], custody: null, lodged: 0, reason: null };

    const result = await this.post('thylora_margin_notes', pending.map(n => ({
      note_id: n.note_id,
      response_id: n.response_id,
      kind: n.kind,
      body: n.body,
      anchor_char: n.anchor?.char ?? 0,
      anchor_percent: n.anchor?.percent ?? 0,
      anchor_segment: n.anchor?.segment_index ?? null,
      anchor_preview: `${n.anchor?.preview_before || ''}${n.anchor?.preview_after || ''}`,
      readback_elapsed_seconds: n.readback_elapsed_seconds,
      target: n.target,
      ink: n.ink,
      supersedes: n.supersedes,
      captured_at: n.captured_at
    })));

    const custody = result.ok ? NOTE_CUSTODY.IN_CUSTODY : NOTE_CUSTODY.PENDING_CUSTODY;

    if (!result.ok) {
      this.onStatus(this.explain(result.reason, 'Notes are held on this device'), 'warn');
    }
    return {
      ids: pending.map(n => n.note_id),
      custody,
      lodged: result.ok ? pending.length : 0,
      reason: result.reason
    };
  }

  async lodgeLedger(ledger) {
    if (!ledger?.atoms?.length) return { ok: false, reason: 'EMPTY' };
    const result = await this.post('thylora_prompt_atoms', ledger.atoms.map(a => ({
      atom_id: a.atom_id,
      prompt_id: a.prompt_id,
      ordinal: a.ordinal,
      atom_text: a.text,
      section: a.section,
      state: a.state,
      reason: a.reason,
      evidence: a.evidence,
      source_checksum: ledger.source_checksum,
      created_at: a.created_at,
      resolved_at: a.resolved_at
    })));
    if (!result.ok) this.onStatus(this.explain(result.reason, 'The coverage ledger is held on this device'), 'warn');
    return result;
  }

  explain(reason, prefix) {
    switch (reason) {
      case 'NOT_SIGNED_IN':
        return `${prefix} — sign in on the dashboard to lodge them into thylora-dash.`;
      case 'TABLE_NOT_PRESENT':
        return `${prefix} — the R6 tables are not yet applied to thylora-dash (db/dashboard/0001_r6_workspace.sql).`;
      case 'NETWORK':
        return `${prefix} — the backend was not reachable.`;
      default:
        return `${prefix} — the backend refused the write (${reason}).`;
    }
  }
}
