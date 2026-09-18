# GLOBAL_LANGUAGE_DISTRIBUTION_001

**Destination:** CLAUDE — GLOBAL ARRIVAL / SOCIAL THREAD
**Date:** 2026-09-18
**Backend:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Branch:** `claude/thylora-gateway-design-ghc7zw`
**Objective:** Turn ErsatzReality into a multilingual publishing system without creating duplicate or random content.

**Prohibitions honoured:** no image generation, no publication, no product activation, approved cover not altered.

---

## A. BACKEND HANDSHAKE

### A.1 The head was not 497

The directive said to read through sequence 497 and all newer deltas. Read dynamically, the head at the start of this pass was **499**, and by the time custody was captured it was **503**. Four deltas newer than 497 existed. Two of them change what this turn is.

| Seq | Source | What it is | Bearing on this workstream |
|---|---|---|---|
| 497 | CHATGPT | ShareChat reported connected; Global Question 001 drafts | The starting point the directive names |
| 498 | CLAUDE_CODE | Store release preview sprint 003 (mine, prior turn) | Not this thread |
| **499** | **CHATGPT** | **Spanish + Chinese posts SCHEDULED via Metricool under Chairman approval** | **Changes the premise — see A.2** |
| 500 | CHATGPT | Enter store preview review | Not this thread |
| **501** | **CLAUDE_CODE** | **A parallel pass on this same workstream** | **Collides with this one — see A.3** |
| 502 | CHATGPT | Bramble approval gate + `THY-STORE-RELEASE-COMPILER-001` | Not this thread |
| **503** | **CLAUDE_CODE** | **This pass** | — |

### A.2 Sequence 499 — two of the four language posts are already scheduled

Sequence 499 records, in its own words, that the Chairman approved the Spanish and Chinese posts and asked what image would accompany them. Its `continuity_refs` carry two Metricool post IDs:

```
spanish_post_id : 378377543
chinese_post_id : 378377556
image_asset_id  : THY-VIS-COVER-GAP-HUNT-20260912
```

Its restart point states both were scheduled to Instagram and Facebook — Spanish 17:40 ET, Chinese 17:50 ET — provider state PENDING, publication not witnessed.

**This turn's instruction was "Do not publish." That instruction is intact: nothing here published anything.** But the framing of this workstream as *preparation* is only half true. Two of the four languages are past preparation and sitting in a scheduler, and **nothing in the THYLORA backend recorded what they say.** The only trace of their content anywhere was a session label and two integer post IDs.

That is the actual gap this turn had to close, and it is what the six new tables below exist for.

**What I did not do:** I did not witness Metricool. There is no Metricool tool in this session. Sequence 499's report of the schedule is preserved as a report, recorded with its source, and marked unwitnessed by THYLORA. I did not cancel, edit, or confirm those posts.

### A.3 Sequence 501 — a parallel Claude pass on this same workstream

Sequence 501 (`CLAUDE_CODE`, 21:50Z) is another pass at `GLOBAL_LANGUAGE_DISTRIBUTION_001`. It is not superseded wholesale, and it is not contradicted. Two points needed reconciling, and both are recorded in the restart record rather than quietly overwritten:

| Point | Sequence 501 | This pass (503) | Reconciliation |
|---|---|---|---|
| ShareChat witness items | four outstanding | three outstanding | **Both correct, about different questions.** The directive names three prerequisites for claiming *publishing access*: identity, login, create-post. The fourth item is credential storage (`secret_storage_ref`), which is required for *automated* posting and is not one of the three. Neither number is wrong; they answer different questions. |
| Measurement table | "DDL held" | six tables created | **501's hold is released by 503.** The tables now exist and are named in the restart record, so the two records read in sequence tell a true story rather than a conflicting one. |

### A.4 What was written

Six tables, one migration (`global_language_distribution_001`):

| Table | Purpose | Rows |
|---|---|---|
| `thylora_global_question_registry` | The canon. One row per question. | 3 |
| `thylora_global_question_localizations` | Renditions. One row per question × language. | 12 |
| `thylora_global_distribution_ledger` | One row per localization × platform, with external scheduler IDs. | 7 |
| `thylora_global_question_responses` | Response spine, routes into the **existing** PQR cluster table. | 0 |
| `thylora_global_measurement_spec` | The ten tracked metrics with plain meanings. | 10 |
| `thylora_global_interpretation_gate` | The small-sample floor. | 1 |

Plus: serial `ER-VIS-20260918-0002`; defect `LR-20260918-SCHEDULED-WITHOUT-BACKEND-RECORD`; restart record `THY-RESTART-GLOBAL-LANG-001`; handoff `HO-20260918-GLOBAL-LANG-001`.

