-- THYLORA product conveyor — live read model.
--
-- Additive and read-only. Creates no tables and mutates no existing row. Every
-- value below is derived from evidence already recorded in the backend; where
-- evidence is absent the gate reads false rather than being assumed.
--
-- Ladder (see pipeline/stages.mjs for the executable copy of the same rules):
--   IDEA -> PRODUCT_CANDIDATE -> PRODUCT_SPEC -> RIGHTS_SAFETY_GATE
--        -> ARTIFACT -> PRICE_COST -> STORE_LISTING -> RELEASE_GATE -> PUBLISHED

-- ---------------------------------------------------------------------------
-- 1. Unified candidate set with gate evidence, one row per source record.
-- ---------------------------------------------------------------------------
create or replace view thylora_conveyor_candidates as

-- Richest evidence: products already tracked against a storefront listing.
select
  r.external_product_id                       as canonical_id,
  'thylora_store_product_readiness'           as source_table,
  1                                           as source_priority,
  r.product_title                             as title,
  null::text                                  as parent_source,
  'store_tracked'                             as product_type,
  null::text                                  as department_owner,
  coalesce(r.sell_intent, false)              as sellable_intent,
  coalesce(r.sell_intent, false)              as spec_complete,
  coalesce(r.rights_passed, false)            as rights_passed,
  -- The readiness table folds safety review into its rights pass; it is not
  -- separately evidenced there, so it is reported as the same fact, not a
  -- second independent one.
  coalesce(r.rights_passed, false)            as safety_reviewed,
  coalesce(r.source_complete, false)          as source_complete,
  coalesce(r.final_artifact_complete, false)  as final_artifact_complete,
  coalesce(r.product_specific_visual_complete, false) as product_specific_visual_complete,
  coalesce(r.visual_preflight_passed, false)  as visual_preflight_passed,
  (r.product_state is not null)               as store_listing_exists,
  coalesce(r.delivery_connected, false)       as delivery_connected,
  coalesce(r.reaccess_verified, false)        as reaccess_verified,
  coalesce(r.checkout_path_verified, false)   as checkout_path_verified,
  coalesce(r.mobile_preview_passed, false)    as mobile_preview_passed,
  (r.product_state = 'ACTIVE')                as listing_active,
  false                                       as price_configured,
  false                                       as cost_recorded,
  false                                       as external_purchase_witnessed,
  r.product_state                             as store_state,
  r.next_executable_work                      as next_action,
  r.blockers                                  as recorded_blockers,
  r.updated_at
from thylora_store_product_readiness r

union all

-- Catalogue products: price and rights state live here.
select
  p.product_id,
  'products',
  2,
  p.title,
  null::text,
  p.product_type,
  null::text,
  true,
  (p.description is not null and length(btrim(p.description)) > 0),
  (p.rights_state = 'cleared'),
  (p.age_guidance is not null and length(btrim(p.age_guidance)) > 0),
  (p.release_evidence_state in ('partial','verified')),
  (p.release_evidence_state = 'verified'),
  (p.image_state is not null and p.image_state <> 'missing'),
  false,
  (p.availability is not null and p.availability <> 'not_available'),
  (p.delivery_method is not null and p.delivery_method not ilike '%planned%'),
  false,
  false,
  false,
  (p.availability = 'available'),
  (p.price_state = 'configured' and p.price is not null),
  false,
  false,
  p.availability,
  null::text,
  null::jsonb,
  p.updated_at
from products p

union all

-- Realization registry: the design/engineering spine for physical and hybrid goods.
select
  x.realization_code,
  'thylora_product_realization_registry',
  3,
  x.product_title,
  x.source_idea_id,
  x.product_kind,
  null::text,
  true,
  (x.problem_solved is not null and x.completion_definition is not null),
  (x.rights is not null and x.rights <> '{}'::jsonb),
  (x.safety is not null and x.safety <> '{}'::jsonb),
  (x.evidence is not null and x.evidence <> '{}'::jsonb),
  (x.completion_evidence is not null and x.completion_evidence <> '{}'::jsonb),
  false,
  false,
  (x.store_listing is not null and x.store_listing <> '{}'::jsonb),
  false,
  false,
  false,
  false,
  false,
  (x.pricing is not null and x.pricing <> '{}'::jsonb),
  (x.cost is not null and x.cost <> '{}'::jsonb),
  false,
  x.realization_state,
  x.next_executable_work,
  x.blockers,
  x.updated_at
