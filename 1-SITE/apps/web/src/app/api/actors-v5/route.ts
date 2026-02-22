import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('actors')
      .select('*')
      .eq('status', 'live')
      .eq('is_public', true)
      .limit(10);
    
    if (error) throw error;
    
    return NextResponse.json({
      count: data?.length || 0,
      results: data || [],
      _v: 5,
      _time: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, _v: 5 }, { status: 500 });
  }
}
