// ─── components/AvatarConsult.jsx ────────────────────────────────────────────
// Meet Mario — AI Avatar Video Consultation
//
// Renders a video window where Dr. Mario's digital twin speaks directly
// to the patient about their results, protocol, or genomics.
//
// DEPENDENCIES:
//   npm install @heygen/streaming-avatar
//
// ENV REQUIRED (in .env.local / Vercel):
//   HEYGEN_API_KEY      — HeyGen API key
//   ANTHROPIC_API_KEY   — already configured
//
// SETUP:
//   1. Film 2 min of yourself at labs.heygen.com/interactive-avatar
//   2. Get your custom Avatar ID
//   3. Set NEXT_PUBLIC_HEYGEN_AVATAR_ID in .env.local
//      (or use a stock avatar ID for testing)
//
// INTEGRATION:
//   Import into page.jsx and render inside the "Ask Mario" tab or as
//   a standalone overlay triggered by "Explain My Results" button.
//
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ── Design tokens (must match page.jsx) ──────────────────────────────────────
const T = {
  w:    '#F7F4F0', w1: '#F1EDE7', w2: '#E8E2DA', w3: '#D8D0C4',
  w4:   '#B8ACA0', w5: '#8A7E72', w6: '#4A4038', w7: '#1C1510',
  rg:   '#C4887A', rg2: '#9A6255', rg3: '#DEB0A4', rgBg: '#F8F0EE',
  err:  '#B85040', ok: '#6A9060', warn: '#B88040',
}
const fonts = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', Arial, sans-serif",
  mono:  "'IBM Plex Mono', 'SF Mono', 'Fira Mono', 'Courier New', monospace",
}

// ── Avatar config ────────────────────────────────────────────────────────────
// Replace with your custom avatar ID after filming at labs.heygen.com
const AVATAR_ID = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'default'

// ── Consultation modes ───────────────────────────────────────────────────────
const MODES = [
  {
    id: 'overview',
    label: 'Results Overview',
    desc: 'Key findings from your ALCAT and lab data',
    icon: '◉',
  },
  {
    id: 'protocol',
    label: '21-Day Protocol',
    desc: 'What to eat, why, and what to expect',
    icon: '↻',
  },
  {
    id: 'genomics',
    label: 'Genomic Insights',
    desc: 'What your DNA variants mean for you',
    icon: '⧖',
  },
]

// ── State machine ────────────────────────────────────────────────────────────
// idle → generating → connecting → speaking → complete
//   ↓                                   ↓
// error                              error

