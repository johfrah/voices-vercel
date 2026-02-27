#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local from the web app directory
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function monitorTelegram() {
  console.log('📡 Monitoring chat_messages for Telegram interactions (via SDK)...');
  
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, message, sender_type, created_at, conversation_id')
      .eq('sender_type', 'user')
      .order('id', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!messages || messages.length === 0) {
      console.log('📭 No recent user messages found.');
    } else {
      console.log(`📥 Found ${messages.length} recent user messages:`);
      messages.forEach((msg: any) => {
        console.log(`[${msg.created_at}] #${msg.conversation_id}: ${msg.message}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error monitoring chat_messages:', error.message);
  }
}

async function sendTelegramAlert(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminIds = (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').filter(Boolean);

  if (!botToken || adminIds.length === 0) {
    console.error('❌ Fout: TELEGRAM_BOT_TOKEN of TELEGRAM_ALLOWED_USER_IDS ontbreekt.');
    return;
  }

  for (const chatId of adminIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      if (data.ok) console.log(`✅ Alert verstuurd naar ${chatId}`);
      else console.error(`❌ Fout bij alert naar ${chatId}:`, data);
    } catch (error) {
      console.error(`❌ Fetch fout voor ${chatId}:`, error);
    }
  }
}

const action = process.argv[2];
const arg1 = process.argv[3];

if (action === 'monitor') {
  monitorTelegram().catch(console.error);
} else if (action === 'alert') {
  sendTelegramAlert(arg1 || 'Geen bericht opgegeven').catch(console.error);
} else {
  console.log('Gebruik: npx tsx 3-WETTEN/scripts/monitor-telegram.ts [monitor|alert "bericht"]');
}
