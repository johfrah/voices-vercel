import { db, centralLeads, chatConversations, chatMessages } from '@/lib/system/voices-config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type ContactContext = Record<string, unknown> & {
  journey?: string;
};
let centralLeadsTableMissing = false;

function normalizeContext(value: unknown): ContactContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as ContactContext;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== 'object') return String(error ?? '');
  if ('message' in error && typeof error.message === 'string') return error.message;
  return String(error);
}

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  if ('code' in error && typeof error.code === 'string') return error.code;
  return undefined;
}

function isMissingCentralLeadsError(error: unknown): boolean {
  const chain = [error];
  if (error && typeof error === 'object' && 'cause' in error) {
    chain.push(error.cause);
  }
  return chain.some((node) => {
    const message = extractErrorMessage(node).toLowerCase();
    const code = extractErrorCode(node);
    if (code === '42P01' || code === 'PGRST205') {
      return message.includes('central_leads');
    }
    return (
      message.includes('central_leads') &&
      (message.includes('does not exist') ||
        message.includes('could not find the table') ||
        message.includes('relation'))
    );
  });
}

/**
 *  CONTACT & LEAD CAPTURE API (2026)
 * 
 * Doel: Verwerkt contactformulieren vanuit Voicy en andere instrumenten.
 * - Slaat lead op in central_leads voor profiling.
 * - Maakt een conversatie aan in de mailbox voor de admin.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      message?: unknown;
      source?: unknown;
      context?: unknown;
    };
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const source = typeof body.source === 'string' && body.source ? body.source : 'generic_contact';
    const context = normalizeContext(body.context);

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing email or message' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase server credentials are missing');
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    try {
      let leadId: number | null = null;

      // Best-effort lead capture outside transaction to avoid poisoning mailbox writes.
      if (!centralLeadsTableMissing) {
        try {
          const [lead] = await db.insert(centralLeads).values({
            email,
            sourceType: source,
            leadVibe: 'warm',
            iapContext: {
              ...context,
              last_message: message,
              captured_via: 'voicy_contact_form'
            },
            createdAt: new Date()
          }).returning({ id: centralLeads.id });
          leadId = lead?.id ?? null;
        } catch (leadError) {
          if (!isMissingCentralLeadsError(leadError)) throw leadError;
          centralLeadsTableMissing = true;
          console.warn('[Contact API] central_leads missing, skipping lead capture.');
        }
      }

      const iapContext: Record<string, unknown> = { source };
      if (leadId !== null) iapContext.lead_id = leadId;

      // 2.  Create Conversation in Mailbox
      const [conv] = await db.insert(chatConversations).values({
        guestEmail: email,
        status: 'open',
        journey: context.journey || 'agency',
        intent: 'contact_request',
        iapContext,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: chatConversations.id });

      // 3.  Add the message
      await db.insert(chatMessages).values({
        conversationId: conv.id,
        senderType: 'user',
        message: message,
        createdAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        leadId, 
        conversationId: conv.id 
      });
    } catch (dbError) {
      console.warn('[Contact API] Drizzle failed, falling back to Supabase SDK:', dbError);
      
      let leadId: number | null = null;

      // 1. Capture Lead via SDK (optional when table is absent)
      if (!centralLeadsTableMissing) {
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
          .select('id')
          .single();
        
        if (leadError) {
          if (!isMissingCentralLeadsError(leadError)) throw leadError;
          centralLeadsTableMissing = true;
          console.warn('[Contact API] central_leads missing in Supabase cache, skipping lead capture.');
        } else {
          leadId = lead?.id ?? null;
        }
      }

      const iapContext: Record<string, unknown> = { source };
      if (leadId !== null) iapContext.lead_id = leadId;

      // 2. Create Conversation via SDK
      const { data: conv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          guest_email: email,
          status: 'open',
          journey: context.journey || 'agency',
          intent: 'contact_request',
          iap_context: iapContext,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select('id')
        .single();
      
      if (convError) throw convError;
      if (!conv?.id) throw new Error('Conversation insert returned no id');

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
        leadId, 
        conversationId: conv.id,
        _source: 'supabase_sdk'
      });
    }

  } catch (error: unknown) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json({ error: extractErrorMessage(error) || 'Failed to process contact request' }, { status: 500 });
  }
}
