## 6. Next product batch — ten products, ten fields each

**Rules applied to all ten.** No Shopify record was created or changed for any of them this pass. Where a draft already exists in the store it is named, so nothing is duplicated (the backend's standing rule after the C&W duplication). Every price is **PROPOSED** until the Chairman authorizes it. Fee math uses the rate recorded on order #1004: F = 2.9% × P + $0.30. T is the buyer-state sales tax, passed through, and is left as T. D = $0.00 for a file (the library's running cost belongs in O).

**Shared consent block** — used by every product that touches a real person's name, face, voice, words or story:
> "I am the person in this material, or I have their permission (or their guardian's, if they are under 18). I agree that THYLORA may use it only to make the item I ordered. It will not be posted, sold to anyone else, or used to train anything. I can ask for it to be deleted at any time by writing to ersatzrealityenterprise@gmail.com."

**Shared fulfillment path** (the one that already works for Twelve Miles): Shopify checkout → paid-order webhook → entitlement in `thylora_product_entitlements` → customer signs into the THYLORA library with the checkout email → protected reader or download of an ACTIVE file in `thylora_delivery_assets`. Personalized items need a second path that does not exist yet (submit → consent → review → build → approve → deliver).

---

### 6.1 Birthday and family message cards

- **Existing record:** *THYLORA Celebration Card Studio* (DRAFT, $9.99 price-authorized, tagged NOT-OPEN-FOR-ORDERS — personalized; submit/consent/delivery do not exist). Do not duplicate it.
- **This proposal:** a **non-personalized** companion that can ship on the existing path now — *Family Message Cards: 12 Printable Cards for the Days That Matter*.
- **Customer-facing description:** "Twelve printable cards for birthdays, new babies, graduations, thank-yous, apologies and 'I'm proud of you' — each with a short message you can use as written or finish in your own words. Print at home on card stock, or send the page as a picture. Nothing ships; your copy stays in your THYLORA library."
- **Interior page plan (14 pp.):** 1 cover · 2 how to print/fold · 3–14 one card per page (front art panel + inside message + blank line for your own words) — Birthday (child), Birthday (elder), New baby, Graduation, New job, Thank you, I'm sorry, Proud of you, Get well, Thinking of you, Welcome home, In memory.
- **Image wording:** Cover: "FAMILY MESSAGE CARDS — twelve days worth saying something." Each card: one word on the front ("Twelve." "Welcome." "Proud."), painterly still-life, no faces.
- **Math display:** P $4.99 · F $0.44 · T · D $0.00 → **N = $4.55 − T**. N = B + C + A + O + R: B none (not a help product) · C, O, R to be set · A none.
- **Consent language:** None needed — no personal data. Line in listing: "No names or photos are collected."
- **Rights record:** Original THYLORA text and art; art must be commissioned or generated under the painted-imagery rule (Chairman seq. 604) and logged in `thylora_visual_provenance`.
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $4.99.**
- **Exact blocker:** No art exists; the visual rule requires Chairman-approved painted imagery before any image is generated.
- **Next question:** Should this sit as the free-to-start tier beneath the $9.99 personalized Card Studio, or be sold separately?

### 6.2 Postcards and digital keepsakes

- **Existing record:** *Postcard From Anywhere* (DRAFT, $12.99 authorized, NOT-OPEN-FOR-ORDERS — needs likeness consent and a delivery path).
- **This proposal:** *Keepsake Postcard Pack — EdereAirah Places* (no customer likeness).
- **Customer-facing description:** "Eight postcards from places in the THYLORA world, each with a short 'wish you were here' note from the person who lives there. Print them, frame one, or send the picture to someone you miss."
- **Interior page plan (10 pp.):** 1 cover · 2 "how to print as a postcard" · 3–10 one postcard per page (front: place painting; back: note, stamp box, address lines).
- **Image wording:** Front caption per card: "[Place name] — [one-line fact]". Back: "Wish you were here. — [resident name]".
- **Math display:** P $3.99 · F $0.42 · T · D $0.00 → **N = $3.57 − T**.
- **Consent language:** None (no customer data).
- **Rights record:** Places and residents must be canon-locked (`thylora_world_entities`, name-lock gates) before print; world geography is **not settled** (see *ErsatzV World Map line*, tagged CANON-BLOCKING).
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $3.99.**
- **Exact blocker:** World map/geography not canon-locked; no place paintings exist.
- **Next question:** Which eight places are canon-locked enough to print today?

