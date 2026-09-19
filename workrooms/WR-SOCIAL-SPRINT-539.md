# WR-SOCIAL-SPRINT-539 — Afternoon social execution sprint

**Sequence:** 539
**Date:** 2026-09-19
**Backend:** thylora-dash (`jvsdxhrfhtlgaknhjxlz`), ACTIVE_HEALTHY, Postgres 17.6
**QYRIS layer:** THY-QYRIS-PLAIN-SPEECH-001 (ACTIVE, v1)
**Publications made by this pass:** 0. **Schedules made by this pass:** 0. **Images or video generated:** 0.

This file is a witness record only. Deployment authority for the Chairman dashboard
remains `vyc2st-ctrl/thylora-executive-dashboard` per `DASHBOARD_AUTHORITY.md`; nothing
here changes that.

## Session limits, stated before the findings

Outbound HTTPS is refused by the network egress proxy in this session. `facebook.com`
and `ersatzreality.myshopify.com` both returned EGRESS_BLOCKED. There is no Metricool
tool. Supermetrics Facebook Insights (`ds_id=FB`) has no connected Facebook account.

Everything below is either read from the backend, read through the Shopify Admin
provider, or explicitly marked unwitnessed. Nothing was inferred into a fact.

## 1. Facebook identity — PARTIAL

| Item | State |
|---|---|
| Exact Page name | UNKNOWN — not witnessed |
| Page ID | Metricool reports object `1218971981309965`; `page_id` in the backend is still NULL |
| Public Page URL | UNKNOWN — not witnessed |
| Admin access | NOT_WITNESSED |
| Posting access | NOT_WITNESSED |
| Instagram linkage | NOT_WITNESSED |
| Metricool linkage | Object present in brand `6877123`; Page identity unproven |

**New finding.** Two Facebook objects are in play. Metricool reports `1218971981309965`
for the Enterprise row, but the post THYLORA published on 2026-09-17
(`THY-LOGIC-POST-20260916-A`) is owned by `122095730127479264`. Nobody has said whether
these are one Page or two. Until someone does, the Enterprise destination is not proven
and the published post cannot be assumed to live on it.

No duplicate Page was created.

**To reach VERIFIED**, six items read back off the Page itself: exact name, URL from the
address bar, admin access, posting access, whether Instagram `ersatz.reality` is linked,
and whether the two object ids are the same Page.

Recorded in `social_channel_registry.metadata.identity_witness_539`.

## 2. Facebook look refresh — PREPARED, NOT APPLIED

Packet `THY-FB-LOOK-539`, in `social_channel_registry.metadata.page_makeover_preview_539`.
Nothing was applied to the Page. All six components are held behind the identity answer —
applying any of them now risks dressing the wrong Page.

- **Profile image — BLOCKED.** The only Chairman-approved mark, `BRAND-ER-MARK-GLASS-HAT`
  (magnifying glass and hat), is approved as *direction* with no registered image file.
  `BRAND-THYLORA-MARK` is NOT_APPROVED. Two ways forward: the Chairman supplies the
  existing mark file, or he authorizes one render of the approved direction. No generic
  AI company graphic was proposed.
- **Cover image — READY.** Recommended `THY-VIS-TWELVE-MILES-WESTERN-ILLUSTRATION-V3`
  (approved, rights cleared): a painterly trail scene rather than a book cover, so it
  survives the wide crop and reads as the world. Alternate: the Gap Hunt cover. Open
  fact — pixel dimensions are not recorded and the CDN is unreachable here, so the crop
  was reasoned, not measured.
- **Bio / About — WRITTEN.** Two short paragraphs, canonical `EdereAirah` and
  `ErsatzReality Enterprise`, under the `BRAND-EDITORIAL-TONE` lock. No wall of text.
- **Button / CTA — READY.** *Shop now* to the one product a reader can actually buy.
  Not *Send message*: `SOC-STRAT-FB-001` sets PAGE_MESSAGING_OFF.
- **Pinned post — CONDITIONAL.** If the Enterprise Page is the same object that owns the
  2026-09-17 post, pin that post. If it is a different Page, nothing is pinnable yet.
  The rejected 2026-09-16 carousel is never reused.
- **Store link placement — READY.** One destination in three slots: About website field,
  action button, first line of the pinned post.

## 3. TikTok — preflight passed, then overtaken

`THY-SOC-TMF-TIKTOK-20260919-01`, account `victor.peete`. Five checks at 17:52Z:

| Check | Result |
|---|---|
| Media | PASS_WITH_FINDING — asset `THY-VIS-TWELVE-MILES-TMF-0004-V5` confirmed identical to the live storefront featured media; pixel dimensions unrecorded, so 9:16 fit is reasoned not measured |
| Rights | PASS — cleared, documented, existing approved asset, no generation |
| Duplicate | PASS_WITH_FINDING — none on this channel ever; fourth Twelve Miles push in four days across the estate |
| Product URL | PASS — live Shopify Admin read: ACTIVE, $1.99, `availableForSale` true. Handle reads `uncle-seezin` while canon is `Unkle Seezin` (pre-existing) |
| Caption | PASS_WITH_FINDING — a TikTok photo-post caption link is not clickable; the route has to be the bio link |

