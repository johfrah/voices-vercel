import { db } from '@/lib/system/voices-config';
import { castingLists, castingListItems, actors } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { nanoid } from 'nanoid';
import { or, ilike, inArray } from 'drizzle-orm';

/**
 * 🚀 ADMIN QUICK LINK API (2026)
 * 
 * Doel: Maakt razendsnel een casting-lijst aan voor de admin zonder formulieren.
 * Alleen voor admins.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { actorIds, rawNames, projectName = 'Admin Selectie' } = await request.json();
    let finalActorIds = actorIds || [];

    // Als er namen zijn meegegeven (vanuit dashboard widget), zoek de IDs op
    if (rawNames && typeof rawNames === 'string') {
      const names = rawNames.split(/[\n,]/).map(n => n.trim()).filter(Boolean);
      if (names.length > 0) {
        const foundActors = await db.query.actors.findMany({
          where: or(...names.map(n => ilike(actors.first_name, `%${n}%`))),
          columns: { id: true }
        });
        finalActorIds = [...new Set([...finalActorIds, ...foundActors.map(a => a.id)])];
      }
    }

    if (!finalActorIds || !Array.isArray(finalActorIds) || finalActorIds.length === 0) {
      return NextResponse.json({ error: 'No actors found or selected' }, { status: 400 });
    }

    const sessionHash = nanoid(12);

    // 1. Maak de lijst aan
    const [newList] = await db.insert(castingLists).values({
      name: `${projectName} - ${new Date().toLocaleDateString('nl-BE')}`,
      hash: sessionHash,
      is_public: true, // Admin links zijn direct deelbaar
      settings: {
        isAdminGenerated: true,
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    }).returning();

    // 2. Koppel de stemmen
    const items = finalActorIds.map((id: number, index: number) => ({
      listId: newList.id,
      actorId: id,
      displayOrder: index
    }));

    await db.insert(castingListItems).values(items);

    return NextResponse.json({ 
      success: true, 
      hash: sessionHash,
      url: `/pitch/${sessionHash}`
    });

  } catch (error: any) {
    console.error('[Admin Quick Link Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
