-- THYLORA · Runway registration, money truth, Chairman action queue
-- Target backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- STATUS: APPLIED to thylora-dash on 2026-10-05.
-- Unlike 0001 and 0002 (still UNAPPLIED), every statement in this file is
-- already live on the authoritative backend. It is kept here so the repository
-- carries the same truth the database does, and so the authoritative dashboard
-- repo can merge it forward.
--
-- Chairman instruction this serves (2026-10-05):
--   "if you can hook up to runway hook up to runway so I can put my account in"
--   "where's the money at in it we didn't ever talked about the money that we
--    don't see in it"
--   "I need my dashboard moving to completion without me all the way to where
--    it needs me and then I'm alerted ... then I can click on what I need to do"
--
-- THREE RULES HELD THROUGHOUT:
--   1. ADDITIVE. No permitted value is removed, no row is deleted, no table is
--      dropped. The provider vocabulary gains members and loses none.
--   2. NO SECOND TRUTH. The money picture and the action queue are FUNCTIONS
--      computed from live tables. chairman_action_cards stays the authoritative
--      action store; nothing here competes with it.
--   3. NO CREDENTIAL. Only the expected secret NAME is recorded. No key text
--      enters this repository, this file, or any chat.

begin;

-- ===========================================================================
-- 1. Admit media and commerce providers into the ONE provider registry.
--    The registry was built for language models only, so Runway had no slot.
--    The old four are all still permitted.
-- ===========================================================================

alter table public.thylora_provider_registry
  drop constraint if exists thylora_provider_registry_provider_code_check;

alter table public.thylora_provider_registry
  add constraint thylora_provider_registry_provider_code_check
  check (provider_code = any (array[
    'OPENAI','GEMINI','ANTHROPIC','XAI',          -- pre-existing, unchanged
    'RUNWAY','FAL','HEYGEN',                      -- media
    'SHOPIFY','LEMONSQUEEZY'                      -- commerce / payment rails
  ]));

alter table public.thylora_provider_registry
  add column if not exists provider_kind text not null default 'LANGUAGE';

alter table public.thylora_provider_registry
  drop constraint if exists thylora_provider_registry_provider_kind_check;

alter table public.thylora_provider_registry
  add constraint thylora_provider_registry_provider_kind_check
  check (provider_kind = any (array['LANGUAGE','MEDIA','COMMERCE']));

-- Where the Chairman goes, and what he is being asked to do there. Without
-- these the action queue can tell him a provider is blocked but not where to
-- click, which is exactly the gap he asked to close.
alter table public.thylora_provider_registry
  add column if not exists chairman_console_url text;

alter table public.thylora_provider_registry
  add column if not exists chairman_action_label text;

-- ===========================================================================
-- 2. Register Runway. CHAIRMAN_AUTH_REQUIRED, not CONNECTED: the Chairman
--    registered an account, and THYLORA holds no key, so no Runway call is
--    possible. The row says that plainly rather than implying capability.
-- ===========================================================================

insert into public.thylora_provider_registry
 (provider_code, provider_kind, display_name, expected_secret_name, health_endpoint,
  configured_state, enabled, configured, authenticated, integration_test,
  chairman_action_required, chairman_console_url, chairman_action_label,
  failure_reason, last_response_summary)
values
 ('RUNWAY','MEDIA','Runway (image + video generation)','RUNWAY_API_KEY',
  'https://api.dev.runwayml.com/v1/organization',
  'CHAIRMAN_AUTH_REQUIRED', true, false, false, false,
  true,
  'https://dev.runwayml.com/keys',
  'Paste your Runway API key — this is the only step blocking video generation',
  'Chairman registered a Runway account. RUNWAY_API_KEY is not present in backend secrets, so no Runway call can be made yet. Nothing will be billed until the key is lodged and the Chairman approves a priced job.',
  'ENDPOINT_RECORDED_NOT_YET_VERIFIED')
on conflict (provider_code) do update set
  provider_kind            = excluded.provider_kind,
  display_name             = excluded.display_name,
  expected_secret_name     = excluded.expected_secret_name,
  health_endpoint          = excluded.health_endpoint,
  chairman_console_url     = excluded.chairman_console_url,
  chairman_action_label    = excluded.chairman_action_label,
  chairman_action_required = excluded.chairman_action_required,
  failure_reason           = excluded.failure_reason,
  updated_at               = now();

