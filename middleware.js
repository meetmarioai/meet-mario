// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/pricing', '/trial', '/onboarding', '/auth/callback']

export async function middleware(req) {
  let res = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname

  if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return res
  if (path.startsWith('/api')) return res

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (path.startsWith('/dashboard')) {
    const userId = session.user.id
    const now = Date.now()

    const [{ data: profile }, { data: sub }] = await Promise.all([
      supabase.from('profiles').select('test_date, created_at').eq('id', userId).single(),
      supabase.from('subscriptions').select('status').eq('user_id', userId).single(),
    ])

    if (sub?.status === 'active') return res

    if (profile?.test_date) {
      const graceEnd = new Date(profile.test_date).getTime() + 180 * 86400000
      if (now < graceEnd) return res
    }

    if (profile?.created_at) {
      const trialEnd = new Date(profile.created_at).getTime() + 21 * 86400000
      if (now < trialEnd) {
        if (path === '/dashboard/chat') return res
        return NextResponse.redirect(new URL('/pricing?reason=trial', req.url))
      }
    }

    return NextResponse.redirect(new URL('/pricing?reason=expired', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
