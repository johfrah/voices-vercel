import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

/**
 *  MAT: VISITOR TRACKING API (2026)
 * 
 * Verwerkt real-time footprints van bezoekers en slaat deze op in de database.
 */
// export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { event, pathname, referrer, intent, iapContext } = body;
    
    //  MAT: Wees extreem voorzichtig met pathname
    if (!pathname || typeof pathname !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid pathname' }, { status: 400 });
    }

    const visitorHash = request.cookies.get('voices_visitor_hash')?.value;
    const market = request.headers.get('x-voices-market') || 'BE';
    const journey = request.headers.get('x-voices-journey') || 'agency';
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    if (!visitorHash) {
      //  MAT: Als er geen hash is, loggen we het als anoniem of we negeren het
      // We geven een 200 terug om de frontend niet te storen
      return NextResponse.json({ success: true, message: 'Skipped: No visitor hash' });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    //  MAT: UTM Extraction from URL if present in pathname
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;

    try {
      const { MarketManagerServer: MarketManager } = await import('@/lib/system/market-manager-server');
      const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
      const url = new URL(pathname, `https://${host}`);
      utmSource = url.searchParams.get('utm_source');
      utmMedium = url.searchParams.get('utm_medium');
      utmCampaign = url.searchParams.get('utm_campaign');
    } catch (e) {
      // Silent fail voor URL parsing
    }

    // 1. Update of maak visitor record
    try {
      await supabase
        .from('visitors')
        .upsert({
          visitor_hash: visitorHash,
          last_visit_at: new Date().toISOString(),
          current_page: pathname,
          referrer: referrer,
          market: market,
          journey_state: journey,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }, { onConflict: 'visitor_hash' });
    } catch (visitorError) {
      console.error(' MAT: Visitor upsert error:', visitorError);
    }

    // 2. Log het event
    const { error: logError } = await supabase
      .from('visitor_logs')
      .insert({
        visitor_hash: visitorHash,
        pathname,
        referrer,
        journey,
        market,
        intent,
        event: event || 'pageview',
        iap_context: typeof iapContext === 'string' ? JSON.parse(iapContext) : iapContext
      });

    if (logError) throw logError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(' MAT TRACKING ERROR:', {
      message: err.message,
      stack: err.stack
    });
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
