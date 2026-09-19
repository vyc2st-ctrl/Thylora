# BRAMBLE WICK — THE LANTERN THAT WOULDN'T GO OUT
## PROOF-PRODUCT REBUILD PACKET

    WORK CODE      THY-WORK-BRAMBLE-PROOF-PRODUCT-544
    SPINE WRITE    sequence 546 · THY-Q-20260919-BRAMBLE-PROOF-BUILD-546
    READ THROUGH   sequence 544 + newer delta 545
    STATE          DRAFT · CHAIRMAN HOLD · NOT ACTIVATED · NOT PUBLISHED
    IMAGES         NONE GENERATED. SPEC ONLY.

---

# A · BACKEND HANDSHAKE

**Backend reached:** Supabase project `jvsdxhrfhtlgaknhjxlz` (`thylora-dash`), ACTIVE_HEALTHY,
Postgres 17.6, ca-central-1. Reached through the Supabase MCP path. 850 public tables read.

**Spine head at read time:** `thylora_query_carryforward` max `sequence_no` = **545**.

| seq | query_id | what it says |
|---|---|---|
| 543 | THY-Q-20260919-REAL-PRODUCT-REBUILD-543 | All four previews rejected on quality. Preserve plumbing, rebuild interiors. Product quality now outranks technical readiness. |
| **544** | **THY-Q-20260919-BRAMBLE-PROOF-PRODUCT-544** | **One proof product, not four rebuilds. Bramble Wick selected. Full manuscript + page design + illustration packet + provenance + price case. Unknown authorship marked OPEN, never invented. No image generation, activation or publication.** |
| 545 | THY-Q-20260919-VISUAL-STANDARD-RECOVERY-545 | *Newer delta.* Chairman: the visual standard was already achieved and already explained; seeing plain white paper again is a continuity/enforcement failure. **"Bramble proof-product work remains active but should consume this recovered visual standard before any new preview."** |

**Delta 545 is consumed by this packet.** Section H is built from the recovered exemplar
`THY-VIS-TWELVE-MILES-TMF-0004-V5` (approval_state `approved`), not from a new idea.

**Handshake confirmed:** this packet builds on 544 as instructed and obeys 545 as the newer delta.
It does not re-audit the store, does not touch the other three products, generates no images,
activates nothing and publishes nothing.

---

# B · QYRIS PASS

    QYRIS = Question → Yield → Reason → Inspect → Safeguard
    Layer: THY-QYRIS-PLAIN-SPEECH-001 (ACTIVE)

### QUESTION
Can Bramble Wick be rebuilt into something a family would actually pay $1.99 for and look at
twice — with a believable person behind it, a real story, a designed book and a world you can
see past the main character — without inventing a single name the backend does not hold?

### YIELD
A complete 32-page illustrated book: full manuscript (final text, every page), a 32-page design
map with sixteen specified fields per page, a 21-image production packet with continuity locks,
a page design system, a product-origin chain, and a $1.99 value test that the product passes.
Zero images generated. Zero names invented. Eleven OPEN items named exactly.

### REASON
The Chairman's rejection at 543 was not "the PDF is broken." It was "nobody made this."
A technically valid file with a generic interior and no author is indistinguishable from output
a customer can get free. The fix is not more pages — it is **authorship, a real story, and a world
that keeps going behind the character.** This packet establishes that bar on one product so the
other three inherit it instead of each being argued separately.

### INSPECT

**KNOWN**
- Product record, price, SKU, handle, Shopify IDs, cover, rights and delivery route are intact and preserved.
- EdereAirah house voice is recovered verbatim from `thylora_edf_text_blocks` (Twelve Miles for Flour, 50 blocks).
- Bell Crossing is canon, recovered from story text, not invented.
- Canon people used in the manuscript — Uncle Seezin, Caleb, Lottie James, Mr. Pruitt, Mrs. Della, Old Gerald — all pre-exist in the backend.
- Visual grammar is recovered from an already-approved asset with its exact visible maker marks recorded.
- World vocabulary (vlegh, Edereaireum, RUDABAKAH, Keal-lum, INTERFRAME) is canon and locked.

**UNKNOWN — held as UNKNOWN**
- The human author, editor and illustrator of record. No book-author role exists anywhere in the backend. Marked OPEN_AUTHOR / OPEN_EDITOR / OPEN_ILLUSTRATOR.
- The EdereAirah time-region of the Twelve Miles / Bell Crossing material. `ER-PLACE-BELL-CROSSING-001` records this as an OPEN CONFLICT against the four authorized regions.
- The maker of the lamp. `OBJCAT-LAMPS` is a category spine with zero objects and `no_invented_makers`.
- The EdereAirah plant the bramble wick is braided from. No plant-name canon exists; the rosemary-mirror plant name is already a standing Chairman item.
- Whether "Bramble Wick" in the title is the boy Bramble, the lantern, or a place.

**SAFEGUARD**
- WYCK is not silently normalized. The WYCK ↔ Wick conflict is shown in Section F, not resolved.
- No maker, workshop, guild, artist, author, plant, publisher or imprint is invented. Eleven OPEN items.
- No image generated. No activation. No publication. No Shopify write. No price change. No cover change.
- Existing v1 bytes and v2 preview bytes are untouched.
- Earth and EdereAirah layers stay separate; nothing in this book claims Earth history.

**CHAIRMAN APPROVAL REQUIRED: YES** — for the seven decisions in Section L. None of them is
engineering. All seven are authorship, identity or canon rulings only the Chairman can make.

---

# C · EXACT CANON RECOVERED

Everything below was read out of `thylora-dash`. Nothing here is authored by this pass.

### C.1 The product record — PRESERVED UNCHANGED

| field | value | source |
|---|---|---|
| Title | Bramble Wick — The Lantern That Wouldn't Go Out | `thylora_store_product_readiness` |
| SKU | ER-BRAMBLE-WICK-001 | release packet 2026-09-17 |
| Shopify product | `gid://shopify/Product/7956697448525` | verified live |
| Variant | `gid://shopify/ProductVariant/43707803697229` | verified live |
| Handle | `bramble-wick-the-lantern-that-wouldnt-go-out` | verified live |
| Price | **$1.99 USD** | `evidence.price_usd` |
| Status | DRAFT — `active_allowed: false` | not buyable |
| Rights | **PASSED** — original THYLORA work, no third-party rights engaged | `rights_passed: true` |
| Cover | `thylora-bramble-wick-approved-cover.png`, 1254×1254, media `28674415591501` | Chairman-approved seq 495 |
| Cover asset | `THY-VIS-COVER-BRAMBLE-WICK-20260912` v2, approval_state `approved` | `thylora_visual_assets` |
| Delivery | Shopify checkout → orders/paid webhook → entitlement → THYLORA library → `thylora-protected-download` | `delivery_connected: true` |
| Live asset | `THY-DELIVERY-6C7891CF5FCFF948` — 26,310 B, 3 pages, sha `6c7891cf…` | ACTIVE |
| v2 preview | 4,457,406 B, sha `abbeafb3…`, 9 pages, build `THY-ED2-20260917` | NOT ingested |
| Trim | 152.4 × 228.6 mm (6 × 9 in) | v2 preview |
| Packet code | PKT-BRAMBLE-001 | Chairman decision HOLD, 2026-09-19 18:28 |

**Preserved by this packet:** Shopify record, $1.99 as working value, rights work, delivery
plumbing, approved cover. The approved cover — *a single lit lantern burning in a window through
a storm* — **still fits and is now load-bearing**: the west-window lamp is the spine of the
manuscript in Section E. The cover became more correct, not less.

### C.2 Chairman quality hold — the brief this packet answers

> `chairman_quality_hold_2026_09_19` — *"Current interior is unacceptable: plain white pages,
> generic/dumb text treatment, insufficient imagery, insufficient authored-person identity,
> and not worth the listed price."*
>
> must_change: interior visual design · illustrations · authorship identity · page architecture ·
> world-specific detail · customer value
>
> preserve: title · product direction · price unless later changed · rights work · delivery plumbing · cover

### C.3 The house voice — recovered verbatim

From `thylora_edf_text_blocks`, EDF-TWELVE-MILES-FOR-FLOUR-001 (PUBLISHED, 50 blocks). This is
the only finished EdereAirah family story in the backend and it is the voice standard:

> *"Caleb leaned on the corral rail like a man posing for a picture nobody requested."*
> *"Those stones were visible last week." "They are still there." "So is the bottom. I do not plan to visit either."*
> *"Road home is down there. This path is only pointed at it."*
> *"Distance tells you how far the road goes. Never told you what the road might do."*
> *Beside flour he wrote delivered. Beside route he wrote changed. Beside Caleb he wrote nothing.*

Short declaratives. Dialogue does the work. Objects are named and specific. **No narrator ever
explains the meaning.** The book in Section E is written to this standard, not below it.

### C.4 Canon people used in the manuscript

Every person in this book already existed in the backend before this pass.

| person | status in backend | source |
|---|---|---|
| **Uncle Seezin** | `ER-CHAR-UNCLE-SEEZIN-001`, WORKING_CANON, ACTIVE | `thylora_world_entities` |
| **Caleb** | Named character, Twelve Miles for Flour | `thylora_edf_text_blocks` |
| **Lottie James** | Freight driver, Twelve Miles for Flour — *"Driver Lottie James stood directing three men who had each decided not to hear her."* | `thylora_edf_text_blocks` |
| **Mr. Pruitt** | Bell Crossing storekeeper, Twelve Miles for Flour | `thylora_edf_text_blocks` |
| **Mrs. Della** | Camp, Twelve Miles for Flour | `thylora_edf_text_blocks` |
| **Old Gerald** | `ER-CHAR-OLD-GERALD-001`, USER_DEFINED_CANON, ACTIVE | `thylora_world_entities` |
| **Isaiah** | Twelve Miles for Flour — *mentioned in back matter only* | `thylora_edf_text_blocks` |

**Old Gerald flag:** his entity row carries a name, a truth_state and nothing else — no age,
no role, no appearance. In this book he does one physical action and speaks one line. If the
Chairman holds a fuller Old Gerald anywhere, page 9 is where it must be corrected before art.

### C.5 Canon place

**Bell Crossing** — `ER-PLACE-BELL-CROSSING-001`, `CANON_RECOVERED_FROM_STORY_TEXT`, PUBLIC,
`recovered_not_invented: true`. Naming system A: *feature word + crossing; the name is a
wayfinding instruction.* Earth equivalent: **NONE — EdereAirah fictional canon.**

Carries a recorded OPEN CONFLICT, quoted exactly:

> *time_region: "UNKNOWN - OPEN CONFLICT. The Twelve Miles material (wagons, freight, lamp oil,
> trail drives) does not sit comfortably in any of the five authorized EdereAirah time-regions:
> 1700s, 1920s, 1940s, Modern."*
>
> *geography_action_required: "Assign Bell Crossing to an EdereAirah land/region before next
> geography-dependent publication."*

Also recorded: parent_land UNKNOWN, parent_region UNKNOWN, district UNKNOWN. **Not resolved here.**
See Section F, conflict 3, and Section L, decision 3.

### C.6 Canon world vocabulary — `thylora_world_term_registry`

| term | class | state | use in this book |
|---|---|---|---|
| **EdereAirah** | world/planet name | LOCKED | exact spelling everywhere |
| **vlegh** | document / sheet | LOCKED | page 3 is the edition **vlegh** |
| **RUDABAKAH** | Chairman-coined expression + visual cue | LOCKED | **page 15** — *"the sudden face a person makes as though someone has whispered an unexpected word into their ear… marks the instant the next question arrives, sometimes too late to act."* Use rule: *"If a cue is visible, keep it subtle and unnamed."* Honoured — the word never appears in the story text, only in the art direction. |
| **Keal-lum / Kelum** | understanding state | PROVISIONAL | not printed; provisional terms stay out of a customer product |
| **INTERFRAME** | authored visual/camera/motion layer | ACTIVE | credit form on page 32: *"INTERFRAME Visual Direction"* |
| **Edereaireum** | metal | LOCKED | **not used.** No metal in this book is named Edereaireum — that would claim an unknown material property. The lamp is tin. |

### C.7 Governing gates read and obeyed

| gate | state | how this packet obeys it |
|---|---|---|
| `THY-ARTIFACT-AUTHOR-VOICE-001` | LOCKED | *"Every substantive authored artifact must identify a responsible in-world author or team. Generic THYLORA voice is not sufficient."* → Section D names the author slot, states it is OPEN, and **fails the release closed** rather than inventing a name. Its own release rule: *"Release fails closed if author/team, role basis, voice, provenance, visual-floor or render evidence is missing."* |
| `THY-LIVING-STORY-DETAIL-001` | LOCKED | 20 minimum detail lenses. Section G maps every one to specific pages. |
| `THY-FORWARD-QUALITY-FLOOR-001` | LOCKED | *"no_generic_ai_filler"*, *"do_not_go_backward"*, *"upgrade_on_touch"*. 3pp → 32pp, designed. |
| `THY-NAME-DIVERSITY-001` / `-STORY-001` | LOCKED | **Zero new names created.** Every person recovered. |
| `THY-STD-HISTORY-PRESENTATION-001` | ACTIVE | *"EdereAirah history is never labelled mythology."* Page 32 world note presents Bell Crossing as world-layer record, not legend. |
| `THY-ACTIVATION-SPINE-001` | LOCKED | stop_conditions include *"public release requiring rights approval"*. Stopped exactly there. |
| `PAGE-ROYAL-HOUSE-001` | SPEC_ONLY_NO_IMAGE_GENERATED | Its design rules and prohibitions are inherited wholesale into Section H. |
| `time_region_protection_doctrine` | FRAMEWORK_ACTIVE | *"modern technology drift prohibited"*, *"no silent modern-device insertion."* Nothing electric, nothing modern, appears anywhere in 32 pages. |

