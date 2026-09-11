// RAE LINK · watch page
// Workroom: WR-RAELINK-001
//
// Playback, then the governed audience surface: reactions, comments, report.
// A held comment stays visible to its own author with a plain explanation —
// nobody is quietly silenced. A world channel carries its disclosure beside the
// player, not buried in a description.

import { rpc, api, safeRead, getSession, currentUser } from '../lib/backend.js';
import { classify } from '../lib/qyris.js';
import { announce, focusView, trapFocus } from '../lib/a11y.js';
import { formatDuration } from '../lib/media.js';
import { REACTION_KINDS, REPORT_REASONS, screenComment } from '../lib/moderation.js';
import { classBadge, gapPanel } from './channel.js';

const esc = (value = '') => String(value).replace(/[&<>'"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const REACTION_LABEL = {
  LIKE: '👍 Like', APPRECIATE: '🙏 Appreciate', LEARNED: '💡 Learned something',
  MOVED: '🕊 Moved', QUESTION: '❓ Question'
};

let currentAsset = null;

export async function renderWatch(assetId, root) {
  root.innerHTML = '<p class="muted" role="status">Loading…</p>';
  const result = await safeRead('watch', () => rpc('rael_watch_page', { p_asset_id: assetId }));

  if (!result.ok) {
    root.innerHTML = gapPanel(classify({ provisionRequired: result.provisionRequired, message: result.message }));
    return;
  }
  if (!result.data?.found) {
    root.innerHTML = `<div class="notice bad" role="alert"><strong>Not available to you</strong>
      <span>${esc(result.data?.detail ?? 'This media is not published, or your access does not reach it.')}</span>
      <span class="recovery">Access is not authority. If this is paid or subscriber media, the entitlement is checked by the backend, not by the page.</span></div>`;
    return;
  }

  const { asset, channel, renditions, captions, reactions, my_reactions, rights } = result.data;
  currentAsset = asset;
  const playable = renditions.find(r => r.playback_url && !['POSTER', 'THUMBNAIL'].includes(r.kind));
  const simulated = channel.world_status === 'WORLD_SIMULATED';

  root.innerHTML = `
    <nav class="crumbs"><a href="#watch">Feed</a> <span aria-hidden="true">›</span>
      <a href="#channel/${esc(channel.slug)}">${esc(channel.name)}</a></nav>

    <div class="player ${simulated ? 'is-world' : ''}">
      ${playerMarkup(asset, playable, captions)}
    </div>

    ${simulated ? `<p class="disclosure" role="note"><strong>Simulated world media.</strong>
      ${esc(channel.simulated_disclosure ?? '')} This is not an Earth person or an Earth event.</p>` : ''}

    <h2>${esc(asset.title)}</h2>
    <p class="meta-row">
      <a href="#channel/${esc(channel.slug)}">${esc(channel.name)}</a>
      ${classBadge(channel)}
      ${asset.published_at ? `<span class="muted">${new Date(asset.published_at).toLocaleDateString()}</span>` : ''}
      ${asset.duration_seconds ? `<span class="muted">${esc(formatDuration(asset.duration_seconds))}</span>` : ''}
      ${asset.version_no > 1 ? `<span class="tag">VERSION ${asset.version_no}</span>` : ''}
    </p>
    ${asset.description ? `<p class="description">${esc(asset.description)}</p>` : ''}
    ${rights ? `<p class="muted rights-line">Rights: ${esc(String(rights.ownership_basis).replaceAll('_', ' ').toLowerCase())} · gate ${esc(rights.gate_state)}</p>` : ''}

    <div class="reaction-row" role="group" aria-label="Reactions">
      ${REACTION_KINDS.map(kind => `<button type="button" class="chip-btn reaction ${my_reactions.includes(kind) ? 'active' : ''}"
        data-reaction="${kind}" aria-pressed="${my_reactions.includes(kind)}">
        ${REACTION_LABEL[kind]} <b data-count="${kind}">${Number(reactions[kind] ?? 0)}</b></button>`).join('')}
      <button type="button" class="chip-btn report" id="reportBtn" aria-haspopup="dialog">⚑ Report</button>
    </div>

    <section class="comments" aria-label="Comments">
      <h3>Comments</h3>
      <form id="commentForm" class="comment-form">
        <label class="sr-only" for="commentBody">Add a comment</label>
        <textarea id="commentBody" rows="3" maxlength="4000"
          placeholder="Say something useful. Comments are governed: structural screening only, and you always see your own words."></textarea>
        <div class="btn-row">
          <button type="submit">Post comment</button>
          <span class="muted" id="commentCounter" aria-live="polite">0 / 4000</span>
        </div>
        <p class="status" id="commentStatus" role="status"></p>
      </form>
      <div id="commentList"><p class="muted">Loading comments…</p></div>
    </section>

    <div class="modal" id="reportModal" role="dialog" aria-modal="true" aria-labelledby="reportTitle" hidden>
      <div class="modal-card">
        <h3 id="reportTitle">Report this media</h3>
        <form id="reportForm">
          <label>Reason
            <select name="reason_code" required>
              ${REPORT_REASONS.map(r => `<option value="${r}">${r.replaceAll('_', ' ').toLowerCase()}</option>`).join('')}
            </select>
          </label>
          <label>What is the problem?
            <textarea name="statement" rows="3" placeholder="Required for “other”. Ten characters or more."></textarea>
          </label>
          <div class="btn-row">
            <button type="submit">Send report</button>
            <button type="button" class="ghost" id="reportCancel">Cancel</button>
          </div>
          <p class="status" id="reportStatus" role="status"></p>
        </form>
      </div>
    </div>`;

  focusView(root);
  wireReactions(root, asset);
  wireComments(root, asset);
  wireReport(root, asset);
  await loadComments(root, asset.asset_id);
}

function playerMarkup(asset, playable, captions) {
  const tracks = captions.map(c =>
    `<track kind="${c.kind === 'DESCRIPTION' ? 'descriptions' : 'captions'}" srclang="${esc(c.language)}"
       label="${esc(c.language)} ${esc(c.kind.toLowerCase())}"${c.is_default ? ' default' : ''}>`).join('');

  if (!playable) {
    return `<div class="player-empty" role="note">
      <p><strong>No playable rendition yet.</strong></p>
      <p class="muted">This work is at pipeline stage ${esc(asset.pipeline_state)}. Encoding is a provider step
      that has not been chosen yet, so playback is not available even though the record is complete.</p>
      ${asset.poster_data_url ? `<img class="poster-still" src="${esc(asset.poster_data_url)}" alt="Poster frame for ${esc(asset.title)}">` : ''}
    </div>`;
  }
  if (asset.media_kind === 'AUDIO') {
    return `<audio controls preload="metadata" src="${esc(playable.playback_url)}"
      aria-label="${esc(asset.title)}">${tracks}</audio>`;
  }
  return `<video controls playsinline preload="metadata"
    ${asset.poster_data_url ? `poster="${esc(asset.poster_data_url)}"` : ''}
    src="${esc(playable.playback_url)}" aria-label="${esc(asset.title)}">${tracks}</video>`;
}

function wireReactions(root, asset) {
  root.querySelectorAll('[data-reaction]').forEach(button => {
    button.addEventListener('click', async () => {
      if (!getSession()?.access_token) {
        announce('Sign in to react.', { assertive: true });
        return;
      }
      const kind = button.dataset.reaction;
      const on = button.getAttribute('aria-pressed') !== 'true';
      button.disabled = true;
      try {
        const response = await rpc('rael_set_reaction', { p_asset_id: asset.asset_id, p_kind: kind, p_on: on });
        if (response?.ok) {
          button.setAttribute('aria-pressed', String(on));
          button.classList.toggle('active', on);
          root.querySelector(`[data-count="${kind}"]`).textContent = Number(response.count);
          announce(`${on ? 'Added' : 'Removed'} reaction ${kind.toLowerCase()}.`);
        }
      } catch (error) {
        announce(classify(error).recovery, { assertive: true });
      } finally {
        button.disabled = false;
      }
    });
  });
}

function wireComments(root, asset) {
  const body = root.querySelector('#commentBody');
  const counter = root.querySelector('#commentCounter');
  body?.addEventListener('input', () => { counter.textContent = `${body.value.length} / 4000`; });

  root.querySelector('#commentForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = root.querySelector('#commentStatus');
    status.className = 'status';

    if (!getSession()?.access_token) {
      status.className = 'status bad';
      status.textContent = 'Sign in under Account to comment. What you typed is still here.';
      return;
    }

    // Screen locally first so the author hears the same answer the server gives,
    // without a round trip. The server screens again and is the authority.
    const preview = screenComment({ body: body.value });
    if (!preview.accepted) {
      status.className = 'status bad';
      status.textContent = preview.reasons.map(r => r.detail).join(' ');
      return;
    }

    status.textContent = 'Posting…';
    try {
      const response = await rpc('rael_post_comment', { p_payload: { asset_id: asset.asset_id, body: body.value } });
      if (!response?.posted) {
        status.className = 'status bad';
        status.textContent = response?.code === 'RATE_LIMITED'
          ? response.detail
          : (response?.reasons ?? []).map(r => r.detail).join(' ') || 'The comment was not accepted.';
        return;
      }
      body.value = '';
      counter.textContent = '0 / 4000';
      if (response.moderation_state === 'HELD') {
        status.className = 'status';
        status.textContent = 'Posted and held for review. You can see it below; others will see it once it is released. '
          + (response.reasons ?? []).map(r => r.detail).join(' ');
        announce('Your comment is posted and held for review.');
      } else {
        status.className = 'status good';
        status.textContent = 'Posted.';
        announce('Comment posted.');
      }
      await loadComments(root, asset.asset_id);
    } catch (error) {
      const gap = classify(error);
      status.className = 'status bad';
      status.textContent = `${gap.detail} ${gap.recovery}`;
    }
  });
}

