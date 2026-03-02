import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API: ADMIN SLUGS (DNA PICKER)
 * Zoekt in de slug_registry voor de DNA Picker in de admin.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // We zoeken op slug of we proberen titels te matchen via de registry
    // Omdat de registry zelf geen titels heeft, zoeken we primair op slug
    // In een volgende fase kunnen we dit uitbreiden met joins naar actors/articles/workshops
    const { data, error } = await supabase
      .from('slug_registry')
      .select('id, slug, routing_type, entity_id')
      .ilike('slug', `%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (error) throw error;

    const results = data?.map(item => ({
      id: item.id,
      slug: item.slug,
      routingType: item.routing_type,
      entityId: item.entity_id,
      title: item.slug // Fallback, aangezien registry geen titels heeft
    })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Admin Slugs GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch slugs' }, { status: 500 });
  }
}
