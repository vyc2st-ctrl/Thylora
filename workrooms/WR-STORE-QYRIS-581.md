# WR-STORE-QYRIS-581 · Store — utility fastbuild

**Lane:** Store utility instruments · QYRIS QuickCheck first, the other two in parallel
**Directive:** THY-WORK-STORE-UTILITY-FASTBUILD-581
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/time-run-binding-correction-4undjy`
**Opened:** 2026-09-21

---

## 1 · Authority position

- Nothing in this lane touches `dashboard-current-head.html`, `dashboard-baseline.json`
  or `DASHBOARD_AUTHORITY.md`.
- **Nothing is published.** No route, no navigation entry, no store listing.
  `vercel.json`, `public-site/`, `app/` and `rae-link/` are untouched.
- **No story product appears as a lead store item.** All three instruments in this
  lane are utility.

## 2 · Execution delta

### QYRIS QuickCheck — pushed first, to complete

`store/qyris-quickcheck/`

| File | Contents |
|---|---|
| `quickcheck.html` | **14 designed pages**, 14 inline SVG diagrams, worked example, fillable sheet |
| `quickcheck.css` | Page design: one paper, one ink, one accent. Screen, mobile, dark mode and print. |
| `quickcheck.js` | Sheet behaviour. **Classic script on purpose** — a module script is blocked when the file is opened from disk. |
| `lib/readout.js` | The canonical verdict table: five ordered rules, first match wins |
| `PACKET.md` | Copy, page map, visual grammar, worked example, fillable design, credits, serial, provenance, rights, delivery plan, mobile plan, store copy, price proposal, Chairman preview packet |

`tests/quickcheck.test.mjs` — **19 tests.**

### Advanced in parallel

`store/stuck-loop-reset/DELTA.md` — mechanism locked (four parts, four-state
readout including a "this is not a loop" state), 10-page map drafted, worked
example chosen. **Not designed, not implemented, not priced.**

`store/before-you-buy/DELTA.md` — mechanism locked (five columns, four-state
readout, wait table specified against a reader-declared comfortable spend),
12-page map drafted, worked example chosen. **Not designed, not implemented,
not priced.**

`store/README.md` — lane registry, serial scheme, quality floor, publication state.

## 3 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → 113 tests, 113 pass, 0 fail |
| The verdict table is total | All **48** input combinations reach exactly one verdict; every one is reproducible |
| Every rule is reachable | All five rules fire on some combination; none is dead |
| Hope never proceeds | Every combination with `weakest_link: HOPED` returns a hold, never a proceed of any kind |
| An assumption always demands a safeguard | Every absorbable combination with `ASSUMED` returns PROCEED WITH SAFEGUARD |
| A bare PROCEED is earned | Every PROCEED requires OBSERVED or REPORTED evidence, non-HIGH reversal cost and an absorbable downside |
| The shipped sheet matches the canonical table | The sheet script is loaded in a `node:vm` realm with no DOM and run against all 48 combinations; verdict, rule, label and required-actions all agree |
| The worked example is not decorative | Its four inputs are asserted to produce PROCEED WITH SAFEGUARD on R4 |
| The product opens from disk | Verified in Chromium from `file://`: **0 console errors, 0 failed requests, 0 external references** |
| Nothing leaves the device | No `fetch`, no `XMLHttpRequest`, no `sendBeacon`, no external URL in script or document — asserted by test |
| Answers survive a reload | Verified: picks and typed fields restored from `localStorage` after reload |
| It prints correctly | Chromium print pipeline → **14 PDF pages**, Letter, correct breaks |
| It works on a phone | 390 × 844: **no horizontal overflow**, minimum tap target **44 px**, tables collapse to labelled rows |
| No fake testimonials | Asserted by test: no testimonial, star rating, "customers say", guarantee, or invented "N% of people" statistic |
| Not a plain white PDF | 14 pages, 14 diagrams, designed palette and typographic system, verified visually |

## 4 · What is NOT done

- **Not published.** No route, no listing, no nav entry.
- **No PDF committed.** The PDF is generated from the HTML on demand.
- **Not tested on physical paper** — print behaviour is verified through
  Chromium's print pipeline, not through a printer.
- **No outcome claim** is made anywhere, because none has been measured.
- **A4 page box not cut.** Letter only in Rev A.
- Stuck Loop Reset and Before You Buy are **prose mechanisms**, not implemented
  and not tested. QuickCheck's readout is executable; theirs is not, and both
  deltas say so.

## 5 · Chairman decisions required

| # | Decision | Default if silent |
|---|---|---|
| 1 | QuickCheck price: **$14 single / $34 working set**, or other | Held, not published |
| 2 | Rights wording as written in `PACKET.md` §6 | Held |
| 3 | Is **R4** correct? Should a hard-to-undo decision with *observed* evidence still require a safeguard? | Stays as written |
| 4 | Free preview = pages 1–4, or pages 1–3 | Pages 1–4 |
| 5 | A4 page box in Rev A | Letter only |
| 6 | Release order for the other two instruments | QuickCheck first |
| 7 | Whether the store lane may be routed and published at all | Not published |