export async function loadComments(root, assetId) {
  const list = root.querySelector('#commentList');
  if (!list) return;
  const result = await safeRead('comments', () => rpc('rael_list_comments', { p_asset_id: assetId, p_limit: 100 }));
  if (!result.ok) {
    list.innerHTML = `<p class="muted">${result.provisionRequired
      ? 'Comments cannot load until the RAE Link tables are applied to the backend.'
      : esc(result.message)}</p>`;
    return;
  }
  const comments = result.data?.comments ?? [];
  const isStaff = Boolean(result.data?.is_staff);
  list.innerHTML = comments.length ? comments.map(comment => `
    <article class="comment ${comment.moderation_state === 'HELD' ? 'is-held' : ''}">
      <p class="who"><strong>${esc(comment.author)}</strong>
        ${comment.author_handle ? `<span class="muted">@${esc(comment.author_handle)}</span>` : ''}
        <span class="muted">${new Date(comment.created_at).toLocaleString()}</span>
        ${comment.is_mine ? '<span class="tag">YOURS</span>' : ''}
        ${comment.moderation_state !== 'VISIBLE' ? `<span class="tag held">${esc(comment.moderation_state)}</span>` : ''}
      </p>
      <p class="body">${esc(comment.body)}</p>
      ${comment.notice ? `<p class="notice-line">${esc(comment.notice)}</p>` : ''}
      ${isStaff && comment.moderation_state === 'HELD'
        ? `<div class="btn-row staff-actions">
             <button type="button" class="ghost" data-moderate="VISIBLE" data-comment="${esc(comment.comment_id)}">Release</button>
             <button type="button" class="ghost" data-moderate="HIDDEN" data-comment="${esc(comment.comment_id)}">Hide</button>
             <button type="button" class="ghost" data-moderate="REMOVED" data-comment="${esc(comment.comment_id)}">Remove</button>
           </div>` : ''}
    </article>`).join('') : '<p class="muted">No comments yet.</p>';

  list.querySelectorAll('[data-moderate]').forEach(button => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const response = await rpc('rael_moderate_comment', {
          p_comment_id: button.dataset.comment, p_state: button.dataset.moderate
        });
        if (response?.ok) {
          announce(`Comment moved from ${response.from} to ${response.to}.`);
          await loadComments(root, assetId);
        } else {
          announce(response?.detail ?? 'That change was refused.', { assertive: true });
          button.disabled = false;
        }
      } catch (error) {
        announce(classify(error).recovery, { assertive: true });
        button.disabled = false;
      }
    });
  });
}

