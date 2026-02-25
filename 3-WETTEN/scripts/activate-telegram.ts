import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function activateTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.voices.be';
  const webhookUrl = `${baseUrl}/api/telegram/webhook/`; // 🚀 Added trailing slash for Vercel compliance

  if (!token) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env.local');
    process.exit(1);
  }

  if (!secret) {
    console.error('❌ Error: TELEGRAM_WEBHOOK_SECRET is not set in .env.local');
    process.exit(1);
  }

  console.log(`📱 Activating Telegram Webhook for Bob...`);
  console.log(`🔗 Webhook URL: ${webhookUrl}`);
  console.log(`🔐 Secret Token: ${secret.slice(0, 4)}... (masked)`);

  const setWebhookUrl = `https://api.telegram.org/bot${token}/setWebhook`;
  const body = JSON.stringify({
    url: webhookUrl,
    secret_token: secret
  });

  try {
    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Telegram Webhook successfully registered!');
      console.log(`📝 Result: ${result.description}`);
    } else {
      console.error('❌ Failed to register Telegram Webhook:');
      console.error(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during Telegram activation:', error);
    process.exit(1);
  }
}

activateTelegram();