-- Console URLs for the two language providers the registry already said were
-- waiting on the Chairman. They were flagged chairman_action_required with no
-- link, so the queue could name the blocker but not where to resolve it.
update public.thylora_provider_registry set
  chairman_console_url = case provider_code
    when 'ANTHROPIC' then 'https://console.anthropic.com/settings/keys'
    when 'OPENAI'    then 'https://platform.openai.com/api-keys'
    when 'GEMINI'    then 'https://aistudio.google.com/apikey'
    when 'XAI'       then 'https://console.x.ai'
    else chairman_console_url end,
  chairman_action_label = case provider_code
    when 'ANTHROPIC' then 'Create an Anthropic key for the deployed THYLORA AI router'
    when 'OPENAI'    then 'Create an OpenAI key for the deployed THYLORA AI router'
    else chairman_action_label end,
  updated_at = now()
where provider_code in ('ANTHROPIC','OPENAI','GEMINI','XAI');

-- ===========================================================================
-- 3. The money nobody had written down.
--
--    Shopify processed a LIVE 1.99 USD card payment on 2026-09-16 and had no
--    cost row at all. Supabase holds every THYLORA record and had no cost row.
--    Both are real recurring money out with nothing in the backend recording
--    them. Registered ACTIVE_UNPRICED — present and acknowledged, amount
--    deliberately NULL, because this session has not seen either bill and will
--    not project a price it has not read.
-- ===========================================================================

insert into public.service_cost_registry
 (service_code, service_name, category, provider_code, billing_state, billing_cadence,
  amount, currency, estimated_monthly, estimated_annual, evidence, notes)
values
 ('RUNWAY-API-001','Runway (image + video generation) API','MEDIA_PROVIDER','RUNWAY',
  'UNKNOWN','usage_based', null,'USD', null, null,
  '[{"kind":"CHAIRMAN_STATEMENT","date":"2026-10-05","claim":"Chairman registered a Runway account. He states video generation is blocked by current plan and ~115 credits are present. NOT independently witnessed by this session - no RUNWAY_API_KEY in backend secrets, so no call was made."}]'::jsonb,
  'COST UNKNOWN BY DESIGN. Runway bills per generation in credits, so monthly cost is a function of how many clips THYLORA generates - it cannot be projected before the first priced job. No Runway spend is possible until RUNWAY_API_KEY is lodged AND the Chairman approves a priced job. First real invoice is the evidence that closes this row.'),

 ('SHOPIFY-STORE-001','Shopify storefront (ersatzreality.myshopify.com)','COMMERCE_PLATFORM','SHOPIFY',
  'ACTIVE_UNPRICED','monthly', null,'USD', null, null,
  '[{"kind":"INFERRED_FROM_LIVE_SALE","date":"2026-10-05","claim":"Shopify processed a LIVE card payment of 1.99 USD on 2026-09-16 (order #1004, gateway shopify_payments, transaction SUCCESS, test flag false). A store that takes live card payments is on a paid plan, so a recurring Shopify bill exists.","source":"thylora_payment_capture_witness.capture_id=3600113c-2de1-4bce-92ec-16e58bcfd293"}]'::jsonb,
  'MONEY GAP FOUND 2026-10-05: this is the live storefront that processed the only real sale, and it had NO row in the cost registry at all. A recurring charge is being paid with nothing in the backend recording it. Chairman must read the Shopify billing page and lodge plan + amount.'),

 ('SUPABASE-THYLORA-DASH-001','Supabase project thylora-dash (jvsdxhrfhtlgaknhjxlz)','INFRASTRUCTURE',null,
  'ACTIVE_UNPRICED','monthly', null,'USD', null, null,
  '[{"kind":"INFERRED_FROM_OWN_CONNECTION","date":"2026-10-05","claim":"This session read and wrote this project live, so it is an active Supabase project. Whether it sits on free or paid tier is not readable from inside the database."}]'::jsonb,
  'MONEY GAP FOUND 2026-10-05: the backend that holds all THYLORA canon had no cost row. If this project is on a paid tier, THYLORA is paying for its own spine with no record of it. Chairman must confirm tier from the Supabase billing page.')