### A.5 Readback verified

```
questions                      3
localizations                 12      (GQ-001: 4)
distribution_rows              7
scheduled_pending_witness      4
captions_witnessed_by_thylora  0   <-- the open wound
destination_unverified         4   <-- the other one
responses                      0
metrics                       10
gate                           THY-GLOBAL-SMALL-SAMPLE-GATE-001
serial ER-VIS-20260918-0002    CHAIRMAN_APPROVED
head                         503
restart THY-RESTART-GLOBAL-LANG-001   OPERATIONAL
handoff HO-20260918-GLOBAL-LANG-001   PENDING
sharechat connection_state     USER_REPORTED_CONNECTED_PENDING_WITNESS
sharechat identity             NULL / NULL / NULL
cover                          thylora-gap-hunt-approved-cover.png?v=1789219255  v2   (unchanged)
```

---

## B. SHARECHAT — EXACT STATE

**The Chairman's report is preserved, and it is not contradicted.** It is recorded in `thylora_global_arrival_matrix.evidence` as a claim with `verification_state: PENDING_WITNESS`, and this pass added a note recording that Claude neither verified nor disputed it.

### B.1 What the two tables actually say

`thylora_global_arrival_matrix`, row `SHARECHAT` — every field, selected directly:

| Field | Value |
|---|---|
| `priority_tier` | 1 |
| `priority_territory` | India |
| `signup_route_state` | `MOBILE_APP_ROUTE_WITNESSED` |
| `connection_state` | `USER_REPORTED_CONNECTED_PENDING_WITNESS` |
| `login_access_state` | `USER_REPORTED_NOT_YET_WITNESSED` |
| `posting_access_state` | `NOT_WITNESSED` |
| `api_publishing_state` | `UNKNOWN` |
| `account_identifier` | **NULL** |
| `public_url` | **NULL** |
| `secret_storage_ref` | **NULL** |
| `credential_owner` | `VYC_OR_AUTHORIZED_ERSATZREALITY_OPERATOR` |

`social_channel_registry`, row `SOC-SHARECHAT-ERSATZ-001`:

| Field | Value |
|---|---|
| `automation_state` | `USER_REPORTED_CONNECTED_PENDING_WITNESS` |
| `publication_state` | `PRODUCTION_THAW_PUBLISHING_LOCKED` |
| `public_url` | NULL |
| `metadata.connection_claim_rule` | `LOGIN_AND_POSTING_ACCESS_MUST_BE_WITNESSED` |
| `metadata.language_priority` | Hindi, English, other supported Indian languages |

### B.2 Exact remaining verification

Three items, **in this order**. Each depends on the one before it.

**1 — IDENTITY.** Open the ShareChat profile and capture the exact `@handle` or profile URL. Write it to `account_identifier` and `public_url`. *Until this exists there is no subject for the other two checks: "ShareChat is connected" does not name which account.*

**2 — LOGIN.** Witness a signed-in session **on that exact profile** — a view showing the account logged in, not the install or download page. Set `login_access_state`.

**3 — CREATE-POST.** Witness the compose/upload screen reachable from that same signed-in profile. Set `posting_access_state`.

Only when all three are done may `connection_state` leave `USER_REPORTED_CONNECTED_PENDING_WITNESS`.

**A fourth item exists but is not one of the three.** `api_publishing_state` stays `UNKNOWN` even after all three, and `secret_storage_ref` stays NULL. A witnessed create-post screen proves a human can post. It does not prove an API route exists, and the two must never be conflated — that conflation is how "connected" turns into an assumed automation that does not exist. (This is the item sequence 501 counted as a fourth; see A.3.)

### B.3 The finding the directive did not anticipate

The directive frames Spanish and Chinese as the **Instagram/Facebook test lanes**, implicitly the working ones, with ShareChat as the blocked one.

**Both Instagram and Facebook are also publishing-locked, and Facebook is in worse shape than ShareChat.**

| Channel | `publication_state` | Identity on file |
|---|---|---|
| `SOC-IG-ERSATZ-001` (ersatz.reality) | `PRODUCTION_THAW_PUBLISHING_LOCKED` | Metricool brand 6877123 ✓ |
| `SOC-FB-ENTERPRISE-001` | `PRODUCTION_THAW_PUBLISHING_LOCKED_BLOCKED` | **`page_id` NULL, `page_url` NULL** |
| `SOC-SHARECHAT-ERSATZ-001` | `PRODUCTION_THAW_PUBLISHING_LOCKED` | identifier NULL |

