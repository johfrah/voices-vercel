import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * PREDICTIVE ROUTER & SESSION MANAGER (GOD MODE 2026)
 * 
 * Verantwoordelijk voor:
 * 1. Supabase Auth Session Refresh
 * 2. System Context Detection (Market, Journey, Intent)
 * 3. Predictive Routing naar de juiste Bento-grid
 */

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase env vars missing – skipping session refresh')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // request.cookies is readonly – alleen response mag .set() aanroepen
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Refresh session (graceful fallback on Supabase errors)
  let user: { id?: string } | null = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (err) {
    console.warn('⚠️ Supabase auth.getUser failed:', err)
  }

  // 2. System CONTEXT DETECTION (De Vier-Eenheid)
  const url = new URL(request.url)
  const host = request.headers.get('host') || ''
  
  // A. Market Detection (BE, NL, FR, etc.)
  let market = 'NL' // Default
  if (host.includes('.be')) market = 'BE'
  if (host.includes('.fr')) market = 'FR'
  if (url.searchParams.has('market')) market = url.searchParams.get('market')!.toUpperCase()

  // B. Journey & Intent Detection
  let journey = 'agency' // Default
  if (url.pathname.startsWith('/ademing')) journey = 'ademing'
  if (url.pathname.startsWith('/artist')) journey = 'artist'
  if (url.pathname.startsWith('/studio')) journey = 'studio'
  if (url.pathname.startsWith('/academy')) journey = 'academy'
  if (url.pathname.startsWith('/backoffice')) journey = 'backoffice'
  if (url.pathname.startsWith('/portfolio')) journey = 'portfolio'

  // C. Intent Scoring (Predictive)
  const intent = url.searchParams.get('intent') || 'browse'

  // 3. PREDICTIVE ROUTING LOGIC
  // Voeg context toe aan headers voor Server Components
  response.headers.set('x-voices-market', market)
  response.headers.set('x-voices-journey', journey)
  response.headers.set('x-voices-intent', intent)
  response.headers.set('x-voices-user-id', user?.id || 'guest')

  // Beveiliging: Redirect naar login voor beschermde routes
  const protectedPaths = [
    '/backoffice',
    '/artist/dashboard',
    '/admin',
    '/studio/beheer',
    '/studio/reviews',
  ]
  const isProtected = protectedPaths.some(p => url.pathname.startsWith(p))
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}
