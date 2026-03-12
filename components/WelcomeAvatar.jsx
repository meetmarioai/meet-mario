// ─── components/WelcomeAvatar.jsx ────────────────────────────────────────────
// Auto-playing welcome video for first-time visitors.
// Shows Mario's avatar delivering the opening statement before the user
// has any data. This is the first impression — the moment they decide to stay.
//
// Plays once per user (tracked via localStorage flag).
// Can be replayed from settings or a "Watch intro" link.
//
// Usage in page.jsx:
//   {showWelcome && <WelcomeAvatar patient={patient} onComplete={() => setShowWelcome(false)} />}
//
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { getWelcomeScript } from '../lib/welcomeScripts'

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  w:    '#F7F4F0', w1: '#F1EDE7', w2: '#E8E2DA', w3: '#D8D0C4',
  w4:   '#B8ACA0', w5: '#8A7E72', w6: '#4A4038', w7: '#1C1510',
  rg:   '#C4887A', rg2: '#9A6255', rg3: '#DEB0A4', rgBg: '#F8F0EE',
  err:  '#B85040', ok: '#6A9060',
}
const fonts = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', Arial, sans-serif",
  mono:  "'IBM Plex Mono', 'SF Mono', 'Fira Mono', 'Courier New', monospace",
}

const AVATAR_ID = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'default'

