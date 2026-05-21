-- Profile fields from Firebase + device session tracking for Account screen

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists photo_url text;

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  device_label text,
  platform text,
  ip_address text,
  user_agent text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_user_active_idx
  on public.user_sessions (user_id, last_active_at desc);

alter table public.user_sessions enable row level security;

drop policy if exists "user_sessions_all_own" on public.user_sessions;
create policy "user_sessions_all_own"
  on public.user_sessions for all
  using (user_id = (auth.jwt() ->> 'sub'))
  with check (user_id = (auth.jwt() ->> 'sub'));
