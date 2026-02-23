import { DirectMailService } from '@/lib/services/direct-mail-service';
import { VectorService } from '@/lib/services/vector-service';
import { GeminiService } from '@/lib/services/gemini-service';
import { db } from '@db';
import { mailContent } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  AI BRAIN SYNC API (2026)
 * 
 * Deze route wordt aangeroepen om op de achtergrond mails te indexeren.
 * Het haalt mails op via IMAP, genereert embeddings via OpenAI, 
 * en voert een diepe analyse uit via Gemini.
 */
export async function POST(request: NextRequest) {
  try {
    const { folder = 'INBOX.Archive', limit = 10 } = await request.json();
    
    console.log(` AI Sync: Start sync voor ${folder} (limit: ${limit})...`);
    
    const mailService = DirectMailService.getInstance();
    const vectorService = VectorService.getInstance();
    const geminiService = GeminiService.getInstance();
    
    // 1. Haal mails op uit de map
    const mails = await mailService.fetchInbox(limit, folder);
    
    let syncedCount = 0;
    
    for (const mail of mails) {
      // 2. Haal volledige body op
      const fullContent = await mailService.fetchMessageBody(parseInt(mail.id), folder);
      const textToEmbed = `${mail.subject} ${fullContent.textBody}`;
      
      // 3. Genereer embedding (OpenAI) & Analyse (Gemini) in parallel
      const [embedding, aiAnalysis] = await Promise.all([
        vectorService.generateEmbedding(textToEmbed),
        geminiService.analyzeMail(mail.subject, fullContent.textBody)
      ]);
      
      if (embedding.length > 0) {
        const accountId = process.env.IMAP_USER || 'default';
        
        // 4. Opslaan in DB met AI Context
        await db.insert(mailContent).values({
          accountId,
          uid: parseInt(mail.id),
          sender: mail.sender,
          subject: mail.subject,
          date: new Date(mail.date),
          textBody: fullContent.textBody,
          htmlBody: fullContent.htmlBody,
          threadId: mail.threadId,
          iapContext: aiAnalysis, // Sla de Gemini analyse op
        }).onConflictDoUpdate({
          target: [mailContent.uid, mailContent.accountId],
          set: {
            textBody: fullContent.textBody,
            htmlBody: fullContent.htmlBody,
            date: new Date(mail.date),
            iapContext: aiAnalysis
          }
        });
        
        syncedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount, 
      message: `${syncedCount} mails succesvol geanalyseerd en geindexeerd.` 
    });

  } catch (error: any) {
    console.error(' AI Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
