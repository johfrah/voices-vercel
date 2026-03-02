import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

//  CHRIS-PROTOCOL: Build Safety (v2.15.064)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Graceful build-time handling
  if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ slugs: [], stats: { total: 0, redirects: 0, actors: 0, articles: 0 } });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: slugs, error } = await supabase
      .from('slug_registry')
      .select('*')
      .order('slug', { ascending: true });

    if (error) throw error;

    const stats = {
      total: slugs.length,
      redirects: slugs.filter(s => s.canonical_slug).length,
      actors: slugs.filter(s => s.routing_type === 'actor').length,
      articles: slugs.filter(s => s.routing_type === 'article' || s.routing_type === 'blog').length
    };

    return NextResponse.json({ slugs, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
