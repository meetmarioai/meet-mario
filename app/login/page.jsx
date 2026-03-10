'use client'
// app/login/page.jsx
// Meet Mario — Login
// Passkeys (Face ID / Touch ID / Windows Hello / fingerprint) primary
// Magic link fallback
// Supabase Frankfurt — medical data stays in EU
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const [email, setEmail]       = useState('')
  const [mode, setMode]         = useState('passkey')   // 'passkey' | 'magic'
  const [step, setStep]         = useState('email')     // 'email' | 'sent' | 'error'
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [passkeySupported, setPasskeySupported] = useState(false)

  useEffect(() => {
    // Detect passkey support (WebAuthn + platform authenticator)
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setPasskeySupported(available))
        .catch(() => setPasskeySupported(false))
    }
  }, [])

  // ── Passkey authentication ────────────────────────────────────────────────
  async function handlePasskey() {
    if (!email.trim()) { setError('Enter your email first'); return }
    setLoading(true); setError(null)

    try {
      // 1. Get challenge from our API
      const challengeRes = await fetch('/api/auth/passkey/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { options, action } = await challengeRes.json()   // action: 'register' | 'authenticate'

      let credential
      if (action === 'register') {
        // New user — create passkey
        credential = await startRegistration(options)
      } else {
        // Returning user — verify passkey
        credential = await startAuthentication(options)
      }

      // 2. Verify with our API → get Supabase session
      const verifyRes = await fetch('/api/auth/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credential, action }),
      })
      const { error: verifyError, redirectTo } = await verifyRes.json()
      if (verifyError) throw new Error(verifyError)

      window.location.href = redirectTo || '/dashboard'
    } catch (err) {
      // Passkey cancelled or failed — offer magic link
      if (err.name === 'NotAllowedError') {
        setError('Passkey cancelled. Use email link below instead.')
      } else {
        setError(err.message || 'Passkey failed. Try email link.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Magic link fallback ───────────────────────────────────────────────────
  async function handleMagicLink() {
    if (!email.trim()) { setError('Enter your email first'); return }
    setLoading(true); setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setStep('sent')
      setLoading(false)
    }
  }

  // ── Apple Sign In ─────────────────────────────────────────────────────────
  async function handleApple() {
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) { setError(authError.message); setLoading(false) }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Lato', sans-serif",
      padding: '24px',
    }}>
      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '48px 44px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
      }}>

        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '26px',
            letterSpacing: '0.04em',
            color: '#1a1a1a',
          }}>
            meet <span style={{ color: '#C9956C' }}>◉</span> mario
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '13px',
            color: '#888',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            MediBalans Precision Medicine
          </div>
        </div>

        {step === 'sent' ? (
          // ── Sent state ───────────────────────────────────────────────────
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✉️</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              color: '#1a1a1a',
              marginBottom: '12px',
            }}>Check your inbox</div>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
              We sent a secure login link to <strong>{email}</strong>.
              No password needed — just click the link.
            </p>
            <button
              onClick={() => { setStep('email'); setEmail('') }}
              style={{ marginTop: '24px', color: '#C9956C', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          // ── Email entry ──────────────────────────────────────────────────
          <>
            <p style={{ textAlign: 'center', color: '#555', fontSize: '15px', marginBottom: '28px', lineHeight: '1.5' }}>
              Your health data stays in the EU.{' '}
              <span style={{ color: '#888' }}>Encrypted. GDPR compliant.</span>
            </p>

            {/* Email input */}
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && (passkeySupported ? handlePasskey() : handleMagicLink())}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1.5px solid #E5DDD3',
                fontSize: '16px',
                background: '#FAFAF8',
                color: '#1a1a1a',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '16px',
                transition: 'border-color 0.2s',
              }}
            />

            {/* Passkey button — primary if supported */}
            {passkeySupported && (
              <button
                onClick={handlePasskey}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  background: loading ? '#d4b99a' : '#C9956C',
                  color: '#fff',
                  border: 'none',
                  fontSize: '16px',
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {/iPhone|iPad|Mac/.test(navigator.userAgent) ? '󰢷' : '🪪'}
                </span>
                {loading ? 'Authenticating…' : 'Continue with Face ID / Fingerprint'}
              </button>
            )}

            {/* Apple Sign In */}
            <button
              onClick={handleApple}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: '#000',
                color: '#fff',
                border: 'none',
                fontSize: '15px',
                fontFamily: "'Lato', sans-serif",
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5DDD3' }} />
              <span style={{ color: '#aaa', fontSize: '13px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#E5DDD3' }} />
            </div>

            {/* Magic link */}
            <button
              onClick={handleMagicLink}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: 'transparent',
                color: '#C9956C',
                border: '1.5px solid #C9956C',
                fontSize: '15px',
                fontFamily: "'Lato', sans-serif",
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending…' : '✉️  Send login link to email'}
            </button>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px 14px',
                background: '#FDF0EC',
                borderRadius: '8px',
                color: '#B5460F',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            {/* Security note */}
            <p style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#aaa',
              lineHeight: '1.5',
            }}>
              🔒 No password stored. Your biometric never leaves your device.
              <br />Medical data encrypted at rest in Frankfurt, EU.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
