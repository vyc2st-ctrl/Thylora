// RAE LINK · governed comments, reactions and reports
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  screenComment, canTransitionComment, rateCheck, visibleToViewer,
  validateReaction, buildReport, routeReport, COMMENT_STATES, MAX_COMMENT_LENGTH
} from '../rae-link/lib/moderation.js';

test('an ordinary comment is visible immediately', () => {
  const result = screenComment({ body: 'This explained the ledger split clearly. Thank you.' });
  assert.equal(result.state, 'VISIBLE');
  assert.equal(result.accepted, true);
  assert.equal(result.reasons.length, 0);
});

test('an empty or oversized comment is rejected, not stored', () => {
  assert.equal(screenComment({ body: '   ' }).accepted, false);
  assert.equal(screenComment({ body: 'x'.repeat(MAX_COMMENT_LENGTH + 1) }).accepted, false);
  assert.equal(screenComment({ body: 'x'.repeat(MAX_COMMENT_LENGTH) }).accepted, true);
});

test('link flooding is held for review, never silently deleted', () => {
  const result = screenComment({ body: 'see https://a.test https://b.test https://c.test' });
  assert.equal(result.state, 'HELD');
  assert.ok(result.reasons.some(r => r.code === 'LINK_FLOOD'));
  assert.equal(result.author_can_see, true);
});

test('two links are fine; three are not', () => {
  assert.equal(screenComment({ body: 'https://a.test and https://b.test' }).state, 'VISIBLE');
});

test('an immediate repeat is held', () => {
  const body = 'Buy my thing right now';
  const result = screenComment({ body, recent: [{ body, created_at: new Date().toISOString() }] });
  assert.ok(result.reasons.some(r => r.code === 'DUPLICATE'));
});

test('shouting is held, but a short emphatic line is not', () => {
  assert.ok(screenComment({ body: 'THIS IS COMPLETELY UNACCEPTABLE BEHAVIOUR' }).reasons
    .some(r => r.code === 'SHOUTING'));
  assert.equal(screenComment({ body: 'WOW!' }).state, 'VISIBLE', 'too short to judge as shouting');
});

test('a burst of comments in one minute is held', () => {
  const now = Date.now();
  const recent = Array.from({ length: 6 }, (_, i) => ({ body: `different ${i}`, created_at: new Date(now - 1000).toISOString() }));
  const result = screenComment({ body: 'one more thought', recent, now });
  assert.ok(result.reasons.some(r => r.code === 'RATE'));
});

test('screening judges structure, never opinion', () => {
  const blunt = screenComment({ body: 'I think this analysis is wrong and the conclusion does not follow.' });
  assert.equal(blunt.state, 'VISIBLE');
});

test('comment states move only along allowed paths, and REMOVED is terminal', () => {
  assert.equal(canTransitionComment('VISIBLE', 'HELD'), true);
  assert.equal(canTransitionComment('HELD', 'VISIBLE'), true);
  assert.equal(canTransitionComment('HIDDEN', 'HELD'), false);
  assert.equal(canTransitionComment('REMOVED', 'VISIBLE'), false);
  for (const state of COMMENT_STATES) assert.equal(canTransitionComment(state, state), false);
});

test('a rate limit opens again after its window', () => {
  const now = Date.now();
  const blocked = rateCheck({ hits: 20, windowStart: now - 1000, now, limit: 20 });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retry_after_ms > 0);
  const reopened = rateCheck({ hits: 20, windowStart: now - 61_000, now, limit: 20 });
  assert.equal(reopened.allowed, true);
  assert.equal(reopened.hits, 1);
});

test('an author always sees their own held comment; a stranger does not', () => {
  const comment = { moderation_state: 'HELD', author_user_id: 'u-author' };
  const author = visibleToViewer(comment, { user_id: 'u-author' });
  assert.equal(author.visible, true);
  assert.match(author.notice, /Only you can see this/);

  const stranger = visibleToViewer(comment, { user_id: 'u-other' });
  assert.equal(stranger.visible, false);

  const staff = visibleToViewer(comment, { user_id: 'u-other', is_channel_staff: true });
  assert.equal(staff.visible, true);
});

test('a removed comment is not shown back to its author as if it were live', () => {
  const comment = { moderation_state: 'REMOVED', author_user_id: 'u-author' };
  const author = visibleToViewer(comment, { user_id: 'u-author' });
  assert.equal(author.visible, false);
  assert.match(author.notice, /removed/i);
});

test('only known reactions are accepted', () => {
  assert.equal(validateReaction('LEARNED').valid, true);
  assert.equal(validateReaction('DISLIKE').valid, false);
});

test('a report names a target and a reason, and "other" needs a statement', () => {
  assert.equal(buildReport({ targetKind: 'ASSET', targetRef: 'a1', reasonCode: 'SPAM' }).valid, true);
  assert.equal(buildReport({ targetKind: 'ASSET', targetRef: 'a1', reasonCode: 'NONSENSE' }).valid, false);
  assert.equal(buildReport({ targetKind: 'ASSET', targetRef: 'a1', reasonCode: 'OTHER', statement: 'short' }).valid, false);
  assert.equal(buildReport({ targetKind: 'ASSET', targetRef: 'a1', reasonCode: 'OTHER',
    statement: 'This misrepresents a real family.' }).valid, true);
});

test('a rights claim escalates to takedown, not the general queue', () => {
  assert.equal(routeReport({ reason_code: 'RIGHTS_CLAIM' }).queue, 'RIGHTS_TAKEDOWN');
  assert.equal(routeReport({ reason_code: 'RIGHTS_CLAIM' }).requires_claimant_identity, true);
  assert.equal(routeReport({ reason_code: 'SAFETY' }).queue, 'SAFETY_REVIEW');
  assert.equal(routeReport({ reason_code: 'SPAM' }).queue, 'GENERAL_MODERATION');
});
