import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local from the web app directory
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  console.log('🔍 Checking Johfrah route logs from the last 30 minutes (via SDK)...\n');

  try {
    const { data: logs, error } = await supabase
      .from('system_events')
      .select('*')
      .gte('created_at', cutoff)
      .ilike('message', '%johfrah%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      console.log('✅ No Johfrah-related logs found in the last 30 minutes.');
    } else {
      console.log(`📊 Found ${logs.length} Johfrah-related log entries:\n`);
      logs.forEach((log, idx) => {
        console.log(`[${idx + 1}] ${log.created_at}`);
        console.log(`    Level: ${log.level}`);
        console.log(`    Source: ${log.source}`);
        console.log(`    Message: ${log.message}`);
        if (log.details) {
          console.log(`    Details: ${JSON.stringify(log.details, null, 2)}`);
        }
        console.log('');
      });
    }

    console.log('\n🚨 Checking for recent errors (any source)...\n');
    const { data: errors, error: errError } = await supabase
      .from('system_events')
      .select('*')
      .gte('created_at', cutoff)
      .eq('level', 'error')
      .order('created_at', { ascending: false })
      .limit(10);

    if (errError) throw errError;

    if (!errors || errors.length === 0) {
      console.log('✅ No errors found in the last 30 minutes.');
    } else {
      console.log(`⚠️ Found ${errors.length} error entries:\n`);
      errors.forEach((error, idx) => {
        console.log(`[${idx + 1}] ${error.created_at}`);
        console.log(`    Source: ${error.source}`);
        console.log(`    Message: ${error.message}`);
        if (error.details) {
          console.log(`    Details: ${JSON.stringify(error.details, null, 2)}`);
        }
        console.log('');
      });
    }
  } catch (error: any) {
    console.error('❌ Error querying logs:', error.message);
  }
}

checkLogs();
