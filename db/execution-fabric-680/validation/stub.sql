-- Minimal local stand-in for the live table (columns the fabric DDL touches). Local only.
create table thylora_execution_work_registry (
  work_code text primary key, phase text, work_item text not null, who text, state text,
  evidence jsonb, updated_at timestamptz default now()
);
insert into thylora_execution_work_registry(work_code,phase,work_item,state)
values ('LEGACY-1','X','already-written row with an ACTIVE label','EXECUTION_ACTIVE');