export default function AvatarConsult({ patient, onClose }) {
  const [phase, setPhase]       = useState('idle')       // idle | generating | connecting | speaking | complete | error
  const [mode, setMode]         = useState(null)          // overview | protocol | genomics
  const [script, setScript]     = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState('')
  const videoRef                = useRef(null)
  const avatarRef               = useRef(null)
  const sessionRef              = useRef(null)

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        try { avatarRef.current.stopAvatar() } catch {}
      }
    }
  }, [])

  // ── Main flow ────────────────────────────────────────────────────────────
  const startConsultation = useCallback(async (selectedMode) => {
    setMode(selectedMode)
    setPhase('generating')
    setProgress('Preparing your personalised consultation…')
    setErrorMsg('')

    try {
      // ── Step 1: Generate the spoken script via Claude ────────────────
      setProgress('Writing your personalised explanation…')
      const scriptRes = await fetch('/api/avatar/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, mode: selectedMode }),
      })

      if (!scriptRes.ok) throw new Error('Failed to generate script')
      const { script: generatedScript } = await scriptRes.json()
      setScript(generatedScript)

      // ── Step 2: Get HeyGen session token ────────────────────────────
      setPhase('connecting')
      setProgress('Connecting to Dr. Mario…')

      const tokenRes = await fetch('/api/avatar/token', { method: 'POST' })
      if (!tokenRes.ok) throw new Error('Failed to authenticate with avatar service')
      const { token } = await tokenRes.json()

      // ── Step 3: Initialize streaming avatar ─────────────────────────
      // Dynamic import — only load SDK when needed
      const { default: StreamingAvatar, TaskType, TaskMode } = await import(
        '@heygen/streaming-avatar'
      )

      const avatar = new StreamingAvatar({ token })
      avatarRef.current = avatar

      // ── Event handlers ──────────────────────────────────────────────
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
        setPhase('complete')
      })

      // ── Step 4: Create session ──────────────────────────────────────
      setProgress('Dr. Mario is joining…')
      const session = await avatar.createStartAvatar({
        avatarName: AVATAR_ID,
        quality: 'high',
        voice: {
          voiceId: process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || undefined,
          rate: 0.95,  // Slightly slower for medical content — clarity matters
        },
        language: patient.language === 'sv' ? 'sv' : 'en',
      })
      sessionRef.current = session

      // ── Step 5: Send the script to avatar ───────────────────────────
      // Small delay to let the stream stabilise
      await new Promise(r => setTimeout(r, 1500))

      // Split into paragraphs for more natural delivery with pauses
      const paragraphs = generatedScript
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      for (let i = 0; i < paragraphs.length; i++) {
        await avatar.speak({
          text: paragraphs[i],
          task_type: TaskType.REPEAT,
          taskMode: i === paragraphs.length - 1 ? TaskMode.SYNC : TaskMode.ASYNC,
        })
        // Brief pause between paragraphs for natural pacing
        if (i < paragraphs.length - 1) {
          await new Promise(r => setTimeout(r, 400))
        }
      }

    } catch (err) {
      console.error('[AvatarConsult] Error:', err)
      setPhase('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }, [patient])

  // ── Close and cleanup ────────────────────────────────────────────────────
  const handleClose = useCallback(async () => {
    if (avatarRef.current) {
      try { await avatarRef.current.stopAvatar() } catch {}
      avatarRef.current = null
    }
    sessionRef.current = null
    onClose?.()
  }, [onClose])

  // ── Replay ───────────────────────────────────────────────────────────────
  const handleReplay = useCallback(() => {
    setPhase('idle')
    setMode(null)
    setScript('')
    setErrorMsg('')
    if (avatarRef.current) {
      try { avatarRef.current.stopAvatar() } catch {}
      avatarRef.current = null
    }
  }, [])

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(28, 21, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: T.w,
        borderRadius: 16,
        width: '100%',
        maxWidth: 720,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `1px solid ${T.w2}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 35%, ${T.rg}, ${T.rg2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: fonts.serif,
            }}>M</div>
            <div>
              <div style={{
                fontFamily: fonts.serif, fontSize: 15, color: T.w7, fontWeight: 400,
              }}>meet mario</div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 8, color: T.w4,
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>
                {phase === 'speaking' ? 'SPEAKING' :
                 phase === 'connecting' ? 'CONNECTING' :
                 phase === 'generating' ? 'PREPARING' :
                 phase === 'complete' ? 'CONSULTATION COMPLETE' :
                 'VIDEO CONSULTATION'}
              </div>
            </div>
          </div>
          <button onClick={handleClose} style={{
            background: 'none', border: `1px solid ${T.w3}`, borderRadius: 8,
            padding: '6px 14px', cursor: 'pointer',
            fontFamily: fonts.mono, fontSize: 9, color: T.w5,
            letterSpacing: '0.1em',
          }}>CLOSE</button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={{ padding: '0' }}>

          {/* ── IDLE: Mode selection ─────────────────────────────────────── */}
          {phase === 'idle' && (
            <div style={{ padding: '32px 28px 36px' }}>
              <div style={{
                fontFamily: fonts.serif, fontSize: 22, color: T.w7,
                fontWeight: 400, marginBottom: 6, lineHeight: 1.3,
              }}>
                {patient.name ? `${patient.name}, ` : ''}what would you like<br/>
                <em style={{ fontStyle: 'italic', color: T.rg2 }}>me to explain?</em>
              </div>
              <div style={{
                fontFamily: fonts.sans, fontSize: 12.5, color: T.w5,
                fontWeight: 300, marginBottom: 28, lineHeight: 1.6,
              }}>
                I will walk you through your results in a short personalised video.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => startConsultation(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: T.w1, border: `1px solid ${T.w3}`,
                      borderRadius: 10, padding: '16px 20px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = T.rg3
                      e.currentTarget.style.background = T.rgBg
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = T.w3
                      e.currentTarget.style.background = T.w1
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: T.rgBg, border: `1px solid ${T.rg3}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: T.rg2, flexShrink: 0,
                    }}>{m.icon}</div>
                    <div>
                      <div style={{
                        fontFamily: fonts.sans, fontSize: 14, fontWeight: 500,
                        color: T.w7, marginBottom: 2,
                      }}>{m.label}</div>
                      <div style={{
                        fontFamily: fonts.sans, fontSize: 11.5, fontWeight: 300,
                        color: T.w5,
                      }}>{m.desc}</div>
                    </div>
                    <div style={{
                      marginLeft: 'auto', fontFamily: fonts.mono,
                      fontSize: 9, color: T.rg, letterSpacing: '0.1em',
                    }}>~90s</div>
                  </button>
                ))}
              </div>

              <div style={{
                marginTop: 20, fontFamily: fonts.mono,
                fontSize: 8.5, color: T.w4, letterSpacing: '0.12em',
                textAlign: 'center',
              }}>
                POWERED BY HEYGEN · AI AVATAR TECHNOLOGY
              </div>
            </div>
          )}

          {/* ── GENERATING / CONNECTING: Loading states ──────────────────── */}
          {(phase === 'generating' || phase === 'connecting') && (
            <div style={{
              padding: '60px 28px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Animated avatar silhouette */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%, ${T.rg3}, ${T.rg})`,
                marginBottom: 28,
                animation: 'avatarPulse 2s ease-in-out infinite',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: 28, fontFamily: fonts.serif,
                  fontWeight: 400, color: '#fff',
                }}>M</div>
              </div>

              <div style={{
                fontFamily: fonts.serif, fontSize: 18, color: T.w7,
                fontWeight: 400, marginBottom: 8, textAlign: 'center',
              }}>{progress}</div>

              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: T.rg,
                    animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }}/>
                ))}
              </div>

              <div style={{
                fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
                letterSpacing: '0.14em', marginTop: 20, textTransform: 'uppercase',
              }}>
                {phase === 'generating'
                  ? 'ANALYSING YOUR RESULTS · BUILDING PERSONALISED SCRIPT'
                  : 'INITIALISING AVATAR · ESTABLISHING CONNECTION'}
              </div>
            </div>
          )}

          {/* ── SPEAKING: Video window ───────────────────────────────────── */}
          {(phase === 'speaking' || phase === 'complete') && (
            <div>
              {/* Video container */}
              <div style={{
                position: 'relative',
                background: '#0e0c09',
                aspectRatio: '16/9',
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

                {/* Live indicator */}
                {phase === 'speaking' && (
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(14, 12, 9, 0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 6, padding: '5px 10px',
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: T.ok,
                      boxShadow: `0 0 8px ${T.ok}`,
                      animation: 'livePulse 1.5s ease-in-out infinite',
                    }}/>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 8, color: '#fff',
                      letterSpacing: '0.14em',
                    }}>LIVE</span>
                  </div>
                )}

                {/* Patient name overlay */}
                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  background: 'rgba(14, 12, 9, 0.7)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 6, padding: '6px 12px',
                }}>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 8, color: T.rg3,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>
                    DR. MARIO ANTHIS · MEDIBALANS
                  </div>
                  <div style={{
                    fontFamily: fonts.sans, fontSize: 11, color: '#fff',
                    fontWeight: 300, marginTop: 2,
                  }}>
                    {mode === 'overview' ? 'Results Overview' :
                     mode === 'protocol' ? '21-Day Protocol Briefing' :
                     'Genomic Insights'} for {patient.name || 'Patient'}
                  </div>
                </div>

                {/* Complete overlay */}
                {phase === 'complete' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(14, 12, 9, 0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 16,
                  }}>
                    <div style={{
                      fontFamily: fonts.serif, fontSize: 20, color: '#fff',
                      fontWeight: 400,
                    }}>Consultation complete</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleReplay} style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8, padding: '10px 20px',
                        cursor: 'pointer', fontFamily: fonts.sans,
                        fontSize: 12, color: '#fff', fontWeight: 400,
                      }}>Choose another topic</button>
                      <button onClick={handleClose} style={{
                        background: T.rg, border: 'none',
                        borderRadius: 8, padding: '10px 20px',
                        cursor: 'pointer', fontFamily: fonts.sans,
                        fontSize: 12, color: '#fff', fontWeight: 500,
                      }}>Return to dashboard</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transcript (collapsed by default, expandable) */}
              {script && (
                <TranscriptPanel script={script} />
              )}
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {phase === 'error' && (
            <div style={{
              padding: '48px 28px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `${T.err}15`, border: `1px solid ${T.err}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 16,
              }}>!</div>
              <div style={{
                fontFamily: fonts.serif, fontSize: 18, color: T.w7,
                marginBottom: 8,
              }}>Something went wrong</div>
              <div style={{
                fontFamily: fonts.sans, fontSize: 13, color: T.w5,
                fontWeight: 300, marginBottom: 24, maxWidth: 360, lineHeight: 1.6,
              }}>{errorMsg}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleReplay} style={{
                  background: T.rg, border: 'none', borderRadius: 8,
                  padding: '10px 24px', cursor: 'pointer',
                  fontFamily: fonts.sans, fontSize: 13, color: '#fff', fontWeight: 500,
                }}>Try again</button>
                <button onClick={handleClose} style={{
                  background: 'transparent', border: `1px solid ${T.w3}`,
                  borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
                  fontFamily: fonts.sans, fontSize: 13, color: T.w5,
                }}>Close</button>
              </div>

              {/* Fallback: show the script if it was generated */}
              {script && (
                <div style={{
                  marginTop: 28, width: '100%',
                  background: T.w1, border: `1px solid ${T.w3}`,
                  borderRadius: 10, padding: '20px 24px', textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 8.5, color: T.rg2,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    marginBottom: 12,
                  }}>YOUR CONSULTATION (TEXT VERSION)</div>
                  <div style={{
                    fontFamily: fonts.sans, fontSize: 13, color: T.w6,
                    fontWeight: 300, lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  }}>{script}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Animations ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes avatarPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}


// ── Transcript sub-component ─────────────────────────────────────────────────
function TranscriptPanel({ script }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      borderTop: `1px solid ${T.w2}`,
      background: T.w1,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '12px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span style={{
          fontFamily: fonts.mono, fontSize: 9, color: T.w5,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {open ? 'HIDE' : 'VIEW'} TRANSCRIPT
        </span>
        <span style={{
          fontFamily: fonts.mono, fontSize: 11, color: T.w4,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: '0 24px 20px',
          maxHeight: 200, overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: fonts.sans, fontSize: 12.5, color: T.w6,
            fontWeight: 300, lineHeight: 1.8, whiteSpace: 'pre-wrap',
          }}>{script}</div>
        </div>
      )}
    </div>
  )
}
