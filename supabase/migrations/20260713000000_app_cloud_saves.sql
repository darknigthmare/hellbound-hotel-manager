begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.app_cloud_saves (
  user_id uuid not null references auth.users (id) on delete cascade,
  app_key text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint app_cloud_saves_pkey primary key (user_id, app_key),
  constraint app_cloud_saves_app_key_format check (app_key ~ '^[a-z0-9_]{1,120}$'),
  constraint app_cloud_saves_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint app_cloud_saves_payload_size check (octet_length(payload::text) <= 2097152)
);

-- Harden installations where the table predates this migration.
alter table public.app_cloud_saves
  alter column user_id set not null,
  alter column app_key set not null,
  alter column payload set not null,
  alter column payload set default '{}'::jsonb,
  alter column updated_at set not null,
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.app_cloud_saves'::regclass
      and conname = 'app_cloud_saves_app_key_format'
  ) then
    alter table public.app_cloud_saves
      add constraint app_cloud_saves_app_key_format check (app_key ~ '^[a-z0-9_]{1,120}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.app_cloud_saves'::regclass
      and conname = 'app_cloud_saves_payload_object'
  ) then
    alter table public.app_cloud_saves
      add constraint app_cloud_saves_payload_object check (jsonb_typeof(payload) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.app_cloud_saves'::regclass
      and conname = 'app_cloud_saves_payload_size'
  ) then
    alter table public.app_cloud_saves
      add constraint app_cloud_saves_payload_size check (octet_length(payload::text) <= 2097152);
  end if;
end
$$;

-- The composite primary key is the upsert conflict target. Remove an index
-- created by an earlier hardening draft because it duplicates that primary key.
drop index if exists public.app_cloud_saves_user_app_key_uidx;

comment on table public.app_cloud_saves is
  'One versioned localStorage snapshot per authenticated user and application.';

alter table public.app_cloud_saves enable row level security;
alter table public.app_cloud_saves force row level security;

revoke all on table public.app_cloud_saves from public, anon;
grant select, insert, update, delete on table public.app_cloud_saves to authenticated;

-- Remove the permissive legacy policy names before installing the scoped set.
drop policy if exists "Users can read their own app cloud saves" on public.app_cloud_saves;
drop policy if exists "Users can insert their own app cloud saves" on public.app_cloud_saves;
drop policy if exists "Users can update their own app cloud saves" on public.app_cloud_saves;
drop policy if exists "Users can delete their own app cloud saves" on public.app_cloud_saves;

drop policy if exists app_cloud_saves_select_own on public.app_cloud_saves;
create policy app_cloud_saves_select_own
  on public.app_cloud_saves
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists app_cloud_saves_insert_own on public.app_cloud_saves;
create policy app_cloud_saves_insert_own
  on public.app_cloud_saves
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists app_cloud_saves_update_own on public.app_cloud_saves;
create policy app_cloud_saves_update_own
  on public.app_cloud_saves
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists app_cloud_saves_delete_own on public.app_cloud_saves;
create policy app_cloud_saves_delete_own
  on public.app_cloud_saves
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.set_app_cloud_save_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_app_cloud_save_updated_at() from public, anon, authenticated;

-- Retire the legacy public trigger function installed by the original schema.
drop trigger if exists touch_app_cloud_save_updated_at on public.app_cloud_saves;
drop function if exists public.touch_app_cloud_save_updated_at();

drop trigger if exists set_app_cloud_saves_updated_at on public.app_cloud_saves;
create trigger set_app_cloud_saves_updated_at
before update on public.app_cloud_saves
for each row
execute function private.set_app_cloud_save_updated_at();

commit;
