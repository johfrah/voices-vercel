import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatConversations, chatMessages } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { eq, desc, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

async function generateAtomicLeadReport() {
  console.log('🚀 Generating Atomic Chat & Lead Report...');

  try {
    // 1. Haal alle gesprekken op met berichten, gesorteerd op recentheid
    const conversations = await db.select()
      .from(chatConversations)
      .where(sql`EXISTS (SELECT 1 FROM chat_messages WHERE conversation_id = chat_conversations.id)`)
      .orderBy(desc(chatConversations.id));

    let md = `# 💎 Atomic Chat & Lead Intelligence Report\n`;
    md += `*Gegenereerd op: ${new Date().toLocaleString('nl-BE')}*\n\n`;
    
    md += `## 📊 Executive Summary\n`;
    md += `- **Totaal gesprekken met inhoud**: ${conversations.length}\n`;
    md += `- **Potentiële Leads (met contactinfo)**: ${conversations.filter((c: any) => c.guestEmail || c.guestName).length}\n`;
    md += `- **Hoogste Vibe**: ${conversations.filter((c: any) => c.iapContext?.vibe === 'burning').length} burning sessies\n\n`;

    md += `## 🎯 High-Value Leads & Interacties\n\n`;

    for (const conv of conversations) {
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, conv.id))
        .orderBy(chatMessages.id);

      if (messages.length === 0) continue;

      const userMsgs = messages.filter((m: any) => m.senderType === 'user');
      const aiMsgs = messages.filter((m: any) => m.senderType === 'ai');
      
      // Lead Scoring
      const hasEmail = !!conv.guestEmail;
      const hasName = !!conv.guestName;
      const isBurning = conv.iapContext?.vibe === 'burning';
      const mentionsPrice = userMsgs.some((m: any) => /prijs|kost|offerte|euro|€/i.test(m.message));
      const mentionsBooking = userMsgs.some((m: any) => /boeken|bestellen|inschrijven/i.test(m.message));

      if (!hasEmail && !isBurning && !mentionsPrice && !mentionsBooking && userMsgs.length < 2) continue;

      md += `### 💬 Gesprek #${conv.id} ${isBurning ? '🔥' : ''}\n`;
      md += `- **Klant**: ${conv.guestName || 'Anoniem'} ${conv.guestEmail ? `(${conv.guestEmail})` : ''}\n`;
      md += `- **Status**: \`${conv.status}\` | **Journey**: \`${conv.iapContext?.journey || 'onbekend'}\`\n`;
      md += `- **Context**: Pagina: \`${conv.iapContext?.sensor?.current_page || 'onbekend'}\`\n`;
      
      md += `\n**Dialoog:**\n`;
      messages.forEach((m: any) => {
        const role = m.senderType === 'ai' ? '🤖 Voicy' : (m.senderType === 'admin' ? '👤 Admin' : '👤 Klant');
        md += `> **${role}**: ${m.message}\n`;
      });
      
      md += `\n---\n\n`;
    }

    const reportPath = path.resolve(process.cwd(), '3-WETTEN/reports/atomic-lead-intelligence.md');
    fs.writeFileSync(reportPath, md);
    console.log(`✅ Atomic Report generated at ${reportPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  }
}

generateAtomicLeadReport();
