#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLiveErrors() {
  console.log('🔍 Checking live system_events for errors...\n');

  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .eq('level', 'error')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error fetching system_events:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No errors found in system_events');
    return;
  }

  console.log(`⚠️  Found ${data.length} recent errors:\n`);
  
  for (const event of data) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🕐 ${event.created_at}`);
    console.log(`📍 Source: ${event.source || 'Unknown'}`);
    console.log(`📝 Message: ${event.message}`);
    
    if (event.details) {
      console.log(`📦 Details:`, JSON.stringify(event.details, null, 2));
    }
    
    console.log('');
  }
}

checkLiveErrors().catch(console.error);
