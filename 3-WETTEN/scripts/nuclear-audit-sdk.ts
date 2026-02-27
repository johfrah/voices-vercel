import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runNuclearAudit() {
  console.log('🚀 STARTING NUCLEAR AUDIT (SDK MODE)...\n');

  // 1. System Events Check
  console.log('🔍 Checking system_events for recent errors...');
  const { data: events, error: eventError } = await supabase
    .from('system_events')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .in('level', ['error', 'critical'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (eventError) {
    console.error('❌ Failed to check system_events:', eventError.message);
  } else if (events && events.length > 0) {
    console.log(`❌ Found ${events.length} error(s) in the last 24h:`);
    events.forEach(e => console.log(`- [${e.created_at}] ${e.event_type}: ${e.message}`));
  } else {
    console.log('✅ No critical errors in the last 24 hours.');
  }

  // 2. Kelly Pricing Audit
  console.log('\n🕵️ Starting Kelly Pricing Audit...');
  const { data: actor, error: actorError } = await supabase
    .from('actors')
    .select('*')
    .eq('first_name', 'Thomas')
    .limit(1)
    .maybeSingle();

  if (actorError) {
    console.error('❌ Could not find test actor Thomas:', actorError.message);
  } else {
    console.log(`👤 Test Subject: ${actor.first_name} ${actor.last_name}`);
    // Simple verification of rates structure
    if (actor.rates && typeof actor.rates === 'object') {
      console.log('✅ Rates structure found in DB.');
    } else {
      console.log('⚠️ Rates structure missing or invalid.');
    }
  }

  // 3. Mat Visitor Intelligence Check
  console.log('\n🚪 Checking Mat Visitor Intelligence...');
  const { data: visitors, error: visitorError } = await supabase
    .from('visitors')
    .select('*')
    .order('last_visit_at', { ascending: false })
    .limit(5);

  if (visitorError) {
    console.error('❌ Failed to check visitors:', visitorError.message);
  } else if (visitors && visitors.length > 0) {
    console.log(`✅ Found ${visitors.length} recent visitors.`);
    visitors.forEach(v => console.log(`- [${v.last_visit_at}] ${v.visitor_hash?.substring(0,8)}... (${v.journey_state})`));
  } else {
    console.log('⚠️ No visitors found in database.');
  }

  // 4. Cody Vault Check
  console.log('\n🔒 Checking Cody Vault...');
  const { data: vaultFiles, error: vaultError } = await supabase
    .from('vault_files')
    .select('*')
    .limit(5);

  if (vaultError) {
    console.log('⚠️ vault_files table might not exist or error:', vaultError.message);
  } else {
    console.log(`✅ Vault contains ${vaultFiles.length} files.`);
  }

  console.log('\n🏁 NUCLEAR AUDIT COMPLETED.');
}

runNuclearAudit();
