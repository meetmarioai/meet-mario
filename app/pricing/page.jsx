'use client'
// app/pricing/page.jsx
// Meet Mario — Pricing
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const PLANS = {
  monthly: { label: 'Monthly', price: 299, period: '/month', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY },
  annual:  { label: 'Annual',  price: 2990, period: '/year', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL, saving: 'Save 2 months' },
}

export default function PricingPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const [billing, setBilling] = useState('annual')
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: PLANS[billing].priceId,
        userId: session?.user?.id,
        email: session?.user?.email,
      }),
    })
    const { url, error } = await res.json()
    if (error) { alert(error); setLoading(false); return }
    window.location.href = url
  }

  const plan = PLANS[billing]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F2',
      fontFamily: "'Lato', sans-serif",
      padding: '60px 24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '32px',
          color: '#1a1a1a',
          marginBottom: '12px',
        }}>
          Your precision medicine OS
        </div>
        <p style={{ color: '#666', fontSize: '17px', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          Built on your ALCAT, CMA, and genomic data.
          Not a wellness app — a clinical protocol in your pocket.
        </p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{
          background: '#F0EBE3',
          borderRadius: '50px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
        }}>
          {['monthly', 'annual'].map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '10px 24px',
                borderRadius: '50px',
                border: 'none',
                background: billing === b ? '#C9956C' : 'transparent',
                color: billing === b ? '#fff' : '#888',
                fontSize: '14px',
                fontWeight: billing === b ? '700' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {b === 'annual' ? 'Annual · Save 17%' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '960px',
        margin: '0 auto',
      }}>

        {/* Free trial card */}
        <PricingCard
          badge={null}
          title="Free Trial"
          price="Free"
          period="21 days"
          description="Try Meet Mario before committing. Full access to Mario AI chat."
          features={[
            '21-day trial',
            'Mario AI clinical chat',
            'Upload ALCAT / CMA results',
            'Basic protocol guidance',
          ]}
          cta="Start free trial"
          ctaAction={() => window.location.href = '/onboarding'}
          muted
        />

        {/* MediBalans package card */}
        <PricingCard
          badge="MediBalans Patients"
          title="Included in your package"
          price="Free"
          period="6 months"
          description="All MediBalans clinical packages include 6 months of Meet Mario. Your test date triggers it automatically."
          features={[
            '6 months full access',
            'Included in 22,000–50,000 SEK packages',
            'Activated from your test date',
            'Converts to paid after 6 months',
          ]}
          cta="Book at MediBalans"
          ctaAction={() => window.open('https://medibalans.com', '_blank')}
          muted
        />

        {/* Paid subscription card */}
        <PricingCard
          badge={billing === 'annual' ? 'Most popular' : null}
          title="Meet Mario"
          price={`${plan.price} kr`}
          period={plan.period}
          description="Full clinical protocol AI. Your entire biological picture, always up to date."
          features={[
            'Complete dashboard — all 12 modules',
            'Mario AI — Profile A/B/C detection',
            'ALCAT food rotation engine',
            'CMA supplement protocol',
            'Genomic lifestyle guidance',
            'Longevity & mTOR personalisation',
            'Meal generation & grocery lists',
            'GutCheck + PlateCheck',
            'Outcomes tracking & trajectory charts',
          ]}
          cta={loading ? 'Redirecting…' : `Subscribe — ${plan.price} kr${plan.period}`}
          ctaAction={handleSubscribe}
          highlighted
          loading={loading}
        />
      </div>

      {/* Trust strip */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        color: '#aaa',
        fontSize: '13px',
        lineHeight: '2',
      }}>
        <div>🔒 Payments via Stripe · GDPR compliant · Data hosted in Frankfurt, EU</div>
        <div>Cancel anytime · No binding period · VAT included for Swedish patients</div>
        <div style={{ marginTop: '8px' }}>
          Questions? <a href="mailto:info@medibalans.com" style={{ color: '#C9956C' }}>info@medibalans.com</a>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ badge, title, price, period, description, features, cta, ctaAction, highlighted, muted, loading }) {
  return (
    <div style={{
      background: highlighted ? '#1a1a1a' : '#fff',
      borderRadius: '20px',
      padding: '36px 32px',
      width: '280px',
      border: highlighted ? '2px solid #C9956C' : '1.5px solid #E5DDD3',
      position: 'relative',
      boxShadow: highlighted ? '0 12px 48px rgba(201,149,108,0.2)' : '0 4px 24px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {badge && (
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#C9956C',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '5px 16px',
          borderRadius: '50px',
          whiteSpace: 'nowrap',
        }}>
          {badge}
        </div>
      )}

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: highlighted ? '#fff' : '#1a1a1a', marginBottom: '8px' }}>
        {title}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: '700', color: highlighted ? '#C9956C' : '#1a1a1a' }}>{price}</span>
        <span style={{ fontSize: '15px', color: highlighted ? '#aaa' : '#888', marginLeft: '4px' }}>{period}</span>
      </div>

      <p style={{ color: highlighted ? '#ccc' : '#777', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
        {description}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{
            fontSize: '14px',
            color: highlighted ? '#ddd' : '#555',
            padding: '6px 0',
            borderBottom: `1px solid ${highlighted ? '#2a2a2a' : '#F5F0EA'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <span style={{ color: '#C9956C', flexShrink: 0, marginTop: '2px' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={ctaAction}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '10px',
          background: highlighted ? '#C9956C' : muted ? 'transparent' : '#1a1a1a',
          color: highlighted ? '#fff' : muted ? '#C9956C' : '#fff',
          border: muted ? '1.5px solid #C9956C' : 'none',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Lato', sans-serif",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {cta}
      </button>
    </div>
  )
}
