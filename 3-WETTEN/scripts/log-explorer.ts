import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';

/**
 * 🛡️ CHRIS-PROTOCOL: NUCLEAR LOG EXPLORER (v2.15.1)
 * 
 * Doel: Een krachtigere 'log' alias die zowel de audit als de live logs combineert.
 * Gebruik: log [live|audit|errors|digest <hash>]
 */

const ROOT_DIR = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless';
dotenv.config({ path: path.join(ROOT_DIR, '1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const args = process.argv.slice(2);
const command = args[0] || 'all';

async function run() {
  if (command === 'audit') {
    console.log(chalk.bold.blue('\n🔍 Running Forensic Audit...'));
    const { execSync } = require('child_process');
    try {
      execSync('npx tsx 3-WETTEN/scripts/forensic-audit.ts', { stdio: 'inherit', cwd: ROOT_DIR });
    } catch (e) {
      // Audit script exits with 1 on errors, which is fine
    }
    return;
  }

  if (!SUPABASE_KEY) {
    console.error(chalk.red('❌ Error: SUPABASE_SERVICE_ROLE_KEY niet gevonden in .env.local'));
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  if (command === 'digest') {
    const digest = args[1];
    if (!digest) {
      console.error(chalk.red('❌ Error: Geef een digest hash op (bijv: log digest 2922190423)'));
      return;
    }
    console.log(chalk.bold.cyan(`\n🔎 Zoeken naar Digest: ${digest}...`));
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .or(`message.ilike.%${digest}%,details->>stack.ilike.%${digest}%,details->>errorDetails.ilike.%${digest}%`)
      .order('created_at', { ascending: false });

    if (error) console.error(chalk.red(error.message));
    else if (data.length === 0) console.log(chalk.yellow('Geen events gevonden met deze digest.'));
    else data.forEach(logEvent);
    return;
  }

  if (command === 'errors') {
    console.log(chalk.bold.red('\n🚨 Laatste 20 Errors & Criticals:'));
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .in('level', ['error', 'critical'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) console.error(chalk.red(error.message));
    else data?.reverse().forEach(logEvent);
    return;
  }

  // Default: Combined View
  console.log(chalk.cyan.bold('\n🚀 NUCLEAR LOG EXPLORER: Full System Scan...'));
  
  // 1. Run Audit
  console.log(chalk.bold.blue('\n--- 🛡️ AUDIT STATUS ---'));
  const { execSync } = require('child_process');
  try {
    execSync('npx tsx 3-WETTEN/scripts/forensic-audit.ts', { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (e) {
    console.log(chalk.dim('\n(Audit heeft fouten gevonden, zie hierboven)\n'));
  }

  // 2. Show Recent Errors
  console.log(chalk.bold.red('\n--- 🚨 RECENT DATABASE ERRORS (Last 10) ---'));
  const { data: errorData } = await supabase
    .from('system_events')
    .select('*')
    .in('level', ['error', 'critical'])
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (errorData && errorData.length > 0) {
    errorData.reverse().forEach(logEvent);
  } else {
    console.log(chalk.green('✅ Geen kritieke database errors gevonden.\n'));
  }

  // 3. Start Live Watchdog
  console.log(chalk.bold.yellow('\n--- 🛰️ LIVE WATCHDOG STREAM ---'));
  console.log(chalk.dim('Wachten op nieuwe events... (Ctrl+C om te stoppen)\n'));

  const setupRealtime = () => {
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
          console.log(chalk.green('📡 Verbonden met realtime stream.'));
        }
        if (status === 'CLOSED') {
          console.log(chalk.yellow('⚠️ Verbinding gesloten. Opnieuw verbinden...'));
          setTimeout(setupRealtime, 1000);
        }
        if (status === 'CHANNEL_ERROR') {
          console.log(chalk.red('❌ Stream error. Herstarten...'));
          setTimeout(setupRealtime, 5000);
        }
      });
      
    // Heartbeat log om te laten zien dat hij nog leeft
    const heartbeat = setInterval(() => {
      if (channel.state === 'joined') {
        // Stilzwijgend laten draaien
      } else {
        console.log(chalk.dim(`[${new Date().toLocaleTimeString()}] 💓 Status: ${channel.state}`));
      }
    }, 30000);

    return { channel, heartbeat };
  };

  setupRealtime();
  
  // Voorkom dat het script afsluit
  setInterval(() => {}, 1000);
}

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
    if (details.url) console.log(chalk.dim(`   URL: ${details.url}`));
    if (details.stack || details.errorDetails) {
      const stack = details.stack || JSON.stringify(details.errorDetails);
      console.log(chalk.red('   Stack:'), stack.substring(0, 500) + '...');
    }
  }
  console.log('');
}

run().catch(console.error);
