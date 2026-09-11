# STORE + QUESTION QUEST ACTIVATION RUN — 2026-09-07

Run code: `STORE_QQ_ACTIVATION_2026_09_07`
Backend: Supabase project `jvsdxhrfhtlgaknhjxlz`
Storefront: Shopify `ersatzreality.myshopify.com` (ErsatzReality, Basic plan, USD)

Two lanes were run so neither cancelled the other. PATH A moved the store toward
first legitimate money. PATH B moved Question Quest from design into a costed,
demonstrable pilot.

---

## PATH A — what actually moved

### The blocker nobody had written down

Nine of the ten digital products on the live Shopify store had
`inventoryItem.requiresShipping = true`. A downloadable story would have demanded
a shipping address at checkout and could have attached a shipping charge.

This was invisible to the readiness model, which only tracked visual preflight,
rights, delivery and mobile preview. It would have been discovered by the first
customer.

Fixed in this run, verified, zero `userErrors`:

| before | after |
| --- | --- |
| `requiresShipping = true` on 9 of 10 | `requiresShipping = false` on 10 of 10 |

`tracked` is also `false` on all ten, which is correct — an untracked item is not
refused for zero inventory. The one product already correct was the
Bounded Problem-to-Value Diagnostic.

Recorded as finding `SHOPIFY_DIGITAL_REQUIRES_SHIPPING`.

### The product closest to money

**Twelve Miles for Flour — An Unkle Seezin Trail Story**, `$1.99`,
`gid://shopify/Product/7957652275277`.

It is closest because it is the only product in the entire system with a real
customer-facing artifact: `EDF-TWELVE-MILES-FOR-FLOUR-001` holds 50 verified
text blocks, 4,627 characters, with a source hash and a cover already attached.

Eight other products carry `final_artifact_complete = true`, but there is exactly
one EDF package in the whole database. Those flags are true about the legacy PDF
and false about the format the customer is supposed to receive. They were left
as they are rather than quietly flipped — see finding `EDF_ARTIFACT_GAP`. Read
`final_artifact_complete` together with the EDF package count, never alone.

### What still blocks the first sale

EDF side — the validator (`thylora_edf_validate_v1`, Chairman-only) requires
five things. Three are already satisfied: 50 text blocks, cover asset, source
hash. Two are not:

1. `age_classification` is null
2. `rights_download_allowed` / `rights_stream_allowed` are null

Both are set by a single Chairman RPC call. Passing null for a field leaves it
untouched, so the existing cover is safe.

Store side, independent of EDF:

3. Product `status` is `DRAFT`, `publishedAt` is null, `onlineStoreUrl` is null.
   It is not published to the Online Store publication.
4. Delivery and re-access are not connected. There is no entitlement object and
   no download path.
5. Checkout has never been walked end to end. No test order exists.
6. **Payment gateway state is UNKNOWN.** The `shopifyPaymentsAccount` field
   returned an access-scope error (`read_shopify_payments` not granted to this
   connection). Apple Pay and Google Pay are listed as *supported*; support is
   not activation. No claim is made that this store can take money. Finding
   `PAYMENT_GATEWAY_STATE_UNKNOWN`.

### One customer-facing contradiction, flagged not rewritten

The live description promises: *"the PDF is delivered by email within one
business day after purchase while automatic download delivery is being
connected."*

That contradicts the standing directive that EDF is the customer-facing format
and PDFs are legacy source only, and it commits a human to a fulfilment step
nobody has agreed to staff. It is Chairman voice on a customer page, so it was
flagged, not edited. Finding `PRODUCT_COPY_PROMISES_PDF`.

### Can the first sale happen after one explicit action?

No — and saying yes would be false. One action closes the **content** gate.
Money needs the payment gateway confirmed, the product published, and a delivery
path that exists.

The one action that closes the content gate, run as Chairman:

```sql
select public.thylora_edf_set_release_metadata_v1(
  p_edf_code               => 'EDF-TWELVE-MILES-FOR-FLOUR-001',
  p_age_classification     => '<Chairman decides>',
  p_rights_download_allowed=> <true|false>,
  p_rights_stream_allowed  => <true|false>,
  p_rights_territories     => '["<territories>"]'::jsonb
);
select public.thylora_edf_validate_v1('EDF-TWELVE-MILES-FOR-FLOUR-001');
```

After that returns `publishable: true`, `thylora_edf_publish_v1` freezes it.
Release metadata is immutable after publish, so the classification and rights
values are a one-way door.

---

## PATH B — Question Quest

See `QUESTION-QUEST-PILOT.md`.

---

## Self-caught exposure

`qq_principal_view_v1` and `qq_teacher_spotlight_v1`, both built earlier in this
same session, were `SECURITY DEFINER` and executable by **any** authenticated
account with no guard. That exposed school aggregate data and named-teacher
records to any signed-in user. `qq_confirm_understanding_v1`, which awards
credits, already carried a Chairman guard and was not exposed.

Caught by running the Supabase security advisor after building, before any UI
called them. Both now raise `THY-DENY` unless the caller is Chairman, verified
by executing them. `qq_margin_scenarios_v1` was also a `SECURITY DEFINER` view
(advisor ERROR) and is now `security_invoker = on`.

This is an interim posture. There is no teacher or principal role model wired to
auth. The guards must be widened deliberately when one exists — never left to
default. Finding `QQ_DEFINER_RPCS_UNGUARDED`.

---

## Findings table

All of the above is queryable, not just narrated:

```sql
select finding_code, severity, surface, resolved from public.thylora_run_findings;
```
