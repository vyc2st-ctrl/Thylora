# First help post — Chairman review package (pass 615)

**Record:** `social_content_queue` · `content_code = THY-GLOBAL-HELP-FIRST-POST-608` · production id `THY-TRANS-HELP-607`
**State read 2026-09-25:** `REJECTED_VISUAL_PRE_RENDER_GATE` · approval `REJECTED_REDESIGN_REQUIRED` · `published_at = null` · channel `UNASSIGNED`
**Status of this package: DRAFT — NOT PUBLISHED — NOTHING SCHEDULED.**

## 1. What was read

| Source | What it holds | Evidence |
|---|---|---|
| Caption (608) | 1,454 characters, 245 words, verbatim | `caption-608-verbatim.txt` (copied from `publish_evidence.caption`) |
| Painted first-page preview (613) | `first_page_design_613`: painted city doorway, adults and one wheelchair user, branching walkways; visible math "Money received − costs = amount we can direct to help" | The image file (`/workspace/scratch/7bb1fe5138f0/…png`) lives in another session's scratch space and **could not be opened here**. Its description comes from the backend record only. |
| Chairman ruling on 613 | **REJECTED 2026-09-25** (`chairman_rejection_614`), six reasons; rule: no new image before a scene contract is approved | `../evidence/backend-post-social-visual-raw.json` |
| Earlier still v1 (Phase 2) | Type-only, 1080×1350 | `../../spine-610/first-post/first-post-still.png` (preserved, unchanged) |

Because 613 is rejected, this package offers two stills: **(A)** the type-only still v2 below, which needs no image generation, and **(B)** a painted still that may be made only after scene contract `SC-615-07` is approved (`../batch/SCENE-CONTRACTS.md`).

## 2. Still v2 (type only) — `first-post-still-v2.png`

- Source: `first-post-still-v2.html`. Rendered in Chromium at 1080×1350 (4:5, Instagram feed portrait). Overflow check: content 1278 px fits in a 1278 px frame, so nothing is clipped.
- Phone check: `first-post-still-v2-phone-390.png` is the same image scaled to a 390 px-wide phone. The smallest text (footer, 30 px) displays at about 11 px and is readable. In v1 the smallest text (17 px) displayed at about 6 px and was unreadable.

## 3. Checks requested

| Check | Finding | Evidence / action |
|---|---|---|
| **Exact email spelling** | `ersatzrealityenterprise@gmail.com` — identical in all 15 occurrences across the backend readback and Phase-2 files; matches program 608 `dependencies.company_inbox`. **Risk:** in the caption it is followed by a period ("…gmail.com."), so a copied address can carry the dot. | Edit **E1** puts it on its own line. |
| **Small-screen legibility** | v1 failed (6 px text on a phone). v2 passes (smallest text about 11 px). Caption: the first 125 characters shown before "more" now include the full email address (E1). | `first-post-still-v2-phone-390.png` |
| **Math wording** | The 613 line "Money received − costs = amount we can direct to help" implied a fund, and 614 rejected it. The v1 still showed a $1.99 sale inside a help post. v2 shows the help route (`question → local source + date → next question`) and "Replies are free". Edit **E3** adds `P = $0, N = $0` to the caption: nothing is sold, so no money moves. | still v2; `caption-diff.txt` |
| **Alt text** | Written, §4. | — |
| **Platform fit** | Instagram: 4:5 at 1080×1350 fits; 1,673 characters proposed, under the 2,200 limit. **Markdown asterisks** in the 608 caption (`*where you are*`, `*EdereAirah simulation*`) would show as literal `*` on Instagram and Facebook; edit **E4** removes them. | `caption-615-proposed.txt` |
| **Country-specific invitation** | Present and correct: "No U.S. hotline works everywhere. We will look for the relevant service where you are, show you the source and date." The still says "Any country" and that help depends on a local source. **Truth limit:** program 608 records 0 verified country directories and 0 staffed caseworkers. The post promises a search, not a service. That is accurate, but capacity to answer is unproven. | program 608 `unresolved` |
| **Privacy language** | The 608 caption has safe-first-email wording but **no privacy statement**. Program 608 lists `draft public privacy notice` as not done. Edit **E2** adds: email is not secure; used only to answer; not posted, sold or shared; deleted on request. **E2 is a promise the Chairman must adopt**, because mailbox retention is not yet set. | program 608 `protections.privacy_next` |
| **Duplicate-post risk** | **HIGH.** (1) Sequence 597/604 made "BEFORE YOU CALL THE DOCTOR" (Transmission 001) the first post; 614 states it was "never validly superseded". (2) 608 drafted this help post as "upgraded first post". (3) Phase-2 still v1 and 613 painted preview exist for the same post. (4) A Facebook post was already published on 2026-09-17 (`THY-LOGIC-POST-20260916-A`, object `122095730127479264`). Publishing this as "first" without a ruling would break the first-post record. | `publish_evidence.chairman_rejection_614.continuity`; channel `SOC-FB-ENTERPRISE-001` metadata |
| **World name spelling** | Caption and still use **"EdereAirah"**. The Chairman has typed "EdereAriah" 50 times (last in seq. 550) and "EdereAirah" 29 times (last in seq. 596). No name lock exists. **UNKNOWN — Chairman ruling needed** before it appears in public. | `thylora_query_carryforward` user messages |

