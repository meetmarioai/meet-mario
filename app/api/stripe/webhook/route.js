// app/api/stripe/webhook/route.js
// Stripe → Supabase subscription sync
// Handles: checkout.session.completed, invoice.paid,
//          customer.subscription.updated, customer.subscription.deleted
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service role — bypasses RLS for server-side writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const data = event.data.object

  switch (event.type) {

    // ── New subscription created via Checkout ─────────────────────────────
    case 'checkout.session.completed': {
      const userId = data.metadata?.supabase_user_id
      if (!userId) break

      const subscription = await stripe.subscriptions.retrieve(data.subscription)
      await upsertSubscription(userId, subscription)
      break
    }

    // ── Subscription renewed ──────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      if (data.billing_reason === 'subscription_cycle') {
        const subscription = await stripe.subscriptions.retrieve(data.subscription)
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break
        await upsertSubscription(userId, subscription)
      }
      break
    }

    // ── Subscription changed / paused ─────────────────────────────────────
    case 'customer.subscription.updated': {
      const userId = data.metadata?.supabase_user_id
      if (!userId) break
      await upsertSubscription(userId, data)
      break
    }

    // ── Subscription cancelled ────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const userId = data.metadata?.supabase_user_id
      if (!userId) break
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_sub_id', data.id)
      break
    }

    // ── Payment failed ────────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const subscription = await stripe.subscriptions.retrieve(data.subscription)
      const userId = subscription.metadata?.supabase_user_id
      if (!userId) break
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_sub_id', data.subscription)
      break
    }
  }

  return NextResponse.json({ received: true })
}

// ── Upsert subscription row ───────────────────────────────────────────────────
async function upsertSubscription(userId, sub) {
  const plan = sub.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly'

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id:            userId,
      stripe_customer:    sub.customer,
      stripe_sub_id:      sub.id,
      status:             sub.status,
      plan,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at:         new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) console.error('Supabase upsert error:', error)
}

// ── Disable body parsing (Stripe needs raw body) ──────────────────────────────
export const config = { api: { bodyParser: false } }
