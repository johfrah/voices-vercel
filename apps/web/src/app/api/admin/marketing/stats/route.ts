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

    // 4. AI Insight Generation (Dynamic)
    let aiInsight = "Voicy analyseert momenteel de conversie-paden. Geen opvallende trends gedetecteerd voor vandaag.";
    
    if (totalToday > 0) {
      const topJourney = Object.entries(journeyStats).sort((a: any, b: any) => b[1] - a[1])[0];
      
      if (topJourney) {
        aiInsight = `Voicy ziet een sterke focus op de ${topJourney[0]} journey. Dit vertegenwoordigt ${Math.round((Number(topJourney[1]) / totalToday) * 100)}% van het huidige verkeer.`;
      }
    }

    return NextResponse.json({ 
      stats: {
        totalToday,
        journeys: journeyStats,
        aiInsight
      },
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error(' MAT STATS API ERROR:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