### 6.3 "Help Me Sell This" creator listing

- **Existing records:** Program THY-ERSATZ-CREATOR-NETWORK-001 (sequence-608 creator lane) and program THY-GLOBAL-HELP-PATH-608 ("Need to post or sell something?"). No Shopify record — correct, because this is an intake, not a product.
- **Customer-facing description:** "Made something and can't get it seen? Tell us what you make and where your post stalls. We'll review your message with you and, if it fits, explore listing a digital version in the THYLORA store. Nothing is listed and no money is split until ownership, consent, price, costs and exactly who gets paid are agreed in writing."
- **Interior page plan (intake + agreement, 4 pp.):** 1 what we can and can't do · 2 intake (what you make, proof you own it, where it's posted now, what "sold" would mean to you) · 3 draft split sheet using both equations · 4 signatures and a 14-day cooling-off period.
- **Image wording:** "YOUR WORK. YOUR NAME. YOUR SPLIT — WRITTEN DOWN FIRST."
- **Math display (example, one $10 creator item):** P $10.00 · F $0.59 · T · D $0.00 → **N = $9.41 − T**; then N = B + C + A + O + R written per creator, e.g. C 70% · O 20% · R 10% · B/A 0% unless a named partner has agreed. **Example only — no split approved.**
- **Consent language:** "I own this work (or have written permission to sell it). THYLORA may show and sell only the version I approve, under my chosen name. I can withdraw it at any time; sales already made stay valid. My benefits, taxes and payment details are my responsibility; THYLORA will tell me what it knows about fees before I sign."
- **Rights record:** A per-creator record: owner, proof, licence scope (non-exclusive, digital only), term, withdrawal right, payout method.
- **Fulfillment path:** Creator's file registered as a delivery asset under the creator's own product; shared path after that. Payout needs a processor — none chosen.
- **Price:** **PROPOSED $0 to apply;** creator sets their own product price.
- **Exact blocker:** No creator agreement drafted; no payout processor; possible benefits impact for low-income creators not reviewed (listed as UNKNOWN in program 608).
- **Next question:** Who pays creators, through what processor, and on what schedule — and who reviews benefits impact before a person in hardship signs?

### 6.4 Finance Understanding Course

- **Existing record:** None in Shopify. Program 600 (Gap-to-Value) and the Money Path Card (§8) are its seeds.
- **Customer-facing description:** "Money moves along paths. This short course shows you how to see them: what you are actually paid, what gets taken before you see it, what interest really costs, and how to read a 'proceeds go to…' promise. Six lessons, each one page of reading and one page of practice with your own numbers. Education only — not financial advice."
- **Interior page plan (14 pp.):** 1 cover · 2 how to use · lessons 1–6 at 2 pp. each — (1) Gross vs. net pay; (2) Fees: flat vs. percent, and why small prices hurt; (3) Interest: the real cost of a $500 loan; (4) Taxes you pay and taxes you pass through; (5) Budgets as paths, not lists; (6) Reading a "proceeds" promise with N = P − F − T − D · 14 answer key.
- **Image wording:** Cover: "WHERE DOES IT GO? — six lessons on the path money takes."
- **Math display:** P $19.00 · F $0.85 · T · D $0.00 → **N = $18.15 − T**. Lesson math shown in full, e.g. "$500 at 25% APR over 12 months: payment $47.52; total repaid $570.27; cost of borrowing $70.27."
- **Consent language:** None collected. Disclaimer: "General education. Not financial, tax or legal advice for your situation."
- **Rights record:** Original text; any rates quoted must carry source and date.
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $19.00.**
- **Exact blocker:** Content not written; every worked example needs an arithmetic check (`ARITHMETIC-CHECK-REQUIRED`, as on *Visual Multiplication Pack*).
- **Next question:** Is the first customer an adult learner or a high-school classroom? That changes the examples and the price.

