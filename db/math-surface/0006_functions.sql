-- THYLORA MATHEMATICS SURFACE · 0006 · Functions
-- Workroom: WR-MATH-SURFACE-001
--
-- These are the backend twins of math-surface/lib/understanding.js. Both compute
-- the same product and refuse the same claims, so a card shown on the surface
-- equals the card stored in the backend. Where the two could differ, the SQL is
-- the stricter of the two.

begin;

-- ---------------------------------------------------------------------------
-- P_solve, with honest nulls.
--
--   any factor measured 0        -> 0        (arithmetic settles it)
--   any factor null, none zero   -> null     (unknown; do not invent a number)
--   all three measured           -> product
-- ---------------------------------------------------------------------------

create or replace function thy_math_p_solve(p_l numeric, p_m numeric, p_s numeric)
returns numeric language sql immutable as $$
  select case
    when p_l = 0 or p_m = 0 or p_s = 0 then 0
    when p_l is null or p_m is null or p_s is null then null
    else p_l * p_m * p_s
  end;
$$;

comment on function thy_math_p_solve is
  'P_solve = L × M × S. A measured zero determines the product; an unmeasured factor leaves it null. Null is never coalesced to zero.';

-- The upper bound while factors are missing: an unknown factor lies in [0,1],
-- so the product lies in [0, product of the known factors].
create or replace function thy_math_p_solve_upper(p_l numeric, p_m numeric, p_s numeric)
returns numeric language sql immutable as $$
  select case
    when p_l = 0 or p_m = 0 or p_s = 0 then 0
    else coalesce(p_l, 1) * coalesce(p_m, 1) * coalesce(p_s, 1)
  end;
$$;

-- ---------------------------------------------------------------------------
-- The guard. This is the hard rule as a callable function.
-- ---------------------------------------------------------------------------

create or replace function thy_math_claim_supported(
  p_claim            thy_math_claim,
  p_layer_l          numeric,
  p_layer_m          numeric,
  p_layer_s          numeric,
  p_l_isolated       boolean,
  p_m_isolated       boolean,
  p_s_isolated       boolean,
  p_threshold        numeric default 0.6
) returns table (permitted boolean, because text)
language plpgsql immutable as $$
declare
  v_value    numeric;
  v_isolated boolean;
  v_name     text;
begin
  if p_claim = 'CANNOT_SOLVE_AS_PRESENTED' then
    if thy_math_p_solve(p_layer_l, p_layer_m, p_layer_s) = 0 then
      return query select true,
        'P_solve is 0 because a measured layer is 0. This says the problem cannot be solved as written. It says nothing about the other layers.'::text;
    else
      return query select false, 'P_solve is not a determined zero.'::text;
    end if;
    return;
  end if;

  if p_claim = 'LANGUAGE_DEFICIT' then
    v_value := p_layer_l; v_isolated := p_l_isolated; v_name := 'Language';
  elsif p_claim = 'MATH_DEFICIT' then
    v_value := p_layer_m; v_isolated := p_m_isolated; v_name := 'Mathematical relationship';
  else
    v_value := p_layer_s; v_isolated := p_s_isolated; v_name := 'Solve procedure';
  end if;

  if not coalesce(v_isolated, false) then
    return query select false,
      (v_name || ' was not measured in isolation. An unmeasured layer is not a low layer, and a mixed task cannot tell the layers apart.')::text;
    return;
  end if;

  if v_value is null then
    return query select false, (v_name || ' has no value.')::text;
    return;
  end if;

  if v_value >= p_threshold then
    return query select false, (v_name || ' measured at or above the reporting threshold.')::text;
    return;
  end if;

  return query select true, (v_name || ' measured below the reporting threshold on an isolated probe.')::text;
end;
$$;

comment on function thy_math_claim_supported is
  'THY-MATH-LMS-001: a claim about a layer requires an isolated measurement of that layer. L = 0 grants no claim about M or S.';

-- ---------------------------------------------------------------------------
-- Read a sitting: the three factors, the product, the binding layer and the
-- claims the evidence refuses.
-- ---------------------------------------------------------------------------

