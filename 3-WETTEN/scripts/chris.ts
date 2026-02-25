import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Laad env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHealth() {
  console.log('\n🛡️  [CHRIS-OS] SYSTEEM CHECK START...');
  console.log('------------------------------------');

  // 1. Database Check
  try {
    const { data, error } = await supabase.from('actors').select('id').limit(1);
    if (error) throw error;
    console.log('✅ DATABASE: SDK Tunnel is Masterclass (Live Data)');
  } catch (e: any) {
    console.log('🔴 DATABASE: CRITICAL FAILURE - ' + e.message);
  }

  // 2. Linter Check
  try {
    console.log('⏳ LINTER: Scannen op slop...');
    execSync('npm run lint', { cwd: '1-SITE/apps/web', stdio: 'ignore' });
    console.log('✅ LINTER: Geen slop gevonden. Code is zuiver.');
  } catch (e) {
    console.log('⚠️  LINTER: Warnings of errors gevonden. Chris grijpt in.');
  }

  // 3. Env Check
  const envPath = '1-SITE/apps/web/.env.local';
  if (fs.existsSync(envPath)) {
    console.log('✅ ENV: .env.local is aanwezig.');
  } else {
    console.log('🔴 ENV: .env.local ONTBREERT!');
  }

  console.log('------------------------------------');
  console.log('🚀 [CHRIS-OS] STATUS: ALTIJD AAN\n');
}

const mode = process.argv[2] || 'status';

if (mode === 'status') {
  checkHealth();
} else if (mode === 'watch') {
  console.log('👀 [CHRIS-OS] Watchdog actief. Ik hou de wacht...');
  setInterval(checkHealth, 30000); // Elke 30 seconden
  checkHealth();
} else {
  console.log('Gebruik: npx ts-node 3-WETTEN/scripts/chris.ts [status|watch]');
}
