// RAE LINK · creator payout plan RAE-PAY-1 (PROPOSED — Chairman chooses)
// Workroom: WR-RAELINK-001 · backend record THY-RAELINK-PAYOUT-PLAN-656
//
// Rule from the Chairman: creator pay must beat Earth's. Each lane below is
// compared against the best widely published Earth creator share for the same
// kind of income. Earth figures are reference points (grade INDICATED, public
// terms as last known) — re-read the platforms' own terms before quoting them.
//
// Inside Our World, RAE Link is licensed; these splits apply as written.

import { BP, validateSplitPolicy } from './ledger.js';

// Best Earth creator share per lane, in basis points, and who pays it.
export const EARTH_REFERENCE = Object.freeze({
  ADVERTISING:           { creator_bp: 5500, who: 'YouTube long-form ad revenue (55%)' },
  PLATFORM_SUBSCRIPTION: { creator_bp: 5500, who: 'YouTube Premium pool (55%)' },
  CREATOR_SUBSCRIPTION:  { creator_bp: 9000, who: 'Patreon / Substack (about 90% before card fees)' },
  TIP:                   { creator_bp: 10000, who: 'Ko-fi donations (0% platform fee; creator still pays the card fee)' },
  ONE_TIME_MEDIA:        { creator_bp: 8500, who: 'App-store small-business rate (85%)' },
  EDF_PRODUCT:           { creator_bp: 8000, who: 'Marketplace sellers (about 80% after fees)' },
  LICENSING:             { creator_bp: 7000, who: 'Stock/licensing marketplaces (best tiers ~60–70%)' },
  COMMISSION:            { creator_bp: 8000, who: 'Freelance marketplaces (80% after 20% fee)' },
  AFFILIATE:             { creator_bp: 5000, who: 'Typical affiliate/referral split (50%)' }
});

// RAE-PAY-1: platform share per lane. Creator takes the rest.
const PLAN = {
  ADVERTISING:           2500,  // creator 75%
  PLATFORM_SUBSCRIPTION: 2500,  // creator 75%
  CREATOR_SUBSCRIPTION:   500,  // creator 95%
  TIP:                      0,  // creator 100% — tips are the creator's
  ONE_TIME_MEDIA:         800,  // creator 92%
  EDF_PRODUCT:           1200,  // creator 88%
  LICENSING:             1500,  // creator 85%
  COMMISSION:            1000,  // creator 90%
  AFFILIATE:             2000   // referrer 80%
};

export const RAE_PAY_1 = Object.freeze(Object.fromEntries(Object.entries(PLAN).map(([lane, platform]) => {
  const policy = { policy_code: `RAE-PAY-1-${lane}`, lane_code: lane, platform_share_bp: platform,
    creator_share_bp: lane === 'AFFILIATE' ? 0 : BP - platform, referrer_share_bp: lane === 'AFFILIATE' ? BP - platform : 0,
    beneficiary_share_bp: 0, partner_share_bp: 0 };
  return [lane, Object.freeze(policy)];
})));

// The people's share (creator, or referrer on the affiliate lane).
export function peopleShare(policy) {
  return BP - policy.platform_share_bp;
}

export function compareToEarth(plan = RAE_PAY_1) {
  return Object.entries(plan).map(([lane, policy]) => {
    const earth = EARTH_REFERENCE[lane];
    const ours = peopleShare(policy);
    return { lane, ours_bp: ours, earth_bp: earth.creator_bp, earth_who: earth.who, better_by_bp: ours - earth.creator_bp,
      valid: validateSplitPolicy(policy).valid };
  });
}

// Terms that come with the split — also better than Earth.
export const PAY_TERMS = Object.freeze({
  eligibility: 'Paid from the first view and the first sale. No subscriber or watch-hour threshold.',
  schedule: 'Weekly settlement. Earth platforms commonly pay monthly.',
  minimum: 'No minimum balance inside Our World. Earth crossings follow the payout rail’s own minimum only.',
  rounding: 'Every leftover minor unit goes to the people before the house (ledger REMAINDER_PRIORITY).',
  tips: 'Tips: creator keeps 100% AND RAE Link pays the card fee from its own share — the creator receives the full tip.',
  founding: 'Founding creators: platform share halved for their first 12 months.',
  audience: 'Creators can export their own followers and supporters at any time.',
  visibility: 'Every statement shows gross, fees, each share and every hold — no hidden percentage.'
});

// Founding creators keep half of the platform's share for their first 12 months.
export function foundingPolicy(policy, monthsSinceJoin) {
  if (monthsSinceJoin >= 12) return policy;
  const cut = Math.floor(policy.platform_share_bp / 2);
  const toPeople = policy.platform_share_bp - cut;
  return Object.freeze({ ...policy, policy_code: `${policy.policy_code}-FOUNDING`, platform_share_bp: cut,
    creator_share_bp: policy.creator_share_bp ? policy.creator_share_bp + toPeople : 0,
    referrer_share_bp: policy.referrer_share_bp ? policy.referrer_share_bp + toPeople : 0 });
}

// THE WINDOW countdown bonus: a pool split across the day's Top 10 by rank
// weight (#1 gets 10 parts … #10 gets 1 part). Exact to the minor unit; the
// remainder goes to the highest ranks first.
export function windowBonus(poolMinor, rankedChannelIds) {
  if (!Number.isInteger(poolMinor) || poolMinor < 0) throw new RangeError('pool must be a non-negative integer of minor units');
  const top = rankedChannelIds.slice(0, 10);
  const weights = top.map((_, i) => top.length - i);
  const total = weights.reduce((a, b) => a + b, 0);
  if (!total) return [];
  const rows = top.map((id, i) => ({ channel_id: id, rank: i + 1, amount_minor: Math.floor((poolMinor * weights[i]) / total) }));
  let left = poolMinor - rows.reduce((a, r) => a + r.amount_minor, 0);
  for (let i = 0; left > 0; i = (i + 1) % rows.length, left--) rows[i].amount_minor += 1;
  return rows;
}
