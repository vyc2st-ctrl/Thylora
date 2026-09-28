# WR-PROD-FLOOR-001 · LANE H · THYLORA Network / Internet / Social / Market / Banking

**Lane:** H (see `SOURCE-DIRECTIVE.md` lines 772–835)
**Written:** 2026-09-28 by the Lane H production team
**Backend access used for this file:** none. This lane did **not** connect to `thylora-dash`. Everything marked "exists today" comes from the repo at `3a01e82` or from `00-RECOVERED-STATE.md`, which was read from the backend earlier the same day. Everything this lane proposes is marked **PROPOSED**. Nothing in this file is world canon until the Chairman approves it.
**Institution names:** the five institutions `INST-PERSONAL-BANK-001`, `INST-BUSINESS-BANK-001`, `INST-ROYAL-TREASURY-001`, `INST-FINANCIAL-REGULATOR-001` and `INST-MARKET-VENUE-001` have **OPEN** names. This file refers to them only by code and does not guess their names.
**Earth / EdereAirah separation:** EdereAirah is the world, and every design starts there (World-First Law). Earth is where the THYLORA software, company, money, law and radios actually exist. Every layer below keeps two columns: **WORLD** (what the layer means in EdereAirah canon, built on `THY-INFRA-COMM-MESH-001` and `THY-INFRA-POWER-MESH-001`) and **EARTH** (what is technically and legally possible on Earth now). The two are never merged. Earth is not asked to rescue EdereAirah, and EdereAirah infrastructure is never described as Earth infrastructure.

---

## 0 · What was read before writing (evidence base)

| Source | What it gave this lane |
|---|---|
| `SOURCE-DIRECTIVE.md` | Lane H scope, global rules, MATH RULE, NO NAKED LATER, the 20-part return format |
| `00-RECOVERED-STATE.md` §4 | 5 institutions with OPEN names; REE settlement; `THY-DS-REE-USD` = OPERATIONAL / REFERENCE_PARITY_APPROVED with Earth cash redemption **disabled by design**; `THY-INFRA-COMM-MESH-001`, `THY-INFRA-POWER-MESH-001`; `thylora_world_market_*` (companies = 6 rows); `thylora_bank_account_types` (7 rows) |
| `00-RECOVERED-STATE.md` §2 | `THY-DS-CHAIRMAN-AUTH` VERIFIED; `THY-DS-AUDIT` VERIFIED; `THY-DS-P0-COMMERCE-PROOF` VERIFIED; `THY-DS-LEMON-P0` VERIFIED; `THY-DS-CURRENT-STORE-20260910`: real-money checkout witness = 0; `THY-DS-THYLORA-API` API v1 not frozen |
| `docs/RAE-LINK-ARCHITECTURE.md` | The rule that there is one identity system and one backend, the channel classes (`EARTH_REAL` / `WORLD_SIMULATED`), honest "not provisioned" degradation, and the 15-stage media pipeline |
| `docs/RAE-LINK-PROVIDER-MAP.md` | 25 capabilities, 16 OPEN decisions, and every capability addressed by name rather than by vendor. `backups` = OPEN, `creator_payouts` = OPEN with **HIGH** exit cost, `search` = postgres-fts ACTIVE, `identity_auth` = supabase-auth ACTIVE |
| `rae-link/lib/ledger.js` | Primitives this lane reuses: integer minor units, basis points (10000 bp = 100%), `distributableBase()`, the `allocate()` remainder rule (the house takes the remainder last), `HELD` entries with `hold_reason`, and `markPaid()`, which requires a date, a reference and evidence |
| `db/rae-link/0005_monetization_ledger.sql` | `rael_revenue_events`, `rael_ledger_entries`, `rael_payouts` (a PAID payout needs evidence), `rael_adjustments` (never folded silently). **Currency check is `currency ~ '^[A-Z]{3}$'`.** See finding F-H-01 |
| `db/rae-link/0003_rights_provenance_consent.sql` | `rael_rights_records`, `rael_provenance_events` (event types include `AI_ASSISTED`), `rael_consents`, `rael_takedown_requests`, `rael_appeals` |
| `app/sw.js` | Service worker cache `thylora-app-v9-witness-hotfix`. For **every** GET it tries the network first, falls back to cache, and caches the response. See finding F-H-02 |
| `app/app.js`, `rae-link/lib/backend.js` | The session is kept in **`sessionStorage`** under `thylora_app_auth_session`, so it is lost when the tab closes. That matters for offline identity (F-H-03) |
| `app/sports-betting.html` | "EdereAriah R-currency implementation only. Earth real-money wagering is not authorized by this build." / "Earth money … Hard-blocked in the backend." See F-H-04 |
| `app/index.html` | "REE accounts, payroll, expenses and world orders stay separate from verified Earth transactions." |
| `npm test` (run by this lane, 2026-09-28) | **48 / 48 pass**, 0 fail |

### Findings made while reading (not fixed here: this lane edits no other file)

| ID | Finding | Why it matters | Proposed fix (Backend Change Packet / other lane) |
|---|---|---|---|
| **F-H-01** | Every `rael_*` money table checks `currency ~ '^[A-Z]{3}$'`. The string `REE` passes that check. | The regex would let simulated currency land in an Earth-money payout table, which breaks "never mix simulated wealth with Earth money" at the data layer. | Replace the regex with an Earth ISO 4217 allowlist domain that excludes every simulation code (INV-H-01, INV-H-10). |
| **F-H-02** | `app/sw.js` caches the response to **any** GET, including cross-origin Supabase REST reads sent with a `Bearer` token. Cache Storage is keyed by URL, not by user. | Authenticated data stays on the device after sign-out and can be served offline to the next person who uses that browser profile. It is also unbounded and never expires. | Cache only same-origin static assets. Put user data in a per-user encrypted local store (Layer 2). Clear it on sign-out. |
| **F-H-03** | The session lives in `sessionStorage`. | Closing the tab signs the user out. With no network there is then no way to prove who is using the device, so Device-Only mode has no identity. | Device-bound passkey + local key unlock (Layer 1). |
| **F-H-04** | `app/sports-betting.html` names the in-world currency **"R currency"**. Canon elsewhere says **REE**. The same page and the RAE Link docs spell **"EdereAriah"**, but the canon term `EdereAirah` is LOCKED. | If R and REE are two currencies, the wagering ledger is a third simulation ledger this lane has no record of. If they are one currency, the label is wrong. Either way, whether REE can be bought with Earth money decides whether in-world wagering raises gambling-law questions (§5.4 Q-G-1). | Chairman decision D-H-03. The spelling correction goes to the owners of those files. |
| **F-H-05** | `thy_loochy_*` reward tables and `thylora_bank_*` tables other than `thylora_bank_account_types` were named in the Lane H brief. They are **not** in the repo, and `00-RECOVERED-STATE.md` read no columns for them. | This lane cannot say what they hold. | Every packet row that targets them is `VERIFY_BEFORE_APPLY`. |

---

## 1 · The 15-layer architecture

**How to read each layer.** *Purpose* says what the layer is for. *Exists today* lists only evidenced items. *Design* is **PROPOSED**. *Standards* are real, published technologies. *Failure mode* describes the break. *Degraded behaviour* says what still works when it breaks. *Never* lists hard prohibitions.

**One rule that governs all 15 layers.** The server holds authority over **Earth money** and over **other people's data**. The device holds authority over **the user's own copy** and **the user's own drafts**. A layer may lose connectivity without losing the user's work. It may never lose connectivity and **pretend** the work was delivered, paid or published.

### Layer 1 · Identity

- **Purpose:** know who is acting (a person, a device, an agent or an institution) and what class they are: an Earth person or organization, or an EdereAirah inhabitant or world channel.
- **WORLD:** EdereAirah inhabitants carry world identity. This lane creates no inhabitants. Inhabitants are authored by the world lanes under `THY-NAMING-SOCIAL-GRAPH-001`.
- **Exists today:** Supabase Auth (`identity_auth` = supabase-auth, ACTIVE, provider map). `THY-DS-CHAIRMAN-AUTH` OPERATIONAL / VERIFIED. One shared session key `thylora_app_auth_session` for the app and RAE Link (`backend.js`). `rael_profiles` and `rael_channels` with `world_status` `EARTH_REAL` / `WORLD_SIMULATED` (`0001_identity_channels.sql`, written, not applied).
- **Design (PROPOSED):**
  1. **The account stays at Supabase Auth.** No second identity system, per the RAE Link rule.
  2. **Passkeys** (WebAuthn Level 3 / FIDO2) become the primary sign-in, with email magic link as recovery.
  3. **Each device gets a key pair.** It is generated with WebCrypto as non-extractable P-256 (or Ed25519 where supported) and registered against the account. It signs offline actions: queued posts, messages, REE intents, audit entries. On reconnection the server verifies the signature and never has to trust the client clock.
  4. **Local unlock:** a passkey assertion, or a device PIN that derives a key-encryption key through PBKDF2 or Argon2id (WASM), unlocks the local store (Layer 2) with no network.
  5. **Identity class is immutable per profile.** An `EARTH_REAL` profile can never be re-flagged `WORLD_SIMULATED` or the reverse. Changing class means creating a new profile, and the old one stays auditable.
  6. **DIDs / Verifiable Credentials: NOT adopted.** They are justified only if a third party must verify a THYLORA credential without calling THYLORA, for example a school checking a THYLORA course certificate. Held as QUEUED_WITH_DEPENDENCY (§6.5).
- **Standards:** WebAuthn L3, FIDO2/CTAP2, OAuth 2.1 / OIDC (Supabase), WebCrypto, Argon2id (RFC 9106). W3C VC 2.0 / DID Core only if the release condition is met.
- **Failure mode:** the auth provider is unreachable, a device is lost, or a passkey is deleted.
- **Degraded behaviour:** a device already enrolled can unlock its local store and sign queued actions. It **cannot** create accounts, change recovery, or authorize any Earth-money action.
- **Never:** create a second identity system. Let a world inhabitant pass as an Earth person. Store passwords or raw private keys in `localStorage`. Treat a device signature as consent to spend Earth money.

### Layer 2 · Local / offline-first device function

- **Purpose:** keep the user's own things (help library, drafts, family records they own, purchased entitlements, world state snapshots) usable on the device.
- **Exists today:** `app/sw.js` (network-first, caches all GETs, with defect F-H-02). `app/manifest.webmanifest` (standalone PWA, scope `/app/`). No IndexedDB or OPFS store. RAE Link has no service worker.
- **Design (PROPOSED):**
  - **Service worker v10** separates three caches. (a) `shell-<build>` holds static assets pinned to a build hash. (b) `pack-<version>` holds the signed Essential Pack (Layer 5). (c) **No** API responses.
  - **Local store:** IndexedDB, or SQLite-WASM on OPFS where available, per user and per device, encrypted with AES-GCM under the key from Layer 1. It is wiped on sign-out and on "forget this device".
  - **Outbox:** every write is an intent row carrying `intent_id` (UUIDv7), `created_at_device`, `signature`, `payload_hash` and `class` (`DRAFT`, `SOCIAL`, `WORLD_REE`, `EARTH_MONEY`). The server enforces idempotency by `intent_id`.
  - **CRDTs are used only where merges are safe.** Collaborative notes, family-story drafts and lists use Automerge or Yjs. **Money never uses CRDTs.** Ledgers are server-authoritative, and the offline side is a **hold**: a local reservation that the server confirms or rejects, reusing the `HELD` / `hold_reason` pattern from `ledger.js`.
  - **Sync trigger:** Background Sync where the browser supports it (Chromium), otherwise sync on app open and on a successful heartbeat (Layer 14).
- **Standards:** Service Worker, Cache Storage, IndexedDB, OPFS, SQLite WASM, Web Crypto AES-GCM, Automerge or Yjs, UUIDv7 (RFC 9562).
- **Failure mode:** storage quota eviction (browsers can evict non-persistent storage), iOS limits on PWA storage, a corrupted store.
- **Degraded behaviour:** request `navigator.storage.persist()` and show whether it was granted. If the store is evicted, the app says so and re-downloads the pack when online. It never shows an empty list as if the user had no data.
- **Never:** cache authenticated API responses in a shared cache. Resolve money conflicts with last-writer-wins. Show a queued item as delivered.

### Layer 3 · Naming / addressing

- **Purpose:** every person, record, asset and service has a stable name that survives a provider change and can be checked when it arrives by an unusual route: USB, LAN hub or mesh.
- **Exists today:** canonical ID grammar across registries (`THY-…`, `ER-…`, `INST-…`, `WR-…`), `vercel.json` rewrites (`/`, `/app`, `/rae-link`), `rael_media_assets.storage_provider` + `storage_key`, which keep storage keys provider-relative (provider map).
- **Design (PROPOSED):**
  - **Three name spaces, never confused.** (a) **Canonical IDs** are human-readable and never reused. (b) **Content addresses** are SHA-256 digests (multihash-encoded, so they are IPFS-CID-compatible without depending on IPFS) for every archived or packed item, so a copy from any source can be verified. (c) **Network locators**: DNS names online, and **mDNS / DNS-SD** (`_thylora._tcp.local`) for a LAN hub when public DNS is unreachable.
  - The Essential Pack manifest lists `canonical_id → content_hash → size → signed_by`.
  - Names in the world namespace (`ER-…`) are never presented as Earth addresses.
