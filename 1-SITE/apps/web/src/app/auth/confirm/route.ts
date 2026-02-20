import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 *  AUTH CONFIRM ROUTE (BOB-METHOD 2026)
 * 
 * Dit is het landingspunt voor Magic Links (type=magiclink of type=signup).
 * Het bevestigt de token en zet de sessie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'magiclink'
  const redirectPath = searchParams.get('redirect') || '/account'
  
  console.log(`[Auth Confirm] Processing ${type} for token: ${token?.substring(0, 5)}...`)

  if (token) {
    const supabase = createClient()
    if (!supabase) {
      console.error('[Auth Confirm] Supabase niet geconfigureerd')
      return NextResponse.redirect(`${origin}/account?error=config`)
    }

    // Gebruik de verifyOtp methode voor magic links en signups
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (!error) {
      console.log(' NUCLEAR AUTH: Session confirmed via verifyOtp.')
      
      // Voorkom open redirects
      const isLocalRedirect = redirectPath.startsWith('/')
      let finalPath = isLocalRedirect ? redirectPath : '/account'
      
      // Voeg auth=success toe als het nog niet in de URL staat
      if (!finalPath.includes('auth=success')) {
        finalPath += (finalPath.includes('?') ? '&' : '?') + 'auth=success'
      }
      
      const response = NextResponse.redirect(`${origin}${finalPath}`)
      
      // CHRIS-PROTOCOL: Forceer een refresh via een cookie of header indien nodig
      // Maar NextResponse.redirect is meestal voldoende voor een schone start.
      
      return response
    }

    console.error(' NUCLEAR AUTH ERROR:', error.message)
  }

  // Bij een fout sturen we de gebruiker terug naar de login met de specifieke Supabase error
  return NextResponse.redirect(`${origin}/account?error=auth-callback-failed`)
}
