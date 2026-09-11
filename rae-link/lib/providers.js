// RAE LINK · provider abstraction
// Workroom: WR-RAELINK-001
//
// THYLORA is not bound permanently to one infrastructure vendor. Every capability
// is addressed through a capability name, never a vendor name, and each capability
// records at least one alternate so an exit is a configuration change rather than
// a rebuild. `binding` states how deeply a choice is currently wired:
//   ACTIVE   — in use now
//   PLANNED  — chosen, not yet wired
//   OPEN     — no choice made; the capability is still a decision, not a default
//
// Nothing here opens an account, spends money or stores a credential. Provider
// credentials are Chairman-supplied and live in backend secrets only.

export const CAPABILITIES = Object.freeze({
  identity_auth:      { group: 'Identity',   active: 'supabase-auth',  binding: 'ACTIVE',
                        alternates: ['workos', 'clerk', 'self-hosted-oidc'],
                        exit_cost: 'LOW — user table export plus password reset cycle.' },
  database:           { group: 'Data',       active: 'supabase-postgres', binding: 'ACTIVE',
                        alternates: ['neon', 'rds-postgres', 'self-hosted-postgres'],
                        exit_cost: 'LOW — schema is plain Postgres with no vendor-only types.' },
  object_storage:     { group: 'Media',      active: null, binding: 'OPEN',
                        alternates: ['supabase-storage', 's3', 'r2', 'gcs', 'b2'],
                        exit_cost: 'MEDIUM — bytes must be copied; keys are stored provider-relative.' },
  resumable_upload:   { group: 'Media',      active: null, binding: 'OPEN',
                        alternates: ['tus', 's3-multipart', 'uppy-companion'],
                        exit_cost: 'LOW — chunk map is held in rael_upload_sessions, not at the vendor.' },
  video_transcode:    { group: 'Media',      active: null, binding: 'OPEN',
                        alternates: ['mux', 'cloudflare-stream', 'ffmpeg-worker', 'mediaconvert'],
                        exit_cost: 'MEDIUM — re-encode from mezzanine; originals are always retained.' },
  audio_processing:   { group: 'Media',      active: null, binding: 'OPEN',
                        alternates: ['ffmpeg-worker', 'dolby-io', 'auphonic'],
                        exit_cost: 'LOW' },
  image_processing:   { group: 'Media',      active: null, binding: 'OPEN',
                        alternates: ['imgproxy', 'cloudinary', 'sharp-worker'],
                        exit_cost: 'LOW — derivatives are regenerable from the original.' },
  streaming_cdn:      { group: 'Delivery',   active: null, binding: 'OPEN',
                        alternates: ['cloudflare', 'fastly', 'bunny', 'cloudfront'],
                        exit_cost: 'LOW — DNS and signed-URL issuer change.' },
  captions:           { group: 'Access',     active: null, binding: 'OPEN',
                        alternates: ['whisper-worker', 'deepgram', 'human-vendor'],
                        exit_cost: 'LOW — caption files are stored as WebVTT.' },
  moderation:         { group: 'Safety',     active: null, binding: 'OPEN',
                        alternates: ['hive', 'aws-rekognition', 'in-house-review'],
                        exit_cost: 'LOW — verdicts are stored with policy version, not vendor score alone.' },
  virus_scan:         { group: 'Safety',     active: null, binding: 'OPEN',
                        alternates: ['clamav-worker', 'vendor-scan-api'],
                        exit_cost: 'LOW' },
  search:             { group: 'Discovery',  active: 'postgres-fts', binding: 'ACTIVE',
                        alternates: ['typesense', 'meilisearch', 'opensearch'],
                        exit_cost: 'LOW — index rebuilds from rael_media_assets.' },
  recommendation:     { group: 'Discovery',  active: 'in-house-heuristic', binding: 'PLANNED',
                        alternates: ['in-house-model', 'vendor-ranking'],
                        exit_cost: 'LOW — ranking inputs are our own analytics rollups.' },
  payments_digital:   { group: 'Money',      active: 'lemonsqueezy', binding: 'PLANNED',
                        alternates: ['stripe', 'paddle'],
                        exit_cost: 'MEDIUM — subscriber migration is processor-dependent.' },
  payments_physical:  { group: 'Money',      active: 'shopify', binding: 'PLANNED',
                        alternates: ['stripe', 'woocommerce'],
                        exit_cost: 'MEDIUM' },
  creator_payouts:    { group: 'Money',      active: null, binding: 'OPEN',
                        alternates: ['stripe-connect', 'wise', 'tipalti', 'manual-with-evidence'],
                        exit_cost: 'HIGH — payout identity and tax records re-verify at the new provider.' },
  tax_calculation:    { group: 'Money',      active: null, binding: 'OPEN',
                        alternates: ['processor-managed', 'avalara', 'in-house-table'],
                        exit_cost: 'MEDIUM' },
  email_notification: { group: 'Comms',      active: null, binding: 'OPEN',
                        alternates: ['resend', 'postmark', 'ses'],
                        exit_cost: 'LOW' },
  push_notification:  { group: 'Comms',      active: 'web-push', binding: 'PLANNED',
                        alternates: ['apns-fcm-direct', 'onesignal'],
                        exit_cost: 'LOW' },
  analytics:          { group: 'Evidence',   active: 'in-house-postgres', binding: 'ACTIVE',
                        alternates: ['posthog', 'plausible'],
                        exit_cost: 'LOW — rollups are our own tables.' },
  observability:      { group: 'Evidence',   active: null, binding: 'OPEN',
                        alternates: ['sentry', 'betterstack', 'grafana-cloud'],
                        exit_cost: 'LOW' },
  hosting_web:        { group: 'Runtime',    active: 'vercel', binding: 'ACTIVE',
                        alternates: ['cloudflare-pages', 'netlify', 'static-s3'],
                        exit_cost: 'LOW — the surface is static files and a rewrite map.' },
  mobile_ios:         { group: 'Runtime',    active: null, binding: 'OPEN',
                        alternates: ['pwa-installed', 'capacitor', 'native-swift'],
                        exit_cost: 'MEDIUM — store acceptance is device-only and Chairman-held.' },
  mobile_android:     { group: 'Runtime',    active: null, binding: 'OPEN',
                        alternates: ['pwa-installed', 'capacitor', 'native-kotlin'],
                        exit_cost: 'MEDIUM' },
  backups:            { group: 'Continuity', active: null, binding: 'OPEN',
                        alternates: ['provider-pitr', 'scheduled-dump-to-cold-storage'],
                        exit_cost: 'LOW' }
});

