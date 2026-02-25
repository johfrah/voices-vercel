import { db, vaultFiles, users, approvalQueue } from '@/lib/system/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 *  OFFER DRAFTING BRIDGE (2026)
 * 
 * Doel: Analyseert een script uit de Vault en zet een concept-offerte klaar in de Approval Queue.
 * Dit is de Human-in-the-Loop (HITL) stap voor offertes.
 */
export async function POST(request: Request) {
  try {
    const { vaultFileId } = await request.json();

    if (!vaultFileId) {
      return NextResponse.json({ error: 'Missing vaultFileId' }, { status: 400 });
    }

    // 1. Haal bestand op
    const file = await db.query.vaultFiles.findFirst({
      where: eq(vaultFiles.id, vaultFileId),
      with: {
        customer: true
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'Vault file not found' }, { status: 404 });
    }

    // 2.  AI ANALYSE (Simulatie voor nu, later via LLM)
    // Voicy zou hier het script lezen en usage/lengte bepalen.
    const reasoning = `Voicy heeft het script "${file.originalName}" geanalyseerd. Geschatte lengte: 30 sec. Usage: Online/Social Media.`;
    
    const draftPayload = {
      customerId: file.customerId,
      customerName: file.customer ? `${file.customer.firstName} ${file.customer.lastName}` : 'Onbekende Klant',
      items: [
        {
          description: `Voice-over opname: ${file.originalName}`,
          quantity: 1,
          suggestedPrice: 250.00, // Basis tarief online
          category: 'online'
        }
      ],
      vaultFileId: file.id,
      sourceMailSubject: (file.aiMetadata as any)?.mailSubject || 'Directe aanvraag'
    };

    // 3. Zet in de Approval Queue
    const approval = await db.insert(approvalQueue).values({
      type: 'quote',
      status: 'pending',
      priority: 'normal',
      reasoning: reasoning,
      payload: draftPayload,
      targetId: file.id.toString(),
      iapContext: {
        intent: 'quote_request',
        journey: 'agency'
      }
    }).returning({ id: approvalQueue.id });

    return NextResponse.json({ 
      success: true, 
      message: 'Concept offerte klaargezet voor review!',
      approvalId: approval[0].id
    });

  } catch (error) {
    console.error(' Offer Drafting Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
