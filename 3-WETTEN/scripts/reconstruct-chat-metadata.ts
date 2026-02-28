import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatMessages, chatConversations, faq } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { eq, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables manually for the script
const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
if (fs.existsSync(envPath)) {
  console.log(`📡 Loading env from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error(`❌ Env file not found at ${envPath}`);
}

/**
 * RECONSTRUCT CHAT METADATA (v2.16.058)
 * Herstelt interaction_type en metadata voor oude berichten
 */
async function reconstructMetadata() {
  console.log('🚀 Starting Forensic Metadata Reconstruction...');

  try {
    // 1. Haal alle FAQ vragen op als referentie voor 'chips'
    const faqs = await db.select().from(faq);
    const faqQuestions = faqs.flatMap((f: any) => [
      f.questionNl?.toLowerCase().trim(),
      f.questionEn?.toLowerCase().trim()
    ]).filter(Boolean);

    // Bekende chip labels
    const chipLabels = [
      "tarieven", "hoe werkt het?", "stemmen zoeken", "direct boeken", 
      "workshop data", "locatie & studio", "aan de slag", "cursus aanbod", 
      "gratis proefles", "prijs berekenen", "offerte aanvragen"
    ].map(l => l.toLowerCase());

    // 2. Haal berichten op van de afgelopen 7 dagen
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messages = await db.select()
      .from(chatMessages)
      .where(sql`${chatMessages.createdAt} > ${sevenDaysAgo.toISOString()}`);

    console.log(`🔍 Scanning ${messages.length} messages for reconstruction...`);

    let updatedCount = 0;

    for (const msg of messages) {
      const currentMetadata = (msg.attachments as any) || {}; // We gebruiken attachments als metadata opslag
      
      // Sla over als interaction_type al bestaat
      if (currentMetadata.interaction_type) continue;

      let interactionType = 'text';
      const content = msg.message?.toLowerCase().trim() || '';

      // A. Check voor Tool (Admin commands)
      if (content.startsWith('/') || msg.senderType === 'admin') {
        interactionType = content.startsWith('/') ? 'tool' : 'text';
      } 
      // B. Check voor Chip (FAQ match of Label match)
      else if (faqQuestions.includes(content) || chipLabels.includes(content) || chipLabels.some(l => content.includes(l) && content.length < 30)) {
        interactionType = 'chip';
      }

      // Update als we iets gevonden hebben
      if (interactionType !== 'text') {
        console.log(`✨ Reconstructing message #${msg.id}: "${content.substring(0, 20)}..." as ${interactionType}`);
        
        const newMetadata = {
          ...currentMetadata,
          interaction_type: interactionType,
          reconstructed: true,
          reconstructed_at: new Date().toISOString()
        };

        await db.update(chatMessages)
          .set({
            attachments: newMetadata
          })
          .where(eq(chatMessages.id, msg.id));
        
        updatedCount++;
      }
    }

    console.log(`✅ Reconstruction complete. Updated ${updatedCount} messages.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Reconstruction failed:', error);
    process.exit(1);
  }
}

reconstructMetadata();
