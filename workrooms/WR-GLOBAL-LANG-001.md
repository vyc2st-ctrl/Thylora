# WR-GLOBAL-LANG-001 · Global Language Distribution

**Workstream:** `GLOBAL_LANGUAGE_DISTRIBUTION_001`
**Lane:** ErsatzReality as a multilingual publishing system — one question, many languages, one canon
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/ersatzreality-multilingual-system-0qjnm3`
**Head sequence at open:** 501 (previous 500)
**Opened:** 2026-09-18

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` holds. This repository is **not** the deployment authority for
  the Chairman dashboard. `dashboard-current-head.html` and `dashboard-baseline.json`
  were not touched.
- Production DDL remains a held action. `db/global-language/0001_global_language_measurement.sql`
  is **written and reviewable, not applied**.
- No image was generated. No post was published. No product was activated.
- **CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.** Every state below was read from the
  live backend in this session, not carried forward from a prior thread.

---

## 2 · Backend handshake

`thylora-dash` was reached through the Supabase MCP server. Direct HTTPS from this
container is still refused — `jvsdxhrfhtlgaknhjxlz.supabase.co:443` returns **403 on
CONNECT** from the egress proxy, the same denial logged as blocker B1 in
`WR-RAELINK-001`. **B1 is narrowed, not closed:** the backend is now readable and
writable through the MCP path; raw host egress is still blocked, and anything needing
the raw host (fetching CDN bytes, for example) still fails. Postgres 17.6.1, status
`ACTIVE_HEALTHY`.

Sequences 497–500 read from `thylora_query_carryforward`:

| Seq | What it established |
|---|---|
| 497 | Chairman reports ShareChat hooked up; asks for Spanish and Chinese posting |
| 498 | Store release preview sprint; **Gap Hunt visual contradiction** raised — readiness flags had been flipped without the evidence moving |
| 499 | Chairman **approves** the Spanish and Simplified Chinese posts; asks what image accompanies them |
| 500 | Chairman directs entry into store preview |

This session is written as **501**. Sequence **502** was written concurrently by a
separate session on the Bramble approval / storefront lane; it does not touch this
workstream and nothing here was superseded by it.

---

## 3 · ShareChat — exact state

**Claim withheld.** THYLORA does not hold operational ShareChat publishing access.

`thylora_global_arrival_matrix` (`SHARECHAT`, tier 1, India):

| Field | Live value |
|---|---|
| `connection_state` | `USER_REPORTED_CONNECTED_PENDING_WITNESS` |
| `login_access_state` | `USER_REPORTED_NOT_YET_WITNESSED` |
| `posting_access_state` | `NOT_WITNESSED` |
| `account_identifier` | **null** |
| `public_url` | **null** |
| `api_publishing_state` | `UNKNOWN` |
| `signup_route_state` | `MOBILE_APP_ROUTE_WITNESSED` |

`social_channel_registry` (`SOC-SHARECHAT-ERSATZ-001`): `automation_state =
USER_REPORTED_CONNECTED_PENDING_WITNESS`, `publication_state =
PRODUCTION_THAW_PUBLISHING_LOCKED`, `public_url` empty.

The Chairman's report is preserved as a **report**. It was not converted into evidence.

### Exact remaining verification — four items, all required

1. **Account identity** — the exact handle/profile identifier and its public profile URL,
   written to `account_identifier` and `public_url`.
2. **Login witness** — an authenticated signed-in session observed on that exact
   identifier → `login_access_state = WITNESSED`.
3. **Create-post witness** — the compose surface observed reachable on that same signed-in
   identifier → `posting_access_state = WITNESSED`.
4. **Posting path** — manual-app-only, or API/scheduler-reachable → `api_publishing_state`.

Only when all four are present may `connection_state` become `CONNECTED_WITNESSED`.

`thylora_global_arrival_events` **was empty** before this pass — no arrival had ever been
witnessed for any platform. One row now records ShareChat's state. It records state; it
does not promote it.

---

## 4 · Global Question 001 — four languages, one canon

