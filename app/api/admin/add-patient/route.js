import { createAdminClient } from '@/lib/supabase-server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// ─── POST /api/admin/add-patient ──────────────────────────────────────────────
// Creates a new patient auth user + inserts patient profile + ALCAT results.
// Sends magic link to the patient's email automatically.
// Only accessible to clinic staff (checked via middleware + server-side auth).

export async function POST(request) {
  // Verify caller is clinic staff
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: staff } = await supabase
    .from('clinic_staff')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!staff) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await request.json()
  const {
    email, full_name, date_of_birth, sex, hormonal_status,
    severe, moderate, mild, candida_level, whey_level,
    test_date, lab_id,
  } = body

  if (!email || !full_name) {
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Create the auth user (or get existing)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    email_confirm: true,  // skip email confirmation — we'll send magic link
  })

  let userId

  if (authError) {
    // User may already exist — try to find them
    if (authError.message?.includes('already been registered')) {
      const { data: existing } = await admin.auth.admin.listUsers()
      const found = existing?.users?.find(u => u.email === email.trim().toLowerCase())
      if (!found) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
      userId = found.id
    } else {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
  } else {
    userId = authData.user.id
  }

  // 2. Insert patient profile
  const { error: profileError } = await admin
    .from('patients')
    .upsert({
      id: userId,
      full_name: full_name.trim(),
      date_of_birth: date_of_birth || null,
      sex: sex || 'female',
      hormonal_status: hormonal_status || null,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 3. Insert ALCAT results (if provided)
  const parseList = (str) =>
    str ? str.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : []

  if (severe || moderate || mild || test_date) {
    const { error: alcatError } = await admin
      .from('alcat_results')
      .insert({
        patient_id: userId,
        severe:        parseList(severe),
        moderate:      parseList(moderate),
        mild:          parseList(mild),
        candida_level: candida_level || null,
        whey_level:    whey_level || null,
        test_date:     test_date || null,
        lab_id:        lab_id || null,
      })

    if (alcatError) {
      return NextResponse.json({ error: alcatError.message }, { status: 500 })
    }
  }

  // 4. Send magic link to patient
  const { error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: email.trim().toLowerCase(),
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  })

  // Note: In Supabase, generateLink returns the link — you'd email it yourself
  // OR use signInWithOtp which sends automatically via Supabase Auth emails
  // For simplicity, trigger the standard magic link email:
  const { error: otpError } = await admin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` }
  )

  if (otpError && !otpError.message?.includes('already been invited')) {
    console.warn('Could not send invite email:', otpError.message)
    // Don't fail — patient was created successfully
  }

  return NextResponse.json({
    ok: true,
    userId,
    message: `${full_name} added successfully.`,
  })
}