Facebook's `required_evidence` lists exactly what is missing: exact Page name, Page ID or URL, admin access screenshot, Create post access. **All four are outstanding — and two posts are scheduled to it.** A post that publishes to a Page no record names cannot afterwards be found, measured, or corrected.

The Chairman publish freeze (`ACTIVE`, effective 2026-09-16T17:30-04:00) reads: *"NO NEW POST OR SCHEDULE WITHOUT CHAIRMAN PREVIEW AND EXPLICIT APPROVAL."* Sequence 499 records that approval for these two posts and no others, so the freeze's condition is satisfied for them. The freeze is **not** lifted generally, and the registry's stale line — "Metricool returned no future scheduled posts after 2026-09-16 15:00" — has been marked superseded rather than deleted, naming sequence 499 as what superseded it.

What *is* explicitly permitted on the locked Instagram lane, per its own `allowed_prepublication_work`: draft creation, image packaging, **captions**, **translations**, **serial assignment**, QR preparation, URL testing, Chairman previews, duplicate detection, audit preparation. Every single thing in this document falls inside that list.

---

## C. GLOBAL QUESTION 001 — FOUR-LANGUAGE PACKAGE

**Canon (English):** *What is one thing everyone in your city sees — but almost nobody questions?*

**Intent, recorded in the registry:** open the gap between seeing and asking. The question does not ask for an opinion, a complaint, or a side — it asks for one concrete thing the respondent can point at. Concrete answers are what make clustering possible later; opinions are not.

**Asset — one image, four languages, unaltered.**

| | |
|---|---|
| Asset | `THY-VIS-COVER-GAP-HUNT-20260912` v2 |
| File | `thylora-gap-hunt-approved-cover.png?v=1789219255` |
| Shopify media | `gid://shopify/MediaImage/28674418606157` |
| Product | 7957199749197 · 1254 × 1254 |
| Approval | Chairman, sequence 495 · rights cleared · provenance documented |
| Serial for this work item | **`ER-VIS-20260918-0002`** |

**Why one serial and not four.** Sequence 496's rule is that every image *or revision* gets a unique serial. Four languages share **one unmodified image** — no revision occurred, the pixels are the approved cover. One work item, one serial.

**On the serial's hash field — read this.** `asset_hash` on `ER-VIS-20260918-0002` does **not** contain a hash. Container egress to `cdn.shopify.com` is proxy-denied (403 CONNECT), so the SHA-256 could not be computed from this session. Rather than invent one, the field carries a self-describing sentinel naming the identifiers that *were* verified:

```
UNCOMPUTED::CDN_EGRESS_DENIED::gid://shopify/MediaImage/28674418606157::v=1789219255
```

Replace it with a real SHA-256 the first time the file can be fetched.

**On alt text — also read this.** Every alt text below is marked `PENDING_VISUAL_CONFIRMATION`. It was written from the backend `subject` field ("A stair with a guardrail and a safety gate, and a puzzle map"), **not from looking at the image**, for the same egress reason. I have not described anything the record does not state — in particular I did not assert that any title text appears on the cover, because no field says so. Confirm each alt text against the image before publication.

**Protected terms, untranslated in all four languages:** SEEZIN, WYCK, VYC, VYCTOR PEETE, Ersatz Reality, EdereAriah (`THY-QYRIS-PLAIN-SPEECH-001`, `protected_terms`). THYLORA likewise. Hashtags carrying these stay in Latin script in every language.

---

### C.1 ENGLISH — `GQ-001-EN`

**Rendered question**
> What is one thing everyone in your city sees — but almost nobody questions?

**Caption**
> There is something in your city you pass so often that it stopped looking like a decision. A gate. A wall. A crossing that was never painted. A gap in a sidewalk that has outlasted three mayors.
>
> Somebody chose it. Somebody keeps it. Somebody stopped asking about it.
>
> What is one thing everyone in your city sees — but almost nobody questions?
>
> One sentence is enough. Name your city if you want it counted.

**Short caption** · What is one thing everyone in your city sees — but almost nobody questions?
**Alt text** · Square illustration: a staircase with a guardrail and a safety gate, shown beside a puzzle map. *(pending visual confirmation)*
**Hashtags** · `#GapHunt` `#ErsatzReality` `#PublicSpace` `#CityDesign` `#AskFirst`
**Comment prompt** · One sentence. What is it, and what city?
**Platform** · Instagram, Facebook
**Audience purpose** · Canonical reference lane. Fixes the exact wording the other three are judged against, and gives English-language respondents the same entry point.
**Asset serial** · `ER-VIS-20260918-0002`
**Publication blocker** · **NOT SCHEDULED**, two separate blocks: (1) both channels are publishing-locked under the freeze; (2) **no Chairman approval exists for an English post** — sequence 499 names Spanish and Chinese only.

