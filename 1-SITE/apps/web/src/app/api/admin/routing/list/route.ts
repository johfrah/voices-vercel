import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
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
