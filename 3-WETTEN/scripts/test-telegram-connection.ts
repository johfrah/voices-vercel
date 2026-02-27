
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from the web app directory
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function testTelegram() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminIds = (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').filter(Boolean);

  if (!botToken || adminIds.length === 0) {
    console.error('❌ Fout: TELEGRAM_BOT_TOKEN of TELEGRAM_ALLOWED_USER_IDS ontbreekt in .env.local');
    process.exit(1);
  }

  console.log(`🚀 Testbericht versturen naar ${adminIds.length} admins...`);

  const message = `<b>🔔 TEST BERICHT - VOICES NUCLEAR MODE</b>\n\nHallo Johfrah! Dit is een test om te bevestigen dat de Telegram-verbinding werkt.\n\nIk start nu met de 25 testscenario's voor de verschillende Worlds.\n\n-- Chris / Autist`;

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
      if (data.ok) {
        console.log(`✅ Succesvol verstuurd naar ${chatId}`);
      } else {
        console.error(`❌ Fout bij versturen naar ${chatId}:`, data);
      }
    } catch (error) {
      console.error(`❌ Fetch fout voor ${chatId}:`, error);
    }
  }
}

testTelegram();
