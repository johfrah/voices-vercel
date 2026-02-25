import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

/**
 * 🛡️ CHRIS-PROTOCOL: LIVE WATCHDOG STREAMER (v2.14.513)
 * 
 * Doel: Streamt de system_events tabel real-time naar je terminal.
 * Geen gissingen meer, 100% transparantie.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Error: Supabase credentials missing in environment.'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(chalk.cyan.bold('\n🚀 NUCLEAR WATCHDOG: Live Stream gestart...'));
console.log(chalk.dim(`Verbonden met: ${SUPABASE_URL}\n`));

// 1. Fetch de laatste 5 events als context
async function showRecent() {
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error(chalk.red(`❌ Initial fetch failed: ${error.message}`));
    return;
  }

  console.log(chalk.yellow('📜 Laatste 5 events:'));
  data?.reverse().forEach(logEvent);
  console.log(chalk.dim('--------------------------------------------------\n'));
}

function logEvent(event: any) {
  const time = new Date(event.created_at).toLocaleTimeString();
  const level = event.level?.toUpperCase() || 'INFO';
  
  let color = chalk.white;
  if (level === 'CRITICAL') color = chalk.red.bold;
  else if (level === 'ERROR') color = chalk.red;
  else if (level === 'WARN') color = chalk.yellow;
  else if (level === 'INFO') color = chalk.blue;

  console.log(`${chalk.dim(`[${time}]`)} ${color(level)} ${chalk.bold(event.source)}: ${event.message}`);
  
  if (event.details) {
    // 🛡️ CHRIS-PROTOCOL: Forensic Details
    if (typeof event.details === 'object') {
      const details = event.details;
      if (details.payload) {
        console.log(chalk.dim('   Payload:'), JSON.stringify(details.payload, null, 2).split('\n').map(l => '   ' + l).join('\n'));
      }
      if (details.errorDetails || details.stack) {
        console.log(chalk.red('   Stack:'), (details.stack || JSON.stringify(details.errorDetails)).substring(0, 500) + '...');
      }
    }
  }
}

// 2. Real-time subscription
const channel = supabase
  .channel('system_events_realtime')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'system_events' },
    (payload) => {
      logEvent(payload.new);
    }
  )
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(chalk.green('✅ Real-time verbinding actief. Ik wacht op data...\n'));
    }
  });

showRecent();

// Keep process alive
process.stdin.resume();
