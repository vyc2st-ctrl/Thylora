# M · MEASURING — Kaelorps measuring tape / kids math

Run **WR-SPINE-624** · Lane **M** · desk Kaelorps / Education · idea `THY-IDEA-KAELORPS-001` (Kaelorps = the schools THYLORA sponsors in-world).
Truth class of everything here: **PRODUCTION_PLANNED** (Earth teaching tool). World-side unit choices are **EDEREAIRAH_PROPOSED**, not canon.
No backend writes, no git, no Shopify actions.

## 1 · What was built

| Path | What it is |
|---|---|
| `learn/lib/measure.js` | Pure ES module. Integer-only tape math. Every length is held as a whole count of sixteenths of an inch. |
| `tests/measure.test.mjs` | 20 `node:test` tests. |
| `learn/measuring-tape.html` | Standalone teaching page. Loads only `./lib/measure.js` and uses no external scripts, fonts or images. |
| `workrooms/WR-SPINE-624/M-measuring-mobile.jpg` | Full-page screenshot at 390 px, taken in headless Chromium. |

### 1.1 `measure.js` API

- `parseReading("8 3/4")` → `140`. It also accepts `"8"`, `"3/16"`, `"8-3/4"`, `8 3/4"` and `8 3/4 in`. Unreduced input such as `8 6/8` is accepted. It throws `RangeError` for:
  - a denominator that is not 2, 4, 8 or 16 (`/1` is rejected as "not a fraction")
  - a numerator of 0, or a numerator ≥ the denominator
  - negatives, decimals, empty input or other bad input

  It throws `TypeError` when the input is not a string.
- `formatReading(140)` → `"8 3/4"`. The output is always the simplest reduced mixed fraction. `toMixed(s)` → `{whole, num, den}`.
- `tickClass(s)` → `WHOLE | HALF | QUARTER | EIGHTH | SIXTEENTH`. The class is the largest of the steps 16, 8, 4 or 2 that divides s; if none does, the class is SIXTEENTH. `SIXTEENTHS_PER_CLASS` = 16/8/4/2/1, and `TICK_HEIGHT` gives the drawing heights.
- **mm, exact:** 1 in = 25.4 mm by definition, so 1/16 in = 1.5875 mm = 15 875 units of 0.0001 mm.
  - `sixteenthsToTenThousandthsMm` returns the exact integer.
  - `sixteenthsToMmExact` returns the exact decimal string, e.g. 140 → `"222.25"`.
- **mm rounding rule:** mm are shown to the nearest **0.1 mm**, with halves rounded **away from zero**. See `sixteenthsToMmTenths` and `formatMmTenths`. `toMm(s)` → `{exact, rounded}`.
- **mm → in:** `parseMm("222.25")` reads up to 4 decimals. `mmToSixteenths` rounds to the nearest sixteenth, halves away from zero.
- **`clearance(W_g, W_v, m)`:** each argument can be a reading string or integer sixteenths. The minimum per side `m` is **required**; the function throws if it is missing. It returns:
  - C in sixteenths, as a reading and in mm
  - per side (C/2), kept **exact in 32nds**, plus a conservative `sixteenthsFloor`, and in mm
  - `verdict` FIT / NO_FIT, with `reason` = `VEHICLE_WIDER_THAN_OPENING` | `BELOW_MINIMUM_PER_SIDE` | `MEETS_MINIMUM_PER_SIDE`

  The fit test is `C ≥ 2m`, done on integers with no division.

### 1.2 Tests (`tests/measure.test.mjs`, 20 tests)

The tests cover:
- round trips for every sixteenth from 0 to 192 (0–12 in)
- 8 3/4 = 140/16, 8 5/8 = 138/16, 8 7/16 = 135/16
- the ordering 8 7/16 < 8 5/8 < 8 3/4, and the gaps between them
- whole-number and pure-fraction parsing
- reduction of unreduced input
- tick classes
- the mark count per inch: 1 + 2 + 4 + 8 = 15
- the "half the previous" chain: 16 → 8 → 4 → 2 → 1
- exact mm: 25.4, 1.5875, 304.8, 222.25, 219.075, 214.3125
- the rounding rule, including negatives
- mm → sixteenths, and the inch → exact mm → inch round trip for 0 to 192
- clearance: FIT, the 5/32 per-side case in 32nds, NO_FIT below the minimum, a vehicle wider than the opening, and exactly at the threshold
- a missing minimum
- invalid denominators, a numerator ≥ the denominator, and malformed input
- non-integer inputs

