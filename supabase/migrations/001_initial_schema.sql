-- Qadr cloud sync: per-domain JSON payloads (mirrors Zustand persist keys) + profile row

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  cloud_migrated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- sync_domains: one row per persist key (qadr-habits, qadr-dashboard, …)
-- payload = zustand persist state slice (json)
-- ---------------------------------------------------------------------------
create table if not exists public.sync_domains (
  user_id uuid not null references auth.users (id) on delete cascade,
  domain text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, domain)
);

create index if not exists sync_domains_user_updated_idx
  on public.sync_domains (user_id, updated_at desc);

create trigger sync_domains_updated_at
  before update on public.sync_domains
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sync_domains enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

create policy "sync_domains_all_own"
  on public.sync_domains for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