- **Standards:** DNS, DNSSEC where the registrar supports it, mDNS (RFC 6762), DNS-SD (RFC 6763), SHA-256, multihash/CIDv1, HTTPS/TLS 1.3, and Ed25519 or P-256 signatures on manifests.
- **Failure mode:** DNS outage or registrar loss, a hash mismatch, a spoofed LAN hub.
- **Degraded behaviour:** the LAN hub is found by mDNS, and its manifest signature is checked against a THYLORA public key pinned in the app. Unsigned hubs are shown as "untrusted: read nothing".
- **Never:** reuse a retired canonical ID. Accept content whose hash does not match. Imitate another organization's domain or name.

### Layer 4 · Secure messaging

- **Purpose:** private one-to-one and small-group messages between people who chose to talk, delivered through any available path.
- **Exists today:** `rael_comments` and `rael_notifications` (public or semi-public, written, not applied). **No private messaging exists.**
- **Design (PROPOSED):**
  - **Protocol: MLS (RFC 9420)** through **OpenMLS** (MIT-licensed, compiles to WASM). MLS is chosen over the Signal protocol because group membership is native and the licensing is clean. libsignal is AGPL-3.0, which is a license decision that would need counsel, so it is not the default.
  - The server is a **delivery service** that only stores ciphertext and handshake messages. Transport is store-and-forward: HTTPS online, the LAN hub relay locally, and LoRa text relay only for very short messages when Layer 15 exists.
  - **Safety versus encryption:** a user can report a message by forwarding the decrypted content with a verifiable report token. The server cannot read messages that nobody reports. Minors: messaging is off by default for accounts flagged under-13, and COPPA questions go to counsel (§5.4).
  - The delivery state is always one of `QUEUED_ON_DEVICE`, `HANDED_TO_HUB`, `HANDED_TO_SERVER`, `DELIVERED_TO_DEVICE` or `READ`. The state is never invented.
- **Standards:** MLS RFC 9420, the MLS architecture (RFC 9750), HPKE (RFC 9180), TLS 1.3, Web Push (RFC 8030) for wake-up without message content.
- **Failure mode:** the delivery server is down, a device is lost (key loss), the group state forks.
- **Degraded behaviour:** messages queue on the device. If the recipient is on the same hub, they are delivered through the hub. Otherwise they show `QUEUED_ON_DEVICE` with the time queued.
- **Never:** call anything "end-to-end encrypted" while the server can read it. Send encrypted traffic over amateur radio (§2.4). Promise delivery when no path exists. Use messaging for Earth-money transfers.

### Layer 5 · Knowledge / search / archive

- **Purpose:** THYLORA as a place people come to for verified information (Lane G). It must stay readable during an outage.
- **Exists today:** `search` = postgres-fts ACTIVE (provider map). `rael_media_assets` has a generated tsvector. Registries such as `thylora_math_equation_registry` (32) and `legal_office_registry` (1). `thylora_help_intake_index` = **0 rows**.
- **Design (PROPOSED):**
  - **Server search:** Postgres FTS now. Typesense or Meilisearch is an alternate if relevance becomes the blocker, and the provider map already names both.
  - **Essential Pack:** a curated, versioned, **signed** bundle of the help library, resource navigation, the "what to do during an outage" card, family records the user owns, and the user's purchased digital entitlements. It is indexed on the device with SQLite FTS5 (WASM) or MiniSearch. Every item carries an `as_of` date and a `source`, and the UI shows how old the item is.
  - **Archive:** original plus derivatives are content-addressed (Layer 3). Web captures are stored as WARC (ISO 28500). Versions are never overwritten, which reuses `version_no` / `replaces_asset_id` from RAE Link.
- **Standards:** PostgreSQL FTS, SQLite FTS5, WARC ISO 28500, and schema.org / JSON-LD for public metadata.
- **Failure mode:** stale pack, pack not downloaded, search server down.
- **Degraded behaviour:** search on the device searches the pack only and says so ("searching your offline pack, updated 2026-09-20"). Items that are not in the pack show as "available when online".
- **Never:** present stale guidance without its date. Present navigation help as legal, medical or financial advice. Silently drop a source.

### Layer 6 · Media / social

- **Purpose:** channels, publication, follows, comments and family stories, with rights checked before upload.
- **Exists today:** the RAE Link pipeline with 15 stages (rights gate before upload, asserted in tests). 40 tables, 38 RLS policies and 14 functions are **written but not applied**. `family_story_archives` and `family_story_audit` are read by `app/app.js`. The `THY-NAMING-SOCIAL-GRAPH-001` policy says "no new person enters a public scene as an isolated node".
- **Design (PROPOSED):** reuse RAE Link unchanged. Additions:
  1. Offline reading of followed channels from the local store.
  2. Posts made offline enter the outbox as `DRAFT_QUEUED` and **pass the same rights gate locally** (`rights.js` already runs client-side) before they can be queued.
  3. A **LAN-local board** on the hub for the building or neighbourhood during an outage. It is text and small images only, signed per device, and it expires.
  4. Federation (ActivityPub) is **not core**. It would be an optional Earth gateway (Layer 12).
- **Standards:** the RAE Link schema, WebVTT captions, ActivityPub only as an optional gateway, C2PA (Layer 10).
- **Failure mode:** the media CDN is down (`streaming_cdn` OPEN), moderation is unavailable (`moderation` OPEN).
- **Degraded behaviour:** already-cached renditions play. New publication pauses at the moderation stage and shows "held: moderation offline". It is never auto-published.
- **Never:** skip the rights gate because the network is down. Auto-publish without moderation. Publish a `WORLD_SIMULATED` channel without its visible disclosure.

### Layer 7 · Commerce

- **Purpose:** the store as an operating surface (Lane D): catalogue, checkout, entitlements, Back-to-Buy.
- **Exists today:** Shopify (`payments_physical` PLANNED), Lemon Squeezy (`payments_digital` PLANNED; `THY-DS-LEMON-P0` VERIFIED in test mode), `products` (28), `orders` (1), `thylora_store_shelves` (13), `thylora_store_release_gate`, `THY-DS-CURRENT-STORE-20260910` ("THYLORA active_allowed=false. Real-money checkout witness=0"). `rael_entitlements` and `rael_purchases` are written, not applied.
- **Design (PROPOSED):**
  - The catalogue and prices are cached in the pack with `price_as_of`.
  - **Offline purchase = intent only.** A cart can be saved offline. No charge, no reservation of stock, no promise.
  - Digital entitlements are cached as **signed entitlement tokens** (payload: `entitlement_id`, `user_id`, `asset_hash`, `not_after`, signed with a server key), so purchased downloads stay readable without a network until `not_after`.
  - Back-to-Buy support uses Lane D's math (`N = G − T − F − P − R`, `B = N × s`) through the existing `allocate()` remainder rule, and the beneficiary share is declared before publication (existing `FAMILY_PARTNERSHIP` rule).
- **Standards:** processor-hosted checkout (PCI DSS scope stays with the processor, SAQ A-type posture), signed JWS tokens (RFC 7515) for entitlements.
- **Failure mode:** processor outage, webhook loss, double submission.
- **Degraded behaviour:** "checkout needs the Earth internet". The cart is saved. Webhooks are replayed idempotently by `processor_reference`.
- **Never:** take card data into THYLORA systems. Charge or reserve offline. Price an Earth product in REE. Hide the support percentage.

### Layer 8 · Ledger / payments

- **Purpose:** record every unit of value in its own ledger, with its own currency domain. Detail in §5.
- **Exists today:** `rael_revenue_events`, `rael_ledger_entries`, `rael_payouts`, `rael_payout_lines` and `rael_adjustments` (written, not applied). `ledger.js` with SQL/JS settlement parity "identical to the cent" (architecture doc). World: `thylora_bank_account_types` (7), REE settlement, `THY-DS-REE-USD` reference parity with redemption disabled. The Business Factory shows "REE revenue" and "Payroll due" (`app/app.js`).
- **Design (PROPOSED):** eight **ledger domains** (§5.1), each a double-entry journal with append-only lines, integer minor units and one currency domain. Every movement between domains goes through a single function that checks the **transfer matrix** (§5.2). The invariants are in §5.3.
- **Standards:** double-entry bookkeeping, integer minor units per ISO 4217 exponent, and idempotency keys. **ISO 20022 is not adopted**: THYLORA initiates no bank payments itself. The processors do, and they abstract ISO 20022. It becomes relevant only if THYLORA connects directly to a bank rail such as FedNow, whose messaging is ISO 20022.
- **Failure mode:** partial write, webhook replay, a currency code accepted in the wrong domain (F-H-01).
- **Degraded behaviour:** Earth-money ledgers are **read-only offline**, showing the last server balance with its `as_of`. REE supports **capped offline holds** only (§2.2).
- **Never:** use floats. Update or delete a posted line. Hold REE and Earth currency in one column domain. Move Earth money without a server acknowledgement.

### Layer 9 · Market / exchange

- **Purpose:** two different things with two different screens. The **Earth-market dashboard** is read-only external data. The **EdereAirah market** is a simulation exchange. Detail in §4.
- **Exists today:** `thylora_world_market_*` (companies = 6 rows). `INST-MARKET-VENUE-001` and `INST-FINANCIAL-REGULATOR-001` with names OPEN. No Earth market adapter.
- **Never:** show Earth prices and REE prices on the same axis or in the same unit. Let REE positions be valued in USD. Give personalized investment advice.

### Layer 10 · Rights / provenance

- **Purpose:** who made this, who may use it, and whether it was captured, derived or AI-assisted.
- **Exists today:** `rael_rights_records` (one active per asset), `rael_provenance_events` (`CAPTURED`, `CREATED`, `DERIVED`, `AI_ASSISTED`, `RESTORED`, `IMPORTED`, `TRANSFERRED`), `rael_consents` per subject, takedowns and appeals. Visual law `THY-INTERWORLD-VISUAL-BARRIER-001` (the localized glaze marks EdereAirah imagery as another world).
- **Design (PROPOSED):**
  - **C2PA** Content Credentials manifests on every published still and video. `rael_provenance_events` maps onto C2PA actions (`c2pa.created`, `c2pa.edited`, and the `digitalSourceType` for AI-assisted work). World imagery carries an assertion that it is `WORLD_SIMULATED`, which is the machine-readable twin of the visual glaze.
  - Manifests are signed with a THYLORA certificate. The certificate authority choice is OPEN and needs a quote.
  - Rights and consent records are content-hashed into the audit chain (Layer 11).
- **Standards:** C2PA 2.x, IPTC Photo Metadata `DigitalSourceType`, W3C PROV (vocabulary only).
- **Failure mode:** metadata stripped by third-party platforms, which is common.
- **Degraded behaviour:** THYLORA keeps the manifest server-side and publishes a lookup, so a stripped copy can still be checked by its hash.
- **Never:** publish without a passed rights gate. Remove an `AI_ASSISTED` disclosure. Present world imagery as Earth documentary.

### Layer 11 · Security / audit

- **Purpose:** every consequential action can be attributed, and its record cannot be quietly changed.
- **Exists today:** `THY-DS-AUDIT` and `THY-DS-ROUTER` VERIFIED (command path). RAE Link has 38 RLS policies (written). The publishable key in `backend.js` is designed to be public: RLS is the boundary.
- **Design (PROPOSED):**
  - **Hash-chained append-only audit log**: `h_n = SHA-256(h_(n−1) ‖ canonical_json(row_n))`. The equation is detailed in §2.5 (E-8).
  - Each day's head hash is anchored by an RFC 3161 timestamp from a public time-stamping authority, so even THYLORA cannot rewrite history undetected.
  - Postgres: `REVOKE UPDATE, DELETE` on journal and audit tables for all app roles.
  - OWASP ASVS 4.0 Level 2 as the review checklist. Secrets stay in backend secrets only, per the provider map.
  - Offline actions arrive with device signatures (Layer 1) and are appended with both `created_at_device` and `received_at_server`.
- **Standards:** RFC 3161, SHA-256, OWASP ASVS, Postgres RLS.
- **Failure mode:** an admin role bypasses RLS, key compromise, a clock problem.
- **Degraded behaviour:** the device keeps a local append-only log of its own actions, which is reconciled into the server chain on reconnect.
- **Never:** edit an audit row. Log message plaintext. Let a service key reach the browser.

### Layer 12 · Earth gateways / adapters

- **Purpose:** every Earth service THYLORA depends on is an **adapter** behind a capability name (provider map), so no single vendor is a single point of existence.
- **Exists today:** the 25-capability provider map (16 OPEN), Shopify, Lemon Squeezy, Vercel hosting (ACTIVE), Supabase (ACTIVE), web-push (PLANNED).
- **Design (PROPOSED):**
  - Every adapter declares `direction` (READ / WRITE), `money_class` (NONE / EARTH), `rate_limit`, `data_license`, `failure_policy` and `circuit_breaker` (open after *k* consecutive failures and probe every *t* seconds).
  - New adapters named here are `earth_market_data` (READ, licensed, §4.1), `timestamp_authority` (Layer 11) and `c2pa_signing` (Layer 10).
- **Failure mode:** a vendor outage, a vendor terms change, a key revoked.
- **Degraded behaviour:** the circuit opens, the UI shows "Earth service X unreachable since hh:mm", and dependent features move to their Device-Only column (§2).
- **Never:** let a vendor name leak into a canonical record as if it were the capability. Scrape data THYLORA has no licence for.

### Layer 13 · Backup / recovery

