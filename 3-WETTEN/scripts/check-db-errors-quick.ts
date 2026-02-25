import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErrors() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: events, error } = await supabase
      .from('system_events')
      .select('*')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    console.log(`\n🔍 Recent System Events (last hour):\n`);
    
    if (!events || events.length === 0) {
      console.log('✅ No errors in the last hour');
      return;
    }

    events.forEach((event: any, idx: number) => {
      console.log(`\n${idx + 1}. [${event.severity}] ${event.event_type}`);
      console.log(`   Time: ${event.created_at}`);
      console.log(`   Path: ${event.path || 'N/A'}`);
      console.log(`   Message: ${event.message}`);
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details, null, 2)}`);
      }
    });

    const errorCount = events.filter((e: any) => e.severity === 'error').length;
    console.log(`\n📊 Summary: ${errorCount} errors, ${events.length - errorCount} warnings/info`);
    
  } catch (error) {
    console.error('❌ Failed to fetch events:', error);
    process.exit(1);
  }
}

checkErrors();
