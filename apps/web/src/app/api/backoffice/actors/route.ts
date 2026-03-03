import { db, actors } from '@/lib/system/voices-config';
import { DbService } from '@/lib/services/db-service';
import { asc, ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const baseQuery = db
      .select({
        id: actors.id,
        first_name: actors.first_name,
        last_name: actors.last_name,
      })
      .from(actors);

    const filteredQuery = search
      ? baseQuery.where(
          or(
            ilike(actors.first_name, `%${search}%`),
            ilike(actors.last_name, `%${search}%`)
          )
        )
      : baseQuery;

    const results = await filteredQuery.orderBy(asc(actors.first_name), asc(actors.last_name)).limit(50);
    return NextResponse.json(results);
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
