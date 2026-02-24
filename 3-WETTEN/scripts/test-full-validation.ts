import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const testEmail = `test-full-flow-${Date.now()}@voices.be`;
  console.log(`🧪 Starting Full Flow Validation for: ${testEmail}`);

  // 1. Trigger the link generation via API
  console.log('1. Requesting magic link...');
  const siteUrl = 'https://www.voices.be';
  const res = await fetch(`${siteUrl}/api/auth/send-magic-link/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, redirect: '/account' })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('❌ Failed to request link:', error);
    return;
  }
  console.log('✅ Link requested successfully.');

  // 2. Poll the Watchdog for the link
  console.log('2. Polling Watchdog for the generated link...');
  let voicesLink = null;
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .eq('level', 'info')
      .ilike('message', `%Magic link generated for ${testEmail}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      voicesLink = data[0].details.link;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (!voicesLink) {
    console.error('❌ Could not find link in Watchdog after 20 seconds.');
    return;
  }
  console.log(`✅ Link found: ${voicesLink}`);

  // 3. The final step (visiting the link) will be done by the browser-agent
  console.log(`🚀 FINAL ACTION: Visit the link: ${voicesLink}`);
}

run();
