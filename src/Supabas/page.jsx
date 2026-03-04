'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

// ─── Design tokens (matches MeetMario.jsx) ───────────────────────────────────
const T = {
  w:    "#F7F4F0",
  w1:   "#F1EDE7",
  w3:   "#D8D0C4",
  w4:   "#B8ACA0",
  w5:   "#8A7E72",
  w6:   "#4A4038",
  w7:   "#1C1510",
  rg:   "#C4887A",
  rg2:  "#9A6255",
  rg3:  "#DEB0A4",
  rgBg: "#F8F0EE",
  err:  "#B85040",
  ok:   "#6A9060",
}

const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', 'Arial', sans-serif",
  mono:  "'SF Mono', 'Fira Mono', 'Courier New', monospace",
}

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Something went wrong. Please try again.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(155deg,#FDF8F3 0%,#F8EFE8 35%,#F4EAF0 70%,#F1EEF8 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.sans,
      padding: 24,
    }}>
      {/* Card */}
      <div style={{
        background: T.w,
        border: `1px solid ${T.w3}`,
        borderRadius: 20,
        padding: '52px 48px 44px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 64px rgba(28,20,16,0.09), 0 2px 8px rgba(28,20,16,0.05)',
      }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: `linear-gradient(140deg, ${T.rg3}, ${T.rg}, ${T.rg2})`,
            boxShadow: `0 2px 8px rgba(160,100,85,0.40)`,
          }}/>
          <span style={{
            fontFamily: fonts.serif, fontSize: 20, fontWeight: 400,
            color: T.w7, letterSpacing: '0.01em',
          }}>
            meet mario
          </span>
          <span style={{
            marginLeft: 'auto', fontFamily: fonts.mono, fontSize: 8,
            color: T.w4, border: `1px solid ${T.w3}`, borderRadius: 3,
            padding: '2px 7px', letterSpacing: '0.12em',
          }}>
            MEDIBALANS
          </span>
        </div>

        {sent ? (
          // ─── Sent state ──────────────────────────────────────────────────
          <div>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `${T.ok}15`, border: `1px solid ${T.ok}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, marginBottom: 20,
            }}>
              ✓
            </div>
            <div style={{
              fontFamily: fonts.serif, fontSize: 22, color: T.w7,
              marginBottom: 12, fontWeight: 400,
            }}>
              Check your email
            </div>
            <div style={{
              fontSize: 13, color: T.w5, lineHeight: 1.8,
              fontWeight: 300, marginBottom: 28,
            }}>
              A secure login link has been sent to{' '}
              <span style={{ color: T.rg2, fontWeight: 500 }}>{email}</span>.
              Click the link to access your protocol — no password needed.
            </div>
            <div style={{
              background: T.w1, border: `1px solid ${T.w3}`,
              borderRadius: 9, padding: '12px 14px',
              fontFamily: fonts.mono, fontSize: 9,
              color: T.w4, letterSpacing: '0.12em', lineHeight: 1.8,
            }}>
              LINK EXPIRES IN 1 HOUR · GDPR COMPLIANT
            </div>
          </div>
        ) : (
          // ─── Login form ──────────────────────────────────────────────────
          <div>
            <div style={{
              fontFamily: fonts.serif, fontSize: 26, color: T.w7,
              fontWeight: 400, marginBottom: 8, lineHeight: 1.2,
            }}>
              Your protocol<br/>
              <em style={{ fontStyle: 'italic', color: T.rg2 }}>awaits</em>
            </div>
            <div style={{
              fontSize: 13, color: T.w5, fontWeight: 300,
              marginBottom: 36, lineHeight: 1.7,
            }}>
              Enter the email address you registered with MediBalans.
            </div>

            <div style={{ marginBottom: 6, fontFamily: fonts.mono, fontSize: 8.5,
              color: T.w4, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
              Email address
            </div>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              autoFocus
              style={{
                display: 'block', width: '100%',
                padding: '12px 0',
                border: 'none',
                borderBottom: `1.5px solid ${error ? T.err : T.w3}`,
                background: 'transparent',
                fontSize: 14, color: T.w7, outline: 'none',
                fontFamily: fonts.sans, letterSpacing: '-0.01em',
                marginBottom: error ? 8 : 28,
                transition: 'border-color .18s',
              }}
            />

            {error && (
              <div style={{
                fontSize: 11, color: T.err, fontFamily: fonts.sans,
                marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: 12,
                border: 'none',
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                background: loading || !email.trim()
                  ? T.w2
                  : `linear-gradient(140deg, ${T.rg3} 0%, ${T.rg} 22%, ${T.rg2} 52%, #B88070 72%, ${T.rg3} 92%, ${T.rg} 100%)`,
                backgroundSize: '200% auto',
                color: loading || !email.trim() ? T.w4 : 'rgba(255,255,255,0.97)',
                fontSize: 13, fontWeight: 500,
                fontFamily: fonts.sans, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: loading || !email.trim()
                  ? 'none'
                  : '0 4px 20px rgba(154,98,85,0.28)',
                transition: 'all .2s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* chamfer highlight */}
              <div style={{
                position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.28) 30%,rgba(255,255,255,0.38) 50%,rgba(255,255,255,0.28) 70%,transparent)',
              }}/>
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading ? 'Sending…' : 'Send login link →'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 24, fontFamily: fonts.mono, fontSize: 8,
        color: T.w4, letterSpacing: '0.12em', textAlign: 'center',
      }}>
        MEDIBALANS AB · KARLAVÄGEN 89, STOCKHOLM · GDPR COMPLIANT · EU-HOSTED
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: ${T.w4}; font-style: italic; font-weight: 300; }
      `}</style>
    </div>
  )
}
