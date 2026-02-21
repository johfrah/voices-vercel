import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

/**
 *  MAT: RADER STATS API (2026)
 * 
 * Berekent marketing-intelligence stats voor het dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 1. Totaal unieke bezoekers vandaag
    const { count: totalToday, error: countError } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .gte('last_visit_at', today.toISOString())

    if (countError) throw countError

    // 2. Journey verdeling
    let journeyData: any[] = []
    try {
      const { data, error: journeyError } = await supabase
        .from('visitors')
        .select('journey_state')
        .gte('last_visit_at', today.toISOString())
      
      if (journeyError) {
        // If the column doesn't exist, we fallback to selecting everything or just skipping this part
        console.warn(' Journey column missing or error, falling back:', journeyError.message)
        const { data: fallbackData } = await supabase
          .from('visitors')
          .select('*')
          .gte('last_visit_at', today.toISOString())
          .limit(100)
        journeyData = fallbackData || []
      } else {
        journeyData = data || []
      }
    } catch (e) {
      console.error(' Journey fetch failed:', e)
    }

    const journeyStats = (journeyData || []).reduce((acc: any, curr: any) => {
      const j = curr.journey_state || 'unknown'
      acc[j] = (acc[j] || 0) + 1
      return acc
    }, {})

    // 3. Market verdeling
    const { data: marketData, error: marketError } = await supabase
      .from('visitors')
      .select('market')
      .gte('last_visit_at', today.toISOString())

    if (marketError) {
      console.error(' Market Error:', marketError)
    }

    const marketStats = (marketData || []).reduce((acc: any, curr: any) => {
      const m = curr.market || 'unknown'
      acc[m] = (acc[m] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({ 
      stats: {
        totalToday,
        journeys: journeyStats,
        markets: marketStats
      },
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error(' MAT STATS API ERROR:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
