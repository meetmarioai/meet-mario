import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { to, subject, html, from_email, from_name } = await request.json()
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${from_name || 'MediBalans'} <${from_email || 'info@medibalans.se'}>`,
        to: [to],
        subject,
        html,
      }),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.message || 'Send failed' }, { status: 500 })
    return NextResponse.json({ id: data.id, status: 'sent' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
