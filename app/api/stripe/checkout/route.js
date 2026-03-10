// app/api/stripe/checkout/route.js
// Creates a Stripe Checkout session → returns URL
// ─────────────────────────────────────────────────

import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { priceId, userId, email } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],   // Klarna: add 'klarna' when live
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { supabase_user_id: userId },
        trial_period_days: undefined,  // trials handled by our own logic
      },
      metadata: { supabase_user_id: userId },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?subscribed=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_URL}/pricing?cancelled=true`,
      locale: 'sv',   // Swedish UI for SEK payments
      currency: 'sek',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
