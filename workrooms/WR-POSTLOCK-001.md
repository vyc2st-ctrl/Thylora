# WR-POSTLOCK-001 · Tomorrow 3-Post Image Lock

**Lane:** STORY_CONTENT / SOCIAL_IMAGE_DIRECTION
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-three-post-lock-vfmr8g`
**Opened:** 2026-09-18
**Carryforward:** reads through seq **460** (`THY-Q-20260918-HERB-FILE-001-460`); writes seq **461**
**State:** DIRECTION LOCKED · NOTHING GENERATED · NOTHING PUBLISHED · NOTHING SCHEDULED

---

## 0 · Backend connection and continuity read

| Step | Result |
|---|---|
| Backend connection | **VERIFIED** — `thylora-dash`, ACTIVE_HEALTHY, Postgres 17.6, ca-central-1 |
| Newest continuity | seq 460 · HERB FILE 001 (willow bark selected, S=2500) · 2026-09-18 00:10:33Z |
| Restart point in force | HERB FILE 001 shelf seeded DESIGN/PROPOSED. Nothing activated, published or scheduled. |
| Barrier rule | **`THY-INTERWORLD-BARRIER-GLOBAL-001`** — LOCKED 2026-09-17 23:46 |
| Approval rule | **`THY-APPROVAL-MUST-BE-VIEWABLE-001`** — LOCKED 2026-09-17 23:51 |
| Generation rule | **`THY-VISUAL-PREFLIGHT-LOCK-001`** — no generation before approval |

### Correction to the prompt's premise

The prompt names the barrier rule as "no swirls / no smoke-like haze / no rainbow interference."
That is the **prohibition half only**. The backend rule that actually governs is
`THY-INTERWORLD-BARRIER-GLOBAL-001`, which additionally carries a **required-form half**
and a **numeric intensity target**. An image that merely avoids swirls still fails this gate
if the barrier is absent, drifting, or out of the 0.18–0.28 band. Both halves are applied
below, automatically, to all three posts.

---

## 1 · THE FIXED BARRIER BLOCK

This block is **appended verbatim** to every image prompt in this workroom and to every
THYLORA image from here forward. It is not re-requested per image.

```
FIXED VIEWER-PLANE BARRIER — THY-INTERWORLD-BARRIER-GLOBAL-001 (LOCKED)

Model:      I_seen(x,y,t) = T(x,y) * W(x,y,t) + B(x,y)
Barrier:    B = g1*F + g2*S + g3*E + g4*D      ordering g1 > g2 > g3 > g4
Stationary: dB(x,y)/dt = 0          World:  dW(x,y,t)/dt may be nonzero
Nulled:     swirl_term = 0          smoke_like_term = 0
Intensity:  0.18 - 0.28 relative visual weight — subtle but unmistakable
Priority:   SUBJECT > WORLD > DEPTH > BARRIER

REQUIRED (the barrier must actually be present, as these four and only these four):
  F  faint material texture of a fixed pane
  S  restrained scratches / projector gate wear
  E  fixed edge and frame behavior at the image border
  D  slight density variation across the pane

PROHIBITED:
  swirls · rainbow rings · rainbow interference · smoke-like haze · atmospheric drift
  magic portal · bubble · force field · glowing dimensional edge · touch ripple
  lens-flare dominance · decorative interference · uniform blur · sparkle/glitter
  barrier that tracks the subject · barrier that moves with the camera
  barrier treated as an object inside the scene

GEOMETRY:   EARTH VIEWER -> STATIONARY VIEWING FILM -> THYLORA/EDEREARIAH WORLD
CHARACTER:  People and objects in the scene do not see, touch, investigate or react
            to the viewing film. It is viewer-side only.
