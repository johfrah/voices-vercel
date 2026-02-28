import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatConversations, chatMessages } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { count, eq, gt, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

async function auditChatCounts() {
  console.log('🕵️ Forensic Chat Audit...');

  try {
    // 1. Totaal aantal rijen in chat_conversations
    const [totalRows] = await db.select({ value: count() }).from(chatConversations);
    
    // 2. Aantal gesprekken MET minimaal 1 bericht
    const [withMessages] = await db.select({ value: count() })
      .from(chatConversations)
      .where(sql`EXISTS (SELECT 1 FROM chat_messages WHERE conversation_id = chat_conversations.id)`);

    // 3. Aantal gesprekken van de afgelopen 30 dagen
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [recentCount] = await db.select({ value: count() })
      .from(chatConversations)
      .where(gt(chatConversations.createdAt, thirtyDaysAgo));

    // 4. Check voor legacy data (bijv. wp_id aanwezig)
    const [legacyCount] = await db.select({ value: count() })
      .from(chatConversations)
      .where(sql`wp_id IS NOT NULL`);

    console.log(`
📊 AUDIT RESULTATEN:
-------------------
Totaal aantal rijen in DB:    ${totalRows.value}
Gesprekken met inhoud:        ${withMessages.value} (Echte interacties)
Lege sessies (Ghost chats):   ${totalRows.value - withMessages.value}
Recent (laatste 30 dagen):    ${recentCount.value}
Legacy (WordPress import):    ${legacyCount.value}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

auditChatCounts();
