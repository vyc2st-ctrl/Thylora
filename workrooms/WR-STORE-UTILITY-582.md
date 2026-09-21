# WR-STORE-UTILITY-582 · THYLORA Work Store · utility lane

**Primary:** `THY-WORK-STORE-UTILITY-PRODUCTION-582`
**Lane:** utility products · store-first · Chairman preview before publication
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-preview-packets-7kg34b`
**Opened:** 2026-09-21

---

## 1 · Authority position

Read before execution and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for the
  Chairman dashboard. Authority stays at `vyc2st-ctrl/thylora-executive-dashboard` →
  `thylora-public-world`. **Nothing in this delta touches `dashboard-current-head.html`.**
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline capability
  removed, renamed or disconnected.**
- `workrooms/WR-RAELINK-001.md` — the sequence head this lane continues from. The QYRIS
  discipline proved there (28 inspections, 24 routed) is the product sold here.
- Existing surfaces changed **additively only**: one nav entry in `app/index.html`, one in
  `public-site/index.html`, two rewrites in `vercel.json`. **Time Run, sports betting, RAE Link,
  the app service worker and every hotfix are untouched — the store runs while Time Run works.**

The store is a **fifth surface**. Not a dashboard, not a second backend, not a second identity
system, not a second product truth.

---

## 2 · What a utility product is in this lane

> A utility product is a page a person can use on the worst day of their week.
> It carries no story, no seminar and no blank paper.

Three products, no others in this delta. **No Bramble. No City Power. No Last Match. No handoff.**

| Item | SKU | State |
|---|---|---|
| `THY-QYRIS-QUICKCHECK-001` | `THY-UTIL-QC-001` | **PREVIEW-READY** — written to the Chairman preview lane |
| `THY-STUCK-LOOP-RESET-001` | `THY-UTIL-SLR-001` | **PREVIEW-READY** |
| `THY-BEFORE-YOU-BUY-001` | `THY-UTIL-BYB-001` | **PREVIEW-READY** |

QuickCheck did not wait for the other two. It went to the preview lane the moment it passed D5,
in its own commit, and the other two followed behind it.

---

## 3 · Execution delta

### Added — store surface

`store/` — no framework, no dependency, no external script, no tracker.

| File | Contents |
|---|---|
| `store/packet.css` | The packet visual grammar: one grammar, three products, screen and print |
| `store/lane.css` | Chairman preview lane styling only |
| `store/index.html` | Chairman preview lane — renders every product's identity, D-gate, price proposal, alt text and decisions from the catalogue |
| `store/lib/catalog.js` | One record per product: SKU, serial grammar, credits, provenance, rights, delivery, re-access, price **proposal**, store description, alt text, D-gate |
| `store/lib/packet.js` | Packet runtime: serial stamp, keep-what-you-type (device only), print, copy-to-clipboard |
| `store/qyris-quickcheck/index.html` | Eight-page packet, complete |
| `store/stuck-loop-reset/index.html` | Eight-page packet, complete, with a copyable escalation message |
| `store/before-you-buy/index.html` | Eight-page packet, complete, with the total-cost ladder |
| `store/validation/print-check.sh` · `print-check.py` | Renders each packet to A4 PDF and refuses a spill page or a page with no ink |
| `tests/packets.test.mjs` | 17 tests over the catalogue and the packets |

### Changed — additive only

| File | Change |
|---|---|
| `vercel.json` | Added `/store` and `/store/` rewrites. Existing rewrites untouched. |
| `app/index.html` | One tab link to `../store/`, matching the existing RAE Link pattern. |
| `public-site/index.html` | One nav entry. |

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`.github/workflows/*`, `app/app.js`, `app/sw.js`, `app/hotfix-*.js`, `app/time-run.*`,
`time-run.html`, `app/sports-betting.*`, `rae-link/*`, `db/*`, `public-site/app.js`.

---

## 4 · The visual grammar

Six elements. Every packet in the lane uses these and nothing else, so a buyer who has read one
packet can read the next one without being taught again.

| # | Element | Meaning | Rule |
|---|---|---|---|
| 1 | **The rule** | A break in authority | Hairline = a pause. Heavy = above it is guidance, below it is the thing you do. |
| 2 | **The chip** | A state | Three only: routed (green), held (amber), open (red). Never a fourth. Always labelled in words as well as colour, so greyscale printing loses nothing. |
| 3 | **The route line** | Where to go next | Gold left edge. Never a warning on its own — it always names the next move. |
| 4 | **The field block** | Something you write | If it is ruled, the holder is expected to write in it, by pen or on screen. |
| 5 | **The gate bar** | One verdict of three | Three cells, one marked. Never two, never none. |
| 6 | **The inspection row** | One question, one pass test, one route | Numbered, heavy left edge, always in the same order. |

**Type:** one serif for reading, one system sans for furniture (labels, chips, running heads).
**Page:** A4, 12–16 mm margin, running head and running foot on every page after the cover.
**Ink:** every page carries a head, a foot, the SKU and the serial — which is why no page in this
lane can print blank even if a section is short.
**Colour:** gold is the only accent and it is only ever used for routes and identity.

---

## 5 · QYRIS gap report — visible

Nine inspections run against this lane's own design decisions.
**Routed** = removed or handled in this delta. **Held** = needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A packet could be called finished with no cover, serial, credits, rights or re-access path | **Routed** — D-gate D1–D5; `tests/packets.test.mjs` fails the build if any identity field is missing |
| 1b | Missing prerequisite | A product could reach the store with no price decision ever made | **Routed** — D6 is Chairman-only and a test asserts every product holds at D6 and D7 |
| 1c | Missing prerequisite | A buyer given a packet with no way to print it | **Routed** — print control on every packet; A4 print sheet in the grammar |
| 2 | Hidden handoff | Preview → publication with no record of who authorised it | **Routed** — publication is CD-4 in the decision list; the lane page reads NOT PUBLISHED until it changes |
| 2b | Hidden handoff | A packet edited after preview, with the lane still showing the old state | **Held → B3.** Edition is printed on every packet, but there is no content hash tying a lane row to a file version |
| 3 | Authority mismatch | Building a store in a repository that is not the deployment authority | **Routed** — nothing here touches dashboard files; the store is a fifth surface and says so |
| 3b | Authority mismatch | A price proposal read as a price | **Routed** — every price carries "Proposal only. No lock without Chairman." in the catalogue, on the lane page, and in a test |
| 3c | Authority mismatch | A browser session able to alter a sold record | **Routed** — the fillable page writes to the device only. No server write, no account, no network call |
| 4 | Evidence gap | "No blank white PDF" asserted rather than shown | **Routed** — the packet was rendered to A4 and inspected page by page. The first render **failed**: 13 pages instead of 8, with a spill page carrying six words. Print typography was corrected and re-rendered: 8 pages, 771–2,953 marks per page |
| 4b | Evidence gap | The delivery and entitlement route described but not implemented | **Held → B1.** Described honestly as the route, named as a Chairman decision (CD-5), not claimed as built |
| 4d | Evidence gap | Products two and three called complete without being printed | **Routed** — all three rendered to A4: 8 pages each, 771–7,518 marks per page, none below the floor |
| 4c | Evidence gap | Prices presented as researched figures | **Routed** — labelled proposals, with the reasoning stated rather than a market claim |
| 5 | Unnecessary waiting | Holding the whole lane until all three products were finished | **Routed** — QuickCheck was written to the preview lane at D5 while the other two were still being written |
| 5b | Unnecessary waiting | A buyer unable to use a packet until they sign in or the backend exists | **Routed** — a packet is a self-contained page: no backend, no sign-in, and fully usable with JavaScript switched off |
| 6 | Friction on the other side | Losing the printed copy and having to buy again | **Routed** — perpetual re-access printed **inside** the packet, not only in the store listing |
| 6b | Friction on the other side | Private browsing or storage refusal losing what a person typed | **Routed** — every storage call is wrapped; typing and printing still work when storage throws |
| 6c | Friction on the other side | A 210 mm sheet unreadable on a phone | **Routed** — the deck reflows below 840 px: full-width fields, single-column blocks, no horizontal scroll |
| 6e | Friction on the other side | A copy control that silently does nothing when the browser refuses clipboard access | **Routed** — it falls back to selecting the text and saying so on the button itself |
| 6d | Friction on the other side | A greyscale printer stripping the meaning out of coloured chips | **Routed** — every chip is labelled in words and outlined; colour carries no meaning on its own |
| 7 | Rights and privacy | What a person types into a packet leaking | **Routed** — device-only storage, no network call, no analytics, no external font or script; a test fails the build on any external reference |
| 7b | Rights and privacy | A serial identifying the holder | **Routed** — the serial identifies the copy. It carries no personal detail, and the packet says so in print |
| 7c | Rights and privacy | A worked example resembling a real business | **Routed** — fictional subject, flagged on the page and again in the credits |
| 7d | Rights and privacy | A buyer unclear whether they may copy it for their team | **Routed** — the rights line is explicit on the cover and on the credits page: team copying yes, resale no |
| 8 | Value left on the table | The QYRIS discipline proved internally and never sold | **Routed** — this lane is that value released |
| 8b | Value left on the table | Three packets built three times over | **Routed** — one grammar, one runtime, one catalogue; product two and three inherit everything |
| 8c | Value left on the table | The print harness usable once and thrown away | **Routed** — committed as `store/validation/print-check.sh`, runs over every preview-ready packet |
| 9 | Failure and recovery | Catalogue and packet drifting apart (page count, SKU, state) | **Routed** — tests assert page count, SKU and serial on every page, and that lane state equals the computed D-gate |
| 9b | Failure and recovery | A packet file renamed or deleted and nobody noticing | **Routed** — the test suite fails on a missing packet file |
| 9c | Failure and recovery | Someone clearing a half-filled record by accident | **Routed** — the clear control confirms first, and clears only this device |
| 9d | Failure and recovery | A correction to a packet somebody already bought | **Routed by rule** — corrections are issued as a new edition and the existing entitlement opens it at no cost; stated inside the packet |
| 9e | Failure and recovery | Print correctness on an unseen device | **Held → B2.** Verified on one A4 engine. Letter paper and physical printers are a device check |

**31 inspections · 28 routed · 3 held against a named blocker · 1 correction forced by evidence
(the 13-page spill).** No gap was reported and left unrouted where a safe reversible route existed.

---

## 6 · D-gate

Seven delivery conditions. A packet may enter the Chairman preview lane at D5. It may not reach
the public store below D7. **D6 and D7 are Chairman-only.**

| Gate | Condition | QuickCheck | Stuck Loop Reset | Before You Buy |
|---|---|---|---|---|
| D1 | Copy complete — no placeholder, no TBD | **PASS** | **PASS** | **PASS** |
| D2 | Design complete — laid out in the grammar, ink on every printed page | **PASS** | **PASS** | **PASS** |
| D3 | Worked example — filled, fictional, marked | **PASS** | **PASS** | **PASS** |
| D4 | Fillable final page — fill, keep, print with values visible | **PASS** | **PASS** | **PASS** |
| D5 | Identity complete — cover, serial, SKU, credits, provenance, rights, delivery, re-access | **PASS** | **PASS** | **PASS** |
| D6 | **Price locked** — written by the Chairman | **HELD** | HELD | HELD |
| D7 | **Release authorised** — publication to the public store | **HELD** | HELD | HELD |

---

## 7 · Evidence

| Claim | Evidence |
|---|---|
| Tests pass | `npm test` → **65 tests, 65 pass, 0 fail** (48 existing RAE Link + 17 new packet tests), over all three packets |
| No baseline regression | No dashboard file, workflow, Time Run, sports-betting, RAE Link or app runtime file changed |
| Store runs while Time Run works | Three additive edits only: two rewrites, two nav entries |
| **No blank white PDF** | `store/validation/print-check.sh` → all three packets print **8 pages for 8 sheets**, 771–7,518 drawing marks per page, zero pages below the 120-mark floor, harness exit 0 |
| The blank-page check is not vacuous | Negative-tested against a deliberately empty sheet: reported 0 marks and failed, exit 1 |
| Spill pages are caught | The first render of QuickCheck **failed this check** at 13 pages; the defect was in print typography, was fixed, and the re-render passes |
| Packets are self-contained | A test fails the build on any `src="http…"` or `href="http…"` in a packet |
| Packets work without JavaScript | No copy, field or page depends on the runtime; JavaScript stamps the serial and keeps typing, nothing else |
| Nothing is priced | Every price is labelled a proposal in the catalogue, on the lane, and by assertion in the test suite |
| Fields are labelled | Every input, textarea and select carries a label or `aria-label`, asserted in the suite |
| Mobile | Deck reflows at 840 px; asserted in the suite against the grammar |
| Surface weight | `store/` raw ≈ 115 KB across three packets, the lane and the grammar. No images, no framework, no font download |
| One grammar, three products | The second and third packets added no new visual element: same six elements, same runtime, same catalogue shape |

**Not measured, not claimed:** physical print output on paper, Letter-size pagination, real store
order flow, entitlement writes, payment, or any figure about what these products would earn.

---

## 8 · Unresolved blockers

### B1 · Order, entitlement and re-access route not implemented — **HELD (CD-5)**
The delivery path described on every packet — order → entitlement → product path, perpetual
re-access — is the **intended** route, matching the purchase-entitlement rule already proved in
`WR-RAELINK-001` (a purchase entitlement is perpetual by constraint and cannot be revoked by
cancellation). It is not wired here. Wiring it touches the live backend, which is a Chairman
action, and the backend was not reachable in the previous sequence either.

### B2 · Print verified on one engine only — **DEVICE CHECK**
A4 output from one headless engine, inspected page by page. US Letter pagination and physical
printers are a Chairman device check. The grammar sets A4 explicitly rather than leaving it to
the printer, which is the most that can be done from here.

### B3 · No version hash tying a lane row to a packet file — **OPEN, SMALL**
Edition is printed on every packet and the tests catch drift in page count and SKU, but a packet
could be edited without the lane row changing. A content hash per packet would close it. Not done
in this delta; named rather than left silent.

### B4 · Price has no evidence behind it — **HELD (CD-1…CD-3)**
The proposals are reasoned, not researched: a utility page priced below the cost of the hour it
saves, and a ten-seat figure at four times single rather than ten, because these get copied for a
team and the packet says so. No market figure was reachable. The Chairman sets the price.

---

## 9 · Chairman decisions

| # | Decision | Options | Gate |
|---|---|---|---|
| CD-1 | Lock the QuickCheck price | USD 12 single / 48 ten-seat, or a figure you name | D6 |
| CD-2 | Lock the Stuck Loop Reset price | USD 9 single / 36 ten-seat, or a figure you name | D6 |
| CD-3 | Lock the Before You Buy price | USD 12 single / 48 ten-seat, or a figure you name | D6 |
| CD-4 | Authorise publication of the utility lane | All three · QuickCheck first · hold | D7 |
| CD-5 | Name the order and entitlement route | Existing THYLORA store registry and passports, or a named alternative | D7 |
| CD-6 | Confirm the rights line printed on every packet | As written (own working use, team copying allowed, no resale), or amended | D7 |

**No publication. No price lock without the Chairman.**

---

## 10 · Restart vector

If this work resumes cold:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`, `workrooms/WR-RAELINK-001.md`,
   then this file. Confirm dashboard authority still sits outside this repository.
2. **Verify the floor:** `npm test` → expect 65 passing.
   Then `store/validation/print-check.sh` → expect exit 0 and one page per sheet for every
   preview-ready packet.
3. **Open `/store`** — the Chairman preview lane, which reads 3 of 3 preview-ready. It reads its state from
   `store/lib/catalog.js`, so the lane can never claim a product is further along than its gate.
4. **If the Chairman has answered CD-1…CD-3:** write the price into the catalogue, flip D6 to
   PASS for that product, and the lane state advances on its own.
5. **If the Chairman has answered CD-4 and CD-5:** the next executable work is the order →
   entitlement → product path route, built against the existing store registry — one product
   truth, not a second one.
6. **Next executable state**, none of which needs an authority this build lacks:
   - Close B3 with a content hash per packet, asserted in the test suite.
   - A fourth utility product, using the same grammar, catalogue record and gate.
   - A printable Letter variant if the Chairman's device check asks for one.
7. **Do not:** publish, price, open a vendor account, touch the dashboard files, add a story-first
   surface to this lane, or ship a packet that has not passed the print check.

---

## 11 · State

| | |
|---|---|
| Workroom | **OPEN** |
| QYRIS QuickCheck | **Complete · preview-ready · in the Chairman preview lane** |
| Stuck Loop Reset | **Complete · preview-ready · in the Chairman preview lane** |
| Before You Buy | **Complete · preview-ready · in the Chairman preview lane** |
| Visual grammar | Complete · six elements · shared by the lane |
| Tests | 65 / 65 |
| Print | 8 pages for 8 sheets on all three · ink on every page · harness committed |
| Price | **Proposed only.** Not locked. |
| Publication | **None.** |
| Baseline regression | **None.** |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS. STORE CONTINUES WHILE TIME RUN WORKS.