```

### Stacked visual identity (applied with the barrier, every image)

| Gate | Applied as |
|---|---|
| `THY-INTERWORLD-OLDFILM-BARRIER-001` | Restrained sepia / charcoal / umber / cream. **One** selective, precisely placed low-saturation accent per image. Old-film charcoal/graphite character. |
| `THY-VYC-VISUAL-GRAMMAR-002` | `image = real observable detail × authored painterly/etched medium × world depth × human imperfection × variable membrane − photographic-default − generic-AI gloss − sparkle-noise − internal fog` |
| `THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001` | Geometry buildable. Causal light: one motivated source, recorded direction, readable shadow detail. Blacks deep but never crushed flat. |
| `THY-IMAGERY-ERSATZREALITY-EMBED-001` | **`ErsatzReality`** visibly embedded in every image — legible and intentional, integrated into scene/edge/end-card, never obscuring the picture. |
| `THY-VISUAL-OUTPUT-IDENTITY-001` | No stock default. No generic-AI concept art. |

**Per-post accent assignment** (one each, no bleed between posts):

- POST 1 — muted green-gold of live cut leaf
- POST 2 — low banked ember orange
- POST 3 — warm lamp amber

---

## 2 · POST 1 — FIELD FILE 001

### 2.1 Exact visual concept

A **working herb and plant farm in the THYLORA world, mid-morning, harvest in progress.**
The subject is the *land and the labour*, not a specimen.

Camera sits at standing height, slightly elevated, looking down a planting bed so the
rows run away from the viewer and carry the depth. Three registers:

- **Foreground (lower third, right-weighted):** two woven harvest baskets, one filled with
  cut green stems, one half-full; a tied bundle of long-stemmed herb laid across the rim;
  a short curved harvest knife resting on the basket edge; loose cut leaves on worked soil.
- **Middle ground:** three workers, different ages and builds — one older woman kneeling
  and cutting at the base of a plant, one man mid-back-straighten carrying a full basket on
  his hip, one younger worker at a drying rack laying bundles flat. Real anatomy, real
  fatigue, dirt on hands and hems, cloth that has been worked in. Faces legible, not posed.
- **Background:** the growing area reads as a *place* — staked rows, a low timber-and-stone
  work shed with bundles hanging in its shade, a water channel catching light, tilled land
  rising to a treeline and soft hills. Sky is high and open.

The **field-file / collectible** feeling comes from a thin archival plate frame and the file
number, *not* from a worksheet layout. It should read like plate 001 of a series someone
would want the rest of.

**Explicitly not:** an isolated plant on a plain background · a mortar-and-pestle wellness
still life · a medical or supplement advertisement · a labelled botanical diagram · a
classroom worksheet · anything with a leaf icon and a headline over white.

### 2.2 Exact image prompt

```
A working herb and plant farm in the THYLORA/EdereAriah world, mid-morning, harvest
underway. Authored painterly-etched medium with old-film charcoal character — visibly
made, never a photograph, never generic AI concept art.

COMPOSITION: standing-height camera, slightly elevated, looking down a planting bed so
staked rows run away into depth and carry the eye to a treeline and soft hills.

FOREGROUND, lower third, weighted right: two woven harvest baskets on worked soil, one
heaped with freshly cut green stems, one half full; a tied bundle of long-stemmed herb
laid across a basket rim; a short curved harvest knife resting on the edge; loose cut
leaves and crumbled earth.

MIDDLE GROUND: three workers of different ages and builds. An older woman kneeling, cutting
at the base of a plant, one hand gathering the stems. A man mid-straighten with a full
basket braced on his hip, weight visibly in his back. A younger worker laying bundles flat
on a drying rack. Real anatomy, real fatigue, dirt on hands and hems, worked cloth with
genuine wear and fall. Faces legible and individual, caught working, not posed.

BACKGROUND: staked planting rows, a low timber-and-stone work shed with herb bundles
hanging in its shade, a narrow water channel catching light, tilled ground rising to
treeline and hills. High open sky.

LIGHT: single motivated source — morning sun from camera left, low and warm. Recorded
shadow direction consistent across every figure, basket and post. Readable shadow detail,
deep blacks that keep information.

PALETTE: restrained sepia, charcoal, umber and cream. ONE selective low-saturation accent
only — the muted green-gold of live cut leaf in the baskets and on the drying rack. No
other saturated colour anywhere in the frame.

TEXT SAFETY: keep the top 18% and the bottom 26% of the frame compositionally quiet —
sky and open soil — for overlaid plate text. No important face, hand or tool in those bands.

ErsatzReality embedded legibly and intentionally — burned into the work-shed lintel board
or the drying-rack end plank, in-world and weathered, never floating, never obscuring.

NEGATIVE: isolated plant on plain background · botanical diagram · labelled specimen chart ·
mortar and pestle wellness still life · supplement or pharmacy advertising · classroom
worksheet · stock photography · white studio background · modern packaging · modern tools ·
plastic · text signage other than the specified embed.

