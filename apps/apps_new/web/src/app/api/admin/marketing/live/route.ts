import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

/**
 *  MAT: RADER LIVE API (2026)
 * 
 * Haalt real-time visitor data op uit de Mat-proof tabellen.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Haal de laatste 50 unieke bezoekers op
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitors')
      .select('*')
      .order('last_visit_at', { ascending: false })
      .limit(50)

    if (visitorsError) throw visitorsError

    // 2. Haal de laatste 100 logs op voor event-stream
    const { data: logs, error: logsError } = await supabase
      .from('visitor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (logsError) throw logsError

    return NextResponse.json({ 
      visitors,
      logs,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error(' MAT RADAR API ERROR:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
