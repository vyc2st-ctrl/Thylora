update thylora_person_identity set canonical_name='Victoria Ashley Peete', name_normalized='victoria-ashley-peete', note=coalesce(note,'')||' | 647: Chairman corrected Asley→Ashley; person_key kept.', updated_at=now() where person_key='victoria-asley-peete' and canonical_name='Victoria Asley Peete';
update businesses set business_name='ErsatzReality Enterprise presents C & W Auto and Custym', updated_at=now() where business_code='CW-AUTO-CUSTOMS-001';
update thylora_world_market_companies set canonical_name='ErsatzReality Enterprise presents C & W Auto and Custym', updated_at=now() where company_id='MKT-CO-CW-AUTO-CUSTOMS-001';
insert into thylora_name_lock_changes(run_code,target_table,target_column,column_kind,rows_changed,disposition,note,executed_at) values
('THY-NAME-647-VICTORIA-ASHLEY','thylora_person_identity','canonical_name','canonical',1,'CORRECTED_BY_CHAIRMAN','Victoria Asley Peete → Victoria Ashley Peete (custody 647)',now()),
('THY-NAME-647-CW-CUSTYM','businesses','business_name','canonical',1,'CORRECTED_BY_CHAIRMAN','C&W Auto & Customs → C & W Auto and Custym (custody 647); code kept',now());