[APPEND THE FIXED VIEWER-PLANE BARRIER BLOCK — SECTION 1, VERBATIM]
```

### 2.3 On-image text layout

Frame **1080 × 1350 (4:5)**. Plate rule: thin 2px cream archival border inset 34px, with a
6px gap break at lower right where the series mark sits.

| Zone | Y-band | Content | Treatment |
|---|---|---|---|
| Plate tab | 78–126 | `FIELD FILE 001` | Letterspaced caps, cream on a 68%-opacity charcoal bar, bar width fits text +48px, left margin 82px |
| Question | 150–286 | `WHAT GREW HERE —`<br>`AND WHY DID IT MATTER?` | Two lines, left-aligned, large serif, cream, subtle drop shade. Line 1 sits above the em-dash break |
| — | | *open image* | *no text, full picture* |
| Support | 1114–1214 | `Some plants fed people. Some flavored food.`<br>`Some served daily work. Some carried history.` | Two lines, left-aligned, ~46% of question size, cream at 86% |
| Foot rule | 1246 | hairline cream rule, 82px → 998px | 1px, 40% opacity |
| Foot | 1266–1300 | `ERSATZREALITY` · left · small caps letterspaced | 40% opacity — *secondary to the in-scene embed, not a replacement for it* |
| Series mark | 1266–1300 | `001` · right | Same size, 40% opacity |

Question block never overlaps a worker's face. Support block sits over open soil.

### 2.4 Caption

> **FIELD FILE 001 — What grew here, and why did it matter?**
>
> Before a plant was a product, it was a job.
>
> Somebody decided what went in the ground. Somebody decided when to cut it, how to dry it,
> what to trade it for, and what to keep back for the house. Those decisions are the reason
> some plants travelled the world and others stayed in one valley.
>
> We are opening a field file on them. Not a remedy list — a record of use.
>
> Some fed people. Some flavored food. Some served daily work. Some carried history.
>
> First file lands soon. What grew where you are from?
>
> `#FieldFile #ErsatzReality #THYLORA`

### 2.5 Short script (20s / 4 beats)

| Beat | Hold | Line |
|---|---|---|
| 1 | 0:00–0:05 | *(rows, no narration — one beat of the field working)* |
| 2 | 0:05–0:11 | "Before a plant was a product, it was a job." |
| 3 | 0:11–0:16 | "Somebody chose it. Somebody cut it. Somebody decided it was worth carrying." |
| 4 | 0:16–0:20 | "Field File 001. What grew here — and why did it matter?" |

### 2.6 Continuity note — series relationship

`FIELD FILE 001` is the **world-entry layer** for the `HERB FILE` shelf seeded at seq 460
(willow bark, S=2500). It is deliberately **not** a willow image: willow is bark off a tree,
and forcing it into a row-crop frame would break the scene. FIELD FILE carries the world;
HERB FILE carries the evidence. Recommend binding them as a two-track series rather than
collapsing them. **Chairman ruling requested** — this is a recommendation, not a decision taken.

### 2.7 Approve / Revise / Hold

- **WHAT IT IS:** imagery direction lock for FIELD FILE 001 still post, 4:5.
- **VIEW IT:** https://claude.ai/artifact/8sAoQgJauUfRCDyoB69yJy → Post 1 panel (exact text layout at frame ratio). Repo copy: `preview/post-lock-001/index.html`
- **WHAT APPROVAL DOES:** unlocks image generation under `THY-VISUAL-PREFLIGHT-LOCK-001`. Does **not** publish or schedule.
- **[ APPROVE ] [ REVISE ] [ HOLD ]** — recommended: **APPROVE**

### 2.8 Version binding

```
content_code : THY-FIELD-FILE-POST-20260918-001
version      : v1
barrier      : THY-INTERWORLD-BARRIER-GLOBAL-001
gates        : THY-INTERWORLD-OLDFILM-BARRIER-001 · THY-VYC-VISUAL-GRAMMAR-002
               THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001
               THY-IMAGERY-ERSATZREALITY-EMBED-001 · THY-VISUAL-PREFLIGHT-LOCK-001
accent       : muted green-gold, live cut leaf
frame        : 1080 x 1350 (4:5)
state        : DIRECTION_LOCKED_AWAITING_CHAIRMAN
```

