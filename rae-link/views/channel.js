// RAE LINK · channel page
// Workroom: WR-RAELINK-001
//
// A channel page answers three questions before anything else: whose channel is
// this, is it an Earth channel or simulated world media, and what can I watch.
// The class label is never decoration — it is read out to assistive technology
// and it appears on every tile the channel owns.

import { rpc, safeRead, getSession } from '../lib/backend.js';
import { classify } from '../lib/qyris.js';
import { announce, channelClassLabel, focusView } from '../lib/a11y.js';
import { formatDuration } from '../lib/media.js';

const esc = (value = '') => String(value).replace(/[&<>'"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

export function classBadge(channel) {
  const simulated = channel?.world_status === 'WORLD_SIMULATED';
  return `<span class="tag ${simulated ? 'world' : 'earth'}" title="${esc(channelClassLabel(channel))}">
    <span aria-hidden="true">${simulated ? '◆' : '●'}</span>
    ${simulated ? 'WORLD MEDIA · SIMULATED' : 'EARTH CHANNEL'}
    <span class="sr-only">. ${esc(channelClassLabel(channel))}</span>
  </span>`;
}

function mediaTile(item, channel) {
  const length = item.duration_seconds ? formatDuration(item.duration_seconds) : '';
  const draft = item.pipeline_state !== 'PUBLISHED';
  return `<a class="tile" href="#player/${esc(item.asset_id)}">
    <span class="poster" aria-hidden="true">${
      item.poster_data_url
        ? `<img src="${esc(item.poster_data_url)}" alt="">`
        : item.media_kind === 'AUDIO' ? '♪' : item.media_kind === 'EDF' ? '◆' : '▷'
    }${length ? `<b class="length">${esc(length)}</b>` : ''}</span>
    <span class="body">
      <strong>${esc(item.title)}</strong>
      <span class="meta">${esc(channel.name)}${draft ? ` · ${esc(item.pipeline_state)}` : ''}</span>
      ${draft ? `<span class="tag draft">${esc(item.visibility_state)} · NOT PUBLISHED</span>` : ''}
    </span>
  </a>`;
}

export async function renderChannel(slug, root) {
  root.innerHTML = '<p class="muted" role="status">Loading channel…</p>';
  const result = await safeRead('channel', () => rpc('rael_channel_page', { p_slug: slug }));

  if (!result.ok) {
    const gap = classify({ provisionRequired: result.provisionRequired, message: result.message });
    root.innerHTML = gapPanel(gap);
    return;
  }
  if (!result.data?.found) {
    root.innerHTML = `<div class="notice"><strong>Channel not found</strong>
      <span>No active channel answers to “${esc(slug)}”. A channel that is draft or suspended is visible only to its own staff.</span></div>`;
    return;
  }

  const { channel, followers, is_following, media } = result.data;
  const simulated = channel.world_status === 'WORLD_SIMULATED';

  root.innerHTML = `
    <article class="channel-head ${simulated ? 'is-world' : ''}">
      <p class="eyebrow">${esc(channel.channel_class.replaceAll('_', ' '))}</p>
      <h2>${esc(channel.name)}</h2>
      ${classBadge(channel)}
      ${simulated ? `<p class="disclosure" role="note">
        <strong>Simulated world media.</strong> ${esc(channel.simulated_disclosure ?? '')}
        This channel is not an Earth person.</p>` : ''}
      ${channel.description ? `<p>${esc(channel.description)}</p>` : ''}
      <div class="channel-actions">
        <button type="button" id="followBtn" class="${is_following ? 'ghost' : ''}"
          aria-pressed="${is_following}">${is_following ? 'Following' : 'Follow'}</button>
        <span class="muted" id="followerCount">${Number(followers).toLocaleString()} follower${Number(followers) === 1 ? '' : 's'}</span>
        ${channel.is_staff ? '<span class="tag staff">YOU ARE STAFF ON THIS CHANNEL</span>' : ''}
      </div>
    </article>
    <h3>${channel.is_staff ? 'Media, including your drafts' : 'Published media'}</h3>
    <div class="feed">${
      media.length
        ? media.map(item => mediaTile(item, channel)).join('')
        : `<p class="muted">Nothing ${channel.is_staff ? 'on this channel' : 'published'} yet. The feed shows real records only — nothing is invented to fill it.</p>`
    }</div>`;

  focusView(root);

  root.querySelector('#followBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    if (!getSession()?.access_token) {
      announce('Sign in to follow a channel.', { assertive: true });
      root.querySelector('#followBtn').insertAdjacentHTML('afterend',
        '<span class="status bad" role="alert">Sign in under Account to follow.</span>');
      return;
    }
    button.disabled = true;
    try {
      const response = await rpc('rael_toggle_follow', { p_channel_id: channel.id });
      if (response?.ok) {
        button.textContent = response.following ? 'Following' : 'Follow';
        button.setAttribute('aria-pressed', String(response.following));
        button.classList.toggle('ghost', response.following);
        root.querySelector('#followerCount').textContent =
          `${Number(response.followers).toLocaleString()} follower${Number(response.followers) === 1 ? '' : 's'}`;
        announce(response.following ? `Now following ${channel.name}.` : `Unfollowed ${channel.name}.`);
      }
    } catch (error) {
      const gap = classify(error);
      button.insertAdjacentHTML('afterend', `<span class="status bad" role="alert">${esc(gap.recovery)}</span>`);
    } finally {
      button.disabled = false;
    }
  });
}

export function gapPanel(gap) {
  return `<div class="notice ${gap.severity === 'BLOCK' || gap.severity === 'FAULT' ? 'bad' : ''}" role="status">
    <strong>${esc(gap.code.replaceAll('_', ' '))}</strong>
    <span>${esc(gap.detail)}</span>
    <span class="recovery">${esc(gap.recovery)}</span>
    ${gap.message ? `<code>${esc(gap.message)}</code>` : ''}
  </div>`;
}
