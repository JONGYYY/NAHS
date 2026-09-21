-- NAHS Attendance & Stats Platform — initial schema
-- Run in the Supabase SQL editor (or via the Supabase CLI).

-- =========================================================
-- Extensions
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- Tables
-- =========================================================

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  grade int check (grade between 9 and 12),
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  avatar_url text,
  join_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date not null,
  start_time time,
  end_time time,
  location text,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Attendance codes live in their own table so members can never read an
-- active code directly (RLS is admin-only). Check-in happens via a
-- SECURITY DEFINER function that validates the code server-side.
create table if not exists public.attendance_codes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null unique references public.meetings(id) on delete cascade,
  code text not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_attendance_codes_code on public.attendance_codes (upper(code));

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  method text not null default 'code' check (method in ('code', 'manual')),
  recorded_by uuid references public.profiles(id) on delete set null,
  unique (meeting_id, member_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  activity_date date not null,
  ssl_hours_default numeric(5, 2) not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  ssl_hours_awarded numeric(5, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (activity_id, member_id)
);

create table if not exists public.ssl_adjustments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  hours numeric(5, 2) not null,
  reason text,
  awarded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  club_name text not null default 'National Art Honor Society',
  meeting_day text not null default 'Thursday',
  required_attendance_pct int not null default 70,
  required_ssl_hours numeric(5, 2) not null default 10,
  code_length int not null default 6,
  code_window_minutes int not null default 60
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- =========================================================
-- Helper functions
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- Create a profile row automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent non-admins from escalating their own role/status
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.status := old.status;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- Server-side check-in: validates code + window, inserts attendance for the caller
create or replace function public.check_in(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_status text;
  v_meeting_id uuid;
  v_title text;
  v_expires timestamptz;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select status into v_status from public.profiles where id = v_uid;
  if v_status is null then
    return json_build_object('ok', false, 'error', 'no_profile');
  end if;
  if v_status <> 'active' then
    return json_build_object('ok', false, 'error', 'not_active');
  end if;

  select m.id, m.title, ac.expires_at
    into v_meeting_id, v_title, v_expires
  from public.attendance_codes ac
  join public.meetings m on m.id = ac.meeting_id
  where upper(ac.code) = upper(trim(p_code))
    and ac.is_active = true
  order by m.meeting_date desc
  limit 1;

  if v_meeting_id is null then
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_expires is not null and v_expires < now() then
    return json_build_object('ok', false, 'error', 'expired');
  end if;

  if exists (
    select 1 from public.attendance
    where meeting_id = v_meeting_id and member_id = v_uid
  ) then
    return json_build_object('ok', true, 'already', true, 'meeting', v_title);
  end if;

  insert into public.attendance (meeting_id, member_id, method)
  values (v_meeting_id, v_uid, 'code');

  return json_build_object('ok', true, 'already', false, 'meeting', v_title);
end;
$$;

grant execute on function public.check_in(text) to authenticated;

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.meetings enable row level security;
alter table public.attendance_codes enable row level security;
alter table public.attendance enable row level security;
alter table public.activities enable row level security;
alter table public.activity_participants enable row level security;
alter table public.ssl_adjustments enable row level security;
alter table public.announcements enable row level security;
alter table public.settings enable row level security;

-- Profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_admin on public.profiles;
create policy profiles_insert_admin on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());

-- Meetings (readable by all signed-in members; managed by admins)
drop policy if exists meetings_select on public.meetings;
create policy meetings_select on public.meetings
  for select using (auth.uid() is not null);

drop policy if exists meetings_admin on public.meetings;
create policy meetings_admin on public.meetings
  for all using (public.is_admin()) with check (public.is_admin());

-- Attendance codes: admin only (members never read codes directly)
drop policy if exists codes_admin on public.attendance_codes;
create policy codes_admin on public.attendance_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- Attendance
drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists attendance_admin_write on public.attendance;
create policy attendance_admin_write on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- Activities
drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities
  for select using (auth.uid() is not null);

drop policy if exists activities_admin on public.activities;
create policy activities_admin on public.activities
  for all using (public.is_admin()) with check (public.is_admin());

-- Activity participants
drop policy if exists ap_select on public.activity_participants;
create policy ap_select on public.activity_participants
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists ap_admin on public.activity_participants;
create policy ap_admin on public.activity_participants
  for all using (public.is_admin()) with check (public.is_admin());

-- SSL adjustments
drop policy if exists ssl_select on public.ssl_adjustments;
create policy ssl_select on public.ssl_adjustments
  for select using (member_id = auth.uid() or public.is_admin());

drop policy if exists ssl_admin on public.ssl_adjustments;
create policy ssl_admin on public.ssl_adjustments
  for all using (public.is_admin()) with check (public.is_admin());

-- Announcements
drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements
  for select using (auth.uid() is not null);

drop policy if exists announcements_admin on public.announcements;
create policy announcements_admin on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- Settings
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings
  for select using (auth.uid() is not null);

drop policy if exists settings_admin on public.settings;
create policy settings_admin on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
