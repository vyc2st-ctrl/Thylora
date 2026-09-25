## 5. Twelve Miles for Flour — the first completed product

### 5.1 First-product status, preserved

| Field | Record |
|---|---|
| Shopify | `gid://shopify/Product/7957652275277`, ACTIVE, 2 sales channels, $1.99, SKU `ER-UNKLE-SEEZIN-FLOUR-001`, requires shipping = false |
| Backend readiness | ACTIVE, `active_allowed = true`, source/artifact/visual/rights/delivery/re-access/checkout all true, zero blockers |
| Delivery file of record (v1) | `Uncle-Seezin-Twelve-Miles-for-Flour.pdf`, 4,767 bytes, 3 pages, sha256 `9be1fae6ad3f3548e58e239843b39d079d9319017ec2ca20bf5a72b5184feb5a`, asset ACTIVE, EDF `EDF-TWELVE-MILES-FOR-FLOUR-001 v1` |
| Chairman release decision | visual approved + rights confirmed (recorded 2026-09-08, repeated in batch) |
| Entitlements | 3, all ACTIVE (orders #1002, #1003, #1004) |

**Nothing about this product was changed this pass.** v1 stays the file of record. The status "first completed product" is written into the continuity row (§11) so later passes cannot quietly reassign it.

### 5.2 Why it is historically important

**Inside THYLORA's own history — evidence, not opinion:**

1. **First product to pass every gate.** It is the only product in the readiness table with all nine checks true and zero blockers.
2. **First real money through the full path.** Order #1004 is the first paid order for a story product: $1.99 captured, $0.36 fee, entitlement granted automatically three seconds after the order (14:58:49 → 14:58:52 UTC).
3. **First witnessed re-access.** The backend records re-opening through `thylora_open_edf_v1` — the promise "it stays yours" was tested, not just written.
4. **The reference every other product is measured against.** Backend blockers on six other products say, in so many words, "Twelve Miles evidence is NOT inherited." It is the yardstick.

**Outside THYLORA — the history the story carries (and which is usually left out):**

The Unkle Seezin trail lane sits inside one of the most thoroughly erased parts of American history: the Black trail cowboy. The Trail Table sheet in the same lane describes Seezin as "Black, Southern-born" and a trailman who "reads road and weather." *Twelve Miles for Flour* itself never states anyone's race — which is worth knowing before anyone markets it on this point.

- **Evidence.** Kenneth W. Porter's research (1969) estimated that of roughly 35,000 men who drove cattle up the trails from Texas after the Civil War, about **5,000 or more were Black** — roughly one in seven. Philip Durham and Everett L. Jones, *The Negro Cowboys* (1965), reached a similar figure. Many had learned cattle work while enslaved on Texas ranches. Named individuals are documented: Bose Ikard (Goodnight–Loving trail; Charles Goodnight wrote of trusting him above other men), Nat Love (autobiography, 1907), and Bass Reeves (Deputy U.S. Marshal, Indian Territory).
- **The higher figure you will see.** "One in four cowboys was Black" is widely repeated, including by museums and major outlets. It usually rests on extrapolation from thin records; few trail-crew payrolls survive.
- **Counter-argument, stated fairly.** Because the records are thin, some historians caution that both figures are estimates. They also note Mexican and Tejano vaqueros made up another large share, and that "cowboy" was an unstable job category. The defensible statement is: *Black men were a substantial minority of trail crews — commonly estimated at one in seven to one in four — and were almost entirely removed from the popular image.*
- **The bias in mainstream reporting.** Hollywood Westerns from the 1930s to the 1960s cast the trail as almost entirely white. That image, not the record, became the public memory. The best-known modern case: Larry McMurtry's Deets in *Lonesome Dove* is widely understood to draw on Bose Ikard.
- **Why that matters for this product.** A $1.99 story whose trail boss is, in canon, a Black Southern trailman quietly restores a figure the popular record removed. That is a real reason the product matters. It should only be used publicly once the canon line is also in the story or listing itself (§5.6, v2 question).

### 5.3 Purchase welcome screen (built, not deployed)

File: `spine-610/twelve-miles/welcome.html` — a self-contained page for Chairman review. It is not linked from Shopify and not deployed.

What it contains:

1. **Thank-you and open-your-story steps.** Library link, same-email sign-in, "nothing ships," "re-opening costs nothing and does not expire" — the same promises already on the listing, no new ones.
2. **Money equation beside the welcome.** A side panel shows `N = P − F − T − D` with the real #1004 numbers ($1.99 − $0.36 − $0.00 − $0.00 = $1.63), then `N = B + C + A + O + R` with every share marked "not set" and the line "When one is, it will be written here before the sale — never decided afterwards."
3. **Consent-based simulated maker thank-you** (§5.4).
4. **Customer feedback** (§5.5).

Works at phone width (single column below 820px) and in dark mode.

### 5.4 The simulated maker thank-you — how consent works

- The note is **hidden by default.** The customer sees a plain explanation first: Seezin is a fictional character, the note was written by the THYLORA team in his voice, it is not from a real person, and nobody is watching them open it.
- Two buttons: **"Yes, show me"** or **"No thanks."** Nothing is shown unless the customer chooses it.
- When shown, the note carries a visible label: **SIMULATED · FICTIONAL CHARACTER**, and the sign-off reads "written in the voice of Unkle Seezin by the THYLORA team."
- The page records nothing about the choice.

Text of the note: *"Twelve miles, and you came the whole way. Most folks figure the road is the number on the sign. You'll read how Caleb learned otherwise. Take your time with it. Mend what tore, thank who caught it, and draw the bridge on the board for the next rider."*

### 5.5 Customer feedback

A three-field form (rating, "what would make the next one better", permission to quote without a name). Pressing **Write the email** opens the customer's own mail app with a pre-filled message to `ersatzrealityenterprise@gmail.com`. The customer decides whether to send it. The page stores nothing.

**Why mail and not a database:** the backend has a `customer_suggestions` table, but anonymous-insert policy and retention rules for it were not reviewed this pass. Wiring it is a next step, not a claim.

### 5.6 v1 defects found, and the proposed v2 (not built over v1)

v1 is **not erased and not edited.** These are recorded for a v2 decision:

| # | v1 finding (read from the bytes) | Proposed v2 change |
|---|---|---|
| 1 | Page 1: the "ORIGINAL STORY" label is printed over the title | Re-set page 1 so the label sits above the title |
| 2 | PDF metadata title reads "Twelve Miles for Flour **Š** An Unkle Seezin Trail Story" (em dash mis-encoded) | Correct the metadata title |
| 3 | The body says "Uncle Seezin" three times; the title, listing and the file's own footer say "Unkle" | Chairman picks one spelling; v2 uses it everywhere |
| 4 | No cover inside the PDF; cover exists only as Shopify media | Add the approved cover as page 0 |
| 5 | Shopify image alt text names "Freight Woman 01" and "Wagon Hand 01"; the story names Lottie James | Rewrite alt text to match the story |
| 6 | Listing tag `EdereAriah` is the drift spelling of the locked **EdereAirah** | Correct the tag (a store edit — needs Chairman approval because the product is live) |
| 7 | No explicit "who it's for" line in the listing | Add one (e.g., "For readers, families and classrooms who like a short story with something to talk about afterwards") |

Money line for v2 is unchanged unless the price changes: N = $1.99 − $0.36 − T − $0.00 = $1.63 − T.