---

### C.2 SPANISH — `GQ-001-ES`

**Rendered question**
> ¿Qué es algo que todo el mundo ve en tu ciudad — y que casi nadie se detiene a cuestionar?

**Back-translation** · *What is something that everybody sees in your city — and that almost nobody stops to question?*

**Meaning preservation, not word substitution.** "se detiene a cuestionar" (*stops to question*) rather than a bare "cuestiona". Literal "casi nadie cuestiona" reads in Spanish as *almost nobody objects to*, which turns an observation question into a complaint question. Adding the pause restores the English sense: the thing is **passed**, not protested. "Todo el mundo ve" instead of "todos ven", because it carries the ordinariness the English "everyone sees" carries. Informal *tú* throughout — the register of the platform, not of an institution.

**Caption**
> Hay algo en tu ciudad por lo que pasas tan seguido que dejó de parecer una decisión. Una reja. Un muro. Un cruce que nunca se pintó. Un hueco en la acera que lleva ahí más años que tres alcaldes.
>
> Alguien lo decidió. Alguien lo mantiene. Alguien dejó de preguntar.
>
> ¿Qué es algo que todo el mundo ve en tu ciudad — y que casi nadie se detiene a cuestionar?
>
> Con una frase basta. Escribe tu ciudad si quieres que cuente.

**Short caption** · ¿Qué es algo que todo el mundo ve en tu ciudad — y que casi nadie se detiene a cuestionar?
**Alt text** · Ilustración cuadrada: una escalera con barandal y una puerta de seguridad, junto a un mapa de rompecabezas. *(pending visual confirmation)*
**Hashtags** · `#GapHunt` `#ErsatzReality` `#EspacioPublico` `#Ciudades` `#PreguntasQueImportan`
**Comment prompt** · Una frase. ¿Qué es, y en qué ciudad?
**Platform** · Instagram, Facebook
**Audience purpose** · Test whether the question travels into Spanish-language city talk without ErsatzReality supplying the examples. Success is respondents naming a concrete object, not agreeing with the caption.
**Asset serial** · `ER-VIS-20260918-0002`
**Publication blocker** · **SCHEDULED BY ANOTHER LANE, NOT WITNESSED BY THYLORA.** Metricool post `378377543`, 17:40 ET, Instagram + Facebook, under Chairman approval at sequence 499. **THYLORA has never read the caption text loaded into that post** — the text above is what THYLORA prepared, not what is confirmed to publish. Facebook destination unverifiable (`page_id` NULL, `page_url` NULL).

---

### C.3 SIMPLIFIED CHINESE — `GQ-001-ZH-HANS`

**Rendered question**
> 在你的城市里，有什么是人人都看得见，却几乎没有人去追问的？

**Back-translation** · *In your city, what is it that everyone can see, yet almost nobody presses further to ask about?*

**Meaning preservation.** 追问 (*press further, keep asking*) is chosen over 质疑 (*doubt, challenge*) and 反对 (*oppose*). 质疑 would make the question adversarial and, in several contexts, politically loaded; 追问 keeps it as curiosity that was never followed up — which is the English meaning. 人人都看得见 (*everyone can see it*) rather than 大家都知道 (*everyone knows*), because the English turns on **visibility**, not knowledge.

**Caption**
> 你城市里有些东西，你路过太多次，久到它不再像是一个"有人做过的决定"。一道闸门。一堵围墙。一个从来没画过的斑马线。一个比三届市长还久的路面缺口。
>
> 有人决定了它。有人维持着它。有人不再追问它。
>
> 在你的城市里，有什么是人人都看得见，却几乎没有人去追问的？
>
> 一句话就够。想让它被记下，就写上你的城市。

**Short caption** · 在你的城市里，有什么是人人都看得见，却几乎没有人去追问的？
**Alt text** · 方形插画：一段带护栏的楼梯和一道安全门，旁边是一张拼图地图。 *(pending visual confirmation)*
**Hashtags** · `#GapHunt` `#ErsatzReality` `#城市观察` `#公共空间` `#提问`
**Comment prompt** · 一句话。是什么？在哪座城市？
**Platform** · Instagram, Facebook
**Audience purpose** · Test whether a Simplified-Chinese-reading audience reachable on Instagram and Facebook — diaspora and outside-mainland readers, **not** mainland platforms — answers a civic-observation question in public comments at all. A low comment count here is a **reach** finding, not a content finding.
**Asset serial** · `ER-VIS-20260918-0002`
**Publication blocker** · **SCHEDULED BY ANOTHER LANE, NOT WITNESSED BY THYLORA.** Metricool post `378377556`, 17:50 ET. Caption never read back. Facebook destination unverifiable. Separately: **no mainland-platform channel is connected** — Weibo, WeChat, Douyin and Bilibili are all `NOT_CONNECTED`, so this lane reaches Simplified-Chinese readers on non-Chinese platforms only. Do not read its numbers as "Chinese audience".

