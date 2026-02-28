import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatConversations, chatMessages, faq } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { eq, desc, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

/**
 * VERACITY AUDIT (LEX-MANDATE)
 * Controleert of Voicy antwoorden voldoen aan de wetten van de Harmonieraad.
 */
async function performVeracityAudit() {
  console.log('⚖️ Starting Forensic Veracity Audit (Lex-Mandate)...');

  try {
    // Haal de laatste 50 AI antwoorden op
    const messages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.senderType, 'ai'))
      .orderBy(desc(chatMessages.id))
      .limit(50);

    let auditReport = `# ⚖️ Voicy Veracity Audit Report (Lex-Mandate)\n`;
    auditReport += `*Audit uitgevoerd op: ${new Date().toLocaleString('nl-BE')}*\n\n`;
    
    auditReport += `## 📜 De Wetten die we toetsen:\n`;
    auditReport += `1. **Lex-Mandate**: Geen valse beloftes over prijzen of BTW.\n`;
    auditReport += `2. **Bob-Method**: Gebruik van "Natural Capitalization" en warme toon.\n`;
    auditReport += `3. **Berny-Mandate**: In Studio/Academy context GEEN AI-stemmen promoten.\n`;
    auditReport += `4. **Chris-Protocol**: Geen AI-slop ("Als AI-model...").\n\n`;

    auditReport += `## 🔍 Bevindingen per Bericht\n\n`;

    let violations = 0;

    for (const msg of messages) {
      const content = msg.message;
      const issues = [];

      // 1. Check op AI-slop
      if (/als ai-model|taalmodel|mijn excuses voor het ongemak/i.test(content)) {
        issues.push("❌ **Chris-Protocol Schending**: AI-slop gedetecteerd.");
      }

      // 2. Check op Berny-Mandate (AI in Studio context)
      // We halen de conversatie op om de journey te checken
      const [conv] = await db.select().from(chatConversations).where(eq(chatConversations.id, msg.conversationId));
      if (conv?.iapContext?.journey === 'studio' && /ai-stem|synthetisch|computerstem/i.test(content)) {
        issues.push("❌ **Berny-Mandate Schending**: AI-stemmen gepromoot in Studio context.");
      }

      // 3. Check op prijzen (Lex-Mandate)
      if (/gratis|0 euro|geen kosten/i.test(content) && !content.includes("proefles")) {
        issues.push("⚠️ **Lex-Mandate Waarschuwing**: Mogelijke valse belofte over kosten.");
      }

      // 4. Check op Natural Capitalization (Bob-Method)
      if (content === content.toUpperCase() && content.length > 20) {
        issues.push("❌ **Bob-Method Schending**: GEEN NATURAL CAPITALIZATION (Schreeuwend).");
      }

      if (issues.length > 0) {
        violations++;
        auditReport += `### 💬 Bericht #${msg.id} (Conv #${msg.conversationId})\n`;
        auditReport += `> **Voicy**: ${content}\n\n`;
        issues.forEach(issue => auditReport += `- ${issue}\n`);
        auditReport += `\n---\n\n`;
      }
    }

    if (violations === 0) {
      auditReport += `✅ **GEEN SCHENDINGEN GEVONDEN**. Voicy houdt zich strikt aan de wetten van de Harmonieraad.\n`;
    } else {
      auditReport += `### ⚠️ Totaal aantal aandachtspunten: ${violations}\n`;
    }

    const reportPath = path.resolve(process.cwd(), '3-WETTEN/reports/voicy-veracity-audit.md');
    fs.writeFileSync(reportPath, auditReport);
    console.log(`✅ Veracity Audit generated at ${reportPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

performVeracityAudit();
