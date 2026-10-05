-- THYLORA · derived views for the Chairman dashboard
-- Target backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
--
-- STATUS: APPLIED to thylora-dash on 2026-10-05. The bodies below were read
-- back out of the live database with pg_get_functiondef() and match this file,
-- so the repository and the backend say the same thing.
--
-- WHY FUNCTIONS AND NOT TABLES.
-- The Chairman asked where the money is that he cannot see, and for one prompt
-- showing what needs him. Both are answers ABOUT the backend. Writing them into
-- a table would create a second place for the truth to live, which is the exact
-- failure that let a $1.00 test order stand in for a $1.99 real sale on the
-- dashboard for three weeks. A function cannot go stale and cannot be edited
-- into a lie: it is recomputed from the live tables on every call.
--
-- chairman_action_cards remains the AUTHORITATIVE action store. Nothing here
-- competes with it; thylora_chairman_action_queue_v1() reads it.


-- ===========================================================================
-- thylora_money_truth_v1()
-- Answers: "where's the money at in it that we don't see in it".
-- ===========================================================================

create or replace function public.thylora_money_truth_v1()
returns table (
  lane              text,
  direction         text,   -- IN | OUT | NEITHER
  headline          text,
  amount_usd        numeric,
  visible_on_dashboard boolean,
  evidence          text,
  gap               text
)
language sql
stable
as $fn$
  -- 1. REAL MONEY IN: live card captures actually witnessed.
  select
    'LIVE PAYMENTS WITNESSED'::text,
    'IN'::text,
    'Live card captures recorded with processor evidence'::text,
    coalesce(sum(w.amount), 0)::numeric,
    false,  -- orders is what the dashboard reads; these are not in it
    'thylora_payment_capture_witness · ' || count(*)::text || ' capture(s)',
    case when count(*) = 0 then 'No live payment has ever been witnessed.'
         else 'NOT VISIBLE ON DASHBOARD. The commerce room reads public.orders, and these captures were never written there.'
    end
  from public.thylora_payment_capture_witness w

  union all

  -- 2. WHAT THE DASHBOARD ACTUALLY SHOWS as revenue.
  select
    'DASHBOARD COMMERCE ROOM'::text,
    'IN'::text,
    'Sum of public.orders — this is the only revenue the dashboard can render'::text,
    coalesce(sum(o.total_amount), 0)::numeric,
    true,
    'public.orders · ' || count(*)::text || ' row(s): ' ||
      coalesce(string_agg(o.order_reference, ', '), 'none'),
    case
      when count(*) = 0 then 'Commerce room renders zero.'
      when count(*) filter (where o.order_reference ilike '%TEST%') = count(*)
        then 'EVERY row in orders is a TEST order. The dashboard is presenting test money as the state of the business.'
      else 'Mixed test and real rows — reconcile before reading this as revenue.'
    end
  from public.orders o

  union all

  -- 3. EXTERNAL CUSTOMER: the only number that proves the business works.
  select
    'EXTERNAL CUSTOMER REVENUE'::text,
    'IN'::text,
    'Revenue from a buyer who is not the Chairman'::text,
    coalesce(sum(w.amount), 0)::numeric,
    false,
    'thylora_payment_capture_witness where evidence->>is_external_customer = true · ' ||
      count(*)::text || ' capture(s)',
    case when count(*) = 0
      then 'ZERO. Every payment so far is the Chairman buying from himself. The payment MECHANISM is proven live; the BUSINESS is not yet proven.'
      else 'External revenue exists.' end
  from public.thylora_payment_capture_witness w
  where coalesce((w.evidence->>'is_external_customer')::boolean, false) is true

  union all

  -- 4. DESIGNED REVENUE NOT CONNECTED TO A TILL.
  select
    'REVENUE PATHS WITHOUT A TILL'::text,
    'NEITHER'::text,
    'Revenue paths marked ACTIVE that have produced no order'::text,
    null::numeric,
    false,
    'thylora_revenue_paths state=ACTIVE · ' || count(*)::text || ' path(s)',
    'This is the largest invisible money in THYLORA: ' || count(*)::text ||
    ' revenue paths are marked ACTIVE, and public.orders holds ' ||
    (select count(*)::text from public.orders) ||
    ' row(s). ACTIVE here means designed and unblocked, NOT earning. No path carries a price, so none can be totalled.'
  from public.thylora_revenue_paths rp
  where rp.state = 'ACTIVE'

  union all

  -- 5. MONEY OUT that nobody priced.
  select
    'UNPRICED RUNNING COSTS'::text,
    'OUT'::text,
    'Services known to be running whose cost is not recorded'::text,
    null::numeric,
    false,
    'service_cost_registry estimated_monthly IS NULL · ' || count(*)::text || ' service(s): ' ||
      coalesce(string_agg(s.service_code, ', ' order by s.service_code), 'none'),
    'THYLORA cannot state its own burn rate. ' || count(*)::text ||
    ' registered service(s) have no monthly figure, so no runway, margin or break-even can be computed. ' ||
    'Each closes only on a real invoice or billing page read.'
  from public.service_cost_registry s
  where s.estimated_monthly is null

  union all

  -- 6. MEDIA SPEND: what the render pipeline has actually cost.
  select
    'MEDIA GENERATION SPEND'::text,
    'OUT'::text,
    'Actual money spent on generated clips'::text,
    coalesce(sum(j.actual_cost), 0)::numeric,
    false,
    'studio_render_jobs · ' || count(*)::text || ' job(s) ever created',
    case when count(*) = 0
      then 'ZERO SPENT and ZERO PRODUCED. The render pipeline has never run, so the cost per finished clip is unknown and no episode can be budgeted.'
      else 'Spend recorded.' end
  from public.studio_render_jobs j

  union all

  -- 7. THE ROUTING DISCREPANCY: where the money actually lands.
  select
    'PAYMENT ROUTING AUTHORITY'::text,
    'IN'::text,
    'Which processor THYLORA money actually arrives through'::text,
    null::numeric,
    false,
    'thylora_payment_capture_witness.evidence->>provider_authority_discrepancy',
    coalesce(
      (select w.evidence->>'provider_authority_discrepancy'
         from public.thylora_payment_capture_witness w
        where w.evidence ? 'provider_authority_discrepancy'
        order by w.captured_at desc limit 1),
      'No discrepancy recorded.')
