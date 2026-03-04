import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { ServerWatchdog } from '@/lib/services/server-watchdog'

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
  const email = searchParams.get('email')
  
  console.log(`[Auth Confirm] Processing ${type} for token: ${token?.substring(0, 5)}...`)

  const orderIdFromRedirect = (() => {
    try {
      const parsed = redirectPath.startsWith('http')
        ? new URL(redirectPath)
        : new URL(redirectPath, 'http://voices.local');
      return parsed.searchParams.get('orderId') || parsed.searchParams.get('orderid');
    } catch {
      return redirectPath.match(/orderId=(\d+)/i)?.[1] || null;
    }
  })();

  const buildVerificationFallbackUrl = (reason: string = 'confirm_failed') => {
    const params = new URLSearchParams();
    params.set('verify', 'true');
    params.set('reason', reason);
    if (orderIdFromRedirect) params.set('orderId', orderIdFromRedirect);
    if (email && email.includes('@')) params.set('email', email);
    return `${origin}/checkout/success?${params.toString()}`;
  };

  const verificationFallbackUrl = buildVerificationFallbackUrl();

  if (token) {
    const supabase = createClient()
    if (!supabase) {
      console.error('[Auth Confirm] Supabase niet geconfigureerd')
      return NextResponse.redirect(buildVerificationFallbackUrl('auth_service_unavailable'))
    }

    let verifyError: { message?: string } | null = null
    try {
      const timeoutMsRaw = Number(process.env.AUTH_CONFIRM_TIMEOUT_MS || 12000)
      const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0 ? timeoutMsRaw : 12000

      const verifyResult = await Promise.race([
        supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        }),
        new Promise<{ error: { message: string } }>((resolve) => {
          setTimeout(() => resolve({ error: { message: 'verify_timeout' } }), timeoutMs)
        })
      ])
      verifyError = (verifyResult as any)?.error || null
    } catch (verifyErr: any) {
      console.error('[Auth Confirm] verifyOtp exception:', verifyErr?.message || verifyErr)
      try {
        await ServerWatchdog.report({
          error: `Auth confirmation exception: ${verifyErr?.message || 'unknown'}`,
          component: 'AuthConfirm',
          url: request.url,
          level: 'error',
          payload: { type, token: token.substring(0, 10) + '...' }
        });
      } catch (e) {}
      return NextResponse.redirect(buildVerificationFallbackUrl('confirm_exception'))
    }

    if (!verifyError) {
      console.log(' NUCLEAR AUTH: Session confirmed via verifyOtp.')
      
      // 🛡️ CHRIS-PROTOCOL: Log success to Watchdog
      try {
        await ServerWatchdog.report({
          error: `Auth success for ${type}`,
          component: 'AuthConfirm',
          url: request.url,
          level: 'info',
          payload: { type, success: true }
        });
      } catch (e) {}

      // Voorkom open redirects
      const isLocalRedirect = redirectPath.startsWith('/')
      let finalPath = isLocalRedirect ? redirectPath : '/account'
      
      // Voeg auth=success toe als het nog niet in de URL staat
      if (!finalPath.includes('auth=success')) {
        finalPath += (finalPath.includes('?') ? '&' : '?') + 'auth=success'
      }
      
      const response = NextResponse.redirect(`${origin}${finalPath}`)
      return response
    }

    console.error(' NUCLEAR AUTH ERROR:', verifyError.message)
    try {
      await ServerWatchdog.report({
        error: `Auth confirmation failed: ${verifyError.message} (Type: ${type})`,
        component: 'AuthConfirm',
        url: request.url,
        level: 'error',
        payload: { type, error: verifyError.message, token: token.substring(0, 10) + '...' }
      });
    } catch (e) {}
  }

  // Bij een fout sturen we de gebruiker naar de verificatie-flow.
  // Dit voorkomt JSON/dead-end states en laat een snelle login-link opnieuw versturen.
  return NextResponse.redirect(verificationFallbackUrl)
}
