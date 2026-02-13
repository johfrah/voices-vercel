import { db } from '@db';
import { actors } from '@db/schema';
import { DbService } from '@db-service';
import { desc, ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Sherlock: Check of we Drizzle kunnen gebruiken (niet in Edge runtime)
    const canUseDrizzle = typeof process !== 'undefined' && 
                         process.env.DATABASE_URL && 
                         process.env.NEXT_RUNTIME !== 'edge' &&
                         process.env.NEXT_RUNTIME !== 'nodejs';

    if (canUseDrizzle) {
      let query = db.select().from(actors);
      
      if (search) {
        // @ts-ignore
        query = query.where(or(
          ilike(actors.firstName, `%${search}%`),
          ilike(actors.lastName, `%${search}%`)
        ));
      }

      const results = await query.orderBy(desc(actors.voiceScore)).limit(50);
      return NextResponse.json(results);
    } else {
      // Fallback naar SDK voor Edge
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let sdkQuery = supabase.from('actors').select('*').order('voice_score', { ascending: false }).limit(50);
      if (search) {
        sdkQuery = sdkQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data, error } = await sdkQuery;
      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('[Backoffice Actors GET Error]:', error);
    return NextResponse.json({ error: 'Kon acteurs niet ophalen' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 });
    }

    const result = await DbService.updateRecord(actors, id, data);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      _nuclear: true 
    });
  } catch (error) {
    console.error('[Backoffice Actors PATCH Error]:', error);
    return NextResponse.json({ error: 'Update mislukt' }, { status: 500 });
  }
}