- **Purpose:** a provider loss, operator error or ransomware event is survivable.
- **Exists today:** `backups` = **OPEN** (provider map). No verified restore drill in the evidence.
- **Design (PROPOSED):**
  - **3-2-1 rule:** three copies, on two kinds of media, one of them off-provider.
  - Copy 1 is provider point-in-time recovery (PITR). Its availability and price depend on the Supabase plan, so a quote is needed.
  - Copy 2 is a nightly logical dump (`pg_dump`) encrypted with age or GPG to cold object storage at a second provider (`object_storage` alternates: r2, s3, b2).
  - Copy 3 is a monthly offline copy held by the Chairman.
  - **User-side:** every user can export their own data as a signed archive (data portability). Their device also holds its own copy (Layer 2).
  - **Targets (PROPOSED, need Chairman sign-off):** RPO ≤ 24 h for the full database via the dump, and ≤ 5 min where PITR is enabled. RTO ≤ 8 h.
  - A **quarterly restore drill** is recorded as evidence.
- **Standards:** pg_dump/pg_restore, WAL-based PITR, age encryption, SHA-256 manifest per backup.
- **Failure mode:** a backup that has never been restored (the most common failure), key loss for encrypted dumps.
- **Degraded behaviour:** read-only restore of the last good dump to a standby project.
- **Never:** claim backups exist without a restore witness. Keep the backup key only in the system being backed up.

### Layer 14 · Degraded / offline mode (the state machine)

- **Purpose:** the whole app knows which of four states it is in and behaves honestly in each.
- **Exists today:** RAE Link's `BackendError.provisionRequired` shows honest "not provisioned yet" messages. The app's SW falls back to cache. **No explicit state machine.**
- **Design (PROPOSED):**

```
ONLINE ──(heartbeat to THYLORA health endpoint fails 3× in 30 s)──▶ EARTH_DOWN
EARTH_DOWN ──(mDNS finds signed THYLORA hub)──▶ LOCAL_NETWORK
EARTH_DOWN / LOCAL_NETWORK ──(no hub, no internet)──▶ DEVICE_ONLY
any ──(device battery exhausted / grid down with no backup)──▶ NO_POWER (nothing electronic runs)
DEVICE_ONLY / LOCAL_NETWORK ──(heartbeat succeeds 2× in 20 s)──▶ ONLINE ──▶ outbox sync ──▶ reconcile holds
```

  - **Detection:** the app does **not** trust `navigator.onLine`, which only reports that a network interface exists. It sends an authenticated heartbeat to a THYLORA health endpoint, and a separate probe checks that the Earth adapters are up.
  - A banner shows the state, when it began, and what cannot be done right now.
- **Never:** show ONLINE because the Wi-Fi icon is lit. Silently hide features. Silently fail a queued write.

### Layer 15 · Mesh / local communications (only where technically and legally viable)

- **WORLD:** `THY-INFRA-COMM-MESH-001` (fibre backbone, neighbourhood wireless mesh, broadcast and satellite fallback, local caches, graceful degradation) and `THY-INFRA-POWER-MESH-001` (distributed microgrids) are **EdereAirah canon blueprints** in `PLAIN_EARTH_BRIDGE_ACTIVE`. In the world they can be complete.
- **EARTH:** **nothing is built.** THYLORA owns no fibre, towers, spectrum or satellites, and this lane does **not** promise global, regional or city-wide communications.
- **Design (PROPOSED):** three tiers, each gated separately.
  - **Tier A · LAN hub:** a small computer running a Wi-Fi access point in an unlicensed band. It serves the signed THYLORA shell and Essential Pack, relays MLS ciphertext between local devices, and hosts the local board. Coverage is one building or a small area, roughly tens of metres indoors (§2.3).
  - **Tier B · LoRa text relay:** certified 902–928 MHz LoRa modules running open-source mesh firmware of the Meshtastic class (GPL-3.0; this lane would integrate with it, not fork it silently). Tiny text messages only: check-ins, "I'm OK", pack update notices. No commerce, no media. Range and throughput limits are in §2.3.
  - **Tier C · Anything wider** (licensed backhaul, satellite, carrier partnerships) is **not designed**. It needs infrastructure partners THYLORA does not have. Held as QUEUED_WITH_DEPENDENCY (§6.5).
- **Standards:** IEEE 802.11 (Wi-Fi), the LoRa PHY (Semtech), LoRaWAN Regional Parameters (US915) for the band plan, 47 CFR Part 15, and Bluetooth LE for pairing and short-range handoff.
- **Never:** market it as "internet". Promise emergency-services connectivity. Operate uncertified or modified radios. Carry encrypted or commercial traffic on amateur frequencies. Put Earth-money transactions over mesh.

---

## 2 · "Internet outage degrades, does not erase"

### 2.1 Capability matrix

The column states are defined in Layer 14. **ONLINE** means the Earth internet and the THYLORA backend are both reachable. **EARTH-DOWN / LOCAL NET** means no Earth internet, but a signed THYLORA LAN hub (Layer 15, Tier A) is reachable. **DEVICE-ONLY** means no network at all and the device has battery. **NO-POWER** means the device is off: its battery is exhausted, or the grid is down with no backup.

| # | User function | ONLINE | EARTH-DOWN / LOCAL NET | DEVICE-ONLY | NO-POWER |
|---|---|---|---|---|---|
| 1 | Sign in (new device) | Full (passkey / email) | **No.** Needs the auth server | **No** | No |
| 2 | Unlock an already-enrolled device | Full | Full (local key) | Full (local key) | No |
| 3 | Read the help library / Essential Pack | Full, live | Full, from hub copy (age shown) | Full, from device copy (age shown) | Printed Outage Card only (see note N1) |
| 4 | Search | Server FTS | Hub pack index | Device pack index only, labelled | No |
| 5 | Own family records (owned, previously synced) | Full | Read and edit drafts; hub can relay to family members on the same hub | Read and edit drafts (CRDT), sync later | No |
| 6 | Compose a message | Full | Full | Full (queued) | No |
| 7 | Deliver a message to someone on the same hub | Via server | **Yes**, via hub relay (MLS ciphertext) | No: `QUEUED_ON_DEVICE` | No |
| 8 | Deliver a message to someone far away | Yes | Only if a Tier B LoRa path exists and the message is ≤ one short text; otherwise queued | No | No |
| 9 | View feed / channels | Full | Cached feed + LAN board | Cached feed | No |
| 10 | Publish a post / media | Full pipeline | Local board only (text / small image, expires); public post queued | Draft queued; local rights gate runs | No |
| 11 | Browse the store catalogue | Live prices | Cached prices, `price_as_of` shown | Cached prices, `price_as_of` shown | No |
| 12 | Buy a product (Earth money) | Yes (processor checkout) | **No.** Cart saved | **No.** Cart saved | No |
| 13 | Open purchased digital items | Full | Yes, until the token's `not_after` | Yes, until the token's `not_after` | No |
| 14 | Back-to-Buy support purchase | Yes, math disclosed | **No.** Intent saved | **No.** Intent saved | No |
| 15 | View Earth-money balances (royalties, support, credit) | Live | Last server figure + `as_of` | Last server figure + `as_of` | No |
| 16 | Creator payout / any Earth-money movement | Yes, evidence-gated | **No** | **No** | No |
| 17 | REE in-world transfer | Full (server ledger) | **Capped hold** via hub, reconciled later (§2.2) | **Capped hold** signed on device, applied on sync (§2.2) | No |
| 18 | EdereAirah market trade | Full (order book) | **No.** Order intents queued, not matched | **No.** Order intents queued | No |
| 19 | Earth-market dashboard | Delayed licensed data, delay shown | Last snapshot, "STALE" stamp | Last snapshot, "STALE" stamp | No |
| 20 | Business Factory world edits | Full | Drafts; hub may host a shared draft | Drafts | No |
| 21 | Audit record of own actions | Server chain | Device log + hub log | Device log | No |
| 22 | Backup / export own data | Signed export | Export to hub or USB (local copy) | Export to device file | No |
| 23 | Emergency | THYLORA shows local emergency instructions. **THYLORA is not an emergency service and never places or promises emergency calls** | Same, from pack | Same, from pack | Printed Outage Card (N1) |
| 24 | Short check-in ("I'm OK") beyond the building | Normal messaging | Tier B LoRa only where nodes exist; otherwise hub-local | No | No |

**Note N1 (the honest NO-POWER answer):** with no power, no software works. The only THYLORA presence is the **printed Outage Card**, a PROPOSED store item and free download (Lane D / G). It is a dated sheet listing the family's own contacts, local emergency numbers, the meeting-point plan and the hub location. Keeping the world alive with no power is impossible. What THYLORA can do is make sure the last synced state is on paper.

**Counts:** 24 functions. Working in some form: ONLINE 24/24, LOCAL NET 19/24 (all except 1, 12, 14, 16 and 18), DEVICE-ONLY 16/24 (it also loses 7, 8 and 24), NO-POWER 0/24 electronic (2 functions, 3 and 23, have a paper fallback).

### 2.2 Offline REE holds (why simulation money may move offline and Earth money may not)

REE is a simulation ledger governed by EdereAirah economics. An offline double-spend damages only the simulation, and the simulation can reconcile it. Earth money involves real people's funds and processor rules, so it never moves offline.

**E-1 · Offline REE hold cap** (FORMAL SYSTEM LAW: a rule THYLORA defines)

`Σ_{i ∈ Q} a_i ≤ min(C_dev, B_last − H_pending)`

- `Q` is the set of offline REE intents queued on one device. `i` indexes them.
- `a_i` is the amount of intent `i`, in REE minor units: an integer ≥ 1.
- `Σ` sums over the set.
- `≤` means "must not exceed". `min( , )` takes the smaller of its two arguments. `−` is subtraction.
- `C_dev` is the per-device offline cap in REE minor units. It is PROPOSED and **set by `INST-FINANCIAL-REGULATOR-001` policy in-world**. Its value is UNKNOWN and is not guessed here.
- `B_last` is the last server-confirmed balance on the device, in REE minor units.
- `H_pending` is the holds already placed on the device, in REE minor units.
- **Domain:** non-negative integers. **Threshold:** an intent that would break the inequality is rejected on the device.
- **Assumptions:** the device clock is untrusted, and ordering comes from the server on sync.
- **Failure conditions:** if the same account is offline on two devices, the combined spend can reach 2 × `C_dev`. The server applies intents in received order and marks any that overdraw as `REJECTED_ON_SYNC`, with a world-side reason.
- **Worked example (illustrative numbers, not canon):** `B_last` = 50,000, `H_pending` = 5,000, `C_dev` = 10,000. The cap is min(10,000, 45,000) = 10,000. Queued intents of 4,000 + 3,000 = 7,000 ≤ 10,000 pass. A third intent of 4,000 would make 11,000 > 10,000 and is refused on the device.

### 2.3 Radio physics and law (Layer 15)

Every equation below follows the MATH RULE. Logarithms are base 10. "dB" is a power ratio in decibels. "dBm" is decibels relative to 1 milliwatt. "dBi" is antenna gain relative to an isotropic antenna.

**E-2 · Free-space path loss** (PHYSICAL LAW: follows from the Friis transmission equation for isotropic antennas in free space)

`FSPL_dB = 20·log10(d_km) + 20·log10(f_MHz) + 32.44`

- `FSPL_dB` is the free-space path loss in dB, unitless on the dB scale.
- `d_km` is the transmitter-to-receiver distance in kilometres, `> 0`.
- `f_MHz` is the carrier frequency in megahertz, `> 0`.
- `32.44` is the constant `20·log10(4π·10⁹ / c)` in dB, with c = 299,792,458 m/s and the unit conversions for km and MHz.
- `·` is multiplication and `+` is addition. The subscripts `dB`, `km` and `MHz` name units.
- **Domain:** the far field, meaning d much greater than the wavelength (0.33 m at 915 MHz).
- **Threshold:** none by itself. It feeds E-3.
- **Assumptions:** free space, line of sight, no obstructions, no ground reflection.
- **Failure conditions:** real terrain, buildings, foliage and people add loss. See E-4 and E-5.
- **Consequence for "range vs power":** every doubling of distance adds 20·log10(2) = **6.02 dB** of loss, so doubling the range in free space needs **4× the power**. That is why power alone cannot buy global reach.
- **Worked example (LoRa, 2 km):** f = 915 MHz, d = 2 km. 20·log10(2) = 6.02 and 20·log10(915) = 59.23, so FSPL = 6.02 + 59.23 + 32.44 = **97.69 dB**.
- **Second example (Wi-Fi, 100 m):** f = 2,437 MHz (channel 6), d = 0.1 km. That gives −20.00 + 67.74 + 32.44 = **80.18 dB**.

**E-3 · Link budget** (ENGINEERING CONSTRAINT)

`P_rx = P_tx + G_tx + G_rx − L_tx − L_rx − FSPL − L_extra`, and the link closes if `M = P_rx − S_rx ≥ M_req`

- `P_rx` is the received power in dBm.
- `P_tx` is the transmitter conducted power in dBm.
- `G_tx` and `G_rx` are the antenna gains in dBi.
- `L_tx` and `L_rx` are cable or connector losses in dB.
- `L_extra` is excess loss (clutter, walls, foliage) in dB, ≥ 0.
- `S_rx` is the receiver sensitivity in dBm for the chosen data rate. It is a datasheet value.
- `M` is the fade margin in dB. `M_req` is the required margin (PROPOSED as 10 dB for a fixed outdoor link, 20 dB for a handheld on the move).
- **Assumptions:** the dB values add because they are logarithms of multiplicative factors.
- **Failure:** `M < M_req` means intermittent or no link.
- **Worked example (2 km):** P_tx = 20 dBm (100 mW). Gains are 2 dBi each. Losses are 1 dB each. FSPL = 97.69 dB. L_extra = 0 in free space. So P_rx = 20 + 2 + 2 − 1 − 1 − 97.69 = **−75.69 dBm**. The Semtech SX1276 datasheet gives about −123 dBm sensitivity at SF7 / 125 kHz, so M = −75.69 − (−123) = **47.3 dB**. On paper that is a large margin. In a city, L_extra of 30–40 dB and the Fresnel blockage in E-5 consume most of it.

