# CONNECTION GAPS CLOSED — Q354
Read 2026-09-10. Continuity: THY-Q-20260910-CONNECTION-GAPS-354.

Two gaps were named: the auth redirect, and the Shopify to submit customer handoff.
Both are closed. Neither closure required a Chairman action, and neither waited on a purchase.

## GAP 1 — AUTH REDIRECT

### What was actually wrong
The submit page sent a magic-link email. Supabase built that link as
`/auth/v1/verify?token=<hash>&type=magiclink&redirect_to=<origin>`. Because
`thylora-submit.vercel.app` is not on the project's redirect allow-list, Supabase
discarded the requested origin and substituted the project Site URL, which is not
reachable. The customer clicked a link and landed nowhere. The allow-list is not
writable from here.

### Probes, not assumptions
| probe | request | result |
|---|---|---|
| `redirect_to=thylora-submit.vercel.app` | 17258 | could not connect, 0 bytes |
| `redirect_to=thylora-library.vercel.app` (positive control) | 17259 | 200, 9,698 bytes, landed on the library page — ALLOWED |
| `redirect_to=example.com` (negative control) | 17260 | could not connect |
| the submit origin fetched directly | 17237 | 200, page served — so the host itself is fine |

The submit origin is not allow-listed. That is established, not inferred.

### The repair
`/auth/v1/verify` accepts a `POST {type, token_hash}` and carries no redirect at all.
Probe 17262, from Postgres, with a deliberately invalid hash:

    403 {"code":403,"error_code":"otp_expired","msg":"Email link is invalid or has expired"}

The endpoint is live, reachable from an origin with no relationship to the allow-list,
and rejects only the bad token. So the page now does the exchange itself: the customer
pastes the link from the email into a box on the page, the page pulls `token`/`token_hash`
and `type` out of it, and calls `verifyOtp({ token_hash, type })`. No redirect is used.
If a link ever does land on the page directly, the same code finishes it silently.

### Proof it completes, end to end
Run against the second account, no Chairman action, no service-role key:

1. `POST /auth/v1/otp` with the publishable key and **no `redirect_to` at all** —
   request 17273, **200 `{}`**. A token was minted: `auth.one_time_tokens`,
   `token_type = recovery_token`, `relates_to = vyc2st+library@gmail.com`,
   56-character hash. That is the same value the emailed link carries.
2. `POST /auth/v1/verify` with `{type:'magiclink', token_hash:<that>}` — request 17275,
   **200**, returning a real `access_token` and `refresh_token`, `token_type: bearer`,
   `expires_in: 3600`, `user.email = vyc2st+library@gmail.com`,
   `user.id = 510c33e4-4f4d-4bd6-998a-8ce7847b027e`.
3. Tokens remaining for that account afterwards: **0**. One-time semantics hold, so the
   page's wording — a link works once and then expires — is accurate rather than decorative.

The token value is not written here and was never printed to chat.

### Deployed and byte-verified
`surfaces/submit/index.html` — 24,627 bytes, md5 `4b0b272c156164775402ea6bb27e62a5`.
Live fetch of `https://thylora-submit.vercel.app/` (request 17271): **200**, 24,627 bytes,
md5 `4b0b272c156164775402ea6bb27e62a5`. Identical. Headers intact on the live response:
`cache-control: no-store`, `x-frame-options: DENY`, `x-content-type-options: nosniff`,
`referrer-policy: no-referrer`, and the CSP.

### One mistake, recorded
The first deploy of this change omitted `index.html` and published only `vercel.json`,
which left the live submit page without its content. It was caught on the same turn and
the complete set was redeployed immediately. The 200/md5 evidence above is from after
that repair, not before it.

## GAP 2 — SHOPIFY TO SUBMIT HANDOFF

### The store page
`/pages/your-order` created and published — Page `118181625933`, published
2026-09-10T12:27:05Z. Live probe of
`https://ersatzreality.myshopify.com/pages/your-order` (request 17277): **200**, and the
served HTML contains the submit link, the library link, the paste instruction, and the
"where things actually stand" section.

It says three things a customer needs and one they are owed:
- made-for-you orders go to `thylora-submit.vercel.app`, signed in with the address they
  bought with, no order number;
- how the sign-in actually works right now, including that tapping the link from a mail
  app will not land them back on the page, and why pasting it in is the way through;
- reading material goes to the library instead;
- and plainly, that only reading material is open for orders today, that the made-for-you
  wares are drafts with authorized prices, and that no delivery time has been agreed for
  any of them. The page describes the path an order takes; it does not claim every ware
  is on sale.

### The product
`Postcard From Anywhere` (`7965990355021`, DRAFT, $12.99) now carries a
"Where your order goes after checkout" section pointing at `/pages/your-order` and the
submit surface, and says which part exists and which does not: the path is built and
working; what is missing is the agreement to make the card, which is why the item is
still a draft. Status unchanged — still DRAFT. The other seven get the same section at
activation, not before.

### The shelf
`surfaces/store-front/index.html` — 30,720 bytes, md5 `d1da687821361ac24fb2de7fb701b0d3`.
Live fetch of `https://thylora-store.vercel.app/` (request 17281): **200**, 30,720 bytes,
md5 `d1da687821361ac24fb2de7fb701b0d3`. Identical. It now carries an "Open your order"
route beside the library route, a link to `/pages/your-order`, and two new measured rows.
Spelling checked on the live bytes: `EdereAirah` present, `ErsatzV` present, `ARIAH`
absent.

### What was deliberately not touched
`Twelve Miles for Flour` is the only ACTIVE product and the standing instruction is not
to disturb it, because the first genuine $1.99 purchase is the live checkout and payment
test. Its description was left exactly as it was. A buyer of it needs the library, not
the submit path, and the library route on the shelf already covers that. Adding a line
to it is available whenever the Chairman wants it; it was not taken unilaterally.

## MONEY GATES — UNCHANGED

| gate | state |
|---|---|
| CHECKOUT | **NOT PROVEN** — needs a real buyer through storefront checkout |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED**, 0 capture witnesses |
| REACCESS | **0** — no second opening recorded |
| SUBMIT USED | **0** — no real customer has passed through it |

Nothing in this work moved any of those, and nothing here should be read as moving them.
The first genuine purchase remains an organic evidence event, not an execution dependency.

## STILL OPEN

- The redirect allow-list itself is still not writable from here, and the Site URL still
  appears to point at an unreachable host. The customer path no longer depends on either,
  but a one-click link from the email would be nicer than a paste, and that needs the
  allow-list entry.
- The corrected library page is committed but undeployable — the Vercel 403 on
  `thylora-library` is project-scoped and was not routed around, because a new origin
  would force a fresh sign-in.
- The checkout footer still links only the privacy policy. The refunds and terms policy
  slots need `write_legal_policies`, which this app does not hold; both documents are
  published as store pages instead.
- MirrorWardrobe: 0 houses, 0 looks. Still draft, still not the first activation test.
- Cover gate `THY-REVIEW-TWELVE-MILES-COVER-001` remains OPEN.