$fn$;

comment on function public.thylora_money_truth_v1() is
  'Derived money picture for the Chairman dashboard. Computed live from thylora_payment_capture_witness, orders, thylora_revenue_paths, service_cost_registry and studio_render_jobs. Stores nothing. ADVANCEMENT != REPLACEMENT.';


-- ===========================================================================
-- thylora_chairman_action_queue_v1()
-- The Chairman prompt: every gate blocked on VYC, ranked, with the click target.
--
-- chairman_action_cards is AUTHORITATIVE. This reads it and unions it with
-- gates computed from the provider and cost registries, so a real blocker with
-- no card still appears, flagged NO_CARD_YET. Same discipline as the Prompt
-- Coverage Ledger: a gate may be deferred with a reason, never dropped.
-- ===========================================================================

create or replace function public.thylora_chairman_action_queue_v1()
returns table (
  rank                integer,
  action_code         text,
  lane                text,
  title               text,
  what_to_do          text,
  click_here          text,
  steps               jsonb,
  why_it_needs_you    text,
  done_when           text,
  money_required      boolean,
  spend_on_this_step  text,
  unblocks            text,
  card_state          text
)
language sql
stable
as $fn$
with
carded as (
  select
    c.action_code,
    case c.blocker_type
      when 'EXTERNAL_PROVIDER_AUTHORITY'            then 'PROVIDER CREDENTIAL'
      when 'EXTERNAL_AUTHORIZATION'                 then 'DEPLOYMENT'
      when 'CHAIRMAN_AUTHORITY_DECISION'            then 'AUTHORITY DECISION'
      when 'CHAIRMAN_VISUAL_APPROVAL'               then 'VISUAL APPROVAL'
      when 'CHAIRMAN_AUTHENTICATED_RUNTIME_WITNESS' then 'RUNTIME WITNESS'
      else coalesce(c.blocker_type, 'OTHER')
    end                                              as lane,
    c.title,
    c.task_text                                      as what_to_do,
    c.destination_url                                as click_here,
    case
      when jsonb_typeof(c.instructions) = 'array'  then c.instructions
      when jsonb_typeof(c.instructions) = 'object' then coalesce(c.instructions->'steps', c.instructions)
      else '[]'::jsonb
    end                                              as steps,
    c.reason_required                                as why_it_needs_you,
    c.done_condition                                 as done_when,
    coalesce((c.evidence->>'money_required')::boolean, false) as money_required,
    coalesce(c.evidence->>'spend_on_this_step', 'NOT STATED')  as spend_on_this_step,
    coalesce(
      (select string_agg(x, ', ') from jsonb_array_elements_text(c.evidence->'unblocks') x),
      '')                                            as unblocks,
    'CARDED'::text                                   as card_state,
    -- Ranking: a deployment blocker hides every room, so it outranks a
    -- credential, which in turn outranks a reading task.
    case c.blocker_type
      when 'EXTERNAL_AUTHORIZATION'          then 10
      when 'EXTERNAL_PROVIDER_AUTHORITY'     then 20
      when 'CHAIRMAN_AUTHORITY_DECISION'     then 30
      else 40
    end                                              as rank_base,
    c.created_at
  from public.chairman_action_cards c
  where c.status = 'OPEN'
),

