import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { full_name, email, dob, symptoms, diet_history, previous_tests, medications, supplements, goals, predicted_reactors, purge_after, consent_gdpr, consent_at } = body
    if (!full_name || !email || !consent_gdpr) {
      return NextResponse.json({ error: 'Name, email and consent required' }, { status: 400 })
    }
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .upsert({ full_name, email, dob: dob || null, gdpr_consent: true, consent_at, purge_after, onboarding_complete: true, onboarding_at: new Date().toISOString() }, { onConflict: 'email' })
      .select('id').single()
    if (patientError) throw patientError
    await supabase.from('onboarding_intake').upsert({ patient_id: patient.id, symptoms, diet_history, previous_tests, medications: medications || null, supplements: supplements || null, goals, predicted_reactors, purge_after, created_at: new Date().toISOString() }, { onConflict: 'patient_id' })
    return NextResponse.json({ success: true, patient_id: patient.id })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
