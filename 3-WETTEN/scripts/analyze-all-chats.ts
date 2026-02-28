import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatConversations, chatMessages } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { count, eq, desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

async function analyzeConversations() {
  console.log('📊 Starting Global Chat Analysis...');

  try {
    // 1. Totaal aantal conversaties
    const [totalResult] = await db.select({ value: count() }).from(chatConversations);
    const totalCount = totalResult.value;
    console.log(`Total Conversations: ${totalCount}`);

    // 2. Haal de laatste 50 conversaties op voor diepe analyse
    const conversations = await db.select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.id))
      .limit(50);

    console.log('\n--- ANALYSE PER GESPREK (Laatste 50) ---\n');

    for (const conv of conversations) {
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, conv.id))
        .orderBy(chatMessages.id);

      const userMsgs = messages.filter((m: any) => m.senderType === 'user');
      const aiMsgs = messages.filter((m: any) => m.senderType === 'ai');
      
      const guestInfo = conv.guestName ? `${conv.guestName} (${conv.guestEmail || 'geen email'})` : 'Anoniem';
      const status = conv.status || 'open';
      const lastMsg = messages[messages.length - 1];

      console.log(`ID #${conv.id} | Klant: ${guestInfo} | Status: ${status}`);
      console.log(`   └ Berichten: ${messages.length} (User: ${userMsgs.length}, AI: ${aiMsgs.length})`);
      
      if (userMsgs.length > 0) {
        console.log(`   └ Eerste vraag: "${userMsgs[0].message.substring(0, 60)}..."`);
      }
      
      if (lastMsg) {
        const time = new Date(lastMsg.createdAt).toLocaleString('nl-BE');
        console.log(`   └ Laatste interactie: ${time}`);
      }
      console.log('-------------------------------------------');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

analyzeConversations();
