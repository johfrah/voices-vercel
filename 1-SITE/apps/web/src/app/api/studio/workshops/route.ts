/**
 * NUCLEAR STUDIO WORKSHOPS API (2026)
 *
 * Fetches all public workshops with full enrichment via StudioService.
 *
 * @protocol CHRIS-PROTOCOL: StudioService for Nuclear Integrity
 */

import { NextResponse } from 'next/server';
import { getStudioWorkshopsData } from '@/lib/services/studio-service';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getStudioWorkshopsData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn('[Studio Workshops API] Drizzle/StudioService failed, falling back to Supabase SDK:', error.message);
    
    try {
      // 🛡️ CHRIS-PROTOCOL: Supabase SDK Fallback for Studio API (v2.16.130)
      // This ensures the workshop grid is visible even if Drizzle/Direct-Connect fails.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Fetch basic workshop data via SDK
      const { data: workshopsData, error: sdkError } = await supabase
        .from('workshops')
        .select(`
          *,
          media:media_id(file_path, alt_text)
        `)
        .eq('status', 'live')
        .eq('world_id', 2)
        .order('title');

      if (sdkError) throw sdkError;

      // Fetch editions for these workshops
      const workshopIds = (workshopsData || []).map(w => w.id);
      const { data: editionsData } = workshopIds.length > 0 
        ? await supabase
            .from('workshop_editions')
            .select('*, locations(*), instructors(*)')
            .in('workshop_id', workshopIds)
            .gte('date', new Date().toISOString())
            .neq('status', 'cancelled')
            .order('date')
        : { data: [] };

      // Map to the expected format for the frontend
      const mappedWorkshops = (workshopsData || []).map(w => {
        const upcoming = (editionsData || [])
          .filter(e => e.workshop_id === w.id)
          .map(e => ({
            id: e.id,
            date: e.date,
            location: e.locations,
            instructor: e.instructors,
            status: e.status
          }));

        return {
          id: w.id,
          title: w.title,
          slug: w.slug,
          description: w.description,
          price: w.price,
          status: w.status,
          featured_image: w.media ? { file_path: w.media.file_path, alt_text: w.media.alt_text } : null,
          upcoming_editions: upcoming,
          taxonomy: {
            category: w.meta?.category || 'Voice-over',
            type: w.meta?.type || 'Workshop'
          },
          level: w.meta?.level || 'Starter'
        };
      });

      return NextResponse.json({
        workshops: mappedWorkshops,
        instructors: [],
        faqs: [],
        _meta: { count: mappedWorkshops.length, fetched_at: new Date().toISOString(), _source: 'supabase_sdk' }
      });

    } catch (fallbackError: any) {
      console.error('[Studio Workshops API] SDK Fallback also failed:', fallbackError);
      return NextResponse.json({ 
        error: 'Studio workshops fetch failed', 
        message: fallbackError.message 
      }, { status: 500 });
    }
  }
}
