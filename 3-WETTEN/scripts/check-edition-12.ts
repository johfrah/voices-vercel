import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEdition12() {
  console.log('🔍 Checking Edition 12...\n');

  // Check edition 12 specifically
  const { data: edition, error: editionError } = await supabase
    .from('workshop_editions')
    .select(`
      *,
      workshop:workshops(*),
      location:locations(*),
      instructor:instructors(*)
    `)
    .eq('id', 12)
    .maybeSingle();

  if (editionError) {
    console.error('❌ ERROR FETCHING EDITION 12:');
    console.error(editionError);
    return;
  }

  if (!edition) {
    console.log('⚠️  Edition 12 not found in database!');
    return;
  }

  console.log('✅ EDITION 12 FOUND:');
  console.log('  ID:', edition.id);
  console.log('  Title:', edition.title);
  console.log('  Date:', edition.date);
  console.log('  Status:', edition.status);
  console.log('  Workshop ID:', edition.workshop_id);
  console.log('  Location ID:', edition.location_id);
  console.log('  Instructor ID:', edition.instructor_id);
  console.log('\n  Workshop Data:', edition.workshop ? 'Present' : '❌ NULL');
  if (edition.workshop) {
    console.log('    - ID:', (edition.workshop as any).id);
    console.log('    - Title:', (edition.workshop as any).title);
  }
  console.log('  Location Data:', edition.location ? 'Present' : '❌ NULL');
  if (edition.location) {
    console.log('    - ID:', (edition.location as any).id);
    console.log('    - Name:', (edition.location as any).name);
  }
  console.log('  Instructor Data:', edition.instructor ? 'Present' : '❌ NULL');
  if (edition.instructor) {
    console.log('    - ID:', (edition.instructor as any).id);
    console.log('    - Name:', (edition.instructor as any).name);
  }

  // Check participants for edition 12
  const { data: participants, error: participantsError } = await supabase
    .from('order_items')
    .select(`
      *,
      order:orders(*)
    `)
    .eq('edition_id', 12);

  if (participantsError) {
    console.error('\n❌ ERROR FETCHING PARTICIPANTS:');
    console.error(participantsError);
  } else {
    console.log(`\n👥 PARTICIPANTS: ${participants?.length || 0} found`);
    if (participants && participants.length > 0) {
      participants.slice(0, 3).forEach((p, i) => {
        console.log(`\n  [${i + 1}] Order Item #${p.id}`);
        console.log(`      Order ID: ${p.order_id}`);
        console.log(`      Price: ${p.price}`);
        console.log(`      Has meta_data: ${!!p.meta_data}`);
        console.log(`      Has order: ${!!p.order}`);
      });
    }
  }

  // Check costs for edition 12
  const { data: costs, error: costsError } = await supabase
    .from('costs')
    .select('*')
    .eq('workshop_edition_id', 12);

  if (costsError) {
    console.error('\n❌ ERROR FETCHING COSTS:');
    console.error(costsError);
  } else {
    console.log(`\n💰 COSTS: ${costs?.length || 0} found`);
  }

  // Check recent system events related to workshops
  const { data: events, error: eventsError } = await supabase
    .from('system_events')
    .select('*')
    .in('severity', ['error', 'critical'])
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (!eventsError && events && events.length > 0) {
    console.log('\n🚨 RECENT ERRORS (Last hour):');
    events.forEach(e => {
      console.log(`  [${e.created_at}] ${e.event_type}: ${e.message}`);
      if (e.context) {
        console.log(`    Context:`, JSON.stringify(e.context, null, 2));
      }
    });
  } else {
    console.log('\n✅ No recent errors in system_events');
  }
}

checkEdition12().catch(console.error);
