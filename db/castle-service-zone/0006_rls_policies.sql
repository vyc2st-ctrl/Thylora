-- CASTLE SERVICE ZONE · 0006 · Row level security
-- Workroom: WR-CASTLE-SERVICE-ZONE-576
--
-- Reading is not authoring. Anonymous readers get the public-safe projection only.
-- Signed-in readers get the service-zone record without security-sensitive rows.
-- Writing intake, projecting into canon and recording Chairman decisions are
-- service-role actions.

begin;

do $$
declare t text;
begin
  foreach t in array array[
    'thy_csz_serial','thy_csz_space_intake','thy_csz_adjacency_intake',
    'thy_csz_flow','thy_csz_flow_step','thy_csz_herb_state',
    'thy_csz_role_slot','thy_csz_object_home','thy_csz_wardrobe',
    'thy_csz_residence_option','thy_csz_relief_matrix',
    'thy_csz_brand_mark','thy_csz_qyris','thy_csz_conflict',
    'thy_csz_unknown','thy_csz_chairman_decision','thy_csz_restart_point'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- Public-safe read, anonymous. Only rows the row itself declares publishable.
do $$ begin
  create policy thy_csz_space_public_read on thy_csz_space_intake
    for select to anon using (public_safe);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_flow_public_read on thy_csz_flow
    for select to anon using (public_safe);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_object_public_read on thy_csz_object_home
    for select to anon using (public_safe);
exception when duplicate_object then null; end $$;

-- Adjacency is topology. It is never anonymous-readable, at any access class.
-- (No anon policy is created for thy_csz_adjacency_intake. That omission is the rule.)

-- Signed-in service read: everything except restricted and secure classes.
do $$ begin
  create policy thy_csz_space_service_read on thy_csz_space_intake
    for select to authenticated using (access_class not in ('RESTRICTED_SERVICE','SECURE'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_adjacency_service_read on thy_csz_adjacency_intake
    for select to authenticated using (access_class not in ('RESTRICTED_SERVICE','SECURE'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_flow_service_read on thy_csz_flow
    for select to authenticated using (access_class not in ('RESTRICTED_SERVICE','SECURE'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_object_service_read on thy_csz_object_home
    for select to authenticated using (access_class not in ('RESTRICTED_SERVICE','SECURE'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_wardrobe_service_read on thy_csz_wardrobe
    for select to authenticated using (access_class not in ('RESTRICTED_SERVICE','SECURE'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy thy_csz_qyris_read on thy_csz_qyris
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- No insert, update or delete policy exists for any role below service_role.
-- Absence of a write policy is the write ban; it is deliberate and load-bearing.

revoke all on thy_csz_space_intake, thy_csz_adjacency_intake, thy_csz_flow,
  thy_csz_flow_step, thy_csz_herb_state, thy_csz_object_home, thy_csz_wardrobe,
  thy_csz_residence_option, thy_csz_relief_matrix, thy_csz_brand_mark,
  thy_csz_chairman_decision, thy_csz_restart_point
  from anon, authenticated;

grant select on thy_csz_space_intake, thy_csz_flow, thy_csz_object_home to anon, authenticated;
grant select on thy_csz_adjacency_intake, thy_csz_flow_step, thy_csz_herb_state,
  thy_csz_wardrobe, thy_csz_residence_option, thy_csz_relief_matrix, thy_csz_qyris
  to authenticated;
grant select on thy_csz_public_world_sheet to anon, authenticated;

commit;
