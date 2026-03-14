'use client'
import { useState, useEffect, useRef } from 'react'

const T = {
  w:  '#F7F4F0', w1: '#F1EDE7', w2: '#E8E2DA', w3: '#D8D0C4',
  w4: '#B8ACA0', w5: '#8A7E72', w6: '#4A4038', w7: '#1C1510',
  rg: '#C4887A', rg2: '#9A6255', rg3: '#DEB0A4',
}
const fonts = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', Arial, sans-serif",
  mono:  "'IBM Plex Mono', 'SF Mono', 'Fira Mono', 'Courier New', monospace",
}

const SCRIPTS = {
  en: [
    'Your body is the most sophisticated system ever built. Four hundred trillion cells. Five hundred million years of evolution. A molecular intelligence that knows exactly what it needs — and has been trying to tell you.',
    'But somewhere along the way, we stopped listening. We replaced real food with processed calories. We silenced the signals with medication. And we accepted fatigue, brain fog, and inflammation as normal. They are not normal. They are your biology asking for help.',
    'Meet Mario exists because I believe medicine should translate, not guess. Every person who walks through our doors — or opens this app — deserves to know what their cells are actually saying. Not what a blood test approximates. What the cell itself contains, what the immune system is reacting to, and what the DNA has been shaping since before you were born.',
    'This platform connects those layers for the first time. Your immune reactivity. Your cellular nutrition. Your genetic architecture. And from that data, a protocol — precise, personalised, built for your biology alone.',
    'We have done this for twenty-five thousand patients. And we have seen what happens when the immune system is finally heard. Energy returns. Clarity returns. The body remembers what it was designed to do.',
    'This is not a diet app. This is not a wellness trend. This is precision medicine — made accessible to everyone, everywhere.',
    'Welcome to Meet Mario. Let us begin.',
  ],
  sv: [
    'Din kropp är det mest sofistikerade systemet som någonsin byggts. Fyrahundra biljoner celler. Femhundra miljoner år av evolution. En molekylär intelligens som vet exakt vad den behöver — och som har försökt berätta det för dig.',
    'Men någonstans längs vägen slutade vi lyssna. Vi ersatte riktig mat med processade kalorier. Vi tystade signalerna med mediciner. Och vi accepterade trötthet, hjärndimma och inflammation som normalt. Det är inte normalt. Det är din biologi som ber om hjälp.',
    'Meet Mario finns för att jag tror att medicin ska översätta, inte gissa. Varje person som kommer till oss — eller öppnar den här appen — förtjänar att veta vad deras celler faktiskt säger. Inte vad ett blodprov uppskattar. Vad cellen själv innehåller, vad immunförsvaret reagerar på, och vad ditt DNA har format sedan innan du föddes.',
    'Den här plattformen kopplar samman dessa lager för första gången. Din immunreaktivitet. Din cellulära näring. Din genetiska arkitektur. Och från dessa data, ett protokoll — precist, personligt, byggt för just din biologi.',
    'Vi har gjort detta för tjugofemtusen patienter. Och vi har sett vad som händer när immunförsvaret äntligen blir hört. Energin återvänder. Klarheten återvänder. Kroppen minns vad den var skapad att göra.',
    'Det här är inte en dietapp. Det här är inte en hälsotrend. Det här är precisionsmedicin — tillgänglig för alla, överallt.',
    'Välkommen till Meet Mario. Låt oss börja.',
  ],
}

const UI = {
  en: { begin: 'Begin Assessment', skip: 'Skip for now' },
  sv: { begin: 'Börja bedömning',  skip: 'Hoppa över'   },
}