### 2.9 Backend handoff

`social_content_queue` ← `THY-FIELD-FILE-POST-20260918-001` · `FACEBOOK_INSTAGRAM` ·
`STILL_POST` · state `DRAFT` · approval `REQUIRED` · rights `UNVERIFIED` ·
`scheduled_for` **NULL** · `published_at` **NULL**.
`approval_queue` ← viewable approval surface, priority HIGH.

---

## 3 · POST 2 — TRAIL TABLE 001

### 3.1 Exact visual concept

**Supper as the last job of the working day, not a food photograph.**

Camera low — skillet height, just above the fire ring — so the pan dominates the near frame
and the camp reads behind it in depth. Dusk, the sky already gone; the fire is the motivated
light and it is doing all the work.

- **Foreground:** a heavy cast-iron skillet set on a banked bed of coals, not flames. In it:
  seared salt-pork and thick-cut potatoes crowded to the edges, beans pulled to one side and
  holding their liquid. A blackened coffee pot sits at the coal edge. A second, smaller pan
  holds flat bread — dense, uneven, cooked on one side and being turned with a knife blade.
  The pans are scratched, seasoned, *used*.
- **Middle ground:** one rider crouched at the fire working the pan, sleeves pushed up,
  hat back. A second figure behind him at the edge of the light, standing, still holding a
  bridle — has not sat down yet. Tin plates stacked, not laid out. A bedroll and saddle set
  down where the man will sleep.
- **Background:** the tailgate and rear bows of a wagon in silhouette, canvas catching the
  last of the fire; two horses picketed beyond, one head-down, one watching. Open country
  falling away flat and dark behind them.

The logic must be readable in the frame: **food that keeps, food that stretches, food that
cooks in one pan, cooked by people who are still working.** Nothing styled. Nothing plated.
No garnish. The meal is fuel for tomorrow's miles and it should look like it.

### 3.2 Exact image prompt

```
A frontier trail camp at dusk, supper cooking — the last job of the working day. Authored
painterly-etched medium with old-film charcoal character, visibly made, never a photograph,
never a food-styling shot.

COMPOSITION: camera low, at skillet height just above the fire ring, so the pan dominates
the near frame and the camp recedes behind it in depth.

FOREGROUND: a heavy cast-iron skillet on a banked bed of glowing coals, not open flame.
Seared salt-pork and thick-cut potatoes crowded to the pan edges; beans held to one side
still in their liquid. A blackened coffee pot at the coal edge. A second smaller pan with
dense uneven flat bread being turned on a knife blade. Pans scratched, seasoned, heavily
used. Grease catching light. No garnish, no plating, no styling.

MIDDLE GROUND: a rider crouched at the fire working the pan, sleeves shoved up, hat pushed
back, forearms lit. A second figure standing at the edge of the light still holding a
bridle, not yet sat down. Tin plates stacked, not laid out. A bedroll and saddle set down
where the man will sleep.

BACKGROUND: wagon tailgate and rear bows in silhouette, canvas catching the last firelight;
two picketed horses beyond, one head-down, one watching the camp. Flat open country falling
away dark.

LIGHT: the coal bed is the single motivated source — low, warm, directional, from below.
Faces and forearms lit from underneath. Shadow thrown upward and back, consistent for every
figure, pan and wagon bow. Deep blacks that keep shadow information.

PALETTE: restrained sepia, charcoal, umber and cream. ONE selective low-saturation accent
only — low banked ember orange in the coal bed and where it strikes skin and iron. No other
saturated colour in the frame.

TEXT SAFETY: keep the top 18% and the bottom 26% of the frame compositionally quiet — dusk
sky and dark foreground ground — for overlaid plate text. No important face, hand or pan
edge in those bands.

ErsatzReality embedded legibly and intentionally — stamped into the wagon tailgate plank or
the skillet handle, in-world and worn, never floating, never obscuring.

NEGATIVE: restaurant plating · food styling · garnish · modern cookware · non-stick · clean
pans · studio light · overhead flat-lay · cosy glamour camping · costume-clean wardrobe ·
stock photography · modern packaging · text signage other than the specified embed.

[APPEND THE FIXED VIEWER-PLANE BARRIER BLOCK — SECTION 1, VERBATIM]
```

### 3.3 On-image text layout

