# MeetMario — Multi-Patient Auth Layer
## Complete Implementation Guide

---

## What This Builds

Transforms MeetMario from a hardcoded single-patient demo into a real
multi-patient platform where each patient logs in and sees only their own
ALCAT data, rotation protocol, and chat history.

---

## Stack

- **Auth**: Supabase Auth (email + magic link — no password friction for patients)
- **Database**: Supabase PostgreSQL
- **Frontend**: Next.js (your current stack)
- **File storage**: Supabase Storage (for ALCAT report uploads)

---

## Database Schema

Run this in your Supabase SQL editor:

```sql
-- PATIENTS table (extends Supabase auth.users)
create table public.patients (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  date_of_birth date,
  sex text,
  hormonal_status text,
  lab_id text,
  test_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ALCAT RESULTS table
create table public.alcat_results (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  severe text[] default '{}',
  moderate text[] default '{}',
  mild text[] default '{}',
  candida_level text, -- 'mild' | 'moderate' | 'severe' | null
  whey_level text,    -- 'mild' | 'moderate' | 'severe' | null
  test_date date,
  lab_id text,
  raw_report_url text, -- Supabase Storage URL
  created_at timestamptz default now()
);

-- PROTEIN PREFERENCES table (user's meal customizations)
create table public.protein_preferences (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  rotation_day int not null,         -- 1-4
  meal_key text not null,            -- 'lunch' | 'dinner'
  selected_protein text not null,
  updated_at timestamptz default now(),
  unique(patient_id, rotation_day, meal_key)
);

-- REACTION DIARY table
create table public.reaction_diary (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  meal_label text,
  foods text[] default '{}',
  spike_label text,
  spike_value text,
  spike_level text,
  reactive boolean,
  symptoms text[] default '{}',
  severity text,
  analysis text,
  flag_clinic boolean default false,
  created_at timestamptz default now()
);

-- CHAT HISTORY table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  role text not null,   -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- CLINIC DASHBOARD: Dr Mario can see all patients
create table public.clinic_staff (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  role text default 'clinician'
);

-- ROW LEVEL SECURITY — patients only see their own data
alter table public.patients enable row level security;
alter table public.alcat_results enable row level security;
alter table public.protein_preferences enable row level security;
alter table public.reaction_diary enable row level security;
alter table public.chat_messages enable row level security;

-- Patients: read/update own row only
create policy "patients_own" on public.patients
  for all using (auth.uid() = id);

-- ALCAT: read own results
create policy "alcat_own" on public.alcat_results
  for all using (auth.uid() = patient_id);

-- Proteins: read/write own preferences
create policy "proteins_own" on public.protein_preferences
  for all using (auth.uid() = patient_id);

-- Diary: read/write own entries
create policy "diary_own" on public.reaction_diary
  for all using (auth.uid() = patient_id);

-- Chat: read/write own messages
create policy "chat_own" on public.chat_messages
  for all using (auth.uid() = patient_id);

-- Clinic staff can read ALL patient data (Dr Mario's dashboard)
create policy "staff_read_all_patients" on public.patients
  for select using (
    exists (select 1 from public.clinic_staff where id = auth.uid())
  );

create policy "staff_read_all_alcat" on public.alcat_results
  for select using (
    exists (select 1 from public.clinic_staff where id = auth.uid())
  );

create policy "staff_read_all_diary" on public.reaction_diary
  for select using (
    exists (select 1 from public.clinic_staff where id = auth.uid())
  );
```

---

## File Structure

```
/app
  /auth
    /login          → page.jsx  (magic link login)
    /callback       → page.jsx  (Supabase OAuth callback)
  /dashboard        → page.jsx  (MeetMario main app — protected)
  /admin            → page.jsx  (Dr Mario clinic view)
/lib
  supabase.js       → client + server Supabase instances
  usePatient.js     → hook: loads current patient's ALCAT data
/components
  AuthGuard.jsx     → redirects to /auth/login if not authenticated
```

---

## Key Files (copy-paste ready)

### 1. /lib/supabase.js

```javascript
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Browser client (use in components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Server client (use in Server Components / API routes)
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )
}
```

### 2. /lib/usePatient.js

```javascript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from './supabase'

export function usePatient() {
  const [patient, setPatient] = useState(null)
  const [alcat, setAlcat] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', user.id).single(),
        supabase.from('alcat_results').select('*').eq('patient_id', user.id)
          .order('test_date', { ascending: false }).limit(1).single()
      ])

      setPatient(p)
      setAlcat(a)
      setLoading(false)
    }
    load()
  }, [])

  return { patient, alcat, loading }
}
```

### 3. /app/auth/login/page.jsx

```jsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  // Use your existing MeetMario design system (T, fonts, BtnPrimary etc.)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F7F4F0' }}>
      <div style={{ maxWidth: 400, width: '100%', padding: 40 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 32,
          marginBottom: 8, color: '#1C1510' }}>
          meet mario
        </div>
        <div style={{ fontSize: 13, color: '#8A7E72', marginBottom: 32 }}>
          MediBalans · Precision Medicine
        </div>

        {sent ? (
          <div style={{ fontSize: 14, color: '#4A4038', lineHeight: 1.7 }}>
            Check your email. A secure login link has been sent to <strong>{email}</strong>.
            No password needed — click the link to access your protocol.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                display: 'block', width: '100%', padding: '12px 0',
                border: 'none', borderBottom: '1.5px solid #D8D0C4',
                background: 'transparent', fontSize: 14, color: '#1C1510',
                outline: 'none', marginBottom: 24
              }}
            />
            <button
              onClick={handleLogin}
              disabled={loading || !email}
              style={{
                background: loading ? '#D8D0C4' : '#C4887A',
                border: 'none', borderRadius: 10, padding: '14px 32px',
                color: '#fff', fontSize: 13, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', width: '100%'
              }}
            >
              {loading ? 'Sending…' : 'Send secure login link →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

### 4. /app/auth/callback/route.js

```javascript
import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

### 5. /components/AuthGuard.jsx

```jsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login')
    })
  }, [])

  return children
}
```

### 6. /app/dashboard/page.jsx (wrap your MeetMario component)

```jsx
import AuthGuard from '@/components/AuthGuard'
import MeetMario from '@/components/MeetMario'

export default function Dashboard() {
  return (
    <AuthGuard>
      <MeetMario />
    </AuthGuard>
  )
}
```

---

## MeetMario.jsx — Changes Required

### Replace the hardcoded P object

```javascript
// REMOVE this at the top of MeetMario.jsx:
const P = { name:"Christina Wohltahrt", ... }

// REPLACE with:
import { usePatient } from '@/lib/usePatient'

// Inside the component:
const { patient, alcat, loading } = usePatient()
if (loading) return <LoadingScreen />

// Then use alcat.severe, alcat.moderate, alcat.mild
// instead of P.severe, P.moderate, P.mild
// and patient.full_name instead of P.name
```

### Save protein preferences to Supabase

```javascript
// Replace local state proteins with DB-backed version:
const setP = async (day, key, protein) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('protein_preferences').upsert({
    patient_id: user.id,
    rotation_day: day,
    meal_key: key,
    selected_protein: protein,
    updated_at: new Date().toISOString()
  })
  setProteins(prev => ({ ...prev, [`${day}-${key}`]: protein }))
}
```

### Save reaction diary to Supabase

```javascript
// In logAndDismiss(), after setting diary state, also save to DB:
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('reaction_diary').insert({
  patient_id: user.id,
  meal_label: monMealLabel,
  foods: monFoods,
  spike_label: popup?.label,
  spike_value: popup?.val,
  spike_level: popup?.level,
  reactive: popupReactive,
  symptoms: popupSymptoms,
  severity: popupSeverity,
  analysis,
  flag_clinic: popupSeverity === 'severe' || popup?.level === 'severe'
})
```

### Save chat history to Supabase

```javascript
// In sendChat(), after getting the response:
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('chat_messages').insert([
  { patient_id: user.id, role: 'user', content: chatIn },
  { patient_id: user.id, role: 'assistant', content: response }
])
```

---

## Dr Mario Admin — /app/admin/page.jsx

```jsx
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Only Dr Mario's email gets in
  if (user?.email !== 'mario@medibalans.com') redirect('/dashboard')

  const { data: patients } = await supabase
    .from('patients')
    .select(`
      *,
      alcat_results(*),
      reaction_diary(count),
      chat_messages(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1>MediBalans — {patients?.length} patients</h1>
      {patients?.map(p => (
        <div key={p.id}>
          <strong>{p.full_name}</strong>
          <span>{p.reaction_diary[0]?.count} reactions logged</span>
          <span>{p.chat_messages[0]?.count} Mario conversations</span>
        </div>
      ))}
    </div>
  )
}
```

---

## Onboarding a New Patient (Dr Mario's workflow)

1. Patient pays and completes ALCAT test
2. Dr Mario receives results
3. Dr Mario runs the Python ALCAT parser to extract severe/moderate/mild lists
4. Dr Mario goes to `/admin` → "Add Patient"
5. Enters patient email → system sends magic link
6. Patient data inserted into `patients` + `alcat_results` tables
7. Patient clicks link → lands directly on their protocol

No patient ever needs to create an account manually. One email, one click, they're in.

---

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # admin operations only
```

---

## Install

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Estimated Implementation Time

| Task | Time |
|---|---|
| Supabase schema (SQL above) | 20 min |
| /lib/supabase.js + usePatient.js | 30 min |
| Auth pages (login + callback) | 30 min |
| Replace P object with usePatient hook | 45 min |
| Wire diary + chat to Supabase | 45 min |
| Admin page | 30 min |
| Test end-to-end with 1 patient | 60 min |
| **Total** | **~4.5 hours** |
