import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';

// Laad .env vanuit de web app folder
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error(chalk.red('❌ Error: SUPABASE_SERVICE_ROLE_KEY niet gevonden in .env.local'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log(chalk.bold.blue('\n🛰️  VOICES WATCHDOG: LIVE MONITORING STARTING...\n'));
console.log(chalk.gray('Druk op Ctrl+C om te stoppen\n'));

let lastSeenId = 0;

async function pollLogs() {
  try {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .gt('id', lastSeenId)
      .order('id', { ascending: true });

    if (error) {
      console.error(chalk.red('Log fetch error:'), error.message);
      return;
    }

    if (data && data.length > 0) {
      for (const log of data) {
        const time = new Date(log.created_at).toLocaleTimeString();
        const levelColor = log.level === 'critical' ? chalk.bgRed.white.bold : 
                          (log.level === 'error' ? chalk.red.bold : chalk.yellow);
        
        const sourceColor = log.source === 'browser' ? chalk.cyan : chalk.magenta;

        console.log(`${chalk.gray(`[${time}]`)} ${levelColor(log.level.toUpperCase())} ${sourceColor(`(${log.source})`)}: ${chalk.white(log.message)}`);
        
        if (log.details) {
          if (log.details.url) console.log(chalk.gray(`   URL: ${log.details.url}`));
          if (log.details.stack) {
             // Toon alleen de eerste paar regels van de stack trace voor leesbaarheid
             const stackLines = log.details.stack.split('\n').slice(0, 3).join('\n      ');
             console.log(chalk.red(`   Stack: ${stackLines}...`));
          }
          if (log.details.full_console_output && log.details.full_console_output !== '{}') {
             console.log(chalk.gray(`   Details: ${JSON.stringify(log.details.full_console_output)}`));
          }
        }
        console.log(''); // Newline voor leesbaarheid
        
        lastSeenId = Math.max(lastSeenId, log.id);
      }
    }
  } catch (err: any) {
    console.error(chalk.red('Polling crash:'), err.message);
  }
}

// Initialiseer lastSeenId met de laatste 5 logs om context te geven bij start
async function init() {
  const { data } = await supabase
    .from('system_events')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);
  
  if (data && data.length > 0) {
    lastSeenId = data[0].id;
  }
  
  // Start polling elke 2 seconden
  setInterval(pollLogs, 2000);
}

init();