## 4. Alt text (for still v2)

> Cream card with a thin black border and bold black text. Heading: "Need help? Tell us where the next step breaks." Any country: send your country or city, language, what you need and any deadline to ersatzrealityenterprise@gmail.com. First email: no ID numbers, medical records, court papers, or where you sleep. Your question, then a local source and the date, then your next question. Replies are free. Not an emergency service. Signed Naya Aven, Director of Access and Follow-Through, a simulated EdereAirah guide; replies come from real people.

## 5. Caption — verbatim 608 and the proposed edits

- Verbatim: `caption-608-verbatim.txt` (unchanged; `caption_state` says keep it until the Chairman finalizes).
- Proposed: `caption-615-proposed.txt` — full diff in `caption-diff.txt`.

| Edit | What | Why |
|---|---|---|
| E1 | Email on its own line, no trailing period | Copy-paste safety; the address shows inside the first 125 characters |
| E2 | Privacy statement (4 sentences) | No privacy statement existed; **needs Chairman adoption** |
| E3 | "Replies are free … (P = $0, N = $0)" | THYLORA math included without implying a fund |
| E4 | Remove Markdown asterisks | Platforms show them literally |

**Store path.** Sequence 611 asked for the store path on the post. It is **left out of this version on purpose.** Three of the four live products cannot currently be downloaded by a buyer (§1 of the report), and program 612 says "fix incomplete fulfillment before scaling traffic." Once the library fix is deployed and witnessed, a line can be added: "Separately, every item in our store shows N = P − F − T − D: ersatzreality.myshopify.com".

## 6. Publishing account

| Account | Account-level record | Channel-level record | Usable for this post? |
|---|---|---|---|
| **Instagram `ersatz.reality`** | `social_account_strategy`: `CONNECTED_VERIFIED` (2026-09-10) | `SOC-IG-ERSATZ-001`: `PUBLISHING_LOCKED`, `PRODUCTION_THAW`; Chairman publish freeze **ACTIVE** since 2026-09-16 ("NO NEW POST OR SCHEDULE WITHOUT CHAIRMAN PREVIEW AND EXPLICIT APPROVAL"); Metricool brand 6877123; witness route: "NO_WITNESS_CHANNEL_IN_SESSION" | **Best candidate.** Needs explicit approval for this one post, plus a posting route that can be witnessed. |
| Facebook "ErsatzReality Enterprise" | `CONNECTED_VERIFIED` (2026-09-10) | `SOC-FB-ENTERPRISE-001`: page identity **unproven**. Two Facebook objects (`1218971981309965` in Metricool; `122095730127479264` owns the post published on 09-17). Login and posting access not witnessed. | **No**, until the Chairman states whether these are one Page or two. |
| YouTube, TikTok | `DEFINED` only | — | No (not suited to a still). |

## 7. Publication gate — every item must be true before posting

1. **Chairman names the canonical first post:** 597/604 "Before You Call the Doctor" or 608 "Need help?" (614 continuity rule).
2. **Chairman approves the still:** v2 type-only as shown, **or** approves `SC-615-07` so a painted still can be made and then approved.
3. **Chairman approves the caption:** verbatim 608, or with any of E1–E4.
4. **Chairman rules on the spelling:** "EdereAirah" or "EdereAriah".
5. **Privacy statement adopted** (E2), with mailbox retention set to match it.
6. **Inbox staffed:** a named person reads `ersatzrealityenterprise@gmail.com`, with a stated reply rhythm (none established; program 608 `service_hours: none`).
7. **Account:** Instagram `ersatz.reality` confirmed; the publish freeze lifted for this single post by explicit approval.
8. **Witness:** the post is made through a route whose result can be read back (Metricool connection or a Chairman screenshot), then a `publication_records` row with the live URL is written.

**Nothing in this package has been posted, scheduled, uploaded to any platform, or emailed.**
