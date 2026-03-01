#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudioErrors() {
  console.log('🔍 Checking recent Studio page errors...\n');
  
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .or('message.ilike.%Server Components render%,message.ilike.%studio%')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Query error:', error);
    return;
  }
  
  console.log(`📊 Found ${data?.length || 0} relevant errors\n`);
  
  data?.forEach((event, i) => {
    console.log(`\n━━━ Error ${i + 1} ━━━`);
    console.log(`Time: ${event.created_at}`);
    console.log(`Level: ${event.level}`);
    console.log(`Source: ${event.source}`);
    console.log(`Message: ${event.message}`);
    if (event.details) {
      console.log(`Details:`, JSON.stringify(event.details, null, 2));
    }
  });
}

checkStudioErrors();