Frame **1080 × 1350 (4:5)**. Same plate rule as Post 1 — consistent series furniture.

| Zone | Y-band | Content | Treatment |
|---|---|---|---|
| Plate tab | 78–126 | `TRAIL TABLE 001` | Letterspaced caps, cream on 68% charcoal bar, left margin 82px |
| Question | 150–286 | `WHAT DID SUPPER HAVE TO DO —`<br>`NOT JUST TASTE LIKE?` | Two lines, left-aligned, large serif, cream, subtle drop shade |
| — | | *open image* | *no text* |
| Support | 1090–1214 | `Feed the crew.` / `Stretch the food.`<br>`Use what lasts.` / `Keep tomorrow moving.` | **Four short lines, 2×2 grid**, left column x=82, right column x=560. Cream 86%. The grid reads as a checklist of jobs — deliberate, not decorative |
| Foot rule | 1246 | hairline cream rule, 82px → 998px | 1px, 40% |
| Foot | 1266–1300 | `ERSATZREALITY` left · `001` right | 40% opacity |

Four support lines set as 2×2 rather than a stack: it makes them read as **four jobs**, which
is the point of the post, and it keeps the block off the fire.

### 3.4 Caption

> **TRAIL TABLE 001 — What did supper have to do, not just taste like?**
>
> A trail cook was not trying to impress anybody. He had four jobs.
>
> **Feed the crew.** Enough calories to work tomorrow, not enough to sit down after.
> **Stretch the food.** Beans and bread carry the pork further than pork alone.
> **Use what lasts.** Salt, fat, flour, dried beans — things that survive heat, damp and days.
> **Keep tomorrow moving.** One pan, one fire, coals not flames, and everything packed by dawn.
>
> Taste came fifth. When it came, it was earned.
>
> `#TrailTable #ErsatzReality #THYLORA`

### 3.5 Short script (22s / 5 beats)

| Beat | Hold | Line |
|---|---|---|
| 1 | 0:00–0:05 | *(pan on the coals, no narration — one beat of it cooking)* |
| 2 | 0:05–0:10 | "Supper on the trail had four jobs. Taste was not one of them." |
| 3 | 0:10–0:15 | "Feed the crew. Stretch the food." |
| 4 | 0:15–0:19 | "Use what lasts. Keep tomorrow moving." |
| 5 | 0:19–0:22 | "Trail Table 001." |

### 3.6 Continuity note

Supersedes the direction-only row `THY-TRAIL-TABLE-POST-20260917-A`
("Trail Table No. 001 — Rain-Side Beans", PRODUCTION_ACTIVE, directed 2026-09-17).
Same series, same number. Recommend the 2026-09-17 row be marked
**SUPERSEDED_BY_POSTLOCK_001** rather than deleted, so the Rain-Side Beans framing stays in
history. **Chairman ruling requested** — not taken unilaterally. The earlier row is untouched.

### 3.7 Approve / Revise / Hold

- **WHAT IT IS:** imagery direction lock for TRAIL TABLE 001 still post, 4:5.
- **VIEW IT:** https://claude.ai/artifact/8sAoQgJauUfRCDyoB69yJy → Post 2 panel. Repo copy: `preview/post-lock-001/index.html`
- **WHAT APPROVAL DOES:** unlocks generation. Does **not** publish or schedule. Also carries the supersession ruling on `THY-TRAIL-TABLE-POST-20260917-A`.
- **[ APPROVE ] [ REVISE ] [ HOLD ]** — recommended: **APPROVE**

### 3.8 Version binding

```
content_code : THY-TRAIL-TABLE-POST-20260918-001
version      : v1
supersedes   : THY-TRAIL-TABLE-POST-20260917-A (pending Chairman ruling)
barrier      : THY-INTERWORLD-BARRIER-GLOBAL-001
gates        : as Post 1
accent       : low banked ember orange
frame        : 1080 x 1350 (4:5)
state        : DIRECTION_LOCKED_AWAITING_CHAIRMAN
```

### 3.9 Backend handoff

`social_content_queue` ← `THY-TRAIL-TABLE-POST-20260918-001` · `FACEBOOK_INSTAGRAM` ·
`STILL_POST` · state `DRAFT` · approval `REQUIRED` · `scheduled_for` **NULL**.
`approval_queue` ← viewable approval surface incl. supersession ruling, priority HIGH.

