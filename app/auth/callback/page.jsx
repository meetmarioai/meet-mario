'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/auth/login?error=auth')
      }
    })
  }, [router])

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',color:'#8A7E72'}}>
      Logging you in...
    </div>
  )
}