/**
 * Resolve a capability to the adapter currently in force. Returns a decision
 * record rather than throwing, so an unwired capability is a visible gap in the
 * UI instead of a silent failure at runtime.
 */
export function resolve(capability, overrides = {}) {
  const spec = CAPABILITIES[capability];
  if (!spec) return { capability, status: 'UNKNOWN_CAPABILITY', provider: null };
  const provider = overrides[capability] ?? spec.active;
  if (!provider) {
    return {
      capability, status: 'UNRESOLVED', provider: null,
      group: spec.group, alternates: spec.alternates,
      detail: `No provider is chosen for ${capability}. This is an open decision, not a default.`
    };
  }
  return {
    capability, status: spec.binding, provider,
    group: spec.group, alternates: spec.alternates, exit_cost: spec.exit_cost
  };
}

export function openDecisions() {
  return Object.entries(CAPABILITIES)
    .filter(([, spec]) => spec.binding === 'OPEN')
    .map(([capability, spec]) => ({ capability, group: spec.group, alternates: spec.alternates }));
}

export function lockInRisk() {
  const all = Object.values(CAPABILITIES);
  const high = all.filter(s => s.exit_cost?.startsWith('HIGH')).length;
  const single = all.filter(s => (s.alternates ?? []).length < 2).length;
  return {
    capabilities: all.length,
    open_decisions: all.filter(s => s.binding === 'OPEN').length,
    high_exit_cost: high,
    without_two_alternates: single
  };
}
