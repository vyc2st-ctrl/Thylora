-- THYLORA WORLD · 0010 · Guarded links into existing THYLORA registries
-- Workroom: WR-WORLD-CASTLE-001
--
-- The live schema could not be inspected from the authoring session (network
-- egress to the backend host is denied by policy), so nothing here hard-links to
-- a table whose shape is unverified. Every link is created only if its target
-- actually exists, using to_regclass, exactly as db/rae-link/0010 does.

begin;

-- Link the castle lane to its workroom row, if the workroom registry exists.
do $$ begin
  if to_regclass('public.thylora_workrooms') is not null
     and to_regclass('public.thyw_world_frames') is not null then
    execute $ddl$
      create table if not exists thyw_workroom_links (
        link_id       uuid primary key default gen_random_uuid(),
        frame_id      text not null references thyw_world_frames(frame_id),
        workroom_ref  text not null,
        relation      text not null default 'SURVEYED_BY',
        created_at    timestamptz not null default now(),
        unique (frame_id, workroom_ref, relation)
      )
    $ddl$;
  end if;
end $$;

-- The castle is a place in a world that already has a business-factory record
-- shape. Link softly, by reference, never by blind foreign key.
do $$ begin
  if to_regclass('public.thyw_world_frames') is not null then
    execute $ddl$
      create table if not exists thyw_external_refs (
        ref_id        uuid primary key default gen_random_uuid(),
        object_kind   text not null,
        object_id     text not null,
        target_registry text not null,
        target_ref    text not null,
        relation      text not null,
        verified      boolean not null default false,
        note          text,
        created_at    timestamptz not null default now(),
        unique (object_kind, object_id, target_registry, target_ref, relation)
      )
    $ddl$;
    execute $c$
      comment on table thyw_external_refs is
        'Soft references out of the world survey into other THYLORA registries. verified = false means the target table shape was never inspected from the authoring session.'
    $c$;
  end if;
end $$;

-- 0008 runs before this file, so the tables created above would otherwise be
-- left without row level security. They carry the same posture as every other
-- thyw_* table: signed-in members read, no client role writes.
do $$
declare t text;
begin
  foreach t in array array['thyw_workroom_links','thyw_external_refs'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', t || '_read', t);
      execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_read', t);
      execute format('revoke insert, update, delete on public.%I from authenticated', t);
      execute format('revoke insert, update, delete on public.%I from anon', t);
      execute format('revoke select on public.%I from anon', t);
      execute format('grant select on public.%I to authenticated', t);
    end if;
  end loop;
end $$;

commit;
