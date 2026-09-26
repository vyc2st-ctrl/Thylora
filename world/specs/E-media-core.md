# E · THYLORA Media Core: architecture

Record `THY-MEDIA-CORE-001` (registry `IN PRODUCTION` v1). **No deployed runtime has been witnessed. Nothing here is live.**

Relation to existing work: `db/rae-link/0002…0006` (RAE Link, not applied) already drafts the pipeline, rights, entitlement and ledger tables for creator media. Media Core is the **shared substrate** under RAE Link, Origins Lab and the dashboard. It reuses those designs and doesn't fork a second media schema.

```
master ingest ─► hash/provenance ─► object storage ─► transcoding ladder ─► stream manifests
     │                                                                            │
     ▼                                                                            ▼
captions/transcripts ─► rights gate ─► entitlement ─► signed playback ─► player ─► analytics
                                                                                  │
                                            contribution/payout ledger ◄──────────┘
                                                        │
                                              takedown / versioning
```

| Stage | Contract | Proof it happened (the witness) |
|---|---|---|
| Master ingest | resumable upload, original bytes kept immutable, never re-encoded in place | upload session id + byte count |
| Hash / provenance | sha-256 of master computed server-side; supplier, channel, date, claimed authorship, chain of custody | hash row; mismatch = reject |
| Object storage | private bucket, content-addressed path `masters/<sha256>` | storage object exists at hash path |
| Transcoding ladder | e.g. 1080p/720p/480p/360p H.264 + AAC, plus an audio-only rung; each rendition hashed | rendition rows with hashes |
| Stream manifests | HLS (and DASH where needed), segment durations recorded | manifest file + segment count |
| Captions / transcripts | machine draft → human review; state NOT_TRANSCRIBED / MACHINE_DRAFT / HUMAN_REVIEWED; no content claims before HUMAN_REVIEWED | transcript version row |
| Rights gate | owner, consent for every identifiable person, music/third-party clearance, release state; default BLOCKED | rights decision row, reviewer |
| Entitlement | plan / purchase / free / internal; resolved per viewer | entitlement row |
| Signed playback access | short-lived signed URL or token scoped to rendition + viewer; never public bucket URLs | token issue log |
| Player | HLS player with captions, chapters, provenance panel (hash, source, version) | client event |
| Analytics | play, progress quartiles, completion; aggregated, privacy-minimised | rollup rows |
| Contribution / payout ledger | integer minor units; gross, fees, refunds, shares, net and evidence as separate columns (RAE Link `0005`) | ledger + payout evidence |
| Takedown / versioning | a new version supersedes, the old one is retained with its reason; a takedown revokes tokens immediately | version row + revocation log |

**Provider choice is OPEN.** Supabase Storage covers masters and small files. A managed video service (transcode + HLS + signed playback) would replace the ladder, manifest and signed-URL stages. Compare cost per stored and streamed hour before choosing; `docs/RAE-LINK-COSTS.md` has the starting comparison.

**Minimum witness for "Media Core live":** one master ingested → hash stored → one HLS rendition plays through a signed URL on the authoritative deployment, with a captions file and a provenance panel showing the same hash.
