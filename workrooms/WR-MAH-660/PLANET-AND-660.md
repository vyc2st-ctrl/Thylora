# 660: EdereAirah planet model (ESTABLISHED), queue answers, Bell Crossing, dashboard, NightStep

## 1. EdereAirah: the planetary model (EA-PLANET-1.0.0, ACTIVE in backend)

Order you set: rotation → day → orbit → year → epoch → calendar → zones → conversion.

| Step | Value | Why |
|---|---|---|
| Star | Sun-type (1 solar mass) | Light, seasons and skin read like Earth |
| Size | **1.25 × Earth's width** | Bigger world |
| Rock | 0.80 × Earth's density | Lighter rock |
| Gravity | **1.00 g** = 0.80 × 1.25 | Bigger, but people weigh and move the same (MATH-EA-GRAVITY-660) |
| Surface | 797 million km² (1.56 × Earth) | |
| Land | 41% = **327 million km²** (2.2 × Earth's land) | |
| Charted land (Earth mirror) | 233 million km²: Earth's continents at the **same latitude/longitude**, 1.25× the distance | Familiar towns, familiar shapes |
| **Uncharted land** | **94 million km², untamed / undiscovered** | Your "more land nobody has seen" |
| Rotation → **day** | **26 hours** (60 min, SI seconds) | |
| Tilt | 23.4° | Earth-like seasons |
| Orbit → **year** | **336.25 days** (= 364.27 Earth days), orbit 0.998 AU | |
| Moon | one moon, 28-day cycle | gives the month |
| **Calendar** | 12 months × 28 days = 4 weeks of 7 days, exactly | |
| Renewal Day | every 4th year (2028, 2032…), added after Month 12, outside the week | your "all things renewed" |
| Perpetual | every date falls on the same weekday every year | better than Earth's calendar |
| **Epoch** | **Mirror Epoch**: EA 2026 Month 1 Day 1 00:00 = Earth 2026-01-01 00:00 UTC | year numbers mirror Earth |
| **Time zones** | 26 zones, each 13.85° wide, whole EA hours from Prime Meridian Time (PMT) | |
| Bell Crossing | **zone PMT−6** | |
| **Conversion** | system function `thylora_edereairah_time(earth_time, zone)` (MATH-EA-TIME-660) | the clock is computed, never remembered |

**Now:** Earth 2026-10-05 ≈ 05:36 UTC → **EA 2026 · Month 10 Day 4 · 17:36 at Bell Crossing.**
Tested on: the epoch, +1 day, the last day of 2026, 2027 Day 1, 2028 Renewal Day, and 2029 Day 1. All correct.

**Still OPEN (your words, not mine):** month names, weekday names, the name of the prime-meridian capital, the deep-history epoch, and the placement map of the uncharted continents.

## 2. Bell Crossing: where it is (2026)

- **Era: 2026.** That settles the records building: scan room, modern.
- **Mirror rule:** charted towns sit at their Earth latitude and longitude.
- **Proposed Earth mirror: Perryville, Missouri** (Perry County seat, a rail town, the county recorder's office). It fits the canon you already have: the freight office (Nora Bell) and the records clerk (Maren Rowan).
  - Coordinates 37.72° N, 89.86° W → EA zone PMT−6.
- **Address in our world (proposed):** Bell Crossing Records Building, **1 Freight Road**, Crossing Block, beside the freight office at the rail crossing.
- **County name: OPEN_WORD.** It's your word. I won't invent it.
- **"What Perryville house":** Perryville came from your own message about the water bill ("how often do the water bill in Perryville come out… call Mr. G"). That is where the "Perryville house" came from. If you don't want Perryville as Bell Crossing's mirror, name the Earth town and it moves.

## 3. Queue answers recorded (backend)

| # | Your answer | Done |
|---|---|---|
| 4 | yes | **Sent** to Jawanza Avant, cc Linnet Richardson (Gmail msg 1a10afcb56090283) |
| 5 | Bell Crossing = 2026 | era set; place proposed above |
| 6 | yes | Daily 7:48 AM Central digest routine created (trig_01RrRTfLA8H6TkwAPPjyrMxD). **It needs the Supabase + Gmail connections attached in claude.ai → Routines** before it can read and send. |
| 7 | Kylee | **Name canon changed Kylie → Kylee** (Kylie kept only as a voice-to-text form) |
| 9 | misprint | dropped |
| 10 | no | names withdrawn. Judge's meaning recorded in your words; the name stays OPEN_WORD until you give it |

**"Sayreth House, who is it":** it was my proposal for the records building's name, built from *sayreth* (who saw it, and from where). It isn't a person. It's withdrawn because 10 = no.

## 4. Items 1, 2, 3

**1. Tamara (auction Sun Oct 11; artifacts needed by about Oct 8).**
The record already holds your Oct 4 ruling: *certificate only.* It's built as a "Commissioned Family Story by THYLORA Studio" auction lot, with **100% of the winning bid to the farm**.
- Recommended value: **$750** (book + short film)
- Opening bid: **$250**
- Alternatives: $500 (book only), $1,500 (book + film + a hardcover for each household)

Two things are still yours:
- the dollar value
- whether redemption goes to your Gmail or a business address

⚠ The certificate draft lives in another session's scratch space. It has to be saved permanently before it's lost.

**2. "make 10 what item or dollars": 10 items** for sale in the store.
- **Design first, ours:** three equation shirts are designed now (`merch/`), each with a light and a dark version:
  - R = O·T·B·C (Runnit)
  - K = W×Y×P×A (Sayreth)
  - G = P×M×E×D
- Your rule is recorded: we design everything ourselves unless you have dedicated designers, and **all images stay in your imagery**. Print-on-demand only prints our files.

**3. Printful.** I can't install a Shopify app from here; installing needs your login. One tap: https://apps.shopify.com/printful → Install.

## 5. Dashboard: why months, and the fastest way

- **Why it took months:** the time went into the **backend**: hundreds of tables, custody, the ledger, gates. The screens were rebuilt over and over across two repos and **113 unmerged branches**. App builders make screens in minutes; they don't make the data you already have.
- **Fastest way:** build the dashboard **screens in Lovable or Base44, pointed at the SAME backend (thylora-dash)**. Nothing starts over: all the data stays.
- **Why I didn't just start it:** your authority lock (2026-08-28) blocks Lovable as the live dashboard ("archive/source only"). One yes changes the lock: **queue item 11**.

**Your business-in-our-world idea** is recorded as a product:
- People pick a place, a time period and a company.
- We build their store; they stock it or buy digital inventory.
- They hire people in our world and run it from their own dashboard, with payroll and meetings.
- Kids and adults learn real commerce and make real money.
- It runs on the same engine as your dashboard, so building yours first builds theirs.

## 6. NightStep: the truth

The backend has **no ship record at all**: no hull, no measurements, no crew, no storage, no safety systems. It has only text.
- Sequence 37 (Aug 24): "NightStep Master Build System Initialization"
- One coloring-line mention (525)

You're right: months of placeholders. It goes on the board as **MOVING, owner Claude**. The first real deliverable is the engineering sheet: hull length/beam/draft, decks, cabin and quarters count with an evacuation point from every quarter (your rule), crew roles, food and storage days, and safety systems, with the numbers checked against physics.

## 7. Ancestor logic (rotation, 2 of 4): Egypt, Ma'at, applied

- **What it is:** Ma'at = truth, balance, order. It is documented in Egyptian texts such as the *Instruction of Ptahhotep* and Book of the Dead chapter 125, the "negative confession," where the dead declare the wrongs they did not do.
- **Evidence level:** primary ancient texts; translation details vary.
- **Applied to today:** the scene of the heart weighed against the feather is about **judgment requiring the whole account**, a life's full context, not one moment. That matches your definition of our judge ("they listen to the context, because the context matters"). Note that it does not match "one who weighs" as a title. You were right to reject it: the weighing was the test, not who the judge is.
- **Questions:**
  1. What would your judge's "negative confession" be: the list of things they swear they did NOT do (prejudice, rushing, ignoring context)?
  2. Ma'at was something kept daily, not once. What in THYLORA has to be kept every day or it falls back into disorder?
  3. If the feather is the standard, what is THYLORA's feather? What single standard does every record get measured against?

*Next: Hebrew.*

## 8. Things you said, recorded as rules
- **All products renewed**, not sold once.
- **Studio images:** you named them as the thing you treat as fixed. They are recorded as a renewal lane, not frozen.
- **"I keep thinking things are moving and nothing":** that's why item 11 (dashboard) and the NightStep sheet are MOVING with owners. Idle for 24h → alert.