---

### C.4 HINDI — `GQ-001-HI`

**Rendered question**
> आपके शहर में ऐसी कौन-सी चीज़ है जो सबको दिखती है — पर लगभग कोई उस पर सवाल नहीं उठाता?

**Back-translation** · *In your city, what is the thing that is visible to everybody — but on which almost nobody raises a question?*

**Meaning preservation.** सवाल उठाना (*to raise a question*) rather than सवाल करना or शक करना. शक would mean suspicion; सवाल करना can read as interrogating a person. सवाल उठाना is the civic register — raising a question about a **matter**, which is exactly the English. दिखती है (*is visible, shows itself*) rather than देखते हैं (*people look at*), because the English "sees" is passive exposure, not active looking. आप (polite) because ShareChat's Hindi audience spans ages and the polite form costs nothing.

**Caption**
> आपके शहर में कुछ चीज़ें ऐसी हैं जिनके पास से आप इतनी बार गुज़रते हैं कि वे अब किसी के लिए हुए फ़ैसले जैसी नहीं लगतीं। एक बंद गेट। एक दीवार। एक ऐसा चौराहा जहाँ ज़ेबरा क्रॉसिंग कभी बनी ही नहीं। फुटपाथ का एक गड्ढा जो तीन मेयर देख चुका है।
>
> किसी ने यह तय किया। कोई इसे बनाए रखता है। किसी ने इस पर सवाल पूछना बंद कर दिया।
>
> आपके शहर में ऐसी कौन-सी चीज़ है जो सबको दिखती है — पर लगभग कोई उस पर सवाल नहीं उठाता?
>
> एक वाक्य काफ़ी है। गिनती में आना है तो अपने शहर का नाम लिख दीजिए।

**Short caption** · आपके शहर में ऐसी कौन-सी चीज़ है जो सबको दिखती है — पर लगभग कोई उस पर सवाल नहीं उठाता?
**Alt text** · वर्गाकार चित्र: रेलिंग वाली एक सीढ़ी और एक सुरक्षा गेट, साथ में एक पहेली-नक्शा। *(pending visual confirmation)*
**Hashtags** · `#GapHunt` `#ErsatzReality` `#शहर` `#सवाल` `#सार्वजनिकजगह`
**Comment prompt** · एक वाक्य में बताइए। वह क्या है, और कौन-सा शहर?
**Platform** · ShareChat
**Audience purpose** · ShareChat priority lane. India-first, Hindi-first. The lane where *"everyone sees it, nobody asks"* is expected to return the highest density of concrete, nameable civic answers — which is exactly what the cluster model needs. It is also the lane THYLORA currently cannot reach.
**Asset serial** · `ER-VIS-20260918-0002`
**Publication blocker** · **NOT SCHEDULED AND NOT SCHEDULABLE.** All three witnesses outstanding; identifier, URL and credential reference all NULL.

### C.5 One standing constraint on all four

**Gap Hunt the product is `DRAFT` and `NEEDS_ONE_FIX`.** The cover may carry the post; the post may not carry a sale. No caption above names a price, links to a product page, or implies the book can be bought. If any scheduled post does, that is a correction to make before it publishes, not after.

---

## D. THE TWO FOLLOW-UP QUESTIONS

Both are written in all four languages, stored as `PREPARED`, and **held**. Releasing a second question before the first returns data makes both uninterpretable.

### D.1 `GQ-002` — *If you could repair one system in your city before tomorrow morning, what would it be?*

**Intent** · Move from noticing to prioritising. The overnight deadline forces one answer instead of a list, and a system instead of a mood.

**Portability — the risk is the word "system."** English holds infrastructure and bureaucracy in one word. Spanish *sistema* leans institutional; Chinese 系统 leans technical; Hindi व्यवस्था leans administrative. **The ambiguity is not resolved in the question — it is generative.** It is resolved in the comment prompt, which offers both readings side by side in every language.

| Lang | Rendered |
|---|---|
| EN | If you could repair one system in your city before tomorrow morning, what would it be? |
| ES | Si pudieras arreglar un solo sistema de tu ciudad antes de mañana por la mañana, ¿cuál sería? |
| ZH | 如果你能在明天早上之前修好你城市里的一个系统，你会选哪一个？ |
| HI | अगर आप कल सुबह से पहले अपने शहर की कोई एक व्यवस्था ठीक कर सकें, तो वह कौन-सी होगी? |