---

## 4 · POST 3 — BEDTIME MINI 001 · **BLOCKED AT A CHILD-PROTECTION GATE**

### 4.1 The blocker — read before the creative

The direction is built in full below. It **cannot go to generation** in its current form,
and the reason is not aesthetic.

Backend record **`FIP-SIX-KYLEE-001`** (`family_identity_protection`, registered
2026-08-25, audit `THY-FAMILY-PROTECTION-20260825-001`):

| Field | Value |
|---|---|
| `display_name` | **Kylee Jane Curry** |
| `relationship` | **protected grandchild** |
| `privacy_classification` | **PRIVATE_FAMILY** |
| `likeness_protection` | **BLOCKED_WITHOUT_PERMISSION** |
| `public_release_status` | **BLOCKED** |
| `consent_status` | **NOT_VERIFIED** |
| `prohibited_viewers` | **PUBLIC**, UNAUTHORIZED |

And `THY-NAME-AUTHORIZATION-GATE-002` lists **KYLEE** as a *protected canonical name*.

"Princess Kylee and the Door Nobody Checked" is a **public post** that puts a protected
real child's canonical first name on a depicted child character. That trips
`likeness_protection`, `public_release_status` and the protected-name gate at once.
There is also standing precedent in `THY-KENNEDY-VISUAL-PRIVACY-001`, where a real child's
face must remain non-recoverable even on 2× crop and thumbnail.

**This is not me refusing the post.** It is the backend's own registered protection on the
Chairman's grandchild, and the Chairman is the only authority who can clear it. Three clean
paths, all of which keep the post:

| Path | Action | Effect |
|---|---|---|
| **A — Authorize** | Chairman records explicit public-use authorization for the name *Princess Kylee* against `FIP-SIX-KYLEE-001`, with likeness still constrained per 4.3 | Post ships as written |
| **B — Separate the character** | Keep the name, bind `Princess Kylee` as an **authored fictional character with no likeness relationship** to Kylee Jane Curry, recorded as such | Post ships; child stays protected |
| **C — Rename** | Public series uses a different princess name; `Princess Kylee` stays a private family edition | Post ships under a new name |

**Recommended: B.** It keeps the name the Chairman wants in public, keeps the warmth of the
dedication, and puts an explicit recorded wall between the character and the real child —
which is exactly what `FIP-SIX-KYLEE-001` exists to require. Note the world already has this
pattern: `CHAR-BRAMBLE-001` is recorded with `target_inspiration: Kylee Jane` while being its
own character.

Post 3 is therefore set **HOLD**, not APPROVE. The creative below is complete and ready the
moment the gate clears.

### 4.2 Exact visual concept

**A child-scale mystery, caught at the thinking moment — not the scared moment.**

A warm upper hallway of an old house, late, everyone else asleep. Princess Kylee is small in
a tall space and entirely unbothered by it.

- **Subject:** a girl in a plain nightgown with a light robe, standing three-quarters to
  camera at a **key hook board** mounted on the wall — a row of six iron hooks, five keys
  hanging, one hook empty. She is holding a key up, turned slightly, **comparing it to the
  empty hook** — the thought is visible on her face. Calm, absorbed, slightly frowning the
  way a child frowns at arithmetic. A small crown, worn plainly and a little crooked, like
  something she genuinely wears rather than a costume.
- **The door:** further down the hall, on the right, a panelled door **slightly ajar** with
  the dark of the room beyond showing as a vertical band. Not sinister. Just *not shut, and
  nobody checked it.*
- **The light:** a low oil lamp on a hall table beside her, plus a thin line of light under
  the far door. The lamp is the motivated source and it is warm.
- **Detail that carries the logic:** the five hanging keys are visibly *different* — sizes,
  wards, one with a ribbon. The one in her hand plainly doesn't belong to the empty hook.
  That is the whole story in one object.

**Explicitly not:** glossy 3D animation · big-eyed cartoon styling · Disney princess dress
and castle · fairy sparkle or magic glow · a frightened child · a scary or threatening door ·
a babyish nursery · fantasy creatures.

Tone: **smart and calm.** A child who is going to work it out.

### 4.3 Likeness constraint — binding, regardless of which path clears the gate