### 6.5 School Question Course

- **Existing records:** *QYRIS Teacher Deck* (DRAFT; content not written; classroom licence missing), *Kid to Kid — Classroom Conversation Pack* (DRAFT). This course should draw on them, not repeat them.
- **Customer-facing description:** "A five-lesson course for teachers and home educators on teaching students to ask better questions — and to tell what they know from what they guess. Each lesson is one class period with a warm-up, a question game, and an exit ticket."
- **Interior page plan (16 pp.):** 1 cover · 2 teacher's guide · 3 standards map · lessons 1–5 at 2 pp. (open vs closed; evidence vs inference; the next question; asking about people fairly; question to project) · 14–15 printable exit tickets · 16 family letter.
- **Image wording:** "THE NEXT QUESTION — a classroom course in asking."
- **Math display:** P $15.00 · F $0.73 · T · D $0.00 → **N = $14.27 − T** (single teacher). Classroom/site licence priced separately — not proposed until the licence is written.
- **Consent language:** "This course collects no student data. If you share student work with us, remove names first."
- **Rights record:** Original; a classroom licence text is required (single teacher, printing for own students).
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $15.00 (single teacher).**
- **Exact blocker:** Content not written; classroom licence text missing; minors-in-scope review for any student-facing page.
- **Next question:** Which grade band first — upper elementary (grades 4–6) or middle school?

### 6.6 Homelessness Navigation Guide

- **Existing record:** Program THY-GLOBAL-HELP-PATH-608 (inbox connected, zero verified country directories, zero caseworkers). No Shopify record.
- **Hard rule proposed:** **Free to anyone who needs it.** A person in housing crisis never pays for this guide. A "supporter copy" can be bought by people who want to fund it, and Sponsor Access Credits (§7) can cover distribution.
- **Customer-facing description:** "If you are losing your housing, or already without it, this guide helps you find the next door and ask the right question when you get there. It is organized by what you need tonight, this week, and this month. It does not promise a bed or a service; it shows you how to find the one where you are, and what to say. Free to anyone who needs it."
- **Interior page plan (12 pp., per-country editions):** 1 "if you are in danger right now" (local emergency number for that edition) · 2 how to use · 3 tonight: shelter, safe place, warmth · 4 food and water · 5 documents: what to keep, how to replace an ID · 6 health and medication · 7 mail and phone access · 8 benefits: what to ask · 9 work and income · 10 your rights with the source and date · 11 questions to ask at any office · 12 "write to us" page with the help email and what *not* to send first.
- **Image wording:** Cover: "THE NEXT DOOR — a guide for tonight, this week, and this month." No photographs of real unhoused people.
- **Math display:** Person in need: **P = $0.00 → N = $0.00** (no money flows). Supporter copy: P $5.00 · F $0.45 · T · D $0.00 → **N = $4.55 − T**, with B/A declared before sale (e.g., routed to a *named* agreed partner — none exists yet, so A = 0 today).
- **Consent language:** None to read it. For writing in: the program-608 wording — "Please do not send medical records, ID numbers, account details, court papers, or your exact sleeping location in the first email… this is not an emergency service."
- **Rights record:** Every service listed must carry a source URL and a date checked; editions expire and must be re-verified (suggest every 90 days).
- **Fulfillment path:** Free edition: open download page (no sign-in). Supporter copy: shared path.
- **Price:** **PROPOSED $0 for anyone in need; $5.00 supporter copy.**
- **Exact blocker:** Zero country directories verified. The first edition cannot be written until one place's services are checked, with sources and dates.
- **Next question:** Which one city or country gets the first verified edition? Program 608 names Baltimore as a pilot place — confirm or change.

