-- THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533
-- Market content. ZERO quote rows are written: there is no evidenced in-world trade
-- and no synthetic price is inserted to make the table look populated.
-- Companies are the EdereAirah businesses that already exist in public.businesses.

insert into public.thylora_world_market_regulations
  (regulation_code, canonical_name, scope, rule_text, enforcement_state, status, source_query_id)
values
 ('MKT-REG-QUOTE-TRUTH','Quote truth rule','All venues and all instruments',
  'A price may only be recorded with source_type IN_WORLD_TRADE, CHAIRMAN_SUPPLIED or EARTH_REFERENCE when it is evidenced. Anything generated for testing or demonstration must carry source_type TEST or SIMULATION and evidence_state TEST or SIMULATION. A synthetic price may never be displayed as a market price.',
  'ENFORCED_BY_CHECK_CONSTRAINT','ACTIVE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-REG-NO-EARTH-CLAIM','No Earth market claim','All venues, instruments and companies',
  'No EdereAirah venue, instrument, company or regulator may be presented as an Earth exchange, an Earth-listed security, an Earth regulator or an Earth-registered company. earth_regulator_claim is constrained false.',
  'ENFORCED_BY_CHECK_CONSTRAINT','ACTIVE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-REG-ADMISSION','Admission to a venue','All venues',
  'A company reaches a public listing only through an admission decision recorded against a venue. A PRIVATE company has no venue and no quote. Admission rules per venue are OPEN.',
  'OPEN','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-REG-DISCLOSURE','Disclosure obligation','Public companies',
  'A PUBLIC company carries a disclosure obligation. Periodic results, ownership changes and material events are filed through thylora_world_market_disclosures. Nothing is treated as published until published_state says so.',
  'OPEN','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-REG-HOURS','Market hours follow world time','All venues',
  'Session boundaries are expressed in EdereAirah world time. Native calendar units, month names, season names and year numbering are unresolved, so no absolute clock time and no Earth clock mapping may be written.',
  'ENFORCED_BY_DEFAULTS','STRUCTURE_OPEN','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-REG-SETTLEMENT','Settlement instrument','All venues',
  'Settlement is in a registered instrument from financial_instrument_registry. REE is the only ACTIVE instrument. RRE and PEETE DOLUP are NOT_ISSUED and may not settle a trade.',
  'ACTIVE','ACTIVE','THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (regulation_code) do nothing;

insert into public.thylora_world_market_venues
  (venue_id, canonical_name, venue_class, settlement_instrument, regulation_code, status, provenance, source_query_id)
values
 ('MKT-V-EXCHANGE','EdereAirah public exchange (class spine)','EXCHANGE','REE','MKT-REG-ADMISSION','STRUCTURE_OPEN',
  jsonb_build_object('note','Venue name, operating authority and admission rule are OPEN. No listing exists.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-V-OTC','Over-the-counter dealing (class spine)','OVER_THE_COUNTER','REE','MKT-REG-QUOTE-TRUTH','STRUCTURE_OPEN',
  jsonb_build_object('note','Bilateral dealing outside a venue. No dealer is named.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-V-COMMODITY','Commodity market (class spine)','COMMODITY_MARKET','REE','MKT-REG-QUOTE-TRUTH','STRUCTURE_OPEN',
  jsonb_build_object('note','Where estate produce and bulk goods would price. No commodity is listed.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-V-PRIVATE','Private placement (class spine)','PRIVATE_PLACEMENT','REE','MKT-REG-DISCLOSURE','STRUCTURE_OPEN',
  jsonb_build_object('note','Where a private company raises without admission to the exchange.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-V-ESTATE','Estate market (class spine)','ESTATE_MARKET','REE','MKT-REG-SETTLEMENT','STRUCTURE_OPEN',
  jsonb_build_object('note','The market day the estate Provisioner buys on. EST-PROVISIONING-001 records the market calendar as unknown.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (venue_id) do nothing;

insert into public.thylora_world_market_sessions
  (session_code, venue_id, session_name, session_order, source_query_id)
values
 ('MKT-S-EXCHANGE-OPEN','MKT-V-EXCHANGE','OPEN_AUCTION',1,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-S-EXCHANGE-CONT','MKT-V-EXCHANGE','CONTINUOUS',2,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-S-EXCHANGE-CLOSE','MKT-V-EXCHANGE','CLOSE',3,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-S-EXCHANGE-SETTLE','MKT-V-EXCHANGE','SETTLEMENT',4,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-S-COMMODITY-CONT','MKT-V-COMMODITY','CONTINUOUS',1,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'),
 ('MKT-S-ESTATE-MARKET-DAY','MKT-V-ESTATE','CONTINUOUS',1,'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533')
on conflict (session_code) do nothing;

-- Register the EdereAirah businesses that already exist as PRIVATE companies.
-- The Earth reference business is deliberately excluded.
insert into public.thylora_world_market_companies
  (company_id, business_id, canonical_name, listing_class, reality_layer, incorporation_state,
   disclosure_obligation, regulation_code, status, provenance, source_query_id)
select
  'MKT-CO-' || b.business_code,
  b.id,
  b.business_name,
  'PRIVATE',
  'EDEREAIRAH',
  'OPEN',
  'NONE_WHILE_PRIVATE',
  'MKT-REG-ADMISSION',
  'REGISTERED_PRIVATE_NO_LISTING',
  jsonb_build_object(
    'source','public.businesses',
    'business_code', b.business_code,
    'business_type', b.business_type,
    'business_state', b.business_state,
    'note','Registered as a private company from an existing canon business. No share capital, no shares in issue, no listing and no quote are asserted.'),
  'THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533'
from public.businesses b
where b.world_layer = 'EDEREAIRAH'
on conflict (company_id) do nothing;
