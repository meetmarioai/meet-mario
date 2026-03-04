 'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from './supabase'

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

      const [
        { data: p },
        { data: a },
        { data: prefs },
        { data: staff }
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', user.id).single(),
        supabase.from('alcat_results').select('*').eq('patient_id', user.id)
          .order('test_date', { ascending: false }).limit(1).single(),
        supabase.from('protein_preferences').select('*').eq('patient_id', user.id),
        supabase.from('clinic_staff').select('id').eq('id', user.id).single()
      ])

      setPatient(p)
      setAlcat(a)
      setIsStaff(!!staff)

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

  const setProtein = useCallback(async (day, mealKey, protein) => {
    cons