from thylora_product_realization_registry x
where coalesce(x.supersession_state, '') <> 'SUPERSEDED'

union all

-- Commercial registry: customer/problem/deliverable framing for services.
select
  c.product_code,
  'thylora_commercial_product_registry',
  4,
  c.product_name,
  null::text,
  c.product_family,
  null::text,
  true,
  (c.customer is not null and c.problem is not null and c.deliverable is not null),
  false,
  false,
  (c.evidence is not null and c.evidence <> '{}'::jsonb),
  false,
  false,
  false,
  (c.store_state is not null and c.store_state <> 'NOT_LISTED'),
  false,
  false,
  false,
  false,
  false,
  (c.pricing is not null and c.pricing <> '{}'::jsonb),
  (c.unit_economics is not null and c.unit_economics <> '{}'::jsonb),
  false,
  c.store_state,
  c.next_action,
  c.blockers,
  c.updated_at
from thylora_commercial_product_registry c

union all

-- Ideas that are explicitly product-bearing. An idea with no product link is
-- not a conveyor candidate; it is still just an idea.
select
  i.idea_id,
  'idea_registry',
  5,
  i.title,
  i.origin_record,
  'idea',
  i.department_owner,
  true,
  false, false, false, false, false, false, false, false,
  false, false, false, false, false, false, false, false,
  null::text,
  i.next_action,
  null::jsonb,
  i.updated_at
from idea_registry i
where array_length(i.connected_products, 1) > 0
   or i.state in ('REQUIREMENTS_DEFINED','IMPLEMENTATION_ACTIVE','DESIGN_ACTIVE');

comment on view thylora_conveyor_candidates is
  'Unified product-conveyor candidate set across every registry that can hold a sellable thing. Read-only; gates are evidence-derived and default to false.';

-- ---------------------------------------------------------------------------
-- 2. Stage, exact blocker and money-distance.
-- ---------------------------------------------------------------------------
create or replace view thylora_conveyor as
with gated as (
  select
    c.*,
    -- Ordered gate list. The first false is the exact blocker.
    array_remove(array[
      case when not c.spec_complete then 'spec_complete' end,
      case when not c.rights_passed then 'rights_passed' end,
      case when not c.safety_reviewed then 'safety_reviewed' end,
      case when not c.source_complete then 'source_complete' end,
      case when not c.final_artifact_complete then 'final_artifact_complete' end,
      case when not c.product_specific_visual_complete then 'product_specific_visual_complete' end,
      case when not c.visual_preflight_passed then 'visual_preflight_passed' end,
      case when not c.price_configured then 'price_configured' end,
      case when not c.cost_recorded then 'cost_recorded' end,
      case when not c.store_listing_exists then 'store_listing_exists' end,
      case when not c.delivery_connected then 'delivery_connected' end,
      case when not c.reaccess_verified then 'reaccess_verified' end,
      case when not c.checkout_path_verified then 'checkout_path_verified' end,
      case when not c.mobile_preview_passed then 'mobile_preview_passed' end,
      case when not c.listing_active then 'listing_active' end,
      case when not c.external_purchase_witnessed then 'external_purchase_witnessed' end
    ], null) as unmet_gates
  from thylora_conveyor_candidates c
)
select
  g.canonical_id,
  g.source_table,
  g.parent_source,
  g.title,
  g.product_type,
  g.department_owner,

  case
    when not g.sellable_intent then 'IDEA'
    when not g.spec_complete then 'PRODUCT_CANDIDATE'
    when not (g.rights_passed and g.safety_reviewed) then 'PRODUCT_SPEC'
    when not (g.source_complete and g.final_artifact_complete) then 'RIGHTS_SAFETY_GATE'
    when not (g.price_configured and g.cost_recorded) then 'ARTIFACT'
    when not (g.store_listing_exists and g.product_specific_visual_complete and g.visual_preflight_passed) then 'PRICE_COST'
    when not (g.delivery_connected and g.reaccess_verified and g.checkout_path_verified and g.mobile_preview_passed) then 'STORE_LISTING'
    when not (g.listing_active and g.external_purchase_witnessed) then 'RELEASE_GATE'
    else 'PUBLISHED'
  end as stage,

  g.unmet_gates[1] as exact_blocker,

  case g.unmet_gates[1]
    when 'spec_complete' then 'EXECUTABLE'
    when 'safety_reviewed' then 'EXECUTABLE'
    when 'source_complete' then 'EXECUTABLE'
    when 'final_artifact_complete' then 'EXECUTABLE'
    when 'product_specific_visual_complete' then 'EXECUTABLE'
    when 'visual_preflight_passed' then 'EXECUTABLE'
    when 'cost_recorded' then 'EXECUTABLE'
    when 'store_listing_exists' then 'EXECUTABLE'
    when 'rights_passed' then 'CHAIRMAN_OR_LEGAL'
    when 'price_configured' then 'CHAIRMAN_GATE'
    when 'listing_active' then 'CHAIRMAN_GATE'
    when 'delivery_connected' then 'CREDENTIALED'
    when 'reaccess_verified' then 'CREDENTIALED'
    when 'checkout_path_verified' then 'CREDENTIALED'
    when 'mobile_preview_passed' then 'PHYSICAL_DEVICE'
    when 'external_purchase_witnessed' then 'EXTERNAL_CUSTOMER'
    else null
  end as blocker_class,

  g.next_action as next_executable_action,
  coalesce(array_length(g.unmet_gates, 1), 0) as actions_remaining_to_store,
  coalesce(array_length(g.unmet_gates, 1), 0) as money_distance,

  case
    when coalesce(array_length(g.unmet_gates, 1), 0) = 0 then 'PURCHASABLE_WITNESSED'
    when array_length(g.unmet_gates, 1) = 1 then 'ONE_ACTION_FROM_MONEY'
    when array_length(g.unmet_gates, 1) <= 3 then 'NEAR_MONEY'
    when array_length(g.unmet_gates, 1) <= 7 then 'MID_DISTANCE'
    else 'FAR_FROM_MONEY'
  end as money_band,

  case when g.rights_passed then 'PASSED' else 'UNVERIFIED' end as rights_state,
  case when g.price_configured then 'CONFIGURED' else 'PENDING' end as price_state,
  coalesce(g.store_state, 'NOT_LISTED') as store_state,
  g.unmet_gates,
  g.recorded_blockers,
  g.source_priority,
  g.updated_at