on conflict (service_code) do update set
  provider_code = excluded.provider_code,
  billing_state = excluded.billing_state,
  evidence      = excluded.evidence,
  notes         = excluded.notes,
  updated_at    = now();

commit;

-- ===========================================================================
-- 4. Chairman action cards.
--
--    chairman_action_cards ALREADY EXISTED with exactly the right shape:
--    action_code, title, task_text, destination_url, instructions,
--    done_condition, reason_required, blocker_type, source_record, evidence,
--    status. No new action table was created. These are rows in it.
--
--    Every one carries spend_on_this_step = 0.00 USD. Not one of the four asks
--    the Chairman to spend money — they ask him to lodge a key, read two bills,
--    and make one routing decision.
-- ===========================================================================

insert into public.chairman_action_cards
 (action_code, title, task_text, destination_url, instructions, done_condition,
  reason_required, blocker_type, source_record, evidence, status)
values
 ('THY-ACT-20261005-RUNWAY-KEY-001',
  'Lodge your Runway API key',
  'You registered a Runway account. THYLORA has the Runway adapter, the job table, the cost gate and the provenance chain built and waiting, but it holds no Runway credential, so it cannot make a single call. Paste the key once and the whole media lane goes from BLOCKED to ARMED.',
  'https://dev.runwayml.com/keys',
  '["Open the Runway API keys page on the link above.","Sign in to the Runway account you registered.","Create a new API key (name it THYLORA).","Copy the key.","Open the THYLORA backend secrets and store it under the exact name RUNWAY_API_KEY.","Return to the dashboard Action Queue - the Runway row flips to CONNECTED once the first health call succeeds."]'::jsonb,
  'thylora_provider_registry row RUNWAY shows configured_state = CONNECTED with a recorded last_http_status from the live health endpoint https://api.dev.runwayml.com/v1/organization.',
  'No Runway credential exists in THYLORA. A provider key can only be created by the account holder - this session cannot mint one, and must never hold one in the repository.',
  'EXTERNAL_PROVIDER_AUTHORITY',
  'WR-MEDIA-ROUTER-001 / thylora_provider_registry.RUNWAY',
  '{"money_required": false, "spend_on_this_step": "0.00 USD", "note": "Lodging the key spends nothing. Runway bills per generation, and studio_render_jobs_priced_before_spend blocks any job that has not been priced and approved first. No clip can be generated without a separate Chairman approval.", "unblocks": ["image-to-video generation", "Bramble serialized test case", "cost-per-clip measurement"], "chairman_statement_2026_10_05": "Chairman states video generation is blocked by current Runway plan and ~115 credits present. Not witnessed by this session."}'::jsonb,
  'OPEN'),

 ('THY-ACT-20261005-SHOPIFY-COST-001',
  'Read your Shopify bill once so THYLORA knows its burn rate',
  'Shopify took a real live card payment of $1.99 on 2026-09-16, so there is a Shopify plan being paid for every month. THYLORA had NO record of that cost anywhere. Until the amount is lodged, THYLORA cannot state its own burn rate, runway or break-even - the money going out is invisible.',
  'https://admin.shopify.com/store/ersatzreality/settings/billing',
  '["Open the Shopify billing settings on the link above.","Read the plan name and the recurring amount.","Note the next billing date.","Enter the plan and amount in the dashboard Money room against SHOPIFY-STORE-001.","If there are app subscriptions or domain charges listed, note those too - each is separate money out."]'::jsonb,
  'service_cost_registry row SHOPIFY-STORE-001 has a non-null estimated_monthly and an evidence entry of kind CHAIRMAN_BILLING_PAGE_READ.',
  'A provider billing page can only be read by the account holder. This session has no Shopify billing scope and refuses to project a plan price it has not seen.',
  'EXTERNAL_PROVIDER_AUTHORITY',
  'thylora_money_truth_v1 lane=UNPRICED RUNNING COSTS / service_cost_registry.SHOPIFY-STORE-001',
  '{"money_required": false, "spend_on_this_step": "0.00 USD", "note": "Reading a bill spends nothing. This closes a money-OUT blind spot, it does not create a charge.", "money_gap_found": "2026-10-05: the live storefront that processed the only real sale had no cost row at all."}'::jsonb,
  'OPEN'),

 ('THY-ACT-20261005-SUPABASE-COST-001',
  'Confirm the Supabase tier for thylora-dash',
  'thylora-dash is the backend holding every THYLORA record, continuity floor and gate. It had no cost row. If it sits on a paid tier, THYLORA is paying for its own spine with nothing in the backend recording it.',
  'https://supabase.com/dashboard/project/jvsdxhrfhtlgaknhjxlz/settings/billing',
  '["Open the Supabase billing page for project thylora-dash.","Read the plan (Free, Pro, Team).","If paid, read the monthly amount and any compute add-ons.","Enter it in the dashboard Money room against SUPABASE-THYLORA-DASH-001."]'::jsonb,
  'service_cost_registry row SUPABASE-THYLORA-DASH-001 has a recorded tier and, if paid, a non-null estimated_monthly.',
  'Billing tier is not readable from inside the database. Only the project owner can read it.',
  'EXTERNAL_PROVIDER_AUTHORITY',
  'thylora_money_truth_v1 lane=UNPRICED RUNNING COSTS / service_cost_registry.SUPABASE-THYLORA-DASH-001',
  '{"money_required": false, "spend_on_this_step": "0.00 USD"}'::jsonb,
  'OPEN'),

 ('THY-ACT-20261005-PAYMENT-ROUTING-001',
  'Decide where THYLORA money actually lands: Stripe or Shopify Payments',
  'Canon record THY-COMMERCE-PROVIDER-AUTHORITY-001 says the payment provider is STRIPE. The live $1.99 capture reports gateway shopify_payments. Both are recorded as observed; neither has been reconciled. Two different answers to "where does the money land" is a money risk, not a cosmetic one.',
  'https://admin.shopify.com/store/ersatzreality/settings/payments',
  '["Open the Shopify payments settings on the link above.","Read which provider is actually enabled for this store.","Decide which provider is THYLORA authority going forward.","State the decision in the dashboard - THYLORA will amend THY-COMMERCE-PROVIDER-AUTHORITY-001 additively and preserve the old record, never overwrite it."]'::jsonb,
  'A Chairman decision is recorded naming the authoritative payment provider, and the prior record is preserved as superseded rather than deleted.',
  'This is an authority decision about where revenue lands. ACCESS != AUTHORITY - this session will not pick a side on the Chairman behalf.',
  'CHAIRMAN_AUTHORITY_DECISION',
  'thylora_payment_capture_witness.capture_id=3600113c-2de1-4bce-92ec-16e58bcfd293',
  '{"money_required": false, "spend_on_this_step": "0.00 USD", "discrepancy": "canon=STRIPE vs live_gateway=shopify_payments", "unreconciled_since": "2026-09-16"}'::jsonb,
  'OPEN')
