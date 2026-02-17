import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 *  AUTH CALLBACK ROUTE
 * 
 * Dit is het landingspunt voor Magic Links en Password Reset links.
 * Het wisselt de 'code' uit de URL in voor een echte Supabase sessie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' is de plek waar de gebruiker naartoe wilde voor het inloggen (default: /account)
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const supabase = createClient()
    if (!supabase) {
      console.error('[Auth] Supabase niet geconfigureerd  kan sessie niet uitwisselen')
      return NextResponse.redirect(`${origin}/auth/login?error=config`)
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log(' NUCLEAR AUTH: Session established via Magic Link.')
      
      //  SECURITY: Voorkom open redirects door alleen relatieve paden of de eigen origin toe te staan
      const isLocalRedirect = next.startsWith('/')
      const redirectUrl = isLocalRedirect ? `${origin}${next}` : next
      
      return NextResponse.redirect(redirectUrl)
    }
    
    console.error(' NUCLEAR AUTH ERROR:', error.message)
  }

  // Bij een fout of ontbrekende code sturen we de gebruiker terug naar de login met een foutmelding
  return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-failed`)
}
