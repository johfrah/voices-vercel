import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Veronderstelde db import
import { studioSessions, studioScripts, chatConversations } from '@/packages/database/schema'; // Paden kunnen variëren afhankelijk van setup

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actorIds, script, briefing, clientEmail, clientFirstName } = body;

    // 1. Maak een nieuwe chat conversatie aan (Voicy Chat)
    // In een echte implementatie zouden we hier ook de client/user logica afhandelen
    const [conversation] = await db.insert(chatConversations).values({
      guestEmail: clientEmail,
      guestName: clientFirstName,
      status: 'open',
      journey: 'agency',
      intent: 'casting',
      iapContext: { briefing }
    }).returning();

    // 2. Maak de Studio Sessie aan (Isolatie-Model)
    const [session] = await db.insert(studioSessions).values({
      conversationId: conversation.id,
      status: 'active',
      settings: { 
        castingMode: 'blind',
        actorIds: actorIds // Alleen voor admin/systeem zichtbaar
      }
    }).returning();

    // 3. Sla het eerste script op
    await db.insert(studioScripts).values({
      sessionId: session.id,
      content: script,
      version: 1,
      isCurrent: true
    });

    // 4. Trigger notificaties naar acteurs (Simulatie)
    // Hier zouden we een service aanroepen die e-mails/notificaties stuurt naar de geselecteerde acteurs

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      studioUrl: `/studio/session/${session.id}` // In een echte app zou dit een hash of magic link zijn
    });

  } catch (error) {
    console.error('Studio Session Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create studio session' }, { status: 500 });
  }
}
