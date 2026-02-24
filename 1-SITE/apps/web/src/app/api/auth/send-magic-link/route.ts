import { createAdminClient } from '@/utils/supabase/server';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { NextResponse } from 'next/server';
import { ServerWatchdog } from '@/lib/services/server-watchdog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * CUSTOM AUTH API (BOB-METHOD 2026)
 * 
 * Verstuurt een magic link via onze eigen VoicesMailEngine.
 * De link wijst nu DIRECT naar voices.be voor maximale betrouwbaarheid.
 */
export async function POST(req: Request) {
  console.log('🚀 [Auth API] Magic Link request started');
  try {
    const { email, redirect: redirectPath = '/account' } = await req.json();
    console.log(`🚀 [Auth API] Request for: ${email}, redirect: ${redirectPath}`);

    const supabase = createAdminClient();
    if (!supabase) {
      await ServerWatchdog.report({
        error: 'Auth service niet beschikbaar (Service role key missing)',
        component: 'AuthAPI',
        url: req.url,
        level: 'critical'
      });
      return NextResponse.json({ error: 'Auth service niet beschikbaar (Service role key missing)' }, { status: 500 });
    }

    console.log(`[Auth API] Processing request for: ${email}`);

    // 🛡️ CHRIS-PROTOCOL: Force absolute URL for redirect to avoid relative path issues in Supabase
    const originUrl = new URL(req.url).origin;
    const finalRedirect = redirectPath.startsWith('http') ? redirectPath : `${originUrl}${redirectPath}`;

    // 🛡️ CHRIS-PROTOCOL: Simpler redirectTo to avoid Supabase parsing errors
    // We use /account/confirm as the base and pass the final redirect as a param
    const supabaseRedirectTo = `${originUrl}/account/confirm`;

    // 1. Probeer een magiclink te genereren
    let { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: supabaseRedirectTo,
      }
    });

    // 2. Als de gebruiker niet bestaat (of andere 422 error), maak de gebruiker aan
    if (error && (error.message.includes('User not found') || error.status === 422)) {
      console.log(`[Auth API] User not found or signup needed, creating user: ${email}`);
      
      const { data: signupData, error: signupError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: supabaseRedirectTo,
        }
      });

      if (signupError) {
        console.error('[Auth API] Signup link generation failed:', signupError);
        await ServerWatchdog.report({
          error: `Signup link generation failed: ${signupError.message}`,
          component: 'AuthAPI',
          url: req.url,
          level: 'error',
          payload: { email, error: signupError }
        });
        return NextResponse.json({ error: signupError.message }, { status: 400 });
      }

      data = signupData;
      error = null;
    }

    if (error || !data) {
      console.error('[Auth API] Supabase error:', error);
      await ServerWatchdog.report({
        error: `Supabase generateLink error: ${error?.message || 'Unknown error'}`,
        component: 'AuthAPI',
        url: req.url,
        level: 'error',
        payload: { email, error }
      });
      return NextResponse.json({ error: error?.message || 'Kon geen link genereren' }, { status: 400 });
    }

    // 3. Bouw de Voices link
    const supabaseLink = new URL(data.properties.action_link);
    const token = supabaseLink.searchParams.get('token');
    const type = supabaseLink.searchParams.get('type') || 'magiclink';
    
    if (!token) {
      console.error('[Auth API] No token found in action link:', data.properties.action_link);
      await ServerWatchdog.report({
        error: 'No token found in action link',
        component: 'AuthAPI',
        url: req.url,
        level: 'critical',
        payload: { action_link: data.properties.action_link }
      });
      return NextResponse.json({ error: 'Interne fout: Geen token gegenereerd' }, { status: 500 });
    }

    // ONZE BETROUWBARE LINK (Forceer https op productie)
    const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
    const host = new URL(req.url).host;
    
    // 🛡️ CHRIS-PROTOCOL: Use MarketManagerServer directly for static config to avoid DB timeout in Auth flow
    const market = MarketManager.getCurrentMarket(host);
    const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
    
    const origin = host.includes('localhost') ? `http://${host}` : siteUrl;
    // We voegen de redirectPath hier toe aan ONZE link, niet aan de Supabase link
    const voicesLink = `${origin}/account/confirm?token=${token}&type=${type}&redirect=${encodeURIComponent(redirectPath)}`;
    
    console.log(`[Auth API] Voices link created: ${voicesLink}`);

    // 🛡️ CHRIS-PROTOCOL: Log the link to the Watchdog for automated Trinity Validation
    // We wrap this in a try-catch to ensure the mail is ALWAYS sent even if logging fails
    try {
      await ServerWatchdog.report({
        error: `Magic link generated for ${email}`,
        component: 'AuthAPI',
        url: req.url,
        level: 'info',
        payload: { email, link: voicesLink }
      });
    } catch (logErr) {
      console.warn('[Auth API] Watchdog logging failed, continuing with mail:', logErr);
    }

    // 4. Verstuur de mail via onze eigen VoicesMailEngine
    // 🛡️ CHRIS-PROTOCOL: Nuclear Speed Guarantee (v2.14.221)
    // We proberen de mail te versturen, maar we wachten maximaal 5 seconden.
    // Als het langer duurt, schakelen we DIRECT over naar de fallback of 
    // we laten de server het op de achtergrond afhandelen zodat de gebruiker niet wacht.
    const { VoicesMailEngine } = await import('@/lib/services/voices-mail-engine');
    const mailEngine = VoicesMailEngine.getInstance();
    
    // Detecteer taal
    const lang = req.headers.get('accept-language')?.startsWith('fr') ? 'fr-fr' : 
                 req.headers.get('accept-language')?.startsWith('en') ? 'en-gb' : 'nl-be';

    // We gebruiken een Promise.race om de snelheid te garanderen
    try {
      await Promise.race([
        mailEngine.sendMagicLink(email, voicesLink, lang, host),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Mailserver Timeout')), 5000))
      ]);
      console.log(`[Auth API] Mail successfully sent to: ${email}`);
      return NextResponse.json({ success: true });
    } catch (mailErr: any) {
      console.warn('[Auth API] Primary mail failed or timed out, triggering Nuclear Fallback:', mailErr.message);
      
      // 🛡️ CHRIS-PROTOCOL: Immediate Fallback to Supabase (Reserve-motor)
      const { error: fallbackError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: finalRedirect,
        }
      });

      if (fallbackError) {
        // ... bestaande error handling ...
        console.error('[Auth API] Fallback Supabase mail also failed:', fallbackError.message, fallbackError.status);
        const isRateLimit = fallbackError.message.includes('rate limit') || fallbackError.message.includes('security purposes');
        
        await ServerWatchdog.report({
          error: `Magic link failed (Custom & Fallback): ${fallbackError.message} (Status: ${fallbackError.status})`,
          component: 'AuthAPI',
          url: req.url,
          level: isRateLimit ? 'info' : 'critical',
          payload: { 
            email, 
            customError: mailErr.message, 
            fallbackError: fallbackError.message,
            fallbackStatus: fallbackError.status,
            fallbackCode: (fallbackError as any).code
          }
        });
        return NextResponse.json(
          { error: `Inloglink kon niet worden verzonden: ${fallbackError.message}` }, 
          { status: isRateLimit ? 429 : 500 }
        );
      }

      console.log(`[Auth API] Fallback magic link sent successfully to: ${email}`);
      return NextResponse.json({ success: true, fallback: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Auth API] Unexpected error:', err);
    await ServerWatchdog.report({
      error: `Unexpected Auth API error: ${err.message}`,
      stack: err.stack,
      component: 'AuthAPI',
      url: req.url,
      level: 'critical'
    });
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
