#!/usr/bin/env tsx
import { db, chatMessages, chatConversations } from '../1-SITE/apps/web/src/lib/system/voices-config';
import { desc, eq, and, gte } from 'drizzle-orm';

async function monitorTelegram() {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // Last hour
  
  console.log('📡 Monitoring chat_messages for Telegram interactions...');
  
  const messages = await db.select({
    id: chatMessages.id,
    message: chatMessages.message,
    senderType: chatMessages.senderType,
    createdAt: chatMessages.createdAt,
    conversationId: chatMessages.conversationId
  })
  .from(chatMessages)
  .where(and(
    gte(chatMessages.createdAt, cutoff),
    eq(chatMessages.senderType, 'user')
  ))
  .orderBy(desc(chatMessages.id))
  .limit(10);

  if (messages.length === 0) {
    console.log('📭 No recent user messages found.');
  } else {
    console.log(`📥 Found ${messages.length} recent user messages:`);
    messages.forEach((msg: any) => {
      console.log(`[${msg.createdAt}] #${msg.conversationId}: ${msg.message}`);
    });
  }
}

monitorTelegram().catch(console.error);
