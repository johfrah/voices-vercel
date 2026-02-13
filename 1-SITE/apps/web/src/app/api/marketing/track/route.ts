import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * 🚪 MAT: VISITOR TRACKING API (2026)
 * 
 * Verwerkt real-time footprints van bezoekers en slaat deze op in de database.
 */
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
      return new NextResponse('Missing visitor hash', { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    if (visitorError) throw visitorError

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

    if (logError) throw logError

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ MAT TRACKING ERROR:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
