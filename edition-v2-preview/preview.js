// THYLORA · Edition v2 Chairman Preview Surface
// =============================================
// Policy: THY-APPROVAL-MUST-BE-VIEWABLE-001
//
// This surface shows the Chairman the actual artifact before he is asked to
// decide anything about it. It has exactly one job and deliberately no others:
//
//   * It READS.  thylora_edf_preview_board_v1 and thylora_edf_preview_v1 are
//     both read-only and Chairman-gated in the database.
//   * It RECORDS a decision.  thylora_edf_record_preview_decision_v1 appends
//     one immutable row.
//
// It cannot publish, activate, schedule or release. There is no publish call in
// this file and none may be added: publishing is thylora_edf_publish_v1 on the
// existing Store Release panel, where it is gated behind the validator. Adding a
// publish path here would put an irreversible act next to a reading surface,
// which is the exact confusion this page exists to end.
//
// No dependency is vendored. This file speaks to PostgREST and GoTrue directly,
// the same way rae-link/lib/backend.js does, so the page works standalone.

(function () {
  "use strict";

  const SUPABASE_URL = "https://jvsdxhrfhtlgaknhjxlz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ta33XJ9rtS8VljoUYw-GuA_Pi4OycpQ";
  const SESSION_KEY = "thylora_app_auth_session";   // shared with the member app

  // ---------------------------------------------------------------- session
  const getSession = () => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  };
  const setSession = (v) => {
    if (v) sessionStorage.setItem(SESSION_KEY, JSON.stringify(v));
    else sessionStorage.removeItem(SESSION_KEY);
  };
  const token = () => getSession()?.access_token || SUPABASE_KEY;

  // ------------------------------------------------------------------- http
  async function rpc(name, payload = {}) {
    let res;
    try {
      res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      throw Object.assign(new Error(`Backend unreachable: ${e.message}`), { kind: "NETWORK" });
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const code = data && typeof data === "object" ? data.code : null;
      const msg = (data && typeof data === "object" &&
        (data.message || data.hint || data.error_description || data.error)) || text || `HTTP ${res.status}`;
      // A missing function means the migration has not been applied. Say that,
      // rather than showing an empty surface that looks like "no products".
      const notProvisioned = code === "PGRST202" || code === "42883" ||
        /does not exist|schema cache/i.test(String(msg));
      throw Object.assign(new Error(String(msg)), {
        kind: notProvisioned ? "NOT_PROVISIONED" : (code === "42501" ? "DENIED" : "ERROR"),
        code,
      });
    }
    return data;
  }

  async function signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error_description || data?.msg || "Sign-in failed.");
    setSession(data);
    return data;
  }

  // ------------------------------------------------------------------ utils
  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const when = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? esc(String(v))
      : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  const $ = (sel) => document.querySelector(sel);

  function state(node, kind, title, detail) {
    node.innerHTML = `<div class="st st--${kind}"><p class="st__t">${esc(title)}</p>` +
      (detail ? `<p class="st__d">${esc(detail)}</p>` : "") + `</div>`;
  }

  function failure(node, err, context) {
    if (err.kind === "NOT_PROVISIONED") {
      state(node, "gate",
        "The preview functions are not in the backend yet.",
        "sql/0001_edf_chairman_preview.sql has not been applied to jvsdxhrfhtlgaknhjxlz. " +
        "Until it is, nothing can be previewed here. This is not an empty catalogue.");
      return;
    }
    if (err.kind === "DENIED") {
      state(node, "denied", "Chairman only.",
        "This surface is gated on thylora_is_chairman() inside the database. Signing in as " +
        "anyone else cannot reach it.");
      return;
    }
    state(node, "err", context, err.message);
  }

  // ------------------------------------------------------------------ board
  let board = [];

  function bindingRow(p) {
    const digest = p.content_digest || null;
    return `<div class="bind">
      <div class="bind__c"><b>Version</b><span>${esc(p.package_version || "—")}</span></div>
      <div class="bind__c"><b>State</b><span>${esc(p.state || "—")}</span></div>
      <div class="bind__c"><b>Source hash</b><span class="mono">${
        p.source_hash ? esc(p.source_hash) : '<em class="miss">ABSENT</em>'}</span></div>
      <div class="bind__c"><b>Content digest (sha256)</b><span class="mono">${
        digest ? esc(digest) : '<em class="miss">none — nothing to show</em>'}</span></div>
      <div class="bind__c"><b>Text blocks</b><span>${esc(String(p.text_blocks ?? 0))}</span></div>
      <div class="bind__c"><b>Characters</b><span>${esc(String(p.text_characters ?? 0))}</span></div>
    </div>`;
  }

  function lastDecisionLine(p) {
    const d = p.last_decision;
    if (!d) return `<p class="note">No preview decision recorded yet.</p>`;
    const stale = d.still_current === false;
    return `<p class="note ${stale ? "note--stale" : ""}">
      Last decision: <b>${esc(d.decision)}</b> at ${when(d.decided_at)}${d.note ? ` — ${esc(d.note)}` : ""}.
      ${stale ? "That decision was made against different content. It no longer describes what is below." : ""}
    </p>`;
  }

  function renderBoard() {
    const node = $("#board");
    if (!board.length) {
      state(node, "empty", "The backend returned no EDF packages.",
        "Nothing is hidden here — this surface lists exactly what thylora_edf_preview_board_v1 " +
        "returns. If products are expected, they are not in thylora_edf_packages.");
      return;
    }
    const viewable = board.filter((p) => p.viewable).length;
    node.innerHTML =
      `<p class="count"><b>${board.length}</b> package(s) in the backend · ` +
      `<b>${viewable}</b> can actually be viewed.</p>` +
      board.map((p) => `
        <article class="pkg" id="pkg-${esc(p.edf_code)}">
          <h3>${esc(p.title || p.edf_code)}</h3>
          <p class="code mono">${esc(p.edf_code)}</p>
          ${bindingRow(p)}
          ${lastDecisionLine(p)}
          ${p.viewable
            ? `<button type="button" class="btn" data-open="${esc(p.edf_code)}">Open and read this edition</button>`
            : `<p class="blocked">This package has no text blocks. There is nothing to show,
                 so there is nothing to approve. It is listed here so its absence is visible.</p>`}
          <div class="reader" data-reader="${esc(p.edf_code)}" hidden></div>
        </article>`).join("");

    node.querySelectorAll("[data-open]").forEach((b) =>
      b.addEventListener("click", () => openPreview(b.dataset.open)));
  }

  async function loadBoard() {
    const node = $("#board");
    state(node, "load", "Reading the Edition preview board…");
    try {
      const data = await rpc("thylora_edf_preview_board_v1");
      board = Array.isArray(data?.packages) ? data.packages : [];
      renderBoard();
    } catch (err) {
      failure(node, err, "Could not read the preview board.");
    }
  }

  // ---------------------------------------------------------------- preview
  // The digest shown here is the digest sent back with the decision. If the
  // content moves underneath, the database refuses the write.
  const shown = new Map();   // edf_code -> content_digest as rendered

  function renderPreview(box, p) {
    if (!p.viewable) {
      state(box, "empty", "Nothing to show.", p.reason || "");
      return;
    }
    shown.set(p.edf_code, p.content_digest);

    const blocks = Array.isArray(p.blocks) ? p.blocks : [];
    box.innerHTML = `
      <div class="reader__bind">
        <p>You are reading <b>${esc(p.title || p.edf_code)}</b>, version
           <span class="mono">${esc(p.package_version || "—")}</span>,
           content digest <span class="mono">${esc(p.content_digest)}</span>.</p>
        <p class="note">Any decision you record below is stored against that digest. If one
           character of this text changes before you decide, the database refuses the
           decision rather than attaching it to something you did not read.</p>
      </div>
      ${p.cover_asset_ref
        ? `<img class="reader__cover" src="${esc(p.cover_asset_ref)}" alt="Cover of ${esc(p.title || p.edf_code)}">`
        : `<p class="blocked">No cover is attached to this package.</p>`}
      <div class="reader__body">
        ${blocks.map((b) => `<p>${esc(String(b.text || ""))}</p>`).join("")}
      </div>
      <div class="decide">
        <h4>Your decision on what you just read</h4>
        <p class="decide__mean"><b>APPROVE</b> — you have read this exact content and find it fit to
          release. This records that finding. <b>It does not publish.</b> Publishing stays a separate,
          deliberate press on the Store Release panel.</p>
        <p class="decide__mean"><b>REVISE</b> — this content must change before you are asked again.</p>
        <p class="decide__mean"><b>HOLD</b> — stop. No further release step on this edition.</p>
        <label class="decide__note">Note (optional, stored with the decision)
          <input type="text" data-note="${esc(p.edf_code)}" maxlength="500"
                 placeholder="Why — in your words">
        </label>
        <div class="decide__row">
          <button type="button" class="btn btn--ok"   data-decide="APPROVE" data-code="${esc(p.edf_code)}">APPROVE</button>
          <button type="button" class="btn btn--warn" data-decide="REVISE"  data-code="${esc(p.edf_code)}">REVISE</button>
          <button type="button" class="btn btn--stop" data-decide="HOLD"    data-code="${esc(p.edf_code)}">HOLD</button>
        </div>
        <div class="decide__status" data-status="${esc(p.edf_code)}"></div>
      </div>`;

    box.querySelectorAll("[data-decide]").forEach((b) =>
      b.addEventListener("click", () => decide(b.dataset.code, b.dataset.decide)));
  }

  async function openPreview(code) {
    const box = document.querySelector(`[data-reader="${CSS.escape(code)}"]`);
    if (!box) return;
    box.hidden = false;
    state(box, "load", "Opening the edition…");
    try {
      renderPreview(box, await rpc("thylora_edf_preview_v1", { p_edf_code: code }));
    } catch (err) {
      failure(box, err, "Could not open this edition.");
    }
  }

  async function decide(code, decision) {
    const statusEl = document.querySelector(`[data-status="${CSS.escape(code)}"]`);
    const note = document.querySelector(`[data-note="${CSS.escape(code)}"]`)?.value || null;
    const digest = shown.get(code);
    if (!digest) {
      statusEl.className = "decide__status decide__status--err";
      statusEl.textContent = "No digest is held for this edition. Re-open it before deciding.";
      return;
    }

    document.querySelectorAll("[data-decide]").forEach((b) => { b.disabled = true; });
    statusEl.className = "decide__status";
    statusEl.textContent = "Recording…";

    try {
      const r = await rpc("thylora_edf_record_preview_decision_v1", {
        p_edf_code: code, p_decision: decision, p_content_digest: digest, p_note: note,
      });
      statusEl.className = "decide__status decide__status--ok";
      statusEl.innerHTML = `<b>${esc(r.decision)} recorded</b> against digest
        <span class="mono">${esc(r.content_digest)}</span>.
        Package state is still <b>${esc(r.package_state)}</b> — nothing was published.
        <br>${esc(r.authorizes || "")}`;
      await loadBoard();
    } catch (err) {
      statusEl.className = "decide__status decide__status--err";
      statusEl.textContent = /THY-PREVIEW-STALE/.test(err.message)
        ? "Refused: this edition changed since you opened it. Re-open and read the new version " +
          "before deciding. Your decision was not recorded against content you did not see."
        : err.message;
    } finally {
      document.querySelectorAll("[data-decide]").forEach((b) => { b.disabled = false; });
    }
  }

  // ------------------------------------------------------------------- auth
  function renderAuth() {
    const node = $("#auth");
    const user = getSession()?.user;
    if (user) {
      node.innerHTML = `<p>Signed in as <b>${esc(user.email || user.id)}</b>
        <button type="button" class="btn btn--quiet" id="signout">Sign out</button></p>`;
      $("#signout").addEventListener("click", () => { setSession(null); start(); });
      return true;
    }
    node.innerHTML = `
      <form id="signin" class="signin">
        <p class="note">Chairman identity is checked inside the database, not here. Signing in as
          anyone else will be refused by thylora_is_chairman().</p>
        <label>Email <input type="email" name="email" autocomplete="username" required></label>
        <label>Password <input type="password" name="password" autocomplete="current-password" required></label>
        <button type="submit" class="btn">Sign in</button>
        <span class="signin__err" id="signin-err"></span>
      </form>`;
    $("#signin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await signIn(f.get("email"), f.get("password"));
        start();
      } catch (err) {
        $("#signin-err").textContent = err.message;
      }
    });
    return false;
  }

  function start() {
    if (renderAuth()) loadBoard();
    else state($("#board"), "signed-out", "Sign in to read the editions awaiting your decision.");
  }

  document.addEventListener("DOMContentLoaded", start);
})();
