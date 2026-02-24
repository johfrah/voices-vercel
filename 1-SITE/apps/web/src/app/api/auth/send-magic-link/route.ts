import { createAdminClient } from '@/utils/supabase/server';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { NextResponse } from 'next/server';

/**
 * CUSTOM AUTH API (BOB-METHOD 2026)
 * 
 * Verstuurt een magic link via onze eigen VoicesMailEngine.
 * De link wijst nu DIRECT naar voices.be voor maximale betrouwbaarheid.
 */
export async function POST(req: Request) {
  try {
    const { email, redirect: redirectPath = '/account' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Auth service niet beschikbaar (Service role key missing)' }, { status: 500 });
    }

    console.log(`[Auth API] Processing request for: ${email}`);

    // 🛡️ CHRIS-PROTOCOL: Force absolute URL for redirect to avoid relative path issues in Supabase
    const originUrl = new URL(req.url).origin;
    const finalRedirect = redirectPath.startsWith('http') ? redirectPath : `${originUrl}${redirectPath}`;

    // 1. Probeer een magiclink te genereren
    // Als de gebruiker niet bestaat, zal dit een error geven
    let { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${originUrl}/account/confirm?redirect=${encodeURIComponent(finalRedirect)}`,
      }
    });

    // 2. Als de gebruiker niet bestaat (of andere 422 error), maak de gebruiker aan
    if (error && (error.message.includes('User not found') || error.status === 422)) {
      console.log(`[Auth API] User not found or signup needed, creating user: ${email}`);
      
      const { data: signupData, error: signupError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: `${originUrl}/account/confirm?redirect=${encodeURIComponent(finalRedirect)}`,
        }
      });

      if (signupError) {
        console.error('[Auth API] Signup link generation failed:', signupError);
        return NextResponse.json({ error: signupError.message }, { status: 400 });
      }

      data = signupData;
      error = null;
    }

    if (error || !data) {
      console.error('[Auth API] Supabase error:', error);
      return NextResponse.json({ error: error?.message || 'Kon geen link genereren' }, { status: 400 });
    }

    // 3. Bouw de Voices link
    const supabaseLink = new URL(data.properties.action_link);
    const token = supabaseLink.searchParams.get('token');
    const type = supabaseLink.searchParams.get('type') || 'magiclink';
    
    if (!token) {
      console.error('[Auth API] No token found in action link:', data.properties.action_link);
      return NextResponse.json({ error: 'Interne fout: Geen token gegenereerd' }, { status: 500 });
    }

    // ONZE BETROUWBARE LINK (Forceer https op productie)
    const { MarketManagerServer: MarketManager } = require('@/lib/system/market-manager-server');
    const host = new URL(req.url).host;
    const market = MarketManager.getCurrentMarket(host);
    const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://www.voices.be`;
    
    const origin = host.includes('localhost') ? `http://${host}` : siteUrl;
    const voicesLink = `${origin}/account/confirm?token=${token}&type=${type}&redirect=${encodeURIComponent(redirectPath)}`;
    
    console.log(`[Auth API] Voices link created: ${voicesLink}`);

    // 4. Verstuur de mail via onze eigen VoicesMailEngine
    const mailEngine = VoicesMailEngine.getInstance();
    
    // Detecteer taal
    const lang = req.headers.get('accept-language')?.startsWith('fr') ? 'fr-fr' : 
                 req.headers.get('accept-language')?.startsWith('en') ? 'en-gb' : 'nl-be';

    try {
      await mailEngine.sendMagicLink(email, voicesLink, lang, host);
      console.log(`[Auth API] Mail successfully sent to: ${email} (lang: ${lang})`);
    } catch (mailErr) {
      console.error('[Auth API] Mail sending failed:', mailErr);
      return NextResponse.json({ error: 'Mail kon niet worden verzonden via onze server' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Auth API] Unexpected error:', err);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