### C.8 THE RECOVERED VISUAL STANDARD — delta 545

`THY-VIS-TWELVE-MILES-TMF-0004-V5` · `approval_state: approved` · `rights_state: cleared` ·
`provenance_state: documented` · sha256 `1930a5ef80da65…`

> subject: *"Trail party approaching town at dusk with locked Unkle Seezin identity, scene roles,
> causal light, and viewer membrane"*
>
> notes: *"Exact visible in-world marks: **VYC2ST on grain tin; TMF-0004 on wagon hub;
> ErsatzReality on lantern base.**"*

**This is the grammar the Chairman says was already achieved.** Extracted into five enforceable rules:

1. **LOCKED IDENTITY** — a named person is the same person in every frame. Not "a boy." Caleb.
2. **SCENE ROLES** — every visible person is doing a job that belongs to them. No extras standing around.
3. **CAUSAL LIGHT** — light comes from a source in the frame and behaves like that source. A lamp lights what a lamp would light, as far as a lamp would reach, and no further.
4. **VIEWER MEMBRANE** — the fixed viewing-film layer between Earth and EdereAirah. Screen-space fixed, zero parallax, ∂F/∂t ≈ 0, no character awareness, no subject tracking.
5. **EXACT VISIBLE MARKS** — real makers' marks on real objects, readable in frame. This is the single detail that separates the approved exemplar from stock art.

The rejected v2 interior had **none of the five.** That is the enforcement failure named at 545.

### C.9 The v2 page map — what survives

| v2 page (rejected presentation) | disposition in this rebuild |
|---|---|
| 1 Cover | **KEPT** — same approved cover |
| 2 Edition identity | **KEPT** → page 3, rebuilt as the origin-chain vlegh |
| 3 The lanterns in the windows | **KEPT** → pages 5–7 |
| 4 The Wind | **KEPT** → pages 8–10 |
| 5 The Knock | **KEPT** → pages 11–13 |
| 6 What the Lantern Was For | **KEPT** → pages 14–17, now the story's actual hinge |
| 7 "What Mara kept" | **REMOVED — see Section F conflict 2.** Mara is a rejected draft name. Replaced by Lottie James, who is canon. |
| 8 A little question before sleep | **KEPT** → page 31, rebuilt in Seezin form |
| 9 World note | **KEPT** → page 32, expanded to origin chain + object passport |

**Eight of nine beats survive.** The Chairman rejected the *presentation*, not the shape. One beat
is removed because it rests on a name the backend has already rejected.

---

# D · SELECTED AUTHOR STATE

`THY-ARTIFACT-AUTHOR-VOICE-001` requires a responsible author. Searched: `thylora_ip_rights_parties`
(**0 rows**), `thylora_department_personnel` (131 rows), `studio_people` (23 rows),
`thylora_person_identity` (83 rows), `thylora_world_entities` (93 rows), PUBLISHING department
(**0 personnel**), `production_credits` (0 rows).

**No book author, no children's illustrator, no book editor and no imprint exists in the backend.**
Per directive: these stay OPEN.

| role | state | value |
|---|---|---|
| **AUTHOR** | `OPEN_AUTHOR` | No writer of record exists. Twelve Miles for Flour is itself credited only *"An Uncle Seezin trail story"* with no author line, so there is not even a precedent to inherit. **Chairman decision 1.** |
| **WHY THIS PERSON WROTE IT** | `OPEN` — depends on 1 | Cannot be answered until the author exists. The book's *internal* reason is answered and is not a substitute: the story is told from inside the Seezin camp by someone who knows what twenty-one lamps cost in oil. |
| **WHERE THEY LIVE** | `OPEN` — depends on 1 | |
| **WHEN THEY WROTE IT** | `OPEN` — depends on 1 and on the Bell Crossing time-region (decision 3) | |
| **EDITOR** | `OPEN_EDITOR` · two canon candidates, neither selected | **Leah Morgan** — Managing Editor, EdereAirah Newsroom (`thylora_department_personnel`, ACTIVE). Newsroom, not books. · **Sable Reed** — Editor, MATURE_STORY_ROOM. Wrong room for a family title. **Neither is assigned by this pass.** Chairman decision 2. |
| **ILLUSTRATOR** | `OPEN_ILLUSTRATOR` · one strong canon candidate, not selected | **Ivara Sen** — `THY-ART-PER-001`, *Senior Portrait Painter & Provenance Artist*, ACTIVE, 12.0 world-years, origin Amera North Artisan Quarter, residence Artists Court, Capital River Quarter. The *provenance artist* title is an exact fit for a book whose entire visual argument is maker marks and object history. **Recommended, not assigned.** Chairman decision 2. |
| **DESIGNER** | `OPEN_DESIGNER` · canon candidates exist | **Selene Varro** — `THY-BRAND-PER-001`, Creative Director, THYLORA Brand & Identity. · **Amara Vey** — `THY-BRAND-PER-003`, Brand Systems & Typography Designer, 6.5 yrs, Foundry Garden East. Type is the whole interior problem; this is the right desk. **Not assigned.** |
| **PRODUCTION HOUSE** | `OPEN_PRODUCTION` · canon candidate exists | **Tavian Cor** — `THY-BRAND-PER-004`, Brand Production & Asset Steward. |
| **PUBLISHER / IMPRINT** | **RECOVERED — not OPEN** | **ERSATZREALITY × THYLORA.** This is not invented: it is the masthead already printed as block 1 of the published Twelve Miles for Flour EDF, and `ER-STUDIO-001` *ErsatzReality Studios* is CHAIRMAN_DIRECTED canon. The `PUBLISHING` department exists in `thylora_departments` with zero personnel — the imprint is real, the staff list is empty. |
| **VISUAL DIRECTION CREDIT** | **RECOVERED** | **INTERFRAME Visual Direction** — canon credit form, `THY-TERM-INTERFRAME-001`, ACTIVE. |
| **SERIES** | **RECOVERED** | *An Unkle Seezin story.* Matches the published Twelve Miles subtitle form. Note the Unkle/Uncle spelling split recorded in Section F. |

**Consequence, stated plainly.** `THY-ARTIFACT-AUTHOR-VOICE-001` fails release closed when the
author is missing. **This product therefore cannot release on its author line today, and that is
correct behaviour, not a defect.** The manuscript, the design and the art plan are all complete
and all correct. One human decision stands between them and a releasable book, and it is the
decision the Chairman said was missing at 543 — *"no convincing person-authored identity."*
It is not something engineering can supply.

---

# E · FULL MANUSCRIPT

**Working title reading — DECLARED ASSUMPTION, CHAIRMAN DECISION 4.**
The manuscript is written on **Reading B**: *Bramble Wick* names the **lantern and its wick** — a
wick braided from bramble fibre — not the boy Bramble. Reading B is chosen because it is the only
reading that does not silently overwrite `BRAMBLE-CONTINUITY-001`, where Bramble is a 1930s–1940s
classroom presence with a locked appearance, a viewer-plane law and a WYCK relationship, none of
which appear in a trail-era storm story. **Reading A** (the boy Bramble, with WYCK) and **Reading C**
(Bramble Wick as a place name) are live alternatives; Section L states exactly what changes under each.

    BRAMBLE WICK
    The Lantern That Wouldn't Go Out
    An Unkle Seezin story

---

**p.4–5 · ORIENTATION SPREAD** *(no story text — image with one caption line)*

> Bell Crossing. The last hour before dark.

---

**p.6**

> Caleb had the lamps.
>
> It was the smallest job in the camp. Twenty-one of them. Fill, trim, set them in the windows
> before dark.
>
> The riders had the road. Mrs. Della had the fire. Caleb had the lamps.

---

**p.7**

> The little tin one was the worst.
>
> Dented down one side. Stamp on the base worn to two letters nobody could read. It smoked. It
> leaked, not much, but enough that you had to set it on a plate.
>
> It burned a bramble wick, and bramble fibre is rough, and a rough wick wants trimming every
> single night.
>
> He set it in the west window, because that is where it went.

---

**p.8**

> The wind came up at supper.

---

**p.9–10 · SPREAD**

> It came off the ridge the way wind comes when rain has already fallen somewhere you cannot see it.
>
> It took the tarp off the feed wagon. It took the big lamp off the corral post and broke the
> chimney on the post. It took the lantern out of Old Gerald's hand before he reached the door,
> and Old Gerald said a word he would not have said indoors.
>
> By full dark the camp had two lights.
>
> The cook fire, under wet canvas.
>
> And one small tin lamp in a west window, burning a bramble wick.

---

**p.11**

> Somebody knocked.
>
> Not on the door. On the glass. Right beside the lamp.

---

**p.12**

> A woman stood out in it with no hat and her coat buttoned wrong.
>
> "Is this the Seezin camp?"
>
> "Yes ma'am."
>
> "I steered by your window for two miles and I had about decided I made it up."

---

**p.13**

> Her name was Lottie James. She drove freight.
>
> Her wagon was down two miles east with a cracked axle block, and her near horse had gone
> through a fence rail and opened its leg from knee to hock.
>
> "I need light," she said. "Not men. Light."

---

**p.14**

> Caleb went for the oil tin.
>
> He tipped it. He tipped it further. It ran about a cupful, and then it ran air.

---

**p.15–16 · SPREAD**

> Enough for one lamp burning proper for two hours.
>
> Or two lamps burning low for one.
>
> "Two miles," Caleb said. "How many people behind you?"
>
> Lottie looked at him for a second longer than the question took.
>
> "I did not count."
>
> He split the oil.

---

**p.17**

> Half into the tin lamp. Back into the west window, on its plate.
>
> Half into the barn lantern with the wire bail, and that one he carried.

---

**p.18–19 · SPREAD**

> The two miles east were mud to the ankle and then mud to the shin.
>
> Lottie walked in front because she knew the road. Caleb walked behind her because he had the
> light, and light works better behind a person than in front of one. Nobody told him that. He
> watched her shoulders and worked it out.

---

**p.20**

> The wagon leaned over like a man with one boot off.

---

**p.21**

> Lottie blocked the axle with a rail and a rock.
>
> Caleb held the lantern where she said to hold it, which was never where he thought.
>
> "Lower."
>
> "Lower."
>
> "Now do not move."

---

**p.22**

> She cut the lining out of her own coat and wrapped the horse's leg with it, one hand flat on
> its neck the whole time, talking about nothing.

---

**p.23**

> The lantern went orange. Then small. Then blue at the bottom.
>
> "That is it," Caleb said.
>
> "That is enough," said Lottie.

---

**p.24**

> They walked back in the dark with the horse between them, and neither of them said anything
> for a mile, and it was not a bad quiet.

---

**p.25**

> The camp was a black shape with one yellow spot in it.

---

**p.26**

> There was a horse in the yard that had not been there before.
>
> The mail rider was under the awning with his hat off, wringing it out on Mr. Pruitt's step.
>
> "Came off the ridge," he said. "Could not see the road. Saw the window."

---

**p.27**

> Uncle Seezin came in at dawn soaked to the collar. He stood a while looking at the two dead
> lamps on the table.
>
> "How much oil we got?"
>
> "None."
>
> "Then we will get more."

---

**p.28**

> He took the chalk nub out of the tin and went out to the supply board.
>
> Beside LAMP OIL he wrote **double it**.
>
> Beside CALEB the board already said **lamps**.
>
> Caleb waited.
>
> Seezin put the chalk back in the tin and went to eat.

---

**p.29**

> That night Caleb filled twenty-one lamps.

---

**p.30 · FINAL IMAGE**

> He did the tin one last, because it needed the most work.
>
> He trimmed the bramble wick down to clean fibre and set it in the west window on its plate.
>
> Then he stood there a second longer than he had to, looking out at the road.

---

**p.31 · SEEZIN'S QUESTION** *(back matter, in the published Twelve Miles "Talk together" form)*

> **Seezin's question**
>
> Who is out there right now, steering by your window?
>
> ____________________________________________________________________
>
> ____________________________________________________________________
>
> Caleb could keep one lamp bright or two lamps low. What did he give up, and what did he buy?
>
> ____________________________________________________________________
>
> ____________________________________________________________________
>
> Lottie James said "not men, light." Why did she have to say it that way?
>
> ____________________________________________________________________
>
> ____________________________________________________________________

---

**p.32 · WORLD NOTE**

> **Bell Crossing** is a town in EdereAirah. Its name is an instruction: it tells you there is
> water and it tells you where to cross it. Caleb and Uncle Seezin also appear in
> *Twelve Miles for Flour*, later, when Caleb is older and thinks twelve miles means easy.
>
> **The lamp.** Tin, dented, about nine inches to the top of the chimney. The stamp on its base
> is worn down to two letters. **We do not know who made it.** When we find out, we will say so
> here. We will not make it up.
>
> **The bramble wick.** Braided plant fibre, rough, cheap, and it needs trimming every night,
> which is why most people would rather have cotton. **The plant's EdereAirah name is not yet
> recorded.** We will not borrow an Earth one.
>
> ERSATZREALITY × THYLORA · INTERFRAME Visual Direction

---

### Story-structure check