```
CHILD LIKENESS CONSTRAINT — FIP-SIX-KYLEE-001 + THY-KENNEDY-VISUAL-PRIVACY-001 precedent

Princess Kylee is an AUTHORED CHARACTER. She is not a depiction of, and must not resemble,
Kylee Jane Curry or any identifiable real child.

- No reference photograph of any real child may be used as substrate, seed or guide.
- Facial structure is authored from the character sheet only.
- The character sheet must be registered as CHAR-PKYLEE-001 with its own reference set
  under THY-SUBSTRATE-LOCKED-VISUAL-ARCHITECTURE-001 identity_lock BEFORE generation.
- Verify at full frame, 2x crop and thumbnail that no identifiable real-child likeness
  is recoverable.
```

### 4.4 Exact image prompt

```
A warm upper hallway of an old house, late at night, everyone else asleep. A child-scale
mystery caught at the thinking moment. Authored painterly-etched illustration with old-film
character — visibly made, warm and hand-worked. NOT glossy 3D animation, NOT cartoon
styling, NOT a studio fairy-tale look.

SUBJECT: a young girl in a plain nightgown and light robe, standing three-quarters to camera
at a key hook board on the hallway wall — six iron hooks, five keys hanging, one hook empty.
She holds a single key up at eye level, turned slightly, comparing it to the empty hook. Her
expression is calm, absorbed and lightly frowning — a child doing arithmetic, not a child
afraid. A small plain crown sits slightly crooked on her head, worn like a real possession,
not a costume piece. Bare feet on board floor.

KEY LOGIC, must be legible: the five hanging keys are visibly different from one another —
different sizes, different wards, one tied with a worn ribbon. The key in her hand plainly
does not match the empty hook. This mismatch is the subject of the picture.

THE DOOR: further down the hall on the right, a panelled door standing slightly ajar, the
dark of the room beyond showing as a narrow vertical band, with a thin line of light beneath
it. Not sinister, not threatening — simply not shut, and not checked.

SETTING: worn board floor, a runner rug, papered wall with age at the seams, a low hall table
holding the lamp, a coat peg, a framed picture hung a little high. Tall hallway, small child —
the scale gap is the point.

LIGHT: a low oil lamp on the hall table is the single motivated source, warm and close,
throwing her shadow long down the hallway toward the door. Secondary thin light under the far
door. Consistent shadow direction on every object. Deep warm blacks that keep detail.

PALETTE: restrained sepia, charcoal, umber and cream. ONE selective low-saturation accent
only — warm lamp amber on her face, hands, the held key and the near wall. No other saturated
colour in the frame.

TEXT SAFETY: keep the top 18% and the bottom 26% of the frame compositionally quiet — upper
wall and floor — for overlaid plate text. No face, hand, key or crown in those bands.

ErsatzReality embedded legibly and intentionally — small and in-world on the hall table edge
or the picture frame's lower rail, never floating, never obscuring.

NEGATIVE: glossy 3D render · big-eyed cartoon · Disney princess gown or castle · tiara jewels ·
fairy sparkle · magic glow · glitter · frightened or crying child · horror or threat · monster ·
babyish nursery decor · modern interior · plastic toys · stock illustration · text signage
other than the specified embed.

[APPEND THE CHILD LIKENESS CONSTRAINT — SECTION 4.3, VERBATIM]
[APPEND THE FIXED VIEWER-PLANE BARRIER BLOCK — SECTION 1, VERBATIM]
```

### 4.5 On-image text layout

Frame **1080 × 1350 (4:5)**. Same series plate furniture, warmer text tone.

| Zone | Y-band | Content | Treatment |
|---|---|---|---|
| Plate tab | 78–126 | `BEDTIME MINI 001` | Letterspaced caps, cream on 68% charcoal bar, left margin 82px |
| Title | 156–300 | `Princess Kylee`<br>`and the Door Nobody Checked` | **Title case, not caps** — this is a storybook, not a file. Line 1 larger; line 2 at ~62% of line 1, sitting under it. Left-aligned, cream, warm-toned drop shade |
| — | | *open image* | *no text* |
| Foot rule | 1246 | hairline cream rule, 82px → 998px | 1px, 40% |
| Foot | 1266–1300 | `ERSATZREALITY` left · `001` right | 40% opacity |

**No support line.** Posts 1 and 2 ask a question and answer it; this one is a story title and
should stay quiet. The open lower frame is the lamp-lit floor and her long shadow reaching
toward the door — the space *is* the copy.

