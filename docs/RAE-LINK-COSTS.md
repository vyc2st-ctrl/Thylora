# RAE Link — cost model

Workroom: **WR-RAELINK-001**

> **These are modelled estimates, not quotes.** No vendor was contacted, no
> account was opened and no pricing page was read during this build — outbound
> access to third-party hosts was denied by the session's network policy. Every
> figure below is a planning band derived from publicly typical ranges and must
> be replaced with a real quote before any commitment. Treat the *shape* of the
> model as the deliverable and the numbers as placeholders to overwrite.

## What actually drives the bill

RAE Link's cost is dominated by three things, in this order:

1. **Egress / delivery** — bytes sent to viewers. Scales with watch hours.
2. **Transcoding** — one-time per minute of source media, permanent per re-encode.
3. **Storage** — originals plus renditions, accumulating forever unless archived.

Everything else (database, auth, search, hosting, email) is near-flat at the
scale RAE Link will occupy for its first year.

## Unit model

Assumptions, all adjustable:

| Assumption | Value |
|---|---|
| Average delivered bitrate | 2.5 Mbit/s (1080p, modern codec) |
| Bytes per watch hour | ~1.1 GB |
| Renditions per video | 4 (1080/720/480/audio) + poster |
| Stored bytes per source minute | ~120 MB (original + renditions) |

**Cost per 1,000 watch hours** at three planning bands for egress:

| Egress band | Rate | Per 1,000 watch hours |
|---|---:|---:|
| Low (bundled / flat-rate CDN) | ~$0.005/GB | ~$6 |
| Middle (commodity CDN) | ~$0.02/GB | ~$22 |
| High (hyperscaler list egress) | ~$0.085/GB | ~$94 |

The spread is roughly **15×**. Choosing `streaming_cdn` is therefore the single
highest-leverage provider decision in the map, which is why it is flagged OPEN
rather than defaulted.

## Monthly scenarios

| | Starting (500 h/mo, 20 h uploaded) | Building (10,000 h/mo, 100 h uploaded) | Working (150,000 h/mo, 400 h uploaded) |
|---|---:|---:|---:|
| Delivery (middle band) | ~$11 | ~$220 | ~$3,300 |
| Transcode | ~$12 | ~$60 | ~$240 |
| Storage (cumulative, yr 1 avg) | ~$2 | ~$25 | ~$140 |
| Database + auth | ~$25 | ~$25 | ~$100 |
| Hosting + CDN for the surface | $0–20 | $0–20 | ~$20 |
| Moderation + scanning | ~$5 | ~$40 | ~$400 |
| Captions | ~$5 | ~$25 | ~$100 |
| Observability + backups | ~$0 | ~$20 | ~$60 |
| **Modelled monthly total** | **~$60–80** | **~$435–500** | **~$4,300–4,600** |

## What this means for the split

At the "Working" band, ~$4,400/month of infrastructure against the default 45%
platform share on pooled lanes means pooled revenue of roughly **$10,000/month**
covers infrastructure alone — before payment processing, moderation labour,
support or any creator payout. Direct lanes (creator subscription at 15%, tips at
10%, paid media at 20%) are deliberately thinner because they carry far less
delivery cost per dollar: a $10 tip moves no bytes.

This is the honest read: **RAE Link does not pay for itself on advertising at
small scale.** The lanes that work early are creator subscription, paid media,
EDF sales and commissioned production. Advertising becomes sensible only when
watch hours are large enough for a pooled allocation to be meaningful to a
creator — below that, the allocation rounds to cents and costs more in trust than
it returns in money.

## Costs that are not infrastructure

Modelled at zero above, real in practice, and Chairman-held:

- Human moderation and appeals review
- Rights and takedown handling
- Creator support
- Payout provider identity verification and per-payout fees
- Legal review before public launch
- Apple and Google developer accounts for the mobile surfaces

## Before any spend

1. Get real quotes for `streaming_cdn`, `video_transcode` and `object_storage`.
2. Re-run this model with the quoted rates.
3. Set a monthly infrastructure ceiling and an alert at 70% of it.
4. Only then open the accounts.