| requirement | where it is |
|---|---|
| CHARACTER | Caleb — canon boy, p.6 |
| DESIRE | He wants a job that counts. Carried by *"It was the smallest job in the camp"* and *"The riders had the road… Caleb had the lamps."* Never stated as a wish. |
| PROBLEM | The storm removes every light but his, and then the oil runs out — p.9–14 |
| CHOICE | One lamp bright, or two lamps low — p.15–16. Made in three words: *"He split the oil."* |
| CONSEQUENCE | Both lamps die early; Lottie finishes in time, and the mail rider comes in off the ridge because the window was still lit — p.23, p.26 |
| EMOTION | p.28 — he waits for the board to change. It does not. |
| WORLD DETAIL | Named in the page map, every page |
| ENDING | p.30 — he trims the wick for tomorrow. Nobody tells him to. No narrator explains it. |
| DIALOGUE | p.12, 13, 15, 21, 23, 26, 27 — carries the hinge |
| NO LESSON VOICE | Zero instances of "here is what we learned", "think about", or school voice. The one didactic line — *light works better behind a person than in front* — is immediately un-taught: *"Nobody told him that. He watched her shoulders and worked it out."* |

---

# F · CANON CONFLICTS — SHOWN, NOT RESOLVED

Four genuine conflicts. Each is recorded with both records. **None is resolved by guessing.**

### CONFLICT 1 · WYCK vs Wick — the product title itself

| record | says | authority |
|---|---|---|
| `bramble_project_registry.wick_continuity` | `canonical_name: "WYCK"` · `spelling_custody_note_2026_09_16: "WYCK is locked and gated by the Chairman. WIC and Wick are voice-to-text or historical draft variants only; current and public-facing work must render WYCK."` | CHAIRMAN_LOCK |
| `bramble_continuity.wyck_name_authority` | `rule: "Never silently normalize WYCK to Wick or WIC."` · `variants_only: ["WIC","Wick"]` | CHAIRMAN_LOCK |
| `thylora_qyris_translation_layer.safeguards.name_rule` | `"Never silently rewrite SEEZIN or WYCK."` | ACTIVE |
| `thylora_world_entities` `CHAR-WICK-001` | `canonical_name: "Wick"` | **CHAIRMAN_CONFIRMED** |
| Shopify product 7956697448525 | title and handle both read **"Bramble Wick"** | LIVE |

**The conflict is real and it is inside the product name.** One Chairman-locked record says
public-facing work must render WYCK. Another Chairman-confirmed record stores the entity as "Wick".
The live storefront title, the approved cover, the handle and the URL all read "Bramble Wick".

**Not resolved.** Nothing in this packet renames anything. Chairman decision 5.

### CONFLICT 2 · "Mara" in the v2 edition is a rejected draft name

| record | says |
|---|---|
| v2 preview page map, page 7 | `"What Mara kept"` — shipped inside build `THY-ED2-20260917` |
| `studio_world_characters` — Mara Quill | `"name proposed and unrelated to rejected Bramble Mara draft"` |
| `thylora_world_entities` `ER-NEWS-LOCAL-REPORTER-001` | Mara Quill was **promoted away** to **Denise Carter** by Chairman selection 2026-09-18 |
| `thylora_world_entities` | **no Mara exists in EdereAirah canon at all** |

**Disposition:** the Mara beat is removed and replaced by **Lottie James**, who is canon, who is
already a freight driver in this exact world, and who already has a recorded character note —
*"stood directing three men who had each decided not to hear her"* — that makes her line
*"I need light. Not men. Light."* a continuation rather than an invention. Recorded to
`thylora_name_variant_dispositions`.

### CONFLICT 3 · Bell Crossing has no authorized time-region

| record | says |
|---|---|
| `ER-PLACE-BELL-CROSSING-001` | *"UNKNOWN - OPEN CONFLICT. The Twelve Miles material (wagons, freight, lamp oil, trail drives) does not sit comfortably in any of the five authorized EdereAirah time-regions"* |
| `time_region_protection_doctrine` | four region rows exist: **1700s · 1920s · 1940s · Modern**. The Bell Crossing note names five. **The fifth is not in the table.** |
| `bramble_project_registry.visual_law` | Bramble's era lock is **`"1930s–1940s"`** — and **1930s is not an authorized region either** |
| `SEC-TIME-ALL-001` | `modern_technology_drift_prohibited: true` · *"no silent modern-device insertion"* |

**Two separate discrepancies:** a named fifth region that does not exist in the table, and a
Bramble era lock whose first decade is unauthorized.

**Handling:** the manuscript stays strictly inside what the Twelve Miles material already shows —
lamp oil, wagons, freight, chalk board, tin awning, horses. Nothing electric, nothing modern,
nothing dated. **The book does not pick a region and does not need one to be read.** It needs one
before geography-dependent publication, exactly as the entity row says. Chairman decision 3.

### CONFLICT 4 · Product-family split — three Bramble lanes

| record | product | state |
|---|---|---|
| `thylora_commercial_product_registry` `THY-KYLIE-BRAMBLE-001` | **"KYLEE Jane Presents: Bramblewick"** — one word — `evidence.newest_continuity: "KYLIE_JANE_BRAMBLEWICK"`, `older_bramble: "HISTORICAL_NOT_CURRENT_HEAD"` | DRAFT_PRODUCT_FAMILY_CREATED |
| `thylora_store_product_readiness` | **"Bramble Wick — The Lantern That Wouldn't Go Out"** — two words | DRAFT, live Shopify record |
| `bramble_project_registry` | **THE BRAMBLE BOX™** / BRAMBLE-CONTINUITY-001 — classroom system, 1930s–1940s | DESIGN_ACTIVE |

Three near-identical names across three different lanes — and the registry row for the first spells
the same person **"Kylie Jane"** in `evidence` while the product title spells it **"KYLEE Jane"**,
and `bramble_project_registry` and `CHAR-BRAMBLE-001` both spell it **"Kylee Jane"**.

**This is the actual reason the title reading is unresolved.** Chairman decisions 4 and 5.

### Also recorded, not conflicts — spelling splits observed

- **Unkle Seezin / Uncle Seezin** — the Trail Table EDF title and `THY-VIS-TWELVE-MILES-TMF-0004-V5` both use **Unkle**; the published Twelve Miles body text uses **Uncle**; the entity is `Uncle Seezin`. QYRIS forbids silently rewriting SEEZIN, so this packet uses **"An Unkle Seezin story"** on the series line (matching the visual asset and the Trail Table title) and **"Uncle Seezin"** in body text (matching the published story). Flagged, not normalized.
- **EdereAirah** — locked spelling used throughout; `EDEREARIAH_NEWSROOM` and `EDEREARIAH_LAW_HOUSE` department codes still carry the older spelling. Not rewritten — `destructive_rewrite_prohibited: true`.

---

# G · COMPLETE PAGE MAP

32 pages. Trim 152.4 × 228.6 mm, preserved from v2. Every page carries the sixteen required fields.
**Zero blank white text pages** — every page has a specified image or ground treatment.

---

## PAGE 1 — COVER
- **PURPOSE** Sell the book in one image. Already approved; do not re-art.
- **TEXT** BRAMBLE WICK / The Lantern That Wouldn't Go Out / An Unkle Seezin story / ERSATZREALITY × THYLORA
- **VISIBLE PEOPLE** None
- **LOCATION** Exterior, a lit window, Bell Crossing
- **TIME** Night · **LIGHT** The lamp, from inside, through wet glass · **WEATHER** Storm
- **OBJECTS** Lantern, window, rain
- **MAKERS** Lamp maker OPEN
- **BACKGROUND LIFE** Rain on glass
- **ILLUSTRATION** **EXISTING APPROVED ASSET.** `THY-VIS-COVER-BRAMBLE-WICK-20260912` v2, 1254×1254, Chairman-approved seq 495, bound to media `28674415591501`. **Not regenerated.**
- **CAMERA** Exterior, level with the sill
- **TEXT PLACEMENT** As approved
- **TRANSITION** Cover → half-title: the light stays on, we go in
- **EDEREAIRAH DETAIL** The single practical lantern serving people — matches the recorded visual brief exactly

## PAGE 2 — HALF-TITLE / IMPRINT
- **PURPOSE** Establish that a publisher exists before the story starts.
- **TEXT** BRAMBLE WICK · The Lantern That Wouldn't Go Out · An Unkle Seezin story · ERSATZREALITY × THYLORA
- **VISIBLE PEOPLE** None · **LOCATION** No scene · **TIME** n/a
- **LIGHT** Warm falloff from the right edge, as if the page is lit by the lamp on page 1
- **WEATHER** n/a
- **OBJECTS** None
- **BACKGROUND LIFE** None
- **ILLUSTRATION** `IMG-BW-02` — full-bleed **ground treatment, not white**: dark oiled-paper texture, the amber falloff, and one faint horizontal haze line from the viewer membrane. Type sits on it.
- **CAMERA** Flat
- **TEXT PLACEMENT** Centred, lower third
- **TRANSITION** Quiet before the record page
- **EDEREAIRAH DETAIL** The membrane appears on page 2 and never changes for 31 pages — that is how the reader learns it is a viewing surface, not weather

## PAGE 3 — EDITION IDENTITY (the vlegh)
- **PURPOSE** The single page that tells a buyer a person, a house and a chain of hands made this. This page is the answer to *"no convincing person-authored identity."*
- **TEXT**
  > **EDITION vlegh**
  > BRAMBLE WICK — The Lantern That Wouldn't Go Out
  > An Unkle Seezin story · Bell Crossing, EdereAirah
  > Written by · OPEN_AUTHOR
  > Illustrated by · OPEN_ILLUSTRATOR
  > Edited by · OPEN_EDITOR
  > Designed by · OPEN_DESIGNER
  > Published by · ERSATZREALITY × THYLORA
  > Visual direction · INTERFRAME
  > Serial · ER-BRAMBLE-WICK-001 · Edition 3 · 32 pages
  > *Names shown as OPEN are not yet recorded. We do not invent them.*
- **VISIBLE PEOPLE** None
- **LOCATION** No scene · **TIME** n/a
- **LIGHT** Flat, even, readable — this is a record page
- **OBJECTS** The vlegh ruled field
- **BACKGROUND LIFE** None
- **ILLUSTRATION** `IMG-BW-03` — ruled ledger field, hand-ruled not machine-ruled, faint ink bleed at the rule ends. Administrative elements live in a footer band only (`PAGE-ROYAL-HOUSE-001` rule).
- **CAMERA** Flat
- **TEXT PLACEMENT** Two-column ledger, labels left, values right
- **TRANSITION** Record → world
- **EDEREAIRAH DETAIL** **vlegh** is the canon word for the sheet. Printing the OPEN slots *on the customer page* is the product's honesty claim and no free AI story will ever make it.

## PAGES 4–5 — ORIENTATION SPREAD
- **PURPOSE** Show that the world continues past the main character before the main character appears.
- **TEXT** One caption line, p.5 lower right: *Bell Crossing. The last hour before dark.*
- **VISIBLE PEOPLE** Eleven, all at work, none of them Caleb: Mr. Pruitt shutting a shutter on the store; a woman carrying a covered basket with one hand on her hat; two men rolling a barrel up a plank; a girl driving four geese off the road with a switch; a rider walking a horse, not riding it, because the horse is favouring a foot; Old Gerald on a stool outside the smithy door with a bucket between his boots; a boy on the store roof passing a nail down to a man on a ladder; the freight wagon being roped down.
- **LOCATION** Bell Crossing main road, looking east toward the ridge
- **TIME** The last hour before dark
- **LIGHT** Low sun under the cloud front — the ridge is already dark, the town is still gold. One lamp is already lit in the store window, too early, because Mr. Pruitt always lights early.
- **WEATHER** Wind up, dust off the road, cloud front stacked on the ridge, not raining yet
- **OBJECTS** Tin awning (recovered from Twelve Miles: *"rain tapped the tin awning"*); freight wagon; barrels; water butt under a downpipe; a ladder; a hand-lettered store board; a mounting block worn dished in the middle; a bootscraper set in the ground by the store step
- **MAKERS** Wagon hub carries a freight number. Store board is hand-lettered — signwriter OPEN. Barrels: cooper OPEN (`OBJCAT-BARRELS`, category spine, zero objects). **Every maker slot on this page is OPEN and none is filled with a guess.**
- **BACKGROUND LIFE** Geese; the favouring horse; a dog under the wagon that does not move for the whole page; shutters going up one by one down the street; smoke bending off the smithy chimney sideways
- **ILLUSTRATION** `IMG-BW-04` (spread). Wide establishing. **Causal light rule governs the whole frame**: the gold is the sun and stops exactly where the cloud shadow starts; the store window lamp lights a circle about four feet across on the boards and no further.
- **CAMERA** Slightly high, from the ridge side, looking down the road. The reader arrives the way Lottie will later.
- **TEXT PLACEMENT** Caption in a clear sky patch, lower right, small
- **TRANSITION** Wide world → one boy with one job
- **EDEREAIRAH DETAIL** The name is a wayfinding instruction — the crossing itself is visible at the far end of the road, which is *why* the town has its name and why people come through it at night

## PAGE 6 — CALEB HAS THE LAMPS
- **PURPOSE** Lock Caleb's identity and his desire without stating the desire.
- **TEXT** *Caleb had the lamps. / It was the smallest job in the camp. Twenty-one of them. Fill, trim, set them in the windows before dark. / The riders had the road. Mrs. Della had the fire. Caleb had the lamps.*
- **VISIBLE PEOPLE** Caleb, front, at a bench. **Mrs. Della** at the cook fire behind him, back three-quarters, lifting a lid. Two riders through the doorway beyond, saddling.
- **LOCATION** Seezin camp, the lamp bench under the lean-to
- **TIME** Dusk · **LIGHT** Daylight from the open side, fire glow from behind Mrs. Della, no lamp lit yet
- **WEATHER** Wind moving the lean-to canvas
- **OBJECTS** Twenty-one lamps in a row, ten filled and ten empty and one apart; oil tin with a spout; wick shears on a string so they do not get lost; a funnel; a rag gone black; a chipped enamel plate the tin lamp stands on
- **MAKERS** Wick shears: smith OPEN (`OBJCAT-KNIVES`). Oil tin: tinsmith OPEN.
- **BACKGROUND LIFE** Mrs. Della's shoulders; the riders' hands on a cinch strap; a cat on the woodpile
- **ILLUSTRATION** `IMG-BW-06`. **Caleb's locked identity is established here** — every later frame matches this face, this build, this coat.
- **CAMERA** Bench height, slightly behind Caleb's shoulder — we are working with him, not watching him
- **TEXT PLACEMENT** Left third, over the shadowed canvas
- **TRANSITION** The job → the one object
- **EDEREAIRAH DETAIL** Twenty-one lamps is the camp's real size — twenty-three people were named at camp in Twelve Miles, so the number is derived from canon, not chosen for sound