export default function WelcomeAvatar({ onComplete, onSkip }) {
  const defaultLang = typeof navigator !== 'undefined' && navigator.language?.startsWith('sv') ? 'sv' : 'en'
  const [lang, setLang]           = useState(defaultLang)
  const [idx, setIdx]             = useState(0)      // current paragraph index
  const [visible, setVisible]     = useState(true)   // controls fade
  const [done, setDone]           = useState(false)
  const timerRef                  = useRef(null)
  const paragraphs                = SCRIPTS[lang]
  const isLast                    = idx === paragraphs.length - 1

  // Advance paragraph every 3 s
  useEffect(() => {
    if (done) return
    timerRef.current = setTimeout(() => {
      if (isLast) {
        setDone(true)
        try { localStorage.setItem('mm_welcome_seen', 'welcome') } catch {}
        return
      }
      // Fade out → advance → fade in
      setVisible(false)
      setTimeout(() => {
        setIdx(i => i + 1)
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearTimeout(timerRef.current)
  }, [idx, done, isLast])

  // When language changes mid-sequence, restart from current idx with new text
  const switchLang = (l) => {
    if (l === lang) return
    setVisible(false)
    setTimeout(() => { setLang(l); setVisible(true) }, 300)
  }

  const handleSkip = () => {
    clearTimeout(timerRef.current)
    try { localStorage.setItem('mm_welcome_seen', 'welcome') } catch {}
    onSkip?.() ?? onComplete?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: T.w7,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* ── Top bar: wordmark + lang toggle + skip ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 24px',
      }}>
        <div style={{ fontFamily: fonts.serif, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
          meet mario
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: 2 }}>
            {['en','sv'].map(l => (
              <button key={l} onClick={() => switchLang(l)} style={{
                background: lang === l ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none', borderRadius: 4, padding: '4px 10px',
                cursor: 'pointer', fontFamily: fonts.mono, fontSize: 10,
                color: lang === l ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}>{l}</button>
            ))}
          </div>

          {/* Skip */}
          {!done && (
            <button onClick={handleSkip} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
              fontFamily: fonts.mono, fontSize: 9,
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em',
            }}>{UI[lang].skip.toUpperCase()}</button>
          )}
        </div>
      </div>

      {/* ── M circle ── */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, ${T.rg3}, ${T.rg2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 48,
        boxShadow: `0 0 48px rgba(196,136,122,0.25)`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 28, fontFamily: fonts.serif, fontWeight: 400, color: '#fff' }}>M</span>
      </div>

      {/* ── Paragraph area ── */}
      <div style={{ maxWidth: 560, padding: '0 32px', textAlign: 'center', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!done ? (
          <p style={{
            fontFamily: fonts.sans, fontSize: 16, fontWeight: 300,
            color: 'rgba(255,255,255,0.82)', lineHeight: 1.75,
            margin: 0,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}>
            {paragraphs[idx]}
          </p>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            animation: 'wfadeIn 0.6s ease both',
          }}>
            <p style={{
              fontFamily: fonts.serif, fontSize: 22, fontWeight: 400,
              color: 'rgba(255,255,255,0.92)', lineHeight: 1.5,
              margin: 0, textAlign: 'center',
            }}>
              {paragraphs[paragraphs.length - 1]}
            </p>
            <button onClick={() => onComplete?.()} style={{
              background: `linear-gradient(140deg, ${T.rg3}, ${T.rg}, ${T.rg2})`,
              border: 'none', borderRadius: 10, padding: '14px 36px',
              cursor: 'pointer', fontFamily: fonts.sans, fontSize: 14,
              fontWeight: 500, color: '#fff', letterSpacing: '0.04em',
              boxShadow: `0 4px 24px rgba(196,136,122,0.35)`,
              marginTop: 8,
            }}>{UI[lang].begin}</button>
          </div>
        )}
      </div>

      {/* ── Progress dots ── */}
      {!done && (
        <div style={{ position: 'absolute', bottom: 32, display: 'flex', gap: 6 }}>
          {paragraphs.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 18 : 5, height: 5, borderRadius: 3,
              background: i === idx ? T.rg : 'rgba(255,255,255,0.18)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes wfadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