function wireReport(root, asset) {
  const modal = root.querySelector('#reportModal');
  let releaseFocus = () => {};

  root.querySelector('#reportBtn')?.addEventListener('click', () => {
    modal.hidden = false;
    releaseFocus = trapFocus(modal);
  });
  const close = () => { modal.hidden = true; releaseFocus(); };
  root.querySelector('#reportCancel')?.addEventListener('click', close);
  modal.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });

  root.querySelector('#reportForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = root.querySelector('#reportStatus');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!getSession()?.access_token) {
      status.className = 'status bad';
      status.textContent = 'Sign in to send a report, so it can be followed up with you.';
      return;
    }
    status.className = 'status';
    status.textContent = 'Sending…';
    try {
      const response = await rpc('rael_submit_report', {
        p_payload: {
          target_kind: 'ASSET', target_ref: asset.asset_id,
          reason_code: data.reason_code, statement: data.statement
        }
      });
      if (response?.ok) {
        status.className = 'status good';
        status.textContent = `Report ${response.report_code} received and routed to ${String(response.queue).replaceAll('_', ' ').toLowerCase()}.`;
        announce('Report sent.');
      } else {
        status.className = 'status bad';
        status.textContent = response?.code === 'REASON_INVALID'
          ? 'Choose a reason for the report.' : 'The report was not accepted.';
      }
    } catch (error) {
      const gap = classify(error);
      status.className = 'status bad';
      status.textContent = `${gap.detail} ${gap.recovery}`;
    }
  });
}

export function currentWatchAsset() { return currentAsset; }
