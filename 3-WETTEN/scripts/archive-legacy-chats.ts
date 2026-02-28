import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index';
import { chatConversations } from '../../1-SITE/apps/web/src/lib/core-internal/database/schema/index';
import { eq, isNotNull, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

async function archiveLegacyChats() {
  console.log('📦 Archiving Legacy WordPress Chats...');

  try {
    // 1. Archiveer alle gesprekken met een wp_id
    await db.update(chatConversations)
      .set({ 
        status: 'archived',
        updatedAt: new Date()
      })
      .where(isNotNull(chatConversations.wpId));

    console.log(`✅ Successfully archived legacy conversations.`);
    
    // 2. Ook ghost chats (0 berichten) van langer dan 7 dagen geleden archiveren
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoDate = sevenDaysAgo.toISOString();
    
    await db.update(chatConversations)
      .set({ 
        status: 'archived',
        updatedAt: new Date()
      })
      .where(sql`
        NOT EXISTS (SELECT 1 FROM chat_messages WHERE conversation_id = chat_conversations.id)
        AND created_at < ${isoDate}
      `);

    console.log(`✅ Successfully archived old ghost sessions.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Archiving failed:', error);
    process.exit(1);
  }
}

archiveLegacyChats();
