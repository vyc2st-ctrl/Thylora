/**
 * THYLORA Executive Dashboard — Operating Surface
 * ------------------------------------------------
 * An operational completion layer over the EXISTING Current Head dashboard.
 * It is not a second dashboard and it holds no truth of its own: every value
 * rendered here comes from thylora_operating_surface_v1, which reads the
 * authoritative registries in thylora-dash.
 *
 * Rules this file obeys:
 *   - No progress percentages are invented. If the backend cannot measure it,
 *     the surface prints UNKNOWN.
 *   - UNKNOWN is rendered first-class, never as small grey print.
 *   - A connected account is never upgraded to "posting access verified".
 *   - Publication is always shown as a separate authority action.
 *   - Chairman-only actions are described, never executed silently.
 *   - Touch first: no hover-only affordances, large tap targets.
 */
(function () {
  "use strict";

  const HOSTS = {
    home:    '[data-panel="operating-home"]',
    today:   '[data-panel="operating-today"]',
    store:   '[data-panel="operating-store"]',
    news:    '[data-panel="operating-news"]',
    social:  '[data-panel="operating-social"]',
    actions: '[data-panel="operating-actions"]',
    rooms:   '[data-panel="operating-rooms"]',
    bridge:  '[data-panel="operating-bridge"]',
    brand:   '[data-panel="operating-brand"]',
    truth:   '[data-panel="operating-truth"]',
  };

  let payload = null;

  function ps() { return window.thyloraPanelStates; }
  function esc(v) { return ps().escapeHtml(v); }
  function when(v) { return v ? ps().formatDateTime(v) : "No timestamp"; }

  /** UNKNOWN is a real answer, not a styling accident. */
  function unknown(text) {
    return `<span class="os-unknown">UNKNOWN</span>${
      text ? `<span class="os-unknown-why"> — ${esc(text)}</span>` : ""
    }`;
  }

  function value(v, whyUnknown) {
    if (v === null || v === undefined || v === "") return unknown(whyUnknown);
    return esc(v);
  }

  function list(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    return [];
  }

  function installStyle() {
    if (document.getElementById("thyOperatingSurfaceStyle")) return;
    const s = document.createElement("style");
    s.id = "thyOperatingSurfaceStyle";
    s.textContent = `
      .os-band{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:0 0 14px}
      .os-stat{border:1px solid var(--r5line,#293342);border-radius:12px;background:#0d131b;padding:12px 13px;min-height:74px}
      .os-stat b{display:block;font-size:26px;line-height:1.05}
      .os-stat span{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--r5muted,#9fa8b5);margin-top:5px}
      .os-stat.is-active b{color:#78d49b}
      .os-stat.is-blocked b{color:#e08a82}
      .os-stat.is-chairman b{color:#d6a348}
      .os-stat.is-unknown b{color:#8fd4ff}
      .os-unknown{display:inline-block;background:#1d2b3a;color:#8fd4ff;border:1px solid #3b5a75;
        border-radius:6px;padding:2px 8px;font-size:12px;font-weight:800;letter-spacing:.08em}
      .os-unknown-why{color:var(--r5muted,#9fa8b5);font-size:13px}
      .os-card{border:1px solid var(--r5line,#293342);border-radius:13px;background:#0e141c;
        padding:13px 14px;margin-bottom:10px;overflow-wrap:anywhere;word-break:break-word;
        min-width:0;max-width:100%}
      .os-card.is-blocked{border-color:#5d3330}
      .os-card.is-chairman{border-color:#6b5320;background:#14110b}
      .os-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px}
      .os-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
        color:#d6a348;font-weight:700}
      .os-title{font-weight:700;flex:1 1 240px;font-size:15px}
      .os-tag{font-size:10px;letter-spacing:.11em;text-transform:uppercase;font-weight:800;
        border:1px solid currentColor;border-radius:999px;padding:3px 9px;white-space:nowrap}
      .os-tag.ACTIVE,.os-tag.DONE,.os-tag.PUBLISHED,.os-tag.PASS{color:#78d49b}
      .os-tag.BLOCKED,.os-tag.REJECTED{color:#e08a82}
      .os-tag.WAITING,.os-tag.HELD,.os-tag.READY{color:#d6a348}
      .os-tag.UNKNOWN{color:#8fd4ff}
      .os-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
        gap:8px 16px;margin-top:9px;font-size:13.5px;line-height:1.5}
      .os-kv dt{font-size:10px;letter-spacing:.1em;text-transform:uppercase;
        color:var(--r5muted,#9fa8b5)}
      .os-kv dd{margin:2px 0 0;overflow-wrap:anywhere;word-break:break-word;min-width:0}
      .os-kv>div{min-width:0}
      .os-kv a{display:inline-block;min-height:34px;padding:7px 0;overflow-wrap:anywhere;
        word-break:break-all;max-width:100%}
      .os-note{margin-top:9px;padding:9px 11px;border-left:3px solid #d6a348;background:#12161d;
        font-size:13.5px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word}
      .os-group{margin-bottom:18px}
      .os-group>h4{margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;
        color:var(--r5muted,#9fa8b5)}
      .os-blockers{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.55}
      .os-blockers li{margin-bottom:3px;overflow-wrap:anywhere;word-break:break-word}
      .os-card details>summary{display:flex;align-items:center;min-height:36px;cursor:pointer;
        color:var(--r5muted,#9fa8b5);font-weight:700;font-size:13.5px;list-style-position:inside}
      .os-pipe{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
      .os-step{border:1px solid #293342;border-radius:8px;padding:6px 9px;font-size:11px;
        letter-spacing:.05em;background:#0d131b;min-height:34px;display:flex;align-items:center;gap:6px}
      .os-step b{font-weight:800;font-size:10px;letter-spacing:.09em}
      .os-step.DONE{border-color:#2f5c42;color:#78d49b}
      .os-step.WAITING{border-color:#5c4a22;color:#d6a348}
      .os-step.UNKNOWN{border-color:#3b5a75;color:#8fd4ff}
      .os-step.HELD,.os-step.REJECTED{border-color:#5d3330;color:#e08a82}
      .os-step.PUBLISHED{border-color:#2f5c42;color:#78d49b}
      .os-sep{border:0;border-top:1px solid #1b2430;margin:14px 0}
      [data-operating-refresh]{min-height:46px;padding:10px 18px;font-size:15px;margin:10px 0}
      .os-code{overflow-wrap:anywhere;word-break:break-all}
      .os-title{min-width:0;overflow-wrap:anywhere;word-break:break-word}
      [data-panel^="operating-"]{min-width:0;max-width:100%;overflow-x:hidden}
      .os-since{font-size:13px;color:var(--r5muted,#9fa8b5);margin:0 0 12px}
      @media (max-width:640px){
        .os-band{grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px}
        .os-stat b{font-size:22px}
        .os-kv{grid-template-columns:1fr}
        .os-title{flex:1 1 100%}
      }
    `;
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------ CHAIRMAN HOME */
  function renderHome() {
    const host = document.querySelector(HOSTS.home);
    if (!host) return;
    const home = payload.chairman_home || {};
    const counts = home.counts || {};
    const auth = payload.authority || {};
    const deploy = payload.deployment_truth || {};
    const changed = home.changed_since_last_visit || {};
    const openCards = list(payload.action_cards).filter((c) => c.status === "OPEN");

    const changedItems = list(changed.items);
    const changedBlock = changed.first_visit
      ? `<p class="os-since">First recorded visit to this surface. "What changed" starts from your next visit.</p>`
      : `<p class="os-since">Changes since your last visit (${esc(when(changed.since))}): <strong>${changedItems.length}</strong></p>` +
        (changedItems.length
          ? `<ul class="os-blockers">${changedItems
              .slice(0, 12)
              .map(
                (i) =>
                  `<li><span class="os-code">${esc(i.kind)}</span> ${esc(i.code || "")} — ${esc(
                    i.title || ""
                  )} <em>${esc(i.state || "")}</em></li>`
              )
              .join("")}</ul>`
          : "");

    host.innerHTML = `
      <div class="os-band">
        <div class="os-stat is-active"><b>${esc(counts.active ?? "—")}</b><span>Active</span></div>
        <div class="os-stat"><b>${esc(counts.ready ?? "—")}</b><span>Ready</span></div>
        <div class="os-stat is-blocked"><b>${esc(counts.blocked ?? "—")}</b><span>Blocked</span></div>
        <div class="os-stat is-chairman"><b>${openCards.length}</b><span>Needs Chairman</span></div>
        <div class="os-stat"><b>${list(home.can_proceed).length}</b><span>Can proceed now</span></div>
        <div class="os-stat is-unknown"><b>${esc(deploy.blocked_count ?? 0)}</b><span>Blocked checks</span></div>
      </div>

      <div class="os-card is-chairman">
        <div class="os-head">
          <span class="os-code">AUTHORITY</span>
          <span class="os-title">${esc(auth.frontend_name || "")}</span>
          <span class="os-tag ${esc(auth.lock_state || "UNKNOWN")}">${esc(auth.lock_state || "UNKNOWN")}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Authoritative URL</dt><dd>${value(auth.frontend_url)}</dd></div>
          <div><dt>Vercel project</dt><dd>${value(auth.frontend_project_id)}</dd></div>
          <div><dt>Backend project</dt><dd>${value(auth.backend_project_ref)}</dd></div>
          <div><dt>Floor</dt><dd>${value(auth.floor_code)}</dd></div>
        </dl>
        <div class="os-note">${esc(auth.promotion_rule || "")}</div>
      </div>

      ${changedBlock}

      <div class="os-group">
        <h4>Requires Chairman authority</h4>
        ${
          openCards.length
            ? openCards.map(actionCardHtml).join("")
            : `<div class="os-card"><p>No open Chairman action cards.</p></div>`
        }
      </div>

      <div class="os-group">
        <h4>Blocked — cannot proceed without a decision or an external unlock</h4>
        ${
          list(home.blocked).length
            ? list(home.blocked).map(roomLineHtml).join("")
            : `<div class="os-card"><p>Nothing blocked.</p></div>`
        }
      </div>

      <div class="os-group">
        <h4>Active — has at least one unblocked task and can move without you</h4>
        ${
          list(home.active).length
            ? list(home.active).map(roomLineHtml).join("")
            : `<div class="os-card"><p>Nothing active.</p></div>`
        }
      </div>

      <p class="os-since">${esc(home.waiting_external_count ?? 0)} autonomy tasks are waiting on an external party. Read as-is — this is a queue depth, not a progress figure.</p>
    `;
  }

  function roomLineHtml(r) {
    const blockers = list(r.blockers || r.open_blockers);
    return `
      <div class="os-card ${r.blockers ? "is-blocked" : ""}">
        <div class="os-head">
          <span class="os-code">${esc(r.code)}</span>
          <span class="os-title">${esc(r.title)}</span>
          <span class="os-tag">${esc(r.state)}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Lane</dt><dd>${value(r.lane)}</dd></div>
          <div><dt>Last change</dt><dd>${esc(when(r.updated_at))}</dd></div>
          ${r.actionable !== undefined ? `<div><dt>Unblocked tasks</dt><dd>${esc(r.actionable)}</dd></div>` : ""}
        </dl>
        ${
          blockers.length
            ? `<ul class="os-blockers">${blockers.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`;
  }

  /* ------------------------------------------------------- CHAIRMAN ACTION CARD */
  function actionCardHtml(c) {
    const steps = list(c.what_to_press);
    return `
      <div class="os-card is-chairman">
        <div class="os-head">
          <span class="os-code">${esc(c.action_code)}</span>
          <span class="os-title">${esc(c.title)}</span>
          <span class="os-tag ${esc(c.status)}">${esc(c.status)}</span>
        </div>
        <dl class="os-kv">
          <div><dt>What do I have to do?</dt><dd>${value(c.what_to_do)}</dd></div>
          <div><dt>Where do I do it?</dt><dd>${
            c.where_to_do_it
              ? `<a href="${esc(c.where_to_do_it)}" rel="noopener">${esc(c.where_to_do_it)}</a>`
              : unknown("No destination recorded.")
          }</dd></div>
          <div><dt>Why can't THYLORA do it?</dt><dd>${value(c.why_not_thylora)}</dd></div>
          <div><dt>How do we know it is done?</dt><dd>${value(c.how_we_know_done)}</dd></div>
        </dl>
        ${
          steps.length
            ? `<div class="os-note"><strong>Exactly what to press</strong><ol class="os-blockers">${steps
                .map((s) => `<li>${esc(s)}</li>`)
                .join("")}</ol></div>`
            : ""
        }
        ${c.source_record ? `<p class="os-since">Source: ${esc(c.source_record)}</p>` : ""}
      </div>`;
  }

  /* --------------------------------------------------------- TODAY / NOW BOARD */
  function renderToday() {
    const host = document.querySelector(HOSTS.today);
    if (!host) return;
    const board = payload.today_board || {};
    const order = [
      "Store", "News", "Studio", "Social", "Automotive", "Bramble",
      "Global Arrival", "Legal / Rights", "Family / protected", "World systems",
    ];
    const keys = Object.keys(board);
    const ordered = order.filter((k) => keys.includes(k)).concat(keys.filter((k) => !order.includes(k)));

    host.innerHTML = ordered.length
      ? ordered
          .map(
            (g) => `
        <div class="os-group">
          <h4>${esc(g)} — ${list(board[g]).length} item(s)</h4>
          ${list(board[g])
            .map(
              (r) => `
            <div class="os-card">
              <div class="os-head">
                <span class="os-code">${esc(r.code)}</span>
                <span class="os-title">${esc(r.title)}</span>
                <span class="os-tag">${esc(r.state)}</span>
              </div>
              ${r.restart_point ? `<div class="os-note">${esc(r.restart_point)}</div>` : ""}
              <p class="os-since">Last change ${esc(when(r.updated_at))}</p>
            </div>`
            )
            .join("")}
        </div>`
          )
          .join("")
      : `<div class="os-card"><p>No grouped work returned by the backend.</p></div>`;
  }

  /* ------------------------------------------------------- STORE TRAFFIC PANEL */
  function renderStore() {
    const host = document.querySelector(HOSTS.store);
    if (!host) return;
    const s = payload.store || {};
    const products = list(s.products);
    const shelves = ["AVAILABLE NOW", "IN DEVELOPMENT", "COMING SOON"];
    const readbacks = list(s.provider_readback);
    const fp = s.founding_purchase;
    const ext = s.external_customer_1 || {};

    const twelve = products.find((p) => /Twelve Miles/i.test(p.title || ""));
    const twelveReadback = readbacks.find((r) => /Twelve Miles/i.test(r.title || ""));

    host.innerHTML = `
      <div class="os-card ${twelve ? "" : "is-blocked"}">
        <div class="os-head">
          <span class="os-code">TWELVE MILES FOR FLOUR</span>
          <span class="os-tag ${twelve && twelve.active_allowed ? "ACTIVE" : "BLOCKED"}">${
            twelve ? esc(twelve.product_state) : "NOT FOUND"
          }</span>
        </div>
        <dl class="os-kv">
          <div><dt>Verified price (provider readback)</dt><dd>${
            twelveReadback && twelveReadback.price
              ? esc(twelveReadback.price) + " " + esc(twelveReadback.currency || "")
              : unknown("No provider price readback on record for this product.")
          }</dd></div>
          <div><dt>Verified store state</dt><dd>${
            twelveReadback ? value(twelveReadback.listing_status) : unknown("No provider readback.")
          }</dd></div>
          <div><dt>Readback taken</dt><dd>${
            twelveReadback ? esc(when(twelveReadback.readback_at)) : unknown()
          }</dd></div>
          <div><dt>Rights</dt><dd>${twelve ? (twelve.rights_passed ? "PASSED" : unknown("Not passed.")) : unknown()}</dd></div>
          <div><dt>Delivery</dt><dd>${twelve ? (twelve.delivery_connected ? "CONNECTED" : unknown("Not connected.")) : unknown()}</dd></div>
          <div><dt>Checkout path</dt><dd>${twelve ? (twelve.checkout_verified ? "VERIFIED" : unknown("Not verified.")) : unknown()}</dd></div>
          <div><dt>Re-access</dt><dd>${twelve ? (twelve.reaccess_verified ? "VERIFIED" : unknown("Not verified.")) : unknown()}</dd></div>
        </dl>
      </div>

      <div class="os-card ${ext.state === "NOT_WITNESSED" ? "is-blocked" : ""}">
        <div class="os-head">
          <span class="os-code">EXTERNAL CUSTOMER #1</span>
          <span class="os-tag ${ext.state === "NOT_WITNESSED" ? "BLOCKED" : "ACTIVE"}">${esc(ext.state || "UNKNOWN")}</span>
        </div>
        <div class="os-note">${esc(ext.basis || "")}</div>
        ${
          fp
            ? `<dl class="os-kv">
                 <div><dt>Latest checkout evidence</dt><dd>${esc(fp.canonical_id)} — ${esc(fp.evidence_status)}</dd></div>
                 <div><dt>Recorded</dt><dd>${esc(when(fp.updated_at))}</dd></div>
               </dl>
               <div class="os-note">${esc(fp.evidence || "")}</div>
               <div class="os-note"><strong>Next</strong> ${esc(fp.next_action || "")}</div>`
            : `<p>${unknown("No founding-purchase record found.")}</p>`
        }
        <p class="os-since">Payment capture witnesses on record: ${esc(s.payment_capture_witness_count ?? 0)} · checkout events table rows: ${esc(s.checkout_event_count ?? 0)}</p>
      </div>

      ${shelves
        .map((shelf) => {
          const rows = products.filter((p) => p.shelf === shelf);
          return `
          <div class="os-group">
            <h4>${esc(shelf)} — ${rows.length}</h4>
            ${
              rows.length
                ? rows
                    .map(
                      (p) => `
              <div class="os-card ${p.active_allowed ? "" : "is-blocked"}">
                <div class="os-head">
                  <span class="os-title">${esc(p.title)}</span>
                  <span class="os-tag ${p.active_allowed ? "ACTIVE" : "BLOCKED"}">${esc(p.product_state)}</span>
                </div>
                ${
                  list(p.blockers).length
                    ? `<ul class="os-blockers">${list(p.blockers)
                        .map((b) => `<li>${esc(b)}</li>`)
                        .join("")}</ul>`
                    : ""
                }
              </div>`
                    )
                    .join("")
                : `<div class="os-card"><p>None on this shelf.</p></div>`
            }
          </div>`;
        })
        .join("")}

      <div class="os-group">
        <h4>Traffic / post drafts waiting for approval — ${list(s.traffic_drafts).length}</h4>
        ${
          list(s.traffic_drafts).length
            ? list(s.traffic_drafts)
                .map(
                  (d) => `
          <div class="os-card">
            <div class="os-head">
              <span class="os-code">${esc(d.code)}</span>
              <span class="os-title">${esc(d.title || "")}</span>
              <span class="os-tag WAITING">${esc(d.approval)}</span>
            </div>
            <dl class="os-kv">
              <div><dt>Channel</dt><dd>${value(d.channel)}</dd></div>
              <div><dt>Rights</dt><dd>${
                d.rights === "UNKNOWN" || d.rights === "UNVERIFIED" ? unknown(d.rights) : value(d.rights)
              }</dd></div>
            </dl>
          </div>`
                )
                .join("")
            : `<div class="os-card"><p>Nothing waiting.</p></div>`
        }
      </div>
    `;
  }

  /* ------------------------------------------------- ERSATZREALITY NEWS PANEL */
  function renderNews() {
    const host = document.querySelector(HOSTS.news);
    if (!host) return;
    const n = payload.news || {};
    const p = n.program || {};
    const snap = p.status_snapshot || {};
    const issue = n.current_issue;
    const cl = n.claim_ledger || {};
    const approvals = (issue && issue.approvals) || {};

    host.innerHTML = `
      <div class="os-card">
        <div class="os-head">
          <span class="os-code">${esc(p.program_code || "ER-NEWS-001")}</span>
          <span class="os-title">${esc(snap.masthead_spelling || p.title || "")}</span>
          <span class="os-tag">${esc(p.state || "UNKNOWN")}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Masthead</dt><dd>${value(snap.masthead_spelling)}</dd></div>
          <div><dt>Recurring presenter</dt><dd>${value(snap.presenter_name)} <span class="os-tag">${esc(
            snap.presenter_lock || ""
          )}</span></dd></div>
          <div><dt>Presenter serial</dt><dd>${value(p.presenter_serial)}</dd></div>
          <div><dt>Release state</dt><dd>${value(p.release_state)}</dd></div>
        </dl>
        <div class="os-note"><strong>Claim gate</strong> ${esc(p.claim_gate || "")}</div>
        <div class="os-note"><strong>Rights gate</strong> ${esc(p.rights_gate || "")}</div>
      </div>

      ${
        issue
          ? `
      <div class="os-card is-chairman">
        <div class="os-head">
          <span class="os-code">${esc(issue.episode_serial)}</span>
          <span class="os-title">${esc(issue.title)}</span>
          <span class="os-tag">${esc(issue.state)}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Production state</dt><dd>${value(issue.release_state)}</dd></div>
          <div><dt>Factual cutoff</dt><dd>${
            issue.factual_cutoff_at ? esc(when(issue.factual_cutoff_at)) : unknown("No factual cutoff recorded.")
          }</dd></div>
          <div><dt>Chairman</dt><dd>${value(approvals.chairman)}</dd></div>
          <div><dt>Publication</dt><dd><span class="os-tag HELD">${esc(
            approvals.publication || "LOCKED"
          )}</span></dd></div>
        </dl>
        <dl class="os-kv">
          <div><dt>Claims documented</dt><dd>${esc(cl.pass ?? 0)} of ${esc(cl.total ?? 0)}</dd></div>
          <div><dt>Claims labelled inference</dt><dd>${esc(cl.inference ?? 0)}</dd></div>
          <div><dt>Claims declared unknown</dt><dd>${
            (cl.unknown ?? 0) > 0 ? unknown(`${cl.unknown} claim(s) declared UNKNOWN`) : "0"
          }</dd></div>
        </dl>
        <div class="os-note"><strong>Exact final Chairman action required</strong><br>
          Production may continue. Publication stays locked until you approve the final preview.
          The recorded publication gate is "${esc(approvals.publication || "LOCKED")}".</div>
      </div>`
          : `<div class="os-card"><p>${unknown("Current Ravens issue not found in the episode registry.")}</p></div>`
      }

      <div class="os-group">
        <h4>Other episodes on record</h4>
        ${list(n.other_episodes)
          .map(
            (e) => `
          <div class="os-card">
            <div class="os-head">
              <span class="os-code">${esc(e.episode_serial)}</span>
              <span class="os-title">${esc(e.title)}</span>
              <span class="os-tag">${esc(e.release_state)}</span>
            </div>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  /* ------------------------------------------------------ SOCIAL CONTROL PANEL */
  function renderSocial() {
    const host = document.querySelector(HOSTS.social);
    if (!host) return;
    const s = payload.social || {};
    const q = s.queue || {};
    const buckets = ["DRAFTING", "READY FOR REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "BLOCKED"];
    const fb = s.facebook_separation || {};

    host.innerHTML = `
      <div class="os-band">
        ${buckets
          .map(
            (b) => `<div class="os-stat"><b>${list(q[b]).length}</b><span>${esc(b)}</span></div>`
          )
          .join("")}
      </div>

      ${buckets
        .map(
          (b) => `
        <div class="os-group">
          <h4>${esc(b)}</h4>
          ${
            list(q[b]).length
              ? list(q[b])
                  .map(
                    (i) => `
            <div class="os-card ${b === "BLOCKED" ? "is-blocked" : ""}">
              <div class="os-head">
                <span class="os-code">${esc(i.code)}</span>
                <span class="os-title">${esc(i.title || "")}</span>
                <span class="os-tag ${esc(b.replace(/\s/g, ""))}">${esc(i.state)}</span>
              </div>
              <dl class="os-kv">
                <div><dt>Channel</dt><dd>${value(i.channel)}</dd></div>
                <div><dt>Approval</dt><dd>${value(i.approval)}</dd></div>
                <div><dt>Rights</dt><dd>${
                  i.rights === "UNKNOWN" || i.rights === "UNVERIFIED" ? unknown(i.rights) : value(i.rights)
                }</dd></div>
                <div><dt>Published</dt><dd>${
                  i.published_at ? esc(when(i.published_at)) : "Not published"
                }</dd></div>
              </dl>
            </div>`
                  )
                  .join("")
              : `<div class="os-card"><p>None.</p></div>`
          }
        </div>`
        )
        .join("")}

      <hr class="os-sep">

      <div class="os-group">
        <h4>Facebook — held apart on purpose</h4>
        <div class="os-card">
          <div class="os-head"><span class="os-title">ErsatzReality Enterprise Page</span></div>
          <dl class="os-kv">
            <div><dt>Channel</dt><dd>${value(fb.enterprise_page && fb.enterprise_page.channel_code)}</dd></div>
            <div><dt>Automation</dt><dd>${value(fb.enterprise_page && fb.enterprise_page.automation_state)}</dd></div>
            <div><dt>Publication</dt><dd>${value(fb.enterprise_page && fb.enterprise_page.publication_state)}</dd></div>
          </dl>
        </div>
        <div class="os-card is-blocked">
          <div class="os-head"><span class="os-title">Personal Facebook</span></div>
          <p>${unknown(fb.personal_facebook && fb.personal_facebook.basis)}</p>
        </div>
      </div>

      <div class="os-group">
        <h4>Channels — connection is not posting access</h4>
        ${list(s.channels)
          .map(
            (c) => `
          <div class="os-card">
            <div class="os-head">
              <span class="os-code">${esc(c.channel_code)}</span>
              <span class="os-title">${esc(c.channel_name)}</span>
              <span class="os-tag">${esc(c.platform || "no platform")}</span>
            </div>
            <dl class="os-kv">
              <div><dt>Automation</dt><dd>${value(c.automation_state)}</dd></div>
              <div><dt>Posting access</dt><dd>${
                /NOT/.test(c.posting_access || "") ? unknown(c.posting_access) : esc(c.posting_access)
              }</dd></div>
            </dl>
          </div>`
          )
          .join("")}
      </div>

      <div class="os-group">
        <h4>Global Arrival — ${list(s.global_arrival).length} platforms</h4>
        ${list(s.global_arrival)
          .map(
            (m) => `
          <div class="os-card ${m.posting_access === "NOT_WITNESSED" ? "is-blocked" : ""}">
            <div class="os-head">
              <span class="os-code">T${esc(m.tier)}</span>
              <span class="os-title">${esc(m.platform_name)}</span>
              <span class="os-tag ${m.posting_access === "NOT_WITNESSED" ? "UNKNOWN" : "ACTIVE"}">${esc(
                m.posting_access
              )}</span>
            </div>
            <dl class="os-kv">
              <div><dt>Account</dt><dd>${value(m.account, "No account identifier recorded.")}</dd></div>
              <div><dt>Blocker</dt><dd>${value(m.blocker)}</dd></div>
            </dl>
            ${m.next_action ? `<div class="os-note">${esc(m.next_action)}</div>` : ""}
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  /* ----------------------------------------------------------- ACTION CARDS */
  function renderActions() {
    const host = document.querySelector(HOSTS.actions);
    if (!host) return;
    const cards = list(payload.action_cards);
    const open = cards.filter((c) => c.status === "OPEN");
    const closed = cards.filter((c) => c.status !== "OPEN");
    host.innerHTML = `
      <div class="os-group">
        <h4>Open — these need you</h4>
        ${open.length ? open.map(actionCardHtml).join("") : `<div class="os-card"><p>Nothing open.</p></div>`}
      </div>
      <div class="os-group">
        <h4>Closed / superseded — history, not instructions</h4>
        ${closed
          .map(
            (c) => `
          <div class="os-card">
            <div class="os-head">
              <span class="os-code">${esc(c.action_code)}</span>
              <span class="os-title">${esc(c.title)}</span>
              <span class="os-tag">${esc(c.status)}</span>
            </div>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  /* ----------------------------------------------------- WORKROOM CONTINUITY */
  function renderRooms() {
    const host = document.querySelector(HOSTS.rooms);
    if (!host) return;
    host.innerHTML = list(payload.workrooms)
      .map(
        (r) => `
      <div class="os-card">
        <div class="os-head">
          <span class="os-code">${esc(r.workroom_code)}</span>
          <span class="os-title">${esc(r.title)}</span>
          <span class="os-tag">${esc(r.state)}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Current authority</dt><dd>${value(r.authority, "No source of truth recorded.")}</dd></div>
          <div><dt>Last meaningful change</dt><dd>${esc(when(r.last_change))}</dd></div>
          <div><dt>Lane</dt><dd>${value(r.lane)}</dd></div>
          <div><dt>Newest evidence</dt><dd>${
            r.evidence ? esc(JSON.stringify(r.evidence).slice(0, 160)) : unknown("No evidence recorded.")
          }</dd></div>
        </dl>
        <div class="os-note"><strong>Current restart point</strong><br>${
          r.restart_point ? esc(r.restart_point) : unknown("No restart point recorded.")
        }</div>
        ${
          list(r.blockers).length
            ? `<ul class="os-blockers">${list(r.blockers).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
            : ""
        }
        ${
          list(r.next_executable).length
            ? `<details><summary>Next executable work (${list(r.next_executable).length})</summary>
                <ul class="os-blockers">${list(r.next_executable)
                  .map((t) => `<li><span class="os-code">${esc(t.task)}</span> ${esc(t.title)} — ${esc(t.next_action || "")}</li>`)
                  .join("")}</ul></details>`
            : `<p class="os-since">No unblocked task rows. ${
                list(r.blockers).length ? "This workroom is blocked." : "Readiness is UNMEASURED, not zero."
              }</p>`
        }
      </div>`
      )
      .join("");
  }

  /* ------------------------------------------- NEWS / STORE / SOCIAL BRIDGE */
  function renderBridge() {
    const host = document.querySelector(HOSTS.bridge);
    if (!host) return;
    host.innerHTML =
      `<p class="os-since">Publication is a separate authority action. A full row of green stages never implies it.</p>` +
      list(payload.bridge)
        .map(
          (b) => `
      <div class="os-card">
        <div class="os-head">
          <span class="os-code">${esc(b.code)}</span>
          <span class="os-title">${esc(b.title || "")}</span>
        </div>
        <div class="os-pipe">
          ${list(b.stages)
            .map(
              (s) => `<div class="os-step ${esc(s.state)}"><b>${esc(s.stage)}</b> ${esc(s.state)}</div>`
            )
            .join("")}
        </div>
      </div>`
        )
        .join("");
  }

  /* ----------------------------------------------------------- BRAND ASSETS */
  function renderBrand() {
    const host = document.querySelector(HOSTS.brand);
    if (!host) return;
    host.innerHTML = list(payload.brand_assets)
      .map(
        (b) => `
      <div class="os-card ${b.truth_class === "UNKNOWN" ? "is-blocked" : ""}">
        <div class="os-head">
          <span class="os-code">${esc(b.group)}</span>
          <span class="os-title">${esc(b.label)}</span>
          <span class="os-tag ${esc(b.truth_class)}">${esc(b.truth_class)}</span>
        </div>
        <dl class="os-kv">
          <div><dt>Value</dt><dd>${
            b.truth_class === "UNKNOWN" ? unknown("Not known. Not guessed.") : value(b.value)
          }</dd></div>
          <div><dt>Approval</dt><dd>${value(b.approval_state)}</dd></div>
          <div><dt>Reference</dt><dd>${value(b.reference, "No reference asset registered.")}</dd></div>
        </dl>
        ${b.notes ? `<div class="os-note">${esc(b.notes)}</div>` : ""}
      </div>`
      )
      .join("");
  }

  /* ------------------------------------------------------ SYSTEM TRUTH PANEL */
  function renderTruth() {
    const host = document.querySelector(HOSTS.truth);
    if (!host) return;
    const t = payload.truth || {};
    const deploy = payload.deployment_truth || {};
    host.innerHTML = `
      <div class="os-band">
        <div class="os-stat"><b>${esc(t.documented ?? 0)}</b><span>Documented</span></div>
        <div class="os-stat"><b>${esc(t.analysis ?? 0)}</b><span>Analysis</span></div>
        <div class="os-stat is-unknown"><b>${esc(t.unknown ?? 0)}</b><span>Unknown</span></div>
        <div class="os-stat is-unknown"><b>${esc(t.platforms_not_witnessed ?? 0)}</b><span>Platforms not witnessed</span></div>
      </div>

      <div class="os-group">
        <h4>Declared unknown — not buried, not guessed</h4>
        ${
          list(t.unknown_items).length
            ? list(t.unknown_items)
                .map(
                  (u) => `
          <div class="os-card is-blocked">
            <div class="os-head">
              <span class="os-title">${esc(u.label)}</span>
              <span class="os-tag UNKNOWN">UNKNOWN</span>
            </div>
            ${u.notes ? `<div class="os-note">${esc(u.notes)}</div>` : ""}
          </div>`
                )
                .join("")
            : `<div class="os-card"><p>No declared unknown brand slots.</p></div>`
        }
      </div>

      <div class="os-group">
        <h4>Deployment and regression truth — ${esc(deploy.blocked_count ?? 0)} blocked, ${esc(
          deploy.not_tested_count ?? 0
        )} not tested</h4>
        ${list(deploy.checks)
          .filter((c) => c.check_state !== "PASS")
          .map(
            (c) => `
          <div class="os-card is-blocked">
            <div class="os-head">
              <span class="os-code">${esc(c.evidence_code)}</span>
              <span class="os-title">${esc(c.check_name)}</span>
              <span class="os-tag ${esc(c.check_state)}">${esc(c.check_state)}</span>
            </div>
            ${c.blocker ? `<div class="os-note"><strong>Blocker</strong> ${esc(c.blocker)}</div>` : ""}
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  /* -------------------------------------------------------------------- LOAD */
  function allHosts() {
    return Object.values(HOSTS)
      .map((sel) => document.querySelector(sel))
      .filter(Boolean);
  }

  function setAll(fn, arg) {
    allHosts().forEach((h) => fn(h, arg));
  }

  async function load() {
    const hosts = allHosts();
    if (!hosts.length) return;
    installStyle();

    const client = window.thyloraSupabase;
    if (!client) {
      setAll(ps().renderError, new Error("Supabase client is not initialised."));
      return;
    }

    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData?.session) {
      setAll(ps().renderSignedOut, "Sign in as Chairman to load the operating surface.");
      return;
    }

    setAll(ps().renderLoading, "Reading authoritative backend state…");

    const { data, error } = await client.rpc("thylora_operating_surface_v1", { p_since: null });
    if (error) {
      setAll(ps().renderError, error);
      return;
    }
    if (!data || data.allowed !== true) {
      setAll(
        ps().renderAccessDenied,
        (data && data.note) || "This surface is Chairman-only. The gate was not weakened."
      );
      return;
    }

    payload = data;
    renderHome();
    renderToday();
    renderStore();
    renderNews();
    renderSocial();
    renderActions();
    renderRooms();
    renderBridge();
    renderBrand();
    renderTruth();

    // Record the visit only AFTER a successful render, so "what changed since
    // last visit" is anchored to a visit the Chairman actually saw.
    try {
      await client.rpc("thylora_record_chairman_visit_v1");
    } catch (_) {
      /* a failed visit stamp must never blank the board */
    }
  }

  function wireRefresh() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-operating-refresh]");
      if (!btn) return;
      e.preventDefault();
      load();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireRefresh();
    load();
  });
  window.addEventListener("thylora:auth-changed", load);
  window.thyloraOperatingSurface = { load };
})();
