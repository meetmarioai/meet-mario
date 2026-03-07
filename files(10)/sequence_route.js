import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SEQUENCE_SCHEDULE } from '@/lib/emailTemplates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/email/sequence
// Body: { patient_id, patient_email, patient_name, predicted_reactors, symptom_profile }
export async function POST(request) {
  try {
    const {
      patient_id,
      patient_email,
      patient_name,
      predicted_reactors = [],
      symptom_profile = {},
    } = await request.json()

    if (!patient_email || !patient_name) {
      return NextResponse.json({ error: 'patient_email and patient_name required' }, { status: 400 })
    }

    // Cancel any existing pending sequences for this patient
    await supabase
      .from('email_sequences')
      .update({ status: 'cancelled' })
      .eq('patient_email', patient_email)
      .eq('status', 'pending')

    // Build sequence rows
    const now = new Date()
    const rows = SEQUENCE_SCHEDULE.map(({ step, daysOffset }) => {
      const send_at = new Date(now)
      send_at.setDate(send_at.getDate() + daysOffset)
      // Send at 9am Stockholm time
      send_at.setHours(9, 0, 0, 0)

      // Assign sender per step
      const senders = [
        { email: 'marios.anthis@medibalans.com', name: 'Dr Mario Anthis, MediBalans' },
        { email: 'christina.biri@medibalans.com', name: 'Christina Biri, MediBalans' },
        { email: 'marios.anthis@medibalans.com', name: 'Dr Mario Anthis, MediBalans' },
        { email: 'marios.anthis@medibalans.com', name: 'Dr Mario Anthis, MediBalans' },
        { email: 'christina.biri@medibalans.com', name: 'Christina Biri, MediBalans' },
      ]

      return {
        patient_id: patient_id || null,
        patient_email,
        patient_name,
        sequence_type: 'onboarding',
        step,
        send_at: send_at.toISOString(),
        status: 'pending',
        predicted_reactors,
        symptom_profile,
        sender_email: senders[step].email,
        sender_name: senders[step].name,
      }
    })

    const { data, error } = await supabase
      .from('email_sequences')
      .insert(rows)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      enrolled: rows.length,
      sequence: data.map(r => ({
        step: r.step,
        send_at: r.send_at,
        status: r.status,
      }))
    })
  } catch (err) {
    console.error('Sequence enrol error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/email/sequence?email=xxx — check sequence status for a patient
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const { data, error } = await supabase
    .from('email_sequences')
    .select('step, send_at, sent_at, status, sender_email')
    .eq('patient_email', email)
    .order('step')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sequence: data })
}
