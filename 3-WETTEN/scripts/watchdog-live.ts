import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';

/**
 * 🛡️ CHRIS-PROTOCOL: NUCLEAR WATCHDOG LIVE (v2.14.516)
 * 
 * Doel: Streamt de system_events tabel real-time naar je terminal.
 * Geen gissingen meer, 100% transparantie voor Johfrah.
 */

// Laad .env vanuit de web app folder
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error(chalk.red('❌ Error: SUPABASE_SERVICE_ROLE_KEY niet gevonden in .env.local'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(chalk.cyan.bold('\n🚀 NUCLEAR WATCHDOG: Live Stream gestart...'));
console.log(chalk.dim(`Verbonden met: ${SUPABASE_URL}\n`));

function logEvent(event: any) {
  const time = new Date(event.created_at || event.createdAt).toLocaleTimeString();
  const level = event.level?.toUpperCase() || 'INFO';
  
  let color = chalk.white;
  if (level === 'CRITICAL') color = chalk.bgRed.white.bold;
  else if (level === 'ERROR') color = chalk.red;
  else if (level === 'WARN') color = chalk.yellow;
  else if (level === 'INFO') color = chalk.blue;

  const source = event.source || 'unknown';
  const sourceColor = source === 'browser' ? chalk.cyan : chalk.magenta;

  console.log(`${chalk.dim(`[${time}]`)} ${color(level)} ${sourceColor(`(${source})`)}: ${chalk.white(event.message)}`);
  
  if (event.details) {
    const details = event.details;
    if (details.payload) {
      console.log(chalk.dim('   Payload:'), JSON.stringify(details.payload, null, 2).split('\n').map(l => '   ' + l).join('\n'));
    }
    if (details.responseBody) {
      try {
        const parsed = typeof details.responseBody === 'string' ? JSON.parse(details.responseBody) : details.responseBody;
        console.log(chalk.red('   Server Response:'), JSON.stringify(parsed, null, 2).split('\n').map(l => '   ' + l).join('\n'));
      } catch (e) {
        console.log(chalk.red('   Server Response:'), details.responseBody);
      }
    }
    if (details.stack || details.errorDetails) {
      const stack = details.stack || JSON.stringify(details.errorDetails);
      console.log(chalk.red('   Stack:'), stack.substring(0, 500) + '...');
    }
    if (details.url) {
      console.log(chalk.dim(`   URL: ${details.url}`));
    }
  }
  console.log(''); // Newline voor leesbaarheid
}

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

// 2. Real-time subscription (Atomic Pulse)
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
      
      // Heartbeat om de 30 seconden om te laten zien dat we nog live zijn
      setInterval(() => {
        const now = new Date().toLocaleTimeString();
        process.stdout.write(chalk.dim(`[${now}] 💓 Heartbeat: Watchdog is live...\r`));
      }, 30000);
    }
  });

showRecent();

// Keep process alive and handle exit
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Watchdog gestopt.'));
  process.exit(0);
});

process.stdin.resume();
