'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  w:    "#F7F4F0", w1: "#F1EDE7", w2: "#E8E2DA", w3: "#D8D0C4",
  w4:   "#B8ACA0", w5: "#8A7E72", w6: "#4A4038", w7: "#1C1510",
  rg:   "#C4887A", rg2: "#9A6255", rg3: "#DEB0A4", rgBg: "#F8F0EE",
  err:  "#B85040", ok: "#6A9060", warn: "#B88040",
}
const fonts = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans:  "-apple-system, 'Helvetica Neue', 'Arial', sans-serif",
  mono:  "'SF Mono', 'Fira Mono', 'Courier New', monospace",
}

export default function AdminPage() {
  const [patients, setPatients]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState({
    email: '', full_name: '', date_of_birth: '',
    sex: 'female', hormonal_status: '',
    severe: '', moderate: '', mild: '',
    candida_level: '', whey_level: '',
    test_date: '', lab_id: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addResult, setAddResult]   = useState(null)
  const supabase = createClient()

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .select(`
        id, full_name, date_of_birth, created_at,
        alcat_results(test_date, candida_level, whey_level),
        reaction_diary(id),
        chat_messages(id)
      `)
      .order('created_at', { ascending: false })

    if (data) setPatients(data)
    setLoading(false)
  }

  async function addPatient() {
    if (!form.email || !form.full_name) return
    setAddLoading(true)
    setAddResult(null)

    try {
      // 1. Create auth user via admin API (requires service role key — do this via API route in production)
      const res = await fetch('/api/admin/add-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()

      if (result.error) {
        setAddResult({ ok: false, msg: result.error })
      } else {
        setAddResult({ ok: true, msg: `${form.full_name} added. Login link sent to ${form.email}.` })
        setForm({ email: '', full_name: '', date_of_birth: '', sex: 'female',
          hormonal_status: '', severe: '', moderate: '', mild: '',
          candida_level: '', whey_level: '', test_date: '', lab_id: '' })
        setShowAdd(false)
        loadPatients()
      }
    } catch {
      setAddResult({ ok: false, msg: 'Network error. Try again.' })
    }

    setAddLoading(false)
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
        letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{
          display: 'block', width: '100%', padding: '10px 0',
          border: 'none', borderBottom: `1.5px solid ${T.w3}`,
          background: 'transparent', fontSize: 13, color: T.w7,
          outline: 'none', fontFamily: fonts.sans,
        }}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: T.w, fontFamily: fonts.sans }}>
      {/* Nav */}
      <div style={{
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 44px', background: 'rgba(247,244,240,0.95)',
        borderBottom: `1px solid ${T.w3}`, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%',
            background: `linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,
            boxShadow: `0 2px 8px rgba(160,100,85,0.40)` }}/>
          <span style={{ fontFamily: fonts.serif, fontSize: 18, color: T.w7 }}>meet mario</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.rg2,
            border: `1px solid ${T.rg}30`, borderRadius: 4, padding: '2px 8px',
            letterSpacing: '0.14em', background: T.rgBg }}>CLINIC ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, color: T.w4 }}>
            {patients.length} patients
          </span>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{
              background: showAdd ? T.rgBg : T.rg,
              border: `1px solid ${T.rg}`,
              borderRadius: 8, padding: '7px 18px',
              cursor: 'pointer', fontSize: 12, fontFamily: fonts.sans,
              color: showAdd ? T.rg2 : '#fff', fontWeight: 500,
            }}
          >
            {showAdd ? 'Cancel' : '+ Add patient'}
          </button>
        </div>
      </div>

      <div style={{ padding: '36px 44px', maxWidth: 960, margin: '0 auto' }}>

        {/* Add patient form */}
        {showAdd && (
          <div style={{
            background: T.w1, border: `1px solid ${T.rg}30`,
            borderRadius: 16, padding: '28px 32px', marginBottom: 32,
            boxShadow: `0 4px 20px rgba(196,136,122,0.10)`,
          }}>
            <div style={{ fontFamily: fonts.serif, fontSize: 22, color: T.w7,
              marginBottom: 24, fontWeight: 400 }}>
              New patient
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              {field('Full name', 'full_name', 'text', 'Christina Wohltahrt')}
              {field('Email', 'email', 'email', 'patient@email.com')}
              {field('Date of birth', 'date_of_birth', 'date')}
              {field('Lab ID', 'lab_id', 'text', '539273')}
              {field('Test date', 'test_date', 'date')}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
                  letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>Sex</div>
                <select
                  value={form.sex}
                  onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}
                  style={{ width: '100%', padding: '10px 0', border: 'none',
                    borderBottom: `1.5px solid ${T.w3}`, background: 'transparent',
                    fontSize: 13, color: T.w7, outline: 'none', fontFamily: fonts.sans }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              {field('Hormonal status', 'hormonal_status', 'text', 'post-menopausal')}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
                  letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Candida marker
                </div>
                <select
                  value={form.candida_level}
                  onChange={e => setForm(p => ({ ...p, candida_level: e.target.value }))}
                  style={{ width: '100%', padding: '10px 0', border: 'none',
                    borderBottom: `1.5px solid ${T.w3}`, background: 'transparent',
                    fontSize: 13, color: T.w7, outline: 'none', fontFamily: fonts.sans }}
                >
                  <option value="">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
                  letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Whey marker
                </div>
                <select
                  value={form.whey_level}
                  onChange={e => setForm(p => ({ ...p, whey_level: e.target.value }))}
                  style={{ width: '100%', padding: '10px 0', border: 'none',
                    borderBottom: `1.5px solid ${T.w3}`, background: 'transparent',
                    fontSize: 13, color: T.w7, outline: 'none', fontFamily: fonts.sans }}
                >
                  <option value="">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            {/* ALCAT lists */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.err,
                letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
                Severe reactors (comma-separated)
              </div>
              <textarea
                value={form.severe}
                onChange={e => setForm(p => ({ ...p, severe: e.target.value }))}
                placeholder="BEEF, COFFEE, GARLIC, ONION, TOMATO…"
                rows={2}
                style={{ width: '100%', padding: '10px 12px',
                  border: `1px solid ${T.w3}`, borderRadius: 7,
                  background: T.w, fontSize: 12, color: T.w7,
                  outline: 'none', fontFamily: fonts.mono, resize: 'vertical',
                  marginBottom: 12 }}
              />
              <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.warn,
                letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
                Moderate reactors
              </div>
              <textarea
                value={form.moderate}
                onChange={e => setForm(p => ({ ...p, moderate: e.target.value }))}
                placeholder="APPLE, CHICKEN, CORN, WHEAT…"
                rows={2}
                style={{ width: '100%', padding: '10px 12px',
                  border: `1px solid ${T.w3}`, borderRadius: 7,
                  background: T.w, fontSize: 12, color: T.w7,
                  outline: 'none', fontFamily: fonts.mono, resize: 'vertical',
                  marginBottom: 12 }}
              />
              <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.ok,
                letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 6 }}>
                Mild reactors
              </div>
              <textarea
                value={form.mild}
                onChange={e => setForm(p => ({ ...p, mild: e.target.value }))}
                placeholder="ALMOND, AVOCADO, CARROT…"
                rows={2}
                style={{ width: '100%', padding: '10px 12px',
                  border: `1px solid ${T.w3}`, borderRadius: 7,
                  background: T.w, fontSize: 12, color: T.w7,
                  outline: 'none', fontFamily: fonts.mono, resize: 'vertical' }}
              />
            </div>

            {addResult && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: addResult.ok ? `${T.ok}12` : `${T.err}12`,
                border: `1px solid ${addResult.ok ? T.ok : T.err}35`,
                borderRadius: 8, fontSize: 12,
                color: addResult.ok ? T.ok : T.err,
                fontFamily: fonts.sans,
              }}>
                {addResult.msg}
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <button
                onClick={addPatient}
                disabled={addLoading || !form.email || !form.full_name}
                style={{
                  background: addLoading ? T.w2 : `linear-gradient(140deg,${T.rg3},${T.rg},${T.rg2})`,
                  border: 'none', borderRadius: 10, padding: '13px 32px',
                  cursor: addLoading ? 'not-allowed' : 'pointer',
                  color: addLoading ? T.w4 : '#fff',
                  fontSize: 13, fontWeight: 500, fontFamily: fonts.sans,
                  letterSpacing: '0.06em',
                }}
              >
                {addLoading ? 'Adding patient…' : 'Add patient & send login link →'}
              </button>
            </div>
          </div>
        )}

        {/* Patient list */}
        <div style={{ fontFamily: fonts.mono, fontSize: 8.5, color: T.w4,
          letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 16 }}>
          All patients
        </div>

        {loading ? (
          <div style={{ fontSize: 13, color: T.w4, fontFamily: fonts.sans }}>Loading…</div>
        ) : patients.length === 0 ? (
          <div style={{ fontSize: 13, color: T.w5, fontFamily: fonts.sans,
            padding: '32px 0', textAlign: 'center' }}>
            No patients yet. Add your first patient above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {patients.map(p => {
              const alcat = p.alcat_results?.[0]
              const reactions = p.reaction_diary?.length ?? 0
              const chats = p.chat_messages?.length ?? 0
              const hasCandida = alcat?.candida_level
              const hasWhey = alcat?.whey_level

              return (
                <div key={p.id} style={{
                  background: T.w, border: `1px solid ${T.w3}`,
                  borderRadius: 10, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 20,
                  boxShadow: '0 1px 3px rgba(100,80,60,0.04)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: T.w7, fontWeight: 500,
                      fontFamily: fonts.sans, marginBottom: 4 }}>
                      {p.full_name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {alcat?.test_date && (
                        <span style={{ fontFamily: fonts.mono, fontSize: 9,
                          color: T.w4, letterSpacing: '0.1em' }}>
                          ALCAT {alcat.test_date}
                        </span>
                      )}
                      {hasCandida && (
                        <span style={{ fontFamily: fonts.mono, fontSize: 9,
                          color: '#906080', border: '1px solid #90608030',
                          borderRadius: 3, padding: '1px 6px' }}>
                          Candida {hasCandida}
                        </span>
                      )}
                      {hasWhey && (
                        <span style={{ fontFamily: fonts.mono, fontSize: 9,
                          color: '#5080A8', border: '1px solid #5080A830',
                          borderRadius: 3, padding: '1px 6px' }}>
                          Whey {hasWhey}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 18,
                        color: reactions > 0 ? T.warn : T.w4 }}>{reactions}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 7.5,
                        color: T.w4, letterSpacing: '0.12em' }}>REACTIONS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: fonts.serif, fontSize: 18,
                        color: chats > 0 ? T.rg : T.w4 }}>{chats}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 7.5,
                        color: T.w4, letterSpacing: '0.12em' }}>MESSAGES</div>
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 8,
                      color: T.w4, letterSpacing: '0.08em' }}>
                      {new Date(p.created_at).toLocaleDateString('en-SE')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } button:hover { opacity: 0.88; }`}</style>
    </div>
  )
}