Notes: ES uses *un solo sistema* — bare "un" reads as the article and loses the constraint; *arreglar* over *reparar*, because *reparar* is mechanical while *arreglar* covers institutions too. ZH uses 你会选哪一个 (*which would you choose*) rather than 会是什么 — forcing a choice is the point of the deadline. HI uses व्यवस्था over the loanword सिस्टम, which in written Hindi narrows to machinery; *कोई एक* carries the one-only constraint.

Comment prompt, all four: *Name the system — buses, water, permits, a hallway at a school — whichever one you meant.*

### D.2 `GQ-003` — *What does your family know that school never taught you?*

**Intent** · Surface inherited, unschooled knowledge — the material THYLORA tools are meant to **meet**, not replace.

**This is the highest-risk question of the three, and the risk is not translation.** In several markets a question contrasting family with school reads as anti-education; in others it invites disclosure of caste, class or region. Three rules are recorded in the registry and enforced in every caption:

1. The two are framed as **complementary**, never opposed.
2. The caption asks for a **skill or a practice**, never a belief or an identity — every language ends on "not a belief — a thing that works."
3. **No localization names a community, a region, or a school system.**

| Lang | Rendered |
|---|---|
| EN | What does your family know that school never taught you? |
| ES | ¿Qué sabe tu familia que la escuela nunca te enseñó? |
| ZH | 你家里人懂得的哪一件事，是学校从来没教过你的？ |
| HI | आपका परिवार ऐसा क्या जानता है जो स्कूल ने आपको कभी नहीं सिखाया? |

Notes: ES keeps *la escuela* singular and definite — schooling in general; *las escuelas* would point at institutions and invite grievance. ZH uses 懂得 (*has mastery of*) not 知道 (*knows a fact*), and **deliberately avoids** 传统 (*tradition*) and 老一辈 (*the older generation*), either of which recasts a question about working knowledge as a question about heritage and reliably returns sentiment instead of substance. HI keeps the loanword स्कूल rather than विद्यालय, which sounds official and would read as a complaint against the state; the caption asks for a हुनर (*skill*), never a मान्यता (*belief*) or रिवाज़ (*custom*).

**Additional hold on the Hindi row:** it must not be released without a human reader confirming the caption collects a skill and not a community identity.

---

## E. PLATFORM / LANGUAGE MATRIX

| Language | Localization | Platform | Channel | Channel state | Scheduled | Post ID | Caption witnessed | Destination verified | Ledger state |
|---|---|---|---|---|---|---|---|---|---|
| English | `GQ-001-EN` | Instagram | `SOC-IG-ERSATZ-001` | LOCKED | no | — | — | ✅ | `NOT_SCHEDULED` |
| English | `GQ-001-EN` | Facebook | `SOC-FB-ENTERPRISE-001` | LOCKED_BLOCKED | no | — | — | ❌ | `NOT_SCHEDULED` |
| Spanish | `GQ-001-ES` | Instagram | `SOC-IG-ERSATZ-001` | LOCKED | **yes** | 378377543 | ❌ | ✅ | `SCHEDULED_PENDING_WITNESS` |
| Spanish | `GQ-001-ES` | Facebook | `SOC-FB-ENTERPRISE-001` | LOCKED_BLOCKED | **yes** | 378377543 | ❌ | ❌ | `SCHEDULED_PENDING_WITNESS` |
| Chinese | `GQ-001-ZH-HANS` | Instagram | `SOC-IG-ERSATZ-001` | LOCKED | **yes** | 378377556 | ❌ | ✅ | `SCHEDULED_PENDING_WITNESS` |
| Chinese | `GQ-001-ZH-HANS` | Facebook | `SOC-FB-ENTERPRISE-001` | LOCKED_BLOCKED | **yes** | 378377556 | ❌ | ❌ | `SCHEDULED_PENDING_WITNESS` |
| Hindi | `GQ-001-HI` | ShareChat | `SOC-SHARECHAT-ERSATZ-001` | LOCKED | no | — | — | ❌ | `BLOCKED` |

**Reading of this table in one line:** four posts are scheduled, zero captions have been read back by THYLORA, and four of the seven destinations cannot be verified.

Not connected at all, for completeness: Weibo, WeChat, Douyin, Bilibili, Moj, VK, Telegram, WhatsApp — all `NOT_CONNECTED`. YouTube and TikTok are connected via Metricool and publishing-locked, and carry no localization this pass.

---

## F. MEASUREMENT MODEL

