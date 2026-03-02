import { db, centralLeads, chatConversations, chatMessages } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 *  CONTACT & LEAD CAPTURE API (2026)
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      return await db.transaction(async (tx) => {
        // 1.  Capture Lead for Profiling
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

        // 2.  Create Conversation in Mailbox
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

        // 3.  Add the message
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
    } catch (dbError) {
      console.warn('[Contact API] Drizzle failed, falling back to Supabase SDK:', dbError);
      
      // 1. Capture Lead via SDK
      const { data: lead, error: leadError } = await supabase
        .from('central_leads')
        .insert({
          email,
          source_type: source,
          lead_vibe: 'warm',
          iap_context: {
            ...context,
            last_message: message,
            captured_via: 'voicy_contact_form'
          },
          created_at: new Date()
        })
        .select()
        .single();
      
      if (leadError) throw leadError;

      // 2. Create Conversation via SDK
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          guest_email: email,
          status: 'open',
          journey: context.journey || 'agency',
          intent: 'contact_request',
          iap_context: {
            lead_id: lead.id,
            source: source
          },
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();
      
      if (convError) throw convError;

      // 3. Add message via SDK
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conv.id,
          sender_type: 'user',
          message: message,
          created_at: new Date()
        });
      
      if (msgError) throw msgError;

      return NextResponse.json({ 
        success: true, 
        leadId: lead.id, 
        conversationId: conv.id,
        _source: 'supabase_sdk'
      });
    }

  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to process contact request' }, { status: 500 });
  }
}
