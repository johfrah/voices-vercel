#!/usr/bin/env tsx
/**
 * 🤖 VOICY LIVE TEST SCRIPT (v2.15.046)
 * 
 * Tests Voicy on the live production site to verify:
 * 1. AI response quality and speed
 * 2. Telegram notifications (💬 user, 🤖 AI)
 * 3. Push notifications
 * 4. Database persistence
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../1-SITE/apps/web/.env.local') });

const LIVE_URL = 'https://www.voices.be';
const API_ENDPOINT = `${LIVE_URL}/api/chat`;

interface TestScenario {
  name: string;
  journey: string;
  message: string;
  expectedKeywords: string[];
  language?: string;
}

const scenarios: TestScenario[] = [
  {
    name: 'General Price Inquiry (Agency)',
    journey: 'agency',
    message: 'Wat kost een voice-over voor een bedrijfsvideo van 2 minuten?',
    expectedKeywords: ['prijs', 'video', 'woorden', 'tarief'],
    language: 'nl'
  },
  {
    name: 'Workshop Inquiry (Studio)',
    journey: 'studio',
    message: 'Wanneer is de volgende voice-over workshop?',
    expectedKeywords: ['workshop', 'datum', 'editie'],
    language: 'nl'
  },
  {
    name: 'Human Takeover Request',
    journey: 'agency',
    message: 'Ik wil graag met Johfrah spreken',
    expectedKeywords: ['johfrah', 'contact', 'spreken'],
    language: 'nl'
  },
  {
    name: 'English Language Detection',
    journey: 'agency',
    message: 'How much does a voice-over cost for a 2-minute corporate video?',
    expectedKeywords: ['price', 'video', 'words'],
    language: 'en'
  }
];

async function testVoicyConversation(scenario: TestScenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${scenario.name}`);
  console.log(`${'='.repeat(60)}\n`);

  const startTime = Date.now();

  try {
    // Send user message
    console.log(`📤 Sending user message: "${scenario.message}"`);
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send',
        message: scenario.message,
        senderType: 'user',
        context: {
          journey: scenario.journey
        },
        language: scenario.language || 'nl',
        mode: 'ask',
        persona: 'voicy'
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Response: ${errorText}`);
      return {
        success: false,
        scenario: scenario.name,
        error: `HTTP ${response.status}`,
        responseTime
      };
    }

    const data = await response.json();

    console.log(`\n✅ Response received in ${responseTime}ms`);
    console.log(`📊 Conversation ID: ${data.conversationId || 'N/A'}`);
    console.log(`🤖 AI Response:\n${data.content?.substring(0, 200)}...`);
    console.log(`\n🎬 Actions:`, data.actions?.map((a: any) => a.label).join(', ') || 'None');

    // Verify response quality
    const hasExpectedKeywords = scenario.expectedKeywords.some(keyword => 
      data.content?.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasExpectedKeywords) {
      console.warn(`⚠️ Warning: Expected keywords not found in response`);
      console.warn(`Expected: ${scenario.expectedKeywords.join(', ')}`);
    }

    // Performance check
    if (responseTime > 3000) {
      console.warn(`⚠️ Warning: Response time exceeded 3 seconds (${responseTime}ms)`);
    } else {
      console.log(`✅ Performance: Response time within acceptable range`);
    }

    return {
      success: true,
      scenario: scenario.name,
      conversationId: data.conversationId,
      responseTime,
      hasExpectedKeywords,
      aiResponse: data.content?.substring(0, 100),
      actions: data.actions?.length || 0
    };

  } catch (error: any) {
    console.error(`❌ Test failed: ${error.message}`);
    return {
      success: false,
      scenario: scenario.name,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

async function checkDatabasePersistence(conversationId: number) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Checking Database Persistence for Conversation #${conversationId}`);
  console.log(`${'='.repeat(60)}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment');
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/chat_messages?conversation_id=eq.${conversationId}&select=id,sender_type,message,created_at&order=created_at.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to fetch messages: ${response.status}`);
      return;
    }

    const messages = await response.json();
    console.log(`✅ Found ${messages.length} messages in database:`);
    
    messages.forEach((msg: any, idx: number) => {
      const emoji = msg.sender_type === 'user' ? '💬' : '🤖';
      console.log(`  ${emoji} [${msg.sender_type}] ${msg.message.substring(0, 50)}...`);
    });

    // Check for both user and AI messages
    const hasUserMessage = messages.some((m: any) => m.sender_type === 'user');
    const hasAiMessage = messages.some((m: any) => m.sender_type === 'ai');

    if (hasUserMessage && hasAiMessage) {
      console.log(`\n✅ Database persistence: PASSED`);
    } else {
      console.warn(`\n⚠️ Warning: Missing message types (User: ${hasUserMessage}, AI: ${hasAiMessage})`);
    }

  } catch (error: any) {
    console.error(`❌ Database check failed: ${error.message}`);
  }
}

async function checkSystemEvents() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Checking System Events for Notification Errors`);
  console.log(`${'='.repeat(60)}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment');
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/system_events?select=id,level,source,message,created_at&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to fetch system events: ${response.status}`);
      return;
    }

    const events = await response.json();
    const recentErrors = events.filter((e: any) => 
      e.level === 'error' || e.level === 'critical'
    );

    if (recentErrors.length > 0) {
      console.warn(`⚠️ Found ${recentErrors.length} recent errors:`);
      recentErrors.forEach((e: any) => {
        console.warn(`  [${e.level}] ${e.source}: ${e.message.substring(0, 80)}...`);
      });
    } else {
      console.log(`✅ No recent errors found in system events`);
    }

  } catch (error: any) {
    console.error(`❌ System events check failed: ${error.message}`);
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       🤖 VOICY LIVE TEST SUITE - v2.15.046               ║
║                                                           ║
║       Testing on: ${LIVE_URL}                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const results = [];

  // Run all test scenarios
  for (const scenario of scenarios) {
    const result = await testVoicyConversation(scenario);
    results.push(result);

    // Check database persistence if we have a conversation ID
    if (result.success && result.conversationId) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DB write
      await checkDatabasePersistence(result.conversationId);
    }

    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Check for system errors
  await checkSystemEvents();

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Average Response Time: ${Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms\n`);

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.scenario} (${r.responseTime}ms)`);
    if (r.error) {
      console.log(`   Error: ${r.error}`);
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 MANUAL VERIFICATION REQUIRED:`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`1. Check Telegram for notifications with correct emojis (💬 user, 🤖 AI)`);
  console.log(`2. Verify Telegram links point to /admin/live-chat`);
  console.log(`3. Check for push notifications on subscribed devices`);
  console.log(`4. Verify email notifications were sent to admin`);
  console.log(`\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
