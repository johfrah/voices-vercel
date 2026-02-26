#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRealUserErrors() {
  console.log('🔍 Checking for real user errors on voices.be...\n');

  const { data } = await supabase
    .from('system_events')
    .select('*')
    .eq('level', 'error')
    .order('created_at', { ascending: false })
    .limit(100);

  const realUserErrors = data?.filter(e => 
    e.details?.url?.includes('voices.be') && 
    !e.details?.userAgent?.includes('vercel-screenshot')
  ) || [];

  console.log('📊 Total real user errors found:', realUserErrors.length);

  if (realUserErrors.length > 0) {
    console.log('\n🔥 Error breakdown:');
    const errorTypes: Record<string, number> = {};
    realUserErrors.forEach(e => {
      const msg = e.message || 'Unknown';
      errorTypes[msg] = (errorTypes[msg] || 0) + 1;
    });
    console.log(JSON.stringify(errorTypes, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 MOST RECENT REAL USER ERROR:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    const latest = realUserErrors[0];
    console.log(`🕐 ${latest.created_at}`);
    console.log(`📍 Source: ${latest.source}`);
    console.log(`📝 Message: ${latest.message}`);
    console.log(`🔗 URL: ${latest.details?.url || 'N/A'}`);
    console.log(`🌐 User Agent: ${latest.details?.userAgent || 'N/A'}`);
    
    if (latest.details?.stack) {
      console.log(`\n📚 Stack trace (first 500 chars):`);
      console.log(latest.details.stack.substring(0, 500));
    }
  } else {
    console.log('\n✅ No real user errors found on voices.be');
  }
}

checkRealUserErrors().catch(console.error);
