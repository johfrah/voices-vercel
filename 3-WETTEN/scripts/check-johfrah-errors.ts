#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJohfrahErrors() {
  console.log('🔍 Checking for Johfrah route errors in last 5 minutes...\n');
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data: events } = await supabase
    .from('system_events')
    .select('*')
    .or('message.ilike.%johfrah%,message.ilike.%smartrouter%,message.ilike.%getactor%')
    .gte('created_at', fiveMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (events && events.length > 0) {
    console.log(`Found ${events.length} relevant events:\n`);
    events.forEach((e: any) => {
      console.log(`[${e.level.toUpperCase()}] ${e.created_at}`);
      console.log(`Source: ${e.source}`);
      console.log(`Message: ${e.message}`);
      if (e.details) {
        console.log(`Details:`, JSON.stringify(e.details, null, 2));
      }
      console.log('---\n');
    });
  } else {
    console.log('❌ No recent events found for johfrah/smartrouter/getactor');
    console.log('This suggests the route might not be executing at all, or logs are not being captured.');
  }
  
  console.log('\n🔍 Checking for any 404/notFound events in last 5 minutes:\n');
  const { data: notFoundEvents } = await supabase
    .from('system_events')
    .select('*')
    .or('message.ilike.%not found%,message.ilike.%404%,message.ilike.%notfound%')
    .gte('created_at', fiveMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (notFoundEvents && notFoundEvents.length > 0) {
    console.log(`Found ${notFoundEvents.length} not found events:\n`);
    notFoundEvents.forEach((e: any) => {
      console.log(`[${e.level.toUpperCase()}] ${e.created_at}`);
      console.log(`Message: ${e.message}`);
      console.log('---\n');
    });
  } else {
    console.log('No 404/notFound events found');
  }
}

checkJohfrahErrors().catch(console.error);
