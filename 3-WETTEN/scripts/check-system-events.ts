#!/usr/bin/env tsx
/**
 * Check system_events for recent errors
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSystemEvents() {
  console.log('🔍 Checking system_events for recent errors...\n');

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('system_events')
    .select('created_at, severity, category, message, details')
    .in('severity', ['error', 'critical'])
    .gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error fetching system_events:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No errors found in the last 2 hours');
    return;
  }

  console.log(`🚨 Found ${data.length} error(s):\n`);

  data.forEach((event, idx) => {
    console.log(`${idx + 1}. [${event.severity.toUpperCase()}] ${event.category}`);
    console.log(`   Time: ${event.created_at}`);
    console.log(`   Message: ${event.message}`);
    if (event.details) {
      console.log(`   Details: ${JSON.stringify(event.details, null, 2)}`);
    }
    console.log('');
  });
}

checkSystemEvents().catch(console.error);
