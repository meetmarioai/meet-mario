import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  template0, template1, template2, template3, template4
} from '@/lib/emailTemplates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TEMPLATES = [template0, template1, template2, template3, template4]

// Vercel cron: runs daily at 8:55am UTC (9:55am Stockholm)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/emails", "schedule": "55 8 * * *" }] }
export async function GET(request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all pending emails due now or in the past
    const { data: due, error } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())
      .order('send_at')

    if (error) throw error
    if (!due || due.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No emails due' })
    }

    let sent = 0
    let failed = 0
    const results = []

    for (const seq of due) {
      try {
        // Build email from template
        const templateFn = TEMPLATES[seq.step]
        if (!templateFn) continue

        const { subject, html, sender } = templateFn({
          name: seq.patient_name,
          predictedReactors: seq.predicted_reactors || [],
          symptomProfile: seq.symptom_profile || {},
        })

        // Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${seq.sender_name} <${seq.sender_email}>`,
            to: [seq.patient_email],
            subject,
            html,
          }),
        })

        const resData = await res.json()

        if (res.ok) {
          // Mark as sent
          await supabase
            .from('email_sequences')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', seq.id)

          // Log it
          await supabase.from('email_logs').insert({
            sequence_id: seq.id,
            patient_email: seq.patient_email,
            subject,
            resend_id: resData.id,
            status: 'sent',
          })

          sent++
          results.push({ email: seq.patient_email, step: seq.step, status: 'sent' })
        } else {
          throw new Error(resData.message || 'Resend failed')
        }
      } catch (err) {
        // Mark as failed
        await supabase
          .from('email_sequences')
          .update({ status: 'failed' })
          .eq('id', seq.id)

        await supabase.from('email_logs').insert({
          sequence_id: seq.id,
          patient_email: seq.patient_email,
          subject: `Step ${seq.step}`,
          status: 'failed',
          error_message: err.message,
        })

        failed++
        results.push({ email: seq.patient_email, step: seq.step, status: 'failed', error: err.message })
        console.error(`Email failed for ${seq.patient_email} step ${seq.step}:`, err)
      }
    }

    return NextResponse.json({ sent, failed, results })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
