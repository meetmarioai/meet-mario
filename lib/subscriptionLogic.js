// lib/subscriptionLogic.js
// Meet Mario — Access Tier Engine
// Three access states, computed from Supabase profile
// ─────────────────────────────────────────────────────

export const ACCESS = {
  TRIAL:    'trial',     // 21-day free — chat widget only
  GRACE:    'grace',     // Package patient — 6 months free from test date
  ACTIVE:   'active',    // Paid subscriber — full dashboard
  EXPIRED:  'expired',   // Trial or grace ended — paywall
  NONE:     'none',      // Not authenticated
}

const TRIAL_DAYS   = 21
const GRACE_DAYS   = 180   // 6 months from test date

/**
 * computeAccessTier
 * Single source of truth for what a user can see.
 *
 * @param {object} profile — row from Supabase `profiles` table
 * @param {object|null} subscription — row from Supabase `subscriptions` table
 * @returns {{ tier, daysRemaining, message, canAccessDashboard, canAccessChat }}
 */
export function computeAccessTier(profile, subscription) {
  if (!profile) return { tier: ACCESS.NONE, canAccessDashboard: false, canAccessChat: false }

  const now = Date.now()

  // ── 1. Active Stripe subscription — full access ───────────────────────────
  if (subscription?.status === 'active' || subscription?.status === 'trialing') {
    return {
      tier: ACCESS.ACTIVE,
      daysRemaining: null,
      message: null,
      canAccessDashboard: true,
      canAccessChat: true,
      periodEnd: subscription.current_period_end,
    }
  }

  // ── 2. Package patient — grace period (6 months from test date) ───────────
  if (profile.test_date) {
    const testDate   = new Date(profile.test_date).getTime()
    const graceEnd   = testDate + GRACE_DAYS * 86400000
    const daysLeft   = Math.ceil((graceEnd - now) / 86400000)

    if (now < graceEnd) {
      return {
        tier: ACCESS.GRACE,
        daysRemaining: daysLeft,
        message: daysLeft <= 14
          ? `Your complimentary access ends in ${daysLeft} days. Subscribe to keep your full protocol.`
          : null,
        canAccessDashboard: true,
        canAccessChat: true,
        graceEnd,
      }
    }
  }

  // ── 3. Free trial — 21 days from account creation ────────────────────────
  if (profile.created_at) {
    const created  = new Date(profile.created_at).getTime()
    const trialEnd = created + TRIAL_DAYS * 86400000
    const daysLeft = Math.ceil((trialEnd - now) / 86400000)

    if (now < trialEnd) {
      return {
        tier: ACCESS.TRIAL,
        daysRemaining: daysLeft,
        message: `Free trial — ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining.`,
        canAccessDashboard: false,   // chat only during trial
        canAccessChat: true,
        trialEnd,
      }
    }
  }

  // ── 4. Expired — paywall ──────────────────────────────────────────────────
  return {
    tier: ACCESS.EXPIRED,
    daysRemaining: 0,
    message: 'Your access period has ended. Subscribe to continue.',
    canAccessDashboard: false,
    canAccessChat: false,
  }
}

/**
 * Supabase schema additions required:
 *
 * profiles table (add columns):
 *   test_date         date          -- set by Dr Mario when results are uploaded
 *   package_type      text          -- 'basic' | 'standard' | 'premium' | 'elite'
 *   grace_period_end  timestamptz   -- computed: test_date + 180 days
 *
 * subscriptions table (new):
 *   id                uuid primary key default uuid_generate_v4()
 *   user_id           uuid references auth.users(id)
 *   stripe_customer   text
 *   stripe_sub_id     text
 *   status            text          -- 'active' | 'canceled' | 'past_due' | 'trialing'
 *   plan              text          -- 'monthly' | 'annual'
 *   current_period_end timestamptz
 *   created_at        timestamptz default now()
 *   updated_at        timestamptz default now()
 */