## PAGE 7 — THE TIN LAMP
- **PURPOSE** Make the reader care about an ugly object before it matters. This is the page that earns the title.
- **TEXT** *The little tin one was the worst. / Dented down one side. Stamp on the base worn to two letters nobody could read. It smoked. It leaked, not much, but enough that you had to set it on a plate. / It burned a bramble wick, and bramble fibre is rough, and a rough wick wants trimming every single night. / He set it in the west window, because that is where it went.*
- **VISIBLE PEOPLE** Caleb's two hands only
- **LOCATION** The lamp bench · **TIME** Dusk
- **LIGHT** Side daylight, raking hard across the tin so every dent reads
- **WEATHER** n/a
- **OBJECTS** **THE LAMP.** Tin, nine inches to the chimney top. Dent down the left. Solder seam re-run once by a different hand, brighter than the original. Wire bail worn shiny where fingers go. Base stamp worn to two illegible letters. Chimney glass with one old crack stopped with a drilled hole so it cannot run. Bramble wick — braided, rough, fraying. Wick shears, a plate.
- **MAKERS** **OPEN — and the page says so in the art.** The reader is shown a maker's mark they cannot read. `OBJCAT-LAMPS` is a category spine with zero objects, `maker_state: OPEN`, `no_invented_makers`. The story's unreadable stamp is the honest picture of the backend's actual state.
- **BACKGROUND LIFE** Out of focus behind: the row of other lamps, all better than this one
- **ILLUSTRATION** `IMG-BW-07`. **Object portrait.** This is the page where *Senior Portrait Painter & Provenance Artist* is the exact right hire.
- **CAMERA** Close. Nearly macro on the base stamp in an inset.
- **TEXT PLACEMENT** Right column beside the lamp, ragged left
- **TRANSITION** The object → the weather that will test it
- **EDEREAIRAH DETAIL** The re-run solder seam is the whole book in one detail: somebody already repaired this lamp once and kept it. **Repairs and wear are a required visual-language element and this is where they live.**

## PAGE 8 — THE WIND
- **PURPOSE** Turn. One line, one image.
- **TEXT** *The wind came up at supper.*
- **VISIBLE PEOPLE** None in focus; two silhouettes reaching for canvas at the frame edge
- **LOCATION** Camp exterior · **TIME** Just after dark
- **LIGHT** Last blue in the west, fire glow low and being flattened
- **WEATHER** **The turn.** First rain crossing the frame at a hard angle
- **OBJECTS** Canvas lifting, a rope end whipping, a bucket already rolling
- **MAKERS** n/a
- **BACKGROUND LIFE** A horse's head up and turned into the wind
- **ILLUSTRATION** `IMG-BW-08`. Almost all weather. Small figures.
- **CAMERA** Low, wide, sky-heavy
- **TEXT PLACEMENT** One line, dead centre, small, in the darkest band
- **TRANSITION** Single line → full spread. The page break *is* the gust.
- **EDEREAIRAH DETAIL** Rain arriving before its cloud — the exact weather logic already recorded in Twelve Miles: *"Rain had fallen beyond the ridge and arrived before its clouds."*

## PAGES 9–10 — THE LIGHTS GO · SPREAD
- **PURPOSE** Strip the world down to one light.
- **TEXT** *It came off the ridge the way wind comes when rain has already fallen somewhere you cannot see it. / It took the tarp off the feed wagon. It took the big lamp off the corral post and broke the chimney on the post. It took the lantern out of Old Gerald's hand before he reached the door, and Old Gerald said a word he would not have said indoors. / By full dark the camp had two lights. / The cook fire, under wet canvas. / And one small tin lamp in a west window, burning a bramble wick.*
- **VISIBLE PEOPLE** **Old Gerald**, mid-frame, hand still open where the lantern was, mouth open. Two riders hauling on the feed-wagon tarp. Mrs. Della with one arm up holding canvas over the fire.
- **LOCATION** Camp yard, full width
- **TIME** Full dark
- **LIGHT** **The page's whole argument.** Two sources only: fire under canvas (low, orange, bounded by the canvas edge) and the west window (small, yellow, throwing one lit rectangle into the rain). Everything else is blue-black.
- **WEATHER** Full storm, rain in sheets, standing water starting
- **OBJECTS** Broken chimney glass on the post; the dropped lantern; tarp; corral rail; the west window
- **MAKERS** Broken chimney — glassmaker OPEN (`OBJCAT-BOTTLES` / glass, category spine, zero objects)
- **BACKGROUND LIFE** Horses crowded to the lee rail; the dog from page 4 now under the lean-to
- **ILLUSTRATION** `IMG-BW-09` (spread). The west window sits at the **extreme right of the right page**, so the reader's eye ends the spread on the only light left.
- **CAMERA** Yard level, wide
- **TEXT PLACEMENT** Left page, upper left, in the dark. Right page carries almost no type.
- **TRANSITION** The lit window is the last thing seen — and the next page is a knock on it
- **EDEREAIRAH DETAIL** Old Gerald is canon with an almost empty profile. **He does one physical thing and says one unquoted word.** If a fuller Old Gerald exists, correct him here before art.

## PAGE 11 — THE KNOCK
- **PURPOSE** Shock, small and close.
- **TEXT** *Somebody knocked. / Not on the door. On the glass. Right beside the lamp.*
- **VISIBLE PEOPLE** One wet hand against the outside of the glass. No face yet.
- **LOCATION** Interior, at the west window · **TIME** Night
- **LIGHT** The tin lamp from inside — the hand is lit from below and behind, so it reads as a shape before it reads as a hand
- **WEATHER** Rain running down the outside of the pane
- **OBJECTS** The window; the lamp; the plate; running water
- **MAKERS** Window glass — glazier OPEN (`OBJCAT-WINDOWS`)
- **BACKGROUND LIFE** None. Deliberate. The world narrows to one pane.
- **ILLUSTRATION** `IMG-BW-11`. Interior, tight.
- **CAMERA** Interior, at lamp height, looking at the pane
- **TEXT PLACEMENT** Lower left, two short lines
- **TRANSITION** Hand → the person attached to it
- **EDEREAIRAH DETAIL** The viewer membrane's fixed haze line crosses this pane — and because the rain **moves** and the membrane **does not**, this is the page where a reader first feels the difference. `∂F/∂t ≈ 0`, zero parallax, no reaction to the hand.

## PAGE 12 — LOTTIE AT THE WINDOW
- **PURPOSE** Introduce a competent adult who needs something exact.
- **TEXT** *A woman stood out in it with no hat and her coat buttoned wrong. / "Is this the Seezin camp?" / "Yes ma'am." / "I steered by your window for two miles and I had about decided I made it up."*
- **VISIBLE PEOPLE** **Lottie James** — freight driver. Wet through. Hair flat. Coat buttoned one hole out, which is the detail that says she dressed in the dark in a hurry. Driving gloves, one off and held in her teeth earlier — now stuffed in a pocket, one finger hanging out. Caleb's shoulder and ear in the near foreground.
- **LOCATION** The window, from inside · **TIME** Night
- **LIGHT** Lamp on Lottie's face from below through the glass; the rain behind her is unlit
- **WEATHER** Full rain
- **OBJECTS** Her coat; the wrong button; the pane; the lamp
- **MAKERS** Coat — OPEN. Buttons — OPEN.
- **BACKGROUND LIFE** Nothing behind her but dark. The point is that she came out of nothing.
- **ILLUSTRATION** `IMG-BW-12`. **Lottie's locked identity is established here.** Her canon note — *directing three men who had each decided not to hear her* — sets her posture: square, not pleading.
- **CAMERA** Interior, over Caleb's shoulder
- **TEXT PLACEMENT** Right column, dialogue stacked
- **TRANSITION** Who she is → what she needs
- **EDEREAIRAH DETAIL** A wrongly buttoned coat is worth more than a page of description, and it is the kind of detail the recovered exemplar's *scene roles* rule demands

## PAGE 13 — WHAT SHE NEEDS
- **PURPOSE** State the problem in physical terms and give the book its best line.
- **TEXT** *Her name was Lottie James. She drove freight. / Her wagon was down two miles east with a cracked axle block, and her near horse had gone through a fence rail and opened its leg from knee to hock. / "I need light," she said. "Not men. Light."*
- **VISIBLE PEOPLE** Lottie inside now, dripping on the boards. Caleb. Mrs. Della in the doorway with a towel she has not handed over yet.
- **LOCATION** Camp lean-to interior · **TIME** Night
- **LIGHT** The tin lamp carried to the table — **the lit area moves with it**, which is the causal-light rule doing narrative work
- **WEATHER** Heard, not seen
- **OBJECTS** Water pooling off her coat; the towel; the lamp; the table
- **MAKERS** OPEN
- **BACKGROUND LIFE** Mrs. Della's held towel; the pool spreading toward a floor seam
- **ILLUSTRATION** `IMG-BW-13`
- **CAMERA** Table height, three-shot
- **TEXT PLACEMENT** Left column; the three-word line gets its own line and its own air
- **TRANSITION** The need → whether it can be met
- **EDEREAIRAH DETAIL** *"Not men. Light."* is Lottie's canon behaviour turned into dialogue — she refuses the wrong help and names the right help, exactly as she did over the wagon in Twelve Miles

## PAGE 14 — THE OIL TIN
- **PURPOSE** Close the door. No more resource.
- **TEXT** *Caleb went for the oil tin. / He tipped it. He tipped it further. It ran about a cupful, and then it ran air.*
- **VISIBLE PEOPLE** Caleb's hands and forearms
- **LOCATION** The lamp bench · **TIME** Night
- **LIGHT** Lamp on the bench, low and close; the tin's shoulder catches a hard highlight
- **WEATHER** n/a
- **OBJECTS** Oil tin — dented, spouted, seam-soldered, paper label mostly gone with one corner readable; a measure; the funnel
- **MAKERS** Tinsmith OPEN. The label's remaining corner shows part of a mark that is **not legible enough to name** — the same honesty device as the lamp base.
- **BACKGROUND LIFE** Out of focus: the twenty other lamps, all now useless
- **ILLUSTRATION** `IMG-BW-14`. Three-stage action in one frame: tipped, tipped further, air.
- **CAMERA** Close, high, straight down the tin's mouth
- **TEXT PLACEMENT** Under the image, three short lines
- **TRANSITION** No oil → the arithmetic
- **EDEREAIRAH DETAIL** *"it ran air"* — a real sound a real tin makes, and the sort of exact physical knowledge that separates a lived world from a described one

## PAGES 15–16 — THE CHOICE · SPREAD
- **PURPOSE** **The hinge of the book.** The question arrives and it is already too late to answer it well.
- **TEXT** *Enough for one lamp burning proper for two hours. / Or two lamps burning low for one. / "Two miles," Caleb said. "How many people behind you?" / Lottie looked at him for a second longer than the question took. / "I did not count." / He split the oil.*
- **VISIBLE PEOPLE** Caleb and Lottie, both lit by one lamp between them on the table
- **LOCATION** The table · **TIME** Night
- **LIGHT** **One source, centred, between two faces.** The oldest and best arrangement there is, and it is causally exact: the lamp is on the table between them.
- **WEATHER** Rain audible on the tin roof
- **OBJECTS** The cupful of oil in a measure; the tin lamp; the barn lantern with the wire bail brought over and set down; the empty tin on its side
- **MAKERS** Barn lantern — different maker from the tin lamp, **also OPEN**, but visibly a different object: heavier, wire-bailed, a guard cage over the chimney
- **BACKGROUND LIFE** Mrs. Della has gone back to the fire; her shape moves at the edge
- **ILLUSTRATION** `IMG-BW-15` (spread). **This is the RUDABAKAH page.** Left page: Caleb asks. Right page: **Lottie's face at the instant the real question lands on her — the sudden face of someone who has just heard an unexpected word whispered at them.** She did not count. She is counting now, too late. The canon use rule is obeyed exactly: the cue is visible, subtle and **never named in the text.**
- **CAMERA** Table level, two-shot across the lamp
- **TEXT PLACEMENT** Dialogue alternates page to page; *"He split the oil."* sits alone at the bottom right with white space around it
- **TRANSITION** Decision → motion
- **EDEREAIRAH DETAIL** **RUDABAKAH** — `THY-TERM-RUDABAKAH-001`, LOCKED, *"marks the instant the next question arrives, sometimes too late to act."* This is the single most canon-specific beat in the product and it exists nowhere outside THYLORA.