**Result of `npm test`:** 68 tests, 68 pass, 0 fail (the 48 baseline tests plus 20 new).

### 1.3 Page (`learn/measuring-tape.html`)

The page is labelled "THYLORA Kaelorps · Measuring". Sections:

1. **Tape:** a 0–12 in inline SVG. Tick height depends on class, from whole (tallest) to sixteenth (shortest), and whole inches are labelled. Pins mark the three worked examples.
   - Clicking or tapping selects a position. The tape is keyboard-operable (`role="slider"`: ←/→ moves 1/16, Shift moves 1 in, Home/End go to the ends).
   - On phones the tape scrolls sideways inside its own container. The page itself never scrolls sideways.
   - A **zoomed one-inch view** labels every sixteenth (0–16) and names the ½, ¼ and ⅛ marks.
2. **Marks:** whole, ½, ¼, ⅛ and 1/16, each with its sixteenths and exact mm. There is a child-readable "fold the paper" explanation and a formal one (repeated bisection, positions k/2ⁿ, why denominators are only 1/2/4/8/16).
3. **Count the marks:** 1 half, 2 quarters, 4 eighths and 8 sixteenths make the 15 lines, plus the counting trick 8 12/16 → 8 3/4.
4. **Try a reading:** typed input or ±1/16 steps show:
   - the reduced fraction
   - n/16
   - mm (rounded, with the exact value shown too)
   - the mark type

   Errors appear in an alert region. For example, `8 3/5` gives "denominator 5 is not on a 1/16 tape".
5. **Worked examples:** 8 3/4, 8 5/8 and 8 7/16, each with a colour, a button that highlights it on the tape, a table (count, n/16, exact → shown mm, mark) and the ordering.
6. **Notation table:**
   - Easy: GW, VW, "room left", "room each side", "need each side".
   - Formal: W_g, W_v, C, C/2, m, and the fit test C ≥ 2m.
7. **Math Display Law block** for **C = W_g − W_v**. It lists symbols and subscripts, operator, units (in and mm), domain, scale, threshold, assumptions, failure condition, plain meaning, child meaning, worked example (108 in / 2743.2 mm door, 74 in / 1879.6 mm car → C = 34 in / 863.6 mm, 17 in / 431.8 mm per side → FIT) and class **ENGINEERING_CONSTRAINT**.
8. **Clearance calculator:** inputs W_g, W_v and m. It shows the verdict, C, C/2 and m in both units, and the integer working.
   - The default m = 12 in (304.8 mm) is stated as a teaching value: "typical planning comfort, not a code requirement; verify locally".
9. **Applied lessons.** Each gives in and mm and is marked "typical, verify locally":

   | Lesson | Example |
   |---|---|
   | Garage | 9 ft / 2.74 m single door, 16 ft / 4.88 m double |
   | Room | queen mattress 60 × 80 in (1524 × 2032 mm) in a 10 ft room |
   | Animal enclosure | ½ in (12.7 mm) hardware cloth. The world estate poultry headcount is NULL, so the size is UNKNOWN. |
   | Sports court | rim at 10 ft / 3.048 m, NBA court 94 × 50 ft (28.65 × 15.24 m) |
   | Vehicle fit | 72–74 in (1.83–1.88 m) without mirrors |
   | Store shelving | "¾ in" plywood ≈ 23/32 in (18.3 mm); a 2×4 is 1½ × 3½ in (38.1 × 88.9 mm) |
   | World building | The EdereAirah native unit is UNKNOWN; using Earth in/mm is EDEREAIRAH_PROPOSED. |

Theme and layout: CSS variables on `:root`, dark theme through `prefers-color-scheme` (plus `data-theme` overrides), an explicit body background, a 16 px side gutter, and tap targets of at least 44 px.

Serving: the page uses an ES module import, so it must be served over http(s). Opening it as `file://` will not run the script.

### 1.4 Browser verification

