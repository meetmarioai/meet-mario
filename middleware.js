// middleware.js
// Meet Mario — Route Protection
// Gates /dashboard behind auth + subscription check
// ─────────────────────────────────────────────────────────────────────────────

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/onboarding', '/auth/callback', '/api']

export async function middleware(req) {
  const res  = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  // ── Public routes — always allow ─────────────────────────────────────────
  if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return res

  // ── Not authenticated → login ─────────────────────────────────────────────
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // ── Dashboard routes — check subscription ────────────────────────────────
  if (path.startsWith('/dashboard')) {
    const userId = session.user.id

    // Fetch profile + subscription in parallel
    const [profileRes, subRes] = await Promise.all([
      supabase.from('profiles').select('test_date, created_at').eq('id', userId).single(),
      supabase.from('subscriptions').select('status, current_period_end').eq('user_id', userId).single(),
    ])

    const profile      = profileRes.data
    const subscription = subRes.data
    const now          = Date.now()

    // Active Stripe subscription
    if (subscription?.status === 'active') return res

    // Grace period — 6 months from test date
    if (profile?.test_date) {
      const graceEnd = new Date(profile.test_date).getTime() + 180 * 86400000
      if (now < graceEnd) return res
    }

    // Free trial — 21 days
    if (profile?.created_at) {
      const trialEnd = new Date(profile.created_at).getTime() + 21 * 86400000
      if (now < trialEnd) {
        // Trial users can access chat only — not full dashboard
        if (path === '/dashboard/chat') return res
        return NextResponse.redirect(new URL('/pricing?reason=trial', req.url))
      }
    }

    // No valid access → pricing
    return NextResponse.redirect(new URL('/pricing?reason=expired', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