## PAGE 17 — THE SPLIT
- **PURPOSE** Show the cost as a physical act.
- **TEXT** *Half into the tin lamp. Back into the west window, on its plate. / Half into the barn lantern with the wire bail, and that one he carried.*
- **VISIBLE PEOPLE** Caleb, both hands, pouring
- **LOCATION** Bench, then window · **TIME** Night
- **LIGHT** Two lamps now, both burning visibly low — **the flames are smaller than on page 7 and the lit circles are smaller too.** Consistency here is the whole point.
- **WEATHER** n/a
- **OBJECTS** Both lamps; the measure, now empty; the plate
- **MAKERS** OPEN
- **BACKGROUND LIFE** The west window rectangle re-lit, visible through the doorway
- **ILLUSTRATION** `IMG-BW-17`. Two panels in one page: pour left, carry right.
- **CAMERA** Mid, hands-forward
- **TEXT PLACEMENT** Split to match the panels
- **TRANSITION** Split → out the door
- **EDEREAIRAH DETAIL** The plate under the leaking lamp, still there, still doing its job — an object established on page 7 paying off on page 17

## PAGES 18–19 — THE ROAD EAST · SPREAD
- **PURPOSE** Two miles of real effort, and the book's one piece of learning, un-taught immediately.
- **TEXT** *The two miles east were mud to the ankle and then mud to the shin. / Lottie walked in front because she knew the road. Caleb walked behind her because he had the light, and light works better behind a person than in front of one. Nobody told him that. He watched her shoulders and worked it out.*
- **VISIBLE PEOPLE** Lottie ahead, Caleb behind with the lantern low at his knee
- **LOCATION** The east road, open country · **TIME** Deep night
- **LIGHT** **The strictest causal-light page in the book.** The lantern lights: the back of Lottie's coat, the mud immediately around both of them, about eight feet of rut, and the underside of the rain. Beyond that, nothing. The reader should feel how small the light is.
- **WEATHER** Rain easing to steady; wind still up; standing water in the ruts
- **OBJECTS** The lantern, held low and slightly out; boot prints filling with water behind them; a fence line running off into black
- **MAKERS** Fence — OPEN. Boots — OPEN.
- **BACKGROUND LIFE** Something moves in the dark off the road and neither of them turns to look, because on a night like that you do not
- **ILLUSTRATION** `IMG-BW-18` (spread). Mostly darkness with a small warm core. **Deliberately the least "designed" page and the most atmospheric.**
- **CAMERA** Behind and slightly above Caleb — the reader walks third in line
- **TEXT PLACEMENT** Left page top, in the black
- **TRANSITION** The walk → what they find
- **EDEREAIRAH DETAIL** Mud graded in two stages, ankle then shin, is trail knowledge — the same register as *"Those stones were visible last week"*

## PAGE 20 — THE WAGON
- **PURPOSE** One image, one line. The reader should laugh slightly and then stop.
- **TEXT** *The wagon leaned over like a man with one boot off.*
- **VISIBLE PEOPLE** Both, small, arriving at frame left
- **LOCATION** Roadside, two miles east · **TIME** Night
- **LIGHT** Lantern at frame left; the wagon's far side is unlit and the horse is a shape you resolve a second late
- **WEATHER** Steady rain
- **OBJECTS** **Freight wagon**, canvas-topped, near side down, one wheel to the hub; **the cracked axle block**; the near horse standing three-legged with its head low; the load roped, one rope gone slack
- **MAKERS** **Wagon hub carries a freight number, visible and readable** — this is a direct inheritance from the approved exemplar's *"TMF-0004 on wagon hub."* The number itself is **OPEN**; the packet specifies a number **must** be legible there and does not invent its value.
- **BACKGROUND LIFE** The far horse, uninjured, shifting; a lamp bracket on the wagon with no lamp in it
- **ILLUSTRATION** `IMG-BW-20`
- **CAMERA** Slightly low, from the road
- **TEXT PLACEMENT** One line, top
- **TRANSITION** Find → work
- **EDEREAIRAH DETAIL** The empty lamp bracket on her wagon explains why she had no light of her own, and does it without one word of explanation

## PAGE 21 — HOLDING THE LIGHT
- **PURPOSE** Competence, shown. The adult is good at her job and the boy is learning by being corrected.
- **TEXT** *Lottie blocked the axle with a rail and a rock. / Caleb held the lantern where she said to hold it, which was never where he thought. / "Lower." / "Lower." / "Now do not move."*
- **VISIBLE PEOPLE** Lottie under the wagon on one knee. Caleb crouched, arm out, lantern extended.
- **LOCATION** Under the wagon · **TIME** Night
- **LIGHT** Lantern at arm's length, **underlighting everything** — the underside of the wagon bed, Lottie's face from below, the wet rail
- **WEATHER** Rain off the wagon edge in a line
- **OBJECTS** Fence rail as a lever; a rock; the cracked axle block; her tool roll open on a sack so the tools do not go in the mud
- **MAKERS** **The tool roll is the best maker page in the book.** Tools worn to one pair of hands, handles darker where gripped, one tool clearly replaced and newer than the rest. Makers OPEN.
- **BACKGROUND LIFE** The horse's legs at frame edge; the slack rope
- **ILLUSTRATION** `IMG-BW-21`
- **CAMERA** Ground level, under the wagon with them
- **TEXT PLACEMENT** Three commands stacked right, one under the other, with air between
- **TRANSITION** Wagon → animal
- **EDEREAIRAH DETAIL** *"which was never where he thought"* — the entire apprenticeship in six words

## PAGE 22 — THE LEG
- **PURPOSE** The book's tenderness. Earned, not asked for.
- **TEXT** *She cut the lining out of her own coat and wrapped the horse's leg with it, one hand flat on its neck the whole time, talking about nothing.*
- **VISIBLE PEOPLE** Lottie and the horse. Caleb holding the lantern, out of focus behind.
- **LOCATION** Beside the wagon · **TIME** Night
- **LIGHT** Lantern from behind Caleb, so Lottie and the horse are the lit pair and Caleb is a warm-edged silhouette
- **WEATHER** Rain thinning
- **OBJECTS** Her knife; the cut coat, hanging open and clearly ruined; the lining strip; the wound, **shown as a wrapped leg and not as an injury** — the wrapping is what is drawn
- **MAKERS** The knife — worn, resharpened to a shorter blade. Maker OPEN.
- **BACKGROUND LIFE** The horse's ear turned back toward her voice
- **ILLUSTRATION** `IMG-BW-22`. **Child-accessibility rule applies:** the injury is never depicted. Only the care is.
- **CAMERA** Close, low, at the horse's shoulder
- **TEXT PLACEMENT** Bottom, one paragraph
- **TRANSITION** Care → the light running out
- **EDEREAIRAH DETAIL** She ruins her own coat, in the rain, at night, for a horse. Nobody remarks on it.

## PAGE 23 — THE LANTERN GOES
- **PURPOSE** The cost lands.
- **TEXT** *The lantern went orange. Then small. Then blue at the bottom. / "That is it," Caleb said. / "That is enough," said Lottie.*
- **VISIBLE PEOPLE** Both faces, close, lit by almost nothing
- **LOCATION** Beside the wagon · **TIME** Night
- **LIGHT** **A dying oil flame, rendered correctly**: yellow → orange → a small blue base as the wick runs dry. The rest of the frame goes to storm-blue.
- **WEATHER** Rain nearly stopped, wind still
- **OBJECTS** The lantern; the wire bail; the wrapped leg behind
- **MAKERS** OPEN
- **BACKGROUND LIFE** Cloud breaking at the frame's top edge — first sky visible since page 8
- **ILLUSTRATION** `IMG-BW-23`. **The one page where the viewer membrane is most visible**, because the frame is darkest.
- **CAMERA** Very close two-shot
- **TEXT PLACEMENT** Two lines of dialogue, bottom, opposed
- **TRANSITION** Out of light → walk home anyway
- **EDEREAIRAH DETAIL** Blue at the bottom is exactly what a dry oil wick does, and an illustrator who does not know that will get this page wrong

## PAGE 24 — THE WALK BACK
- **PURPOSE** Rest. Let the reader breathe.
- **TEXT** *They walked back in the dark with the horse between them, and neither of them said anything for a mile, and it was not a bad quiet.*
- **VISIBLE PEOPLE** Both, small, with the horse between them
- **LOCATION** The east road · **TIME** Late night
- **LIGHT** **No lamp.** Broken cloud, and whatever the sky gives. First page in the book with no flame in it.
- **WEATHER** Rain stopped, everything running
- **OBJECTS** The dead lantern hanging from Caleb's hand; the horse's wrapped leg, pale against the dark
- **MAKERS** n/a
- **BACKGROUND LIFE** Water running in the ruts, catching the sky
- **ILLUSTRATION** `IMG-BW-24`. Wide, quiet, three small shapes.
- **CAMERA** Distant, level, from ahead on the road
- **TEXT PLACEMENT** One paragraph, low
- **TRANSITION** Darkness → the one spot of yellow ahead
- **EDEREAIRAH DETAIL** *"it was not a bad quiet"* — the book's only interior statement, one line, and it is about two people, not about a lesson

## PAGE 25 — ONE YELLOW SPOT
- **PURPOSE** The payoff of the title, in one image.
- **TEXT** *The camp was a black shape with one yellow spot in it.*
- **VISIBLE PEOPLE** None discernible — they are the dark
- **LOCATION** Approaching camp · **TIME** Late night
- **LIGHT** **One window.** Everything else is shape.
- **WEATHER** Clearing
- **OBJECTS** The camp silhouette; the west window
- **MAKERS** n/a
- **BACKGROUND LIFE** One horse shape at the rail
- **ILLUSTRATION** `IMG-BW-25`. **This frame deliberately rhymes with the approved cover** — a lantern in a window seen from outside, in weather. The cover is the promise; page 25 is the payment.
- **CAMERA** From the road, the exact reverse of page 4–5's arrival
- **TEXT PLACEMENT** One line, bottom centre
- **TRANSITION** The window → who else it brought in
- **EDEREAIRAH DETAIL** *"The lantern that wouldn't go out"* is a literal statement of fact at this point, not a slogan

## PAGE 26 — THE MAIL RIDER
- **PURPOSE** The second consequence — the one Caleb did not plan and never sees coming.
- **TEXT** *There was a horse in the yard that had not been there before. / The mail rider was under the awning with his hat off, wringing it out on Mr. Pruitt's step. / "Came off the ridge," he said. "Could not see the road. Saw the window."*
- **VISIBLE PEOPLE** **The mail rider** — role, not a name, because no mail rider exists in canon and this packet invents no one. **Mr. Pruitt** in his doorway with a lamp of his own now lit.
- **LOCATION** Under the tin awning, Bell Crossing edge · **TIME** Pre-dawn
- **LIGHT** Mr. Pruitt's lamp, and the west window in the background still going
- **WEATHER** Stopped; everything dripping
- **OBJECTS** The mail rider's satchel — **buckled, waxed, and stamped with a route mark that is legible in frame**; the wrung hat; a puddle under the awning drip line
- **MAKERS** Satchel — saddler OPEN. The route mark's value is **OPEN**; the packet requires the mark to exist and be legible, and does not invent it.
- **BACKGROUND LIFE** His horse standing hipshot, steaming; Mr. Pruitt already reaching for a towel
- **ILLUSTRATION** `IMG-BW-26`
- **CAMERA** Mid, from the yard
- **TEXT PLACEMENT** Right column
- **TRANSITION** Second arrival → dawn and Seezin
- **EDEREAIRAH DETAIL** Mr. Pruitt is canon from Twelve Miles and reappears doing exactly what a storekeeper does at dawn after a storm

## PAGE 27 — SEEZIN
- **PURPOSE** The authority figure declines to make a speech.
- **TEXT** *Uncle Seezin came in at dawn soaked to the collar. He stood a while looking at the two dead lamps on the table. / "How much oil we got?" / "None." / "Then we will get more."*
- **VISIBLE PEOPLE** **Uncle Seezin** — canon. Caleb.
- **LOCATION** The lean-to, the table · **TIME** Dawn
- **LIGHT** **First daylight in the book since page 8.** Flat, grey, clean, coming in the open side. Nothing warm. The lamps are dead and the light is free.
- **WEATHER** Cleared; everything wet
- **OBJECTS** **The two dead lamps, side by side on the table** — the tin one on its plate, the barn lantern with its bail down. Both chimneys sooted. Both wicks burned down to nothing.
- **MAKERS** OPEN, both, as established
- **BACKGROUND LIFE** Mrs. Della at the fire; Lottie asleep sitting up in the corner with her ruined coat over her
- **ILLUSTRATION** `IMG-BW-27`. **Seezin's locked identity** — inherited from `THY-VIS-TWELVE-MILES-TMF-0004-V5`, where his identity is explicitly recorded as locked. Any illustrator must match that asset.
- **CAMERA** Table height, Seezin standing so we look up slightly
- **TEXT PLACEMENT** Dialogue right, tight
- **TRANSITION** Words → the board
- **EDEREAIRAH DETAIL** Three lines, no praise. The canon Seezin *"asks a plain question and then gets out of the way while people find out for themselves"* — recovered verbatim from the Trail Table sheet.

