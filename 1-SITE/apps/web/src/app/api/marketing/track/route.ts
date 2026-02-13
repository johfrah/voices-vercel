import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * 🚪 MAT: VISITOR TRACKING API (2026)
 * 
 * Verwerkt real-time footprints van bezoekers en slaat deze op in de database.
 */
// export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, pathname, referrer, intent, iapContext } = body
    
    const visitorHash = request.cookies.get('voices_visitor_hash')?.value
    const market = request.headers.get('x-voices-market') || 'BE'
    const journey = request.headers.get('x-voices-journey') || 'agency'
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

    if (!visitorHash) {
      // 🕵️ MAT: Als er geen hash is, genereren we er een of we negeren het event voor nu
      // In plaats van een 400 error, geven we een 200 met een waarschuwing om de frontend niet te laten crashen
      console.warn('🕵️ MAT: Tracking overgeslagen, geen visitor hash gevonden.');
      return NextResponse.json({ success: false, message: 'Missing visitor hash' });
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
    )

    // 🕵️ MAT: UTM Extraction from URL if present in pathname
    const url = new URL(pathname, `https://${request.headers.get('host') || 'voices.be'}`)
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')

    // 1. Update of maak visitor record
    const { data: visitor, error: visitorError } = await supabase
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
        // 🌍 MAT: Toekomstige uitbreiding: IP-geolocatie via externe service
      }, { onConflict: 'visitor_hash' })
      .select()
      .single()

    if (visitorError) {
      console.error('❌ MAT: Visitor upsert error:', visitorError);
      // We gaan door met loggen, zelfs als de upsert faalt
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
        iap_context: iapContext
      })

    if (logError) {
      console.error('❌ MAT: Event log error:', logError);
      throw logError;
    }

    return NextResponse.json({ success: true })
    } catch (err: any) {
    console.error('❌ MAT TRACKING ERROR:', err)
    // 🛡️ CHRIS-PROTOCOL: Log database connection details if it fails
    if (err.message?.includes('Tenant or user not found')) {
      console.error('🚨 DATABASE AUTH ERROR: Check DATABASE_URL and Supabase project status.');
    }
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
