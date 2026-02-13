import { db } from '@db';
import { centralLeads, chatConversations, chatMessages } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 📩 CONTACT & LEAD CAPTURE API (2026)
 * 
 * Doel: Verwerkt contactformulieren vanuit Voicy en andere instrumenten.
 * - Slaat lead op in central_leads voor profiling.
 * - Maakt een conversatie aan in de mailbox voor de admin.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message, source = 'generic_contact', context = {} } = body;

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing email or message' }, { status: 400 });
    }

    return await db.transaction(async (tx) => {
      // 1. 🧲 Capture Lead for Profiling
      const [lead] = await tx.insert(centralLeads).values({
        email,
        sourceType: source,
        leadVibe: 'warm', // Contact opnemen is een warme actie
        iapContext: {
          ...context,
          last_message: message,
          captured_via: 'voicy_contact_form'
        },
        createdAt: new Date()
      }).returning();

      // 2. 💬 Create Conversation in Mailbox
      const [conv] = await tx.insert(chatConversations).values({
        guestEmail: email,
        status: 'open',
        journey: context.journey || 'agency',
        intent: 'contact_request',
        iapContext: {
          lead_id: lead.id,
          source: source
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // 3. ✉️ Add the message
      await tx.insert(chatMessages).values({
        conversationId: conv.id,
        senderType: 'user',
        message: message,
        createdAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        leadId: lead.id,
        conversationId: conv.id 
      });
    });

  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to process contact request' }, { status: 500 });
  }
}