## PAGE 28 — THE SUPPLY BOARD
- **PURPOSE** The emotional hit, delivered by a chalkboard.
- **TEXT** *He took the chalk nub out of the tin and went out to the supply board. / Beside LAMP OIL he wrote **double it**. / Beside CALEB the board already said **lamps**. / Caleb waited. / Seezin put the chalk back in the tin and went to eat.*
- **VISIBLE PEOPLE** Seezin's hand and back. Caleb watching from behind, small.
- **LOCATION** The supply board on the lean-to post · **TIME** Morning
- **LIGHT** Flat daylight, raking across the board so old chalk ghosts are visible under the new
- **WEATHER** Clear, cold
- **OBJECTS** **THE BOARD.** Ruled by hand. Two columns. Entries in several different hands over months, half-erased and rewritten — FLOUR, ROPE, LAMP OIL, SALT, and down the right, names with jobs beside them. **CALEB — lamps**, written a while ago in a different hand and not changed. The chalk nub. The tin it lives in, lid hinge broken and mended with wire.
- **MAKERS** Board — camp-made, not bought; the batten across the back is a re-used crate end **with part of a shipper's mark still on it.** Maker OPEN, mark legible-but-partial.
- **BACKGROUND LIFE** Riders moving behind; a horse being led out
- **ILLUSTRATION** `IMG-BW-28`. **The reader must be able to read the board.** This is an information page disguised as a scene, and `THY-LIVING-STORY-DETAIL-001` — *"Words/evidence dominate information documents"* — governs it.
- **CAMERA** Over Caleb's shoulder, board flat to frame so it is readable
- **TEXT PLACEMENT** Body text left; the board's own lettering is art, not type
- **TRANSITION** Nothing changed → so what does he do
- **EDEREAIRAH DETAIL** The board is a canon device — *"Beside flour he wrote delivered. Beside route he wrote changed. Beside Caleb he wrote nothing."* Here it is inverted: **the board does not stay blank, it stays the same**, which is worse and better.

## PAGE 29 — TWENTY-ONE LAMPS
- **PURPOSE** The answer, given by action, one page early so the last page can be still.
- **TEXT** *That night Caleb filled twenty-one lamps.*
- **VISIBLE PEOPLE** Caleb, working
- **LOCATION** The lamp bench · **TIME** Dusk, next day
- **LIGHT** **Exactly the light of page 6**, one day later. Same hour, same fall of light, same bench.
- **WEATHER** Calm. Still air. The difference from page 6 is the weather and nothing else.
- **OBJECTS** Twenty-one lamps; a **full** oil tin — new, the paper label whole and readable-as-a-label though the maker mark is **still OPEN**; the funnel; the shears
- **MAKERS** The new tin is visibly a **different** tin from page 14's — that is the *"double it"* actually arriving, shown and never mentioned
- **BACKGROUND LIFE** Lottie's repaired wagon visible out the open side, being loaded; the horse standing on four legs
- **ILLUSTRATION** `IMG-BW-29`. **Rhymes with page 6 deliberately** — same camera, same bench, same boy, everything else changed.
- **CAMERA** **Identical to page 6.** The rhyme only works if the camera does not move.
- **TEXT PLACEMENT** One line, top left, where page 6's first line sat
- **TRANSITION** The routine → the one lamp that is not routine
- **EDEREAIRAH DETAIL** The wagon being loaded in the background is the whole consequence of the book, handled as background life

## PAGE 30 — THE LAST PAGE
- **PURPOSE** End on an action and get out. No moral, no summary, no wink.
- **TEXT** *He did the tin one last, because it needed the most work. / He trimmed the bramble wick down to clean fibre and set it in the west window on its plate. / Then he stood there a second longer than he had to, looking out at the road.*
- **VISIBLE PEOPLE** Caleb, from behind, at the window
- **LOCATION** The west window · **TIME** Dusk
- **LIGHT** The tin lamp, newly lit, throwing its rectangle out onto the wet yard; last daylight behind the ridge
- **WEATHER** Clear evening
- **OBJECTS** The tin lamp; the plate; the trimmed wick; the shears set down; the window
- **MAKERS** The base stamp is in frame again, **still unreadable.** Ending the book on the OPEN slot is the point.
- **BACKGROUND LIFE** The road, empty, going east toward the ridge — where Lottie came from and where Twelve Miles for Flour will go
- **ILLUSTRATION** `IMG-BW-30`. **Reverse of page 11.** Page 11 looked *at* the window from inside with a hand outside; page 30 looks *out* through it with a boy inside. The book closes its own shape.
- **CAMERA** Behind Caleb, over his shoulder, out the window
- **TEXT PLACEMENT** Lower left, over the interior dark
- **TRANSITION** Story → back matter
- **EDEREAIRAH DETAIL** He is not looking at the lamp. He is looking at the road. **That is the ending, and no sentence explains it.**

## PAGE 31 — SEEZIN'S QUESTION
- **PURPOSE** The family-use page. Turns a five-minute read into a conversation.
- **TEXT** As set out in Section E, p.31
- **VISIBLE PEOPLE** None
- **LOCATION** No scene · **TIME** n/a
- **LIGHT** Flat, readable
- **OBJECTS** Ruled writing lines
- **BACKGROUND LIFE** None
- **ILLUSTRATION** `IMG-BW-31` — **not a blank page.** A quarter-height header band: the tin lamp in outline at reading size, the ruled vlegh field, a footer rule. The writing lines are **real ruled lines you can write on**, matching the published Twelve Miles "Talk together" page exactly.
- **CAMERA** Flat
- **TEXT PLACEMENT** Question, rule, rule. Three times.
- **TRANSITION** Conversation → the world behind it
- **EDEREAIRAH DETAIL** *"Seezin's question"* is an established canon device carried straight from the Trail Table sheet — *"He asks a plain question and then gets out of the way."*

## PAGE 32 — WORLD NOTE
- **PURPOSE** Re-entry into the world, and the honesty page.
- **TEXT** As set out in Section E, p.32, plus footer: serial, edition, rights line, ERSATZREALITY × THYLORA, INTERFRAME Visual Direction, QR RESERVED block
- **VISIBLE PEOPLE** None
- **LOCATION** No scene · **TIME** n/a
- **LIGHT** Flat
- **OBJECTS** Small line-drawn object passport: the tin lamp with its dimensions and its unreadable base stamp called out
- **BACKGROUND LIFE** None
- **ILLUSTRATION** `IMG-BW-32` — object-passport plate: the lamp in orthographic line, dimensioned, with a magnified inset of the worn base stamp labelled **MAKER — NOT RECORDED**
- **CAMERA** Flat, technical
- **TEXT PLACEMENT** Two columns. **All administrative elements — QR RESERVED, serial, edition, rights — in the footer band only** (`PAGE-ROYAL-HOUSE-001`).
- **TRANSITION** End
- **EDEREAIRAH DETAIL** **"We do not know who made it. When we find out, we will say so here. We will not make it up."** — a working continuity rule printed on a customer page. It is also the sentence that most distinguishes this product from anything generated free.

---

### Living-story detail lenses — all twenty, mapped