Canon code `THY-GQ-001`. Cover: the **approved Gap Hunt cover**, unmodified —
`THY-VIS-COVER-GAP-HUNT-20260912`, approved / rights cleared / provenance documented in
`thylora_visual_assets`, 1254×1254, bound to Shopify media
`gid://shopify/MediaImage/28674418606157`.

| Lane | Row | Live state |
|---|---|---|
| English | `ER-GLOBAL-Q-001-EN` | **Added this pass.** `DRAFT_LANGUAGE_LANE_NOT_APPROVED` — the EN lane was never approved; sequence 499 approved ES and ZH only |
| Spanish | `ER-GLOBAL-Q-001-ES` | `SCHEDULED_PENDING_WITNESS` — Metricool post 378377543, 2026-09-18T21:40Z, `publish=false` |
| Chinese | `ER-GLOBAL-Q-001-ZH` | `SCHEDULED_PENDING_WITNESS` — Metricool post 378377556, 2026-09-18T21:50Z, `publish=false` |
| Hindi | `ER-GLOBAL-Q-001-HI` | `DRAFT_CONNECTION_WITNESS_REQUIRED` — blocked on the four ShareChat items |

Approved copy in the three existing rows was **not altered**. Each row was extended with
the missing package fields: short caption, alt text, hashtags, comment prompt, audience
purpose, localization basis, asset-serial requirement, publication blocker.

**Localization is meaning-preserving, not word-for-word.** The recorded basis for each:
`cuestiona` carries challenge-the-premise, not merely *ask*; `质疑` likewise, against
`提问`; Hindi uses the everyday spoken register with the loanword `कमेंट`, which is how
ShareChat readers actually write. No city, country or landmark is named in any lane, so
the reader supplies their own.

---

## 5 · Global content system

One question. One canon. Many languages.

```
ONE QUESTION            social_content_queue.production_canonical_id = THY-GQ-nnn
  ↓  localizations live inside the canon row, never as separate canon
MULTIPLE LANGUAGES      en · es · zh-Hans · hi
  ↓  per-language rows are cut from the canon row ONLY after the lane is approved
RESPONSES               thylora_pqr_signals  (themes only, never identity)
  ↓
QUESTION CLUSTERS       thylora_pqr_question_clusters — ONE cluster per question,
                        ALL languages. A Spanish answer and a Hindi answer about the
                        same overlooked thing converge; they do not fork.
  ↓
EVIDENCE                thylora_pqr_evidence_checks · thylora_gap_intelligence_registry
  ↓
ERSATZREALITY STORY     thylora_story_seed_registry
  ↓
THYLORA TOOL            question-engineering / understanding-engine registries
  ↓
PRODUCT / SHOW          thylora_store_product_readiness · show registries
```

**The rule that keeps canon single:** a language is a *surface*, never a source of truth.
A translation may never open a new cluster, a new gap serial or a new story seed. If a
Hindi answer reveals something the English lane did not, it joins the existing cluster —
the cluster is what grows, not the number of canons.

**Cluster state as written:** `THY-GQ-001` OPEN with `signal_count = 0` and
`recurrence_basis = UNMEASURED`. Zero, because nothing has published and therefore no
answer exists. `THY-GQ-002` and `THY-GQ-003` are PARKED.

---

## 6 · Next two global questions

Prepared as **one row each**, all four localizations inside — `ER-GLOBAL-Q-002`,
`ER-GLOBAL-Q-003`, both `PREPARED_NOT_APPROVED`. No per-language rows were cut, because
no lane is approved; cutting them now would be exactly the duplicate content this
workstream exists to prevent.

**Q002 — "If you could repair one system in your city before tomorrow morning, what would it be?"**
Portability: *system* does not survive translation as an abstract noun. `sistema` reads
bureaucratic in Spanish; `系统` reads technical/IT in Chinese; `व्यवस्था` reads formal and
political in Hindi. In every lane the first line is anchored to services people physically
use — water, transport, power, refuse, paperwork — and the abstract idea is carried by the
second line. Framed as **repair**, never blame, which is what keeps it askable across the
whole arrival matrix.

