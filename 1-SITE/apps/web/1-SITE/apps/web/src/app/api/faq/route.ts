import { db } from '@db';
import { faq } from '@db/schema';
import { desc, eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const journey = searchParams.get('journey') || 'general';
  const limit = parseInt(searchParams.get('limit') || '3');

  if (isNaN(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }

  try {
    // We proberen eerst Drizzle
    let results: any[] = [];
    try {
      results = await db.select()
        .from(faq)
        .where(
          or(
            eq(faq.category, journey),
            eq(faq.category, 'general'),
            eq(faq.category, 'pricing'),
            eq(faq.category, 'service'),
            eq(faq.category, 'agency'),
            eq(faq.category, 'studio'),
            eq(faq.category, 'academy')
          )
        )
        .orderBy(desc(faq.helpfulCount))
        .limit(limit);
    } catch (dbError) {
      console.warn(' FAQ Drizzle failed, falling back to SDK');
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .or(`category.eq.${journey},category.eq.general,category.eq.pricing,category.eq.service,category.eq.agency,category.eq.studio,category.eq.academy`)
        .order('helpful_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      results = (data || []).map(item => ({
        ...item,
        helpfulCount: item.helpful_count,
        createdAt: item.created_at
      }));
    }

    return NextResponse.json(results || []);
  } catch (error: any) {
    console.error(' FAQ API FAILURE:', {
      message: error.message,
      journey,
      limit
    });
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