### F.1 The ten metrics

| Metric | Plain meaning | Availability | Rule |
|---|---|---|---|
| Views | Times displayed. Not people. | partial | Never compare across languages as if the audiences were the same size. |
| Reach | Distinct accounts that saw it once. | partial | The denominator for every rate. State reach **before** any percentage. |
| Comments | People who answered in public. | partial | **Primary metric for a question post.** High reach with no comments is a failure that looks like success. |
| Shares | People who passed it on. | partial | Strongest single signal the question landed. Weight above saves. |
| Saves | People who kept it. | partial | Intent to answer later. **Not** endorsement. |
| Profile visits | Post → profile. | partial | Instagram exposes it; Facebook differs; ShareChat unknown. Do not average across platforms. |
| Store visits | Post → ErsatzReality store. | **UNKNOWN** | **Not measurable today at all** unless the published captions carry a tagged link or QR — and THYLORA has not read the captions. Record UNKNOWN, never zero. Zero and unmeasured are different facts. |
| Question themes | What kinds of things people named. | **none yet** | Derived by routing responses into the **existing** PQR cluster table. Zero responses exist, so no theme exists. A theme claimed before responses exist is fabrication. |
| Language | Which localization it came from. | ✅ always | A property of the post we control, not of the platform. |
| Country / territory | Where the platform says the viewer was. | partial | Often withheld below a minimum audience size — record NULL, not a guess. **Language is not territory:** a Spanish response is not evidence of a Spanish-speaking country. |

### F.2 The small-sample gate — `THY-GLOBAL-SMALL-SAMPLE-GATE-001`

```
I_ready = (R ≥ 30) AND (D ≥ 20) AND (T ≥ 3) AND (W = 1)
```

- **R** — responses captured for this question in this language · floor **30**
- **D** — distinct respondents · floor **20**
- **T** — distinct territories the platform reports · floor **3**
- **W** — publication **witnessed**: 1 yes, 0 no · required

It is a gate, not a score. It produces no number — it is true or false.

**W sits inside the gate deliberately.** A post that was scheduled but never witnessed publishing has no measurable audience, so nothing it appears to produce can be interpreted. Today **W = 0 on every lane**, which means `I_ready` is false everywhere regardless of any other count.

**Below the floor — forbidden:** rates and percentages; ranking languages against each other; the sentence pattern *"X resonates more than Y"*; any product, activation, pricing or show decision citing these numbers; any claim that a theme exists.

**Below the floor — permitted:** the counts themselves, stated with n, and the observation that the floor has not been reached.

---

## G. THE GLOBAL CONTENT SYSTEM

```
ONE QUESTION  →  MULTIPLE LANGUAGES  →  RESPONSES  →  QUESTION CLUSTERS
              →  EVIDENCE  →  ERSATZREALITY STORY  →  THYLORA TOOL  →  PRODUCT / SHOW
```

**The rule that makes it a system and not eight parallel systems: canon lives on the question, never on the language.**

| Stage | Where it lives | The rule that prevents drift |
|---|---|---|
| ONE QUESTION | `thylora_global_question_registry` | One row. `canon_rule` on every row: *no language may introduce a claim, promise, product or framing the canonical question does not carry.* A language may change **how it is said**; it may never change **what is asked**. |
| MULTIPLE LANGUAGES | `..._localizations` | Child rows, FK to the question. Each carries a `back_translation_en` and `meaning_preservation_notes`, so any drift is visible by reading the row rather than by comparing posts. Unique on (question, language, platform) — **duplicate content cannot be inserted.** |
| — distribution — | `..._distribution_ledger` | One row per localization × platform, carrying the external scheduler's post ID. This is the join that did not exist before today, and its absence is what let two posts go into a scheduler with no record of their content. |
| RESPONSES | `..._responses` | Each response carries `locale_observed` and `territory_observed` as **attributes of the observation**, not as a separate canon. |
| QUESTION CLUSTERS | **`thylora_pqr_question_clusters`** — the existing table, FK'd to | **Responses route into the clusters that already exist.** No new per-language cluster set is created. The three live clusters (PQR-C-0001…0003, all `ROUTED`, `OBSERVED_SAMPLE`) are extended, not duplicated. A Hindi answer and a Spanish answer about the same absence land in **the same cluster**. |
| EVIDENCE | cluster `recurrence_basis` + the gate | A cluster becomes evidence only when it clears `THY-GLOBAL-SMALL-SAMPLE-GATE-001`. |
| ERSATZREALITY STORY | story lane | One story per cluster, from the evidence — never one story per language. |
| THYLORA TOOL | tool lane | Built against the cluster, localized after. |
| PRODUCT / SHOW | store / show lanes | Subject to `Q_product = V × C × U × D × T` and the existing activation gates. Nothing skips them because it came from a global lane. |

