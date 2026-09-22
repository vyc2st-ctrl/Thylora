# WR-QYRIS-STORE-001 · THYLORA Standards Series · customer artifacts

**Lane:** store artifacts · digital delivery · re-access · Chairman preview
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/thylora-qyris-quickcheck-zrk589`
**Opened:** 2026-09-22
**Primary:** THY-WORK-STORE-UTILITY-ARTIFACT-583 → THY-QYRIS-QUICKCHECK-001

---

## 1 · Authority position

Read before execution and held throughout:

- `DASHBOARD_AUTHORITY.md` — this repository is **not** the deployment authority for
  the Chairman dashboard. `dashboard-current-head.html` is **untouched**.
- `dashboard-baseline.json` — floor `THY-DASH-FLOOR-20260823-001`. **No baseline
  capability removed, renamed or disconnected.**
- `workrooms/WR-RAELINK-001.md` — the QYRIS discipline used here comes from its
  section 5. Its blockers B1–B7 are still live; B1 is still live in this session.
- **No publication.** Nothing added to `public-site/`, nothing added to
  `vercel.json`, nothing linked from an existing surface. The store movement in
  this delta is *to Chairman preview*, and the preview surface is deliberately
  unrouted.

Dashboard ≠ app ≠ RAE Link ≠ public site ≠ **product artifact**. The artifact is a
file a customer holds. It is not a page, not a plan and not a shell.

### Backend read — stated plainly

The head said: read backend through sequence 583 and all newer deltas first.
**That read was attempted and refused.** `jvsdxhrfhtlgaknhjxlz.supabase.co:443`
returned **403 on CONNECT** through the egress proxy — organization policy, the
same denial recorded as WR-RAELINK-001 blocker **B1**, unchanged since
2026-09-11. `thylora_query_carryforward` therefore could not be read, and
sequence 583 could not be opened.

What was read instead, in full, before any execution: `DASHBOARD_AUTHORITY.md`,
`dashboard-baseline.json`, `dashboard-current-head.html` (capability inventory),
`workrooms/WR-RAELINK-001.md`, `db/rae-link/0006_access_entitlements.sql` (the
existing entitlement and store-link model), `public-site/store.html`,
`vercel.json`, and the existing surfaces. No sequence number is claimed as read
that was not read.

---

## 2 · Execution delta

### Added — artifact engine (`products/_engine/`, dependency-free)

| File | Contents |
|---|---|
| `pdf.mjs` | PDF writer: vector pages, base-14 text, AcroForm fields, outlines, UTF-16BE metadata, Flate streams, valid xref |
| `metrics.mjs` | AFM widths for the four faces used, so wrapping and fitting are exact |
| `preview.mjs` | Replays a page's own content stream into SVG — proofs, device tests, thumbnails, no rasteriser |
| `probe.mjs` | Opens a built PDF the way a reader does; used by the tests |
| `zip.mjs` | Deterministic ZIP writer for the delivery package |

### Added — THY-QYRIS-QUICKCHECK-001, built

`products/qyris-quickcheck/` — copy, layout, build, preview, thumbnail, Chairman preview.

**Finished artifact bytes**, in `dist/master/`:

| File | Size | What it is |
|---|---|---|
| `THYLORA-QYRIS-QuickCheck-v1.0-PRINT-THY-QC1-0000-MASTER.pdf` | 48.5 KB | 12 pages, 612×792 pt |
| `THYLORA-QYRIS-QuickCheck-v1.0-MOBILE-THY-QC1-0000-MASTER.pdf` | 53.1 KB | 23 screens, 360×640 pt portrait |
| `READ-ME-FIRST.txt` · `LICENCE-AND-RIGHTS.txt` · `RE-ACCESS.txt` | 3.0 KB | the three files a buyer needs beside the artifact |
| `manifest.json` | 2.5 KB | serial, entitlement contract, per-file SHA-256 |
| `THYLORA-QYRIS-QuickCheck-v1.0-THY-QC1-0000-MASTER.zip` | 64.1 KB | the delivery package |

Page map: cover · 8 designed plates (00–07) · worked example · fillable reusable
sheet · colophon. Serial, credits, provenance, rights line and re-access route
are **inside the artifact**, not only in a database.

### Added — store assets and preview

- `dist/store/` — thumbnail at 480×600 (SVG source) and 1200×1500 (PNG).
- `dist/preview/chairman-preview.html` — the Chairman preview surface. Every
  number on it is read from the built bytes at generation time. **Unrouted.**
- `dist/preview/print.html`, `mobile.html` — page-by-page proofs.

### Added — delivery registration (reviewable, **not applied**)

`db/store/0001_digital_delivery_qyris_quickcheck.sql`. Registers one product row
against the registry that already exists. It does **not** create a store.
Because the live column shapes could not be read (B1), every write is driven by
`information_schema`: unknown column skipped, unknown table skipped, nothing
guessed. Validated against three fixture databases (below).

### Added — production copy and design, items 02 and 03

- `products/stuck-loop-reset/content.mjs` + `DESIGN.md` — THY-SLR-002, six-move
  protocol, complete copy, full page map, 24 form fields specified.
- `products/before-you-buy/content.mjs` + `DESIGN.md` — THY-BYB-003, seven-question
  pass, complete copy, full page map, 27 form fields specified.

Both are written to the **same content schema** as QuickCheck, so each is one
layout pass from finished bytes rather than a rewrite.

### Added — tests

`tests/quickcheck.test.mjs` — 21 tests. `npm test` → **69 passing** (48 existing
RAE Link + 21 new). No existing test changed.

### Not touched

`dashboard-current-head.html`, `dashboard-baseline.json`, `DASHBOARD_AUTHORITY.md`,
`vercel.json`, `public-site/*`, `app/*`, `rae-link/*`, `db/rae-link/*`,
`.github/*`, `package.json` scripts, all existing tests.

---

## 3 · Evidence

| Claim | Evidence |
|---|---|
| The artifact opens | `probePdf` parses header, startxref, every xref offset lands on its object, trailer `/Root` and `/Info` resolve, `/Size` agrees, all 12 content streams inflate. Zero errors. |
| It is 12 pages, not a shell | Page tree `/Count` = 12; every `/MediaBox` is 612×792; 12 distinct content streams |
| It is not a plain white PDF | Every page paints a full-bleed ground before any text: ink `#0a0e14` on ten pages, ivory `#f4efe6` on the two work surfaces. 12 of 12 pages carry the series mark, a gold rule and a running foot |
| The sheet is genuinely fillable | AcroForm present, `/NeedAppearances true`, **33 text fields** (4 header + 9×3 + 2 footer), each with a tooltip; multiline where the answer is prose |
| The serial is on the artifact, not only in metadata | Cover, colophon, and the running foot of all 11 interior pages — asserted in test, read back out of the decoded streams |
| Customer-facing title reaches the reader | `/Title` = "QYRIS QuickCheck — The Nine-Inspection Pass", UTF-16BE, with `/DisplayDocTitle true` so readers show the title rather than the filename |
| Rights, credits, provenance are inside the file | Decoded from the colophon stream in test: "2026 THYLORA", "WR-RAELINK-001", "THYLORA Standards", "RE-ACCESS" |
| Mobile is typeset, not shrunk | Phone edition is 360×640 pt portrait on every page, 23 screens instead of 12, body 9.8 pt, one inspection per screen, outline present for navigation |
| iPad | Print edition at 612×792 reads full width on a 834 pt iPad viewport at 100% with no zoom; the preview surface reflows at 834 pt with **0 px horizontal overflow** |
| Phone, preview surface | 390 pt viewport, **0 px horizontal overflow**, smallest rendered text 11.2 px |
| Download works | ZIP local header and end-of-central-directory verified, entry count correct, `manifest.json` present; extracted and tested with two independent unzip implementations |
| Re-access works | Rebuild from the serial alone is **byte-identical** (SHA-256 equal across print, mobile and zip). A different serial yields a different, correctly stamped 12-page copy |
| Checksums are true | Every `manifest.json` SHA-256 and byte count re-derived from the shipped bytes in test |
| Filenames are safe | No space or shell-hostile character, under 80 characters, product + edition + serial legible in a download list |
| No download needed to read it | No `/FontFile` of any kind; no `/URI`, no `http` string anywhere in either PDF |
| Delivery SQL applies | Fixture A (registry with 7 of our columns): registered, correct row, **idempotent** on second apply (1 row, not 2). Fixture B (no registry): reports "NOT registered … a held state, not a silent success", exit 0. Fixture C (registry without a key column): reports held for Chairman mapping, writes nothing |
| No baseline regression | `dashboard-current-head.html` and `dashboard-baseline.json` byte-identical; `npm test` 69/69 with all 48 prior tests unchanged |

### Not measured, and not claimed

- **Rendering in a real reader.** Acrobat, Preview, iOS Files and Android were
  not reachable: this container has no PDF rasteriser, Chromium's PDF viewer is
  unavailable headless, and fetching a JavaScript PDF renderer was refused by
  the same egress policy as B1. Structure is proved; *glyph-level rendering on a
  device* is not, and is carried as **C3** below rather than assumed.
- **A live store transaction.** No order, payment, entitlement or download was
  executed against the live backend (B1). The delivery path is proved as far as
  the bytes and the package; the live leg is named, not implied.
- **Price validation.** $29.00 is a proposal, not a tested price.

---

## 4 · Blockers

### C1 · Backend unreachable — **HARD, inherited (= WR-RAELINK-001 B1)**
403 on CONNECT, 2026-09-22. Sequence 583 unread; live product/entitlement column
shapes unread; no live registration, order or re-access performed.
**Needs:** egress to the backend host, or a Chairman-run apply.

### C2 · Production registration is a held action — **BY RULE**
`db/store/0001…` mutates the production backend. Held for Chairman execution, as
with `db/rae-link/0001…0010`. The `information_schema`-driven writes reduce the
risk of that apply; they do not remove it.

### C3 · Device rendering unverified — **EVIDENCE GAP**
Structure, geometry, fields and metadata are checked programmatically. What no
session without a device or a rasteriser can check is how the glyphs land in
Acrobat, Preview, iOS Files and Android.
**Needs:** one pass on an iPad and one on a phone. Fifteen minutes, and it
closes the largest remaining evidence gap in the product.

### C4 · Price and title are Chairman decisions — **HELD**
$29.00 and "QYRIS QuickCheck — The Nine-Inspection Pass" are proposals. Both are
one-line changes in `content.mjs` that rebuild every artifact and every store
asset from the same source.

### C5 · Serial issuance has no live source — **HELD**
Per-copy serials are stamped at delivery by the builder, which is proved. What
issues the number in production — the order id, a counter, or a passport
reference — is a backend decision blocked by C1. The master copy is deliberately
serialled `THY-QC1-0000-MASTER` so it can never be mistaken for a sold copy.

---

## 5 · QYRIS gap report

Nine inspections, run against this delta. **Routed** means removed or handled
here; **held** means it needs an authority this build lacks.

| # | Inspection | Gap found | Disposition |
|---|---|---|---|
| 1 | Missing prerequisite | A store product with no artifact behind it — the exact failure the head named | **Routed** — the artifact was built first and the store surface second. The preview page reads its numbers out of the built bytes, so it cannot describe a product that does not exist |
| 1b | Missing prerequisite | Delivering whatever file happens to be in the folder | **Routed** — `manifest.json` carries a SHA-256 per file, re-derived in test; a mismatch is a test failure, not a customer's problem |
| 1c | Missing prerequisite | A PDF that needs a font download to read | **Routed** — base-14 only, asserted by test: no `/FontFile` in either edition |
| 2 | Hidden handoff | Copy drifting between artifact, store card, thumbnail and package | **Routed** — one `content.mjs` feeds all four. The thumbnail is drawn by the same engine as the cover |
| 2b | Hidden handoff | Preview that flatters the artifact because it is a separate mock-up | **Routed** — the preview replays the artifact's own content stream. It can only be wrong in the same direction the PDF is |
| 3 | Authority mismatch | Quietly publishing a product because the file was ready | **Routed** — nothing routed in `vercel.json`, nothing linked from `public-site/`, preview marked NOT PUBLISHED on the page itself |
| 3b | Authority mismatch | Inventing a store system in a repository that is not the deployment authority | **Routed** — one guarded registration against the existing registry; no new catalogue, no second product truth, no checkout |
| 3c | Authority mismatch | A master file indistinguishable from a sold copy | **Routed** — `THY-QC1-0000-MASTER`, visible on the cover, colophon and every foot |
| 4 | Evidence gap | "The artifact opens" asserted rather than checked | **Routed** — `probe.mjs` opens it the way a reader does; xref, objects, streams, page tree, fields, metadata, all asserted |
| 4b | Evidence gap | Device rendering assumed from structure | **Held → C3.** Named as unverified rather than estimated |
| 4c | Evidence gap | Live store path implied by a working package | **Held → C1.** The preview page marks the live leg held, in the same list as the parts that pass |
| 5 | Unnecessary waiting | Waiting for the backend before making anything a customer can hold | **Routed** — the artifact, package, thumbnail, preview and registration SQL were all produced without egress. Only the live leg waits |
| 5b | Unnecessary waiting | Holding items 02 and 03 until 01 ships | **Routed** — both carry complete production copy and a full design specification now; neither waits on QuickCheck |
| 6 | Customer friction | A download link that expires, with no way back | **Routed** — entitlement is perpetual by contract in the manifest, and re-access is a deterministic rebuild from the serial, proved byte-identical |
| 6b | Customer friction | A buyer who cannot tell what they bought or how to get it again | **Routed** — `READ-ME-FIRST.txt`, `LICENCE-AND-RIGHTS.txt` and `RE-ACCESS.txt` ship inside the package, and the same routes are printed in the colophon |
| 6c | Customer friction | A PDF unreadable on the device most people actually hold | **Routed** — a phone edition typeset at 360×640 with its own reflow, not the print edition scaled down |
| 6d | Customer friction | A filename that breaks a download or truncates in a list | **Routed** — asserted in test: no hostile characters, under 80 characters, product + edition + serial legible |
| 7 | Rights and privacy risk | A product with no stated licence | **Routed** — rights line in the colophon, in `LICENCE-AND-RIGHTS.txt` and in the manifest; states what is granted, what is not, and that it survives cancellation |
| 7b | Rights and privacy risk | Unstated provenance for the method being sold | **Routed** — provenance names WR-RAELINK-001 section 5 and the date, in the artifact itself |
| 7c | Rights and privacy risk | An artifact that phones home | **Routed** — no `/URI`, no remote asset, no script. Asserted in test |
| 7d | Rights and privacy risk | A worked example that identifies a real vendor or person | **Routed** — the QuickCheck example is a THYLORA launch; the Before You Buy example names a category and no vendor |
| 8 | Value left on the table | One artifact, one format | **Routed** — print/tablet and phone editions from one source, plus a store thumbnail, at no extra authoring cost |
| 8b | Value left on the table | An engine usable once | **Routed** — `_engine/` is product-neutral; items 02 and 03 use it with no new machinery |
| 8c | Value left on the table | Three separate products with no shelf | **Partly routed** — one Standards Series, one mark, one grid, sequential series numbers. A three-item bundle SKU is identified and **not** proposed: it needs a bundle entitlement decision first |
| 9 | Failure and recovery | Re-access depending on a stored blob that could be lost | **Routed** — re-access is a rebuild from the serial, byte-identical, asserted in test |
| 9b | Failure and recovery | A new edition overwriting a customer's copy | **Routed** — the contract in the manifest and colophon: a corrected edition is delivered to the same entitlement, same serial, new edition line. The old file is never taken away |
| 9c | Failure and recovery | Registration SQL failing half-applied against an unknown schema | **Routed** — single transaction, `information_schema`-driven, idempotent, and silent success made impossible: the no-match path says so out loud. Three fixture databases |
| 9d | Failure and recovery | A serial collision or an unsellable master | **Routed** — master serial is reserved and visibly not a copy; `--serial` stamps per-copy at delivery |
| 9e | Failure and recovery | Nobody able to rebuild this if the build session is gone | **Routed** — one command, zero dependencies, deterministic output, and the restart vector in section 7 |

**29 gaps inspected · 25 routed · 1 partly routed · 3 held against a named blocker.**
No gap was reported and left unrouted where a safe, reversible route existed.

---

## 6 · Quality scoring

The head names Q = f(K,E,C), U = K×E×C×X×T and D = A×H×W×T×M×P. The factor
definitions are not recorded anywhere in this repository, so the expansion used
here is **stated rather than assumed**, and should be corrected if it is wrong —
the scores recompute in one line.

**Q = f(K,E,C)** — Knowledge × Execution × Care
K 0.90 · E 0.90 · C 0.92 → **Q = 0.745**

**U = K×E×C×X×T** — adding eXperience (what using it is like) and Trust
K 0.90 · E 0.90 · C 0.92 · X 0.85 · T 0.92 → **U = 0.583**

**D = A×H×W×T×M×P** — Attention × Hold × Worth × Trust × Mobility × Proof

| Factor | Score | Why |
|---|---|---|
| A · Attention | 0.85 | Distinct cover, one clear promise, a mark that reads at thumbnail size. Unproven in a real store listing |
| H · Hold | 0.88 | Twelve designed pages, a filled worked example, and a sheet that gets reused rather than read once |
| W · Worth | 0.80 | A reusable instrument at $29 with permanent re-access. Price is a proposal, not a tested number |
| T · Trust | 0.92 | Every claim in the artifact and on the preview is either demonstrated or labelled held. No live-commerce claim is made |
| M · Mobility | 0.86 | Two editions, no font download, no network, opens offline. Real-device render still unverified |
| P · Proof | 0.78 | Open, download, re-access, checksums, filenames and geometry all tested. Device render and the live store leg held |

**D = 0.85 × 0.88 × 0.80 × 0.92 × 0.86 × 0.78 = 0.369**

Read honestly: a six-factor product is severe by construction — straight 0.90s
score 0.531 and straight 0.95s score 0.735. The two factors holding this down are
**P** and **W**, and both have short routes: fifteen minutes on a device closes
most of P, and one Chairman decision closes W. With P at 0.92 and W at 0.90,
D reaches 0.50 with nothing else changing.

---

## 7 · Restart vector

If this work resumes cold:

1. **Read first:** `DASHBOARD_AUTHORITY.md`, `dashboard-baseline.json`,
   `workrooms/WR-RAELINK-001.md`, this file.
2. **Verify the floor:** `npm test` → expect **69 passing**. Then
   `node products/qyris-quickcheck/build.mjs` → the committed `dist/master`
   must be reproduced byte-for-byte (a test asserts it).
3. **Try the backend host first.** If reachable, C1 clears and the next
   executable actions are: read sequence 583 forward, read the live `products`
   and entitlement column shapes, and convert
   `db/store/0001_digital_delivery_qyris_quickcheck.sql` from
   `information_schema`-guarded writes into verified ones.
4. **If a device is available:** open both PDFs on an iPad and a phone, fill
   three fields on the sheet, and record what you see. That closes C3.
5. **Next executable state, in order, none of which needs an authority this
   build lacked:**
   - Build THY-SLR-002 from `content.mjs` + `DESIGN.md` (one layout pass).
   - Build THY-BYB-003, including the one new component: the exit-cost table.
   - Generate the three store thumbnails as a set and check them side by side at
     thumbnail size.
6. **Do not:** route the preview in `vercel.json`, link it from `public-site/`,
   apply the SQL to production, publish a price as final, or claim a live
   store transaction.

---

## 8 · State

| | |
|---|---|
| Workroom | **OPEN** |
| THY-QYRIS-QUICKCHECK-001 | **Artifact built.** 12 pages, two editions, package, thumbnail, preview. At **CHAIRMAN PREVIEW** |
| THY-STUCK-LOOP-RESET-001 | Production copy **complete**; design **specified**; artifact not built |
| THY-BEFORE-YOU-BUY-001 | Production copy **complete**; design **specified**; artifact not built |
| Delivery | Package, manifest, checksums, re-access **proved**. Live leg held (C1) |
| Store registration | Written, validated on three fixtures, **not applied** (C2) |
| Publication | **None.** Nothing routed, nothing linked |
| Backend read through 583 | **Not performed** — refused at the proxy (C1). Said plainly, not worked around |
| Tests | 69 / 69 · 48 prior unchanged |
| Baseline regression | **None.** |

NO LOSS. DO NOT GO BACKWARD. ONE SOURCE OF TRUTH. ACCESS ≠ AUTHORITY.
CURRENT BACKEND OUTRANKS HISTORICAL PROMPTS.
