# RAE Link — provider map

Workroom: **WR-RAELINK-001** · Source of truth: `rae-link/lib/providers.js`

THYLORA is not bound permanently to one infrastructure vendor. Every capability
is addressed by **capability name**, never vendor name. Each capability names at
least two alternates (asserted in the test suite) and an exit cost. A capability
with no chosen provider shows as an **open decision**, never as a silent default.

Nothing in this map opens an account, spends money or stores a credential.
Provider credentials are Chairman-supplied and live in backend secrets only.

| Capability | Group | Current | Binding | Alternates | Exit cost |
|---|---|---|---|---|---|
| identity_auth | Identity | supabase-auth | ACTIVE | workos, clerk, self-hosted-oidc | LOW |
| database | Data | supabase-postgres | ACTIVE | neon, rds-postgres, self-hosted | LOW |
| object_storage | Media | — | **OPEN** | supabase-storage, s3, r2, gcs, b2 | MEDIUM |
| resumable_upload | Media | — | **OPEN** | tus, s3-multipart, uppy-companion | LOW |
| video_transcode | Media | — | **OPEN** | mux, cloudflare-stream, ffmpeg-worker, mediaconvert | MEDIUM |
| audio_processing | Media | — | **OPEN** | ffmpeg-worker, dolby-io, auphonic | LOW |
| image_processing | Media | — | **OPEN** | imgproxy, cloudinary, sharp-worker | LOW |
| streaming_cdn | Delivery | — | **OPEN** | cloudflare, fastly, bunny, cloudfront | LOW |
| captions | Access | — | **OPEN** | whisper-worker, deepgram, human-vendor | LOW |
| moderation | Safety | — | **OPEN** | hive, aws-rekognition, in-house-review | LOW |
| virus_scan | Safety | — | **OPEN** | clamav-worker, vendor-scan-api | LOW |
| search | Discovery | postgres-fts | ACTIVE | typesense, meilisearch, opensearch | LOW |
| recommendation | Discovery | in-house-heuristic | PLANNED | in-house-model, vendor-ranking | LOW |
| payments_digital | Money | lemonsqueezy | PLANNED | stripe, paddle | MEDIUM |
| payments_physical | Money | shopify | PLANNED | stripe, woocommerce | MEDIUM |
| creator_payouts | Money | — | **OPEN** | stripe-connect, wise, tipalti, manual-with-evidence | **HIGH** |
| tax_calculation | Money | — | **OPEN** | processor-managed, avalara, in-house-table | MEDIUM |
| email_notification | Comms | — | **OPEN** | resend, postmark, ses | LOW |
| push_notification | Comms | web-push | PLANNED | apns-fcm-direct, onesignal | LOW |
| analytics | Evidence | in-house-postgres | ACTIVE | posthog, plausible | LOW |
| observability | Evidence | — | **OPEN** | sentry, betterstack, grafana-cloud | LOW |
| hosting_web | Runtime | vercel | ACTIVE | cloudflare-pages, netlify, static-s3 | LOW |
| mobile_ios | Runtime | — | **OPEN** | pwa-installed, capacitor, native-swift | MEDIUM |
| mobile_android | Runtime | — | **OPEN** | pwa-installed, capacitor, native-kotlin | MEDIUM |
| backups | Continuity | — | **OPEN** | provider-pitr, scheduled-dump-to-cold-storage | LOW |

**25 capabilities mapped · 16 open decisions · 1 high exit cost · 0 without two alternates.**

## Why these stay open

An open decision is not an oversight. Each of these commits money, a credential
or an account that only the Chairman can open — so choosing one here would be
inventing an authority this build does not have. The schema is written so that
choosing any of the alternates later is a configuration change:

- **Storage keys are provider-relative.** `rael_media_assets.storage_provider`
  and `storage_key` are separate columns, so a migration copies bytes and
  rewrites one column.
- **The resumable chunk map lives in our database** (`rael_upload_sessions`),
  not at the vendor, so an upload survives a provider change.
- **Originals are always retained**, so any transcoder can re-encode.
- **Moderation verdicts store the policy version**, not just a vendor score.
- **Captions are stored as WebVTT**, which every player reads.
- **Payout identity is the one high-cost exit** — a new payout provider re-verifies
  every creator. That is inherent to payout regulation, not a design flaw; it is
  flagged so the first choice is made deliberately rather than by momentum.