export default function WelcomeAvatar({ patient, onComplete, onSkip }) {
  const [phase, setPhase]       = useState('ready')  // ready | connecting | speaking | complete
  const [progress, setProgress] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const [currentParagraph, setCurrentParagraph] = useState(0)
  const videoRef   = useRef(null)
  const avatarRef  = useRef(null)

  const { id: scriptId, script } = getWelcomeScript(patient)
  const paragraphs = script.split('\n').map(p => p.trim()).filter(p => p.length > 0)

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        try { avatarRef.current.stopAvatar() } catch {}
      }
    }
  }, [])

  // ── Start the avatar ───────────────────────────────────────────────────
  const startVideo = useCallback(async () => {
    setPhase('connecting')
    setProgress('Connecting…')

    try {
      // Get token
      const tokenRes = await fetch('/api/avatar/token', { method: 'POST' })
      if (!tokenRes.ok) throw new Error('Auth failed')
      const { token } = await tokenRes.json()

      // Load SDK
      const { default: StreamingAvatar, TaskType, TaskMode } = await import(
        '@heygen/streaming-avatar'
      )

      const avatar = new StreamingAvatar({ token })
      avatarRef.current = avatar

      avatar.on('stream_ready', (event) => {
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail
          videoRef.current.play().catch(() => {})
        }
      })

      avatar.on('avatar_start_talking', () => {
        setPhase('speaking')
        setProgress('')
      })

      avatar.on('avatar_stop_talking', () => {
        // Check if this was the last paragraph
        setCurrentParagraph(prev => {
          if (prev >= paragraphs.length - 1) {
            setPhase('complete')
            // Mark as seen
            try { localStorage.setItem('mm_welcome_seen', scriptId) } catch {}
          }
          return prev + 1
        })
      })

      // Create session
      setProgress('Dr. Mario is joining…')
      await avatar.createStartAvatar({
        avatarName: AVATAR_ID,
        quality: 'high',
        voice: {
          voiceId: process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || undefined,
          rate: 0.92,
        },
        language: 'en',
      })

      // Wait for stream to stabilise
      await new Promise(r => setTimeout(r, 1500))

      // Deliver paragraphs
      for (let i = 0; i < paragraphs.length; i++) {
        setCurrentParagraph(i)
        await avatar.speak({
          text: paragraphs[i],
          task_type: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        })
        if (i < paragraphs.length - 1) {
          await new Promise(r => setTimeout(r, 500))
        }
      }

      setPhase('complete')
      try { localStorage.setItem('mm_welcome_seen', scriptId) } catch {}

    } catch (err) {
      console.error('[WelcomeAvatar] Error:', err)
      // On error, show text fallback — don't block the user
      setPhase('complete')
    }
  }, [paragraphs, scriptId])

  // ── Skip handler ───────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (avatarRef.current) {
      try { avatarRef.current.stopAvatar() } catch {}
    }
    try { localStorage.setItem('mm_welcome_seen', scriptId) } catch {}
    onSkip?.() || onComplete?.()
  }, [scriptId, onSkip, onComplete])

  // ── RENDER ─────────────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: T.w7,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>

      {/* ── READY STATE: Cinematic intro screen ──────────────────────── */}
      {phase === 'ready' && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', maxWidth: 520, padding: '0 28px',
          textAlign: 'center',
          animation: 'welcomeFadeIn 1s ease both',
        }}>
          {/* Wordmark */}
          <div style={{
            fontFamily: fonts.serif, fontSize: 14, color: T.w4,
            letterSpacing: '0.08em', marginBottom: 48, opacity: 0.7,
          }}>meet mario</div>

          {/* Avatar circle */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${T.rg3}, ${T.rg2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 36,
            boxShadow: `0 0 60px rgba(196, 136, 122, 0.3)`,
          }}>
            <span style={{
              fontSize: 36, fontFamily: fonts.serif,
              fontWeight: 400, color: '#fff',
            }}>M</span>
          </div>

          <h1 style={{
            fontFamily: fonts.serif, fontSize: 28, fontWeight: 400,
            color: T.w1, lineHeight: 1.3, marginBottom: 12,
          }}>
            Your body has been speaking.
          </h1>

          <p style={{
            fontFamily: fonts.sans, fontSize: 15, fontWeight: 300,
            color: T.w4, lineHeight: 1.7, marginBottom: 40,
          }}>
            I would like to tell you what this platform does — and what it
            can do for you. It takes about ninety seconds.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
            <button onClick={startVideo} style={{
              background: `linear-gradient(140deg, ${T.rg3}, ${T.rg}, ${T.rg2})`,
              border: 'none', borderRadius: 10, padding: '14px 32px',
              cursor: 'pointer', fontFamily: fonts.sans, fontSize: 14,
              fontWeight: 500, color: '#fff', letterSpacing: '0.04em',
              boxShadow: `0 4px 24px rgba(196, 136, 122, 0.35)`,
            }}>Watch Introduction</button>

            <button onClick={handleSkip} style={{
              background: 'transparent', border: `1px solid ${T.w5}40`,
              borderRadius: 10, padding: '12px 32px',
              cursor: 'pointer', fontFamily: fonts.sans, fontSize: 13,
              fontWeight: 300, color: T.w4,
            }}>Skip for now</button>
          </div>

          <div style={{
            fontFamily: fonts.mono, fontSize: 8, color: T.w5,
            letterSpacing: '0.16em', marginTop: 36, opacity: 0.5,
          }}>PRECISION MEDICINE · STOCKHOLM</div>
        </div>
      )}

      {/* ── CONNECTING: Minimal loading ───────────────────────────────── */}
      {phase === 'connecting' && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${T.rg3}, ${T.rg})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'avatarPulse 2s ease-in-out infinite',
            marginBottom: 24,
          }}>
            <span style={{
              fontSize: 28, fontFamily: fonts.serif, color: '#fff',
            }}>M</span>
          </div>
          <div style={{
            fontFamily: fonts.sans, fontSize: 15, color: T.w3,
            fontWeight: 300, marginBottom: 12,
          }}>{progress}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%', background: T.rg,
                animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── SPEAKING: Full-screen video ───────────────────────────────── */}
      {(phase === 'speaking' || phase === 'complete') && (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Video — full screen */}
          <div style={{
            flex: 1, position: 'relative', background: '#0a0806',
            overflow: 'hidden',
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Top bar — wordmark + skip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 24px',
              background: 'linear-gradient(to bottom, rgba(10,8,6,0.6), transparent)',
            }}>
              <div style={{
                fontFamily: fonts.serif, fontSize: 13, color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.06em',
              }}>meet mario</div>

              {phase === 'speaking' && (
                <button onClick={handleSkip} style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6, padding: '5px 14px',
                  cursor: 'pointer', fontFamily: fonts.mono,
                  fontSize: 9, color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.1em',
                }}>SKIP</button>
              )}
            </div>

            {/* Bottom bar — live subtitle of current paragraph */}
            {phase === 'speaking' && currentParagraph < paragraphs.length && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(10,8,6,0.8), transparent)',
                padding: '40px 32px 24px',
              }}>
                <div style={{
                  fontFamily: fonts.sans, fontSize: 14, fontWeight: 300,
                  color: 'rgba(255,255,255,0.88)', lineHeight: 1.7,
                  maxWidth: 560, textAlign: 'center', margin: '0 auto',
                  animation: 'subtitleFade 0.4s ease both',
                }}>
                  {paragraphs[currentParagraph]}
                </div>
              </div>
            )}

            {/* Complete overlay */}
            {phase === 'complete' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10, 8, 6, 0.75)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 20,
                animation: 'welcomeFadeIn 0.6s ease both',
              }}>
                <div style={{
                  fontFamily: fonts.serif, fontSize: 24, color: '#fff',
                  fontWeight: 400, textAlign: 'center',
                }}>Let us begin.</div>

                <button onClick={() => onComplete?.()} style={{
                  background: `linear-gradient(140deg, ${T.rg3}, ${T.rg}, ${T.rg2})`,
                  border: 'none', borderRadius: 10, padding: '14px 36px',
                  cursor: 'pointer', fontFamily: fonts.sans, fontSize: 14,
                  fontWeight: 500, color: '#fff', letterSpacing: '0.04em',
                  boxShadow: `0 4px 24px rgba(196, 136, 122, 0.35)`,
                }}>Begin Assessment</button>

                <button onClick={() => setShowTranscript(!showTranscript)} style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: fonts.mono,
                  fontSize: 9, color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.12em', marginTop: 8,
                }}>
                  {showTranscript ? 'HIDE' : 'READ'} TRANSCRIPT
                </button>

                {showTranscript && (
                  <div style={{
                    maxWidth: 520, maxHeight: 200, overflowY: 'auto',
                    padding: '16px 24px', marginTop: 8,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      fontFamily: fonts.sans, fontSize: 12.5, color: 'rgba(255,255,255,0.6)',
                      fontWeight: 300, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                    }}>{script}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Animations ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes avatarPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes subtitleFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
