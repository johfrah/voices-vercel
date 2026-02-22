import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'nl';
  
  try {
    console.log('🚀 ACTORS-V4: Fetching live actors via SDK...');
    
    let query = supabase
      .from('actors')
      .select('*')
      .eq('status', 'live')
      .eq('is_public', true);
      
    if (lang === 'nl') {
      query = query.or('native_lang.ilike.nl,native_lang.ilike.nl-%,native_lang.ilike.vlaams,native_lang.ilike.nederlands');
    } else {
      query = query.or(`native_lang.ilike.${lang},native_lang.ilike.${lang}-%`);
    }
    
    const { data, error } = await query.order('menu_order', { ascending: true }).limit(50);
    
    if (error) throw error;
    
    return NextResponse.json({
      count: data?.length || 0,
      results: data || [],
      _v: 4,
      _time: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, _v: 4 }, { status: 500 });
  }
}