| lens | pages |
|---|---|
| person | 6, 12, 13, 21, 22, 26, 27 |
| place | 4–5, 25, 32 |
| time of day | 4–5, 8, 24, 27, 29 |
| weather | 8, 9–10, 18–19, 23, 24 |
| route / trail | 18–19, 20, 24 |
| destination | 13, 20, 25 |
| neighbour / block / town | 4–5, 26 |
| food and supplies | 6, 14, 28, 29 |
| prices / economy | 28 (the supply board is the camp's economy) |
| objects and makers | 7, 14, 20, 21, 26, 28, 32 |
| clothing and materials | 12, 22 |
| transport / animals | 4–5, 20, 22, 24, 29 |
| security / risk | 9–10, 18–19 |
| tools (only when story-relevant) | 21 |
| relationships | 15–16, 21, 24, 27, 28 |
| what happened before | 7 (the re-run solder seam), 28 (old chalk under new) |
| what may happen next | 30 (the road east), 32 (Twelve Miles) |
| what is known | 32 |
| what remains unknown | 7, 14, 32 — **printed for the customer** |
| visual continuity | locked identities + the fixed membrane, all 32 pages |

---

# H · PAGE DESIGN SYSTEM

Built from the recovered standard at delta 545 and `PAGE-ROYAL-HOUSE-001`.

### H.1 Format
- Trim **152.4 × 228.6 mm**, portrait — preserved from v2 build `THY-ED2-20260917`
- **32 pages**, 8-page signature multiple, printable if the Chairman ever wants print
- Screen-first: readable at iPad portrait full-page and at phone width one page at a time
- Margins: outer 14 mm, inner 18 mm, head 16 mm, foot 20 mm. Foot is deepest because the footer band lives there.

### H.2 The four page classes — no page is "just text"

| class | pages | ground | type |
|---|---|---|---|
| **FULL-BLEED SPREAD** | 4–5, 9–10, 15–16, 18–19 | image to all four edges | type in a dark or quiet zone of the art, never in a box |
| **IMAGE-DOMINANT** | 8, 11, 12, 20, 22, 23, 24, 25, 26, 30 | image 60–75% of page | type in the remaining band, ragged right |
| **OBJECT / WORKING PAGE** | 6, 7, 13, 14, 17, 21, 27, 28, 29 | image 45–60%, object rendered at near-real size | type in a proper column |
| **RECORD PAGE** | 2, 3, 31, 32 | **textured ground, never white**: dark oiled paper or ruled vlegh field | ledger setting, two columns, footer band |

**There is no fifth class. There is no plain white text page anywhere in the book.** That is the
enforcement answer to delta 545.

### H.3 Colour and light — inherited, not invented
- **THY-VISUAL-002 Amber Glaze** governs every lit night page: *"Not sepia. Color lives under amber atmosphere. Gold reads as gold. Skin reads as skin. Watching a living world through fire-warmed old glass."* The whole storm half of the book is an amber core inside a storm-blue field.
- **THY-VISUAL-001 B&W Cinematic Realism** governs the object plates on pages 3 and 32: *"Grain is texture. Darkness has geography."*
- **Causal light is absolute.** Every lit area traces to a flame in frame or to sky. Pages 17, 18–19 and 23 must show the light physically shrinking as the oil goes. If the light does not shrink, the book's argument fails.

### H.4 The viewer membrane
Applied per `bramble_project_registry.visual_law.viewer_plane_separation_2026_09_16`:

    EARTH VIEWER → VIEWING FILM → EDEREAIRAH
    I_seen = W(B(x,y,t)) + F(x,y)        ∂F/∂t ≈ 0

Fixed in screen space, zero parallax, identical on every page, no character awareness, no subject
tracking, no ripple, no glow, no edge, no portal. One faint haze line and a slight density
variation. Strongest read on pages 11 and 23 because those frames are darkest.

**Note for the Chairman:** the membrane law is recorded under `bramble_project_registry`, whose
default clause says *"all EdereAirah imagery uses this viewer-plane separation unless Chairman
explicitly overrides."* Applied here on that clause, not on the assumption that this book is a
Bramble-the-boy title.

### H.5 Typography
- Text face: a serif with real ink weight at 11–13 pt equivalent. **Family is `BRAND-FONT-FAMILY UNKNOWN`** — recorded unknown at the v2 build and still unknown. Specified as PROPOSED, NOT CANON.
- Display: the same family at weight, never a second decorative face
- Dialogue set on its own lines with air; one line per beat on hinge pages
- **Wordmark appears exactly twice** — page 2 and the page 32 footer. `PAGE-ROYAL-HOUSE-001`: *"NO over-branding. The wordmark does not go on every object."*
- **No graphic logo.** `BRAND-THYLORA-MARK` is UNKNOWN / NOT_APPROVED. Typographic wordmark only.

### H.6 Prohibitions — inherited wholesale
- NO cliché motivational filler; no line that would survive being pasted onto a different book
- NO decorative clutter, corner ornaments, or props nobody in the scene would use
- NO over-branding
- NO white text page
- NO QR printed to an unresolved destination — **QR RESERVED box only**, page 32
- NO image generated by this packet; every image block is a SLOT
- NO modern object, anywhere, at any time
- NO injury depicted; page 22 draws the wrapping, not the wound
- NO glowing barrier, portal, bubble, force field or edge
- NO invented maker name, workshop, guild, imprint or author on any page

### H.7 Continuity locks — binding on every image
1. **CALEB** — locked at `IMG-BW-06`. Same face, build, coat, hands in all eleven appearances.
2. **LOTTIE JAMES** — locked at `IMG-BW-12`. Wrongly buttoned coat until page 22, where she cuts its lining, and the coat is visibly ruined from then on.
3. **UNCLE SEEZIN** — locked to `THY-VIS-TWELVE-MILES-TMF-0004-V5`, where his identity is explicitly recorded as locked. **Do not re-invent him.**
4. **THE TIN LAMP** — locked at `IMG-BW-07`. Same dent, same re-run solder seam, same drilled crack stop, same unreadable two-letter base stamp, in all eight appearances.
5. **THE BARN LANTERN** — locked at `IMG-BW-15`. Visibly a different object: heavier, wire bail, guard cage.
6. **THE MEMBRANE** — identical on all 32 pages.
7. **CAMERA RHYME** — page 29's camera is identical to page 6's. Page 30 is the reverse of page 11. Page 25 rhymes with the cover.

---

# I · ILLUSTRATION PRODUCTION LIST

**21 images. NONE GENERATED. This is a specification, not a request.**
Image generation requires separate Chairman authorization per sequence 543 and 544.

`IMG-BW-01` is the **existing approved cover** and is not to be regenerated.

| ID | page(s) | subject | people | wardrobe | place | time | action | key objects | maker details | composition | continuity locks |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **IMG-BW-01** | 1 | **EXISTING ASSET — DO NOT REGENERATE.** `THY-VIS-COVER-BRAMBLE-WICK-20260912` v2, approved seq 495 | — | — | — | — | — | — | — | — | Cover is the visual promise pages 25 and 30 pay off |
| IMG-BW-02 | 2 | Half-title ground | none | — | none | — | — | none | — | Full-bleed dark oiled-paper texture, amber falloff right, one membrane haze line | Membrane established page 2 |
| IMG-BW-03 | 3 | Edition vlegh field | none | — | none | — | — | ruled ledger field | hand-ruled, ink bleed at rule ends | Two-column ledger, footer band | vlegh is canon term |
| IMG-BW-04 | 4–5 | Bell Crossing, last hour before dark | 11, all working, no Caleb | period working dress, no uniformity | Bell Crossing main road, looking east to ridge | last hour before dark | town shutting down ahead of weather | tin awning, freight wagon, barrels, water butt, ladder, hand-lettered store board, dished mounting block, bootscraper | wagon hub freight number legible, value OPEN; signwriter OPEN; cooper OPEN | Wide establishing, slightly high from ridge side | Causal light: sun stops at cloud shadow; store lamp lights 4 ft of board and no more |
| IMG-BW-06 | 6 | Caleb at the lamp bench | Caleb; Mrs. Della at fire behind; 2 riders through doorway | Caleb's coat — **locked here** | camp lean-to | dusk | filling lamps | 21 lamps, oil tin, wick shears on a string, funnel, blackened rag, enamel plate | shears smith OPEN; tin tinsmith OPEN | Bench height, over Caleb's shoulder | **CALEB IDENTITY LOCK.** Camera repeated exactly at page 29 |
| IMG-BW-07 | 7 | The tin lamp, object portrait | hands only | — | lamp bench | dusk | setting the lamp down | **THE LAMP** — 9 in, dent left side, re-run solder seam brighter than original, worn wire bail, base stamp worn to 2 illegible letters, chimney crack stopped with a drilled hole; bramble wick braided and fraying | **MAKER OPEN.** `OBJCAT-LAMPS` category spine, zero objects, no_invented_makers. Stamp shown unreadable | Close; macro inset on base stamp | **LAMP IDENTITY LOCK.** Recurs pages 9, 11, 13, 17, 25, 27, 30, 32 |
| IMG-BW-08 | 8 | The wind arrives | 2 silhouettes at frame edge | — | camp exterior | just after dark | reaching for canvas | lifting canvas, whipping rope end, rolling bucket | — | Low, wide, sky-heavy | Rain arrives before its cloud — canon weather logic |
| IMG-BW-09 | 9–10 | The lights go | **Old Gerald** mid-frame; 2 riders on tarp; Mrs. Della holding canvas over fire | period, soaked | camp yard, full width | full dark | lantern taken from Old Gerald's hand | broken chimney glass on post, dropped lantern, tarp, corral rail, **the west window** | glassmaker OPEN | Spread; **west window at extreme right edge of right page** | **Two light sources only.** Everything else blue-black. Old Gerald canon profile thin — correct before art |
| IMG-BW-11 | 11 | The knock | one wet hand on glass, no face | — | interior at west window | night | knocking on the pane | window, lamp, plate, running water | glazier OPEN | Interior, lamp height, at the pane | **Membrane most readable here** — rain moves, membrane does not |
| IMG-BW-12 | 12 | Lottie at the glass | **Lottie James**; Caleb's shoulder foreground | **coat buttoned one hole out — locked**; hair flat; gloves in pocket, one finger out | the window from inside | night | asking if this is the camp | her coat, the wrong button, the pane, the lamp | coat & buttons OPEN | Interior, over Caleb's shoulder | **LOTTIE IDENTITY LOCK.** Posture square, never pleading — from her canon note |
| IMG-BW-13 | 13 | What she needs | Lottie inside; Caleb; Mrs. Della with an unhanded towel | Lottie dripping | camp lean-to | night | stating the problem | water pooling, towel, lamp carried to table | OPEN | Table height, three-shot | **Lit area moves with the lamp** |
| IMG-BW-14 | 14 | The oil tin runs air | Caleb's hands and forearms | sleeves pushed up | lamp bench | night | tipping the tin | oil tin — dented, spouted, seam-soldered, paper label mostly gone, one corner readable | **tinsmith OPEN**; remaining label corner deliberately not legible enough to name | Close, high, down the tin's mouth; 3-stage action in one frame | Tin must read as a **different** tin from page 29's new one |
| IMG-BW-15 | 15–16 | **The choice — RUDABAKAH** | Caleb and Lottie across one lamp | as locked | the table | night | he asks how many are behind her; she answers | cupful in a measure, tin lamp, **barn lantern brought over**, empty tin on its side | barn lantern maker OPEN, visibly a different maker | Spread, table level, two-shot across the flame; **"He split the oil." alone bottom right with air** | **RUDABAKAH on Lottie's face, subtle, unnamed in text.** `THY-TERM-RUDABAKAH-001` LOCKED. **BARN LANTERN IDENTITY LOCK** |
| IMG-BW-17 | 17 | The split | Caleb, both hands | as locked | bench, then window | night | pouring half and half | both lamps, empty measure, the plate | OPEN | Two panels in one page | **Both flames visibly smaller than page 7. Lit circles smaller.** |
| IMG-BW-18 | 18–19 | The road east | Lottie ahead, Caleb behind with lantern low | Lottie's coat still whole here | east road, open country | deep night | walking two miles in mud | lantern held low and out, boot prints filling with water, fence line into black | fence OPEN, boots OPEN | Spread; behind and above Caleb; mostly darkness, small warm core | **Strictest causal light: ~8 ft of rut, Lottie's back, the underside of the rain. Nothing beyond.** |
| IMG-BW-20 | 20 | The wagon down | both, small, arriving frame left | as locked | roadside 2 miles east | night | arriving | **freight wagon** canvas-topped, near side down, wheel to the hub; cracked axle block; near horse three-legged, head low; roped load with one slack rope; **empty lamp bracket** | **wagon hub freight number legible in frame, value OPEN** — inherited from the approved exemplar's TMF-0004 hub mark | Slightly low, from the road | Empty lamp bracket explains why she had no light — never stated |
| IMG-BW-21 | 21 | Holding the light | Lottie on one knee under the wagon; Caleb crouched, arm out | as locked | under the wagon | night | blocking the axle | fence rail as lever, rock, cracked axle block, **tool roll open on a sack** | **tools worn to one pair of hands; handles darker where gripped; one tool clearly newer** — makers OPEN | Ground level, under the wagon | Underlighting: wagon underside, her face from below, wet rail |
| IMG-BW-22 | 22 | The leg | Lottie and the horse; Caleb out of focus behind with lantern | **coat cut open and ruined from here on** | beside the wagon | night | wrapping the leg, hand flat on the neck | her knife, the cut coat, the lining strip, **the wrapped leg** | knife resharpened to a shorter blade, maker OPEN | Close, low, at the horse's shoulder | **NO WOUND DEPICTED — the wrapping only.** Child-accessibility rule |
| IMG-BW-23 | 23 | The lantern goes | both faces, very close | as locked | beside the wagon | night | the flame dying | the lantern, the wire bail, the wrapped leg behind | OPEN | Very close two-shot | **Flame: yellow → orange → small blue base as the wick runs dry.** Membrane most visible — darkest frame |
| IMG-BW-24 | 24 | The walk back | both, small, horse between them | as locked, coat ruined | east road | late night | walking home in silence | dead lantern hanging from Caleb's hand, pale wrapped leg | — | Distant, level, from ahead on the road | **No flame in frame.** Only broken-cloud sky |
| IMG-BW-25 | 25 | One yellow spot | none discernible | — | approaching camp | late night | arriving | camp silhouette, **the west window** | — | From the road — exact reverse of IMG-BW-04's arrival | **Deliberately rhymes with the approved cover.** One light in a black shape |
| IMG-BW-26 | 26 | The mail rider | **mail rider (role, unnamed — no canon person exists)**; **Mr. Pruitt** in his doorway | rider soaked, hat off | under the tin awning, Bell Crossing edge | pre-dawn | wringing out his hat | **satchel — buckled, waxed, route mark legible**, wrung hat, puddle at the drip line | saddler OPEN; **route mark must be legible, value OPEN** | Mid, from the yard | Mr. Pruitt is canon. His horse hipshot and steaming. West window still lit in background |
| IMG-BW-27 | 27 | Seezin at dawn | **Uncle Seezin**; Caleb; Mrs. Della at fire; Lottie asleep sitting up under her ruined coat | Seezin soaked to the collar | the lean-to, the table | dawn | looking at two dead lamps | **the two dead lamps side by side** — tin one on its plate, barn lantern with bail down, both chimneys sooted, both wicks burned to nothing | OPEN, both | Table height, Seezin standing, slight up-angle | **SEEZIN IDENTITY LOCKED TO `THY-VIS-TWELVE-MILES-TMF-0004-V5`.** First daylight since page 8, flat and grey |
| IMG-BW-28 | 28 | The supply board | Seezin's hand and back; Caleb behind, small | — | the lean-to post | morning | writing *double it* | **THE BOARD** — hand-ruled, two columns, months of entries in several hands half-erased and rewritten: FLOUR, ROPE, LAMP OIL, SALT; right column names and jobs; **CALEB — lamps** in an older hand, unchanged. Chalk nub; its tin with a wire-mended hinge | board camp-made; **batten is a re-used crate end with part of a shipper's mark still on it** — maker OPEN, mark partial | Over Caleb's shoulder, **board flat to frame and fully readable** | Old chalk ghosts visible under new. The board **stays the same** — that is the beat |
| IMG-BW-29 | 29 | Twenty-one lamps, next night | Caleb working | as locked | lamp bench | dusk, next day | filling lamps | 21 lamps; **a full, visibly new oil tin**; funnel; shears | new tin is a different object from IMG-BW-14's — maker still OPEN | **CAMERA IDENTICAL TO IMG-BW-06** | Same hour, same light, same bench. Only weather and the tin changed. Lottie's repaired wagon loading in background, horse on four legs |
| IMG-BW-30 | 30 | The last page | Caleb from behind at the window | as locked | the west window | dusk | trimming the wick, then standing still | tin lamp newly lit, plate, trimmed wick, shears set down | **base stamp in frame again, still unreadable** | Behind Caleb, over his shoulder, out the window — **reverse of IMG-BW-11** | Lamp rectangle on the wet yard. **He is looking at the road, not the lamp** |
| IMG-BW-31 | 31 | Seezin's question header | none | — | none | — | — | tin lamp in outline at reading size; ruled vlegh field; footer rule | — | Quarter-height header band; **real ruled writing lines below** | Matches the published Twelve Miles "Talk together" page |
| IMG-BW-32 | 32 | Object passport plate | none | — | none | — | — | **the tin lamp in orthographic line, dimensioned**, with a magnified inset of the worn base stamp | **inset labelled "MAKER — NOT RECORDED"** | Flat, technical, two columns, footer band | THY-VISUAL-001 B&W register. All admin elements in footer band only |

**Count:** 21 new image slots (`IMG-BW-02` … `IMG-BW-32`, spreads counted once) plus 1 existing
approved cover. Four are full spreads.

**Explicitly withheld:** no prompt is written, no generator is named, no image is produced.
Generation is a separate Chairman authorization.

---

# J · PRODUCT-ORIGIN CHAIN

| link | state | value |
|---|---|---|
| **STORY SOURCE** | ⚠ **OPEN — and this is a real gap** | Searched `idea_registry` (294 rows), `thylora_story_seed_registry`, `thylora_world_design_records`, `thylora_transmission_registry`. **No record ties "The Lantern That Wouldn't Go Out" to any Chairman source, transmission, seed or idea.** The product exists on Shopify with an approved cover and a delivered v1 artifact and **no recorded origin**. This packet rebuilds the story from Bell Crossing canon and the recorded visual brief, so its own origin is traceable — but the *title's* origin is not, and that should be recovered, not authored. **Chairman decision 6.** |
| **WORLD SOURCE** | **RECOVERED** | Bell Crossing, `ER-PLACE-BELL-CROSSING-001`, `CANON_RECOVERED_FROM_STORY_TEXT`. Caleb, Lottie James, Uncle Seezin, Mr. Pruitt, Mrs. Della from `thylora_edf_text_blocks` EDF-TWELVE-MILES-FOR-FLOUR-001 (PUBLISHED). Old Gerald `ER-CHAR-OLD-GERALD-001`. |
| **VISUAL BRIEF** | **RECOVERED** | `thylora_store_product_readiness.evidence.visual_brief`: *"Night storm in EdereAirah with one small practical lantern serving people; weather, wet surfaces, exhaustion and purpose visible; living-art atmosphere, not fantasy-stock lantern art."* The manuscript is built to it line by line. |
| **AUTHOR** | `OPEN_AUTHOR` | No writer of record exists in the backend. Decision 1. |
| **EDITOR** | `OPEN_EDITOR` | Candidates: Leah Morgan (Managing Editor, EdereAirah Newsroom); Sable Reed (Editor, Mature Story Room — wrong room). Neither assigned. Decision 2. |
| **ILLUSTRATOR** | `OPEN_ILLUSTRATOR` | Candidate: **Ivara Sen**, `THY-ART-PER-001`, Senior Portrait Painter & Provenance Artist, ACTIVE, 12.0 world-years. Recommended, not assigned. Decision 2. |
| **DESIGN** | `OPEN_DESIGNER` | Candidates: Selene Varro (`THY-BRAND-PER-001`, Creative Director); Amara Vey (`THY-BRAND-PER-003`, Brand Systems & Typography). Not assigned. |
| **VISUAL DIRECTION** | **RECOVERED** | **INTERFRAME**, `THY-TERM-INTERFRAME-001`, ACTIVE. Credit form: *"INTERFRAME Visual Direction."* |
| **PUBLISHER / IMPRINT** | **RECOVERED** | **ERSATZREALITY × THYLORA** — block 1 of the published Twelve Miles EDF. `ER-STUDIO-001` ErsatzReality Studios, CHAIRMAN_DIRECTED. `PUBLISHING` department exists with zero personnel. |
| **PRODUCTION HOUSE** | `OPEN_PRODUCTION` | Candidate: Tavian Cor, `THY-BRAND-PER-004`, Brand Production & Asset Steward. Not assigned. |
| **DIGITAL PRODUCTION** | **CONNECTED** | Build path: authored edition → PDF → `thylora_delivery_assets` with `content_sha256`. Precedent: `THY-ED2-20260917` built 9pp at 4,457,406 B. v1 `THY-DELIVERY-6C7891CF5FCFF948` ACTIVE and sha-bound. |
| **RIGHTS** | **PASSED** | `rights_passed: true`. Original THYLORA work. No third-party rights engaged. No stock element, no photography, no third-party source image anywhere in the 21 specified illustrations. |
| **DISTRIBUTION** | **CONNECTED, UNWITNESSED AT TRANSPORT** | Shopify checkout → orders/paid webhook → entitlement → THYLORA library sign-in with the checkout email → `thylora-protected-download` serves the ACTIVE asset. Proven at the data layer in a rolled-back transaction 2026-09-17. **`thylora_product_download_audit` still holds 0 committed rows backend-wide** — the HTTP/JWT layer has never been exercised by a real signed-in browser. **Stated as unwitnessed. Not claimed as proven.** |
| **STORE RELEASE** | **HELD** | Shopify status DRAFT, `active_allowed: false`, 0 sales channels. Chairman HOLD recorded 2026-09-19 18:28:39 on PKT-BRAMBLE-001. **Not touched by this pass.** |
| **NO EDF PACKAGE** | **KNOWN GAP, NOT A BLOCKER** | No row in `thylora_edf_packages` for this product, so the in-browser reader returns NO_PUBLISHED_EDF. Download is the delivery medium and does not need one. |

---

# K · $1.99 VALUE TEST

### WHAT DOES THE BUYER RECEIVE?
A **32-page illustrated story edition** as a downloadable PDF, 152.4 × 228.6 mm: a complete story
with 21 original illustrations, a back-matter conversation page with real ruled writing lines, and a
world note with an object passport. Re-downloadable free, non-expiring, from the THYLORA library
using the checkout email. Nothing ships.

### WHY WOULD THEY WANT IT?
It is a bedtime read that takes about seven minutes aloud and leaves a question in the room. It is
the cheapest thing in the store and the only one that shows a child doing the smallest job badly
wanted and well done.

### WHAT WOULD THEY LOOK AT TWICE?
- **Page 7** — the object portrait of an ugly little lamp with a solder seam somebody already re-ran once. Children look at objects longer than they look at faces.
- **Pages 15–16** — one lamp between two faces, and the exact instant Lottie realises she never counted who was behind her.
- **Page 28** — the supply board, readable, months of other people's handwriting on it, with **CALEB — lamps** sitting there unchanged.
- **Pages 6 and 29** — the same camera, the same bench, one day apart. Readers find that rhyme on the second pass, not the first, and finding it is the reward.

### WHAT WOULD A FAMILY DO WITH IT?
Read it aloud in seven minutes. Then page 31: *"Who is out there right now, steering by your window?"*
The lines are real ruled lines, so a child can write on them, which turns a $1.99 download into a
thing that gets kept. It also answers a question a lot of parents are actually trying to answer —
what to say to a kid who thinks their job is too small to matter — without ever saying it.

### WHAT IS MEMORABLE?
*"I need light. Not men. Light."*
And the ending: he trims the wick for tomorrow, and nobody tells him to, and nobody explains it.

### WHAT MAKES IT DIFFERENT FROM A FREE AI STORY?
Six things, all of them checkable:

1. **It is continuous with a world that already exists.** Caleb, Lottie James, Uncle Seezin, Mr. Pruitt, Mrs. Della, Old Gerald and Bell Crossing all pre-existed this book in the backend. A free generator has no yesterday.
2. **It is the prequel to a product already on the shelf.** The same boy, older, in *Twelve Miles for Flour* — already ACTIVE and buyable at $1.99. Two books, one boy, one road. Nothing generated free has a second book.
3. **It prints what it does not know.** Page 3 shows OPEN author slots. Page 32 says *"We do not know who made it. When we find out, we will say so here. We will not make it up."* No generator will ever tell a customer what it does not know.
4. **Every object has a maker slot, filled or explicitly OPEN.** A generator produces a lamp. This produces a lamp with a dent, a re-run seam, a drilled crack stop and a stamp worn past reading.
5. **The light is physically honest.** The oil is split, so the flames shrink, so the lit circles shrink, page by page. That is the story's entire argument carried in the art. Free imagery does not track a consumable.
6. **The world keeps going behind the character.** Page 4–5 has eleven people in it and none of them is Caleb. Every one of them is doing a job that belongs to them.

### DOES IT FEEL WORTH $1.99? — **YES. PASS.**
Seven minutes aloud, 32 designed pages, 21 original illustrations, a writable family page, a world
note, a named conversation question and a direct road into a second product. Against the store's own
recorded readiness formula, the rebuild moves `CUSTOMER_VALUE` from 3 to 5 and
`DISTINCTIVENESS` from 4 to 5: **READINESS 5 × DISTINCTIVENESS 5 × CUSTOMER_VALUE 5 ×
WORLD_CONNECTION 5 × REUSE_POTENTIAL 5 = 3125**, against the 1200 recorded on 2026-09-18.

### SELF-FAIL — stated before the Chairman has to find it
The packet **fails itself on three counts**, and none of them is the story:

1. **It cannot release without an author.** `THY-ARTIFACT-AUTHOR-VOICE-001` fails closed. The manuscript is finished; the author line is empty. That is the whole gap and it is a Chairman decision, not an engineering task.
2. **It has no art yet.** 21 specified slots, zero pixels. The value case above is a promise until the images exist, and image generation is not authorized by this turn.
3. **The title is still unresolved.** Written on Reading B. If the Chairman rules Reading A, pages 6–30 keep their story but gain a second character and the era question reopens hard.

**Recommended Chairman posture:** approve the manuscript and the page map first, and approve the
author line second. Art last. Building 21 illustrations before the title reading is ruled would
put the most expensive work on the least settled ground.

---

# L · CHAIRMAN DECISIONS REQUIRED

Seven. All authorship, identity or canon. None engineering.

### 1 · WHO WROTE IT — *blocking release, not blocking art*
No writer of record exists anywhere in the backend. Options:
**(a)** Name a person, and this packet registers them properly with role basis and voice profile.
**(b)** Open an in-world author role under the `PUBLISHING` department (which exists with zero personnel) and let the Chairman fill it.
**(c)** Publish under the imprint alone — **but `THY-ARTIFACT-AUTHOR-VOICE-001` says generic THYLORA voice is not sufficient when a natural responsible role exists**, and for a storybook it does. (c) contradicts a locked gate.

### 2 · WHO ILLUSTRATES, EDITS AND DESIGNS IT
Named canon candidates, none assigned: **Ivara Sen** (illustrator — *Provenance Artist*, the exact fit), **Leah Morgan** (editor), **Selene Varro** / **Amara Vey** (design), **Tavian Cor** (production). Assigning a person to a role is a Chairman act, not a Claude act.

### 3 · BELL CROSSING'S TIME-REGION
`ER-PLACE-BELL-CROSSING-001` records this as an OPEN CONFLICT and says *"Assign Bell Crossing to an EdereAirah land/region before next geography-dependent publication."* Two sub-items: the entity names **five** authorized regions and `time_region_protection_doctrine` holds **four** (1700s, 1920s, 1940s, Modern) — the fifth does not exist in the table; and the Bramble era lock is **1930s–1940s**, whose first decade is not authorized either.

### 4 · WHAT "BRAMBLE WICK" MEANS IN THE TITLE
- **Reading A — the boy Bramble.** Then this is a Bramble title, WYCK belongs in it, the 1930s–1940s era lock applies, and the trail world of Bell Crossing is the wrong setting. **The manuscript would need rebuilding, not editing.**
- **Reading B — the lantern and its bramble wick.** *Current working reading.* Manuscript stands as written. Cover, title and handle all stay exactly as they are.
- **Reading C — a place name.** Then Bell Crossing is wrong and the world note changes; the story survives with a location swap.

### 5 · WYCK vs Wick — PUBLIC-FACING SPELLING
The live Shopify title, handle, URL and approved cover all read **"Bramble Wick"**, while a Chairman-locked custody note says public-facing work must render **WYCK**. Under Reading B the conflict is moot — *wick* is a noun and WYCK the character never appears. Under Reading A it is immediate and the storefront title, handle and cover are all affected. **Not resolved here.**

### 6 · THE TITLE'S ORIGIN
No record ties *"The Lantern That Wouldn't Go Out"* to any Chairman source. Does the Chairman hold it? It should be **recovered**, not authored.

### 7 · IMAGE GENERATION AUTHORIZATION
21 slots specified. Zero generated. `thylora_image_generation_authorizations` is **empty** — no authorization row exists for anything. Recommended order: rule 4 first, then 1 and 2, then authorize art.

---

# M · EXACT NEXT PRODUCTION STEP

**Exactly one step, and it is not engineering.**

> **The Chairman reads Section E and rules decision 4 — what "Bramble Wick" means — and decision 1 — who wrote it.**

Nothing else is blocked on anything else. On decision 4 = Reading B, the next three steps run with
no further Chairman input:

1. Register the assigned author, editor, illustrator and designer to `thylora_department_personnel` / `thylora_ip_rights_parties` with role basis and voice profile, satisfying `THY-ARTIFACT-AUTHOR-VOICE-001`.
2. Build the 32-page interior to the Section H design system with **image slots as labelled placeholders**, and ingest it as a preview only — **not** into `thylora_delivery_assets`, per the standing rule that binaries ingest on approval and not before.
3. Correct the listing copy. The live Shopify description promises **3 pages**; the rebuild is **32**. Activating against a 3-page claim would make the listing untrue. **Copy correction must land before any activation and has nothing to do with the rebuild's quality.**

**Still forbidden by this turn:** image generation, activation, publication, price change, cover
change, Shopify write, and touching City Power, Last Match or Handoff.

---

# N · RESTART POINT

    RESTART 546 — BRAMBLE WICK PROOF PRODUCT

    Backend read through 544 plus newer delta 545, which is consumed: the recovered visual
    standard is THY-VIS-TWELVE-MILES-TMF-0004-V5 (approved), and its five rules — locked
    identity, scene roles, causal light, viewer membrane, exact visible maker marks — are now
    written into this product's design system as enforceable page rules. The rejected v2
    interior carried none of the five; that is the enforcement failure named at 545.

    DELIVERED: complete 32-page manuscript, final text on every page; 32-page design map with
    all sixteen required fields per page; 21-image production packet with continuity locks;
    page design system with four page classes and no white text page; product-origin chain;
    $1.99 value test, PASS, with three self-declared failures stated before Chairman review.

    PRESERVED UNTOUCHED: Shopify product 7956697448525, variant 43707803697229, handle,
    $1.99, rights_passed, delivery route, approved cover 1254x1254, v1 asset
    THY-DELIVERY-6C7891CF5FCFF948, v2 preview bytes. No Shopify call was made. No image was
    generated. Nothing was activated or published.

    STORY: Caleb has the lamps at the Seezin camp — the smallest job there is. A storm takes
    every light but the tin lamp with the bramble wick in the west window. Lottie James steers
    two miles by it, needing light and not men, for a cracked axle and a horse's opened leg.
    The oil runs out at a cupful. One lamp bright for two hours, or two lamps low for one. He
    asks how many people are behind her; she has not counted; he splits the oil. Both lamps
    die. She finishes in time. The mail rider comes off the ridge because the window was still
    lit. At dawn Seezin writes DOUBLE IT beside LAMP OIL and leaves CALEB — LAMPS unchanged.
    That night Caleb trims the wick again and looks at the road. No line explains it.

    ZERO NAMES INVENTED. Every person recovered: Caleb, Lottie James, Uncle Seezin, Mr.
    Pruitt, Mrs. Della, Old Gerald, Bell Crossing. The one unnamed figure, the mail rider, is
    a role and stays a role because no canon person fills it.

    FOUR CONFLICTS SHOWN, NONE RESOLVED: (1) WYCK-locked vs Wick-confirmed vs the live
    storefront title; (2) "Mara" in the v2 build is a rejected draft name with no canon entity
    — beat removed, replaced by canon Lottie James; (3) Bell Crossing has no authorized
    time-region, the entity names five regions and the doctrine table holds four, and the
    Bramble 1930s era lock is itself unauthorized; (4) three Bramble product lanes with three
    spellings, plus Kylie/Kylee.

    ELEVEN OPEN ITEMS: OPEN_AUTHOR, OPEN_EDITOR, OPEN_ILLUSTRATOR, OPEN_DESIGNER,
    OPEN_PRODUCTION, lamp maker, bramble plant name, Bell Crossing time-region, Bell Crossing
    parent land/region, story-source origin of the title, wagon-hub and mail-satchel mark
    values. RECOVERED, NOT OPEN: publisher ERSATZREALITY x THYLORA, INTERFRAME visual
    direction, series line "An Unkle Seezin story".

    EXACT NEXT STEP: Chairman rules decision 4 (what "Bramble Wick" means) and decision 1
    (who wrote it). On Reading B, three steps then run with no further Chairman input:
    register the credited people; build the 32-page interior with labelled image slots as a
    preview only, not ingested; correct the live listing copy from 3 pages to 32 before any
    activation is even considered.

    HARD STOPS HOLDING: no image generation, no activation, no publication, no price change,
    no cover change, no Shopify write, no work on City Power, Last Match or Handoff.

---

    Prepared under THY-WORK-BRAMBLE-PROOF-PRODUCT-544
    Backend: thylora-dash · jvsdxhrfhtlgaknhjxlz
    QYRIS: THY-QYRIS-PLAIN-SPEECH-001 — Question → Yield → Reason → Inspect → Safeguard
    State: DRAFT · CHAIRMAN HOLD · NOT ACTIVATED · NOT PUBLISHED · NO IMAGES GENERATED
