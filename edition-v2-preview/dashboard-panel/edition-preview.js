/**
 * THYLORA Executive Dashboard — Edition Preview panel
 * ---------------------------------------------------
 * Policy: THY-APPROVAL-MUST-BE-VIEWABLE-001
 *
 * Belongs in vyc2st-ctrl/thylora-executive-dashboard as js/edition-preview.js.
 * See ../INTEGRATION.md for the two lines index.html needs. Promotion into that
 * repository is a separate Chairman-authorized act; DASHBOARD_AUTHORITY.md is
 * explicit that this repository is not the deployment source of truth.
 *
 * This panel sits ABOVE the existing EDF Release Metadata panel because reading
 * comes before approving. It does not replace that panel and does not duplicate
 * it: that one collects release metadata and runs the validator, this one shows
 * the Chairman what the package actually contains.
 *
 * There is no publish call in this file. Publishing is thylora_edf_publish_v1 on
 * the Complete the Release panel, gated behind thylora_edf_validate_v1. Do not
 * add a publish button here — an irreversible act does not belong on a reading
 * surface, and the separation is the point.
 */
(function () {
  "use strict";

  const {
    escapeHtml, formatDateTime,
    renderLoading, renderSignedOut, renderEmpty, renderError, renderAccessDenied,
  } = window.thyloraPanelStates;

  const SELECTOR = "[data-panel='edition-preview']";
  const panel = () => document.querySelector(SELECTOR);

  // Digest of the content as rendered, per package. This is what is sent back
  // with a decision, so the database can refuse it if the content moved.
  const shown = new Map();
  let busy = false;

  function ensureStyles() {
    if (document.getElementById("thy-edition-preview-styles")) return;
    const s = document.createElement("style");
    s.id = "thy-edition-preview-styles";
    s.textContent = `
      .ep-item{border:1px solid #263243;border-radius:12px;padding:13px;background:#0b121a;margin-bottom:11px}
      .ep-title{margin:0 0 3px;font-weight:800;word-break:break-word}
      .ep-code{font-size:12px;color:#9fa8b5;word-break:break-all;margin-bottom:9px}
      .ep-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
      .ep-cell{border:1px solid #22314a;border-radius:9px;padding:8px;background:#0a1017;font-size:12px}
      .ep-cell b{display:block;color:#9fa8b5;font-weight:700;margin-bottom:3px}
      .ep-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;word-break:break-all}
      .ep-miss{color:#f3d98b;font-weight:700}
      .ep-btn{min-height:44px;padding:10px 16px;border-radius:10px;font-weight:800;cursor:pointer;font-size:15px;
        border:1px solid #2f7d4f;background:#12351f;color:#8ff0b5;margin-top:10px;font-family:inherit}
      .ep-btn[disabled]{opacity:.5;cursor:not-allowed}
      .ep-btn--warn{border-color:#8a6d24;background:#2c2410;color:#f3d98b}
      .ep-btn--stop{border-color:#8a2f3a;background:#2d1418;color:#ffb3bd}
      .ep-blocked{margin-top:10px;padding:9px;border:1px solid #8a6d24;border-radius:9px;
        background:#2c2410;color:#f3d98b;font-size:13px;line-height:1.5}
      .ep-note{font-size:12px;color:#9fa8b5;line-height:1.55;margin:8px 0 0}
      .ep-note--stale{color:#f3d98b}
      .ep-reader{margin-top:12px;border-top:1px solid #22314a;padding-top:12px}
      .ep-bind{border:1px solid #22314a;border-radius:10px;background:#0a1017;padding:11px;margin-bottom:12px;font-size:13px}
      .ep-cover{display:block;max-width:100%;border-radius:9px;margin:0 auto 14px}
      .ep-body{max-width:66ch;margin:0 auto;max-height:60vh;overflow:auto}
      .ep-body p{margin:0 0 14px;font-size:16px;line-height:1.75;white-space:pre-wrap}
      .ep-decide{margin-top:16px;border:1px solid #22314a;border-radius:10px;background:#0a1017;padding:13px}
      .ep-decide h4{margin:0 0 9px;font-size:15px}
      .ep-mean{margin:0 0 7px;font-size:12.5px;color:#9fa8b5;line-height:1.6}
      .ep-mean b{color:#e6eefb}
      .ep-input{width:100%;padding:9px;border-radius:9px;border:1px solid #303b49;background:#080c12;
        color:#e6eefb;font:inherit;font-size:14px;margin:10px 0}
      .ep-row{display:flex;gap:9px;flex-wrap:wrap}
      .ep-status{margin-top:11px;font-size:13px;line-height:1.6}
      .ep-status--ok{color:#8ff0b5}.ep-status--err{color:#ffb3bd}
      @media (max-width:640px){.ep-row .ep-btn{width:100%}.ep-body{max-height:none}}
    `;
    document.head.appendChild(s);
  }

  const cell = (label, value, ok) =>
    `<div class="ep-cell"><b>${escapeHtml(label)}</b>
      <span class="${ok ? "" : "ep-miss"}">${value}</span></div>`;

  const mono = (v) => `<span class="ep-mono">${escapeHtml(String(v))}</span>`;

  function lastDecision(p) {
    const d = p.last_decision;
    if (!d) return `<p class="ep-note">No preview decision recorded yet.</p>`;
    const stale = d.still_current === false;
    return `<p class="ep-note ${stale ? "ep-note--stale" : ""}">Last decision:
      <b>${escapeHtml(d.decision)}</b> at ${formatDateTime(d.decided_at)}${
        d.note ? ` — ${escapeHtml(d.note)}` : ""}.
      ${stale ? " That decision was made against different content and no longer describes this package." : ""}</p>`;
  }

  function renderItem(p) {
    const facts = `<div class="ep-grid">
      ${cell("State", escapeHtml(p.state || "—"), !!p.state)}
      ${cell("Version", escapeHtml(p.package_version || "—"), !!p.package_version)}
      ${cell("Source hash", p.source_hash ? mono(p.source_hash) : "ABSENT", !!p.source_hash)}
      ${cell("Content digest", p.content_digest ? mono(p.content_digest) : "none", !!p.content_digest)}
      ${cell("Text blocks", escapeHtml(String(p.text_blocks ?? 0)), (p.text_blocks ?? 0) > 0)}
      ${cell("Characters", escapeHtml(String(p.text_characters ?? 0)), (p.text_characters ?? 0) > 0)}
    </div>`;

    return `<div class="ep-item">
      <p class="ep-title">${escapeHtml(p.title || p.edf_code)}</p>
      <div class="ep-code">${escapeHtml(p.edf_code)}</div>
      ${facts}
      ${lastDecision(p)}
      ${p.viewable
        ? `<button type="button" class="ep-btn" data-ep-open="${escapeHtml(p.edf_code)}">Open and read this edition</button>`
        : `<p class="ep-blocked">No text blocks. There is nothing to show, so there is nothing to
             approve. Listed here so the gap is visible rather than silent.</p>`}
      <div class="ep-reader" data-ep-reader="${escapeHtml(p.edf_code)}" hidden></div>
    </div>`;
  }

  function renderPreview(box, p) {
    if (!p.viewable) {
      box.innerHTML = `<p class="ep-blocked">${escapeHtml(p.reason || "Nothing to show.")}</p>`;
      return;
    }
    shown.set(p.edf_code, p.content_digest);
    const blocks = Array.isArray(p.blocks) ? p.blocks : [];

    box.innerHTML = `
      <div class="ep-bind">
        <p style="margin:0 0 6px">Reading <b>${escapeHtml(p.title || p.edf_code)}</b>, version
          ${mono(p.package_version || "—")}, content digest ${mono(p.content_digest)}.</p>
        <p class="ep-note" style="margin:0">Your decision is stored against that digest. If this text
          changes before you decide, the database refuses the decision rather than attaching it to
          something you did not read.</p>
      </div>
      ${p.cover_asset_ref
        ? `<img class="ep-cover" src="${escapeHtml(p.cover_asset_ref)}" alt="Cover of ${escapeHtml(p.title || p.edf_code)}">`
        : `<p class="ep-blocked">No cover is attached to this package.</p>`}
      <div class="ep-body">${blocks.map((b) => `<p>${escapeHtml(String(b.text || ""))}</p>`).join("")}</div>
      <div class="ep-decide">
        <h4>Your decision on what you just read</h4>
        <p class="ep-mean"><b>APPROVE</b> — you read this exact content and find it fit to release.
          This records that finding. <b>It does not publish.</b> Publishing stays the separate press
          on Complete the Release.</p>
        <p class="ep-mean"><b>REVISE</b> — this must change before you are asked again.</p>
        <p class="ep-mean"><b>HOLD</b> — stop. No further release step on this edition.</p>
        <input type="text" class="ep-input" maxlength="500" data-ep-note="${escapeHtml(p.edf_code)}"
               placeholder="Note (optional) — why, in your words">
        <div class="ep-row">
          <button type="button" class="ep-btn"            data-ep-decide="APPROVE" data-ep-code="${escapeHtml(p.edf_code)}">APPROVE</button>
          <button type="button" class="ep-btn ep-btn--warn" data-ep-decide="REVISE" data-ep-code="${escapeHtml(p.edf_code)}">REVISE</button>
          <button type="button" class="ep-btn ep-btn--stop" data-ep-decide="HOLD"   data-ep-code="${escapeHtml(p.edf_code)}">HOLD</button>
        </div>
        <div class="ep-status" data-ep-status="${escapeHtml(p.edf_code)}"></div>
      </div>`;

    box.querySelectorAll("[data-ep-decide]").forEach((b) =>
      b.addEventListener("click", () => decide(b.dataset.epCode, b.dataset.epDecide)));
  }

  function setStatus(code, html, kind) {
    const el = document.querySelector(`[data-ep-status="${CSS.escape(code)}"]`);
    if (!el) return;
    el.className = "ep-status" + (kind ? " ep-status--" + kind : "");
    el.innerHTML = html;
  }

  function setBusy(on) {
    busy = on;
    document.querySelectorAll("[data-ep-decide],[data-ep-open]").forEach((b) => { b.disabled = on; });
  }

  async function openPreview(code) {
    const box = document.querySelector(`[data-ep-reader="${CSS.escape(code)}"]`);
    if (!box || busy) return;
    box.hidden = false;
    box.innerHTML = `<p class="ep-note">Opening the edition…</p>`;
    try {
      const { data, error } = await window.thyloraSupabase.rpc(
        "thylora_edf_preview_v1", { p_edf_code: code });
      if (error) throw error;
      renderPreview(box, data);
    } catch (err) {
      box.innerHTML = `<p class="ep-blocked">Could not open this edition: ${
        escapeHtml(err.message || String(err))}</p>`;
    }
  }

  async function decide(code, decision) {
    if (busy) return;
    const digest = shown.get(code);
    if (!digest) {
      setStatus(code, "No digest is held for this edition. Re-open it before deciding.", "err");
      return;
    }
    const note = document.querySelector(`[data-ep-note="${CSS.escape(code)}"]`)?.value || null;

    setBusy(true);
    setStatus(code, "Recording…");
    try {
      const { data, error } = await window.thyloraSupabase.rpc(
        "thylora_edf_record_preview_decision_v1",
        { p_edf_code: code, p_decision: decision, p_content_digest: digest, p_note: note });
      if (error) throw error;
      setStatus(code,
        `<b>${escapeHtml(data.decision)} recorded</b> against digest ${mono(data.content_digest)}.
         Package state is still <b>${escapeHtml(data.package_state)}</b> — nothing was published.<br>
         ${escapeHtml(data.authorizes || "")}`, "ok");
      await load();
    } catch (err) {
      const msg = err.message || String(err);
      setStatus(code, /THY-PREVIEW-STALE/.test(msg)
        ? "Refused: this edition changed since you opened it. Re-open and read the new version before " +
          "deciding. Your decision was not recorded against content you did not see."
        : escapeHtml(msg), "err");
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    const node = panel();
    if (!node) return;

    if (!window.thyloraAuth?.getState()?.user) {
      renderSignedOut(node, "Sign in as Chairman to read the editions awaiting your decision.");
      return;
    }

    renderLoading(node, "Reading the Edition preview board…");
    try {
      const { data, error } = await window.thyloraSupabase.rpc("thylora_edf_preview_board_v1");
      if (error) {
        if (error.code === "42501" || /permission denied|THY-DENY/i.test(error.message || "")) {
          renderAccessDenied(node, "Edition preview is Chairman-only.");
          return;
        }
        // A missing function means the migration is not applied. Say so, rather
        // than rendering an empty board that reads as "no products".
        if (error.code === "PGRST202" || error.code === "42883" ||
            /does not exist|schema cache/i.test(error.message || "")) {
          node.innerHTML = `<div class="ep-blocked">The preview functions are not in the backend yet.
            <code>edition-v2-preview/sql/0001_edf_chairman_preview.sql</code> has not been applied.
            Nothing can be previewed until it is — this is not an empty catalogue.</div>`;
          return;
        }
        renderError(node, error);
        return;
      }

      const packages = Array.isArray(data?.packages) ? data.packages : [];
      if (!packages.length) {
        renderEmpty(node, "The backend returned no EDF packages.");
        return;
      }
      ensureStyles();
      const viewable = packages.filter((p) => p.viewable).length;
      node.innerHTML =
        `<p class="sub"><b>${packages.length}</b> package(s) in the backend ·
          <b>${viewable}</b> can actually be viewed. Read before you decide.</p>` +
        packages.map(renderItem).join("");
      node.querySelectorAll("[data-ep-open]").forEach((b) =>
        b.addEventListener("click", () => openPreview(b.dataset.epOpen)));
    } catch (err) {
      renderError(node, err);
    }
  }

  window.thyloraLoadEditionPreview = load;
  window.addEventListener("thylora:auth-changed", load);
})();
