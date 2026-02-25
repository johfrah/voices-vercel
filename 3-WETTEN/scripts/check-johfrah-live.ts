#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkJohfrahLive() {
  console.log('🔍 Checking Johfrah live status...\n');

  // Check recent system events
  const { data: events, error: eventsError } = await supabase
    .from('system_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (eventsError) {
    console.error('❌ Error fetching system events:', eventsError);
  } else {
    console.log('📊 Recent System Events:');
    events?.forEach((event) => {
      const timestamp = new Date(event.created_at).toLocaleString();
      console.log(`  ${event.severity === 'error' ? '❌' : '⚠️'} [${timestamp}] ${event.event_type}`);
      console.log(`     ${event.message}`);
      if (event.details) {
        console.log(`     Details: ${JSON.stringify(event.details).substring(0, 100)}...`);
      }
    });
  }

  // Check Johfrah actor data
  const { data: actor, error: actorError } = await supabase
    .from('voice_actors')
    .select('*')
    .eq('slug', 'johfrah')
    .single();

  if (actorError) {
    console.error('\n❌ Error fetching Johfrah:', actorError);
  } else {
    console.log('\n✅ Johfrah Actor Data:');
    console.log(`   ID: ${actor.id}`);
    console.log(`   Name: ${actor.first_name} ${actor.last_name}`);
    console.log(`   Status: ${actor.status}`);
    console.log(`   Public: ${actor.is_public}`);
    console.log(`   Slug: ${actor.slug}`);
  }

  // Check Johfrah's demos
  const { data: demos, error: demosError } = await supabase
    .from('voice_demos')
    .select('*')
    .eq('voice_actor_id', actor?.id)
    .eq('is_active', true);

  if (demosError) {
    console.error('\n❌ Error fetching demos:', demosError);
  } else {
    console.log(`\n🎙️ Active Demos: ${demos?.length || 0}`);
    demos?.forEach((demo) => {
      console.log(`   - ${demo.title} (${demo.demo_type})`);
    });
  }
}

checkJohfrahLive().catch(console.error);