uncarded_providers as (
  select
    'UNCARDED-PROVIDER-' || p.provider_code          as action_code,
    'PROVIDER CREDENTIAL'::text                      as lane,
    coalesce(p.chairman_action_label, 'Connect ' || p.display_name) as title,
    coalesce(p.failure_reason,
      p.display_name || ' is registered and enabled but not authenticated.') as what_to_do,
    p.chairman_console_url                           as click_here,
    jsonb_build_array(
      'Sign in to ' || p.display_name || '.',
      'Create an API credential.',
      'Store it in the THYLORA backend under the exact name ' || p.expected_secret_name || '.'
    )                                                as steps,
    'Provider state is ' || p.configured_state ||
      '. A credential can only be created by the account holder.'            as why_it_needs_you,
    'thylora_provider_registry.' || p.provider_code ||
      ' reaches configured_state = CONNECTED with a live last_http_status.'  as done_when,
    false                                            as money_required,
    '0.00 USD to connect'::text                      as spend_on_this_step,
    'calls to ' || p.display_name                    as unblocks,
    'NO_CARD_YET'::text                              as card_state,
    25                                               as rank_base,
    p.updated_at                                     as created_at
  from public.thylora_provider_registry p
  where p.chairman_action_required
    and p.configured_state <> 'CONNECTED'
    and not exists (
      select 1 from public.chairman_action_cards c
       where c.status = 'OPEN'
         and (c.evidence->>'provider_code' = p.provider_code
              or c.action_code ilike '%' || p.provider_code || '%')
    )
),

uncarded_costs as (
  select
    'UNCARDED-COST-' || s.service_code               as action_code,
    'MONEY OUT UNPRICED'::text                       as lane,
    'Price ' || s.service_name                       as title,
    s.service_name || ' is registered as ' || s.billing_state ||
      ' with no monthly figure, so it cannot be counted in burn rate.'       as what_to_do,
    null::text                                       as click_here,
    jsonb_build_array(
      'Open the provider billing page for ' || s.service_name || '.',
      'Read the plan and the recurring amount.',
      'Lodge it against ' || s.service_code || ' in the dashboard Money room.'
    )                                                as steps,
    'A provider billing page can only be read by the account holder, and THYLORA will not project a price it has not seen.' as why_it_needs_you,
    'service_cost_registry.' || s.service_code || ' has a non-null estimated_monthly.' as done_when,
    false                                            as money_required,
    '0.00 USD to read a bill'::text                  as spend_on_this_step,
    'burn rate, runway and break-even calculation'::text as unblocks,
    'NO_CARD_YET'::text                              as card_state,
    35                                               as rank_base,
    s.updated_at                                     as created_at
  from public.service_cost_registry s
  where s.estimated_monthly is null
    and s.billing_state in ('ACTIVE_UNPRICED','UNKNOWN','QUOTE_REQUIRED')
    and not exists (
      select 1 from public.chairman_action_cards c
       where c.status = 'OPEN'
         and c.source_record ilike '%' || s.service_code || '%'
    )
    -- DEPENDENCY: withhold while the provider itself is still unconnected.
    -- There is no bill to read for a provider that has never been called.
    -- Asking the Chairman to read a Runway invoice before the Runway key
    -- exists is a gap he cannot close, which is the opposite of "minimum gaps".
    and not exists (
      select 1 from public.thylora_provider_registry p
       where p.provider_code = s.provider_code
         and p.configured_state <> 'CONNECTED'
    )
),

merged as (
  select * from carded
  union all select * from uncarded_providers
  union all select * from uncarded_costs
)
select
  row_number() over (order by m.rank_base, m.created_at)::integer as rank,
  m.action_code, m.lane, m.title, m.what_to_do, m.click_here, m.steps,
  m.why_it_needs_you, m.done_when, m.money_required, m.spend_on_this_step,
  m.unblocks, m.card_state
from merged m
order by rank;
$fn$;

comment on function public.thylora_chairman_action_queue_v1() is
  'The Chairman prompt: every gate currently blocked on VYC, ranked, with the exact click target. Derived live from chairman_action_cards (authoritative), thylora_provider_registry and service_cost_registry. A blocker with no card still appears, flagged NO_CARD_YET, so nothing silently disappears.';


-- ===========================================================================
-- thylora_chairman_action_queue_withheld_v1()
-- The rows the queue is holding back, and why. DEFERRED_WITH_REASON, never
-- dropped: the Chairman can see what is waiting on something else.
-- ===========================================================================

create or replace function public.thylora_chairman_action_queue_withheld_v1()
returns table (
  action_code       text,
  title             text,
  withheld_reason   text,
  released_when     text
)
language sql
stable
as $fn$
  select
    'UNCARDED-COST-' || s.service_code,
    'Price ' || s.service_name,
    'DEFERRED_WITH_REASON: provider ' || s.provider_code || ' is ' ||
      p.configured_state || '. There is no bill to read for a provider that has never been called.',
    'Released into the queue when thylora_provider_registry.' || s.provider_code ||
      ' reaches CONNECTED.'
  from public.service_cost_registry s
  join public.thylora_provider_registry p on p.provider_code = s.provider_code
  where s.estimated_monthly is null
    and s.billing_state in ('ACTIVE_UNPRICED','UNKNOWN','QUOTE_REQUIRED')
    and p.configured_state <> 'CONNECTED';
$fn$;