### 4.6 Caption

> **BEDTIME MINI 001 — Princess Kylee and the Door Nobody Checked**
>
> There were six hooks by the stairs and only five keys.
>
> Everybody in the house had walked past that empty hook all day. Princess Kylee was the one
> who stopped, and counted, and noticed that the key in her hand did not fit the space it was
> supposed to go back into.
>
> That is usually how it starts. Not with something frightening. With something that does not
> add up, and one person willing to stand there until it does.
>
> A short one, for the end of the day.
>
> `#BedtimeMini #ErsatzReality #THYLORA`

### 4.7 Short script (25s / 5 beats)

| Beat | Hold | Line |
|---|---|---|
| 1 | 0:00–0:05 | "There were six hooks by the stairs. And only five keys." |
| 2 | 0:05–0:11 | "Everybody walked past that empty hook all day. Nobody stopped." |
| 3 | 0:11–0:17 | "Princess Kylee stopped. She counted. And the key in her hand didn't fit." |
| 4 | 0:17–0:22 | "Down the hall, one door was open just enough to notice." |
| 5 | 0:22–0:25 | "Bedtime Mini 001. Goodnight." |

### 4.8 Approve / Revise / Hold

- **WHAT IT IS:** imagery direction lock for BEDTIME MINI 001 still post, 4:5 — **plus a child-protection ruling the Chairman alone can make.**
- **VIEW IT:** https://claude.ai/artifact/8sAoQgJauUfRCDyoB69yJy → Post 3 panel (shown with the gate banner). Repo copy: `preview/post-lock-001/index.html`
- **WHAT APPROVAL DOES:** nothing on its own. Generation stays blocked until **one of paths A / B / C in §4.1 is chosen and recorded** against `FIP-SIX-KYLEE-001`.
- **[ APPROVE ] [ REVISE ] [ HOLD ]** — current state: **HOLD** · recommended ruling: **Path B**

### 4.9 Version binding

```
content_code : THY-BEDTIME-MINI-POST-20260918-001
version      : v1
state        : HOLD_CHILD_PROTECTION_GATE
blocking     : FIP-SIX-KYLEE-001 (likeness BLOCKED_WITHOUT_PERMISSION,
               public_release BLOCKED, consent NOT_VERIFIED)
               THY-NAME-AUTHORIZATION-GATE-002 (KYLEE protected canonical name)
precedent    : THY-KENNEDY-VISUAL-PRIVACY-001
character    : CHAR-PKYLEE-001 — NOT YET REGISTERED, required before generation
barrier      : THY-INTERWORLD-BARRIER-GLOBAL-001
accent       : warm lamp amber
frame        : 1080 x 1350 (4:5)
unblock      : Chairman ruling A, B or C recorded against FIP-SIX-KYLEE-001
```

### 4.10 Backend handoff

`social_content_queue` ← `THY-BEDTIME-MINI-POST-20260918-001` · `UNASSIGNED` ·
`STILL_POST` · state `HELD_CHILD_PROTECTION_GATE` · approval `REQUIRED` ·
`scheduled_for` **NULL**.
`approval_queue` ← **URGENT** ruling request naming paths A / B / C.

---

## 5 · Lock summary

| # | Post | Content code | State | Recommended |
|---|---|---|---|---|
| 1 | FIELD FILE 001 | `THY-FIELD-FILE-POST-20260918-001` | DIRECTION_LOCKED | **APPROVE** |
| 2 | TRAIL TABLE 001 | `THY-TRAIL-TABLE-POST-20260918-001` | DIRECTION_LOCKED | **APPROVE** |
| 3 | BEDTIME MINI 001 | `THY-BEDTIME-MINI-POST-20260918-001` | **HOLD — child gate** | **Path B** |

**Not done, by instruction or by gate:** no image generated · nothing published · nothing
scheduled · nothing activated · no existing row deleted or overwritten · dashboard authority
untouched · `dashboard-current-head.html` untouched · baseline `THY-DASH-FLOOR-20260823-001`
unaffected.

**Two rulings requested:** §2.6 FIELD FILE / HERB FILE series relationship ·
§3.6 supersession of `THY-TRAIL-TABLE-POST-20260917-A`.
**One ruling required before Post 3 can move:** §4.1 path A, B or C.