### 6.7 Sponsor Access Bundle

- **Existing record:** Program THY-SPONSOR-ACCESS-CREDITS-609 (no funds, no sponsor, rates not approved). Full terms draft in §7.
- **Customer (sponsor)-facing description:** "Fund access for people who can't pay. For every $100 bundle, a published amount of store credit is issued to people referred by an approved help partner. They choose what they need from the eligible catalog. You receive a monthly report of what was issued, redeemed, and still unused. You never receive their names or stories unless they choose to share them."
- **Interior page plan (sponsor pack, 6 pp.):** 1 what your bundle does · 2 the two equations with your numbers · 3 eligible catalog · 4 how people are referred and consent · 5 monthly report sample · 6 terms summary.
- **Image wording:** "ONE DOLLAR STAYS ONE DOLLAR — and you see where it went."
- **Math display (one $100 bundle, by card):** P $100.00 · F $3.20 · T $0.00 (T depends on local law — see §7) · D $0.00 → **N = $96.80**. Then N = B + C + A + O + R at the rates in §7.3 (PROPOSED).
- **Consent language:** see §7.2.
- **Rights record:** Sponsor gets no rights in the content, the beneficiary's identity, or any story.
- **Fulfillment path:** Sponsor pays by invoice (not the public store) → credit pool recorded → partner refers → beneficiary redeems a code at checkout → monthly report.
- **Price:** **PROPOSED $100 per bundle.**
- **Exact blocker:** No sponsor agreement signed; no approved partner; rates not approved; local legal review of gift-card/credit law not done.
- **Next question:** Which help partner will the Chairman ask first to review the terms?

### 6.8 Movement Mathematics

- **Existing record:** *Movement Mathematics* (DRAFT, `gid://shopify/Product/7966242603085`; content not written; minors-in-scope; physical-activity safety tag). Also related: *THYLORA Deep-View Motion & Force Card Pack*. Build on the existing draft; do not create a new one.
- **Customer-facing description:** "Math you can do standing up. Twenty short activities where children count, measure, compare and add with their bodies — steps, jumps, turns and claps — and then write down what they found. Built for kitchens, hallways and classrooms. For ages 6–10, with an adult nearby."
- **Interior page plan (24 pp.):** 1 cover · 2 safety and space check · 3 for the adult · 4–23 twenty activities, one per page (move → count → record → the next question) · 24 progress chart. Includes the sequence-608 "dance your own way" idea as activity 20: everyone hears the same beat, each moves their own way, then counts steps and compares — *there is no single right two-step*.
- **Image wording:** Cover: "MOVEMENT MATHEMATICS — count it with your feet." Illustrations: painted silhouettes, no identifiable children.
- **Math display:** P $7.00 · F $0.50 · T · D $0.00 → **N = $6.50 − T**. Sample inside: "Three hops of 40 cm = 3 × 40 = 120 cm."
- **Consent language:** "Nothing is collected. Do not send us photos or videos of children."
- **Rights record:** Original activities; safety review required; no child likeness.
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $7.00.**
- **Exact blocker:** Content not written or tested; physical-activity safety review not done.
- **Next question:** Who can test five activities with real children, with guardian permission, before the pack is sold?

### 6.9 Evidence vs Inference Cards

