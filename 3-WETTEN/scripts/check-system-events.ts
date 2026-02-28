import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSystemEvents() {
  console.log('🔍 Checking system_events for Orders API errors...\n');

  try {
    // Get recent errors related to orders
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .ilike('message', '%orders%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Query failed:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('✅ No recent errors found related to orders.');
      
      // Check for ANY recent errors
      const { data: recentErrors } = await supabase
        .from('system_events')
        .select('*')
        .eq('level', 'error')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentErrors && recentErrors.length > 0) {
        console.log('\n📋 Recent errors (any type):');
        recentErrors.forEach((event, idx) => {
          console.log(`\n[${idx + 1}] ${event.created_at}`);
          console.log(`Level: ${event.level}`);
          console.log(`Message: ${event.message}`);
          if (event.details) {
            console.log(`Details:`, JSON.stringify(event.details, null, 2).substring(0, 300));
          }
        });
      }
      
      return;
    }

    console.log(`🔥 Found ${data.length} order-related errors:\n`);
    
    data.forEach((event, idx) => {
      console.log(`\n[${idx + 1}] ${event.created_at}`);
      console.log(`Level: ${event.level}`);
      console.log(`Message: ${event.message}`);
      if (event.details) {
        console.log(`Details:`, JSON.stringify(event.details, null, 2));
      }
      console.log('---');
    });

  } catch (error: any) {
    console.error('❌ Check failed:', error.message);
  }

  process.exit(0);
}

checkSystemEvents();