from gated g;

comment on view thylora_conveyor is
  'Product conveyor read model: exact stage, exact blocker, blocker class, actions remaining and money-distance for every candidate.';

-- ---------------------------------------------------------------------------
-- 3. Leverage — one gate that releases many products.
-- ---------------------------------------------------------------------------
create or replace view thylora_conveyor_leverage as
select
  exact_blocker as gate,
  blocker_class,
  count(*) as unblocks_count,
  array_agg(canonical_id order by money_distance, canonical_id) as unblocks
from thylora_conveyor
where exact_blocker is not null
group by exact_blocker, blocker_class
having count(*) > 1
order by count(*) desc;

comment on view thylora_conveyor_leverage is
  'Gates shared by more than one candidate, ranked by how many products clearing the gate once would release.';

-- ---------------------------------------------------------------------------
-- 4. Lanes — enforcement of BLOCK(P1) != STOP(P2..Pn).
-- ---------------------------------------------------------------------------
create or replace view thylora_conveyor_lanes as
select
  canonical_id,
  title,
  stage,
  exact_blocker,
  blocker_class,
  money_distance,
  next_executable_action,
  case when blocker_class = 'EXECUTABLE' then 'MOVABLE' else 'HELD' end as lane_state,
  case
    when blocker_class = 'EXECUTABLE'
    then row_number() over (
      partition by (blocker_class = 'EXECUTABLE')
      order by money_distance, canonical_id
    )
  end as lane_rank
from thylora_conveyor
where stage <> 'PUBLISHED';

comment on view thylora_conveyor_lanes is
  'Lane assignment. A held candidate never consumes a lane; the next movable candidate takes its place.';

-- ---------------------------------------------------------------------------
-- 5. Provider bridge (added after the first pass reported a blocker that was
--    an artifact of missing evidence rather than a real gate).
--    Applied as migrations: conveyor_provider_readback_bridge,
--    conveyor_unit_cost_evidence, conveyor_use_provider_readback.
--    See db/pipeline/0002_provider_bridge.sql.
-- ---------------------------------------------------------------------------