- **Existing record:** *Evidence vs Inference Cards* (DRAFT, `gid://shopify/Product/7966242570317`; card set not written; customer on listing: "Teachers, parents, teams — anyone who needs the difference to be obvious."). Build on it.
- **Customer-facing description:** "Thirty cards that train one habit: knowing the difference between what you saw and what you decided it meant. Each card shows a short scene or claim; sort it into EVIDENCE, INFERENCE, or UNKNOWN, then ask the next question. Works for kids at the table, students in class, and teams in a meeting."
- **Interior page plan (18 pp.):** 1 cover · 2 how to play (three ways) · 3–17 thirty cards, two per page · 18 answer key with reasons.
- **Image wording:** Card back: "SAW IT? OR DECIDED IT?" Three sorting headers: **EVIDENCE · INFERENCE · UNKNOWN**.
- **Math display:** P $6.00 · F $0.47 · T · D $0.00 → **N = $5.53 − T**.
- **Consent language:** None collected.
- **Rights record:** Original; any real-world claim used on a card needs a cited source.
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $6.00.**
- **Exact blocker:** Card set not written.
- **Next question:** Should the history cards include contested claims (for example, historical estimates like the Black cowboy figures in §5.2), shown with their sources, so players practise sorting real evidence from repeated inference?

### 6.10 Family History Interview Deck

- **Existing record:** *Family History Interview Deck* (DRAFT, `gid://shopify/Product/7966244569165`; SENSITIVE-SUBJECT; question sequence not written). Related: *My Grandparent's Mind Pack* (COGNITIVE-DECLINE-IN-SCOPE). Build on the deck; keep the memory-loss pack separate.
- **Customer-facing description:** "Fifty questions to ask an elder before the chance is gone — where they grew up, what their parents did, what they were told about the people before them, and what they want remembered. Each card has a follow-up question and a box to note *who said it and when*, so the story can be checked and passed on accurately."
- **Interior page plan (30 pp.):** 1 cover · 2 how to ask (and when to stop) · 3 recording and consent · 4–28 fifty question cards in five rounds (childhood · family and names · work and money · moving and migration · what should be remembered) · 29 "evidence trail" sheet (what was said, what documents might confirm it) · 30 where to look next.
- **Where to look next — built for African-American family research,** because it needs different records and has specific traps:
  - **The 1870 wall.** The 1870 U.S. census is the first in which most formerly enslaved people appear by name. Before 1870, the 1850 and 1860 *slave schedules* list enslaved people only by age, sex and colour under the enslaver's name. So a trail usually stops at 1870 unless another record bridges it.
  - **Bridges.** Freedmen's Bureau records (1865–1872: labour contracts, marriages, rations) and Freedman's Savings Bank records (1865–1874), which often list parents, siblings and former enslavers. Both are digitized and name-indexed through the Freedmen's Bureau Project (FamilySearch with the Smithsonian, 2016).
  - **The surname myth — evidence vs. repeated inference.** It is widely assumed that freed people took their last enslaver's surname. Research on Reconstruction records shows many did not — they chose names from earlier enslavers, relatives, or their own choosing. A shared surname is a lead, not a proof.
  - **DNA, carefully.** Autosomal tests estimate broad regional African ancestry; they rarely name an ethnic group or village with confidence, and the estimates change as reference panels change. Y-DNA studies of African-American men have found that a substantial minority (often reported around 30%) carry a European paternal lineage — a direct genetic record of sexual coercion under slavery. It must be explained to families with care, never presented as a surprise.
  - **Oral history as evidence.** An elder's account is primary evidence of what the family *remembers*. The deck asks who told it, when, and to whom — the same test the Evidence vs Inference Cards teach.
- **Image wording:** Cover: "ASK THEM NOW — fifty questions for the people who remember." Card back: "WHO SAID IT? WHEN?"
- **Math display:** P $9.00 · F $0.56 · T · D $0.00 → **N = $8.44 − T**.
- **Consent language (printed on page 3, to read aloud):** "May I write down or record what you tell me today? I'll use it for our family. I won't post it or share it outside the family unless you say yes. You can skip any question, and you can tell me later to delete something."
- **Rights record:** Original questions; the family owns what the elder says; THYLORA collects nothing.
- **Fulfillment path:** shared path; file-only.
- **Price:** **PROPOSED $9.00.**
- **Exact blocker:** Question sequence not written; sensitive-subject review (grief, trauma, family secrets, slavery-era records) needed before release.
- **Next question:** Should there be a dedicated edition for African-American family research, with the record guide above expanded into its own section?
