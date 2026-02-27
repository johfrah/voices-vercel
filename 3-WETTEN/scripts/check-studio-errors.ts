import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudioErrors() {
  console.log('🔍 Checking for studio/workshop related errors...\n');
  
  // Check system_events for studio errors
  const { data: events, error: eventsError } = await supabase
    .from('system_events')
    .select('*')
    .or('component.ilike.%studio%,error.ilike.%workshop%')
    .order('created_at', { ascending: false })
    .limit(10);

  if (eventsError) {
    console.error('❌ Error fetching system_events:', eventsError.message);
  } else {
    console.log(`📊 Found ${events?.length || 0} studio-related errors in last 10 entries`);
    if (events && events.length > 0) {
      events.forEach((event: any) => {
        console.log(`\n⚠️  ${event.level?.toUpperCase()} at ${event.created_at}`);
        console.log(`   Component: ${event.component}`);
        console.log(`   Error: ${event.error}`);
      });
    } else {
      console.log('✅ No studio-related errors found');
    }
  }

  // Check workshops table
  const { data: workshops, error: workshopsError } = await supabase
    .from('workshops')
    .select('id, title, slug, status')
    .order('id');

  if (workshopsError) {
    console.error('\n❌ Error fetching workshops:', workshopsError.message);
  } else {
    console.log(`\n📚 Found ${workshops?.length || 0} workshops:`);
    workshops?.forEach((w: any) => {
      console.log(`   - ${w.title} (${w.slug}) [${w.status}]`);
    });
  }

  // Check workshop_editions
  const { data: editions, error: editionsError } = await supabase
    .from('workshop_editions')
    .select('id, date, status, workshop_id, workshops(title)')
    .gte('date', new Date().toISOString())
    .order('date');

  if (editionsError) {
    console.error('\n❌ Error fetching editions:', editionsError.message);
  } else {
    console.log(`\n📅 Found ${editions?.length || 0} upcoming editions:`);
    editions?.forEach((e: any) => {
      const workshop = Array.isArray(e.workshops) ? e.workshops[0] : e.workshops;
      console.log(`   - ${workshop?.title || 'Unknown'} on ${e.date} [${e.status}]`);
    });
  }

  // Check content_pages for studio
  const { data: contentPages, error: pagesError } = await supabase
    .from('content_pages')
    .select('id, slug, status')
    .eq('slug', 'studio')
    .maybeSingle();

  if (pagesError) {
    console.error('\n❌ Error fetching content page:', pagesError.message);
  } else if (contentPages) {
    console.log(`\n📄 Studio content page: ${contentPages?.slug} [${contentPages?.status}]`);
    
    // Check content_blocks for studio
    const { data: blocks, error: blocksError } = await supabase
      .from('content_blocks')
      .select('id, type, page_id, display_order')
      .eq('page_id', contentPages.id)
      .order('display_order');

    if (blocksError) {
      console.error('\n❌ Error fetching content blocks:', blocksError.message);
    } else {
      console.log(`\n🧱 Studio page has ${blocks?.length || 0} blocks:`);
      blocks?.forEach((b: any) => {
        console.log(`   - ${b.type} (order: ${b.display_order})`);
      });
    }
  } else {
    console.log('\n⚠️  No content_pages entry found for studio');
  }
}

checkStudioErrors().catch(console.error);
