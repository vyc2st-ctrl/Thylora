// RAE LINK · deployment configuration
// Workroom: WR-RAELINK-001
//
// The one place a deployment is wired. Everything here is null until a provider
// decision is actually made and a real endpoint exists. No key, token or secret
// belongs in this file or anywhere else in the client — RAE Link signs uploads
// with the member's own THYLORA session, never with a shared credential.

export const DEPLOYMENT = Object.freeze({
  // A TUS 1.0.0 endpoint, once `resumable_upload` and `object_storage` are
  // decided. While this is null the Creator Studio still validates files,
  // captures posters, saves metadata and runs the rights gate — it simply says
  // plainly that the bytes are not going anywhere yet.
  upload_endpoint: null,

  // Bucket / prefix the upload lands in, once storage is chosen.
  storage_bucket: null,

  // Per-capability provider overrides, e.g. { video_transcode: 'mux' }.
  provider_overrides: {},

  // Upload tuning. 8 MiB balances retry cost against request overhead.
  chunk_size_bytes: 8 * 1024 * 1024,
  max_upload_attempts: 5,
  upload_backoff_ms: 500
});

export function uploadConfigured() {
  return Boolean(DEPLOYMENT.upload_endpoint);
}