**The two failure modes this design exists to prevent, named:**

1. **Language canon drift** — Spanish quietly asking a slightly different question than Hindi, producing clusters that cannot be merged. Prevented by the single question row, the FK, and the stored back-translation.
2. **Duplicate/random content** — the same question posted twice, or a language lane inventing its own questions. Prevented by the unique constraint and by every localization being a child of a registered question. **There is no way to insert a localization without a question, and no way to insert two localizations for the same language and platform.**

---

## H. BLOCKERS

Ranked by what happens if they are not cleared.

| # | Blocker | Severity | Who can clear it |
|---|---|---|---|
| 1 | **Facebook destination unknown.** Two posts are scheduled to a Facebook Page whose ID and URL are both NULL. If they publish, THYLORA cannot say where. | **Highest — time-bound** | Chairman / operator, before 17:40 ET |
| 2 | **Caption text never read back.** Metricool posts 378377543 and 378377556 carry text THYLORA has never seen. The rows in this document are what was *prepared*, not what will *publish*. | **High — time-bound** | Anyone with Metricool access |
| 3 | **ShareChat: three witnesses.** Identity, login, create-post — in that order. Identifier, URL and credential ref all NULL. | High | Chairman / operator |
| 4 | **Alt text unconfirmed** on all four languages; SHA-256 uncomputed. Both from the same cause: `cdn.shopify.com` egress is proxy-denied from this container. | Medium | Any session that can fetch the CDN |
| 5 | **Store visits unmeasurable.** No confirmed tagged link or QR in either scheduled post, so the post → store path cannot be attributed. Follows from #2. | Medium | Follows #2 |
| 6 | **No mainland-Chinese channel.** The Chinese lane reaches diaspora and outside-mainland readers on IG/FB only. Not a defect — a scope fact that must not be misread as "Chinese audience". | Low — must be stated | Noted, no action |
| 7 | **English has no approval.** The canonical lane cannot post; approval at sequence 499 covers Spanish and Chinese only. | Low | Chairman, if an English lane is wanted |

**What I could not do and did not fake:** witness Metricool (no tool in this session), fetch the cover (egress denied), or verify the Chairman's ShareChat report (no access). Each is recorded as unwitnessed rather than assumed either way.

---

## I. EXACT NEXT EXECUTABLE ACTION

**Read back the caption text actually loaded into Metricool posts `378377543` and `378377556`, and capture the Facebook Page ID or URL — before 17:40 ET today.**

Concretely, in this order:

1. **Open Metricool post `378377543`.** Copy its caption, alt text and hashtags. Compare word-for-word against `GQ-001-ES` in `thylora_global_question_localizations`. Same for `378377556` against `GQ-001-ZH-HANS`.
2. **Set the flag.** `UPDATE thylora_global_distribution_ledger SET caption_text_witnessed_by_thylora = true` on the matching rows — only where the text actually matched. Where it differs, the difference is the decision: correct the backend row if the post is right, hold the post if the post is wrong.
3. **Capture the Facebook Page.** Exact Page name, and Page ID or URL. Write to `social_channel_registry.metadata` for `SOC-FB-ENTERPRISE-001`, then set `destination_identity_witnessed` on the two FB ledger rows. **If this cannot be done before 17:40 ET, drop Facebook from both posts and keep Instagram.**

Handoff `HO-20260918-GLOBAL-LANG-001` carries all three to the ChatGPT lane, which has the Metricool and browser access this lane does not.

**Then, unblocked and independent:** the three ShareChat witnesses. `GQ-001-HI` is written and waiting on nothing else.

---

## Appendix — what this document does NOT claim

- It does **not** claim ShareChat publishing access. The Chairman's report that it is connected is preserved and untouched; three witnesses remain.
- It does **not** claim the Spanish or Chinese posts will publish the text written here. That text is what THYLORA prepared. What is loaded in Metricool is unread.
- It does **not** claim either post has published. Both are reported scheduled, provider state PENDING, unwitnessed.
- It does **not** contain a SHA-256 for the Gap Hunt cover. The hash field holds a sentinel that says so in its own value.
- It does **not** claim the alt text matches the image. It was written from the backend `subject` field.
- It does **not** claim any theme, preference, or audience finding. Zero responses exist and `I_ready` is false on every lane.
- It does **not** claim the Chairman publish freeze is lifted. Sequence 499 satisfies its approval condition for two named posts and for nothing else.
- Nothing was published, activated, generated, or altered.