**E-4 · Log-distance path loss** (EMPIRICAL MODEL)

`PL(d) = PL(d0) + 10·n·log10(d / d0)`

- `PL(d)` is the loss at distance d, in dB.
- `d0` is the reference distance (1 m or 1 km), and `PL(d0)` is the measured or free-space loss there.
- `n` is the path-loss exponent, unitless. It is 2 in free space, roughly 2.7–3.5 in urban cells, and roughly 4–6 inside buildings (textbook ranges, to be replaced by site measurements).
- `/` is division.
- **Assumptions:** `n` is fitted to one environment.
- **Failure:** `n` does not transfer between sites.
- **Consequence:** with n = 3.5, doubling the range costs 10·3.5·log10(2) = **10.5 dB**, so about 11× the power.
- **Worked example:** PL(1 m) = 40 dB at 2.4 GHz with n = 3.5. At 30 m, PL = 40 + 35·log10(30) = 40 + 35 × 1.477 = **91.7 dB**.

**E-5 · First Fresnel zone radius and radio horizon** (PHYSICAL LAW approximations)

`r1_m = 17.32·√( d1_km · d2_km / (f_GHz · D_km) )`, with `D_km = d1_km + d2_km`; and `d_h,km ≈ 4.12·( √h1_m + √h2_m )`

- `r1_m` is the radius of the first Fresnel zone, in metres, at the point that is `d1_km` from one end and `d2_km` from the other.
- `f_GHz` is the frequency in GHz. `D_km` is the total path length.
- `√` is the square root. The constant 17.32 carries the units.
- `d_h,km` is the radio horizon in km for antenna heights `h1_m` and `h2_m` above average terrain, in metres. The constant 4.12 includes standard atmospheric refraction (the 4/3-earth model).
- **Threshold:** keep ≥ 60% of `r1` clear of obstacles.
- **Assumptions:** smooth earth and standard atmosphere.
- **Failure:** hills and buildings block below the geometric horizon.
- **Worked example:** a 2 km path at 0.915 GHz, measured at the midpoint (d1 = d2 = 1): r1 = 17.32·√(1/(0.915·2)) = **12.80 m**, so 60% clearance = **7.68 m** above obstacles. Two handhelds at 1.5 m height give a horizon of 4.12·(1.2247 + 1.2247) = **10.09 km**, and at 10 km the midpoint r1 is 28.6 m. **Consequence:** ground-level handhelds cannot form a reliable 10 km link no matter what the power. Tier B needs elevated, fixed relay nodes (roofs, masts) with owner permission. Raising one node to 30 m extends the horizon to 4.12·(1.2247 + 5.477) = **27.6 km**, which is still far from "global".

**E-6 · LoRa raw bit rate and time on air** (FORMAL SYSTEM LAW: definitions from the Semtech LoRa modem specification)

`R_b = SF · (BW / 2^SF) · (4 / (4 + CR))`; `T_sym = 2^SF / BW`; `T_air = (N_pre + 4.25 + N_payload) · T_sym`, where
`N_payload = 8 + max( ceil( (8·PL − 4·SF + 28 + 16·CRC − 20·IH) / (4·(SF − 2·DE)) ) · (CR + 4), 0 )`

- `R_b` is the raw bit rate in bits per second.
- `SF` is the spreading factor, an integer from 7 to 12.
- `BW` is the bandwidth in Hz (125,000 here).
- `CR` is the coding-rate index (1 means 4/5).
- `^` is exponentiation.
- `T_sym` is the symbol time in seconds. `T_air` is the time on air in seconds.
- `N_pre` is the number of preamble symbols (8). `PL` is the payload in bytes. `CRC` = 1 if a CRC is present. `IH` = 1 if the header is implicit, otherwise 0. `DE` = 1 if low-data-rate optimization is on.
- `ceil` rounds up. `max` takes the larger value.
- **Worked example:** SF7, BW 125 kHz, CR 4/5 gives R_b = 7·976.56·0.8 = **5,469 bit/s**. SF12 gives **293 bit/s**. A 50-byte text at SF7 has T_sym = 1.024 ms and N_payload = 83, so T_air = (8 + 4.25 + 83) × 1.024 ms = **97.5 ms**.

**E-7 · Shared-channel capacity (pure ALOHA)** (FORMAL SYSTEM LAW under the stated assumptions; real networks deviate)

`S = G·e^(−2G)`, with maximum `S_max = 1/(2e) ≈ 0.184` at `G = 0.5`

- `S` is the throughput: the fraction of time carrying successful packets, unitless, from 0 to 1.
- `G` is the offered load in packets per packet-time, unitless, ≥ 0.
- `e` is Euler's number, 2.71828.
- **Assumptions:** Poisson arrivals, any overlap destroys both packets, no carrier sensing. This is roughly how LoRa nodes contend.
- **Worked example:** with 97.5 ms packets, one channel at best carries 0.184 / 0.0975 s ≈ **1.9 successful 50-byte messages per second, shared by everyone in range**. That is enough for check-ins. It is not enough for chat at scale, and it cannot carry photos, video or commerce.

**Unlicensed bands and rules (general terms; verify against the current 47 CFR before any deployment):**

| Band / tech | Rule basis (US) | General constraints | THYLORA use |
|---|---|---|---|
| Wi-Fi 2.4 GHz (2400–2483.5 MHz) | Part 15 (§15.247) | Certified equipment only. Power limits (conducted up to 1 W, with EIRP limits and antenna-gain reductions). No protection from interference | Tier A LAN hub |
| Wi-Fi 5 GHz (U-NII bands) | Part 15 (§15.407) | Per-sub-band power limits. **DFS/TPC required** in U-NII-2A/2C (radar protection) | Tier A LAN hub |
| Wi-Fi 6 GHz | Part 15 (§15.407) | Low-power indoor (LPI) rules. Standard power needs automated frequency coordination | Optional Tier A |
| LoRa 902–928 MHz ISM | Part 15 (§15.247) | Hopping systems: minimum channel counts, and for narrow channels an average dwell ≤ 0.4 s per channel in 20 s. Up to 1 W conducted with antenna-gain limits. LoRaWAN US915 dwell rules restrict data rates (about 11-byte payloads at the slowest US rate) | Tier B text relay |
| Bluetooth / BLE (2.4 GHz) | Part 15 | Typically ~10 m (Class 2, ~2.5 mW), longer with the BLE 5 Coded PHY | Device pairing, short handoff |
| Amateur radio | **Part 97** | **Every operator must be licensed.** **Messages encoded to obscure their meaning are prohibited (so no encryption).** Communications for pecuniary interest or on behalf of an employer are prohibited, with narrow exceptions | **Not a THYLORA transport.** THYLORA may *teach* licensing and point to organised volunteer emergency groups. It may never route THYLORA private or commercial traffic over amateur frequencies |
| FRS / GMRS | Part 95 | FRS needs no licence but has power and short-data limits. GMRS needs a licence (no exam). Mainly voice | Education only; not integrated |

**General Part 15 conditions** (§15.5 and related): an unlicensed device must not cause harmful interference and must accept any interference received. It must be an FCC-certified model, operated as certified, with no modified antennas or power beyond the grant. THYLORA can therefore promise nothing about the availability of these bands.

### 2.4 Throughput realities (summary)

| Path | Realistic useful rate | Carries |
|---|---|---|
| Earth internet (ONLINE) | Mbit/s to Gbit/s, provider-dependent | Everything |
| Tier A Wi-Fi LAN hub | Tens of Mbit/s shared per hub (802.11 real-world, ESTIMATE) | App shell, pack, messages, local board, small images |
| Tier B LoRa, SF7 | ~5.5 kbit/s raw, ~1.9 short msgs/s per channel max (E-6, E-7) | Short text, check-ins |
| Tier B LoRa, SF12 | ~0.29 kbit/s raw | A few words, rarely |
| BLE | Hundreds of kbit/s, metres of range | Pairing, device-to-device pack handoff |
| Device-only | 0 | Nothing leaves the device |

### 2.5 Energy (NO-POWER boundary)

**E-9 · Battery runtime** (PHYSICAL LAW, energy conservation, with ENGINEERING derates)

`t_h = (V_nom · Q_Ah · η_DoD · η_conv) / P_avg_W`

- `t_h` is the runtime in hours.
- `V_nom` is the battery nominal voltage in V. `Q_Ah` is its capacity in ampere-hours.
- `η_DoD` is the usable depth-of-discharge fraction, unitless from 0 to 1.
- `η_conv` is the DC-DC or inverter efficiency, unitless from 0 to 1.
- `P_avg_W` is the average load in watts.
- **Assumptions:** constant load, temperature near 25 °C, and the capacity is not degraded by age.
- **Failure:** cold weather, aged cells, load spikes.
- **Worked example (Tier A hub, ESTIMATE):** a 12.8 V × 100 Ah LiFePO4 battery with η_DoD 0.9 and η_conv 0.9 stores 1,036.8 Wh. A 7 W single-board computer plus access point (an ESTIMATE to be measured on real hardware) gives t = 1,036.8 / 7 = **148.1 h ≈ 6.2 days** with no solar input. Solar extends this, and the panel sizing is a site quote.
- A phone's Device-Only runtime depends on the phone. THYLORA does not control it and does not promise it.

**E-8 · Hash-chained audit** (FORMAL SYSTEM LAW)

`h_n = SHA256( h_(n−1) ‖ c(r_n) )`, with `h_0` = a published genesis constant.

- `h_n` is the 256-bit digest after row n.
- `‖` is byte concatenation. `c( )` is canonical JSON serialization (RFC 8785).
- `r_n` is audit row n, where n is an integer ≥ 1.
- **Threshold:** verification recomputes the chain, and any mismatch at row k proves tampering at or before k.
- **Assumptions:** SHA-256 collision resistance holds.
- **Failure:** if the attacker also rewrites the chain, the daily RFC 3161 anchor detects it.
- **Worked example:** if row 7 is edited after anchoring, `h_7` changes, so every `h_8…h_n` changes, and the anchored `h_n` for that day no longer matches. Tamper detected.

---

## 3 · SOCIAL: capabilities proven by existing simulations and games

**Method:** for each title, record only the **function** it demonstrates, the **gap** in how it does it, and **THYLORA's own implementation**. No art, names, characters, mechanics text, UI or other IP is copied. Titles are named only to cite the evidence that a function is possible. Game facts are as publicly documented; entries marked "reported" should be checked before any public use.

