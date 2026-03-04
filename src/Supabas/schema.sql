-- ============================================================
-- MeetMario — Supabase Database Schema
-- Run this entire file in: Supabase → SQL Editor → New query
-- ============================================================

-- PATIENTS (extends Supabase auth.users)
create table if not exists public.patients (
  id                uuid references auth.users(id) on delete cascade primary key,
  full_name         text not null,
  date_of_birth     date,
  sex               text check (sex in ('female', 'male', 'other')),
  hormonal_status   text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ALCAT RESULTS
create table if not exists public.alcat_results (
  id              uuid default gen_random_uuid() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  severe          text[] default '{}',
  moderate        text[] default '{}',
  mild            text[] default '{}',
  candida_level   text check (candida_level in ('mild','moderate','severe')),
  whey_level      text check (whey_level in ('mild','moderate','severe')),
  test_date       date,
  lab_id          text,
  raw_report_url  text,
  created_at      timestamptz default now()
);

-- PROTEIN PREFERENCES (meal customisation, persisted)
create table if not exists public.protein_preferences (
  id              uuid default gen_random_uuid() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  rotation_day    int not null check (rotation_day between 1 and 4),
  meal_key        text not null,
  selected_protein text not null,
  updated_at      timestamptz default now(),
  unique(patient_id, rotation_day, meal_key)
);

-- REACTION DIARY
create table if not exists public.reaction_diary (
  id              uuid default gen_random_uuid() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  meal_label      text,
  foods           text[] default '{}',
  spike_label     text,
  spike_value     text,
  spike_level     text,
  reactive        boolean,
  symptoms        text[] default '{}',
  severity        text check (severity in ('mild','moderate','severe')),
  analysis        text,
  flag_clinic     boolean default false,
  created_at      timestamptz default now()
);

-- CHAT HISTORY
create table if not exists public.chat_messages (
  id              uuid default gen_random_uuid() primary key,
  patient_id      uuid references public.patients(id) on delete cascade not null,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  created_at      timestamptz default now()
);

-- CLINIC STAFF (Dr Mario + any additional clinicians)
create table if not exists public.clinic_staff (
  id              uuid references auth.users(id) on delete cascade primary key,
  name            text,
  role            text default 'clinician',
  created_at      timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.patients           enable row level security;
alter table public.alcat_results      enable row level security;
alter table public.protein_preferences enable row level security;
alter table public.reaction_diary     enable row level security;
alter table public.chat_messages      enable row level security;
alter table public.clinic_staff       enable row level security;

-- Patients: own row only
create policy "patients_own_read"   on public.patients for select using (auth.uid() = id);
create policy "patients_own_update" on public.patients for update using (auth.uid() = id);

-- ALCAT: own results only
create policy "alcat_own" on public.alcat_results
  for select using (auth.uid() = patient_id);

-- Proteins: own prefs
create policy "proteins_own" on public.protein_preferences
  for all using (auth.uid() = patient_id);

-- Diary: own entries
create policy "diary_own" on public.reaction_diary
  for all using (auth.uid() = patient_id);

-- Chat: own messages
create policy "chat_own" on public.chat_messages
  for all using (auth.uid() = patient_id);

-- Staff helper function
create or replace function public.is_staff()
returns boolean language sql security definer as $$
  select exists (select 1 from public.clinic_staff where id = auth.uid())
$$;

-- Staff can read all patient data (clinic dashboard)
create policy "staff_read_patients"    on public.patients        for select using (public.is_staff());
create policy "staff_read_alcat"       on public.alcat_results   for select using (public.is_staff());
create policy "staff_read_diary"       on public.reaction_diary  for select using (public.is_staff());
create policy "staff_read_chat"        on public.chat_messages   for select using (public.is_staff());
create policy "staff_read_staff"       on public.clinic_staff    for select using (public.is_staff());

-- Staff can manage all patient data
create policy "staff_insert_patients"  on public.patients        for insert with check (public.is_staff());
create policy "staff_insert_alcat"     on public.alcat_results   for insert with check (public.is_staff());


-- ============================================================
-- INSERT DR MARIO AS CLINIC STAFF
-- Run this AFTER Dr Mario has logged in at least once.
-- Replace the email with his actual email.
-- ============================================================

-- insert into public.clinic_staff (id, name, role)
-- select id, 'Dr Mario Anthis', 'lead_clinician'
-- from auth.users
-- where email = 'mario@medibalans.com'
-- on conflict (id) do nothing;


-- ============================================================
-- INDEXES (for performance at 50-500 patients)
-- ============================================================

create index if not exists idx_alcat_patient     on public.alcat_results(patient_id);
create index if not exists idx_diary_patient     on public.reaction_diary(patient_id);
create index if not exists idx_chat_patient      on public.chat_messages(patient_id);
create index if not exists idx_chat_created      on public.chat_messages(patient_id, created_at);
create index if not exists idx_prefs_patient     on public.protein_preferences(patient_id);
