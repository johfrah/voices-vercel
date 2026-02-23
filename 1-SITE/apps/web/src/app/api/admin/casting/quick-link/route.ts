import { db } from '@db';
import { castingLists, castingListItems } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { nanoid } from 'nanoid';

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
    const { actorIds, projectName = 'Admin Selectie' } = await request.json();

    if (!actorIds || !Array.isArray(actorIds) || actorIds.length === 0) {
      return NextResponse.json({ error: 'No actors selected' }, { status: 400 });
    }

    const sessionHash = nanoid(12);

    // 1. Maak de lijst aan
    const [newList] = await db.insert(castingLists).values({
      name: `${projectName} - ${new Date().toLocaleDateString('nl-BE')}`,
      hash: sessionHash,
      isPublic: true, // Admin links zijn direct deelbaar
      settings: {
        isAdminGenerated: true,
        createdAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    }).returning();

    // 2. Koppel de stemmen
    const items = actorIds.map((id, index) => ({
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
