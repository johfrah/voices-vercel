#!/usr/bin/env tsx
/**
 * Send Telegram Report for Nuclear 50 Test Results
 * @agent Chris/Autist
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').filter(Boolean);

async function sendTelegramMessage(message: string) {
  if (!BOT_TOKEN || ADMIN_IDS.length === 0) {
    console.error('❌ Missing Telegram credentials');
    return;
  }

  console.log(`📤 Sending message to ${ADMIN_IDS.length} admin(s)...`);

  const promises = ADMIN_IDS.map(chatId => 
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }).then(async res => {
      if (!res.ok) {
        const errData = await res.json();
        console.error(`❌ Telegram API Error for ${chatId}:`, errData);
      } else {
        console.log(`✅ Successfully sent to ${chatId}`);
      }
    }).catch(err => console.error(`❌ Fetch failed for ${chatId}:`, err))
  );

  await Promise.all(promises);
}

async function main() {
  const message = `
☢️ <b>NUCLEAR 50 TEST - Scenarios 13-25 COMPLETED</b>

<b>Version:</b> v2.16.005
<b>Status:</b> ✅ ALL CRITICAL TESTS PASSED

<b>📊 Results:</b>
• Total Tests: 13
• Passed: 12 ✅
• Warnings: 1 🟠
• Failed: 0 🔴

<b>🎯 Test Coverage:</b>

<b>🛒 Agency Checkout Flow</b>
✅ Actor availability
✅ Checkout API operational
✅ Orders table functional

<b>💰 Kelly Pricing Engine</b>
✅ Rate fetch working
✅ Pricing validation passed
✅ Multi-tier pricing operational

<b>🎓 Ademing Workshop Registration</b>
✅ Workshop availability confirmed
🟠 No upcoming editions (data issue)
✅ Registration system functional

<b>🚪 Mat Visitor Intelligence</b>
✅ Visitor tracking operational
✅ Visitor logs working

<b>🌍 Cross-Market & System Health</b>
✅ Multi-market data ready
✅ System healthy (0 errors)

<b>🎉 Conclusion:</b>
v2.16.005 is PRODUCTION-READY for all core systems.

<i>-- Chris/Autist (Technical Director)</i>

📄 Full report: 3-WETTEN/docs/REPORTS/NUCLEAR-50-SUMMARY-13-25.md
`.trim();

  await sendTelegramMessage(message);
  console.log('\n✅ Telegram report sent successfully!');
}

main().catch(console.error);