Marked `READY_FOR_CHAIRMAN_RELEASE` at 17:52Z. **On readback at 18:00Z the row had
moved:** a concurrent session carrying a Metricool tool recorded Chairman approval at
17:53:23Z and scheduled Metricool post `378653799` for 17:55Z. That state was left
standing, not overwritten. The caption finding now matters more, not less — if the
TikTok bio link is not already the Twelve Miles product, the post lands with no tappable
route to the store.

## 4. YouTube — NO_READY_VIDEO_ASSET

Channel `UCkIWnpuRly29yyRq43dX3LA`. Twenty video assets examined across
`thylora_visual_assets`, `media_assets` and `thylora_delivery_assets`. None is
release-cleared: every `media_assets` video is `rights_state=unverified` and marked
ARCHIVE_TEMPLATE_ONLY or VISUAL_REFERENCE; the two approved-looking video rows are a
restricted Chairman style reference and an unapproved product-claim reference.

**One source named for after authorization:** `EARLYVID-018`, the original ErsatzReality
Studios intro, 108.3s, first-party, sha256 `48f6d880…`. Chosen because it is our own
material about the house rather than a product, and a Short cuts out of it without
generating a frame. It needs the cut authorized, its origin stated to close rights, a
9:16 reframe, and a visual serial.

`EARLYVID-006` (27.8s) and `EARLYVID-010` (30.8s) are already Short-length and were
refused: neither carries a subject label. Short length is not a reason to publish
something nobody has described.

## 5. Store-to-social pipeline

**Zero products activated today**, verified against live Shopify: exactly one ACTIVE
product store-wide (Twelve Miles, unchanged since 2026-09-17) and zero products with
`updated_at >= 2026-09-19`.

Standing rule `THY-STORE-TO-SOCIAL-539` recorded, and four rows armed in advance for
Bramble Wick, the product closest to activation:

| Row | State |
|---|---|
| `THY-SOC-BRAMBLE-IG-20260919-ARM` | ARMED_AWAITING_PRODUCT_ACTIVATION |
| `THY-SOC-BRAMBLE-FBENT-20260919-ARM` | ARMED_BLOCKED_ON_PAGE_IDENTITY |
| `THY-SOC-BRAMBLE-TIKTOK-20260919-ARM` | ARMED_AWAITING_PRODUCT_ACTIVATION |
| `THY-SOC-BRAMBLE-YTSHORT-20260919-ARM` | NOT_ARMED_NO_VIDEO_ASSET |

The Bramble destination URL is **predicted** from the product handle — the product is
DRAFT and has no live URL yet — and is flagged for re-verification at activation.

## 6. Publication witness across the estate

Four Metricool posts sit PENDING with `published_at` NULL and no witness:

- `378377543` — Global Question ES, scheduled 2026-09-18
- `378377556` — Global Question ZH, scheduled 2026-09-18
- `378638472` — Twelve Miles Facebook/Instagram, scheduled today 17:05Z
- `378653799` — Twelve Miles TikTok, scheduled today 17:55Z

The last publication THYLORA can prove is 2026-09-17. Four schedules recorded since,
zero publications witnessed. No Metricool tool exists in this session to close the gap.

## 7. Not touched

Dashboard release repair and store closeout were left running. The
`thylora-release-decision` edge function was redeployed to version 3 at 17:44Z by that
thread. Four Chairman preview packets remain EXPOSED_AWAITING_CHAIRMAN: PKT-HANDOFF-001
($7), PKT-CITYPOWER-001 ($5), PKT-LASTMATCH-001 ($3), PKT-BRAMBLE-001 ($1.99). No
dashboard row, release gate or preview packet was modified by this pass.

## QYRIS

Six checks written to `thylora_qyris_work_item_checks` under `SEQ-539`: five PASS, one
UNKNOWN. The UNKNOWN is the Facebook identity — recorded as unknown rather than assumed.

Work codes: `THY-WORK-SOCIAL-SPRINT-539-SPINE`, `THY-WORK-FB-IDENTITY-WITNESS-539`,
`THY-WORK-FB-LOOK-REFRESH-539`, `THY-WORK-TIKTOK-PREFLIGHT-539`,
`THY-WORK-YOUTUBE-SHORT-539`, `THY-WORK-STORE-TO-SOCIAL-539`.

## Readback verification

| Check | Result |
|---|---|
| Sequence 539 payload written | true |
| QYRIS checks under SEQ-539 | 6 |
| Work registry rows for 539 | 6 |
| Facebook identity classification | PARTIAL |
| Facebook makeover packet state | PREPARED_NOT_APPLIED |
| YouTube verdict | NO_READY_VIDEO_ASSET |
| TikTok preflight recorded | true |
| Bramble armed rows | 4 |
| Posts published or scheduled *by this pass* | 0 |

## Restart point

Sequence 540, in order: witness the Facebook Page identity six-item readback and lift
`SOC-FB-ENTERPRISE-001` off PARTIAL; witness whether the four PENDING Metricool posts
actually published; apply packet `THY-FB-LOOK-539` once identity is VERIFIED.
