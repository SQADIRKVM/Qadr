-- Firebase third-party auth: user ids are Firebase UID strings (JWT sub), not auth.users UUIDs.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "sync_domains_all_own" on public.sync_domains;

alter table public.sync_domains drop constraint if exists sync_domains_user_id_fkey;
alter table public.profiles drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id type text using id::text;

alter table public.sync_domains
  alter column user_id type text using user_id::text;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = (auth.jwt() ->> 'sub'));

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = (auth.jwt() ->> 'sub'));

create policy "profiles_update_own"
  on public.profiles for update
  using (id = (auth.jwt() ->> 'sub'));

create policy "sync_domains_all_own"
  on public.sync_domains for all
  using (user_id = (auth.jwt() ->> 'sub'))
  with check (user_id = (auth.jwt() ->> 'sub'));