**Q003 — "What does your family know that school never taught you?"**
Portability: kept warm and ancestral — a skill, a recipe, a way of reading weather or
people. Not framed as a criticism of schools or any education ministry. `家里人` not
`家庭`; `हुनर` and `नुस्खा` are the words a ShareChat reader reaches for unprompted.

**Harvest safeguard on Q003 — HARD.** Family answers pull personal material toward the
system. Responses are harvested as **themes only**. No named living person, no minor, no
household location, no medical detail and no birth record may be copied out of a comment
into any THYLORA registry. `नुस्खा` borders on home remedies; this safeguard is what stops
that becoming medical intake. It routes to the existing family-privacy and
child-safeguarding gates rather than inventing a new one.

---

## 7 · Measurement

Tracked per language × platform × window: views, reach, comments, shares, saves, profile
visits, store visits, question themes, language, country/territory where reported.

**The table does not exist.** Nothing in `thylora-dash` records per-language post
outcomes. `db/global-language/0001_global_language_measurement.sql` defines
`thylora_global_language_metrics` and is **reviewable, not applied**.

Two rules are built into the schema rather than left to the reader:

- **NULL is not zero.** A count the platform did not report stays NULL. Reading an
  unreported figure as zero is how a lane gets declared dead before it was measured.
- **Small samples cannot claim to be proof.** `sample_confidence` cannot leave
  `INSUFFICIENT_SAMPLE` unless reach ≥ 1000 and comments ≥ 30. A check constraint enforces
  it. The ES and ZH lanes will land far under that floor, and the schema will say so.

---

## 8 · Blockers

| # | Blocker | Class |
|---|---|---|
| **G1** | ShareChat: four witness items outstanding. Hindi lane cannot move. | **HARD — needs a device** |
| **G2** | `SOC-FB-ENTERPRISE-001` — `ACCOUNT_REPORTED_BACKEND_ID_MISSING_PUBLICATION_LOCKED`. The Facebook half of the ES and ZH lanes has no usable backend id. | **HARD** |
| **G3** | Both IG and FB channels sit at `PRODUCTION_THAW_PUBLISHING_LOCKED`. Scheduling is not publication. | **BY RULE** |
| **G4** | Gap Hunt cover has **no row** in `thylora_visual_serial_registry`. A serial needs the byte hash; the Shopify CDN is unreachable from this session (egress 403), so the hash could not be computed. Serial issuance is blocked, not skipped. | **HARD — needs egress or an operator** |
| **G5** | Alt text in all four lanes is **provisional**, derived from the recorded visual brief rather than from the image, for the same reason as G4. Flagged in-row as `PROVISIONAL_…`, not presented as verified. | **EVIDENCE GAP** |
| **G6** | Measurement table not applied. Production DDL is held. | **BY RULE** |
| **G7** | EN lane carries no Chairman approval. Hashtag sets in all lanes are `PROPOSED_NOT_APPROVED`. | **DECISION** |
| **G8** | The Chinese lane reaches Chinese readers **outside** mainland China only — IG and FB are not reachable inside it. WECHAT, WEIBO, DOUYIN and BILIBILI are all `NOT_CONNECTED`. This lane does not test the mainland and must not be reported as if it does. | **SCOPE — stated, not solved** |

---

## 9 · State

| | |
|---|---|
| Workroom | **OPEN** |
| Backend handshake | Read and written via MCP · raw host egress still 403 |
| ShareChat | Reported connected · **4 witness items outstanding** · claim withheld |
| Global Question 001 | 4 languages · 1 canon · 2 scheduled, 2 blocked · **0 published** |
| Global Questions 002 / 003 | Prepared · not approved · not asked |
| Clusters | 1 OPEN · 2 PARKED · **0 signals** |
| Measurement | Modelled · **not applied** |
| Images | **None generated** |
| Publication | **None** |
| Product activation | **None** |
| Baseline regression | **None.** No capability removed, renamed or disconnected. |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
A REPORT IS NOT A WITNESS. CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
