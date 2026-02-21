import { db } from '@db';
import { actors } from '@db/schema';
import { ilike, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const results = await db.select({
      id: actors.id,
      wpProductId: actors.wpProductId,
      firstName: actors.firstName,
      lastName: actors.lastName,
      status: actors.status,
    })
    .from(actors)
    .where(or(
      ilike(actors.firstName, '%Kirsten%'),
      ilike(actors.lastName, '%Kirsten%')
    ));

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