| # | Title (evidence only) | Function it proves possible | Gap in that implementation | THYLORA's own implementation (PROPOSED) |
|---|---|---|---|---|
| 1 | The Sims | Autonomous agents driven by needs, with households, relationships and careers, can hold attention for decades | Relationships squeeze history into meters. People don't persist beyond one save. The economy is a closed loop with little scarcity or law | Persistent persons with **event-sourced relationship edges**: every edge stores the events that created it, with provenance. `THY-NAMING-SOCIAL-GRAPH-001` (no isolated nodes) is enforced as a data constraint |
| 2 | SimCity / Cities: Skylines | City-scale infrastructure networks (power, water, transit) and budgets create feedback people understand. Individual trips can be simulated | Citizens are disposable. No institutions, courts or politics. Failures are mostly cosmetic | Infrastructure as registries (`THY-INFRA-POWER-MESH-001`, `-COMM-MESH-001`) with **outage simulation**. EdereAirah districts show the same four-state degradation as §2, which ties story to Layer 14 |
| 3 | EVE Online | A single-shard player economy with regional markets, production chains, destruction as a money sink, a published monthly economic report and a staff economist can run for 20+ years | Scams are permitted as gameplay. Botting and real-money trading persist. Wealth concentrates. A paid item links purchases to game currency (one-way) | A **monthly REE Economic Report** from the world ledger (money supply M, velocity, faucets and sinks, Gini) published by `INST-FINANCIAL-REGULATOR-001` (name OPEN). Fraud is a crime inside the world, not content. The REE purchase question is a Chairman decision (D-H-01) |
| 4 | Second Life | User-generated goods with creator-retained IP, land and an in-world currency can sustain real creator businesses | The official exchange to real money created regulatory burden (the operator is reported to hold money-transmitter licences). Unregulated in-world "banks" collapsed in 2007–08, after which the operator banned in-world banks lacking real-world charters | **REE has no exchange to Earth money** (§4.3). World banks (`INST-PERSONAL-BANK-001`, `INST-BUSINESS-BANK-001`) exist only as simulation institutions under a simulated regulator. Earth creator income flows only through Earth ledgers (`rael_*`) |
| 5 | Roblox | Mass UGC platforms with creator payouts work at scale | A very young user base raises safety and fairness critiques about how young creators are paid. Moderation at scale is hard. Payouts run through the game currency | Creator earnings are **Earth-money royalties** through `rael_revenue_events` → `rael_ledger_entries` with the rights gate first, **never** through a simulation currency. Minors' accounts get stricter defaults (Layer 4) |
| 6 | Minecraft | Open-ended building and UGC. **Self-hosted servers and LAN play prove multiplayer works without the internet** | The economy is not native (it comes from plugins). Every server is its own moderation island | The **Tier A LAN hub** (Layer 15) is exactly this pattern: a local signed server hosting the shell, pack and board. The THYLORA pinned key prevents "anyone's server" spoofing |
| 7 | Animal Crossing | A real-time calendar-driven world. Seasonal life. A perishable commodity with volatile prices teaches markets gently | Players built **off-platform** trading queues and sites because the in-game exchange was missing. Players advanced the clock to exploit timers | An **authoritative server world clock** (device clock untrusted, as in E-1). Perishable goods and time-limited assets in the EdereAirah market. Exchange happens **inside** `INST-MARKET-VENUE-001` (name OPEN), so trade does not leak into unregulated side channels |
| 8 | Stardew Valley | Production chains (raw → processed goods), relationships built through gifts and events, and community restoration goals | Single player. Prices fixed. No scarcity or suppliers | Mirror of the Earth supplier bridge (Lane D). World farms and makers correspond to the `thylora_farmer_candidates` / `thylora_food_provenance_chain` **method**. Provenance is shown, never faked |
| 9 | RuneScape Grand Exchange | A central order-matching exchange with price guidance and per-item buy limits can replace chaotic player-to-player trading | Coordinated groups manipulate thin items. Early price bands frustrated legitimate trades | An `INST-MARKET-VENUE-001` **limit order book** with published rules, position limits, circuit breakers and surveillance flags (§4.2) |
| 10 | Dwarf Fortress | Generated worlds with deep history. Persistent individuals with personality, memories and relationships produce emergent stories | Opaque to users. Very expensive to compute. Hard to read | "World state before camera state" (existing rule). **Event-sourced histories** readable as timelines. Every person or institution record can answer "what happened before the camera saw it" |
| 11 | Crusader Kings III | Families and dynasties, inheritance, and traits across generations drive long-running stories | Aristocracy-centred. People treated as optimization pieces | Family records (`family_story_archives`) with **consent per subject** (`rael_consents`). Real Earth families are never simulated without consent (Lane D rule on the Peete family) |
| 12 | Ultima Online (historical) | Early online worlds showed that money faucets without sinks cause inflation, and that a planned autonomous ecology can be destroyed by players | The economy was patched reactively | The **faucet/sink ledger** is designed from day one (§4.2, E-10). Every REE issuance names its faucet code, and every burn names its sink code |

**Coverage check (functions the directive lists → where they are proven → the THYLORA row):** relationships (1, 10, 11); jobs (1, 8); economies (3, 12); cities (2); families (1, 11); markets (3, 7, 9); UGC (4, 5, 6); virtual goods (4, 5); reputation (3: standings; 4: ratings) → see below; businesses (3: corporations; 4: storefronts; 5: studios). **10 / 10 functions covered.**

