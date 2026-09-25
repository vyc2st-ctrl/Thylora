# Thank-You Flow — DRAFT (not deployed)

Applies after a paid or credit-redeemed order reaches `ENTITLEMENT_GRANTED` (webhook v5) and the item
opens in the THYLORA library. It is designed for the library page (`https://thylora-library.vercel.app`) and
the Shopify order-status page. **Not deployed. No code or Shopify setting was changed.**

Rules the flow enforces:
- Every question is optional, except that delivery never waits on any answer.
- Default is private. Nothing is published unless the buyer says yes to a specific, named use.
- Consent is recorded with scope, timestamp and version. The buyer can withdraw it later.

---

## Step 1 — Delivery confirmation (always shown, no questions)

> **It's yours.** *[Product title]* is in your THYLORA library. Open it now, or come back any time
> with the same email. You don't need to answer anything below to keep it.
>
> [Open it] · [Download PDF] (only where `rights_download_allowed = true`)

## Step 2 — Buyer consent (optional)

> **May we contact you about this purchase?**
> ○ Yes, only about this item (updates, fixes)
> ○ Yes, also about new THYLORA releases
> ○ No, don't contact me (default)

Record: `consent_scope ∈ {NONE, ORDER_ONLY, RELEASES}`, with timestamp and flow version.

## Step 3 — Simulated maker disclosure (always shown when a world character appears)

> **Who made this.** *[Product title]* is written and produced by ErsatzReality Studios / THYLORA.
> Characters such as *[Unkle Seezin / Naya Aven / …]* belong to our **EdereAirah simulation**. They are
> story characters, not real people, and they didn't write to you. Replies to your messages come from
> real people at ErsatzReality.
> *[If any part of the artifact was produced with generative tools, state which part here, matching the
> file's own metadata.]*

The last line exists because the Bramble Wick v1 bytes carry a C2PA manifest that names a generative
model. The disclosure must match what the file says about itself.

## Step 4 — Optional feedback

> **Was it worth it?** (optional)
> ○ Yes ○ Partly ○ No
> **One thing we should fix or add:** [ free text, 500 chars ]
> *Please don't include personal details. We read these ourselves, and they aren't published.*

Stored against the order, not the person, and never shown publicly.

## Step 5 — Creator attribution

Shown for creator-owned items (the "Help Me Sell This" lane):

> **Made by [creator's chosen credit].** Sold through the ErsatzReality store under a written agreement.
> [Creator] receives [v]% of what remains after fees, taxes and delivery cost.

For THYLORA-owned items, the credit block comes from `products.contributors`. No person is credited
unless they appear in `thylora_person_identity`, so no unregistered names are shown.

## Step 6 — Privacy choice

> **Your privacy settings for this order**
> ☐ Keep my purchase private (default: checked)
> ☐ Delete my feedback after 90 days (default: checked)
> ☐ Show my first name on a public "Thank you, early readers" list (default: unchecked)
> [Request deletion of my details] → ersatzrealityenterprise@gmail.com

## Step 7 — No public story without permission

> **We won't tell your story.** If we ever want to quote your feedback or mention you publicly, we'll ask
> you separately, show you the exact words and where they would appear, and wait for a clear yes.
> Saying no, or not answering, changes nothing.

Permission record (required before any public use):
`{order_ref, exact_text, placement, channel, date_range, consent_given_at, withdrawn_at}`
One record covers one use. Blanket permission isn't accepted.

---

## Data fields (proposed; no table created)

| Field | Values |
|---|---|
| order_ref | Shopify order GID |
| consent_scope | NONE / ORDER_ONLY / RELEASES |
| maker_disclosure_version | text |
| feedback_rating | YES / PARTLY / NO / null |
| feedback_text | ≤500 chars / null |
| creator_attribution_shown | text |
| privacy_private | bool (default true) |
| feedback_retention_days | 90 / null |
| public_name_opt_in | bool (default false) |
| story_permission_ids | array, empty by default |

Next build step, when authorized: add these fields as a new table with RLS so a buyer can see only
their own rows, matching the buyer-claim RLS already witnessed for webhook v5.