- **Setup:** Playwright 1.56.1 (global install), Chromium from `/opt/pw-browsers`, page served with `python3 -m http.server`.
- **Console and page errors:** none at 390 px or 375 px.
- **8 3/4 example:** renders as `8 3/4 in`, `140/16`, `222.3 mm`, "Quarter", with the zoom view on "inch 8 to inch 9".
- **Clearance default:** "FIT", 17 in per side.
- **Typed input:** `8 7/16` → `135/16`. `8 3/5` shows the denominator error.
- **Width:** `scrollWidth` = viewport width at both 375 px and 390 px. The check was repeated with the body's `overflow-x` clipping switched off, and no element outside the tape and table scrollers goes past 375 px.
- **Dark mode:** the body background switches to `rgb(21, 22, 26)`.
- **Screenshot:** `M-measuring-mobile.jpg` (390 px wide, full page, DPR 2).

## 2 · Earth school pilot adapter (Kaelorps world model → Earth classroom kit)

**World first.** In the world model, Kaelorps is a THYLORA-sponsored school system on EdereAirah. Its measuring lesson is "one half at a time": repeated halving of a base length. That idea does not depend on which base unit is used. The native EdereAirah length unit, day length and gravity are **UNKNOWN** (not locked in the backend), so the world lesson uses the inch/mm pair as an **EDEREAIRAH_PROPOSED** stand-in until canon provides a unit. The only world data it touches is the royal estate animal rows (`ER-CASTLE-ROYAL-001`), and it leaves their NULL headcounts as UNKNOWN.

**Earth adapter.** The classroom kit is:
- the page (projector or 1:1 devices)
- a printable 0–12 in tape strip and worksheets (see §3)
- a real tape or ruler per pair of students
- the clearance calculator as a closing "real job" task

It is aligned to the **US Common Core State Standards for Mathematics**:

| Code | Standard (paraphrased) | Where the kit hits it |
|---|---|---|
| **2.MD.A.1** | Measure length by selecting and using appropriate tools (rulers, yardsticks, meter sticks, measuring tapes) | Physical tape plus the on-screen tape |
| **2.MD.A.2** | Measure an object twice using units of different lengths; relate the measurement to unit size | The same object in inches and in mm, and why the mm number is bigger |
| **2.MD.A.4** | Measure to determine how much longer one object is than another | Ordering 8 7/16 < 8 5/8 < 8 3/4 and the gaps between them |
| **2.MD.B.5** | Add and subtract within 100 to solve word problems involving lengths in the same units | Whole-inch clearance: 108 − 74 = 34 |
| **3.MD.B.4** | Generate measurement data using rulers marked with halves and fourths of an inch; show the data on a line plot | Tape readings to ½ and ¼; class line plot (worksheet) |
| **3.NF.A.2 / 3.NF.A.3** | Fractions on a number line; equivalent fractions | The tape is a number line; 12/16 = 6/8 = 3/4 |
| **4.MD.A.1** | Relative sizes of units within one system; express larger units in terms of smaller ones (e.g. 1 ft = 12 in) | 9 ft = 108 in; 1 in = 16 sixteenths |
| **4.MD.A.2** | Word problems involving distances, including simple fractions | The clearance calculator and applied lessons |
| **4.MD.B.4** | Line plot of measurements in fractions of a unit (½, ¼, ⅛); add and subtract fractions using the plot | Eighth-inch readings; differences between readings |
| **4.NF.A.1 / 4.NF.A.2 / 4.NF.B.3** | Equivalent fractions; compare fractions; add and subtract mixed numbers with like denominators | Reducing n/16; ordering; C = W_g − W_v with fractional readings |

Honest limits:
- Sixteenths go beyond the Common Core measurement standards, which stop at eighths in 4.MD.B.4. Here they are enrichment.
- Converting between inches and millimetres is also enrichment. 4.MD.A.1 and 5.MD.A.1 cover conversion only within one system.
- The pilot needs a real school partner, adult supervision and no child identity data (Brief law 8).

## 3 · Store derivative

- **Product:** Kaelorps Tape-Reading Worksheet Pack (printable PDF). Contents:
  - a 0–12 in tape strip to print at 100%
  - a "count the marks" sheet
  - reading drills at ½, ¼, ⅛ and 1/16 levels, with answer keys in n/16 and mm
  - an ordering and comparing sheet
  - a line-plot sheet (3.MD.B.4 / 4.MD.B.4)
  - a "Will it fit?" clearance sheet using C = W_g − W_v with the Math Display Law box
  - a teacher page mapping to the standards above