**Reputation (THYLORA's own implementation, PROPOSED):**
- No single global popularity score.
- Reputation is a set of **attestations**, each with issuer, subject, claim, evidence link, date and expiry. Examples: "supplier passed facility check 2026-10-02", "creator rights gate passed ×14", "0 upheld takedowns".
- Attestations are signed and shown with their evidence. A negative attestation needs evidence plus an appeal path, reusing `rael_appeals`.
- World reputations (inhabitants, world businesses) and Earth reputations (real suppliers and creators) are stored in separate namespaces and never mixed.

---

## 4 · MARKETS

### 4.1 Earth-market dashboard = real external market-data adapter (READ-ONLY)

- **What it is:** a Layer 12 adapter named `earth_market_data`, with direction READ and money_class NONE. It displays quotes, indices and end-of-day data from a **licensed** vendor.
- **Licensing:** exchange data is licensed. Vendor agreements distinguish display from non-display use and professional from non-professional subscribers, and they set redistribution rights. Delayed data (commonly **15 minutes** for US equities, depending on exchange policy) is usually cheaper and simpler to redistribute. Real-time redistribution usually needs exchange agreements and per-user fees. **A real quote is needed.**
- **Candidate vendors (quote needed, none chosen):** Nasdaq Data Link, Twelve Data, Finnhub, Polygon.io (verify current brand and terms), Alpha Vantage. Research connectors that Claude can use in this environment are **not** a THYLORA redistribution licence and are **not** used as the feed.
- **Every figure is displayed with:** source, delay ("delayed ≥ 15 min" or the exact figure), `as_of` timestamp, currency, and a fixed notice: "Information only. Not investment advice. THYLORA is not a broker, dealer or investment adviser."
- **Does not:** place orders, route orders, hold customer securities, rank securities "for you", or send personalized buy/sell alerts. Each of those raises registration questions (§5.4, Q-S-1).
- **Offline:** shows the last snapshot stamped "STALE since hh:mm". It never interpolates.
- **Story use (allowed):** the EdereAirah newsroom may *report on Earth* only as Earth, labelled as Earth data and never as world data.

### 4.2 EdereAirah market = simulation ledger / exchange

- **Governance:** `INST-MARKET-VENUE-001` operates the venue and `INST-FINANCIAL-REGULATOR-001` supervises it, both with names OPEN. `INST-ROYAL-TREASURY-001` is the only REE issuer (faucet). All of this is world canon structure that already exists. Its rules below are PROPOSED.
- **Data:** builds on `thylora_world_market_*` (companies = 6 rows; columns UNVERIFIED). Proposed new tables are `thylora_world_market_orders`, `…_trades` and `…_positions`, and `thylora_world_ree_faucet_sink_log` (Backend Change Packet).
- **Mechanism:** a limit order book with price-time priority. Tick size and lot size are per-instrument and set by the venue. Circuit breaker: halt when the price moves beyond ±x% within t minutes (the venue sets x and t, and the values are UNKNOWN). Per-account position limits. All trades settle in REE minor units on the world ledger (domain `W-REE`).
- **Economics:** the money supply is tracked by E-10. Every issuance and burn is coded.

**E-10 · REE money-supply identity** (FORMAL SYSTEM LAW: accounting identity of the world ledger)

`M_t = M_(t−1) + F_t − K_t`

- `M_t` is the REE in circulation at the end of period t, in REE minor units: an integer ≥ 0.
- `F_t` is the total faucet issuance in period t, for example treasury grants, world payroll funding or the Business Factory start grant. Faucet codes are PROPOSED.
- `K_t` is the total sink burns in period t, for example world taxes, fees, destruction or decay.
- `t` indexes periods (PROPOSED: calendar month).
- **Threshold:** the regulator publishes a target band for M growth. Its values are UNKNOWN and not guessed.
- **Assumptions:** only `INST-ROYAL-TREASURY-001` issues, and every burn is logged.
- **Failure:** any REE created outside a faucet code breaks the identity. The nightly check would fail and page the regulator desk.
- **Worked example (illustrative):** M = 1,000,000, F = 50,000, K = 30,000 gives M_t = **1,020,000**, a growth of 2.0%.

### 4.3 Hard type-level separation (simulated vs Earth money)

**The separation, stated as types:**

```
EarthMoney   = { amount_minor: int64 ≥ 0, currency: EarthCurrency }   EarthCurrency ∈ ISO 4217 ALLOWLIST (e.g. USD) — REE ∉
SimMoney     = { amount_minor: int64 ≥ 0, currency: SimCurrency }     SimCurrency   ∈ { REE } (and R only if D-H-03 says it is distinct)
LoyaltyPoints= { points: int64 ≥ 0, program: LoyaltyProgram }         no currency field at all
```

**Enforced at four levels:**
1. **Database domains:** `earth_currency_code` (CHECK against an allowlist table) and `sim_currency_code` (CHECK `IN ('REE')`) are **different Postgres domains**. An Earth ledger column is typed with the Earth domain, so `REE` cannot be inserted. This fixes F-H-01.
2. **Different schemas and roles:** Earth ledgers live in one schema and world ledgers in another. The role that writes world ledgers has **no** grant on Earth ledgers, and the reverse also holds.
3. **One transfer function, one matrix:** `ledger_transfer(from_domain, to_domain, …)` refuses any pair that the matrix (§5.2) does not mark ALLOWED, or REQUIRES_REVIEW with an approval ID attached. Every row from `W-REE` to an Earth domain is FORBIDDEN, so **no code path from simulated to Earth money exists**.
4. **Client types:** in JS, the two kinds of money are separate classes (`EarthMoney`, `SimMoney`) with no conversion method. `formatMinor()` (existing) takes only Earth currency. A new `formatRee()` never prints `$` or any Earth currency symbol.

**What "REE reference parity" is:** a published, fixed **explanatory ratio** between REE and USD (record `THY-DS-REE-USD`, OPERATIONAL / REFERENCE_PARITY_APPROVED). It lets people understand world prices in familiar terms. Its numeric value was **not** in the recovered state and is **not** guessed here.

**What it is not:**
- It is not an exchange rate.
- It is not a redemption promise ("Earth cash redemption remains disabled by design").
- It is not legal tender.
- It is not a valuation of anyone's holdings.
- It is not a basis for tax, payout, credit or collateral.
- It is not usable in any Earth ledger computation.
- **Display rule:** it appears only as a labelled footnote: "Reference only; not redeemable; not money."
- **Code rule:** the parity constant exists only in display code and cannot be imported by any ledger module (enforced by a lint rule and a test, both PROPOSED).

---

## 5 · BANKING: separate ledgers

### 5.1 Ledger domains

| Code | Ledger | Legal nature (Earth) | Who holds the value | System of record | THYLORA mirror |
|---|---|---|---|---|---|
| **E-OPS** | Earth operating money | The company's own funds (bank deposits) | The THYLORA Earth entity's bank. The entity and bank are UNKNOWN to this lane | Bank statements | Proposed Earth GL (not built) |
| **E-PROC** | Payment-processor clearing | Funds held by the processor pending payout to the merchant. Lemon Squeezy acts as merchant of record, so tax and remittance sit with it. Shopify Payments pays out to the merchant | The processor | Processor dashboard / API | `rael_revenue_events` (`processor`, `processor_reference`) |
| **E-CREDIT** | Store credit / gift cards (Earth-denominated) | Prepaid stored value: a **liability** owed to the customer | THYLORA (or the processor's gift-card system) | Shopify gift cards or the processor's system (decision OPEN) | Proposed `thylora_store_credit_journal` |
| **E-ROY** | Royalties and creator earnings payable | Amounts owed to creators and licensors under a split policy | THYLORA until paid | `rael_ledger_entries` / `rael_payouts` (written, not applied) | Same |
| **E-SUP** | Support funds (Back-to-Buy beneficiary shares) | Amounts **restricted** to a named beneficiary under a disclosed share. The legal characterization (donation, commercial co-venture, or contractual share) is a counsel question | THYLORA as holder for the beneficiary, until paid | `rael_ledger_entries` (party `BENEFICIARY`) + `rael_family_partnerships` | Same |
| **E-RES** | Reserves (refund, chargeback, tax, payout float). "Escrow" here means internal restriction, **not** a licensed escrow service | Company funds earmarked by policy | THYLORA's bank (a sub-account, or a GL earmark) | Bank + GL | Proposed `thylora_reserve_journal` |
| **W-REE** | EdereAirah simulation currency | **Not money on Earth.** A simulation record with no redemption | The world ledger (world institutions: `INST-*`, names OPEN) | `thylora_bank_*` / world ledger (columns UNVERIFIED) | Same |
| **W-LOO** | Loyalty / reward points (`thy_loochy_*`) | Promotional points with no cash value, if the design holds. The legal character depends on how points are earned and redeemed | THYLORA program | `thy_loochy_*` (columns UNVERIFIED, F-H-05) | Same |

### 5.2 Transfer matrix (FROM row → TO column)

Every cell is ALLOWED (**A**), FORBIDDEN (**F**) or REQUIRES_REVIEW (**R**), followed by a reason code. **R** means the transfer may run only when an approval record exists: two-person approval (Chairman or designated finance approver, plus a second reviewer), with evidence attached (INV-H-12). Diagonal cells are transfers within the same domain.

| FROM ↓ / TO → | E-OPS | E-PROC | E-CREDIT | E-ROY | E-SUP | E-RES | W-REE | W-LOO |
|---|---|---|---|---|---|---|---|---|
| **E-OPS** | A r1 | R r2 | R r3 | A r4 | R r5 | A r6 | F r7 | R r8 |
| **E-PROC** | A r9 | F r10 | R r11 | A r12 | A r13 | A r14 | R r15 | A r16 |
| **E-CREDIT** | A r17 | F r18 | R r19 | A r20 | R r21 | F r22 | F r23 | F r24 |
| **E-ROY** | R r25 | F r26 | R r27 | R r28 | R r29 | A r30 | F r31 | F r32 |
| **E-SUP** | F r33 | F r34 | R r35 | F r36 | R r37 | A r38 | F r39 | F r40 |
| **E-RES** | R r41 | A r42 | R r43 | A r44 | A r45 | A r46 | F r47 | F r48 |
| **W-REE** | F r49 | F r50 | F r51 | F r52 | F r53 | F r54 | A r55 | F r56 |
| **W-LOO** | F r57 | F r58 | R r59 | F r60 | F r61 | F r62 | R r63 | R r64 |

**Totals: ALLOWED 17 · FORBIDDEN 28 · REQUIRES_REVIEW 19 · 64 cells.**

**Reasons:**
- **r1** Moves between THYLORA's own bank accounts, journaled with dual control.
- **r2** Funding a processor balance (for example a negative balance after refunds) is rare and needs finance approval.
- **r3** Issuing goodwill credit creates a customer liability, so it needs a written policy and approval.
- **r4** Only to fund an **existing PAYABLE** entry created by `rael_settle_revenue_event`, never an arbitrary amount.
- **r5** A discretionary company contribution to a beneficiary raises disclosure, tax and charitable-solicitation questions.
- **r6** Setting aside reserves is prudent and policy-driven.
- **r7** Earth money never becomes simulation currency directly.
- **r8** Company-funded promotional points raise promotion and sweepstakes questions.
- **r9** Processor payout to the bank, reconciled by `processor_reference`.
- **r10** No direct rail between processors. Movement goes through the bank, and a shortcut would break reconciliation.
- **r11** Selling stored value is regulated (gift-card and prepaid-access rules), so it needs counsel sign-off before launch.
- **r12** Creator share through the existing settlement function (`allocate()`, remainder to people first).
- **r13** Beneficiary share declared **before publication** (existing `FAMILY_PARTNERSHIP` rule), following Lane D's `B = N × s`.
- **r14** Holdback for refund, chargeback and tax by published policy.
- **r15** **Buying REE with Earth money is not decided** (D-H-01). It stays blocked by default. If ever approved, in-world wagering must be re-reviewed (Q-G-1).
- **r16** Points issued on purchase at a published earn rate. No money moves, and points are never sold as a standalone item.
- **r17** Redeeming credit against a THYLORA order recognizes revenue.
- **r18** Credit cannot be pushed back into a processor as if it were a card payment. Refunds of gift-card purchases reverse the original processor event.
- **r19** Credit transferred between customers is person-to-person value transfer, which carries fraud and money-transmission-like risk.
- **r20** Creators are paid on sales made with credit. Settlement treats the redemption as gross with a processor fee of 0.
- **r21** Credit may be promotional in origin. Its paid origin must be traced before it funds a beneficiary.
- **r22** A liability cannot fund a reserve. Reserves are funded from E-OPS.
- **r23** Stored value with Earth value must not buy simulation currency.
- **r24** Converting escheatable stored value into points could look like avoiding unclaimed-property law.
- **r25** Clawback (for example after a refund) must be a visible, reasoned `rael_adjustments` row.
- **r26** Payouts go out through the payout rail, never back into a processor.
- **r27** A creator electing store credit needs recorded consent, and the credit becomes stored value.
- **r28** Reassigning earnings between creators needs rights and split evidence.
- **r29** A creator voluntarily giving a share needs recorded consent.
- **r30** Holds for unresolved tax, identity or rights (existing `HELD_*` states).
- **r31** Earth earnings are never converted to simulation currency.
- **r32** Earth earnings are never converted to points.
- **r33** Restricted beneficiary funds never return to operations, because that would be commingling.
- **r34** No rail exists for this.
- **r35** Paying a beneficiary in store credit could be exploitative, so it is reviewed and done only at the beneficiary's own choice.
- **r36** Beneficiary funds are not creator income.
- **r37** Reallocating between beneficiaries changes what donors were told, so it needs disclosure and approval.
- **r38** Hold until the beneficiary is verified or has consented, or for the refund window.
- **r39** Beneficiary funds never become simulation currency.
- **r40** Beneficiary funds never become points.
- **r41** Releasing a reserve back to operations after its window closes needs evidence that the window closed.
- **r42** Funding refunds or chargebacks that the processor debits.
- **r43** A refund issued as credit only at the customer's choice, and legal limits apply.
- **r44** Release held creator funds when the hold reason clears.
- **r45** Release held beneficiary funds once the beneficiary is verified.
- **r46** Reclassify between reserve buckets with a journal entry.
- **r47** Reserves never become simulation currency.
- **r48** Reserves never become points.
- **r49–r54** **Simulated wealth never becomes Earth money.** Redemption is disabled by design (`THY-DS-REE-USD`). This is the core invariant.
- **r55** In-world transfers under EdereAirah economics through the world institutions.
- **r56** World wealth never buys Earth loyalty value.
- **r57** Points have no cash-out.
- **r58** No rail exists for this.
- **r59** Redeeming points for a checkout discount is common, but creating a credit *balance* from points creates stored value.
- **r60** Points never become creator income.
- **r61** Points cannot be "donated" as if they had cash value. A company-funded match would be an E-OPS → E-SUP transfer instead.
- **r62** Points never fund reserves.
- **r63** Points earned from Earth purchases converting into REE would be an indirect Earth → REE path, so it is tied to D-H-01.
- **r64** Point transfers between users create a secondary market.

**Matrix properties:**
1. The W-REE row has 7 of 8 cells FORBIDDEN, and the only A is W-REE → W-REE. So simulated money has **no outbound edge** into any Earth ledger.
2. Every path *into* W-REE from an Earth-linked domain is F or R, and all the R cells are bound to D-H-01.
3. E-SUP never flows back to E-OPS.

### 5.3 Ledger-separation invariants (PROPOSED, each testable)

| ID | Invariant | Enforced by |
|---|---|---|
| INV-H-01 | No simulation currency code can be stored in an Earth-money column | Separate Postgres domains plus an ISO 4217 allowlist table |
| INV-H-02 | No journal line moves value from `W-REE` or `W-LOO` into any `E-*` domain | The matrix (r49–r62) plus `ledger_transfer()` refusing the pair plus a CI test |
| INV-H-03 | For each journal and currency, Σ debits = Σ credits | Deferred constraint trigger |
| INV-H-04 | All amounts are `bigint` minor units. No `numeric` fractions, no floats | Column types plus lint |
| INV-H-05 | Posted journal lines are append-only. Corrections are reversing entries | `REVOKE UPDATE, DELETE` plus trigger |
| INV-H-06 | REE is never rendered with an Earth currency symbol, and the parity appears only as a labelled reference | `formatRee()` plus UI test |
| INV-H-07 | The E-SUP balance per beneficiary is ≥ 0 and ≥ the sum of that beneficiary's HELD plus PAYABLE entries | Check on journal post |
| INV-H-08 | PAID requires a date, a reference and evidence | Existing `rael_payout_paid_needs_evidence` plus `markPaid()` |
| INV-H-09 | No Earth-money state change without a server acknowledgement (never offline) | Outbox class `EARTH_MONEY` is never applied locally |
| INV-H-10 | The `rael_*` currency check is replaced by the Earth allowlist domain | Migration in the packet (fixes F-H-01) |
| INV-H-11 | `W-LOO` has no redemption to cash or to Earth value | Matrix r57, plus a program terms review |
| INV-H-12 | Every REQUIRES_REVIEW transfer carries an approval ID with two distinct approvers | FK to `thylora_ledger_transfer_approvals` |
| INV-H-13 | REE supply identity E-10 holds every night | Scheduled check that pages the regulator desk |
| INV-H-14 | The parity constant cannot be imported by ledger modules | Lint rule plus test |

### 5.4 Regulatory flags: **questions for counsel, not conclusions**

Owner for all of the following: **Earth counsel, UNASSIGNED.** The Chairman must engage counsel (D-H-04). The world legal department (`DEPT-LEGAL-COMP-001`) holds EdereAirah canon personnel, **not** Earth-licensed lawyers, and must not be presented as Earth legal advice.

| Q-ID | Topic | Question |
|---|---|---|
| Q-MT-1 | Money transmission | Does holding E-SUP beneficiary shares and E-ROY creator payables and paying them out make THYLORA a money transmitter under state law, or a money services business under FinCEN rules (31 CFR 1010.100(ff))? Does an agent-of-payee exemption or a processor's licence (for example a Connect-type payout product) cover it? |
| Q-MT-2 | Money transmission | Would customer-to-customer credit transfer (r19) or point transfer (r64) change that answer? |
| Q-SV-1 | Stored value / gift cards | If E-CREDIT is sold, which rules apply (federal gift-card rules under the CARD Act / Regulation E §1005.20 on expiry and fees; FinCEN prepaid-access rules; state cash-redemption requirements such as small-balance cash-out)? |
| Q-SV-2 | Stored value | Is goodwill credit (free, promotional) treated differently from purchased credit? |
| Q-ES-1 | Escheat | Which states' unclaimed-property rules apply to unredeemed E-CREDIT, uncashed creator payouts (E-ROY) and unclaimed beneficiary funds (E-SUP), including priority rules by owner address and state of incorporation? |
| Q-ES-2 | Escheat | Are loyalty points (W-LOO) exempt given no cash value, and does any design choice (r24, r59) change that? |
| Q-KY-1 | KYC / AML | What identity verification, tax forms (W-9 / W-8BEN), information returns (1099-NEC / 1099-K; the thresholds have changed recently, so verify) and sanctions (OFAC) screening are required before creator or beneficiary payouts? Can the processor's KYC be relied on? |
| Q-CH-1 | Charitable solicitation | Is Back-to-Buy (a disclosed percentage of a sale to a named person or family) a **commercial co-venture** requiring registration or disclosures in some states? Does paying an individual rather than a charity change the analysis? What disclosure wording is required? |
| Q-G-1 | Gambling | In-world wagering exists (`app/sports-betting.html`, "R currency"). If Earth money can ever acquire REE (r15, r63), does the in-world wagering become gambling or a "thing of value" under some state laws (courts have treated purchasable virtual chips as things of value)? Is it safe while REE is unpurchasable? |
| Q-S-1 | Securities / advice | Does the Earth-market dashboard (§4.1), as designed with no recommendations and no orders, avoid investment-adviser, broker-dealer and publisher-exclusion issues? Would any REE instrument that could be bought with Earth money raise investment-contract questions? |
| Q-PR-1 | Promotions | Do loyalty point earn rules or any prize mechanics trigger sweepstakes or contest rules? |
| Q-CP-1 | Consumer protection | Are the parity footnote, the support-percentage disclosure and the "not redeemable" wording adequate under FTC Act §5 and state unfair-practices law? |
| Q-KD-1 | Children | For users under 13 (the kid-learning derivatives), which COPPA obligations apply to messaging, UGC and points? |
| Q-RF-1 | Radio | Does operating Tier A and Tier B hubs on third-party premises create any Part 15 operator obligations beyond using certified equipment? Are there local permits for rooftop nodes? |
| Q-LI-1 | Licences | If THYLORA uses AGPL or GPL components (libsignal, Meshtastic-class firmware), what are the distribution obligations? |

---

## 6 · Dependency map, staged build plan, costs, risks, monetization

### 6.1 Dependency map (text graph; `A ──▶ B` means B depends on A)

```
[L11 Security/Audit] ──▶ everything that writes
[L1 Identity (passkey+device key)] ──▶ L2 local store unlock ──▶ L14 DEVICE_ONLY usable
[L3 Naming (content hash + signed manifest)] ──▶ L5 Essential Pack ──▶ L14 degraded reading
                                            └─▶ L15 Tier A hub trust (pinned key)
[L13 Backup/Recovery] ──▶ L8 ledgers applied (never apply money tables with no restore drill)
[F-H-01 fix: currency domains] ──▶ L8 ledgers applied ──▶ L7 real-money checkout witness ──▶ E-ROY / E-SUP payouts
[D-H-01 REE purchase decision] ──▶ matrix r15/r63 ──▶ Q-G-1 wagering review ──▶ W-REE public launch
[Counsel engaged (D-H-04)] ──▶ Q-MT/Q-SV/Q-ES/Q-CH answers ──▶ E-CREDIT launch, E-SUP payouts
[L4 MLS messaging] ──▶ L15 Tier A relay ──▶ L15 Tier B short text
[L12 adapter contract] ──▶ L9 Earth-market dashboard (plus vendor licence quote)
[thylora_world_market_* column read] ──▶ L9 EdereAirah exchange tables
[RAE Link migrations applied (existing blocker)] ──▶ L6 offline social, L10 C2PA manifests
[F-H-02 SW fix] ──▶ L2 offline store ──▶ every DEVICE_ONLY row in §2.1
```

### 6.2 Staged build plan

| Stage | Name | Entry criteria | Work | Exit criteria (all must be witnessed) |
|---|---|---|---|---|
| **S0** | Guards and truth | This file accepted by the Chairman | Registry rows (packet §8), the currency-domain migration drafted, the transfer matrix as a table, the invariant test suite (INV-H-01…14), and the SW v10 spec | Invariant tests run in CI and fail against the current `^[A-Z]{3}$` check (a proof test), then pass after the migration on a validation DB. No production write |
| **S1** | Backup and audit baseline | S0 exit. `backups` capability chosen (D-H-07) | 3-2-1 backups and a hash-chained audit table with RFC 3161 anchoring | **One full restore drill** recorded with timings: RPO and RTO measured against target. Chain verification passes |
| **S2** | Offline shell | S0 exit | SW v10 (static-only caches), the encrypted local store, the outbox, the heartbeat state machine and the Essential Pack v1 | On a phone in airplane mode, rows 2, 3, 4, 5, 6, 9, 11, 13 and 15 of §2.1 behave as specified. After sign-out, no user data remains in Cache Storage (F-H-02 test) |
| **S3** | Ledger separation live | S1 exit. Counsel engaged for Q-MT-1 and Q-SV-1 (answers are not needed to *apply* the tables, only to *launch* payouts or credit) | Apply the `rael_*` migrations with the currency domain, the Earth GL mirror, `ledger_transfer()` and the approvals table | All 64 matrix cells tested: 17 succeed, 28 are refused, and 19 are refused without approval and succeed with one. SQL and JS settlement parity still identical |
| **S4** | Identity hardening | S2 exit | Passkeys and device key pairs, signed offline intents | A device enrolled and then taken offline unlocks and signs, and the server verifies the signatures on reconnect. Lost-device revocation witnessed |
| **S5** | Secure messaging | S4 exit | MLS via OpenMLS/WASM, the delivery service, the report flow | 1:1 and group of 5 delivered. The server stores ciphertext only (verified by DB inspection). The state labels are accurate |
| **S6** | Markets | S3 exit (world). Vendor quote accepted (Earth) | EdereAirah order book, faucet/sink log, E-10 nightly check. Earth adapter with delay disclosure | 1,000 simulated trades reconcile to zero drift in E-10. The Earth dashboard shows source, delay and as_of on every figure, and has no order capability |
| **S7** | LAN hub pilot (Tier A) | S2, S4 and S5 exit. Pilot site and owner consent (D-H-06) | One hub with a certified AP, mDNS discovery, a signed manifest, pack serving and message relay | With the Earth internet unplugged at the site, rows 3, 7, 9 and 10 (local board) work. An untrusted hub is refused. Battery runtime measured against E-9 |
| **S8** | LoRa text pilot (Tier B) | S7 exit. Q-RF-1 answered. Certified hardware only | 3–5 elevated nodes with a short-text bridge to the hub | Delivery rate and latency measured over 14 days. Link margins measured against E-3 and E-5. No encryption on any amateur band (none used) |
| **S9** | Gateways and social offline | S3 exit. RAE Link migrations applied | Adapter circuit breakers, offline feed, C2PA signing | C2PA manifest verifies in a public validator. A tripped circuit shows the correct degraded UI |

**Stage list:** S0 Guards and truth · S1 Backup and audit baseline · S2 Offline shell · S3 Ledger separation live · S4 Identity hardening · S5 Secure messaging · S6 Markets · S7 LAN hub pilot · S8 LoRa text pilot · S9 Gateways and social offline.

### 6.3 Costs (all ESTIMATE; basis stated; **real quotes needed** where marked)

| Item | Estimate | Basis | Quote needed? |
|---|---|---|---|
| S0–S2, S4 engineering | Internal session work; no cash outlay | Repo-only work of the kind already done in WR-RAELINK-001 | No |
| Supabase plan with PITR | Tens to low hundreds of USD per month | Public plan and add-on pricing seen in mid-2020s; varies by plan and retention | **Yes** (check the current pricing page) |
| Second-provider cold storage for dumps | < $5 / month at a few GB | Object storage list prices of roughly $0.005–0.023 per GB-month | Confirm |
| RFC 3161 timestamping | $0 (free public TSAs) to low hundreds per year (commercial) | Public TSAs exist. A commercial SLA costs money | Optional |
| C2PA signing certificate | Hundreds to low thousands USD per year | Code- and document-signing certificate market | **Yes** |
| Earth-market data, delayed and display-only | ~$0–$200 / month | Retail developer tiers of data vendors | **Yes**, and redistribution terms must be read |
| Earth-market data, real-time redistribution | Thousands USD per month or more, plus per-user exchange fees | Exchange data policies | **Yes** (do not start here) |
| Tier A hub (one site) | ~$250–$450 hardware + ~$300–$600 battery | SBC + case + SSD + certified AP (~$250–450). 12.8 V 100 Ah LiFePO4 (~$300–600 retail) | **Yes** |
| Tier B LoRa nodes | ~$40–$80 per board + antenna. Solar and enclosure ~$100–$200 per elevated node. 5 nodes ≈ $700–$1,400 | Retail prices for certified LoRa dev boards and small solar kits | **Yes** |
| Earth counsel (fintech + gambling + charitable solicitation opinion) | ~$5,000–$30,000+ | Typical scope for a multi-issue regulatory memo from specialized firms | **Yes** (largest unknown) |
| Security review / penetration test before payouts | ~$10,000–$40,000 | Typical external web and app test scopes | **Yes** |

### 6.4 Risks

| # | Risk | Likelihood / impact (heuristic) | Mitigation |
|---|---|---|---|
| R1 | REE is seen as convertible value, drawing gambling, securities or money-transmission scrutiny | Medium / High | Matrix row W-REE all F. D-H-01 stays blocked. Q-G-1 answered before any Earth → REE path |
| R2 | F-H-01 lets `REE` into Earth payout tables | High until fixed / High | S0 migration plus proof test |
| R3 | F-H-02 leaks one user's data to the next user of a shared device | Medium / High | S2 SW v10 |
| R4 | People rely on the mesh for emergencies | Medium / Severe | Never market it as emergency comms. Row 23 wording. Printed card |
| R5 | Spectrum violation from uncertified or modified radios | Low / High | Certified hardware only, Q-RF-1, no amateur-band traffic |
| R6 | Backups never restored | Medium / Severe | S1 exit requires a restore drill |
| R7 | Key loss locks users out of E2EE history | Medium / Medium | Multi-device MLS plus a clearly stated "history may not be recoverable" |
| R8 | Market-data licence breach | Medium / Medium | Adapter declares its licence. Delayed data only until a quote is accepted |
| R9 | Back-to-Buy treated as unregistered charitable solicitation | Medium / High | Q-CH-1 before the first public campaign |
| R10 | Overpromising "our internet" | High / Reputation | §1 L15 and §2 language. No global claims |
| R11 | Creator payout provider lock-in (HIGH exit cost) | Medium / Medium | Deliberate choice under D-H-05 |
| R12 | Naming drift (R vs REE, EdereAriah vs EdereAirah) confuses users and auditors | High / Low–Medium | D-H-03. Route the spelling correction to the file owners |

### 6.5 Items not NOW (NO NAKED LATER)

| Item | State | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|
| DIDs / Verifiable Credentials | QUEUED_WITH_DEPENDENCY | Lane H | A third party needs offline-verifiable THYLORA credentials | A named partner requests it in writing | Keep the VC 2.0 note. Revisit at S9 exit |
| Tier C wide-area comms | QUEUED_WITH_DEPENDENCY | Chairman VYC | An infrastructure partner (carrier, ISP, satellite) | Signed partner LOI | None until a partner is named. Tiers A and B proceed |
| REE purchasable with Earth money | APPROVAL_REQUIRED | Chairman VYC + Earth counsel | Q-G-1, Q-S-1, Q-MT-1 answers | Written counsel opinion + Chairman decision D-H-01 | Chairman decides whether to even ask counsel |
| E-CREDIT launch | HOLD_FOR_EVIDENCE | Lane D store + Earth counsel | Q-SV-1, Q-ES-1 | Counsel answer + S3 exit | Include in counsel scope (D-H-04) |
| Creator and beneficiary payouts | HOLD_FOR_EVIDENCE | Chairman VYC | `creator_payouts` provider (OPEN), Q-MT-1, Q-KY-1, S3 | Provider chosen + counsel answer + first real-money checkout witness > 0 | D-H-05 |
| Earth real-time market data | HOLD_FOR_EVIDENCE | Lane H | A vendor quote | Quote accepted and redistribution terms read | Request quotes from 2 or more vendors when the Chairman approves D-H-08 |
| LoRa pilot (S8) | QUEUED_WITH_DEPENDENCY | Lane H | S7 exit, Q-RF-1 | S7 witnessed | Draft the node bill of materials once S7 enters |
| Values of `C_dev`, E-10 target band, circuit-breaker x/t, REE parity value | UNKNOWN (world canon) | World economics owner (unassigned) under `INST-FINANCIAL-REGULATOR-001` | The Chairman assigns an owner | Chairman approval of values | D-H-09 |

### 6.6 Monetization (method / output / service / product; never the beneficiary)

| Path | What is sold | To whom | Ledger | Gate |
|---|---|---|---|---|
| **THYLORA Continuity plan** (subscription) | Essential Pack updates, encrypted device backup and export, family Outage Card generator | Families | E-PROC → E-OPS | S2 exit |
| **Neighbourhood Hub Kit** (store item) | Pre-configured certified hardware + setup guide (resale of certified gear, not a custom radio) | Community groups, small buildings | E-PROC | S7 exit + Q-RF-1 |
| **Hub installation and support** (service) | On-site setup, battery sizing (E-9), annual check | Businesses, churches, schools | E-PROC | S7 exit |
| **"Degrade, don't erase" audit** (consulting) | A §2.1-style capability matrix for another organization's app | Small businesses, nonprofits | E-PROC | Lane H method is portable now |
| **Ledger-separation module licence** | Currency domains, transfer matrix and invariant tests as a licensed package | Game and simulation studios, loyalty programs | Licensing → E-OPS | S3 exit + counsel on product claims |
| **Education** (course, PDF, video) | "How radios really reach" (E-2…E-7 explained), "Your family's outage plan", kid version with FSPL made visual | Families, teachers, students | E-PROC | Can start after the Chairman approves the outline |
| **EdereAirah Economy Reports** (media) | Monthly REE report as a story product (world newsroom) | Audience | RAE Link lanes | S6 exit |
| **Earth-market dashboard** (premium) | Only if the licence permits redistribution to paying users | Members | E-PROC | Vendor terms |
| **Free help** (not monetized) | The printed Outage Card template and the "what works offline" explainer | Everyone | — | Now (after S2 for the in-app version) |

---

## 7 · DEPARTMENT RETURN FORMAT (20 parts)

**1 · CURRENT TRUTH**
- **Earth:** THYLORA is a web app (`/app`, `/rae-link`, public site) on Vercel with a Supabase backend.
- **Online:** sign-in, commands and audit are VERIFIED.
- **Offline:** a service worker exists, but it caches every GET including authenticated API reads (F-H-02). There is no offline data store, no offline identity (session in `sessionStorage`), no private messaging, no mesh, and no applied payout ledger (RAE Link written, not applied). Real-money checkout witness = 0.
- **World:** EdereAirah canon has comms and power mesh blueprints, five financial institutions with OPEN names, and REE settlement with a reference parity to USD and redemption disabled.

**2 · WHAT WAS RECOVERED**
- The 5 `INST-*` codes.
- `THY-DS-REE-USD` status and wording.
- Both infra blueprints.
- `thylora_world_market_*` (6 companies) and `thylora_bank_account_types` (7).
- The RAE Link ledger primitives and their SQL constraints.
- Provider map states (`backups` OPEN, `creator_payouts` OPEN / HIGH exit).
- The `sw.js` behaviour, `sessionStorage` session use, the sports-betting currency wording, and the test suite at 48/48.

**3 · WHAT WAS CREATED**
- The 15-layer architecture.
- The four-state degraded-mode machine.
- The 24-function capability matrix.
- Ten equations (E-1…E-10) with MATH RULE annotations.
- The 12-title social capability study plus the reputation design.
- The Earth / world market designs.
- Type-level money separation.
- 8 ledger domains.
- The 64-cell transfer matrix.
- 14 invariants.
- 15 counsel questions.
- A 10-stage plan.
- Costs, risks and monetization.
- 5 findings (F-H-01…05).
- A Backend Change Packet.
All of it is PROPOSED.

**4 · NUMBERS / QUANTIFIED MOVEMENT**
- 15 / 15 layers specified.
- 24 functions × 4 states = 96 matrix cells stated.
- Matrix: 17 A / 28 F / 19 R = 64.
- 14 invariants. 10 equations with worked examples.
- FSPL at 2 km / 915 MHz = 97.69 dB.
- LoRa SF7 = 5,469 bit/s. A 50-byte text takes 97.5 ms on air, with at most ~1.9 msg/s per channel.
- The handheld radio horizon is 10.09 km.
- Hub battery runtime estimate: 148.1 h.
- 5 findings. 15 counsel questions.
- Tests: 48 / 48 pass (unchanged).

**5 · FILES / ASSETS / RECORD IDs**
- File: `/home/user/Thylora/workrooms/WR-PROD-FLOOR-001/LANE-H-NETWORK.md`.
- Proposed IDs:
  - `THY-NET-L01…L15`
  - `THY-LEDGER-DOM-{E-OPS, E-PROC, E-CREDIT, E-ROY, E-SUP, E-RES, W-REE, W-LOO}`
  - `THY-LEDGER-XFER-<FROM>-<TO>` (64)
  - `THY-LEDGER-INV-H-01…14`
  - `THY-MATH-NET-E01…E10`
  - `THY-DS-NETWORK-LANE-H`
- **No backend IDs were written.**

**6 · WHAT IS STILL UNKNOWN**
- The numeric REE parity value.
- Whether "R currency" = REE.
- Columns of `thylora_world_market_*`, `thylora_bank_*` and `thy_loochy_*`.
- The THYLORA Earth legal entity and its bank.
- The institution names (OPEN, not guessed).
- `C_dev`, the E-10 band and circuit-breaker parameters.
- Every counsel answer.
- Real hardware power draw.
- Vendor prices.

**7 · BLOCKERS**
- Counsel not engaged (blocks E-CREDIT, payouts, any Earth → REE path).
- `backups` provider OPEN (blocks S1).
- RAE Link migrations not applied (blocks S3 and S9).
- No backend write authority in this lane (by instruction).
- Pilot site not chosen (blocks S7).

**8 · SAFE WORK ALREADY CONTINUING**
- S0 can proceed in the repo without the Chairman: invariant tests, currency-domain migration draft, SW v10 spec, outbox schema. None of it touches production.
- This lane stopped at writing this file, as instructed.

**9 · CHAIRMAN DECISIONS NEEDED**
- **D-H-01:** may Earth money ever acquire REE? Default: NO.
- **D-H-02:** approve the separate-domain currency design (keep the code `REE` in a simulation domain).
- **D-H-03:** are "R currency" and REE the same?
- **D-H-04:** engage Earth counsel and approve its scope (§5.4).
- **D-H-05:** creator-payout provider.
- **D-H-06:** Tier A pilot site.
- **D-H-07:** backups provider.
- **D-H-08:** request Earth market-data quotes.
- **D-H-09:** assign a world-economics owner to set `C_dev`, the E-10 band and the parity value.

**10 · NEXT 3 ACTIONS**
1. S0: write the invariant test suite and the currency-domain migration against the validation DB (`db/rae-link/validation/run.sh` pattern), including a proof test that `REE` is accepted today and refused after.
2. S0: write the SW v10 spec and a test that asserts no API response enters Cache Storage.
3. Draft the counsel brief from §5.4 so D-H-04 can be executed the day it is approved.

**11 · HELP VALUE**
- Families keep their help library, their own records and their plans during an outage.
- A printed card covers no-power.
- Honest state labels stop people believing a message was sent when it was not.

**12 · EARTH VALUE**
- A reusable "degrade, don't erase" method for any app.
- A clear public explanation of why radios cannot give "free global internet" (E-2…E-7).
- A money-separation pattern that protects consumers of simulation games.

**13 · COMMERCE / MONEY PATH**
- Continuity subscription, Hub Kit, installation service, audits, ledger-module licensing, courses.
- All of it flows through E-PROC → E-OPS.
- Nothing is monetized from beneficiaries.

**14 · MEDIA / STORY PATH**
- In the world, a district going dark and degrading gracefully shows `THY-INFRA-COMM-MESH-001` in action. The monthly REE Economic Report is a recurring world-news segment.
- The Earth bridge is the explainer "how far can a radio really reach".

**15 · EDUCATION PATH**
- Kids: "the 6 dB rule" (double the distance, quarter the signal).
- Teachers: a lesson on the FSPL and Fresnel worked examples.
- Families: an outage-plan worksheet.
- Business: a ledger-separation primer.

**16 · SOFTWARE PATH**
S0 → S9 as staged: SW v10, local store, outbox, passkeys, MLS, ledger domains, transfer function, market engine, hub image.

**17 · STORE PATH**
- Printed Outage Card (free and premium versions).
- Neighbourhood Hub Kit (S7).
- Continuity plan (S2).
- Course and PDF bundle.
- Everything is placed under the "I NEED HELP", "I'M A PARENT" and "I RUN A BUSINESS" navigation (Lane D).

**18 · RISKS**
R1–R12 (§6.4). The top three are R1 (REE seen as convertible), R2 (F-H-01) and R3 (F-H-02).

**19 · EVIDENCE**
- Repo files read (listed in §0).
- `npm test` 48/48 on 2026-09-28.
- `00-RECOVERED-STATE.md` §2 and §4.
- The equations are recomputed and every worked example shows its arithmetic.
- Regulatory items are **questions** with no conclusions.
- Game facts are public-record summaries, and "reported" items are marked for re-check.

**20 · PERCENT COMPLETE (explicit denominators)**
- **(a) Lane H design packet:** 7 of 7 requested contents written: architecture, outage matrix + physics/law, social, markets, banking, dependency/stages/costs/risks/monetization, and return format + packet. **7 / 7 = 100% written; 0 / 7 Chairman-accepted = 0% accepted.**
- **(b) Lane H system build:** 30 acceptance checks, 2 per layer, of which 10 are verified today.
  - Verified: L1a sign-in, L3a canonical ID grammar, L6a pipeline code + tests, L7a P0 commerce proof, L8a integer ledger + SQL/JS parity, L9a world market registry exists, L10a rights/provenance schema, L11a audit command path, L12a provider map with alternates, L14b honest "not provisioned" degradation.
  - Not yet verified: L1b passkeys/device keys, L2a offline shell witnessed, L2b outbox, L3b content hashes, L4a E2EE, L4b store-and-forward, L5a server FTS witnessed by this lane, L5b offline pack, L6b RAE Link applied, L7b real-money checkout witness, L8b separation invariants enforced, L9b Earth market adapter, L10b C2PA, L11b hash-chained audit, L12b circuit breakers, L13a backups chosen, L13b restore drill, L14a state machine, L15a LAN hub, L15b LoRa pilot.
  - **10 / 30 = 33.3%.** Note that several of the verified items are "exists in repo or registry", not "deployed and witnessed in production".

---

## 8 · BACKEND CHANGE PACKET (not applied; this lane is not connected to the backend)

**Rules for whoever applies it:**
- READ FIRST.
- Every target table's columns are **`VERIFY_BEFORE_APPLY`**, because none of these tables' columns were read (`00-RECOVERED-STATE.md` §6).
- Do not overwrite newer rows.
- READ BACK after every write and record the IDs.
- Truth class for every row: **PROPOSED_DESIGN** unless stated.

### 8.1 Proposed new registry: `thylora_network_layer_registry` (does not exist; create only after Chairman acceptance)

Columns (proposed): `canonical_id text PK, layer_no int, layer_name text, world_ref text, earth_state text, exists_evidence text, design_ref text, standards text[], failure_mode text, degraded_behaviour text, never_rules text[], stage_ref text, truth_class text, blocker text, next_action text` — **VERIFY_BEFORE_APPLY** (new table, needs a migration with RLS read for authenticated users and write for service role only).

| canonical_id | layer_no | layer_name | earth_state | exists_evidence | stage_ref | blocker | next_action |
|---|---|---|---|---|---|---|---|
| THY-NET-L01 | 1 | Identity | PARTIAL | supabase-auth ACTIVE; THY-DS-CHAIRMAN-AUTH VERIFIED | S4 | session in sessionStorage (F-H-03) | passkey + device key spec |
| THY-NET-L02 | 2 | Local/offline-first | PARTIAL_DEFECT | app/sw.js caches all GETs (F-H-02) | S2 | F-H-02 | SW v10 spec + test |
| THY-NET-L03 | 3 | Naming/addressing | PARTIAL | canonical ID grammar; provider-relative storage keys | S2 | none | pack manifest format |
| THY-NET-L04 | 4 | Secure messaging | ABSENT | none | S5 | S4 | OpenMLS WASM spike |
| THY-NET-L05 | 5 | Knowledge/search/archive | PARTIAL | postgres-fts ACTIVE (provider map) | S2 | help_intake_index 0 rows (Lane G) | Essential Pack v1 contents with Lane G |
| THY-NET-L06 | 6 | Media/social | WRITTEN_NOT_APPLIED | RAE Link 40 tables written | S9 | migrations not applied | Chairman application of db/rae-link |
| THY-NET-L07 | 7 | Commerce | PARTIAL | THY-DS-P0-COMMERCE-PROOF VERIFIED; real-money witness 0 | S3 | real-money checkout witness | Lane D |
| THY-NET-L08 | 8 | Ledger/payments | WRITTEN_NOT_APPLIED | rael_* ledger; ledger.js parity | S3 | F-H-01; counsel | currency-domain migration |
| THY-NET-L09 | 9 | Market/exchange | PARTIAL | thylora_world_market_* 6 companies | S6 | columns unverified; vendor quote | read columns |
| THY-NET-L10 | 10 | Rights/provenance | WRITTEN_NOT_APPLIED | rael_rights_records, rael_provenance_events | S9 | migrations not applied; CA quote | C2PA mapping table |
| THY-NET-L11 | 11 | Security/audit | PARTIAL | THY-DS-AUDIT VERIFIED | S1 | none | hash-chain table spec |
| THY-NET-L12 | 12 | Earth gateways | PARTIAL | provider map 25 caps, 16 OPEN | S9 | OPEN capabilities | adapter contract fields |
| THY-NET-L13 | 13 | Backup/recovery | ABSENT | backups OPEN | S1 | D-H-07 | restore drill runbook |
| THY-NET-L14 | 14 | Degraded/offline mode | PARTIAL | BackendError.provisionRequired honesty | S2 | none | heartbeat endpoint spec |
| THY-NET-L15 | 15 | Mesh/local comms | ABSENT (Earth); BLUEPRINT (World: THY-INFRA-COMM-MESH-001) | none | S7/S8 | D-H-06; Q-RF-1 | hub BOM + quote |

### 8.2 Proposed new registry: `thylora_ledger_domain_registry`

Columns (proposed): `canonical_id, domain_code, name, money_class ('EARTH'|'SIMULATION'|'LOYALTY'), currency_domain ('earth_currency_code'|'sim_currency_code'|'none'), legal_nature, holder, system_of_record, mirror_table, counsel_questions text[], truth_class` — **VERIFY_BEFORE_APPLY**.

Rows: `THY-LEDGER-DOM-E-OPS` (EARTH) · `-E-PROC` (EARTH) · `-E-CREDIT` (EARTH) · `-E-ROY` (EARTH, mirror `rael_ledger_entries`) · `-E-SUP` (EARTH, mirror `rael_ledger_entries` party BENEFICIARY) · `-E-RES` (EARTH) · `-W-REE` (SIMULATION, SoR `thylora_bank_*` VERIFY_BEFORE_APPLY) · `-W-LOO` (LOYALTY, SoR `thy_loochy_*` VERIFY_BEFORE_APPLY). All other fields come from §5.1.

### 8.3 Proposed new registry: `thylora_ledger_transfer_matrix`

Columns (proposed): `canonical_id text PK ('THY-LEDGER-XFER-<FROM>-<TO>'), from_domain, to_domain, state ('ALLOWED'|'FORBIDDEN'|'REQUIRES_REVIEW'), reason_code ('r1'…'r64'), reason_text, decision_ref ('D-H-01' where applicable), truth_class` — **VERIFY_BEFORE_APPLY**. 64 rows, exactly as in §5.2: **17 ALLOWED, 28 FORBIDDEN, 19 REQUIRES_REVIEW.** Supporting table: `thylora_ledger_transfer_approvals (approval_id PK, matrix_id FK, approver_1, approver_2 CHECK approver_1 <> approver_2, evidence jsonb, approved_at)`.

### 8.4 Proposed new registry: `thylora_ledger_invariant_registry`

Rows `THY-LEDGER-INV-H-01 … H-14` from §5.3, each with columns `statement, enforcement, test_ref, state ('PROPOSED')` — **VERIFY_BEFORE_APPLY**.

### 8.5 Proposed patch to existing written-not-applied migrations (`db/rae-link/0005`, `0006`)

- **Target:** `rael_revenue_events.currency`, `rael_ledger_entries.currency`, `rael_payouts.currency`, and the `currency` columns in `0006_access_entitlements.sql`.
- **Patch:** replace `check (currency ~ '^[A-Z]{3}$')` with domain `earth_currency_code` (FK or CHECK to an ISO 4217 allowlist table that **excludes** `REE`).
- **Truth class:** PROPOSED_FIX.
- **Evidence:** F-H-01 (the regex accepts `REE`).
- **Blocker:** the migrations are Chairman-held and not applied, and this lane may not edit them.
- **Next action:** the RAE Link owner amends the migration before first application and re-runs `db/rae-link/validation/run.sh`.

### 8.6 Proposed rows in existing tables

| Target | Canonical ID | Proposed row / patch | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|
| `dashboard_status` | THY-DS-NETWORK-LANE-H | state `DESIGN_ACTIVE`, gate `S0_GUARDS_AND_TRUTH`, evidence `PARTIAL`, blocker "Counsel not engaged; backups OPEN; RAE Link migrations not applied; F-H-01/F-H-02 open" | PROPOSED | this file | columns known (read in recovered state) but **VERIFY_BEFORE_APPLY** for new-row defaults | read back after insert |
| `thylora_math_equation_registry` (32 rows) | THY-MATH-NET-E01…E10 | one row per equation E-1…E-10 with symbols, units, class, threshold, worked example | PROPOSED | §2.2, §2.3, §2.5, §4.2 | columns UNVERIFIED | read columns first |
| `thylora_workroom_registry` (30 rows) | WR-PROD-FLOOR-001 (lane H artifact link) | append the artifact path `workrooms/WR-PROD-FLOOR-001/LANE-H-NETWORK.md` to the workroom record if one exists; otherwise propose the workroom row | PROPOSED | this file | whether a WR-PROD-FLOOR-001 row exists is UNKNOWN | read before write |
| `thylora_world_design_records` (88 rows) | THY-WORLD-REE-ECON-REPORT-001 | design record: monthly REE Economic Report issued by INST-FINANCIAL-REGULATOR-001 (name OPEN); E-10 identity; faucet/sink codes PROPOSED | PROPOSED (world) | §3 row 3, §4.2 | Chairman approval as canon | D-H-09 |
| `thylora_world_market_*` | (new tables) `_orders`, `_trades`, `_positions`, `thylora_world_ree_faucet_sink_log` | order book and faucet/sink schema per §4.2 | PROPOSED | §4.2 | existing columns UNVERIFIED | read `thylora_world_market_*` columns |
| `thylora_bank_account_types` (7 rows) | — | **no write.** Read only, to map each type to domain `W-REE` | — | F-H-05 | columns UNVERIFIED | read |
| `thy_loochy_*` | — | **no write.** Read only, to confirm points have no cash value field or redemption path (INV-H-11) | — | F-H-05 | tables not verified to exist | list tables matching `thy_loochy_%` |
