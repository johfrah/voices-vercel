#!/usr/bin/env tsx

/**
 * 🛡️ CHRIS-PROTOCOL: Check Recent System Errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentErrors() {
  console.log('🔍 Checking recent system errors (last 24h)...\n');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: errors } = await supabase
    .from('system_events')
    .select('*')
    .in('level', ['error', 'warn'])
    .gte('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (errors && errors.length > 0) {
    console.log(`Found ${errors.length} recent errors/warnings:\n`);
    errors.forEach((e, i) => {
      console.log(`${i + 1}. [${e.level.toUpperCase()}] ${e.source}`);
      console.log(`   Message: ${e.message}`);
      console.log(`   Time: ${new Date(e.created_at).toLocaleString()}`);
      if (e.details) {
        console.log(`   Details: ${JSON.stringify(e.details, null, 2)}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ No recent errors or warnings found!');
  }
}

checkRecentErrors().catch(console.error);