on conflict (action_code) do update set
  task_text       = excluded.task_text,
  destination_url = excluded.destination_url,
  instructions    = excluded.instructions,
  done_condition  = excluded.done_condition,
  evidence        = excluded.evidence,
  updated_at      = now();

-- The pre-existing rank-1 blocker gains its money flag and the reason it
-- outranks everything else. Its status is untouched: it was OPEN before this
-- session and is OPEN after it, because this session cannot promote the alias.
update public.chairman_action_cards
set evidence = evidence || jsonb_build_object(
      'money_required', false,
      'spend_on_this_step', '0.00 USD',
      'unblocks', jsonb_build_array(
        'every dashboard room the Chairman is trying to open',
        'the R6 workspace lane',
        'the Media Router room',
        'the Action Queue room'),
      'why_rank_1', 'Until the production alias serves current master, no dashboard work done in any session is visible to the Chairman. Everything else is behind this.'),
    updated_at = now()
where action_code = 'THY-ACT-20260917-PROMOTE-EA21B42-001';

-- ===========================================================================
-- 5. The derived views. Functions, not tables. See
--    thylora_money_truth_v1() and thylora_chairman_action_queue_v1() as
--    applied on thylora-dash; their definitions are reproduced in
--    db/dashboard/0003_functions.sql so the repository carries them too.
-- ===========================================================================