- **Shelf:** `LEARNING_EDU`. **Price:** `CANDIDATE` (not set). Provider authority is unchanged: Stripe for Earth payments, Shopify for the storefront lane. **Nothing is created, priced or activated in this run.**
- **Dependency:** the PDF has not been produced yet. Answer keys can be generated from `measure.js`, so every printed answer is test-backed.

## 4 · Status table

| Item | Status |
|---|---|
| `learn/lib/measure.js` (parse, format, tick class, mm exact and rounded, mm → in, clearance, validation) | **DONE** |
| `tests/measure.test.mjs` (20 tests; suite 68/68 pass) | **DONE** |
| `learn/measuring-tape.html` (tape, zoom, marks, count, interactive reading, examples, notation, Math Display Law block, calculator, 7 lessons, light and dark, 375 px safe) | **DONE** |
| Headless browser check and 390 px screenshot | **DONE** (no console errors) |
| Earth pilot adapter and standards map | **DONE** (document); pilot school not contacted |
| Worksheet pack PDF | **NOT STARTED** (spec only) |
| Product row / price for the worksheet pack | **BLOCKED**: approval required; Shopify frozen this run |
| EdereAirah native length unit | **BLOCKED**: canon UNKNOWN |
| Page hosting / link from the public site | **NOT STARTED** (the public site was outside this lane's paths) |

## 5 · Next executable work

| # | Work | Class | Owner | Blocker | Release condition | Next executable action |
|---|---|---|---|---|---|---|
| 1 | Generate the worksheet pack PDF from `measure.js` (answer keys computed, not typed) | NOW | Kaelorps / Education desk | none | none | Write `learn/worksheets/` generator (HTML print sheets → PDF) that uses `parseReading`, `formatReading` and `toMm` |
| 2 | Register the worksheet pack in `products` on shelf LEARNING_EDU, price CANDIDATE | APPROVAL_REQUIRED | Production director | Store writes frozen this run; price not approved | Director approves the product row and price | Draft a product row (title, shelf, CANDIDATE price, no activation) for central apply |
| 3 | Link `learn/measuring-tape.html` from the public site / Kaelorps hub | QUEUED_WITH_DEPENDENCY | Web desk | The public-site path is outside Lane M; no Kaelorps hub page exists | A hub page exists or a public-site edit is approved | Add one link card on the chosen hub; confirm the module path is served over http |
| 4 | Earth pilot with one classroom | HOLD_FOR_EVIDENCE | Institutional pilot desk (`THY-IDEA-INSTITUTIONAL-PILOT-NETWORK-001`) | No partner school, no consent process | A named school agrees in writing; no child identity is collected | Draft the teacher one-pager and consent-free feedback form (counts only) |
| 5 | Native EdereAirah length unit for Kaelorps | HOLD_FOR_EVIDENCE | World canon desk | Unit, gravity and day length are UNKNOWN in canon | A canon record defines a base length | Once it exists, add `NATIVE_PER_SIXTEENTH` to `measure.js` and a third unit column |
| 6 | Register `MATH-CLEARANCE-624` (C = W_g − W_v, ENGINEERING_CONSTRAINT) in the math registry | APPROVAL_REQUIRED | Production director (central backend writes) | Lanes do not write the backend | Director applies the registry write | Hand over the Math Display Law block from §1.3 / the page as the registry payload |

## 6 · Restart point

Lane M is complete in code:
- `learn/lib/measure.js` holds all tape math as integer sixteenths (1/16 in = 15 875 × 0.0001 mm; mm shown to 0.1 mm with halves away from zero).
- `tests/measure.test.mjs` adds 20 passing tests; `npm test` reports 68/68.
- `learn/measuring-tape.html` is a self-contained teaching page. It must be served over http because it imports the module. It was verified in headless Chromium with no console errors and no page-level horizontal scroll at 375 and 390 px; the screenshot is `M-measuring-mobile.jpg`.

A cold reader should start with Next work #1: build the printable worksheet pack by calling `measure.js`, so every answer key is computed. Product registration (#2) and the math-registry entry (#6) wait for the production director. The pilot (#4) and the native world unit (#5) wait for evidence and canon. Values in the lessons are typical Earth values and must stay labelled "typical, verify locally".