create or replace function thy_math_read_sitting(p_sitting_id uuid)
returns table (
  layer_l numeric, layer_m numeric, layer_s numeric,
  l_isolated boolean, m_isolated boolean, s_isolated boolean,
  p_solve numeric, p_solve_upper numeric, determined boolean,
  not_measured text[], refused_claims thy_math_claim[], headline text
) language plpgsql stable security definer set search_path = public as $$
declare
  v_l numeric; v_m numeric; v_s numeric;
  v_li boolean; v_mi boolean; v_si boolean;
  v_not_measured text[] := '{}';
  v_refused thy_math_claim[] := '{}';
  v_claim thy_math_claim;
  v_ok boolean; v_why text;
begin
  select f.value, f.evidence = 'OBSERVED' into v_l, v_li
    from thy_math_layer_factors f where f.sitting_id = p_sitting_id and f.layer = 'L';
  select f.value, f.evidence = 'OBSERVED' into v_m, v_mi
    from thy_math_layer_factors f where f.sitting_id = p_sitting_id and f.layer = 'M';
  select f.value, f.evidence = 'OBSERVED' into v_s, v_si
    from thy_math_layer_factors f where f.sitting_id = p_sitting_id and f.layer = 'S';

  v_li := coalesce(v_li, false);
  v_mi := coalesce(v_mi, false);
  v_si := coalesce(v_si, false);

  if not v_li then v_not_measured := v_not_measured || 'L'; end if;
  if not v_mi then v_not_measured := v_not_measured || 'M'; end if;
  if not v_si then v_not_measured := v_not_measured || 'S'; end if;

  foreach v_claim in array array['LANGUAGE_DEFICIT','MATH_DEFICIT','PROCEDURE_DEFICIT','CANNOT_SOLVE_AS_PRESENTED']::thy_math_claim[]
  loop
    select c.permitted, c.because into v_ok, v_why
      from thy_math_claim_supported(v_claim, v_l, v_m, v_s, v_li, v_mi, v_si) c;
    if not v_ok then v_refused := v_refused || v_claim; end if;
  end loop;

  return query select
    v_l, v_m, v_s, v_li, v_mi, v_si,
    thy_math_p_solve(v_l, v_m, v_s),
    thy_math_p_solve_upper(v_l, v_m, v_s),
    thy_math_p_solve(v_l, v_m, v_s) is not null,
    v_not_measured,
    v_refused,
    case
      when v_l = 0 and not v_mi then
        'The sentence did not come through. P_solve is 0 because the language factor is 0. The mathematics has not been measured and must not be guessed from this.'
      when thy_math_p_solve(v_l, v_m, v_s) is null then
        'Not enough isolated evidence to state P_solve.'
      else 'P_solve = ' || thy_math_p_solve(v_l, v_m, v_s)::text
    end::text;
end;
$$;

-- ---------------------------------------------------------------------------
-- The gate a card must clear before it is written.
-- ---------------------------------------------------------------------------

create or replace function thy_math_card_gate(p_card jsonb)
returns table (blocker text, detail text) language sql immutable as $$
  select * from (values
    ('NOT_MEASURED_MISSING',       'A card must list every layer it did not measure in isolation.'),
    ('NOT_MEASURED_STATEMENT',     'A card must state in plain words what was not measured.'),
    ('UNDETERMINED_WITH_VALUE',    'An undetermined P_solve may not carry a value.'),
    ('MATH_CLAIM_WITHOUT_M',       'A mathematics claim requires an isolated measurement of the relationship layer.')
  ) as g(blocker, detail)
  where case g.blocker
    when 'NOT_MEASURED_MISSING'    then not (p_card ? 'not_measured')
    when 'NOT_MEASURED_STATEMENT'  then coalesce(trim(p_card->>'not_measured_statement'), '') = ''
    when 'UNDETERMINED_WITH_VALUE' then (p_card->>'p_solve_determined')::boolean is not true
                                        and (p_card->>'p_solve_value') is not null
    when 'MATH_CLAIM_WITHOUT_M'    then (p_card->'claims_made') ? 'MATH_DEFICIT'
                                        and (p_card->>'layer_m_isolated')::boolean is not true
  end;
$$;

comment on function thy_math_card_gate is
  'Returns every reason a card may not be written, all at once, each naming what would fix it.';

commit;
