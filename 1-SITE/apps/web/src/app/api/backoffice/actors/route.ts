import { db, actors } from '@/lib/system/db';
import { DbService } from '@/lib/services/db-service';
import { desc, ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

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
  } catch (error) {
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
