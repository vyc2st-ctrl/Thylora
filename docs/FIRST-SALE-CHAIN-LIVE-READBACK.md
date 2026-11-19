# Live readback — customer sign-in through first access

Read at `2026-09-08T19:52:49Z`. Every value below is a live production row.
Nothing was simulated, and nothing was written to make a step pass.

## 1. Identity — `vyc2st+library@gmail.com`

| field | value |
| --- | --- |
| user_id | `510c33e4-4f4d-4bd6-998a-8ce7847b027e` |
| created_at | `2026-09-08T19:43:10.465Z` |
| **email_confirmed_at** | **`2026-09-08T19:43:45.752Z`** |
| **last_sign_in_at** | **`2026-09-08T19:43:45.760Z`** |

At baseline, 35 seconds earlier, this user existed with `email_confirmed_at = null`.
Confirmation and sign-in landed 8 ms apart — the signature of a magic link being
followed. The redirect repair is proved by behaviour, not just by the probe.

## 2. Claim — order #1003

| field | before | after |
| --- | --- | --- |
| state | `PENDING` | **`CLAIMED`** |
| claimed_at | null | **`2026-09-08T19:43:49.376Z`** |
| claimed_by_user_id | null | **`510c33e4-4f4d-4bd6-998a-8ce7847b027e`** |

Order `gid://shopify/Order/6096522444877`, event
`bec36de8-2b80-52ce-9ec5-84566337bb2f:14895405727821`. The claim was held at
`18:48:14Z` and released **3.6 seconds after the address was confirmed** — never before.
The confirmed-address guard held exactly as specified.

## 3. Entitlement

| field | value |
| --- | --- |
| entitlement_id | `9102f7cb-1339-4494-a828-1f1587a021ef` |
| state | **ACTIVE** |
| user | `510c33e4…` = `vyc2st+library@gmail.com` |
| product | `gid://shopify/Product/7957652275277` |
| source | `SHOPIFY` · `gid://shopify/Order/6096522444877` |
| **granted_via** | **`BUYER_CLAIM`** |
| granted_at | `2026-09-08T19:43:49.376Z` |

`granted_via: BUYER_CLAIM` is the decisive field. It proves this entitlement came
through the claim path built for buyers with no prior account — not through the alias
shortcut, and not by hand.

The matching order event also flipped `PENDING_BUYER_CLAIM` → `ENTITLEMENT_GRANTED`
with `buyer_user_id` populated.

## 4. Delivery

| field | value |
| --- | --- |
| attempt_id | `0ca887c3-8cf2-4bd1-b91c-076fff2adcca` |
| state | **DELIVERED** |
| attempt_no | **1** |
| failure_reason | **null** |
| created → updated | `19:43:49.376Z` → `19:43:55.948Z` |

First attempt, no retry, no failure.

## 5. Access log

| kind | count | detail |
| --- | --- | --- |
| **FIRST_ACCESS** | **1** | `vyc2st+library@gmail.com` · `EDF-TWELVE-MILES-FOR-FLOUR-001` · `19:43:55.948Z` |
| REACCESS | 0 | not yet |

## 6. The whole sequence, in 45 seconds

```
19:43:10.465  user row created, unconfirmed
19:43:45.752  email confirmed        <- magic link followed
19:43:45.760  signed in
19:43:49.376  claim CLAIMED, entitlement ACTIVE via BUYER_CLAIM
19:43:55.948  delivery DELIVERED, FIRST_ACCESS logged
```

## 7. Chain, computed by `thylora_first_sale_chain_v1()`

| step | verdict | evidence |
| --- | --- | --- |
| PRODUCT | **PASS** | EDF `PUBLISHED`, 50 blocks |
| CHECKOUT | **FAIL** | `checkout_path_verified = false`. Orders #1002/#1003 were draft orders completed as marked-as-paid, which bypasses the storefront checkout |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED** | `captures_witnessed = 0`; `thylora_payment_capture_witness` empty |
| ORDER | **PASS** | `orders_ingested = 2` |
| WEBHOOK | **PASS** | `verified_deliveries = 5` |
| ENTITLEMENT | **PASS** | `active_entitlements = 2` |
| DELIVERY | **PASS** | `delivered = 1`, `failed = 0` |
| FIRST ACCESS | **PASS** | `first_accesses = 1` |
| REACCESS | **FAIL** | `reaccesses = 0` |

`first_failing_step: CHECKOUT` · `real_money_captured: false` ·
`can_take_first_customer: false`

Four steps moved from FAIL to PASS on this run: ENTITLEMENT via the claim path,
DELIVERY, FIRST ACCESS, and the claim release itself. PAYMENT was not touched.
