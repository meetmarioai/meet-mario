'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from './supabase'

// ─── usePatient ───────────────────────────────────────────────────────────────
// Loads the current authenticated patient's profile + ALCAT results.
// Drop-in replacement for the hardcoded P object in MeetMario.jsx
//
// Usage:
//   const { patient, alcat, proteins, setProtein, loading, isStaff } = usePatient()
//
// alcat shape mirrors the old P object:
//   alcat.severe    → string[]
//   alcat.moderate  → string[]
//   alcat.mild      → string[]
//   alcat.candida_level  → 'mild' | 'moderate' | 'severe' | null
//   alcat.whey_level     → 'mild' | 'moderate' | 'severe' | null

export function usePatient() {
  const [patient, setPatient]   = useState(null)
  const [alcat, setAlcat]       = useState(null)
  const [proteins, setProteins] = useState({})
  const [loading, setLoading]   = useState(true)
  const [isStaff, setIsStaff]   = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { setLoading(false); return }

      // Load patient profile, ALCAT results, protein prefs, and staff status in parallel
      const [
        { data: p },
        { data: a },
        { data: prefs },
        { data: staff }
      ] = await Promise.all([
        supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .single(),

        supabase
          .from('alcat_results')
          .select('*')
          .eq('patient_id', user.id)
          .order('test_date', { ascending: false })
          .limit(1)
          .single(),

        supabase
          .from('protein_preferences')
          .select('*')
          .eq('patient_id', user.id),

        supabase
          .from('clinic_staff')
          .select('id')
          .eq('id', user.id)
          .single()
      ])

      setPatient(p)
      setAlcat(a)
      setIsStaff(!!staff)

      // Reconstruct proteins map from DB
      if (prefs) {
        const map = {}
        prefs.forEach(pref => {
          map[`${pref.rotation_day}-${pref.meal_key}`] = pref.selected_protein
        })
        setProteins(map)
      }

      setLoading(false)
    }

    load()
  }, [])

  // ─── setProtein: saves to DB + updates local state ─────────────────────────
  const setProtein = useCallback(async (day, mealKey, protein) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('protein_preferences')
      .upsert({
        patient_id: user.id,
        rotation_day: day,
        meal_key: mealKey,
        selected_protein: protein,
        updated_at: new Date().toISOString()
      }, { onConflict: 'patient_id,rotation_day,meal_key' })

    setProteins(prev => ({ ...prev, [`${day}-${mealKey}`]: protein }))
  }, [supabase])

  return { patient, alcat, proteins, setProtein, loading, isStaff }
}


// ─── useReactionDiary ─────────────────────────────────────────────────────────
// Loads and saves reaction diary entries for the current patient.
//
// Usage:
//   const { diary, logReaction, loading } = useReactionDiary()

export function useReactionDiary() {
  const [diary, setDiary]     = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('reaction_diary')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setDiary(data)
      setLoading(false)
    }
    load()
  }, [])

  const logReaction = useCallback(async (entry) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const row = {
      patient_id:  user.id,
      meal_label:  entry.meal,
      foods:       entry.foods,
      spike_label: entry.spike?.label,
      spike_value: entry.spike?.val,
      spike_level: entry.spike?.level,
      reactive:    entry.reactive,
      symptoms:    entry.symptoms,
      severity:    entry.severity,
      analysis:    entry.analysis,
      flag_clinic: entry.flagClinic,
    }

    const { data } = await supabase
      .from('reaction_diary')
      .insert(row)
      .select()
      .single()

    if (data) {
      setDiary(prev => [data, ...prev])
    }

    return data
  }, [supabase])

  return { diary, logReaction, loading }
}


// ─── useChatHistory ───────────────────────────────────────────────────────────
// Loads and persists chat messages for the current patient.
//
// Usage:
//   const { messages, saveMessages, loading } = useChatHistory(initialMessage)

export function useChatHistory(initialAssistantMessage) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100)

      if (data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role, content: m.content })))
      } else {
        // First-time patient — set initial greeting
        setMessages([{ role: 'assistant', content: initialAssistantMessage }])
      }

      setLoading(false)
    }
    load()
  }, [])

  const saveMessages = useCallback(async (newMessages) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Only save messages not yet in DB (last 2: user + assistant)
    const toSave = newMessages.slice(-2)
    await supabase.from('chat_messages').insert(
      toSave.map(m => ({
        patient_id: user.id,
        role: m.role,
        content: m.content
      }))
    )
    setMessages(newMessages)
  }, [supabase])

  return { messages, setMessages, saveMessages, loading }
}
