// app/auth/callback/route.js
// Redirects auth callbacks directly to dashboard (no Supabase session needed)
import { NextResponse } from 'next/server'

export async function GET(request) {
  // Skip Supabase session exchange — redirect straight to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
